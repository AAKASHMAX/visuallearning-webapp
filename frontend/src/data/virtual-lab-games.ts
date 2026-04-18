export const GAMES_BASE_URL = "https://aakashmax.github.io/visuallearning-games";

export interface VirtualLabGame {
  slug: string;
  title: string;
  category: "biology" | "physics" | "chemistry" | "environment";
}

export const virtualLabGames: VirtualLabGame[] = [
  // ── Biology: Human Body ──
  { slug: "human-heart", title: "Human Heart", category: "biology" },
  { slug: "human-heart-and-lungs", title: "Human Heart and Lungs", category: "biology" },
  { slug: "human-respiratory-system", title: "Human Respiratory System", category: "biology" },
  { slug: "lungs-with-bronchial-tree", title: "Lungs with Bronchial Tree", category: "biology" },
  { slug: "how-breathing-works", title: "How Breathing Works", category: "biology" },
  { slug: "brain", title: "Brain", category: "biology" },
  { slug: "brain-stem-and-eye", title: "Brain Stem and Eye", category: "biology" },
  { slug: "brain-and-skull-reconstruction", title: "Brain and Skull Reconstruction", category: "biology" },
  { slug: "human-skull", title: "Human Skull", category: "biology" },
  { slug: "human-eye", title: "Human Eye", category: "biology" },
  { slug: "human-eye-cross-section", title: "Human Eye Cross Section", category: "biology" },
  { slug: "human-ear", title: "Human Ear", category: "biology" },
  { slug: "human-kidney", title: "Human Kidney", category: "biology" },
  { slug: "nephrone", title: "Nephron", category: "biology" },
  { slug: "human-liver-with-pancreas", title: "Human Liver with Pancreas", category: "biology" },
  { slug: "human-musculoskeletal-system", title: "Human Musculoskeletal System", category: "biology" },
  { slug: "nervous-system", title: "Nervous System", category: "biology" },
  { slug: "blood-vessel", title: "Blood Vessel", category: "biology" },
  { slug: "artery-vein", title: "Artery and Vein", category: "biology" },
  { slug: "male-reproductive-system", title: "Male Reproductive System", category: "biology" },
  { slug: "female-reproduction", title: "Female Reproductive System", category: "biology" },
  { slug: "fetal-development-stage", title: "Fetal Development Stage", category: "biology" },
  { slug: "muscle-tissue", title: "Muscle Tissue", category: "biology" },
  { slug: "connective-tissues", title: "Connective Tissues", category: "biology" },
  { slug: "epithelial-tissue", title: "Epithelial Tissue and Its Types", category: "biology" },
  { slug: "animal-tissue", title: "Animal Tissue", category: "biology" },

  // ── Biology: Cell & Microorganisms ──
  { slug: "animal-cell", title: "Animal Cell", category: "biology" },
  { slug: "cell", title: "Cell", category: "biology" },
  { slug: "bacterial-cell", title: "Bacterial Cell", category: "biology" },
  { slug: "compound-microscope", title: "Compound Microscope", category: "biology" },

  // ── Biology: Plants ──
  { slug: "photosynthesis", title: "Photosynthesis", category: "biology" },
  { slug: "flower-cross-section", title: "Flower Cross Section", category: "biology" },
  { slug: "monocot-and-dicot-plants", title: "Monocot and Dicot Plants", category: "biology" },
  { slug: "diversity-in-plants", title: "Diversity in Plants", category: "biology" },
  { slug: "herbarium-sheet", title: "Herbarium Sheet", category: "biology" },
  { slug: "plant-tissues", title: "Identifying Plant Tissues", category: "biology" },
  { slug: "simple-permanent-tissue", title: "Simple Permanent Tissue in Plants", category: "biology" },
  { slug: "complex-permanent-tissue", title: "Complex Permanent Tissue in Plants", category: "biology" },
  { slug: "meristematic-tissues", title: "Meristematic Tissues", category: "biology" },
  { slug: "common-disease-in-plants", title: "Common Disease in Local Plants", category: "biology" },

  // ── Biology: Animals & Life Cycles ──
  { slug: "frog-life-cycle", title: "Frog Life Cycle", category: "biology" },
  { slug: "diversity-in-animal", title: "Diversity in Animals", category: "biology" },
  { slug: "earthworm", title: "Earthworm", category: "biology" },

  // ── Chemistry ──
  { slug: "ethanol-and-ethanoic-acid", title: "Ethanol and Ethanoic Acid", category: "chemistry" },
  { slug: "ethanoic-acid-properties", title: "Properties of Ethanoic Acid", category: "chemistry" },
  { slug: "identify-chemicals", title: "Identify Chemicals", category: "chemistry" },
  { slug: "hard-and-distilled-water", title: "Hard and Distilled Water", category: "chemistry" },
  { slug: "acid-base-ph-indicator", title: "Acid Base pH Indicator", category: "chemistry" },
  { slug: "acid-and-base", title: "Acid and Base", category: "chemistry" },
  { slug: "double-displacement-reaction", title: "Double Displacement Reaction", category: "chemistry" },
  { slug: "displacement-reaction", title: "Displacement Reaction", category: "chemistry" },
  { slug: "decomposition-reaction", title: "Decomposition Reaction", category: "chemistry" },
  { slug: "combination-reaction", title: "Combination Reaction", category: "chemistry" },

  // ── Physics ──
  { slug: "refraction-through-glass-slab", title: "Refraction Through Glass Slab", category: "physics" },
  { slug: "concave-mirror", title: "Concave Mirror", category: "physics" },
  { slug: "convex-mirror", title: "Convex Mirror", category: "physics" },
  { slug: "archimedes-principle", title: "Archimedes' Principle", category: "physics" },
  { slug: "rutherfords-scattering-experiment", title: "Rutherford's Scattering Experiment", category: "physics" },
  { slug: "flickering-test", title: "Flickering Test", category: "physics" },

  // ── Environment ──
  { slug: "ozone-layer", title: "Ozone Layer", category: "environment" },
  { slug: "rain-cycle", title: "Rain Cycle (Water Cycle)", category: "environment" },
  { slug: "wind-mill", title: "Wind Mill", category: "environment" },
  { slug: "hydropower-plant", title: "Hydropower Plant", category: "environment" },
];

export const categories = [
  { key: "all", label: "All" },
  { key: "biology", label: "Biology" },
  { key: "chemistry", label: "Chemistry" },
  { key: "physics", label: "Physics" },
  { key: "environment", label: "Environment" },
] as const;
