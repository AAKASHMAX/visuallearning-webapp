/**
 * Shared geometry for the spark journey. The particle shapes and the 3D props
 * are built from these same numbers, so a light ray made of particles lines up
 * with its glowing beam, and the spark lands exactly on the copper tile.
 * World units; the camera sits roughly 9-11 units from the origin.
 */
export type V2 = [number, number];
export type V3 = [number, number, number];

const DEG = Math.PI / 180;

/* ---------- Physics 1: dispersion through a prism ---------- */

export const PRISM = {
  apex: [0, 1.1] as V2,
  left: [-1.27, -1.1] as V2,
  right: [1.27, -1.1] as V2,
  depth: 1.6,
  source: [-6.6, -1.42] as V2,
  entry: [-0.7, -0.11] as V2,
  exit: [0.66, -0.05] as V2,
  rayLength: 6.4,
  // Violet bends the most, red the least.
  rays: [
    { color: "#ff453a", angle: -15 },
    { color: "#ff9f0a", angle: -17 },
    { color: "#ffd60a", angle: -19 },
    { color: "#30d158", angle: -21 },
    { color: "#0a84ff", angle: -23 },
    { color: "#5e5ce6", angle: -25 },
    { color: "#bf5af2", angle: -27 },
  ],
};

export function prismRayEnd(angleDeg: number): V2 {
  const a = angleDeg * DEG;
  return [PRISM.exit[0] + Math.cos(a) * PRISM.rayLength, PRISM.exit[1] + Math.sin(a) * PRISM.rayLength];
}

/* ---------- Physics 2: a convex lens ---------- */

export const LENS = {
  aperture: 1.55,
  thickness: 0.52,
  focal: 2.3,
  heights: [-1.2, -0.8, -0.4, 0, 0.4, 0.8, 1.2],
  startX: -6.2,
  endX: 5.4,
};

/** A ray parallel to the axis at height h: start, the point on the lens, and where it ends past the focus. */
export function lensRay(h: number): [V2, V2, V2] {
  const slope = -h / LENS.focal;
  return [[LENS.startX, h], [0, h], [LENS.endX, h + slope * LENS.endX]];
}

/* ---------- Physics 3: the photoelectric effect ---------- */

export const PHOTO = {
  plateY: -1.2,
  plateW: 5.2,
  plateH: 0.2,
  plateD: 2.6,
  /** x, z on the top face where photons land */
  impacts: [[-1.5, 0.5], [-0.8, -0.4], [-0.1, 0.6], [0.6, -0.5], [1.3, 0.3]] as V2[],
  photonDir: normalize([0.62, -0.78, 0.05]),
};
export const PLATE_TOP = PHOTO.plateY + PHOTO.plateH / 2;

export function electronDir(k: number): V3 {
  return normalize([0.3 + 0.12 * k, 1, 0.16 * (k - 2)]);
}

/* ---------- Physics 4: a solenoid ---------- */

export const COIL = { length: 3.4, radius: 0.92, turns: 10, wire: 0.065 };

export function coilPoint(u: number): V3 {
  const a = u * COIL.turns * Math.PI * 2;
  return [-COIL.length / 2 + COIL.length * u, COIL.radius * Math.cos(a), COIL.radius * Math.sin(a)];
}

/* ---------- Chemistry 1: a copper atom ---------- */

export const ATOM = { nucleus: 0.32, protons: 29, neutrons: 34 };

/* ---------- Chemistry 2: water ---------- */

const HALF_ANGLE = (104.5 / 2) * DEG;
const BOND = 1.3;
export const WATER = {
  O: [0, 0.32, 0] as V3,
  H1: [-Math.sin(HALF_ANGLE) * BOND, 0.32 - Math.cos(HALF_ANGLE) * BOND, 0] as V3,
  H2: [Math.sin(HALF_ANGLE) * BOND, 0.32 - Math.cos(HALF_ANGLE) * BOND, 0] as V3,
  rO: 0.44,
  rH: 0.27,
};

/* ---------- Chemistry 3: combustion ---------- */

export const FLAME = { baseY: -1.3, height: 2.7, radius: 0.55 };

/* ---------- Chemistry 4: the periodic table ---------- */

export const ELEMENTS = (
  "H He Li Be B C N O F Ne Na Mg Al Si P S Cl Ar K Ca Sc Ti V Cr Mn Fe Co Ni Cu Zn Ga Ge As Se Br Kr " +
  "Rb Sr Y Zr Nb Mo Tc Ru Rh Pd Ag Cd In Sn Sb Te I Xe Cs Ba La Ce Pr Nd Pm Sm Eu Gd Tb Dy Ho Er Tm Yb Lu " +
  "Hf Ta W Re Os Ir Pt Au Hg Tl Pb Bi Po At Rn Fr Ra Ac Th Pa U Np Pu Am Cm Bk Cf Es Fm Md No Lr " +
  "Rf Db Sg Bh Hs Mt Ds Rg Cn Nh Fl Mc Lv Ts Og"
).split(" ");

export const TABLE = { cell: 0.46, scale: 0.63, copper: 29 };

/** Column (group 1-18) and display row (0-6 main, 7.5 / 8.5 for the f-block), NCERT layout. */
export function elementSlot(z: number): { col: number; row: number } {
  if (z === 1) return { col: 1, row: 0 };
  if (z === 2) return { col: 18, row: 0 };
  if (z <= 4) return { col: z - 2, row: 1 };
  if (z <= 10) return { col: z + 8, row: 1 };
  if (z <= 12) return { col: z - 10, row: 2 };
  if (z <= 18) return { col: z, row: 2 };
  if (z <= 36) return { col: z - 18, row: 3 };
  if (z <= 54) return { col: z - 36, row: 4 };
  if (z <= 56) return { col: z - 54, row: 5 };
  if (z === 57) return { col: 3, row: 5 };
  if (z <= 71) return { col: z - 54, row: 7.5 };
  if (z <= 86) return { col: z - 68, row: 5 };
  if (z <= 88) return { col: z - 86, row: 6 };
  if (z === 89) return { col: 3, row: 6 };
  if (z <= 103) return { col: z - 86, row: 8.5 };
  return { col: z - 100, row: 6 };
}

export function elementPos(z: number): V3 {
  const { col, row } = elementSlot(z);
  const s = TABLE.cell * TABLE.scale;
  return [(col - 9.5) * s, (4.25 - row) * s, 0];
}

export type ElementFamily =
  | "alkali" | "alkaline" | "transition" | "post" | "metalloid" | "nonmetal" | "halogen" | "noble" | "lanthanoid" | "actinoid";

const FAMILY_LISTS: [ElementFamily, number[]][] = [
  ["noble", [2, 10, 18, 36, 54, 86, 118]],
  ["halogen", [9, 17, 35, 53, 85, 117]],
  ["metalloid", [5, 14, 32, 33, 51, 52]],
  ["nonmetal", [1, 6, 7, 8, 15, 16, 34]],
  ["post", [13, 31, 49, 50, 81, 82, 83, 84, 113, 114, 115, 116]],
  ["alkali", [3, 11, 19, 37, 55, 87]],
  ["alkaline", [4, 12, 20, 38, 56, 88]],
];

export function elementFamily(z: number): ElementFamily {
  for (const [family, list] of FAMILY_LISTS) if (list.includes(z)) return family;
  if (z >= 58 && z <= 71) return "lanthanoid";
  if (z >= 90 && z <= 103) return "actinoid";
  return "transition";
}

export const FAMILY_COLOR: Record<ElementFamily, string> = {
  alkali: "#ff6b4a",
  alkaline: "#ff9442",
  transition: "#f5a524",
  post: "#ffc94d",
  metalloid: "#ffe08a",
  nonmetal: "#fff1c1",
  halogen: "#ff9e7a",
  noble: "#ffc8e0",
  lanthanoid: "#e08a35",
  actinoid: "#c26d28",
};

/* ---------- Biology 1: a leaf ---------- */

export const LEAF = {
  base: [1.55, -2.15] as V2,
  tip: [-1.65, 2.2] as V2,
  halfWidth: 1.2,
  curl: 0.35,
};

/** Leaf space (s along the midrib 0..1, w across -1..1) to world. */
export function leafPoint(s: number, w: number): V3 {
  const [bx, by] = LEAF.base;
  const [tx, ty] = LEAF.tip;
  const ax = tx - bx;
  const ay = ty - by;
  const len = Math.hypot(ax, ay);
  const ux = ax / len;
  const uy = ay / len;
  const half = leafHalfWidth(s);
  const x = bx + ax * s - uy * w * half;
  const y = by + ay * s + ux * w * half;
  // The blade curls up at its edges and dips along the midrib.
  const z = LEAF.curl * (w * w) - 0.25 * Math.sin(Math.PI * s);
  return [x, y, z];
}

export function leafHalfWidth(s: number): number {
  if (s < 0.06) return 0.05; // petiole
  const t = (s - 0.06) / 0.94;
  return LEAF.halfWidth * Math.pow(Math.sin(Math.PI * Math.pow(t, 0.82)), 1.05) * (1 - 0.18 * t) + 0.02;
}

/* ---------- Biology 2: a plant cell ---------- */

export const CELL = {
  half: [2.45, 1.6, 1.2] as V3,
  power: 4,
  nucleus: { pos: [-0.75, 0.25, 0.1] as V3, r: 0.62 },
  vacuole: { pos: [0.95, -0.2, -0.1] as V3, r: 0.95 },
  chloroplasts: [
    [-1.75, -0.75, 0.45],
    [-1.6, 0.95, -0.5],
    [0.15, 1.15, 0.55],
    [1.85, 0.95, 0.35],
    [1.95, -1.0, -0.35],
    [-0.2, -1.15, 0.6],
  ] as V3[],
  mitochondria: [
    [-1.85, 0.1, -0.6],
    [0.2, -0.95, -0.55],
    [1.2, 1.05, -0.55],
    [-0.15, 0.85, -0.7],
  ] as V3[],
  spin: 0.12,
  tilt: 0.42,
};

/* ---------- Biology 3: DNA ---------- */

export const DNA = {
  radius: 0.85,
  pitch: 3.4,
  height: 7.2,
  rungs: 21,
  /** the second strand trails the first: major and minor grooves */
  offset: Math.PI * 0.78,
  spin: 0.32,
  tilt: 0.38,
  wave: 1.6,
  sequence: "ATGCGTACCGATTGCAGCTAGCGTA",
};

export function dnaAngle(y: number): number {
  return (y / DNA.pitch) * Math.PI * 2;
}

/** Height of the glow that runs up the helix. */
export function dnaWaveY(time: number): number {
  const span = DNA.height + 1.4;
  return ((time * DNA.wave) % span) - span / 2;
}

/* ---------- Biology 4: the eye ---------- */

export const EYE = {
  center: [0.55, 0, 0] as V3,
  radius: 1.55,
  lens: { x: -0.62, aperture: 0.62, thickness: 0.36 },
  object: { x: -2.25, h: 0.55 },
  nerve: [
    [2.06, -0.12, 0],
    [3.0, -0.3, 0.05],
    [3.95, -0.62, 0],
    [4.95, -1.3, -0.1],
  ] as V3[],
};

const RETINA_R = EYE.radius * 0.965;

/** Where the axis meets the retina at the back of the eye. */
export function retinaBase(): V2 {
  return [EYE.center[0] + RETINA_R, 0];
}

/**
 * Where the top of the object lands on the curved retina: the ray through the
 * centre of the lens goes straight on, so the image is real, inverted, smaller.
 */
export function eyeImageTop(): V2 {
  const s = EYE.object.h / (EYE.lens.x - EYE.object.x);
  // Point on the ray: (lens.x + t, -s t); solve |p - centre| = retina radius for t > 0.
  const dx = EYE.lens.x - EYE.center[0];
  const a = 1 + s * s;
  const b = 2 * dx;
  const c = dx * dx - RETINA_R * RETINA_R;
  const t = (-b + Math.sqrt(b * b - 4 * a * c)) / (2 * a);
  return [EYE.lens.x + t, -s * t];
}

export function nervePoint(t: number): V3 {
  const [a, b, c, d] = EYE.nerve;
  const u = 1 - t;
  const w = [u * u * u, 3 * u * u * t, 3 * u * t * t, t * t * t];
  return [0, 1, 2].map((i) => w[0] * a[i] + w[1] * b[i] + w[2] * c[i] + w[3] * d[i]) as V3;
}

/* ---------- Finale: the lightbulb ---------- */

export const BULB = {
  center: [0, 0.75, 0] as V3,
  r: 1.35,
  neckY: -0.45,
  neckR: 0.52,
  baseBottom: -1.7,
  filamentY: 0.62,
  filamentWidth: 0.82,
};

export function filamentPoint(t: number): V3 {
  // A coiled filament between two supports.
  const x = -BULB.filamentWidth / 2 + BULB.filamentWidth * t;
  const a = t * Math.PI * 2 * 9;
  return [x, BULB.filamentY + 0.07 * Math.sin(a), 0.07 * Math.cos(a)];
}

/* ---------- helpers ---------- */

export function normalize(v: V3): V3 {
  const l = Math.hypot(v[0], v[1], v[2]) || 1;
  return [v[0] / l, v[1] / l, v[2] / l];
}
