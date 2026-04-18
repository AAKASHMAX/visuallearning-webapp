export interface VirtualLabGame {
  slug: string;
  title: string;
  gameUrl: string;
  category: "biology" | "physics" | "chemistry" | "environment";
}

export const virtualLabGames: VirtualLabGame[] = [
  // ── Biology: Human Body ──
  { slug: "human-heart", title: "Human Heart", gameUrl: "https://akmax3202.itch.io/human-heart", category: "biology" },
  { slug: "human-heart-and-lungs", title: "Human Heart and Lungs", gameUrl: "https://akmax3202.itch.io/human-heart-and-lungs", category: "biology" },
  { slug: "human-respiratory-system", title: "Human Respiratory System", gameUrl: "https://akmax3202.itch.io/human", category: "biology" },
  { slug: "lungs-with-bronchial-tree", title: "Lungs with Bronchial Tree", gameUrl: "https://akmax3202.itch.io/lungs-with-bronchial", category: "biology" },
  { slug: "how-breathing-works", title: "How Breathing Works", gameUrl: "https://akmax3202.itch.io/how-breathing-works", category: "biology" },
  { slug: "brain", title: "Brain", gameUrl: "https://akmax3202.itch.io/brain", category: "biology" },
  { slug: "brain-stem-and-eye", title: "Brain Stem and Eye", gameUrl: "https://akmax3202.itch.io/brain-stem-and-eye", category: "biology" },
  { slug: "brain-and-skull-reconstruction", title: "Brain and Skull Reconstruction", gameUrl: "https://akmax3202.itch.io/brain-and-skull-reconstruction", category: "biology" },
  { slug: "human-skull", title: "Human Skull", gameUrl: "https://akmax3202.itch.io/human-skull", category: "biology" },
  { slug: "human-eye", title: "Human Eye", gameUrl: "https://akmax3202.itch.io/human-eye", category: "biology" },
  { slug: "human-eye-cross-section", title: "Human Eye Cross Section", gameUrl: "https://akmax3202.itch.io/human-eye-cross-section", category: "biology" },
  { slug: "human-ear", title: "Human Ear", gameUrl: "https://akmax3202.itch.io/fetal-development", category: "biology" },
  { slug: "human-kidney", title: "Human Kidney", gameUrl: "https://akmax3202.itch.io/human-kidney", category: "biology" },
  { slug: "nephrone", title: "Nephron", gameUrl: "https://akmax3202.itch.io/nephrone", category: "biology" },
  { slug: "human-liver-with-pancreas", title: "Human Liver with Pancreas", gameUrl: "https://akmax3202.itch.io/human-l", category: "biology" },
  { slug: "human-musculoskeletal-system", title: "Human Musculoskeletal System", gameUrl: "https://akmax3202.itch.io/human-musculoskeletal-system", category: "biology" },
  { slug: "nervous-system", title: "Nervous System", gameUrl: "https://akmax3202.itch.io/nervous-system", category: "biology" },
  { slug: "blood-vessel", title: "Blood Vessel", gameUrl: "https://akmax3202.itch.io/blood-vessel", category: "biology" },
  { slug: "artery-vein", title: "Artery and Vein", gameUrl: "https://akmax3202.itch.io/baterial-cell", category: "biology" },
  { slug: "male-reproductive-system", title: "Male Reproductive System", gameUrl: "https://akmax3202.itch.io/male-reproductive-system", category: "biology" },
  { slug: "female-reproduction", title: "Female Reproductive System", gameUrl: "https://akmax3202.itch.io/female-reproduction", category: "biology" },
  { slug: "fetal-development-stage", title: "Fetal Development Stage", gameUrl: "https://akmax3202.itch.io/fetal-development-stage", category: "biology" },
  { slug: "muscle-tissue", title: "Muscle Tissue", gameUrl: "https://akmax3202.itch.io/muscle-tissue", category: "biology" },
  { slug: "connective-tissues", title: "Connective Tissues", gameUrl: "https://akmax3202.itch.io/connective-tissues", category: "biology" },
  { slug: "epithelial-tissue", title: "Epithelial Tissue and Its Types", gameUrl: "https://akmax3202.itch.io/epithelial-tissue-and-its-types", category: "biology" },
  { slug: "animal-tissue", title: "Animal Tissue", gameUrl: "https://akmax3202.itch.io/animal-tissue", category: "biology" },

  // ── Biology: Cell & Microorganisms ──
  { slug: "animal-cell", title: "Animal Cell", gameUrl: "https://akmax3202.itch.io/animal-cell", category: "biology" },
  { slug: "cell", title: "Cell", gameUrl: "https://akmax3202.itch.io/cell", category: "biology" },
  { slug: "bacterial-cell", title: "Bacterial Cell", gameUrl: "https://akmax3202.itch.io/bacterial-cell", category: "biology" },
  { slug: "compound-microscope", title: "Compound Microscope", gameUrl: "https://akmax3202.itch.io/compound-microscope", category: "biology" },

  // ── Biology: Plants ──
  { slug: "photosynthesis", title: "Photosynthesis", gameUrl: "https://akmax3202.itch.io/photosynthesis", category: "biology" },
  { slug: "flower-cross-section", title: "Flower Cross Section", gameUrl: "https://akmax3202.itch.io/flower-cross-section", category: "biology" },
  { slug: "monocot-and-dicot-plants", title: "Monocot and Dicot Plants", gameUrl: "https://akmax3202.itch.io/monocot-and-dicot-plants", category: "biology" },
  { slug: "diversity-in-plants", title: "Diversity in Plants", gameUrl: "https://akmax3202.itch.io/diversity-in-plants", category: "biology" },
  { slug: "herbarium-sheet", title: "Herbarium Sheet", gameUrl: "https://akmax3202.itch.io/herbarium-sheet", category: "biology" },
  { slug: "plant-tissues", title: "Identifying Plant Tissues", gameUrl: "https://akmax3202.itch.io/plant-tissuehigh", category: "biology" },
  { slug: "simple-permanent-tissue", title: "Simple Permanent Tissue in Plants", gameUrl: "https://akmax3202.itch.io/lab-view-test", category: "biology" },
  { slug: "complex-permanent-tissue", title: "Complex Permanent Tissue in Plants", gameUrl: "https://akmax3202.itch.io/complex", category: "biology" },
  { slug: "meristematic-tissues", title: "Meristematic Tissues", gameUrl: "https://akmax3202.itch.io/lab-view-test-1", category: "biology" },
  { slug: "common-disease-in-plants", title: "Common Disease in Local Plants", gameUrl: "https://akmax3202.itch.io/common", category: "biology" },

  // ── Biology: Animals & Life Cycles ──
  { slug: "frog-life-cycle", title: "Frog Life Cycle", gameUrl: "https://akmax3202.itch.io/frog-life-cycle", category: "biology" },
  { slug: "diversity-in-animal", title: "Diversity in Animals", gameUrl: "https://akmax3202.itch.io/diversity-in-animal", category: "biology" },
  { slug: "earthworm", title: "Earthworm", gameUrl: "https://akmax3202.itch.io/continent", category: "biology" },

  // ── Chemistry ──
  { slug: "ethanol-and-ethanoic-acid", title: "Ethanol and Ethanoic Acid", gameUrl: "https://akmax3202.itch.io/ethanol-and-ethanoic-acid", category: "chemistry" },
  { slug: "ethanoic-acid-properties", title: "Properties of Ethanoic Acid", gameUrl: "https://akmax3202.itch.io/propeties-of-ethanoic-acid", category: "chemistry" },
  { slug: "identify-chemicals", title: "Identify Chemicals", gameUrl: "https://akmax3202.itch.io/identify-chemicals", category: "chemistry" },
  { slug: "hard-and-distilled-water", title: "Hard and Distilled Water", gameUrl: "https://akmax3202.itch.io/hard-and-distilled-water", category: "chemistry" },
  { slug: "acid-base-ph-indicator", title: "Acid Base pH Indicator", gameUrl: "https://akmax3202.itch.io/acid-base-indicator", category: "chemistry" },
  { slug: "acid-and-base", title: "Acid and Base", gameUrl: "https://akmax3202.itch.io/acid-and-base", category: "chemistry" },
  { slug: "double-displacement-reaction", title: "Double Displacement Reaction", gameUrl: "https://akmax3202.itch.io/double-displacement-reaction", category: "chemistry" },
  { slug: "displacement-reaction", title: "Displacement Reaction", gameUrl: "https://akmax3202.itch.io/displacement-reaction", category: "chemistry" },
  { slug: "decomposition-reaction", title: "Decomposition Reaction", gameUrl: "https://akmax3202.itch.io/decomposition-reaction", category: "chemistry" },
  { slug: "combination-reaction", title: "Combination Reaction", gameUrl: "https://akmax3202.itch.io/combination-reaction-lower-quality", category: "chemistry" },

  // ── Physics ──
  { slug: "refraction-through-glass-slab", title: "Refraction Through Glass Slab", gameUrl: "https://akmax3202.itch.io/refraction-through-glass-slab", category: "physics" },
  { slug: "concave-mirror", title: "Concave Mirror", gameUrl: "https://akmax3202.itch.io/concave-mirrror", category: "physics" },
  { slug: "convex-mirror", title: "Convex Mirror", gameUrl: "https://akmax3202.itch.io/convex-mirror", category: "physics" },
  { slug: "archimedes-principle", title: "Archimedes' Principle", gameUrl: "https://akmax3202.itch.io/archimedes-principle2", category: "physics" },
  { slug: "rutherfords-scattering-experiment", title: "Rutherford's Scattering Experiment", gameUrl: "https://akmax3202.itch.io/rutherford-modal", category: "physics" },
  { slug: "flickering-test", title: "Flickering Test", gameUrl: "https://akmax3202.itch.io/flickering-test", category: "physics" },

  // ── Environment ──
  { slug: "ozone-layer", title: "Ozone Layer", gameUrl: "https://akmax3202.itch.io/ozone-layer", category: "environment" },
  { slug: "rain-cycle", title: "Rain Cycle (Water Cycle)", gameUrl: "https://akmax3202.itch.io/rain-cycle", category: "environment" },
  { slug: "atmosphere-layers", title: "Atmosphere Layers", gameUrl: "https://akmax3202.itch.io/atmosphere", category: "environment" },
  { slug: "wind-mill", title: "Wind Mill", gameUrl: "https://akmax3202.itch.io/wind-mil", category: "environment" },
  { slug: "hydropower-plant", title: "Hydropower Plant", gameUrl: "https://akmax3202.itch.io/hydropower-plant", category: "environment" },
];

export const categories = [
  { key: "all", label: "All" },
  { key: "biology", label: "Biology" },
  { key: "chemistry", label: "Chemistry" },
  { key: "physics", label: "Physics" },
  { key: "environment", label: "Environment" },
] as const;
