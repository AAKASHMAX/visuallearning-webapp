export interface VirtualLabGame {
  slug: string;
  title: string;
  gameUrl: string;
  uploadId: string;
  category: "biology" | "physics" | "chemistry" | "environment";
}

export const virtualLabGames: VirtualLabGame[] = [
  // ── Biology: Human Body ──
  { slug: "human-heart", title: "Human Heart", gameUrl: "https://akmax3202.itch.io/human-heart", uploadId: "1259600", category: "biology" },
  { slug: "human-heart-and-lungs", title: "Human Heart and Lungs", gameUrl: "https://akmax3202.itch.io/human-heart-and-lungs", uploadId: "3785488", category: "biology" },
  { slug: "human-respiratory-system", title: "Human Respiratory System", gameUrl: "https://akmax3202.itch.io/human", uploadId: "9271504", category: "biology" },
  { slug: "lungs-with-bronchial-tree", title: "Lungs with Bronchial Tree", gameUrl: "https://akmax3202.itch.io/lungs-with-bronchial", uploadId: "8486958", category: "biology" },
  { slug: "how-breathing-works", title: "How Breathing Works", gameUrl: "https://akmax3202.itch.io/how-breathing-works", uploadId: "7012023", category: "biology" },
  { slug: "brain", title: "Brain", gameUrl: "https://akmax3202.itch.io/brain", uploadId: "3777124", category: "biology" },
  { slug: "brain-stem-and-eye", title: "Brain Stem and Eye", gameUrl: "https://akmax3202.itch.io/brain-stem-and-eye", uploadId: "186981", category: "biology" },
  { slug: "brain-and-skull-reconstruction", title: "Brain and Skull Reconstruction", gameUrl: "https://akmax3202.itch.io/brain-and-skull-reconstruction", uploadId: "6684831", category: "biology" },
  { slug: "human-skull", title: "Human Skull", gameUrl: "https://akmax3202.itch.io/human-skull", uploadId: "6696854", category: "biology" },
  { slug: "human-eye", title: "Human Eye", gameUrl: "https://akmax3202.itch.io/human-eye", uploadId: "8043025", category: "biology" },
  { slug: "human-eye-cross-section", title: "Human Eye Cross Section", gameUrl: "https://akmax3202.itch.io/human-eye-cross-section", uploadId: "1604898", category: "biology" },
  { slug: "human-ear", title: "Human Ear", gameUrl: "https://akmax3202.itch.io/fetal-development", uploadId: "5155614", category: "biology" },
  { slug: "human-kidney", title: "Human Kidney", gameUrl: "https://akmax3202.itch.io/human-kidney", uploadId: "5460796", category: "biology" },
  { slug: "nephrone", title: "Nephron", gameUrl: "https://akmax3202.itch.io/nephrone", uploadId: "3167513", category: "biology" },
  { slug: "human-liver-with-pancreas", title: "Human Liver with Pancreas", gameUrl: "https://akmax3202.itch.io/human-l", uploadId: "4583714", category: "biology" },
  { slug: "human-musculoskeletal-system", title: "Human Musculoskeletal System", gameUrl: "https://akmax3202.itch.io/human-musculoskeletal-system", uploadId: "1946955", category: "biology" },
  { slug: "nervous-system", title: "Nervous System", gameUrl: "https://akmax3202.itch.io/nervous-system", uploadId: "1569748", category: "biology" },
  { slug: "blood-vessel", title: "Blood Vessel", gameUrl: "https://akmax3202.itch.io/blood-vessel", uploadId: "6920469", category: "biology" },
  { slug: "artery-vein", title: "Artery and Vein", gameUrl: "https://akmax3202.itch.io/baterial-cell", uploadId: "2873829", category: "biology" },
  { slug: "male-reproductive-system", title: "Male Reproductive System", gameUrl: "https://akmax3202.itch.io/male-reproductive-system", uploadId: "6803413", category: "biology" },
  { slug: "female-reproduction", title: "Female Reproductive System", gameUrl: "https://akmax3202.itch.io/female-reproduction", uploadId: "7337249", category: "biology" },
  { slug: "fetal-development-stage", title: "Fetal Development Stage", gameUrl: "https://akmax3202.itch.io/fetal-development-stage", uploadId: "164837", category: "biology" },
  { slug: "muscle-tissue", title: "Muscle Tissue", gameUrl: "https://akmax3202.itch.io/muscle-tissue", uploadId: "6671726", category: "biology" },
  { slug: "connective-tissues", title: "Connective Tissues", gameUrl: "https://akmax3202.itch.io/connective-tissues", uploadId: "8418455", category: "biology" },
  { slug: "epithelial-tissue", title: "Epithelial Tissue and Its Types", gameUrl: "https://akmax3202.itch.io/epithelial-tissue-and-its-types", uploadId: "8300873", category: "biology" },
  { slug: "animal-tissue", title: "Animal Tissue", gameUrl: "https://akmax3202.itch.io/animal-tissue", uploadId: "9282758", category: "biology" },

  // ── Biology: Cell & Microorganisms ──
  { slug: "animal-cell", title: "Animal Cell", gameUrl: "https://akmax3202.itch.io/animal-cell", uploadId: "5375340", category: "biology" },
  { slug: "cell", title: "Cell", gameUrl: "https://akmax3202.itch.io/cell", uploadId: "2294620", category: "biology" },
  { slug: "bacterial-cell", title: "Bacterial Cell", gameUrl: "https://akmax3202.itch.io/bacterial-cell", uploadId: "1556046", category: "biology" },
  { slug: "compound-microscope", title: "Compound Microscope", gameUrl: "https://akmax3202.itch.io/compound-microscope", uploadId: "161691", category: "biology" },

  // ── Biology: Plants ──
  { slug: "photosynthesis", title: "Photosynthesis", gameUrl: "https://akmax3202.itch.io/photosynthesis", uploadId: "7517493", category: "biology" },
  { slug: "flower-cross-section", title: "Flower Cross Section", gameUrl: "https://akmax3202.itch.io/flower-cross-section", uploadId: "574642", category: "biology" },
  { slug: "monocot-and-dicot-plants", title: "Monocot and Dicot Plants", gameUrl: "https://akmax3202.itch.io/monocot-and-dicot-plants", uploadId: "22963", category: "biology" },
  { slug: "diversity-in-plants", title: "Diversity in Plants", gameUrl: "https://akmax3202.itch.io/diversity-in-plants", uploadId: "831738", category: "biology" },
  { slug: "herbarium-sheet", title: "Herbarium Sheet", gameUrl: "https://akmax3202.itch.io/herbarium-sheet", uploadId: "7533518", category: "biology" },
  { slug: "plant-tissues", title: "Identifying Plant Tissues", gameUrl: "https://akmax3202.itch.io/plant-tissuehigh", uploadId: "2994625", category: "biology" },
  { slug: "simple-permanent-tissue", title: "Simple Permanent Tissue in Plants", gameUrl: "https://akmax3202.itch.io/lab-view-test", uploadId: "9541124", category: "biology" },
  { slug: "complex-permanent-tissue", title: "Complex Permanent Tissue in Plants", gameUrl: "https://akmax3202.itch.io/complex", uploadId: "9443847", category: "biology" },
  { slug: "meristematic-tissues", title: "Meristematic Tissues", gameUrl: "https://akmax3202.itch.io/lab-view-test-1", uploadId: "2467381", category: "biology" },
  { slug: "common-disease-in-plants", title: "Common Disease in Local Plants", gameUrl: "https://akmax3202.itch.io/common", uploadId: "8215022", category: "biology" },

  // ── Biology: Animals & Life Cycles ──
  { slug: "frog-life-cycle", title: "Frog Life Cycle", gameUrl: "https://akmax3202.itch.io/frog-life-cycle", uploadId: "2952893", category: "biology" },
  { slug: "diversity-in-animal", title: "Diversity in Animals", gameUrl: "https://akmax3202.itch.io/diversity-in-animal", uploadId: "4375673", category: "biology" },
  { slug: "earthworm", title: "Earthworm", gameUrl: "https://akmax3202.itch.io/continent", uploadId: "290976", category: "biology" },

  // ── Chemistry ──
  { slug: "ethanol-and-ethanoic-acid", title: "Ethanol and Ethanoic Acid", gameUrl: "https://akmax3202.itch.io/ethanol-and-ethanoic-acid", uploadId: "6406768", category: "chemistry" },
  { slug: "ethanoic-acid-properties", title: "Properties of Ethanoic Acid", gameUrl: "https://akmax3202.itch.io/propeties-of-ethanoic-acid", uploadId: "2549397", category: "chemistry" },
  { slug: "identify-chemicals", title: "Identify Chemicals", gameUrl: "https://akmax3202.itch.io/identify-chemicals", uploadId: "89760", category: "chemistry" },
  { slug: "hard-and-distilled-water", title: "Hard and Distilled Water", gameUrl: "https://akmax3202.itch.io/hard-and-distilled-water", uploadId: "9665428", category: "chemistry" },
  { slug: "acid-base-ph-indicator", title: "Acid Base pH Indicator", gameUrl: "https://akmax3202.itch.io/acid-base-indicator", uploadId: "9586147", category: "chemistry" },
  { slug: "acid-and-base", title: "Acid and Base", gameUrl: "https://akmax3202.itch.io/acid-and-base", uploadId: "9975887", category: "chemistry" },
  { slug: "double-displacement-reaction", title: "Double Displacement Reaction", gameUrl: "https://akmax3202.itch.io/double-displacement-reaction", uploadId: "114500", category: "chemistry" },
  { slug: "displacement-reaction", title: "Displacement Reaction", gameUrl: "https://akmax3202.itch.io/displacement-reaction", uploadId: "8390040", category: "chemistry" },
  { slug: "decomposition-reaction", title: "Decomposition Reaction", gameUrl: "https://akmax3202.itch.io/decomposition-reaction", uploadId: "1943607", category: "chemistry" },
  { slug: "combination-reaction", title: "Combination Reaction", gameUrl: "https://akmax3202.itch.io/combination-reaction-lower-quality", uploadId: "76777", category: "chemistry" },

  // ── Physics ──
  { slug: "refraction-through-glass-slab", title: "Refraction Through Glass Slab", gameUrl: "https://akmax3202.itch.io/refraction-through-glass-slab", uploadId: "1929846", category: "physics" },
  { slug: "concave-mirror", title: "Concave Mirror", gameUrl: "https://akmax3202.itch.io/concave-mirrror", uploadId: "289226", category: "physics" },
  { slug: "convex-mirror", title: "Convex Mirror", gameUrl: "https://akmax3202.itch.io/convex-mirror", uploadId: "3411570", category: "physics" },
  { slug: "archimedes-principle", title: "Archimedes' Principle", gameUrl: "https://akmax3202.itch.io/archimedes-principle2", uploadId: "4155132", category: "physics" },
  { slug: "rutherfords-scattering-experiment", title: "Rutherford's Scattering Experiment", gameUrl: "https://akmax3202.itch.io/rutherford-modal", uploadId: "8697491", category: "physics" },
  { slug: "flickering-test", title: "Flickering Test", gameUrl: "https://akmax3202.itch.io/flickering-test", uploadId: "8236214", category: "physics" },

  // ── Environment ──
  { slug: "ozone-layer", title: "Ozone Layer", gameUrl: "https://akmax3202.itch.io/ozone-layer", uploadId: "4773517", category: "environment" },
  { slug: "rain-cycle", title: "Rain Cycle (Water Cycle)", gameUrl: "https://akmax3202.itch.io/rain-cycle", uploadId: "6561343", category: "environment" },
  { slug: "atmosphere-layers", title: "Atmosphere Layers", gameUrl: "https://akmax3202.itch.io/atmosphere", uploadId: "6782779", category: "environment" },
  { slug: "wind-mill", title: "Wind Mill", gameUrl: "https://akmax3202.itch.io/wind-mil", uploadId: "6449510", category: "environment" },
  { slug: "hydropower-plant", title: "Hydropower Plant", gameUrl: "https://akmax3202.itch.io/hydropower-plant", uploadId: "3008402", category: "environment" },
];

export const categories = [
  { key: "all", label: "All" },
  { key: "biology", label: "Biology" },
  { key: "chemistry", label: "Chemistry" },
  { key: "physics", label: "Physics" },
  { key: "environment", label: "Environment" },
] as const;
