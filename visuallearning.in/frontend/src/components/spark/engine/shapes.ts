/**
 * The point clouds the particles morph between, one per scene. Every shape
 * has exactly the same number of particles; the last DUST_SHARE of them are a
 * starfield that sits in the same place in every shape, so only the structure
 * flies when the scene changes.
 */
import { Color } from "three";
import {
  BULB, CELL, COIL, DNA, ELEMENTS, EYE, FAMILY_COLOR, LENS, PHOTO, PLATE_TOP, PRISM, WATER,
  dnaAngle, electronDir, elementFamily, elementPos, eyeImageTop, filamentPoint, lensRay, retinaBase,
  leafPoint, nervePoint, prismRayEnd, TABLE, type V3,
} from "./layout";

export type ShapeMeta = {
  /** differential rotation around Y (a galaxy) */
  swirl: number;
  /** rigid rotation around Y, radians per second */
  spin: number;
  /** lean around X after the spin */
  tilt: number;
  /** tiny wander per particle */
  shimmer: number;
  size: number;
  gain: number;
};
export type Shape = { pos: Float32Array; col: Float32Array; meta: ShapeMeta };

export const DUST_SHARE = 0.16;
const DEFAULT_META: ShapeMeta = { swirl: 0, spin: 0, tilt: 0, shimmer: 0.008, size: 1, gain: 1 };

const C = (hex: string) => new Color(hex);

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

/** Deterministic 0..1 per (index, channel): the starfield is the same in every shape. */
function hash(i: number, k: number) {
  let x = Math.imul(i + 0x9e3779b9, 0x85ebca6b) ^ Math.imul(k + 0x27d4eb2f, 0xc2b2ae35);
  x ^= x >>> 15;
  x = Math.imul(x, 0x2c1b3c6d);
  x ^= x >>> 12;
  x = Math.imul(x, 0x297a2d39);
  x ^= x >>> 15;
  return (x >>> 0) / 4294967296;
}

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const lerp3 = (a: V3, b: V3, t: number): V3 => [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];

class Builder {
  readonly pos: Float32Array;
  readonly col: Float32Array;
  readonly cap: number;
  readonly rand: () => number;
  i = 0;

  constructor(readonly n: number, seed: number) {
    this.pos = new Float32Array(n * 3);
    this.col = new Float32Array(n * 3);
    this.cap = n - Math.floor(n * DUST_SHARE);
    this.rand = mulberry(seed);
  }

  /** How many particles a part with this share of the structure gets. */
  share(f: number) {
    return Math.max(1, Math.floor(this.cap * f));
  }

  push(x: number, y: number, z: number, c: Color, gain = 1) {
    if (this.i >= this.cap) return;
    const j = this.i * 3;
    this.pos[j] = x;
    this.pos[j + 1] = y;
    this.pos[j + 2] = z;
    this.col[j] = c.r * gain;
    this.col[j + 1] = c.g * gain;
    this.col[j + 2] = c.b * gain;
    this.i++;
  }

  pushV(p: V3, c: Color, gain = 1) {
    this.push(p[0], p[1], p[2], c, gain);
  }

  gauss() {
    const u = 1 - this.rand();
    const v = this.rand();
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  }

  dir(): V3 {
    const z = this.rand() * 2 - 1;
    const a = this.rand() * Math.PI * 2;
    const r = Math.sqrt(1 - z * z);
    return [r * Math.cos(a), r * Math.sin(a), z];
  }

  /** A point in a ball; falloff > 1 packs points towards the centre. */
  inBall(r: number, falloff = 1): V3 {
    const d = this.dir();
    const rr = r * Math.pow(this.rand(), falloff / 3);
    return [d[0] * rr, d[1] * rr, d[2] * rr];
  }

  /** Points along a segment with a soft round cross-section. */
  segment(a: V3, b: V3, count: number, jitter: number, c: Color | ((t: number) => Color), gain: number | ((t: number) => number) = 1) {
    for (let k = 0; k < count; k++) {
      const t = this.rand();
      const p = lerp3(a, b, t);
      const g = typeof gain === "number" ? gain : gain(t);
      this.push(p[0] + this.gauss() * jitter, p[1] + this.gauss() * jitter, p[2] + this.gauss() * jitter, typeof c === "function" ? c(t) : c, g);
    }
  }

  /** Points along a curve given as a function of t in 0..1. */
  curve(fn: (t: number) => V3, count: number, jitter: number, c: Color | ((t: number) => Color), gain: number | ((t: number) => number) = 1) {
    for (let k = 0; k < count; k++) {
      const t = this.rand();
      const p = fn(t);
      const g = typeof gain === "number" ? gain : gain(t);
      this.push(p[0] + this.gauss() * jitter, p[1] + this.gauss() * jitter, p[2] + this.gauss() * jitter, typeof c === "function" ? c(t) : c, g);
    }
  }

  shell(center: V3, r: number, count: number, thickness: number, c: Color, gain = 1, keep?: (d: V3) => boolean) {
    let placed = 0;
    let guard = 0;
    while (placed < count && guard++ < count * 20) {
      const d = this.dir();
      if (keep && !keep(d)) continue;
      const rr = r + this.gauss() * thickness;
      this.push(center[0] + d[0] * rr, center[1] + d[1] * rr, center[2] + d[2] * rr, c, gain);
      placed++;
    }
  }

  finish(dust: Color, meta: Partial<ShapeMeta>): Shape {
    // Rounding leaves a few structure slots empty: double up on what is there.
    const placed = Math.max(1, this.i);
    while (this.i < this.cap) {
      const src = Math.floor(this.rand() * placed) * 3;
      const j = this.i * 3;
      for (let k = 0; k < 3; k++) {
        this.pos[j + k] = this.pos[src + k] + this.gauss() * 0.02;
        this.col[j + k] = this.col[src + k] * 0.8;
      }
      this.i++;
    }
    // The starfield: same place for every shape, coloured for the scene.
    for (let k = this.cap; k < this.n; k++) {
      const j = k * 3;
      this.pos[j] = (hash(k, 1) - 0.5) * 28;
      this.pos[j + 1] = (hash(k, 2) - 0.5) * 16;
      this.pos[j + 2] = -1.5 - hash(k, 3) * 17;
      const g = 0.08 + 0.6 * Math.pow(hash(k, 4), 4);
      this.col[j] = dust.r * g;
      this.col[j + 1] = dust.g * g;
      this.col[j + 2] = dust.b * g;
    }
    return { pos: this.pos, col: this.col, meta: { ...DEFAULT_META, ...meta } };
  }
}

/* ------------------------------------------------------------------ intro */

function heroShape(n: number): Shape {
  const b = new Builder(n, 11);
  const core = C("#f2fbff");
  const inner = C("#5ce1ff");
  const mid = C("#8b5cf6");
  const outer = C("#3341a8");
  const arms = 3;
  const disc = b.share(0.84);
  for (let i = 0; i < disc; i++) {
    const r = 0.18 + Math.pow(b.rand(), 0.8) * 4.3;
    const spread = b.gauss() * (0.22 + r * 0.07);
    const a = ((i % arms) / arms) * Math.PI * 2 + r * 1.05 + spread / Math.max(r, 0.5);
    const t = Math.min(1, r / 4.3);
    const c =
      t < 0.12 ? core.clone().lerp(inner, t / 0.12)
      : t < 0.55 ? inner.clone().lerp(mid, (t - 0.12) / 0.43)
      : mid.clone().lerp(outer, (t - 0.55) / 0.45);
    b.push(Math.cos(a) * r, b.gauss() * 0.09 * (1 + r * 0.3), Math.sin(a) * r, c, 1.35 - t * 0.85);
  }
  const bulge = b.share(0.16);
  for (let i = 0; i < bulge; i++) b.pushV(b.inBall(0.75, 3.2), core, 1.4);
  return b.finish(C("#8fa6ff"), { swirl: 0.05, spin: 0.07, tilt: 1.08, size: 1.05 });
}

/* ---------------------------------------------------------------- physics */

function prismShape(n: number): Shape {
  const b = new Builder(n, 21);
  const white = C("#f4fbff");
  const glass = C("#7fe6ff");
  const [sx, sy] = PRISM.source;
  const [ex, ey] = PRISM.entry;
  const [xx, xy] = PRISM.exit;
  b.segment([sx, sy, 0], [ex, ey, 0], b.share(0.22), 0.03, white, 1.25);
  b.segment([ex, ey, 0], [xx, xy, 0], b.share(0.05), 0.03, white, 1.1);
  const per = Math.floor(b.share(0.5) / PRISM.rays.length);
  for (const ray of PRISM.rays) {
    const end = prismRayEnd(ray.angle);
    const c = C(ray.color);
    const dx = end[0] - xx;
    const dy = end[1] - xy;
    const len = Math.hypot(dx, dy);
    const px = -dy / len;
    const py = dx / len;
    for (let k = 0; k < per; k++) {
      const t = b.rand();
      const j = 0.02 + 0.07 * t;
      const g = b.gauss() * j;
      b.push(xx + dx * t + px * g, xy + dy * t + py * g, b.gauss() * j, c, 1.45 - 0.55 * t);
    }
  }
  // The prism's edges, front and back, and the three edges joining them.
  const z = PRISM.depth / 2;
  const tri = [PRISM.apex, PRISM.left, PRISM.right];
  const edge = b.share(0.13) / 9;
  for (let k = 0; k < 3; k++) {
    const p = tri[k];
    const q = tri[(k + 1) % 3];
    b.segment([p[0], p[1], z], [q[0], q[1], z], edge, 0.008, glass, 0.85);
    b.segment([p[0], p[1], -z], [q[0], q[1], -z], edge, 0.008, glass, 0.55);
    b.segment([p[0], p[1], z], [p[0], p[1], -z], edge, 0.008, glass, 0.7);
  }
  // A faint glow inside the glass.
  const fill = b.share(0.08);
  for (let k = 0; k < fill; k++) {
    let u = b.rand();
    let v = b.rand();
    if (u + v > 1) {
      u = 1 - u;
      v = 1 - v;
    }
    const x = PRISM.apex[0] + u * (PRISM.left[0] - PRISM.apex[0]) + v * (PRISM.right[0] - PRISM.apex[0]);
    const y = PRISM.apex[1] + u * (PRISM.left[1] - PRISM.apex[1]) + v * (PRISM.right[1] - PRISM.apex[1]);
    b.push(x, y, (b.rand() - 0.5) * PRISM.depth, glass, 0.18);
  }
  return b.finish(C("#5ce1ff"), { size: 0.9 });
}

function lensShape(n: number): Shape {
  const b = new Builder(n, 31);
  const ray = C("#bff4ff");
  const hot = C("#ffffff");
  const per = Math.floor(b.share(0.6) / LENS.heights.length);
  for (const h of LENS.heights) {
    const [s, l, e] = lensRay(h);
    b.segment([s[0], s[1], 0], [l[0], l[1], 0], Math.floor(per * 0.45), 0.018, ray, 0.95);
    // Brightest where the rays meet at the focus.
    b.segment([l[0], l[1], 0], [e[0], e[1], 0], Math.floor(per * 0.55), 0.018, (t) => (Math.abs(t * LENS.endX - LENS.focal) < 0.5 ? hot : ray), (t) => {
      const x = t * LENS.endX;
      return 0.75 + 1.1 * Math.exp(-((x - LENS.focal) ** 2) / 0.35);
    });
  }
  b.segment([LENS.startX - 0.3, 0, 0], [LENS.endX + 0.4, 0, 0], b.share(0.05), 0.006, C("#5ce1ff"), 0.4);
  // Glass: the two curved faces of the lens.
  const glass = b.share(0.2);
  for (let k = 0; k < glass; k++) {
    const rho = LENS.aperture * Math.sqrt(b.rand());
    const phi = b.rand() * Math.PI * 2;
    const a = (LENS.thickness / 2) * (1 - (rho / LENS.aperture) ** 2) * (b.rand() < 0.5 ? -1 : 1);
    b.push(a, rho * Math.cos(phi), rho * Math.sin(phi), C("#7fe6ff"), 0.35 + 0.5 * (rho / LENS.aperture) ** 3);
  }
  // F and 2F on both sides.
  const marks = Math.floor(b.share(0.05) / 4);
  for (const x of [-2 * LENS.focal, -LENS.focal, LENS.focal, 2 * LENS.focal]) {
    for (let k = 0; k < marks; k++) {
      const p = b.inBall(0.09, 2.5);
      b.push(x + p[0], p[1], p[2], x === LENS.focal ? hot : ray, 1.2);
    }
  }
  return b.finish(C("#4cc9f0"), { size: 0.85 });
}

function photoShape(n: number): Shape {
  const b = new Builder(n, 41);
  // The metal surface as a lattice of atoms.
  const steel = C("#a9c1d9");
  const lattice = b.share(0.25);
  const step = 0.17;
  const cols = Math.floor(PHOTO.plateW / step);
  const rows = Math.floor(PHOTO.plateD / step);
  for (let k = 0; k < lattice; k++) {
    const i = Math.floor(b.rand() * cols);
    const j = Math.floor(b.rand() * rows);
    const x = -PHOTO.plateW / 2 + (i + 0.5) * step;
    const z = -PHOTO.plateD / 2 + (j + 0.5) * step;
    b.push(x + b.gauss() * 0.018, PLATE_TOP + 0.02 + b.gauss() * 0.012, z + b.gauss() * 0.018, steel, 0.5);
  }
  // Photons: wave packets of high-frequency light heading for the plate.
  const violet = C("#a594ff");
  const blue = C("#6fd8ff");
  const [dx, dy, dz] = PHOTO.photonDir;
  const perpLen = Math.hypot(dy, dx);
  const px = -dy / perpLen;
  const py = dx / perpLen;
  const perLine = Math.floor(b.share(0.44) / PHOTO.impacts.length);
  PHOTO.impacts.forEach(([ix, iz], k) => {
    for (let q = 0; q < perLine; q++) {
      const s = b.rand() * 5.2;
      const env = Math.exp(-((s - 1.3 - 0.15 * k) ** 2) / 0.5) + Math.exp(-((s - 3.6) ** 2) / 0.6);
      const wave = Math.sin(s * 19 + k) * 0.17 * env;
      const x = ix - dx * s + px * wave;
      const y = PLATE_TOP - dy * s + py * wave;
      const z = iz - dz * s;
      b.push(x + b.gauss() * 0.012, y + b.gauss() * 0.012, z, violet.clone().lerp(blue, (s / 5.2) * 0.8), 0.35 + 1.25 * env);
    }
  });
  // Electrons knocked out of the surface.
  const cyan = C("#7af3ff");
  const perSpray = Math.floor(b.share(0.24) / PHOTO.impacts.length);
  PHOTO.impacts.forEach(([ix, iz], k) => {
    const d = electronDir(k);
    for (let q = 0; q < perSpray; q++) {
      const s = 0.15 + Math.pow(b.rand(), 1.6) * 3.1;
      const spread = 0.05 + s * 0.06;
      b.push(ix + d[0] * s + b.gauss() * spread, PLATE_TOP + d[1] * s + b.gauss() * spread, iz + d[2] * s + b.gauss() * spread, cyan, 1.3 - s * 0.25);
    }
  });
  const flash = Math.floor(b.share(0.06) / PHOTO.impacts.length);
  for (const [ix, iz] of PHOTO.impacts) {
    for (let q = 0; q < flash; q++) {
      const p = b.inBall(0.16, 2.6);
      b.push(ix + p[0], PLATE_TOP + Math.abs(p[1]) * 0.6, iz + p[2], C("#ffffff"), 1.5);
    }
  }
  return b.finish(C("#7c8cff"), { size: 0.85, gain: 0.8 });
}

/** Field lines of a short bar magnet: two poles near the coil ends, traced outside the coil. */
function traceFieldLine(alpha: number): V3[] {
  const a = COIL.length / 2 - 0.25;
  let x = a + Math.cos(alpha) * 0.12;
  let y = Math.sin(alpha) * 0.12;
  const pts: V3[] = [];
  for (let step = 0; step < 900; step++) {
    const r1x = x - a;
    const r2x = x + a;
    const d1 = Math.pow(r1x * r1x + y * y, 1.5);
    const d2 = Math.pow(r2x * r2x + y * y, 1.5);
    let bx = r1x / d1 - r2x / d2;
    let by = y / d1 - y / d2;
    const l = Math.hypot(bx, by) || 1;
    bx /= l;
    by /= l;
    x += bx * 0.03;
    y += by * 0.03;
    if (Math.hypot(x + a, y) < 0.14 || Math.hypot(x, y) > 7.5) break;
    // Inside the windings the field is drawn separately.
    if (!(Math.abs(x) < COIL.length / 2 && Math.abs(y) < COIL.radius)) pts.push([x, y, 0]);
  }
  return pts;
}

function coilShape(n: number): Shape {
  const b = new Builder(n, 51);
  const field = C("#7fe9ff");
  const hot = C("#e8fbff");
  const lines: V3[][] = [];
  for (const alpha of [0.2, 0.42, 0.66, 0.92, 1.18, 1.42]) lines.push(traceFieldLine(alpha));
  const angles = 8;
  const total = lines.reduce((s, l) => s + l.length, 0) * angles;
  const budget = b.share(0.66);
  for (const line of lines) {
    for (let k = 0; k < angles; k++) {
      const phi = (k / angles) * Math.PI * 2 + 0.2;
      const count = Math.floor((budget * line.length) / total);
      for (let q = 0; q < count; q++) {
        const p = line[Math.floor(b.rand() * line.length)];
        const rho = p[1];
        // Strongest near the poles.
        const near = Math.min(Math.hypot(p[0] - COIL.length / 2, rho), Math.hypot(p[0] + COIL.length / 2, rho));
        const g = 0.35 + 1.1 / (1 + near * 1.6);
        b.push(p[0] + b.gauss() * 0.012, rho * Math.cos(phi) + b.gauss() * 0.012, rho * Math.sin(phi) + b.gauss() * 0.012, near < 0.6 ? hot : field, g);
      }
    }
  }
  // Inside the coil: a strong, uniform field along the axis.
  const inside = Math.floor(b.share(0.16) / 13);
  for (const rho of [0, 0.28, 0.56]) {
    for (let k = 0; k < (rho === 0 ? 1 : 6); k++) {
      const phi = (k / 6) * Math.PI * 2;
      b.segment([-COIL.length / 2 - 0.2, rho * Math.cos(phi), rho * Math.sin(phi)], [COIL.length / 2 + 0.2, rho * Math.cos(phi), rho * Math.sin(phi)], inside, 0.01, hot, 1.05);
    }
  }
  return b.finish(C("#6aa9ff"), { size: 0.8, shimmer: 0.006, gain: 0.85 });
}

/* -------------------------------------------------------------- chemistry */

function atomShape(n: number): Shape {
  const b = new Builder(n, 61);
  const s1 = C("#fff4d6");
  const s2 = C("#ffd38a");
  const p2 = C("#f59e0b");
  const d3 = C("#ff7a3c");
  const s4 = C("#ffe2a8");
  const shell = (count: number, r: number, sd: number, c: Color, gain: number) => {
    for (let k = 0; k < count; k++) {
      const d = b.dir();
      const rr = r + Math.abs(b.gauss()) * sd;
      b.push(d[0] * rr, d[1] * rr, d[2] * rr, c, gain);
    }
  };
  shell(b.share(0.12), 0.44, 0.22, s1, 1.25);
  shell(b.share(0.1), 1.0, 0.14, s2, 0.6);
  // 2p: three dumbbells along x, y and z.
  const axes: V3[] = [[1, 0, 0], [0, 1, 0], [0, 0, 1]];
  const pEach = Math.floor(b.share(0.36) / 3);
  for (const ax of axes) {
    let placed = 0;
    while (placed < pEach) {
      const d = b.dir();
      const c = d[0] * ax[0] + d[1] * ax[1] + d[2] * ax[2];
      if (b.rand() > c * c) continue;
      const rr = 0.5 + Math.abs(b.gauss()) * 0.75;
      b.push(d[0] * rr, d[1] * rr, d[2] * rr, p2, 0.95);
      placed++;
    }
  }
  // 3d: a four-lobed cloud in the x-y plane.
  const dCount = b.share(0.2);
  let placed = 0;
  while (placed < dCount) {
    const d = b.dir();
    const sin2 = 1 - d[2] * d[2];
    const phi = Math.atan2(d[1], d[0]);
    const amp = sin2 * Math.cos(2 * phi);
    if (b.rand() > amp * amp) continue;
    const rr = 1.5 + Math.abs(b.gauss()) * 0.6;
    b.push(d[0] * rr, d[1] * rr, d[2] * rr, d3, 0.8);
    placed++;
  }
  shell(b.share(0.1), 2.85, 0.35, s4, 0.38);
  return b.finish(C("#ffb347"), { spin: 0.14, tilt: 0.45, size: 0.95, gain: 0.95 });
}

function waterShape(n: number): Shape {
  const b = new Builder(n, 71);
  const o = C("#ff6b4a");
  const h = C("#fff1c1");
  const shared = C("#ffd28a");
  const lone = C("#ff9a3c");
  b.shell(WATER.O, 0.66, b.share(0.22), 0.13, o, 0.7);
  b.shell(WATER.H1, 0.44, b.share(0.1), 0.08, h, 0.65);
  b.shell(WATER.H2, 0.44, b.share(0.1), 0.08, h, 0.65);
  // The shared pairs: dense clouds along each bond.
  for (const H of [WATER.H1, WATER.H2]) {
    const count = b.share(0.17);
    for (let k = 0; k < count; k++) {
      const p = lerp3(WATER.O, H, 0.28 + b.rand() * 0.5);
      b.push(p[0] + b.gauss() * 0.11, p[1] + b.gauss() * 0.11, p[2] + b.gauss() * 0.11, shared, 1.15);
    }
  }
  // Two lone pairs on oxygen, out of the plane of the molecule.
  for (const side of [-1, 1]) {
    const count = b.share(0.1);
    const c: V3 = [WATER.O[0], WATER.O[1] + 0.42, WATER.O[2] + side * 0.5];
    for (let k = 0; k < count; k++) b.push(c[0] + b.gauss() * 0.13, c[1] + b.gauss() * 0.16, c[2] + b.gauss() * 0.13, lone, 0.85);
  }
  return b.finish(C("#ffb065"), { size: 0.85, shimmer: 0.012, gain: 0.42 });
}

function reactionShape(n: number): Shape {
  const b = new Builder(n, 81);
  const carbon = C("#cdb9a3");
  const hydrogen = C("#fff6e5");
  const oxygen = C("#ff6b4a");
  type Atom = [number, number, number, Color];
  const molecules: Atom[][] = [
    // CH4: carbon and four hydrogens
    [[0, 0, 0, carbon], [0.13, 0.13, 0.13, hydrogen], [-0.13, -0.13, 0.13, hydrogen], [-0.13, 0.13, -0.13, hydrogen], [0.13, -0.13, -0.13, hydrogen]],
    // O2
    [[-0.08, 0, 0, oxygen], [0.08, 0, 0, oxygen]],
    [[-0.08, 0, 0, oxygen], [0.08, 0, 0, oxygen]],
    // CO2
    [[0, 0, 0, carbon], [-0.15, 0, 0, oxygen], [0.15, 0, 0, oxygen]],
    // H2O
    [[0, 0, 0, oxygen], [-0.12, -0.09, 0, hydrogen], [0.12, -0.09, 0, hydrogen]],
  ];
  const budget = b.share(0.82);
  const perAtom = 7;
  let used = 0;
  let m = 0;
  while (used < budget) {
    const mol = molecules[m++ % molecules.length];
    const R = 1.5 + Math.pow(b.rand(), 0.8) * 2.4;
    const a = b.rand() * Math.PI * 2;
    const cx = Math.cos(a) * R;
    const cz = Math.sin(a) * R;
    const cy = -1.2 + b.rand() * 3.2;
    const rot = b.rand() * Math.PI * 2;
    for (const [ax, ay, az, c] of mol) {
      const x = ax * Math.cos(rot) - az * Math.sin(rot);
      const z = ax * Math.sin(rot) + az * Math.cos(rot);
      for (let k = 0; k < perAtom; k++) b.push(cx + x + b.gauss() * 0.025, cy + ay + b.gauss() * 0.025, cz + z + b.gauss() * 0.025, c, 0.95);
      used += perAtom;
    }
  }
  // Embers above the flame.
  const ember = C("#ffae42");
  const embers = b.share(0.18);
  for (let k = 0; k < embers; k++) b.push(b.gauss() * 0.5, 1.2 + b.rand() * 2.0, b.gauss() * 0.5, ember, 0.5 + b.rand() * 0.6);
  return b.finish(C("#ff9f43"), { swirl: 0.28, spin: 0.04, tilt: 0.14, size: 0.85, shimmer: 0.01, gain: 0.62 });
}

function tableShape(n: number): Shape {
  const b = new Builder(n, 91);
  const s = TABLE.cell * TABLE.scale;
  const per = Math.floor(b.share(0.86) / ELEMENTS.length);
  for (let z = 1; z <= ELEMENTS.length; z++) {
    const [x, y] = elementPos(z);
    const c = C(FAMILY_COLOR[elementFamily(z)]);
    for (let k = 0; k < per; k++) {
      // Most points trace the tile's edge, a few sit inside it.
      const edge = b.rand() < 0.7;
      let u = b.rand() - 0.5;
      let v = b.rand() - 0.5;
      if (edge) {
        if (b.rand() < 0.5) u = u < 0 ? -0.5 : 0.5;
        else v = v < 0 ? -0.5 : 0.5;
      }
      b.push(x + u * s * 0.88, y + v * s * 0.88, b.gauss() * 0.01, z === TABLE.copper ? C("#7af3ff") : c, edge ? 0.55 : 0.22);
    }
  }
  return b.finish(C("#ffb35c"), { size: 0.7, shimmer: 0.004, gain: 0.8 });
}

/* ---------------------------------------------------------------- biology */

function leafShape(n: number): Shape {
  const b = new Builder(n, 101);
  const edge = C("#6ee7b7");
  const rib = C("#e2fbb0");
  const vein = C("#a3e635");
  const blade = C("#10b981");
  const spark = C("#d9ffe6");
  for (const side of [-1, 1]) b.curve((t) => leafPoint(0.06 + t * 0.94, side), b.share(0.11), 0.012, edge, 0.95);
  b.curve((t) => leafPoint(-0.1 + t * 1.08, 0), b.share(0.1), 0.01, rib, 1.1);
  const pairs = 9;
  const veinEach = Math.floor(b.share(0.26) / (pairs * 2));
  for (let k = 0; k < pairs; k++) {
    const s0 = 0.12 + k * 0.085;
    const s1 = Math.min(0.98, s0 + 0.15);
    for (const side of [-1, 1]) {
      b.curve((t) => leafPoint(s0 + (s1 - s0) * Math.pow(t, 1.4), side * t * 0.94), veinEach, 0.008, vein, (t) => 0.95 - t * 0.35);
    }
  }
  const fill = b.share(0.3);
  for (let k = 0; k < fill; k++) {
    const s = 0.08 + b.rand() * 0.9;
    const w = (b.rand() * 2 - 1) * 0.97;
    b.pushV(leafPoint(s, w), blade, 0.3);
  }
  const chloro = b.share(0.1);
  for (let k = 0; k < chloro; k++) {
    const p = leafPoint(0.1 + b.rand() * 0.85, (b.rand() * 2 - 1) * 0.9);
    b.push(p[0], p[1], p[2] + 0.01, spark, 0.6 + b.rand() * 0.9);
  }
  return b.finish(C("#7ee8b0"), { size: 0.85 });
}

function superellipsoid(d: V3, scale = 1): V3 {
  const [hx, hy, hz] = CELL.half;
  const p = CELL.power;
  const t = Math.pow(Math.abs(d[0] / hx) ** p + Math.abs(d[1] / hy) ** p + Math.abs(d[2] / hz) ** p, -1 / p) * scale;
  return [d[0] * t, d[1] * t, d[2] * t];
}

function cellShape(n: number): Shape {
  const b = new Builder(n, 111);
  const membrane = b.share(0.26);
  for (let k = 0; k < membrane; k++) b.pushV(superellipsoid(b.dir(), 1 + b.gauss() * 0.008), C("#5eead4"), 0.7);
  const wall = b.share(0.12);
  for (let k = 0; k < wall; k++) b.pushV(superellipsoid(b.dir(), 1.07), C("#34d399"), 0.42);
  b.shell(CELL.nucleus.pos, CELL.nucleus.r, b.share(0.12), 0.02, C("#c4b5fd"), 0.9);
  const nucleolus = b.share(0.04);
  for (let k = 0; k < nucleolus; k++) {
    const p = b.inBall(0.2, 2);
    b.push(CELL.nucleus.pos[0] + 0.12 + p[0], CELL.nucleus.pos[1] + 0.05 + p[1], CELL.nucleus.pos[2] + p[2], C("#ede9fe"), 1.2);
  }
  // Endoplasmic reticulum: folded sheets wrapped around the nucleus.
  const er = b.share(0.1);
  for (let k = 0; k < er; k++) {
    const d = b.dir();
    if (d[0] > 0.35) continue;
    const layer = Math.floor(b.rand() * 3);
    const rr = CELL.nucleus.r + 0.18 + layer * 0.14 + 0.05 * Math.sin(Math.atan2(d[1], d[2]) * 7);
    b.push(CELL.nucleus.pos[0] + d[0] * rr, CELL.nucleus.pos[1] + d[1] * rr, CELL.nucleus.pos[2] + d[2] * rr, C("#93c5fd"), 0.55);
  }
  b.shell(CELL.vacuole.pos, CELL.vacuole.r, b.share(0.08), 0.015, C("#a5f3fc"), 0.32);
  // Cytoplasm: ribosomes and other granules, outside the vacuole and nucleus.
  const grains = b.share(0.2);
  let placed = 0;
  let guard = 0;
  while (placed < grains && guard++ < grains * 10) {
    const p = superellipsoid(b.dir(), Math.pow(b.rand(), 0.5) * 0.94);
    const dv = Math.hypot(p[0] - CELL.vacuole.pos[0], p[1] - CELL.vacuole.pos[1], p[2] - CELL.vacuole.pos[2]);
    const dn = Math.hypot(p[0] - CELL.nucleus.pos[0], p[1] - CELL.nucleus.pos[1], p[2] - CELL.nucleus.pos[2]);
    if (dv < CELL.vacuole.r || dn < CELL.nucleus.r + 0.1) continue;
    b.pushV(p, C("#99f6e4"), 0.38);
    placed++;
  }
  return b.finish(C("#5eead4"), { spin: CELL.spin, tilt: CELL.tilt, size: 0.78, gain: 0.8 });
}

const BASE_COLOR: Record<string, string> = { A: "#fbbf24", T: "#fb7185", G: "#22d3ee", C: "#a78bfa" };
const PAIR: Record<string, string> = { A: "T", T: "A", G: "C", C: "G" };

export function dnaRung(k: number): { y: number; a: V3; b: V3; base: string; pair: string } {
  const y = -DNA.height / 2 + 0.25 + (k * (DNA.height - 0.5)) / (DNA.rungs - 1);
  const th = dnaAngle(y);
  const base = DNA.sequence[k % DNA.sequence.length];
  return {
    y,
    a: [DNA.radius * Math.cos(th), y, DNA.radius * Math.sin(th)],
    b: [DNA.radius * Math.cos(th + DNA.offset), y, DNA.radius * Math.sin(th + DNA.offset)],
    base,
    pair: PAIR[base],
  };
}
export const dnaBaseColor = (base: string) => BASE_COLOR[base];

function dnaShape(n: number): Shape {
  const b = new Builder(n, 121);
  const strand = (offset: number, c: Color) =>
    b.curve((t) => {
      const y = -DNA.height / 2 + t * DNA.height;
      const th = dnaAngle(y) + offset;
      return [DNA.radius * Math.cos(th), y, DNA.radius * Math.sin(th)];
    }, b.share(0.25), 0.045, c, 0.9);
  strand(0, C("#34d399"));
  strand(DNA.offset, C("#a3e635"));
  const per = Math.floor(b.share(0.36) / DNA.rungs);
  for (let k = 0; k < DNA.rungs; k++) {
    const r = dnaRung(k);
    const mid = lerp3(r.a, r.b, 0.5);
    b.segment(r.a, mid, Math.floor(per / 2), 0.02, C(BASE_COLOR[r.base]), 0.95);
    b.segment(mid, r.b, Math.floor(per / 2), 0.02, C(BASE_COLOR[r.pair]), 0.95);
  }
  const nodes = Math.floor(b.share(0.08) / (DNA.rungs * 2));
  for (let k = 0; k < DNA.rungs; k++) {
    const r = dnaRung(k);
    for (const end of [r.a, r.b]) {
      for (let q = 0; q < nodes; q++) {
        const p = b.inBall(0.08, 2);
        b.push(end[0] + p[0], end[1] + p[1], end[2] + p[2], C("#ecfccb"), 1.25);
      }
    }
  }
  return b.finish(C("#6ee7b7"), { spin: DNA.spin, tilt: DNA.tilt, size: 0.8, gain: 0.78 });
}

function eyeShape(n: number): Shape {
  const b = new Builder(n, 131);
  const [cx, cy, cz] = EYE.center;
  const R = EYE.radius;
  // The white of the eye, open at the front.
  b.shell(EYE.center, R, b.share(0.24), 0.01, C("#e0f2fe"), 0.45, (d) => d[0] > -0.8);
  // Retina lining the back.
  b.shell(EYE.center, R * 0.965, b.share(0.13), 0.008, C("#fb7185"), 0.8, (d) => d[0] > 0.2);
  // Cornea: the clear bulge at the front.
  b.shell([cx - 0.62, cy, cz], 0.88, b.share(0.06), 0.008, C("#a5f3fc"), 0.65, (d) => d[0] < -0.6);
  // Iris: radial fibres around the pupil.
  const iris = b.share(0.14);
  const irisX = cx - R * 0.83;
  for (let k = 0; k < iris; k++) {
    const fibre = Math.floor(b.rand() * 90);
    const phi = (fibre / 90) * Math.PI * 2 + b.gauss() * 0.02;
    const rho = 0.27 + b.rand() * 0.5;
    const c = C("#92400e").lerp(C("#fbbf24"), Math.pow((rho - 0.27) / 0.5, 0.8));
    b.push(irisX + b.gauss() * 0.01, rho * Math.cos(phi), rho * Math.sin(phi), c, 0.55 + 0.6 * b.rand());
  }
  // Light from the top of the object, through the lens, to an inverted image.
  const top: V3 = [EYE.object.x, EYE.object.h, 0];
  const img = eyeImageTop();
  const image: V3 = [img[0], img[1], 0];
  const ray = C("#e9fbff");
  const rays = Math.floor(b.share(0.14) / 3);
  for (const ly of [EYE.object.h, 0, -0.42]) {
    const atLens: V3 = [EYE.lens.x, ly * 0.55, 0];
    b.segment(top, atLens, Math.floor(rays * 0.6), 0.012, ray, 0.85);
    b.segment(atLens, image, Math.floor(rays * 0.4), 0.012, ray, 1.0);
  }
  b.segment([EYE.object.x, 0, 0], top, b.share(0.025), 0.015, C("#ffffff"), 1.3);
  const base = retinaBase();
  b.segment([base[0], base[1], 0], image, b.share(0.012), 0.012, C("#ffffff"), 1.4);
  // Optic nerve: a bundle of fibres leaving the back of the eye.
  const nerve = b.share(0.12);
  for (let k = 0; k < nerve; k++) {
    const t = b.rand();
    const p = nervePoint(t);
    const a = b.rand() * Math.PI * 2;
    const rr = 0.2 * Math.sqrt(b.rand()) * (1 - t * 0.35);
    b.push(p[0], p[1] + Math.cos(a) * rr, p[2] + Math.sin(a) * rr, C("#fde68a"), 0.55);
  }
  return b.finish(C("#86efac"), { size: 0.8, gain: 0.85 });
}

/* ----------------------------------------------------------------- finale */

export function bulbRadius(y: number): number {
  const cy = BULB.center[1];
  const join = cy - 0.55;
  if (y >= join) return Math.sqrt(Math.max(0, BULB.r * BULB.r - (y - cy) ** 2));
  const t = (y - BULB.neckY) / (join - BULB.neckY);
  const atJoin = Math.sqrt(BULB.r * BULB.r - 0.55 * 0.55);
  const s = t * t * (3 - 2 * t);
  return BULB.neckR + (atJoin - BULB.neckR) * s;
}

function bulbShape(n: number): Shape {
  const b = new Builder(n, 141);
  const top = BULB.center[1] + BULB.r;
  const glass = b.share(0.3);
  let placed = 0;
  while (placed < glass) {
    const y = BULB.neckY + b.rand() * (top - BULB.neckY);
    const r = bulbRadius(y);
    if (b.rand() > r / BULB.r) continue;
    const a = b.rand() * Math.PI * 2;
    b.push(Math.cos(a) * r, y, Math.sin(a) * r, C("#ddd6fe"), 0.42);
    placed++;
  }
  // The screw base, with its thread.
  const base = b.share(0.14);
  for (let k = 0; k < base; k++) {
    const y = BULB.baseBottom + 0.12 + b.rand() * (BULB.neckY - BULB.baseBottom - 0.12);
    const r = BULB.neckR * 0.98 + 0.045 * Math.sin(y * 26);
    const a = b.rand() * Math.PI * 2;
    b.push(Math.cos(a) * r, y, Math.sin(a) * r, C("#fcd34d"), 0.5);
  }
  const tip = b.share(0.02);
  for (let k = 0; k < tip; k++) {
    const p = b.inBall(0.16, 1);
    b.push(p[0], BULB.baseBottom + Math.abs(p[1]) * 0.6, p[2], C("#fde68a"), 0.7);
  }
  b.curve(filamentPoint, b.share(0.18), 0.012, C("#fff4cf"), 2.1);
  // Two support wires.
  const left = filamentPoint(0);
  const right = filamentPoint(1);
  b.segment(left, [left[0] * 0.6, BULB.neckY + 0.05, 0], b.share(0.025), 0.008, C("#fde68a"), 0.75);
  b.segment(right, [right[0] * 0.6, BULB.neckY + 0.05, 0], b.share(0.025), 0.008, C("#fde68a"), 0.75);
  const halo = b.share(0.1);
  for (let k = 0; k < halo; k++) {
    const p = b.inBall(0.75, 2.2);
    b.push(p[0], BULB.filamentY + p[1], p[2], C("#fbbf24"), 0.32);
  }
  // Rays of light leaving the bulb.
  const rays = 14;
  const per = Math.floor(b.share(0.14) / rays);
  for (let k = 0; k < rays; k++) {
    const a = (k / rays) * Math.PI * 2 + 0.1;
    const d: V3 = [Math.cos(a), Math.sin(a), 0];
    const from: V3 = [d[0] * 1.75, BULB.center[1] + d[1] * 1.75, 0];
    const to: V3 = [d[0] * 3.3, BULB.center[1] + d[1] * 3.3, 0];
    if (from[1] < -0.2) continue; // not through the base
    b.segment(from, to, per, 0.015, C("#c4b5fd"), (t) => 0.75 - t * 0.5);
  }
  return b.finish(C("#c4b5fd"), { size: 0.85, gain: 0.55 });
}

/** Rounded triangle path for the logo. */
function roundedTriangle(ctx: CanvasRenderingContext2D, cx: number, cy: number, size: number, rotation: number, radius: number) {
  const pts: [number, number][] = [0, 1, 2].map((k) => {
    const a = rotation + (k * Math.PI * 2) / 3;
    return [cx + Math.cos(a) * size, cy + Math.sin(a) * size];
  });
  ctx.beginPath();
  const mid = (p: [number, number], q: [number, number]): [number, number] => [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2];
  const start = mid(pts[0], pts[1]);
  ctx.moveTo(start[0], start[1]);
  for (let k = 1; k <= 3; k++) {
    const p = pts[k % 3];
    const q = pts[(k + 1) % 3];
    ctx.arcTo(p[0], p[1], mid(p, q)[0], mid(p, q)[1], radius);
  }
  ctx.closePath();
}

function logoShape(n: number, font: string): Shape {
  const b = new Builder(n, 151);
  const S = 520;
  const canvas = document.createElement("canvas");
  canvas.width = S;
  canvas.height = S;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return b.finish(C("#c4b5fd"), {});
  const grad = (x0: number, y0: number, x1: number, y1: number, a: string, z: string) => {
    const g = ctx.createLinearGradient(x0, y0, x1, y1);
    g.addColorStop(0, a);
    g.addColorStop(1, z);
    return g;
  };
  // Layers are told apart by colour: blue, orange-yellow, yellow, then the violet play shape.
  ctx.fillStyle = grad(150, 60, 420, 470, "#2d7fd3", "#2aa9e2");
  roundedTriangle(ctx, 275, 255, 200, 1.35, 60);
  ctx.fill();
  ctx.fillStyle = grad(80, 200, 450, 160, "#f0700f", "#f9c21d");
  roundedTriangle(ctx, 255, 245, 205, -0.42, 62);
  ctx.fill();
  ctx.fillStyle = grad(150, 380, 380, 470, "#f6a417", "#fbd326");
  roundedTriangle(ctx, 245, 300, 160, 0.62, 50);
  ctx.fill();
  ctx.fillStyle = grad(130, 120, 380, 420, "#b773ea", "#8e3fb9");
  roundedTriangle(ctx, 268, 262, 205, 0, 64);
  ctx.fill();
  ctx.fillStyle = "#ffffff";
  ctx.font = `700 150px ${font}`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("vl", 245, 262);

  const data = ctx.getImageData(0, 0, S, S).data;
  const letters: number[] = [];
  const violet: number[] = [];
  const petals: number[] = [];
  for (let p = 0; p < S * S; p++) {
    const j = p * 4;
    if (data[j + 3] < 200) continue;
    const r = data[j];
    const g = data[j + 1];
    const bl = data[j + 2];
    if (r > 235 && g > 235 && bl > 235) letters.push(p);
    else if (bl > 150 && r > 110 && g < 150) violet.push(p);
    else petals.push(p);
  }
  const place = (list: number[], count: number, z: (p: number) => number, gain: number) => {
    if (!list.length) return;
    for (let k = 0; k < count; k++) {
      const p = list[Math.floor(b.rand() * list.length)];
      const j = p * 4;
      const x = ((p % S) / S - 0.5) * 4.8;
      const y = -(Math.floor(p / S) / S - 0.5) * 4.8;
      const c = new Color().setRGB(data[j] / 255, data[j + 1] / 255, data[j + 2] / 255, "srgb");
      b.push(x + b.gauss() * 0.006, y + b.gauss() * 0.006, z(p) + b.gauss() * 0.02, c, gain);
    }
  };
  place(letters, b.share(0.2), () => 0.16, 1.5);
  place(violet, b.share(0.42), () => 0, 0.85);
  place(petals, b.share(0.38), (p) => -0.25 - ((data[p * 4 + 2] > 150 ? 1 : 0) * 0.12), 0.8);
  return b.finish(C("#c4b5fd"), { size: 0.85, shimmer: 0.005, gain: 0.78 });
}

/* ------------------------------------------------------------------ index */

export const SHAPE_COUNT = 15;

export function buildShape(k: number, n: number, font: string): Shape {
  switch (k) {
    case 0: return heroShape(n);
    case 1: return prismShape(n);
    case 2: return lensShape(n);
    case 3: return photoShape(n);
    case 4: return coilShape(n);
    case 5: return atomShape(n);
    case 6: return waterShape(n);
    case 7: return reactionShape(n);
    case 8: return tableShape(n);
    case 9: return leafShape(n);
    case 10: return cellShape(n);
    case 11: return dnaShape(n);
    case 12: return eyeShape(n);
    case 13: return bulbShape(n);
    default: return logoShape(n, font);
  }
}

