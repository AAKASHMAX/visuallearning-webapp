/**
 * Per-scene staging for the engine: where the camera looks from, how much of
 * the scene must stay in view, the background light, and where the spark is.
 */
import { CELL, DNA, FLAME, LENS, PHOTO, PLATE_TOP, PRISM, TABLE, WATER, BULB, dnaWaveY, electronDir, elementPos, leafPoint, nervePoint, type V3 } from "./layout";

export type Palette = { top: string; bottom: string; glow: string; strength: number };

const INTRO: Palette = { top: "#04050f", bottom: "#0b0f2c", glow: "#6d3df5", strength: 0.3 };
const PHYSICS: Palette = { top: "#020a14", bottom: "#05172a", glow: "#00a8f0", strength: 0.13 };
const CHEMISTRY: Palette = { top: "#0d0603", bottom: "#200f08", glow: "#ff8f1c", strength: 0.11 };
const BIOLOGY: Palette = { top: "#020e09", bottom: "#05201a", glow: "#12b884", strength: 0.11 };
const FINALE: Palette = { top: "#06041a", bottom: "#150a2e", glow: "#9d4cf0", strength: 0.2 };

export type BeatView = {
  cam: V3;
  look: V3;
  /** world width / height that must stay in view */
  fitW: number;
  fitH: number;
  /** camera yaw across the beat, radians (scroll-linked) */
  orbit: number;
  /** how far right the scene sits on wide screens, as a share of the width */
  shift: number;
  bg: Palette;
  bloom: number;
  sparkColor: string;
  spark: (t: number) => V3;
};

const bob = (p: V3, t: number, a = 0.05): V3 => [p[0], p[1] + Math.sin(t * 1.7) * a, p[2] + Math.cos(t * 1.3) * a * 0.6];

/** Rotate like the particle shader: spin about Y, then tilt about X. */
function spinTilt(p: V3, spin: number, tilt: number): V3 {
  const c = Math.cos(spin);
  const s = Math.sin(spin);
  const x = c * p[0] + s * p[2];
  const z = -s * p[0] + c * p[2];
  const ct = Math.cos(tilt);
  const st = Math.sin(tilt);
  return [x, ct * p[1] - st * z, st * p[1] + ct * z];
}

export const BEAT_VIEWS: BeatView[] = [
  // 0 - the spark in a galaxy of particles
  { cam: [0, 1.0, 11], look: [0, 0, 0], fitW: 8.8, fitH: 5.5, orbit: 0.1, shift: 0.13, bg: INTRO, bloom: 1.05, sparkColor: "#d6ecff", spark: (t) => bob([0, 0, 0], t, 0.03) },
  // 1 - prism
  { cam: [-1.3, 0.5, 10.6], look: [0.4, -0.45, 0], fitW: 6.8, fitH: 4.4, orbit: 0.12, shift: 0.15, bg: PHYSICS, bloom: 1, sparkColor: "#ffffff", spark: (t) => bob([PRISM.entry[0], PRISM.entry[1], 0.05], t, 0.02) },
  // 2 - lens
  { cam: [0.6, 0.45, 11], look: [0.3, 0, 0], fitW: 9.6, fitH: 4.2, orbit: 0.12, shift: 0.12, bg: PHYSICS, bloom: 1, sparkColor: "#e8fdff", spark: (t) => bob([LENS.focal, 0, 0], t, 0.02) },
  // 3 - photoelectric effect
  { cam: [-0.4, 2.7, 9.6], look: [0, 0.1, 0], fitW: 6.8, fitH: 4.6, orbit: 0.16, shift: 0.14, bg: PHYSICS, bloom: 1, sparkColor: "#b5faff",
    spark: (t) => {
      const [ix, iz] = PHOTO.impacts[2];
      const d = electronDir(2);
      return bob([ix + d[0] * 2.2, PLATE_TOP + d[1] * 2.2, iz + d[2] * 2.2], t, 0.04);
    } },
  // 4 - a solenoid
  { cam: [2.6, 1.7, 9.2], look: [0, 0, 0], fitW: 7.2, fitH: 4.6, orbit: 0.35, shift: 0.14, bg: PHYSICS, bloom: 1, sparkColor: "#b5faff", spark: (t) => [0.15 * Math.sin(t * 0.5), 0.92, 0.04] },
  // 5 - copper atom
  { cam: [0, 0.5, 8.6], look: [0, 0, 0], fitW: 6.2, fitH: 5.6, orbit: 0.45, shift: 0.14, bg: CHEMISTRY, bloom: 1, sparkColor: "#fff1d0",
    spark: (t) => [1.35 * Math.cos(t * 1.15), 0.55 * Math.sin(t * 1.15), 1.1 * Math.sin(t * 1.15)] },
  // 6 - water
  { cam: [0.2, 0.25, 7.6], look: [0, -0.05, 0], fitW: 4.8, fitH: 3.6, orbit: 0.35, shift: 0.14, bg: CHEMISTRY, bloom: 0.95, sparkColor: "#ffe4b0",
    spark: (t) => bob([(WATER.O[0] + WATER.H2[0]) / 2, (WATER.O[1] + WATER.H2[1]) / 2, 0.12], t, 0.04) },
  // 7 - combustion
  { cam: [0, 0.7, 9.4], look: [0, 0.25, 0], fitW: 7.6, fitH: 5.2, orbit: 0.2, shift: 0.14, bg: CHEMISTRY, bloom: 1.05, sparkColor: "#fff1d0",
    spark: (t) => [0.03 * Math.sin(t * 9), FLAME.baseY + 0.5 + 0.06 * Math.sin(t * 5), 0] },
  // 8 - periodic table
  { cam: [0, -0.6, 11.5], look: [0, 0, 0], fitW: 7.2, fitH: 4.0, orbit: 0.06, shift: 0.18, bg: CHEMISTRY, bloom: 0.5, sparkColor: "#a5f8ff",
    spark: () => {
      const p = elementPos(TABLE.copper);
      const half = TABLE.cell * TABLE.scale * 0.45;
      return [p[0] + half, p[1] + half, 0.2];
    } },
  // 9 - leaf
  { cam: [0.7, -0.5, 9.6], look: [0, 0, 0], fitW: 5.8, fitH: 5.2, orbit: 0.15, shift: 0.14, bg: BIOLOGY, bloom: 1, sparkColor: "#fff6c8", spark: (t) => bob(leafPoint(0.55, -0.35), t, 0.02) },
  // 10 - plant cell
  { cam: [1.4, 1.7, 9.4], look: [0, 0, 0], fitW: 6.2, fitH: 4.4, orbit: 0.7, shift: 0.14, bg: BIOLOGY, bloom: 0.95, sparkColor: "#d9ffe6",
    spark: (t) => spinTilt(CELL.chloroplasts[2], CELL.spin * t, CELL.tilt) },
  // 11 - DNA
  { cam: [0, 0, 11.5], look: [0, 0, 0], fitW: 4.2, fitH: 7.4, orbit: 0.1, shift: 0.15, bg: BIOLOGY, bloom: 1, sparkColor: "#ffffff",
    spark: (t) => spinTilt([0, dnaWaveY(t), 0], 0, DNA.tilt) },
  // 12 - the eye
  { cam: [-0.2, 0.7, 10.2], look: [0.5, -0.15, 0], fitW: 7.6, fitH: 4.2, orbit: 0.1, shift: 0.14, bg: BIOLOGY, bloom: 1, sparkColor: "#fff3c4",
    spark: (t) => nervePoint((t * 0.42) % 1) },
  // 13 - lightbulb
  { cam: [0, 0.4, 9.2], look: [0, 0.25, 0], fitW: 5.2, fitH: 5.4, orbit: 0.15, shift: 0.14, bg: FINALE, bloom: 1.25, sparkColor: "#fff3c8", spark: (t) => bob([0, BULB.filamentY, 0], t, 0.01) },
  // 14 - the Visual Learning logo
  { cam: [0, 0, 9.6], look: [0, 0, 0], fitW: 5.6, fitH: 5.2, orbit: 0.08, shift: 0.17, bg: FINALE, bloom: 0.9, sparkColor: "#f3e8ff", spark: (t) => bob([1.72, -0.02, 0.25], t, 0.03) },
];

