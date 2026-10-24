/** The words of the spark journey, one entry per scroll beat (same order as the engine's scenes). */

export type SubjectKey = "intro" | "physics" | "chemistry" | "biology" | "finale";
export type Lesson = { cls: number; subject: "Physics" | "Chemistry" | "Biology"; chapter: string };

export type Beat = {
  subject: SubjectKey;
  /** short name for the side rail */
  label: string;
  eyebrow: string;
  headline: string;
  body: string;
  /** written in light under the text; trusted, static HTML (sub/sup only) */
  formula?: string;
  lesson?: Lesson;
};

export const SUBJECTS: Record<SubjectKey, { name: string; color: string }> = {
  intro: { name: "Start", color: "#a78bfa" },
  physics: { name: "Physics", color: "#00d4ff" },
  chemistry: { name: "Chemistry", color: "#f59e0b" },
  biology: { name: "Biology", color: "#10b981" },
  finale: { name: "You", color: "#c084fc" },
};

export const BEATS: Beat[] = [
  {
    subject: "intro",
    label: "The spark",
    eyebrow: "Visual Learning · Classes 9–12",
    headline: "Science. Visualised.",
    body: "Follow one spark of light through physics, chemistry and biology. Every scene you scroll through is a real lesson.",
  },
  {
    subject: "physics",
    label: "Refraction",
    eyebrow: "Physics · 01 · Light",
    headline: "Light bends the rules.",
    body: "White light is every colour at once. A prism slows each colour by a different amount, so they bend differently and fan out into a spectrum. Violet bends the most.",
    formula: "n<sub>1</sub> sin i = n<sub>2</sub> sin r",
    lesson: { cls: 10, subject: "Physics", chapter: "The Human Eye and the Colourful World" },
  },
  {
    subject: "physics",
    label: "Lenses",
    eyebrow: "Physics · 02 · Optics",
    headline: "Every ray has a path.",
    body: "Rays parallel to the axis enter a convex lens and meet at one point: the focus. Cameras, microscopes and spectacles are all built on this.",
    formula: "1/v − 1/u = 1/f",
    lesson: { cls: 12, subject: "Physics", chapter: "Ray Optics and Optical Instruments" },
  },
  {
    subject: "physics",
    label: "Photoelectric effect",
    eyebrow: "Physics · 03 · Quantum",
    headline: "Light knocks. Electrons answer.",
    body: "Light of high enough frequency knocks electrons out of a metal. Our spark is now one of them. Einstein explained why, and won the Nobel Prize for it.",
    formula: "K<sub>max</sub> = hν − φ<sub>0</sub>",
    lesson: { cls: 12, subject: "Physics", chapter: "Dual Nature of Radiation and Matter" },
  },
  {
    subject: "physics",
    label: "Magnetism",
    eyebrow: "Physics · 04 · Electromagnetism",
    headline: "Invisible forces, made visible.",
    body: "Electrons drifting through a coil of wire create a magnetic field, just like a bar magnet's. More turns and more current make it stronger.",
    formula: "B = μ<sub>0</sub> n I",
    lesson: { cls: 12, subject: "Physics", chapter: "Moving Charges and Magnetism" },
  },
  {
    subject: "chemistry",
    label: "The atom",
    eyebrow: "Chemistry · 05 · Structure of the atom",
    headline: "Atoms never sit still.",
    body: "Zoom into the copper wire and one atom fills the view. Its 29 electrons don't circle in neat orbits. They live in clouds of probability called orbitals.",
    formula: "Cu: [Ar] 3d<sup>10</sup> 4s<sup>1</sup>",
    lesson: { cls: 11, subject: "Chemistry", chapter: "Structure of Atom" },
  },
  {
    subject: "chemistry",
    label: "Bonding",
    eyebrow: "Chemistry · 06 · Chemical bonding",
    headline: "Bonds are shared electrons.",
    body: "Oxygen shares one pair of electrons with each hydrogen. Its two lone pairs push the bonds closer together, bending water to 104.5°.",
    formula: "H–O–H  ∠ 104.5°",
    lesson: { cls: 11, subject: "Chemistry", chapter: "Chemical Bonding and Molecular Structure" },
  },
  {
    subject: "chemistry",
    label: "Reactions",
    eyebrow: "Chemistry · 07 · Chemical reactions",
    headline: "Everything is a reaction.",
    body: "Methane meets oxygen: bonds break, atoms rearrange, and energy is released as heat and light. A blue flame means complete combustion. Atoms are never lost, so the equation must balance.",
    formula: "CH<sub>4</sub> + <b>2</b>O<sub>2</sub> → CO<sub>2</sub> + <b>2</b>H<sub>2</sub>O",
    lesson: { cls: 10, subject: "Chemistry", chapter: "Chemical Reactions and Equations" },
  },
  {
    subject: "chemistry",
    label: "Elements",
    eyebrow: "Chemistry · 08 · Periodic table",
    headline: "118 elements. One table.",
    body: "Everything around you is built from these. Arranged by atomic number, elements in the same group behave alike. Copper, where our spark began, is number 29.",
    formula: "Cu · Z = 29 · group 11 · period 4",
    lesson: { cls: 11, subject: "Chemistry", chapter: "Classification of Elements and Periodicity in Properties" },
  },
  {
    subject: "biology",
    label: "Photosynthesis",
    eyebrow: "Biology · 09 · Photosynthesis",
    headline: "Sunlight, turned into life.",
    body: "Inside every leaf, chloroplasts catch light and use it to turn water and carbon dioxide into sugar, releasing the oxygen you breathe.",
    formula: "6CO<sub>2</sub> + 6H<sub>2</sub>O → C<sub>6</sub>H<sub>12</sub>O<sub>6</sub> + 6O<sub>2</sub>",
    lesson: { cls: 11, subject: "Biology", chapter: "Photosynthesis in Higher Plants" },
  },
  {
    subject: "biology",
    label: "The cell",
    eyebrow: "Biology · 10 · The cell",
    headline: "A cell is a city.",
    body: "Every leaf, root and person is built from cells. Inside each one, a nucleus holds the plans, mitochondria release energy, and in plants, chloroplasts catch sunlight.",
    formula: "first seen by Robert Hooke, 1665",
    lesson: { cls: 9, subject: "Biology", chapter: "The Fundamental Unit of Life" },
  },
  {
    subject: "biology",
    label: "DNA",
    eyebrow: "Biology · 11 · Nucleic acids",
    headline: "The code inside you.",
    body: "Coiled inside the nucleus, DNA spells out instructions in a four-letter code. A always pairs with T, and G always pairs with C.",
    formula: "A = T · G ≡ C",
    lesson: { cls: 11, subject: "Biology", chapter: "Biomolecules" },
  },
  {
    subject: "biology",
    label: "The eye",
    eyebrow: "Biology · 12 · Seeing",
    headline: "Every thought is a spark.",
    body: "The lens of your eye focuses light into an image on the retina. Light-sensitive cells there turn it into electrical signals, and the optic nerve races them to your brain.",
    formula: "image on the retina: real and inverted",
    lesson: { cls: 11, subject: "Biology", chapter: "Neural Control and Coordination" },
  },
  {
    subject: "finale",
    label: "Your turn",
    eyebrow: "The spark reaches you",
    headline: "Now you see it.",
    body: "That is what Visual Learning does for every chapter. We turn what textbooks describe into something you can watch, explore and remember.",
  },
  {
    subject: "finale",
    label: "Start",
    eyebrow: "Your next lightbulb moment starts here",
    headline: "Step inside science.",
    body: "3D animated lessons, visual notes, NCERT solutions and chapter quizzes for Classes 9 to 12.",
  },
];

/** Index of the first beat of each subject, for the side rail. */
export const SUBJECT_START: Partial<Record<SubjectKey, number>> = BEATS.reduce(
  (acc, b, i) => (acc[b.subject] === undefined ? { ...acc, [b.subject]: i } : acc),
  {} as Partial<Record<SubjectKey, number>>,
);
