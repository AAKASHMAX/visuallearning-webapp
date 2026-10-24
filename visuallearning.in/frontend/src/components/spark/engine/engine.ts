/**
 * The spark journey's renderer. Passive: the page calls frame(progress, dt)
 * from its own animation loop, with progress in beats (0 = intro, 14 = finale).
 */
import * as THREE from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { BEAT_VIEWS } from "./beats";
import { MorphParticles } from "./particles";
import { buildProps, FlameProp, type Fonts, type Prop } from "./props";
import { clamp, glowTexture, lerp, scaleLabels, smoothstep, type FrameCtx } from "./props-common";
import { buildShape, SHAPE_COUNT, type Shape } from "./shapes";

export type Tier = "high" | "low";
export type EngineOptions = { tier: Tier; fonts: Fonts; reducedMotion: boolean };

const FOV = 35;
const TRAIL = 46;
const Y_AXIS = new THREE.Vector3(0, 1, 0);

const BG_VERT = /* glsl */ `
varying vec2 vUv;
void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.9999, 1.0); }`;

const BG_FRAG = /* glsl */ `
uniform vec3 uTop;
uniform vec3 uBottom;
uniform vec3 uGlow;
uniform float uStrength;
uniform float uTime;
uniform float uAspect;
uniform vec2 uGlowPos;
varying vec2 vUv;
float hash(vec2 p){ return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
void main(){
  vec3 c = mix(uBottom, uTop, smoothstep(0.0, 1.0, vUv.y));
  vec2 d = (vUv - uGlowPos) * vec2(uAspect, 1.0);
  c += uGlow * exp(-dot(d, d) * 2.2) * uStrength;
  c += uGlow * exp(-dot(d, d) * 14.0) * uStrength * 0.35;
  vec2 v = vUv - 0.5;
  c *= 1.0 - dot(v, v) * 0.85;
  c += (hash(vUv * 937.0 + fract(uTime)) - 0.5) * 0.01;
  gl_FragColor = vec4(max(c, 0.0), 1.0);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}`;

const TRAIL_VERT = /* glsl */ `
attribute float aIdx;
uniform float uPixelRatio;
uniform float uSize;
varying float vFade;
void main(){
  vFade = 1.0 - aIdx;
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  gl_Position = projectionMatrix * mv;
  gl_PointSize = uSize * vFade * uPixelRatio * (10.0 / max(0.1, -mv.z));
}`;

const TRAIL_FRAG = /* glsl */ `
uniform vec3 uColor;
uniform float uOpacity;
varying float vFade;
void main(){
  vec2 c = gl_PointCoord - 0.5;
  float r2 = dot(c, c) * 4.0;
  if (r2 > 1.0) discard;
  gl_FragColor = vec4(uColor, exp(-r2 * 4.0) * vFade * vFade * uOpacity);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}`;

export class SparkEngine {
  readonly beats = BEAT_VIEWS.length;
  private readonly renderer: THREE.WebGLRenderer;
  private readonly scene = new THREE.Scene();
  private readonly camera = new THREE.PerspectiveCamera(FOV, 1, 0.1, 200);
  private composer: EffectComposer | null = null;
  private bloom: UnrealBloomPass | null = null;
  private readonly particles: MorphParticles;
  private readonly props: (Prop | null)[];
  private readonly shapes = new Map<number, Shape>();
  private readonly bgMat: THREE.ShaderMaterial;
  private readonly spark: THREE.Sprite;
  private readonly flares: THREE.Sprite[] = [];
  private readonly trailPos: Float32Array;
  private readonly trailGeo: THREE.BufferGeometry;
  private readonly trailMat: THREE.ShaderMaterial;
  private readonly envTexture: THREE.Texture;
  private readonly lastSpark = new THREE.Vector3();
  private readonly colors = { a: new THREE.Color(), b: new THREE.Color(), spark: new THREE.Color() };
  private readonly count: number;
  private time = 0;
  private width = 1;
  private height = 1;
  private pixelRatio = 1;
  private portrait = false;
  private pointer = { x: 0, y: 0, sx: 0, sy: 0 };
  private slow = 0;
  private frames = 0;
  private degraded = false;
  private disposed = false;
  private trailReady = false;

  constructor(canvas: HTMLCanvasElement, private readonly opts: EngineOptions) {
    this.count = opts.tier === "high" ? 30000 : 11000;
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: opts.tier === "low", alpha: false, powerPreference: "high-performance" });
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.05;
    this.renderer.setClearColor(0x04050f, 1);

    const pmrem = new THREE.PMREMGenerator(this.renderer);
    this.envTexture = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    this.scene.environment = this.envTexture;
    this.scene.environmentIntensity = 0.32;
    pmrem.dispose();

    this.bgMat = new THREE.ShaderMaterial({
      vertexShader: BG_VERT,
      fragmentShader: BG_FRAG,
      depthTest: false,
      depthWrite: false,
      uniforms: {
        uTop: { value: new THREE.Color() },
        uBottom: { value: new THREE.Color() },
        uGlow: { value: new THREE.Color() },
        uStrength: { value: 0.3 },
        uTime: { value: 0 },
        uAspect: { value: 1 },
        uGlowPos: { value: new THREE.Vector2(0.62, 0.52) },
      },
    });
    const bg = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), this.bgMat);
    bg.frustumCulled = false;
    bg.renderOrder = -100;
    this.scene.add(bg);

    this.particles = new MorphParticles(this.count, (k) => this.shapeAt(k), {
      pixelRatio: 1,
      size: opts.tier === "high" ? 2.6 : 3.3,
      halo: opts.tier === "high" ? 0.16 : 0.45,
      gain: opts.tier === "high" ? 0.72 : 0.95,
    });
    this.scene.add(this.particles.points);

    this.props = buildProps(opts.fonts, opts.tier, 1);
    for (const p of this.props) {
      if (!p) continue;
      p.group.visible = false;
      this.scene.add(p.group);
    }

    // The spark: a hot core, two lens-flare streaks and a fading trail.
    const sparkMat = new THREE.SpriteMaterial({ map: glowTexture(), color: "#ffffff", blending: THREE.AdditiveBlending, depthWrite: false, depthTest: false, transparent: true });
    this.spark = new THREE.Sprite(sparkMat);
    this.spark.renderOrder = 5;
    for (let k = 0; k < 2; k++) {
      const flare = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTexture(), color: "#ffffff", blending: THREE.AdditiveBlending, depthWrite: false, depthTest: false, transparent: true, opacity: 0.5 }));
      flare.renderOrder = 5;
      this.flares.push(flare);
      this.scene.add(flare);
    }
    this.trailPos = new Float32Array(TRAIL * 3);
    const idx = new Float32Array(TRAIL);
    for (let i = 0; i < TRAIL; i++) idx[i] = i / TRAIL;
    this.trailGeo = new THREE.BufferGeometry();
    this.trailGeo.setAttribute("position", new THREE.BufferAttribute(this.trailPos, 3).setUsage(THREE.DynamicDrawUsage));
    this.trailGeo.setAttribute("aIdx", new THREE.BufferAttribute(idx, 1));
    this.trailMat = new THREE.ShaderMaterial({
      vertexShader: TRAIL_VERT,
      fragmentShader: TRAIL_FRAG,
      transparent: true,
      depthWrite: false,
      depthTest: false,
      blending: THREE.AdditiveBlending,
      uniforms: { uColor: { value: new THREE.Color("#ffffff") }, uOpacity: { value: 0.8 }, uPixelRatio: { value: 1 }, uSize: { value: 9 } },
    });
    const trail = new THREE.Points(this.trailGeo, this.trailMat);
    trail.frustumCulled = false;
    trail.renderOrder = 4;
    this.scene.add(trail, this.spark);

    this.particles.setSegment(0);
    if (opts.tier === "high") this.setupComposer();
    this.resize(canvas.clientWidth || window.innerWidth, canvas.clientHeight || window.innerHeight);
    this.prefetch();
  }

  /** Compile every shader up front so scrolling never stutters on a new scene. */
  async warmUp() {
    for (const p of this.props) if (p) p.group.visible = true;
    try {
      await this.renderer.compileAsync(this.scene, this.camera);
    } catch {
      /* older drivers: shaders compile on first use instead */
    }
    for (const p of this.props) if (p) p.group.visible = false;
  }

  private setupComposer() {
    const target = new THREE.WebGLRenderTarget(1, 1, { type: THREE.HalfFloatType, samples: 4 });
    this.composer = new EffectComposer(this.renderer, target);
    this.composer.addPass(new RenderPass(this.scene, this.camera));
    this.bloom = new UnrealBloomPass(new THREE.Vector2(this.width, this.height), 0.7, 0.42, 0.42);
    this.composer.addPass(this.bloom);
    this.composer.addPass(new OutputPass());
  }

  private shapeAt(k: number): Shape {
    let s = this.shapes.get(k);
    if (!s) {
      s = buildShape(k, this.count, this.opts.fonts.display);
      this.shapes.set(k, s);
    }
    return s;
  }

  /** Build the remaining shapes while the browser is idle. */
  private prefetch() {
    const schedule = (fn: () => void) => {
      const w = window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number };
      if (w.requestIdleCallback) w.requestIdleCallback(fn, { timeout: 600 });
      else window.setTimeout(fn, 40);
    };
    let k = 0;
    const step = () => {
      if (this.disposed) return;
      while (k < SHAPE_COUNT && this.shapes.has(k)) k++;
      if (k >= SHAPE_COUNT) return;
      this.shapeAt(k);
      schedule(step);
    };
    schedule(step);
  }

  resize(w: number, h: number) {
    this.width = Math.max(1, Math.round(w));
    this.height = Math.max(1, Math.round(h));
    this.portrait = this.height > this.width * 1.05;
    const cap = this.opts.tier === "high" ? (this.degraded ? 1.25 : 1.75) : 1.5;
    this.pixelRatio = Math.min(window.devicePixelRatio || 1, cap);
    this.renderer.setPixelRatio(this.pixelRatio);
    this.renderer.setSize(this.width, this.height, false);
    this.camera.aspect = this.width / this.height;
    this.camera.clearViewOffset();
    this.camera.updateProjectionMatrix();
    if (this.composer) {
      this.composer.setPixelRatio(this.pixelRatio);
      this.composer.setSize(this.width, this.height);
    }
    // Phones see the scene from further away: bigger points keep it bright.
    this.particles.setPixelRatio(this.pixelRatio * (this.portrait ? 1.35 : 1));
    this.trailMat.uniforms.uPixelRatio.value = this.pixelRatio;
    for (const p of this.props) if (p instanceof FlameProp) p.setPixelRatio(this.pixelRatio * (this.portrait ? 1.3 : 1));
    this.bgMat.uniforms.uAspect.value = this.width / this.height;
    scaleLabels(this.scene, this.camera, this.height, this.portrait ? 0.92 : 1);
  }

  setPointer(x: number, y: number) {
    this.pointer.x = clamp(x, -1, 1);
    this.pointer.y = clamp(y, -1, 1);
  }

  /** Camera for one beat, pulled back as far as needed to keep the scene in view. */
  private view(i: number) {
    const v = BEAT_VIEWS[i];
    const look = new THREE.Vector3(...v.look);
    const pos = new THREE.Vector3(...v.cam);
    const dir = pos.clone().sub(look);
    const tanH = Math.tan((FOV * Math.PI) / 360);
    const aspect = this.width / this.height;
    const shift = this.portrait ? 0 : v.shift;
    const availW = this.portrait ? 0.94 : Math.max(0.5, 2 * (0.5 - shift) - 0.04);
    const availH = this.portrait ? 0.5 : 0.84;
    const dist = Math.max(dir.length(), v.fitW / (2 * tanH * aspect * availW), v.fitH / (2 * tanH * availH));
    pos.copy(look).addScaledVector(dir.normalize(), dist);
    return { pos, look, shift };
  }

  frame(progress: number, dt: number) {
    if (this.disposed) return;
    this.time += this.opts.reducedMotion ? dt * 0.35 : dt;
    const B = this.beats;
    const sp = clamp(progress, 0, B - 1);
    const k = Math.min(B - 2, Math.floor(sp));
    const t = sp - k;
    this.particles.setSegment(k);
    this.particles.update(clamp((t - 0.16) / 0.62), this.time);

    // Camera: glide between the two beats, with a little orbit, drift and parallax.
    const e = t * t * t * (t * (t * 6 - 15) + 10);
    const a = this.view(k);
    const b = this.view(k + 1);
    const pos = a.pos.lerp(b.pos, e);
    const look = a.look.lerp(b.look, e);
    let yaw = 0;
    for (const i of [k, k + 1]) {
      const d = sp - i;
      yaw += BEAT_VIEWS[i].orbit * d * (1 - smoothstep(0.35, 0.95, Math.abs(d)));
    }
    pos.sub(look).applyAxisAngle(Y_AXIS, yaw).add(look);
    const ease = 1 - Math.exp(-dt * 2.5);
    this.pointer.sx += (this.pointer.x - this.pointer.sx) * ease;
    this.pointer.sy += (this.pointer.y - this.pointer.sy) * ease;
    const drift = this.opts.reducedMotion ? 0 : 1;
    pos.x += this.pointer.sx * 0.45 + Math.sin(this.time * 0.17) * 0.12 * drift;
    pos.y += this.pointer.sy * 0.28 + Math.cos(this.time * 0.13) * 0.08 * drift;
    this.camera.position.copy(pos);
    this.camera.lookAt(look);
    const shift = lerp(a.shift, b.shift, e);
    if (this.portrait) this.camera.setViewOffset(this.width, this.height, 0, this.height * 0.19, this.width, this.height);
    else this.camera.setViewOffset(this.width, this.height, -this.width * shift, 0, this.width, this.height);
    this.camera.updateMatrixWorld();

    const ctx: FrameCtx = { time: this.time, camera: this.camera, tier: this.opts.tier };
    this.props.forEach((p, i) => {
      if (!p) return;
      const d = sp - i;
      const vis = 1 - smoothstep(0.32, 0.72, Math.abs(d));
      p.group.visible = vis > 0.003;
      if (p.group.visible) p.update(vis, d, ctx);
    });

    // Background light follows the subject.
    const pa = BEAT_VIEWS[k].bg;
    const pb = BEAT_VIEWS[k + 1].bg;
    const u = this.bgMat.uniforms;
    const mixColor = (target: THREE.Color, x: string, y: string) => target.set(x).lerp(this.colors.b.set(y), e);
    mixColor(u.uTop.value, pa.top, pb.top);
    mixColor(u.uBottom.value, pa.bottom, pb.bottom);
    mixColor(u.uGlow.value, pa.glow, pb.glow);
    u.uStrength.value = lerp(pa.strength, pb.strength, e);
    u.uTime.value = this.time;
    if (this.portrait) u.uGlowPos.value.set(0.5, 0.69);
    else u.uGlowPos.value.set(0.5 + shift, 0.52);
    if (this.bloom) this.bloom.strength = 0.7 * lerp(BEAT_VIEWS[k].bloom, BEAT_VIEWS[k + 1].bloom, e);

    this.updateSpark(k, t);

    if (this.composer) this.composer.render(dt);
    else this.renderer.render(this.scene, this.camera);
    this.watchPerformance(dt);
  }

  private updateSpark(k: number, t: number) {
    const A = new THREE.Vector3(...BEAT_VIEWS[k].spark(this.time));
    const B = new THREE.Vector3(...BEAT_VIEWS[k + 1].spark(this.time));
    const s = smoothstep(0.1, 0.9, t);
    // Swoop towards the camera between scenes.
    const lift = Math.min(1, A.distanceTo(B) / 4);
    const C = A.clone().add(B).multiplyScalar(0.5).add(new THREE.Vector3(0, 1.1 * lift, 2.0 * lift));
    const p = A.multiplyScalar((1 - s) * (1 - s)).add(C.multiplyScalar(2 * (1 - s) * s)).add(B.multiplyScalar(s * s));
    const travel = Math.sin(Math.PI * s);
    const pulse = 1 + 0.12 * Math.sin(this.time * 3.1);
    this.spark.position.copy(p);
    this.spark.scale.setScalar(0.62 * pulse * (1 + travel * 0.45));
    this.colors.spark.set(BEAT_VIEWS[k].sparkColor).lerp(this.colors.a.set(BEAT_VIEWS[k + 1].sparkColor), s);
    this.spark.material.color.copy(this.colors.spark);
    const [h, v] = this.flares;
    h.position.copy(p);
    v.position.copy(p);
    h.scale.set(2.6 * (1 + travel), 0.045, 1);
    v.scale.set(0.045, 1.25, 1);
    h.material.color.copy(this.colors.spark);
    v.material.color.copy(this.colors.spark);
    h.material.opacity = 0.42 + 0.12 * Math.sin(this.time * 2.3);
    v.material.opacity = 0.32;

    // Trail: shift back by one; a jump (a loop restarting) starts a fresh trail.
    if (!this.trailReady || p.distanceTo(this.lastSpark) > 1.2) {
      for (let i = 0; i < TRAIL; i++) this.trailPos.set([p.x, p.y, p.z], i * 3);
      this.trailReady = true;
    } else {
      this.trailPos.copyWithin(3, 0, (TRAIL - 1) * 3);
      this.trailPos.set([p.x, p.y, p.z], 0);
    }
    this.lastSpark.copy(p);
    (this.trailGeo.getAttribute("position") as THREE.BufferAttribute).needsUpdate = true;
    this.trailMat.uniforms.uColor.value.copy(this.colors.spark);
  }

  /** If a "high" machine can't keep up, drop the glow pass and resolution. */
  private watchPerformance(dt: number) {
    if (this.opts.tier !== "high" || this.degraded) return;
    if (++this.frames < 150) return;
    this.slow = this.slow * 0.97 + (dt > 0.034 ? 0.03 : 0);
    if (this.slow < 0.45) return;
    this.degraded = true;
    this.composer?.dispose();
    this.composer = null;
    this.bloom = null;
    this.particles.material.uniforms.uHalo.value = 0.45;
    this.particles.material.uniforms.uGain.value = 0.95;
    this.resize(this.width, this.height);
  }

  dispose() {
    this.disposed = true;
    for (const p of this.props) p?.dispose();
    this.particles.dispose();
    this.trailGeo.dispose();
    this.trailMat.dispose();
    this.bgMat.dispose();
    this.spark.material.dispose();
    for (const f of this.flares) f.material.dispose();
    this.envTexture.dispose();
    this.composer?.dispose();
    this.renderer.dispose();
  }
}
