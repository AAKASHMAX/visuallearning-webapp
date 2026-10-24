import * as THREE from "three";
import type { Shape, ShapeMeta } from "./shapes";

/* Ashima Arts 3D simplex noise (MIT). */
const NOISE = /* glsl */ `
vec3 mod289(vec3 x){return x-floor(x*(1.0/289.0))*289.0;}
vec4 mod289(vec4 x){return x-floor(x*(1.0/289.0))*289.0;}
vec4 permute(vec4 x){return mod289(((x*34.0)+1.0)*x);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159-0.85373472095314*r;}
float snoise(vec3 v){
  const vec2 C=vec2(1.0/6.0,1.0/3.0);const vec4 D=vec4(0.0,0.5,1.0,2.0);
  vec3 i=floor(v+dot(v,C.yyy));vec3 x0=v-i+dot(i,C.xxx);
  vec3 g=step(x0.yzx,x0.xyz);vec3 l=1.0-g;vec3 i1=min(g.xyz,l.zxy);vec3 i2=max(g.xyz,l.zxy);
  vec3 x1=x0-i1+C.xxx;vec3 x2=x0-i2+C.yyy;vec3 x3=x0-D.yyy;
  i=mod289(i);
  vec4 p=permute(permute(permute(i.z+vec4(0.0,i1.z,i2.z,1.0))+i.y+vec4(0.0,i1.y,i2.y,1.0))+i.x+vec4(0.0,i1.x,i2.x,1.0));
  float n_=0.142857142857;vec3 ns=n_*D.wyz-D.xzx;
  vec4 j=p-49.0*floor(p*ns.z*ns.z);vec4 x_=floor(j*ns.z);vec4 y_=floor(j-7.0*x_);
  vec4 x=x_*ns.x+ns.yyyy;vec4 y=y_*ns.x+ns.yyyy;vec4 h=1.0-abs(x)-abs(y);
  vec4 b0=vec4(x.xy,y.xy);vec4 b1=vec4(x.zw,y.zw);
  vec4 s0=floor(b0)*2.0+1.0;vec4 s1=floor(b1)*2.0+1.0;vec4 sh=-step(h,vec4(0.0));
  vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy;vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;
  vec3 p0=vec3(a0.xy,h.x);vec3 p1=vec3(a0.zw,h.y);vec3 p2=vec3(a1.xy,h.z);vec3 p3=vec3(a1.zw,h.w);
  vec4 norm=taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));
  p0*=norm.x;p1*=norm.y;p2*=norm.z;p3*=norm.w;
  vec4 m=max(0.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.0);m=m*m;
  return 42.0*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));
}`;

const VERT = /* glsl */ `
attribute vec3 aFrom;
attribute vec3 aTo;
attribute vec3 aFromCol;
attribute vec3 aToCol;
attribute vec4 aRand;
uniform float uMix;
uniform float uTime;
uniform float uSize;
uniform float uPixelRatio;
uniform float uScatter;
uniform float uGain;
uniform vec4 uMotionFrom; // swirl, spin, tilt, shimmer
uniform vec4 uMotionTo;
uniform vec2 uLookFrom;   // size, gain
uniform vec2 uLookTo;
varying vec3 vColor;
varying float vAlpha;
${NOISE}

// Same conventions as THREE.Object3D: rotation.y, then rotation.x.
vec3 moved(vec3 p, vec4 m, float seed){
  float r = length(p.xz);
  float a = m.x * uTime / (0.35 + r * 0.6) + m.y * uTime;
  float c = cos(a), s = sin(a);
  p.xz = vec2(c * p.x + s * p.z, -s * p.x + c * p.z);
  c = cos(m.z); s = sin(m.z);
  p.yz = vec2(c * p.y - s * p.z, s * p.y + c * p.z);
  p += m.w * vec3(sin(uTime * 1.3 + seed * 40.0), cos(uTime * 1.1 + seed * 31.0), sin(uTime * 0.9 + seed * 17.0));
  return p;
}

void main(){
  // Each particle leaves and arrives at its own moment.
  float m = clamp(uMix * 1.55 - aRand.x * 0.55, 0.0, 1.0);
  m = m * m * (3.0 - 2.0 * m);
  vec3 a = moved(aFrom, uMotionFrom, aRand.z);
  vec3 b = moved(aTo, uMotionTo, aRand.z);
  vec3 p = mix(a, b, m);
  float flight = sin(m * 3.14159265);
  if (flight > 0.001 && uScatter > 0.0) {
    vec3 q = p * 0.32 + vec3(aRand.w * 7.0, uTime * 0.07, aRand.z * 5.0);
    p += vec3(snoise(q), snoise(q + 19.1), snoise(q + 41.7)) * flight * uScatter;
  }
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  gl_Position = projectionMatrix * mv;
  vec2 look = mix(uLookFrom, uLookTo, m);
  float size = uSize * look.x * (0.55 + aRand.y * 0.9) * (1.0 + flight * 0.5);
  gl_PointSize = size * uPixelRatio * (10.0 / max(0.1, -mv.z));
  vColor = mix(aFromCol, aToCol, m) * look.y * uGain * (1.0 + flight * 0.6);
  vAlpha = 0.72 + 0.28 * sin(uTime * (0.8 + aRand.w * 2.2) + aRand.z * 30.0);
}`;

const FRAG = /* glsl */ `
uniform float uOpacity;
uniform float uHalo;
varying vec3 vColor;
varying float vAlpha;
void main(){
  vec2 c = gl_PointCoord - 0.5;
  float r2 = dot(c, c) * 4.0;
  if (r2 > 1.0) discard;
  float a = (exp(-r2 * 7.0) + exp(-r2 * 2.2) * uHalo) * vAlpha * uOpacity;
  gl_FragColor = vec4(vColor, a);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}`;

const motionOf = (m: ShapeMeta) => new THREE.Vector4(m.swirl, m.spin, m.tilt, m.shimmer);
const lookOf = (m: ShapeMeta) => new THREE.Vector2(m.size, m.gain);

export class MorphParticles {
  readonly points: THREE.Points;
  readonly material: THREE.ShaderMaterial;
  private readonly geometry: THREE.BufferGeometry;
  private segment = -1;

  constructor(private readonly count: number, private readonly shapeAt: (k: number) => Shape, opts: { pixelRatio: number; size: number; halo: number; gain: number }) {
    const g = new THREE.BufferGeometry();
    const make = () => {
      const attr = new THREE.BufferAttribute(new Float32Array(count * 3), 3);
      attr.setUsage(THREE.DynamicDrawUsage);
      return attr;
    };
    g.setAttribute("position", new THREE.BufferAttribute(new Float32Array(count * 3), 3));
    g.setAttribute("aFrom", make());
    g.setAttribute("aTo", make());
    g.setAttribute("aFromCol", make());
    g.setAttribute("aToCol", make());
    const rand = new Float32Array(count * 4);
    for (let i = 0; i < rand.length; i++) rand[i] = Math.random();
    g.setAttribute("aRand", new THREE.BufferAttribute(rand, 4));
    this.geometry = g;

    this.material = new THREE.ShaderMaterial({
      vertexShader: VERT,
      fragmentShader: FRAG,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: {
        uMix: { value: 0 },
        uTime: { value: 0 },
        uSize: { value: opts.size },
        uPixelRatio: { value: opts.pixelRatio },
        uScatter: { value: 0.55 },
        uOpacity: { value: 1 },
        uHalo: { value: opts.halo },
        uGain: { value: opts.gain },
        uMotionFrom: { value: new THREE.Vector4() },
        uMotionTo: { value: new THREE.Vector4() },
        uLookFrom: { value: new THREE.Vector2(1, 1) },
        uLookTo: { value: new THREE.Vector2(1, 1) },
      },
    });
    this.points = new THREE.Points(g, this.material);
    this.points.frustumCulled = false;
  }

  /** Morph from shape k to shape k + 1. */
  setSegment(k: number) {
    if (k === this.segment) return;
    this.segment = k;
    const a = this.shapeAt(k);
    const b = this.shapeAt(k + 1);
    const set = (name: string, data: Float32Array) => {
      const attr = this.geometry.getAttribute(name) as THREE.BufferAttribute;
      (attr.array as Float32Array).set(data);
      attr.needsUpdate = true;
    };
    set("aFrom", a.pos);
    set("aTo", b.pos);
    set("aFromCol", a.col);
    set("aToCol", b.col);
    const u = this.material.uniforms;
    u.uMotionFrom.value = motionOf(a.meta);
    u.uMotionTo.value = motionOf(b.meta);
    u.uLookFrom.value = lookOf(a.meta);
    u.uLookTo.value = lookOf(b.meta);
  }

  update(mix: number, time: number) {
    this.material.uniforms.uMix.value = mix;
    this.material.uniforms.uTime.value = time;
  }

  setPixelRatio(pr: number) {
    this.material.uniforms.uPixelRatio.value = pr;
  }

  dispose() {
    this.geometry.dispose();
    this.material.dispose();
  }
}
