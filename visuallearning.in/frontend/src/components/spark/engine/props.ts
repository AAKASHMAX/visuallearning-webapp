/**
 * Solid things in each scene - glass, metal, atoms, beams, labels - built on
 * the same layout as the particle shapes. Each prop fades in around its own
 * beat: `vis` is 0..1, `local` is how far the scroll is from the beat (-1..1).
 */
import * as THREE from "three";
import {
  BULB, CELL, COIL, DNA, ELEMENTS, EYE, FAMILY_COLOR, FLAME, LEAF, LENS, PHOTO, PLATE_TOP, PRISM, TABLE, WATER,
  coilPoint, dnaWaveY, electronDir, elementFamily, elementPos, eyeImageTop, filamentPoint, leafPoint, nervePoint, prismRayEnd, retinaBase,
  type V2, type V3,
} from "./layout";
import { bulbRadius, dnaBaseColor, dnaRung } from "./shapes";
import {
  BeamSet, type FrameCtx, disposeTree, fract, fresnelMaterial, glowSprite, lensGeometry, makeLabel, smoothstep,
} from "./props-common";

export type Fonts = { display: string; mono: string; body: string };

export abstract class Prop {
  readonly group = new THREE.Group();
  abstract update(vis: number, local: number, ctx: FrameCtx): void;
  dispose() {
    disposeTree(this.group);
  }
}

/** Fades a set of materials together. */
class Fader {
  private items: ((v: number) => void)[] = [];
  mat<M extends THREE.Material>(m: M, base = 1): M {
    m.transparent = true;
    this.items.push((v) => {
      m.opacity = base * v;
    });
    return m;
  }
  uni(m: THREE.ShaderMaterial, base = 1): THREE.ShaderMaterial {
    this.items.push((v) => {
      m.uniforms.uOpacity.value = base * v;
    });
    return m;
  }
  apply(v: number) {
    for (const set of this.items) set(v);
  }
}

const v3 = (p: V2, z = 0): V3 => [p[0], p[1], z];
const add = (a: V3, b: V3): V3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const scale = (a: V3, s: number): V3 => [a[0] * s, a[1] * s, a[2] * s];
const dummy = new THREE.Object3D();

function mulberry(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* ------------------------------------------------------------- intro glow */

class HaloProp extends Prop {
  private f = new Fader();
  constructor(color: string, size: number, opacity: number, position: V3 = [0, 0, 0]) {
    super();
    const s = glowSprite(color, size);
    s.position.set(...position);
    this.f.mat(s.material, opacity);
    this.group.add(s);
  }
  update(vis: number, _local: number, ctx: FrameCtx) {
    this.f.apply(vis * (0.88 + 0.12 * Math.sin(ctx.time * 1.4)));
  }
}

/* ---------------------------------------------------------------- physics */

class PrismProp extends Prop {
  private f = new Fader();
  private light: BeamSet;
  private spectrum: BeamSet;
  constructor() {
    super();
    const R = (PRISM.apex[1] - PRISM.left[1]) * (2 / 3);
    const geo = new THREE.CylinderGeometry(R, R, PRISM.depth, 3, 1);
    geo.rotateX(-Math.PI / 2);
    geo.translate(0, PRISM.apex[1] - R, 0);
    const body = new THREE.Mesh(geo, this.f.uni(fresnelMaterial("#9ff3ff", { base: 0.012, strength: 0.5, power: 1.8 }), 0.9));
    const edges = new THREE.LineSegments(
      new THREE.EdgesGeometry(geo),
      this.f.mat(new THREE.LineBasicMaterial({ color: "#dffcff", blending: THREE.AdditiveBlending, depthWrite: false }), 0.95),
    );
    this.light = new BeamSet([
      { a: v3(PRISM.source), b: v3(PRISM.entry), color: "#ffffff", width: 0.12, intensity: 0.85 },
      { a: v3(PRISM.entry), b: v3(PRISM.exit), color: "#eafcff", width: 0.1, intensity: 0.7 },
    ]);
    this.spectrum = new BeamSet(
      PRISM.rays.map((r) => ({ a: v3(PRISM.exit), b: v3(prismRayEnd(r.angle)), color: r.color, width: 0.11, intensity: 0.95 })),
    );
    this.group.add(body, edges, this.light.mesh, this.spectrum.mesh);
  }
  update(vis: number, local: number, ctx: FrameCtx) {
    this.f.apply(vis);
    this.light.update(ctx.camera, ctx.time, vis, smoothstep(-0.72, -0.32, local) * 1.1);
    this.spectrum.update(ctx.camera, ctx.time, vis, smoothstep(-0.42, -0.04, local) * 1.1);
  }
}

class LensProp extends Prop {
  private f = new Fader();
  private incoming: BeamSet;
  private outgoing: BeamSet;
  private axis: BeamSet;
  private focus: THREE.Sprite;
  constructor(fonts: Fonts) {
    super();
    const lens = new THREE.Mesh(lensGeometry(LENS.aperture, LENS.thickness), this.f.uni(fresnelMaterial("#a8f4ff", { base: 0.02, strength: 0.6 }), 1));
    const rimGeo = new THREE.TorusGeometry(LENS.aperture, 0.013, 8, 120);
    rimGeo.rotateY(Math.PI / 2);
    const rim = new THREE.Mesh(rimGeo, this.f.mat(new THREE.MeshBasicMaterial({ color: "#c9f8ff", blending: THREE.AdditiveBlending, depthWrite: false }), 0.8));
    this.incoming = new BeamSet(LENS.heights.map((h) => ({ a: [LENS.startX, h, 0] as V3, b: [0, h, 0] as V3, color: "#c9f6ff", width: 0.05, intensity: 0.6 })));
    this.outgoing = new BeamSet(
      LENS.heights.map((h) => ({ a: [0, h, 0] as V3, b: [LENS.endX, h - (h / LENS.focal) * LENS.endX, 0] as V3, color: "#d9fbff", width: 0.05, intensity: 0.7 })),
    );
    this.axis = new BeamSet([{ a: [LENS.startX - 0.5, 0, 0], b: [LENS.endX + 0.6, 0, 0], color: "#5ce1ff", width: 0.025, intensity: 0.45 }]);
    this.focus = glowSprite("#e8fdff", 0.9);
    this.focus.position.set(LENS.focal, 0, 0);
    this.f.mat(this.focus.material, 1);
    this.group.add(lens, rim, this.incoming.mesh, this.outgoing.mesh, this.axis.mesh, this.focus);
    for (const [x, text] of [[LENS.focal, "F"], [2 * LENS.focal, "2F"], [-LENS.focal, "F"], [-2 * LENS.focal, "2F"]] as [number, string][]) {
      const label = makeLabel(text, { font: fonts.mono, color: "#bff4ff", px: 14 });
      label.position.set(x, -0.36, 0);
      this.f.mat(label.material, 0.95);
      this.group.add(label);
    }
  }
  update(vis: number, local: number, ctx: FrameCtx) {
    this.f.apply(vis);
    const out = smoothstep(-0.45, -0.05, local);
    this.incoming.update(ctx.camera, ctx.time, vis, smoothstep(-0.75, -0.38, local) * 1.1);
    this.outgoing.update(ctx.camera, ctx.time, vis, out * 1.1);
    this.axis.update(ctx.camera, ctx.time, vis);
    this.focus.scale.setScalar((0.55 + 0.4 * out) * (1 + 0.12 * Math.sin(ctx.time * 3)));
  }
}

class PhotoProp extends Prop {
  private f = new Fader();
  private electrons: THREE.InstancedMesh;
  private photons: THREE.Sprite[] = [];
  constructor(fonts: Fonts) {
    super();
    const plateMat = this.f.mat(new THREE.MeshStandardMaterial({ color: "#6f8296", metalness: 1, roughness: 0.38 }), 1);
    const plate = new THREE.Mesh(new THREE.BoxGeometry(PHOTO.plateW, PHOTO.plateH, PHOTO.plateD), plateMat);
    plate.position.y = PHOTO.plateY;
    const edge = new THREE.LineSegments(
      new THREE.EdgesGeometry(plate.geometry),
      this.f.mat(new THREE.LineBasicMaterial({ color: "#9fe9ff", blending: THREE.AdditiveBlending, depthWrite: false }), 0.4),
    );
    edge.position.y = PHOTO.plateY;
    this.electrons = new THREE.InstancedMesh(
      new THREE.SphereGeometry(0.055, 14, 10),
      this.f.mat(new THREE.MeshBasicMaterial({ color: "#b5faff", blending: THREE.AdditiveBlending, depthWrite: false }), 1),
      PHOTO.impacts.length * 3,
    );
    this.electrons.frustumCulled = false;
    this.group.add(plate, edge, this.electrons);
    for (let k = 0; k < PHOTO.impacts.length; k++) {
      const s = glowSprite("#b9a8ff", 0.42);
      this.photons.push(s);
      this.group.add(s);
    }
    const along = (s: number): V3 => {
      const [ix, iz] = PHOTO.impacts[0];
      return [ix - PHOTO.photonDir[0] * s, PLATE_TOP - PHOTO.photonDir[1] * s, iz - PHOTO.photonDir[2] * s];
    };
    const labels: [string, V3, string, "left" | "center" | "right"][] = [
      ["hν", add(along(3.2), [-0.45, 0.1, 0]), "#c9bcff", "right"],
      ["e⁻", add([PHOTO.impacts[2][0], PLATE_TOP, PHOTO.impacts[2][1]], add(scale(electronDir(2), 2.9), [0.3, 0, 0])), "#a5f8ff", "left"],
      ["metal surface", [PHOTO.plateW / 2 - 0.1, PHOTO.plateY - 0.42, PHOTO.plateD / 2], "#a9c1d9", "right"],
    ];
    for (const [text, pos, color, anchor] of labels) {
      const l = makeLabel(text, { font: fonts.mono, color, px: text.length > 3 ? 14 : 18, anchor });
      l.position.set(...pos);
      this.f.mat(l.material, 0.95);
      this.group.add(l);
    }
  }
  update(vis: number, _local: number, ctx: FrameCtx) {
    this.f.apply(vis);
    const t = ctx.time;
    PHOTO.impacts.forEach(([ix, iz], k) => {
      const ph = fract(t * 0.36 + k * 0.21);
      const s = (1 - ph) * 4.8;
      const sprite = this.photons[k];
      sprite.position.set(ix - PHOTO.photonDir[0] * s, PLATE_TOP - PHOTO.photonDir[1] * s, iz - PHOTO.photonDir[2] * s);
      sprite.material.opacity = vis * smoothstep(0, 0.15, ph) * (1 - smoothstep(0.9, 1, ph));
      const d = electronDir(k);
      for (let j = 0; j < 3; j++) {
        const e = fract(t * 0.3 + k * 0.17 + j * 0.33);
        const dist = 0.1 + e * 3.3;
        dummy.position.set(ix + d[0] * dist, PLATE_TOP + d[1] * dist, iz + d[2] * dist);
        dummy.scale.setScalar(smoothstep(0, 0.08, e) * (1 - smoothstep(0.75, 1, e)) * (1.1 - e * 0.4));
        dummy.updateMatrix();
        this.electrons.setMatrixAt(k * 3 + j, dummy.matrix);
      }
    });
    this.electrons.instanceMatrix.needsUpdate = true;
  }
}

class HelixCurve extends THREE.Curve<THREE.Vector3> {
  constructor() {
    super();
  }
  getPoint(t: number, target = new THREE.Vector3()) {
    const p = coilPoint(t);
    return target.set(p[0], p[1], p[2]);
  }
}

class CoilProp extends Prop {
  private f = new Fader();
  private electrons: THREE.InstancedMesh;
  private count: number;
  constructor(fonts: Fonts, tier: "high" | "low") {
    super();
    const wire = new THREE.Mesh(
      new THREE.TubeGeometry(new HelixCurve(), tier === "high" ? 1400 : 700, COIL.wire, 10, false),
      this.f.mat(new THREE.MeshStandardMaterial({ color: "#d07a3e", metalness: 1, roughness: 0.3, emissive: "#2b1206" }), 1),
    );
    this.count = tier === "high" ? 280 : 110;
    // Electrons glow through the copper: they are inside the wire.
    this.electrons = new THREE.InstancedMesh(
      new THREE.SphereGeometry(0.032, 8, 6),
      this.f.mat(new THREE.MeshBasicMaterial({ color: "#9af6ff", blending: THREE.AdditiveBlending, depthWrite: false, depthTest: false }), 1),
      this.count,
    );
    this.electrons.frustumCulled = false;
    this.group.add(wire, this.electrons);
    // Electrons drift towards decreasing u, so conventional current circulates
    // anticlockwise seen from +x: that end is the north pole.
    for (const [text, x, color] of [["N", COIL.length / 2 + 0.62, "#ff8a8a"], ["S", -COIL.length / 2 - 0.62, "#8ab8ff"]] as [string, number, string][]) {
      const l = makeLabel(text, { font: fonts.display, color, px: 20, weight: 700 });
      l.position.set(x, 0, 0);
      this.f.mat(l.material, 1);
      this.group.add(l);
    }
  }
  update(vis: number, _local: number, ctx: FrameCtx) {
    this.f.apply(vis);
    const t = ctx.time;
    for (let i = 0; i < this.count; i++) {
      const u = fract(i / this.count - t * 0.016);
      const p = coilPoint(u);
      dummy.position.set(p[0] + Math.sin(t * 7 + i) * 0.018, p[1] + Math.cos(t * 6.3 + i * 1.7) * 0.018, p[2] + Math.sin(t * 5.1 + i * 2.3) * 0.018);
      dummy.scale.setScalar(vis);
      dummy.updateMatrix();
      this.electrons.setMatrixAt(i, dummy.matrix);
    }
    this.electrons.instanceMatrix.needsUpdate = true;
  }
}

/* -------------------------------------------------------------- chemistry */

class AtomProp extends Prop {
  private f = new Fader();
  private nucleus = new THREE.Group();
  constructor(fonts: Fonts) {
    super();
    const total = 63; // copper-63: 29 protons, 34 neutrons
    const mesh = new THREE.InstancedMesh(
      new THREE.SphereGeometry(0.088, 20, 14),
      this.f.mat(new THREE.MeshStandardMaterial({ roughness: 0.3, metalness: 0.1 }), 1),
      total,
    );
    const rand = mulberry(7);
    const placed: THREE.Vector3[] = [];
    const proton = new THREE.Color("#ff7a45");
    const neutron = new THREE.Color("#ffe1bd");
    for (let i = 0; i < total; i++) {
      let p = new THREE.Vector3();
      for (let tries = 0; tries < 60; tries++) {
        p = new THREE.Vector3(rand() * 2 - 1, rand() * 2 - 1, rand() * 2 - 1).multiplyScalar(0.26);
        if (p.length() > 0.26) continue;
        if (placed.every((q) => q.distanceTo(p) > 0.115)) break;
      }
      placed.push(p);
      dummy.position.copy(p);
      dummy.scale.setScalar(1);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
      mesh.setColorAt(i, i % 2 === 0 && i / 2 < 29 ? proton : neutron);
    }
    this.nucleus.add(mesh);
    const halo = glowSprite("#ffb347", 1.3);
    this.f.mat(halo.material, 0.2);
    const label = makeLabel("Cu · 29 electrons", { font: fonts.mono, color: "#ffd9a0", px: 15, anchor: "left" });
    label.position.set(0.5, 0.42, 0);
    this.f.mat(label.material, 0.95);
    this.group.add(halo, this.nucleus, label);
  }
  update(vis: number, _local: number, ctx: FrameCtx) {
    this.f.apply(vis);
    this.nucleus.rotation.set(Math.sin(ctx.time * 0.4) * 0.35, ctx.time * 0.3, 0);
  }
}

class WaterProp extends Prop {
  private f = new Fader();
  private hydrogens: THREE.Mesh[] = [];
  private bonds: THREE.Mesh[] = [];
  private hLabels: THREE.Sprite[] = [];
  private arcMat: THREE.LineBasicMaterial;
  private angleLabel: THREE.Sprite;
  constructor(fonts: Fonts) {
    super();
    const O = new THREE.Mesh(
      new THREE.SphereGeometry(WATER.rO, 48, 32),
      this.f.mat(new THREE.MeshPhysicalMaterial({ color: "#ff5a36", roughness: 0.2, clearcoat: 1, clearcoatRoughness: 0.12 }), 1),
    );
    O.position.set(...WATER.O);
    this.group.add(O);
    const hMat = this.f.mat(new THREE.MeshPhysicalMaterial({ color: "#f5f0e6", roughness: 0.22, clearcoat: 1, clearcoatRoughness: 0.12 }), 1);
    const bondMat = this.f.mat(new THREE.MeshBasicMaterial({ color: "#ffc46b", blending: THREE.AdditiveBlending, depthWrite: false }), 0.9);
    for (let k = 0; k < 2; k++) {
      const h = new THREE.Mesh(new THREE.SphereGeometry(WATER.rH, 40, 28), hMat);
      const bond = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 1, 18, 1, true), bondMat);
      const label = makeLabel("H", { font: fonts.display, color: "#fff6e5", px: 15, weight: 600 });
      this.f.mat(label.material, 0.95);
      this.hydrogens.push(h);
      this.bonds.push(bond);
      this.hLabels.push(label);
      this.group.add(h, bond, label);
    }
    const oLabel = makeLabel("O", { font: fonts.display, color: "#ffb39e", px: 16, weight: 600 });
    oLabel.position.set(WATER.O[0] + 0.62, WATER.O[1] + 0.42, 0);
    this.f.mat(oLabel.material, 0.95);
    // The bond angle, drawn between the two bonds.
    const half = (104.5 / 2) * (Math.PI / 180);
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i <= 40; i++) {
      const a = -half + (2 * half * i) / 40;
      pts.push(new THREE.Vector3(WATER.O[0] + Math.sin(a) * 0.68, WATER.O[1] - Math.cos(a) * 0.68, 0.02));
    }
    this.arcMat = new THREE.LineBasicMaterial({ color: "#ffd28a", transparent: true, blending: THREE.AdditiveBlending, depthWrite: false });
    const arc = new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), this.arcMat);
    this.angleLabel = makeLabel("104.5°", { font: fonts.mono, color: "#ffd28a", px: 15 });
    this.angleLabel.position.set(WATER.O[0], WATER.O[1] - 0.92, 0.05);
    this.group.add(oLabel, arc, this.angleLabel);
  }
  update(vis: number, local: number, ctx: FrameCtx) {
    this.f.apply(vis);
    const approach = smoothstep(-0.62, -0.16, local);
    const bonded = smoothstep(0.82, 1, approach);
    const O = new THREE.Vector3(...WATER.O);
    [WATER.H1, WATER.H2].forEach((Hf, k) => {
      const final = new THREE.Vector3(...Hf);
      const dir = final.clone().sub(O).normalize();
      const bob = Math.sin(ctx.time * 1.6 + k * 2) * 0.03;
      const pos = final.clone().addScaledVector(dir, (1 - approach) * 2.6 + bob);
      this.hydrogens[k].position.copy(pos);
      this.hLabels[k].position.copy(pos).add(new THREE.Vector3(k === 0 ? -0.42 : 0.42, -0.3, 0));
      const bond = this.bonds[k];
      const from = O.clone().addScaledVector(dir, WATER.rO * 0.8);
      const to = pos.clone().addScaledVector(dir, -WATER.rH * 0.8);
      const len = Math.max(0.001, from.distanceTo(to));
      bond.position.copy(from).add(to).multiplyScalar(0.5);
      bond.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);
      bond.scale.set(bonded, len, bonded);
      bond.visible = bonded > 0.01;
    });
    this.arcMat.opacity = vis * bonded * 0.8;
    this.angleLabel.material.opacity = vis * bonded;
  }
}

class FlameProp extends Prop {
  private f = new Fader();
  private fire: THREE.ShaderMaterial;
  constructor(tier: "high" | "low", pixelRatio: number) {
    super();
    const count = tier === "high" ? 2800 : 1100;
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(new Float32Array(count * 3), 3));
    const seed = new Float32Array(count * 4);
    for (let i = 0; i < seed.length; i++) seed[i] = Math.random();
    g.setAttribute("aSeed", new THREE.BufferAttribute(seed, 4));
    this.fire = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uOpacity: { value: 1 },
        uPixelRatio: { value: pixelRatio },
        uBase: { value: FLAME.baseY },
        uHeight: { value: FLAME.height },
        uRadius: { value: FLAME.radius },
      },
      vertexShader: /* glsl */ `
        attribute vec4 aSeed;
        uniform float uTime, uPixelRatio, uBase, uHeight, uRadius;
        varying vec3 vColor;
        varying float vAlpha;
        void main(){
          float life = fract(uTime * (0.5 + aSeed.y * 0.35) + aSeed.x);
          float h = life * uHeight;
          float profile = (1.0 - pow(life, 0.7)) * smoothstep(0.0, 0.1, life) + 0.04;
          float ang = aSeed.z * 6.2831 + uTime * (aSeed.w - 0.5) * 2.0;
          float rad = uRadius * profile * sqrt(aSeed.w);
          vec3 p = vec3(cos(ang) * rad, uBase + h, sin(ang) * rad);
          p.x += sin(h * 3.0 - uTime * 5.0 + aSeed.x * 12.0) * 0.08 * life;
          p.z += cos(h * 2.6 - uTime * 4.2 + aSeed.y * 9.0) * 0.06 * life;
          vec4 mv = modelViewMatrix * vec4(p, 1.0);
          gl_Position = projectionMatrix * mv;
          gl_PointSize = (1.9 - life * 1.1) * (0.6 + aSeed.y * 0.6) * uPixelRatio * (100.0 / max(0.1, -mv.z));
          // Blue where combustion is complete, at the base; warm above.
          vec3 blue = vec3(0.16, 0.42, 1.0);
          vec3 hot = vec3(1.0, 0.92, 0.66);
          vec3 orange = vec3(1.0, 0.45, 0.12);
          vec3 red = vec3(0.9, 0.16, 0.06);
          vec3 c = life < 0.35 ? mix(hot, orange, life / 0.35) : mix(orange, red, (life - 0.35) / 0.65);
          float core = (1.0 - smoothstep(0.0, 0.28, life)) * (1.0 - aSeed.w);
          vColor = mix(c, blue, core * 0.9) * mix(1.0, 2.2, core);
          vAlpha = smoothstep(0.0, 0.05, life) * (1.0 - smoothstep(0.6, 1.0, life));
        }`,
      fragmentShader: /* glsl */ `
        uniform float uOpacity;
        varying vec3 vColor;
        varying float vAlpha;
        void main(){
          vec2 c = gl_PointCoord - 0.5;
          float r2 = dot(c, c) * 4.0;
          if (r2 > 1.0) discard;
          float a = exp(-r2 * 3.5) * vAlpha * uOpacity * 0.16;
          gl_FragColor = vec4(vColor, a);
          #include <tonemapping_fragment>
          #include <colorspace_fragment>
        }`,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    this.f.uni(this.fire, 1);
    const points = new THREE.Points(g, this.fire);
    points.frustumCulled = false;
    const burnerGeo = new THREE.TorusGeometry(0.5, 0.055, 14, 72);
    burnerGeo.rotateX(Math.PI / 2);
    const burner = new THREE.Mesh(burnerGeo, this.f.mat(new THREE.MeshStandardMaterial({ color: "#5d6673", metalness: 1, roughness: 0.35 }), 1));
    burner.position.y = FLAME.baseY - 0.06;
    const ringGeo = new THREE.TorusGeometry(0.42, 0.02, 8, 72);
    ringGeo.rotateX(Math.PI / 2);
    const blueRing = new THREE.Mesh(ringGeo, this.f.mat(new THREE.MeshBasicMaterial({ color: "#3d8bff", blending: THREE.AdditiveBlending, depthWrite: false }), 0.9));
    blueRing.position.y = FLAME.baseY + 0.02;
    const glow = glowSprite("#ff9a3c", 2.4);
    glow.position.set(0, FLAME.baseY + 1.0, 0);
    this.f.mat(glow.material, 0.16);
    this.group.add(glow, points, burner, blueRing);
  }
  update(vis: number, _local: number, ctx: FrameCtx) {
    this.f.apply(vis);
    this.fire.uniforms.uTime.value = ctx.time;
  }
  setPixelRatio(pr: number) {
    this.fire.uniforms.uPixelRatio.value = pr;
  }
}

function elementAtlas(fonts: Fonts): THREE.CanvasTexture {
  const cell = 128;
  const canvas = document.createElement("canvas");
  canvas.width = cell * 16;
  canvas.height = cell * 8;
  const ctx = canvas.getContext("2d")!;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ELEMENTS.forEach((symbol, i) => {
    const x = (i % 16) * cell;
    const y = Math.floor(i / 16) * cell;
    ctx.fillStyle = "rgba(255,255,255,0.75)";
    ctx.font = `500 24px ${fonts.mono}`;
    ctx.textAlign = "left";
    ctx.fillText(String(i + 1), x + 14, y + 22);
    ctx.fillStyle = "#ffffff";
    ctx.font = `600 ${symbol.length > 1 ? 54 : 60}px ${fonts.display}`;
    ctx.textAlign = "center";
    ctx.fillText(symbol, x + cell / 2, y + cell / 2 + 10);
  });
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  return tex;
}

class TableProp extends Prop {
  private f = new Fader();
  private tiles: THREE.ShaderMaterial;
  constructor(fonts: Fonts) {
    super();
    const n = ELEMENTS.length;
    const size = TABLE.cell * TABLE.scale * 0.9;
    const geo = new THREE.PlaneGeometry(size, size);
    const cellIdx = new Float32Array(n);
    const color = new Float32Array(n * 3);
    const fly = new Float32Array(n * 3);
    const delay = new Float32Array(n);
    const rand = mulberry(29);
    for (let i = 0; i < n; i++) {
      cellIdx[i] = i;
      const c = new THREE.Color(FAMILY_COLOR[elementFamily(i + 1)]);
      color.set([c.r, c.g, c.b], i * 3);
      const a = rand() * Math.PI * 2;
      const r = 3 + rand() * 5;
      fly.set([Math.cos(a) * r, Math.sin(a) * r * 0.7, 2 + rand() * 6], i * 3);
      const [x] = elementPos(i + 1);
      delay[i] = 0.08 + ((x + 4) / 8) * 0.38 + rand() * 0.12;
    }
    geo.setAttribute("aCell", new THREE.InstancedBufferAttribute(cellIdx, 1));
    geo.setAttribute("aColor", new THREE.InstancedBufferAttribute(color, 3));
    geo.setAttribute("aFly", new THREE.InstancedBufferAttribute(fly, 3));
    geo.setAttribute("aDelay", new THREE.InstancedBufferAttribute(delay, 1));
    this.tiles = new THREE.ShaderMaterial({
      uniforms: {
        uAtlas: { value: elementAtlas(fonts) },
        uAssemble: { value: 1 },
        uTime: { value: 0 },
        uOpacity: { value: 1 },
        uHighlight: { value: TABLE.copper - 1 },
        uHighlightColor: { value: new THREE.Color("#7af3ff") },
      },
      vertexShader: /* glsl */ `
        attribute float aCell;
        attribute vec3 aColor;
        attribute vec3 aFly;
        attribute float aDelay;
        uniform float uAssemble;
        varying vec2 vUv;
        varying float vCell;
        varying vec3 vColor;
        varying float vE;
        void main(){
          float e = clamp(uAssemble * 1.6 - aDelay, 0.0, 1.0);
          e = 1.0 - pow(1.0 - e, 3.0);
          float spin = (1.0 - e) * 4.7;
          vec3 p = position;
          p = vec3(cos(spin) * p.x, p.y, -sin(spin) * p.x);
          vec4 world = instanceMatrix * vec4(p, 1.0);
          world.xyz += aFly * (1.0 - e);
          gl_Position = projectionMatrix * modelViewMatrix * world;
          vUv = uv; vCell = aCell; vColor = aColor; vE = e;
        }`,
      fragmentShader: /* glsl */ `
        uniform sampler2D uAtlas;
        uniform float uTime, uOpacity, uHighlight;
        uniform vec3 uHighlightColor;
        varying vec2 vUv;
        varying float vCell;
        varying vec3 vColor;
        varying float vE;
        void main(){
          float r = 0.13;
          vec2 q = abs(vUv - 0.5) - (0.5 - r);
          float d = length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;
          float inside = smoothstep(0.012, -0.012, d);
          float border = smoothstep(0.035, 0.0, abs(d + 0.025)) * inside;
          float col = mod(vCell, 16.0);
          float row = floor(vCell / 16.0);
          vec2 uvA = vec2((col + vUv.x) / 16.0, 1.0 - (row + 1.0 - vUv.y) / 8.0);
          float glyph = texture2D(uAtlas, uvA).a;
          float hi = 1.0 - step(0.5, abs(vCell - uHighlight));
          vec3 tint = mix(vColor, uHighlightColor, hi);
          float pulse = hi * (0.6 + 0.4 * sin(uTime * 4.0));
          vec3 c = tint * (0.16 + pulse * 0.25) * inside + tint * border * (1.0 + pulse) + vec3(1.0, 0.97, 0.9) * glyph;
          float a = (inside * (0.42 + pulse * 0.3) + border * 0.6 + glyph * 0.9) * uOpacity * smoothstep(0.0, 0.3, vE);
          gl_FragColor = vec4(c, clamp(a, 0.0, 1.0));
          #include <tonemapping_fragment>
          #include <colorspace_fragment>
        }`,
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide,
    });
    this.f.uni(this.tiles, 1);
    const mesh = new THREE.InstancedMesh(geo, this.tiles, n);
    for (let i = 0; i < n; i++) {
      dummy.position.set(...elementPos(i + 1));
      dummy.rotation.set(0, 0, 0);
      dummy.scale.setScalar(1);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    }
    mesh.frustumCulled = false;
    this.group.add(mesh);
  }
  update(vis: number, local: number, ctx: FrameCtx) {
    this.f.apply(vis);
    this.tiles.uniforms.uAssemble.value = smoothstep(-0.78, -0.08, local);
    this.tiles.uniforms.uTime.value = ctx.time;
  }
}

/* ---------------------------------------------------------------- biology */

type Mover = { sprite: THREE.Sprite; from: V3; to: V3; speed: number; phase: number };

class LeafProp extends Prop {
  private f = new Fader();
  private sun: BeamSet;
  private hexes: THREE.Line[] = [];
  private hexStarts: V3[] = [];
  private movers: Mover[] = [];
  constructor(fonts: Fonts) {
    super();
    const targets: V3[] = [leafPoint(0.55, -0.35), leafPoint(0.35, 0.3), leafPoint(0.72, 0.25), leafPoint(0.45, -0.75)];
    this.sun = new BeamSet(
      targets.map((p, k) => ({ a: [-6.2 + k * 0.5, 5.4, -1.8] as V3, b: p, color: "#fff2bd", width: 0.22 + k * 0.03, intensity: 0.34 })),
    );
    this.group.add(this.sun.mesh);
    // Glucose rings forming and drifting up.
    const hexMat = this.f.mat(new THREE.LineBasicMaterial({ color: "#e2fbb0", blending: THREE.AdditiveBlending, depthWrite: false }), 1);
    const hexPts: THREE.Vector3[] = [];
    for (let i = 0; i <= 6; i++) hexPts.push(new THREE.Vector3(Math.cos((i * Math.PI) / 3) * 0.14, Math.sin((i * Math.PI) / 3) * 0.14, 0));
    const hexGeo = new THREE.BufferGeometry().setFromPoints(hexPts);
    const rand = mulberry(17);
    for (let k = 0; k < 9; k++) {
      const hex = new THREE.Line(hexGeo, hexMat);
      this.hexes.push(hex);
      this.hexStarts.push(leafPoint(0.2 + rand() * 0.7, (rand() * 2 - 1) * 0.7));
      this.group.add(hex);
    }
    const label = (text: string, color: string) => {
      const l = makeLabel(text, { font: fonts.mono, color, px: 15 });
      this.group.add(l);
      return l;
    };
    this.movers = [
      { sprite: label("CO₂", "#d1fae5"), from: [-4.6, 0.2, 0.4], to: leafPoint(0.45, -0.55), speed: 0.16, phase: 0 },
      { sprite: label("O₂", "#a7f3d0"), from: leafPoint(0.62, 0.45), to: [3.4, 2.7, 0.6], speed: 0.14, phase: 0.4 },
      { sprite: label("H₂O", "#a5f3fc"), from: [LEAF.base[0] + 0.9, LEAF.base[1] - 1.1, 0], to: leafPoint(0.12, 0), speed: 0.15, phase: 0.7 },
      { sprite: label("light", "#fff2bd"), from: [-5.0, 4.4, -1.4], to: leafPoint(0.55, -0.35), speed: 0.18, phase: 0.2 },
    ];
  }
  update(vis: number, local: number, ctx: FrameCtx) {
    this.f.apply(vis);
    const t = ctx.time;
    this.sun.update(ctx.camera, t, vis, smoothstep(-0.7, -0.25, local) * 1.1);
    this.hexes.forEach((hex, k) => {
      const ph = fract(t * 0.11 + k / this.hexes.length);
      const s = this.hexStarts[k];
      hex.position.set(s[0] + Math.sin(ph * 6 + k) * 0.15, s[1] + ph * 2.4, s[2] + 0.25 + ph * 0.8);
      hex.rotation.z = t * 0.6 + k;
      hex.scale.setScalar(smoothstep(0, 0.2, ph) * (1 - smoothstep(0.75, 1, ph)) + 0.001);
    });
    for (const m of this.movers) {
      const ph = fract(t * m.speed + m.phase);
      m.sprite.position.set(
        m.from[0] + (m.to[0] - m.from[0]) * ph,
        m.from[1] + (m.to[1] - m.from[1]) * ph,
        m.from[2] + (m.to[2] - m.from[2]) * ph,
      );
      m.sprite.material.opacity = vis * smoothstep(0, 0.15, ph) * (1 - smoothstep(0.8, 1, ph));
    }
  }
}

class CellProp extends Prop {
  private f = new Fader();
  private body = new THREE.Group();
  constructor(fonts: Fonts) {
    super();
    const nucleus = new THREE.Mesh(new THREE.SphereGeometry(CELL.nucleus.r * 0.97, 40, 28), this.f.uni(fresnelMaterial("#b9a6ff", { base: 0.025, strength: 0.55 }), 1));
    nucleus.position.set(...CELL.nucleus.pos);
    const nucleolus = new THREE.Mesh(new THREE.SphereGeometry(0.17, 24, 16), this.f.mat(new THREE.MeshBasicMaterial({ color: "#c4b5fd", blending: THREE.AdditiveBlending, depthWrite: false }), 0.8));
    nucleolus.position.set(CELL.nucleus.pos[0] + 0.12, CELL.nucleus.pos[1] + 0.05, CELL.nucleus.pos[2]);
    const vacuole = new THREE.Mesh(new THREE.SphereGeometry(CELL.vacuole.r * 0.97, 40, 28), this.f.uni(fresnelMaterial("#8ff0ff", { base: 0.006, strength: 0.32 }), 1));
    vacuole.position.set(...CELL.vacuole.pos);
    this.body.add(nucleus, nucleolus, vacuole);

    const rand = mulberry(41);
    const chloroMat = this.f.uni(fresnelMaterial("#4ade80", { base: 0.04, strength: 0.6 }), 1);
    const granaMat = this.f.mat(new THREE.MeshBasicMaterial({ color: "#22c55e", blending: THREE.AdditiveBlending, depthWrite: false }), 0.85);
    const chloroGeo = new THREE.SphereGeometry(1, 28, 18);
    const granumGeo = new THREE.CylinderGeometry(0.075, 0.075, 0.035, 16);
    for (const p of CELL.chloroplasts) {
      const c = new THREE.Group();
      const shell = new THREE.Mesh(chloroGeo, chloroMat);
      shell.scale.set(0.38, 0.21, 0.21);
      c.add(shell);
      for (let g = 0; g < 3; g++) {
        for (let s = 0; s < 3; s++) {
          const disc = new THREE.Mesh(granumGeo, granaMat);
          disc.position.set(-0.2 + g * 0.2, -0.05 + s * 0.045, 0);
          c.add(disc);
        }
      }
      c.position.set(...p);
      c.rotation.set(rand() * Math.PI, rand() * Math.PI, rand() * Math.PI);
      this.body.add(c);
    }
    const mitoMat = this.f.uni(fresnelMaterial("#fb923c", { base: 0.04, strength: 0.6 }), 1);
    const cristaeMat = this.f.mat(new THREE.LineBasicMaterial({ color: "#fdba74", blending: THREE.AdditiveBlending, depthWrite: false }), 0.9);
    const zig: THREE.Vector3[] = [];
    for (let i = 0; i <= 10; i++) zig.push(new THREE.Vector3(-0.2 + i * 0.04, i % 2 ? 0.07 : -0.07, 0));
    const zigGeo = new THREE.BufferGeometry().setFromPoints(zig);
    const capsule = new THREE.CapsuleGeometry(0.12, 0.34, 8, 16);
    capsule.rotateZ(Math.PI / 2);
    for (const p of CELL.mitochondria) {
      const m = new THREE.Group();
      m.add(new THREE.Mesh(capsule, mitoMat), new THREE.Line(zigGeo, cristaeMat));
      m.position.set(...p);
      m.rotation.set(rand() * Math.PI, rand() * Math.PI, rand() * Math.PI);
      this.body.add(m);
    }
    const labels: [string, V3, string][] = [
      ["Nucleus", add(CELL.nucleus.pos, [0, CELL.nucleus.r + 0.28, 0]), "#ddd6fe"],
      ["Chloroplast", add(CELL.chloroplasts[3], [0, 0.36, 0]), "#bbf7d0"],
      ["Mitochondrion", add(CELL.mitochondria[0], [0, 0.34, 0]), "#fed7aa"],
      ["Vacuole", add(CELL.vacuole.pos, [0.15, -0.35, CELL.vacuole.r]), "#cffafe"],
      ["Cell wall", [CELL.half[0] * 0.98, CELL.half[1] * 0.92, 0.3], "#99f6e4"],
    ];
    for (const [text, pos, color] of labels) {
      const l = makeLabel(text, { font: fonts.mono, color, px: 14 });
      l.position.set(...pos);
      this.f.mat(l.material, 0.95);
      this.body.add(l);
    }
    this.group.add(this.body);
  }
  update(vis: number, _local: number, ctx: FrameCtx) {
    this.f.apply(vis);
    // Turn exactly like the particles: spin about Y, then the tilt about X.
    this.body.rotation.set(CELL.tilt, CELL.spin * ctx.time, 0);
  }
}

class DnaProp extends Prop {
  private f = new Fader();
  private body = new THREE.Group();
  private rungs: THREE.InstancedMesh;
  private nodes: THREE.InstancedMesh;
  private rungInfo: { y: number; color: THREE.Color }[] = [];
  private nodeY: number[] = [];
  private tmp = new THREE.Color();
  constructor(fonts: Fonts) {
    super();
    const halves = DNA.rungs * 2;
    this.rungs = new THREE.InstancedMesh(
      new THREE.CylinderGeometry(0.038, 0.038, 1, 10),
      this.f.mat(new THREE.MeshBasicMaterial({ blending: THREE.AdditiveBlending, depthWrite: false }), 1),
      halves,
    );
    this.nodes = new THREE.InstancedMesh(
      new THREE.SphereGeometry(0.075, 14, 10),
      this.f.mat(new THREE.MeshBasicMaterial({ blending: THREE.AdditiveBlending, depthWrite: false }), 1),
      halves,
    );
    const up = new THREE.Vector3(0, 1, 0);
    for (let k = 0; k < DNA.rungs; k++) {
      const r = dnaRung(k);
      const a = new THREE.Vector3(...r.a);
      const b = new THREE.Vector3(...r.b);
      const mid = a.clone().add(b).multiplyScalar(0.5);
      [[a, mid, r.base], [mid, b, r.pair]].forEach(([p, q, base], h) => {
        const from = p as THREE.Vector3;
        const to = q as THREE.Vector3;
        const dir = to.clone().sub(from);
        dummy.position.copy(from).add(to).multiplyScalar(0.5);
        dummy.quaternion.setFromUnitVectors(up, dir.clone().normalize());
        dummy.scale.set(1, dir.length(), 1);
        dummy.updateMatrix();
        this.rungs.setMatrixAt(k * 2 + h, dummy.matrix);
        this.rungInfo.push({ y: r.y, color: new THREE.Color(dnaBaseColor(base as string)) });
        this.rungs.setColorAt(k * 2 + h, this.rungInfo[this.rungInfo.length - 1].color);
      });
      [a, b].forEach((end, h) => {
        dummy.position.copy(end);
        dummy.quaternion.identity();
        dummy.scale.setScalar(1);
        dummy.updateMatrix();
        this.nodes.setMatrixAt(k * 2 + h, dummy.matrix);
        this.nodes.setColorAt(k * 2 + h, new THREE.Color("#ecfccb"));
        this.nodeY.push(r.y);
      });
    }
    this.rungs.frustumCulled = false;
    this.nodes.frustumCulled = false;
    this.body.add(this.rungs, this.nodes);
    const first = dnaRung(2);
    const second = dnaRung(5);
    for (const [text, at, color] of [["A–T", first.b, "#fbbf24"], ["G–C", second.b, "#22d3ee"]] as [string, V3, string][]) {
      const l = makeLabel(text, { font: fonts.mono, color, px: 15, anchor: "left" });
      l.position.set(at[0] * 1.25, at[1], at[2] * 1.25);
      this.f.mat(l.material, 0.9);
      this.body.add(l);
    }
    this.group.add(this.body);
  }
  update(vis: number, _local: number, ctx: FrameCtx) {
    this.f.apply(vis);
    this.body.rotation.set(DNA.tilt, DNA.spin * ctx.time, 0);
    const wave = dnaWaveY(ctx.time);
    const glow = (y: number) => 0.35 + 1.5 * Math.exp(-((y - wave) ** 2) / 0.22);
    this.rungInfo.forEach((r, i) => this.rungs.setColorAt(i, this.tmp.copy(r.color).multiplyScalar(glow(r.y))));
    this.nodeY.forEach((y, i) => this.nodes.setColorAt(i, this.tmp.set("#ecfccb").multiplyScalar(0.6 + glow(y) * 0.6)));
    if (this.rungs.instanceColor) this.rungs.instanceColor.needsUpdate = true;
    if (this.nodes.instanceColor) this.nodes.instanceColor.needsUpdate = true;
  }
}

class EyeProp extends Prop {
  private f = new Fader();
  private rays: BeamSet;
  private arrows: BeamSet;
  private pulses: THREE.Sprite[] = [];
  constructor(fonts: Fonts) {
    super();
    const lens = new THREE.Mesh(lensGeometry(EYE.lens.aperture, EYE.lens.thickness), this.f.uni(fresnelMaterial("#cffafe", { base: 0.02, strength: 0.7 }), 1));
    lens.position.x = EYE.lens.x;
    const top: V3 = [EYE.object.x, EYE.object.h, 0];
    const img = eyeImageTop();
    const image: V3 = [img[0], img[1], 0];
    this.rays = new BeamSet(
      [EYE.object.h, 0, -0.42].flatMap((ly) => {
        const at: V3 = [EYE.lens.x, ly * 0.55, 0];
        return [
          { a: top, b: at, color: "#e9fbff", width: 0.04, intensity: 0.55 },
          { a: at, b: image, color: "#ffffff", width: 0.04, intensity: 0.7 },
        ];
      }),
    );
    // The object (upright) and its image on the retina (inverted).
    this.arrows = new BeamSet([
      { a: [EYE.object.x, -0.02, 0], b: [EYE.object.x, EYE.object.h + 0.1, 0], color: "#ffffff", width: 0.07, intensity: 1.4 },
      { a: [retinaBase()[0] - 0.02, 0.02, 0], b: [image[0] - 0.02, image[1] - 0.06, 0], color: "#ffffff", width: 0.05, intensity: 1.5 },
    ]);
    this.group.add(lens, this.rays.mesh, this.arrows.mesh);
    for (let k = 0; k < 3; k++) {
      const s = glowSprite("#fde68a", 0.32);
      this.pulses.push(s);
      this.group.add(s);
    }
    const labels: [string, V3, string, "left" | "center" | "right"][] = [
      ["object", [EYE.object.x, EYE.object.h + 0.4, 0], "#e9fbff", "center"],
      ["lens", [EYE.lens.x, -0.9, 0.2], "#cffafe", "center"],
      ["cornea", [EYE.center[0] - EYE.radius - 0.15, 0.95, 0], "#a5f3fc", "right"],
      ["retina", [EYE.center[0] + EYE.radius * 0.72, EYE.radius * 0.85, 0], "#fda4af", "left"],
      ["optic nerve", add(nervePoint(0.72), [0, -0.5, 0]), "#fde68a", "center"],
      ["image", [image[0] + 0.15, image[1] - 0.3, 0], "#ffffff", "left"],
    ];
    for (const [text, pos, color, anchor] of labels) {
      const l = makeLabel(text, { font: fonts.mono, color, px: 14, anchor });
      l.position.set(...pos);
      this.f.mat(l.material, 0.95);
      this.group.add(l);
    }
  }
  update(vis: number, local: number, ctx: FrameCtx) {
    this.f.apply(vis);
    this.rays.update(ctx.camera, ctx.time, vis, smoothstep(-0.7, -0.15, local) * 1.1);
    this.arrows.update(ctx.camera, ctx.time, vis);
    this.pulses.forEach((s, k) => {
      const ph = fract(ctx.time * 0.42 + k * 0.33 + 0.16);
      s.position.set(...nervePoint(ph));
      s.material.opacity = vis * 0.8 * smoothstep(0, 0.1, ph) * (1 - smoothstep(0.85, 1, ph));
    });
  }
}

/* ----------------------------------------------------------------- finale */

class FilamentCurve extends THREE.Curve<THREE.Vector3> {
  constructor() {
    super();
  }
  getPoint(t: number, target = new THREE.Vector3()) {
    const p = filamentPoint(t);
    return target.set(p[0], p[1], p[2]);
  }
}

class BulbProp extends Prop {
  private f = new Fader();
  private filament: THREE.MeshBasicMaterial;
  private halo: THREE.Sprite;
  constructor() {
    super();
    const profile: THREE.Vector2[] = [];
    const top = BULB.center[1] + BULB.r;
    for (let i = 0; i <= 60; i++) {
      const y = BULB.neckY + ((top - BULB.neckY) * i) / 60;
      profile.push(new THREE.Vector2(Math.max(0.001, bulbRadius(y)), y));
    }
    const glass = new THREE.Mesh(new THREE.LatheGeometry(profile, 64), this.f.uni(fresnelMaterial("#e9d5ff", { base: 0.006, strength: 0.42, power: 2.8 }), 1));
    this.filament = new THREE.MeshBasicMaterial({ color: "#fff3c8", blending: THREE.AdditiveBlending, depthWrite: false, transparent: true });
    const filament = new THREE.Mesh(new THREE.TubeGeometry(new FilamentCurve(), 240, 0.018, 8, false), this.filament);
    this.halo = glowSprite("#ffcf6b", 3.4);
    this.halo.position.set(0, BULB.filamentY, 0);
    this.group.add(glass, this.halo, filament);
  }
  update(vis: number, local: number, ctx: FrameCtx) {
    this.f.apply(vis);
    // The bulb switches on as you arrive - with a flicker, like a real one.
    const on = smoothstep(-0.55, -0.12, local);
    const flicker = on > 0.15 && on < 0.85 ? (Math.sin(ctx.time * 53) > 0.3 ? 1 : 0.35) : 1;
    const level = on * flicker;
    this.filament.opacity = vis * (0.25 + 0.75 * level);
    this.filament.color.set("#fff3c8").multiplyScalar(0.6 + 1.6 * level);
    this.halo.material.opacity = vis * level * (0.32 + 0.06 * Math.sin(ctx.time * 2.2));
    this.halo.scale.setScalar(2.4 + level * 1.4);
  }
}

class LogoProp extends Prop {
  private f = new Fader();
  private ring: THREE.Mesh;
  constructor() {
    super();
    const halo = glowSprite("#a855f7", 6.5);
    this.f.mat(halo.material, 0.14);
    this.ring = new THREE.Mesh(
      new THREE.TorusGeometry(2.3, 0.012, 8, 160),
      this.f.mat(new THREE.MeshBasicMaterial({ color: "#d8b4fe", blending: THREE.AdditiveBlending, depthWrite: false }), 0.6),
    );
    this.group.add(halo, this.ring);
  }
  update(vis: number, _local: number, ctx: FrameCtx) {
    this.f.apply(vis);
    // A gentle sway, not a full turn: a spinning ring would sweep across the text.
    this.ring.rotation.set(1.2 + Math.sin(ctx.time * 0.3) * 0.06, Math.sin(ctx.time * 0.2) * 0.3, 0.32);
  }
}

/* ------------------------------------------------------------------ index */

export function buildProps(fonts: Fonts, tier: "high" | "low", pixelRatio: number): (Prop | null)[] {
  return [
    new HaloProp("#8b7bff", 3.2, 0.4),
    new PrismProp(),
    new LensProp(fonts),
    new PhotoProp(fonts),
    new CoilProp(fonts, tier),
    new AtomProp(fonts),
    new WaterProp(fonts),
    new FlameProp(tier, pixelRatio),
    new TableProp(fonts),
    new LeafProp(fonts),
    new CellProp(fonts),
    new DnaProp(fonts),
    new EyeProp(fonts),
    new BulbProp(),
    new LogoProp(),
  ];
}

export { FlameProp };
