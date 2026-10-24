import * as THREE from "three";
import type { V3 } from "./layout";

export const clamp = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x));
export const smoothstep = (a: number, b: number, x: number) => {
  const t = clamp((x - a) / (b - a));
  return t * t * (3 - 2 * t);
};
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const fract = (x: number) => x - Math.floor(x);

export type FrameCtx = { time: number; camera: THREE.PerspectiveCamera; tier: "high" | "low" };

/* ---------- glass: bright at grazing angles, clear face-on ---------- */

export function fresnelMaterial(color: string, opts: { power?: number; base?: number; strength?: number; opacity?: number } = {}) {
  return new THREE.ShaderMaterial({
    uniforms: {
      uColor: { value: new THREE.Color(color) },
      uOpacity: { value: opts.opacity ?? 1 },
      uPower: { value: opts.power ?? 2.4 },
      uBase: { value: opts.base ?? 0.05 },
      uStrength: { value: opts.strength ?? 1.3 },
    },
    vertexShader: /* glsl */ `
      varying vec3 vN;
      varying vec3 vV;
      void main(){
        vec4 local = vec4(position, 1.0);
        vec3 n = normal;
        #ifdef USE_INSTANCING
          local = instanceMatrix * local;
          n = mat3(instanceMatrix) * n;
        #endif
        vec4 mv = modelViewMatrix * local;
        vN = normalize(normalMatrix * n);
        vV = normalize(-mv.xyz);
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor;
      uniform float uOpacity, uPower, uBase, uStrength;
      varying vec3 vN;
      varying vec3 vV;
      void main(){
        float f = pow(1.0 - abs(dot(normalize(vN), normalize(vV))), uPower);
        float a = (uBase + f * uStrength) * uOpacity;
        gl_FragColor = vec4(uColor * (0.55 + f * 0.9), a);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }`,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
  });
}

/* ---------- beams of light: soft ribbons that always face the camera ---------- */

export type BeamDef = { a: V3; b: V3; color: string; width: number; intensity?: number };

export class BeamSet {
  readonly mesh: THREE.Mesh;
  readonly material: THREE.ShaderMaterial;
  private readonly geometry: THREE.BufferGeometry;
  private readonly defs: BeamDef[];
  private readonly tmp = { a: new THREE.Vector3(), b: new THREE.Vector3(), d: new THREE.Vector3(), v: new THREE.Vector3(), s: new THREE.Vector3(), m: new THREE.Vector3() };

  constructor(defs: BeamDef[]) {
    this.defs = defs;
    const n = defs.length;
    const g = new THREE.BufferGeometry();
    const uv = new Float32Array(n * 8);
    const color = new Float32Array(n * 12);
    const length = new Float32Array(n * 4);
    const index: number[] = [];
    defs.forEach((def, k) => {
      uv.set([0, 0, 1, 0, 0, 1, 1, 1], k * 8);
      const c = new THREE.Color(def.color).multiplyScalar(def.intensity ?? 1);
      for (let v = 0; v < 4; v++) {
        color.set([c.r, c.g, c.b], k * 12 + v * 3);
        length[k * 4 + v] = Math.hypot(def.b[0] - def.a[0], def.b[1] - def.a[1], def.b[2] - def.a[2]);
      }
      const o = k * 4;
      index.push(o, o + 1, o + 2, o + 2, o + 1, o + 3);
    });
    g.setAttribute("position", new THREE.BufferAttribute(new Float32Array(n * 12), 3));
    g.setAttribute("uv", new THREE.BufferAttribute(uv, 2));
    g.setAttribute("aColor", new THREE.BufferAttribute(color, 3));
    g.setAttribute("aLen", new THREE.BufferAttribute(length, 1));
    g.setIndex(index);
    this.geometry = g;
    this.material = new THREE.ShaderMaterial({
      uniforms: { uTime: { value: 0 }, uOpacity: { value: 1 }, uReveal: { value: 1.1 } },
      vertexShader: /* glsl */ `
        attribute vec3 aColor;
        attribute float aLen;
        varying vec2 vUv;
        varying vec3 vColor;
        varying float vLen;
        void main(){
          vUv = uv; vColor = aColor; vLen = aLen;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }`,
      fragmentShader: /* glsl */ `
        uniform float uTime, uOpacity, uReveal;
        varying vec2 vUv;
        varying vec3 vColor;
        varying float vLen;
        void main(){
          float across = 1.0 - abs(vUv.y * 2.0 - 1.0);
          float soft = pow(across, 2.0);
          float core = pow(across, 9.0);
          float ends = smoothstep(0.0, 0.05, vUv.x) * (1.0 - smoothstep(0.82, 1.0, vUv.x));
          float flow = 0.78 + 0.22 * sin((vUv.x * vLen - uTime * 2.2) * 5.0);
          float reveal = 1.0 - smoothstep(uReveal - 0.06, uReveal, vUv.x);
          float a = (soft * 0.45 + core * 1.1) * ends * flow * reveal * uOpacity;
          gl_FragColor = vec4(vColor * (1.0 + core * 0.8), a);
          #include <tonemapping_fragment>
          #include <colorspace_fragment>
        }`,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
    });
    this.mesh = new THREE.Mesh(g, this.material);
    this.mesh.frustumCulled = false;
  }

  /** Turn every ribbon towards the camera. The mesh must sit untransformed in world space. */
  update(camera: THREE.Camera, time: number, opacity: number, reveal = 1.1) {
    const { a, b, d, v, s, m } = this.tmp;
    const pos = this.geometry.getAttribute("position") as THREE.BufferAttribute;
    const arr = pos.array as Float32Array;
    this.defs.forEach((def, k) => {
      a.set(...def.a);
      b.set(...def.b);
      d.subVectors(b, a);
      m.addVectors(a, b).multiplyScalar(0.5);
      v.subVectors(camera.position, m);
      s.crossVectors(d, v).normalize().multiplyScalar(def.width / 2);
      const o = k * 12;
      arr.set([a.x - s.x, a.y - s.y, a.z - s.z, b.x - s.x, b.y - s.y, b.z - s.z, a.x + s.x, a.y + s.y, a.z + s.z, b.x + s.x, b.y + s.y, b.z + s.z], o);
    });
    pos.needsUpdate = true;
    this.material.uniforms.uTime.value = time;
    this.material.uniforms.uOpacity.value = opacity;
    this.material.uniforms.uReveal.value = reveal;
  }
}

/* ---------- soft round glow, shared by every sprite ---------- */

let glow: THREE.Texture | null = null;
export function glowTexture(): THREE.Texture {
  if (glow) return glow;
  const size = 128;
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  g.addColorStop(0, "rgba(255,255,255,1)");
  g.addColorStop(0.18, "rgba(255,255,255,0.75)");
  g.addColorStop(0.45, "rgba(255,255,255,0.18)");
  g.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  glow = new THREE.CanvasTexture(canvas);
  glow.colorSpace = THREE.SRGBColorSpace;
  return glow;
}

export function glowSprite(color: string, scale: number, opacity = 1) {
  const s = new THREE.Sprite(
    new THREE.SpriteMaterial({ map: glowTexture(), color, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity }),
  );
  s.scale.setScalar(scale);
  return s;
}

/* ---------- labels: crisp text that keeps the same size on screen ---------- */

export type LabelOptions = { font: string; color?: string; px?: number; weight?: number; anchor?: "left" | "center" | "right" };

export function makeLabel(text: string, opts: LabelOptions): THREE.Sprite {
  const fontPx = 64;
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d")!;
  const font = `${opts.weight ?? 500} ${fontPx}px ${opts.font}`;
  ctx.font = font;
  const pad = 18;
  const w = Math.ceil(ctx.measureText(text).width) + pad * 2;
  const h = Math.ceil(fontPx * 1.35) + pad;
  canvas.width = w;
  canvas.height = h;
  ctx.font = font;
  ctx.textBaseline = "middle";
  ctx.shadowColor = opts.color ?? "#ffffff";
  ctx.shadowBlur = 14;
  ctx.fillStyle = opts.color ?? "#ffffff";
  ctx.fillText(text, pad, h / 2 + 2);
  ctx.shadowBlur = 0;
  ctx.fillText(text, pad, h / 2 + 2);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false, depthTest: false, sizeAttenuation: false }));
  sprite.center.set(opts.anchor === "left" ? 0 : opts.anchor === "right" ? 1 : 0.5, 0.5);
  sprite.renderOrder = 10;
  sprite.userData.label = { px: opts.px ?? 15, aspect: w / h, ratio: h / fontPx };
  return sprite;
}

/** Keep every label at its pixel height; call after resizing. */
export function scaleLabels(root: THREE.Object3D, camera: THREE.PerspectiveCamera, viewportHeight: number, factor: number) {
  const p11 = camera.projectionMatrix.elements[5];
  root.traverse((o) => {
    const info = o.userData.label as { px: number; aspect: number; ratio: number } | undefined;
    if (!info) return;
    const s = (2 * info.px * info.ratio * factor) / (p11 * viewportHeight);
    o.scale.set(s * info.aspect, s, 1);
  });
}

/* ---------- a biconvex lens, axis along X ---------- */

export function lensGeometry(aperture: number, thickness: number, segments = 64) {
  const pts: THREE.Vector2[] = [];
  const steps = 28;
  for (let i = 0; i <= steps; i++) {
    const rho = (i / steps) * aperture;
    pts.push(new THREE.Vector2(rho, -(thickness / 2) * (1 - (rho / aperture) ** 2)));
  }
  for (let i = steps - 1; i >= 0; i--) {
    const rho = (i / steps) * aperture;
    pts.push(new THREE.Vector2(rho, (thickness / 2) * (1 - (rho / aperture) ** 2)));
  }
  const g = new THREE.LatheGeometry(pts, segments);
  g.rotateZ(-Math.PI / 2);
  return g;
}

/** Dispose everything under an object. */
export function disposeTree(root: THREE.Object3D) {
  root.traverse((o) => {
    const mesh = o as THREE.Mesh;
    mesh.geometry?.dispose?.();
    const mats = Array.isArray(mesh.material) ? mesh.material : mesh.material ? [mesh.material] : [];
    for (const m of mats) {
      const map = (m as THREE.SpriteMaterial).map;
      if (map && map !== glow) map.dispose();
      m.dispose();
    }
  });
}
