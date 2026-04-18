export interface VirtualLabGame {
  slug: string;
  title: string;
  embedUrl: string;
  category: "biology" | "physics" | "chemistry" | "environment";
}

export const virtualLabGames: VirtualLabGame[] = [
  // ── Biology: Human Body ──
  { slug: "human-heart", title: "Human Heart", embedUrl: "https://itch.io/embed-upload/2476899/index.html", category: "biology" },
  { slug: "human-heart-and-lungs", title: "Human Heart and Lungs", embedUrl: "https://itch.io/embed-upload/4270727/index.html", category: "biology" },
  { slug: "human-respiratory-system", title: "Human Respiratory System", embedUrl: "https://itch.io/embed-upload/6693216/index.html", category: "biology" },
  { slug: "lungs-with-bronchial-tree", title: "Lungs with Bronchial Tree", embedUrl: "https://itch.io/embed-upload/12674/index.html", category: "biology" },
  { slug: "how-breathing-works", title: "How Breathing Works", embedUrl: "https://itch.io/embed-upload/1223479/index.html", category: "biology" },
  { slug: "brain", title: "Brain", embedUrl: "https://itch.io/embed-upload/5317035/index.html", category: "biology" },
  { slug: "brain-stem-and-eye", title: "Brain Stem and Eye", embedUrl: "https://itch.io/embed-upload/1370888/index.html", category: "biology" },
  { slug: "brain-and-skull-reconstruction", title: "Brain and Skull Reconstruction", embedUrl: "https://itch.io/embed-upload/5418254/index.html", category: "biology" },
  { slug: "human-skull", title: "Human Skull", embedUrl: "https://itch.io/embed-upload/2577930/index.html", category: "biology" },
  { slug: "human-eye", title: "Human Eye", embedUrl: "https://itch.io/embed-upload/9424622/index.html", category: "biology" },
  { slug: "human-eye-cross-section", title: "Human Eye Cross Section", embedUrl: "https://itch.io/embed-upload/9854985/index.html", category: "biology" },
  { slug: "human-ear", title: "Human Ear", embedUrl: "https://itch.io/embed-upload/8735725/index.html", category: "biology" },
  { slug: "human-kidney", title: "Human Kidney", embedUrl: "https://itch.io/embed-upload/8642321/index.html", category: "biology" },
  { slug: "nephrone", title: "Nephron", embedUrl: "https://itch.io/embed-upload/6621548/index.html", category: "biology" },
  { slug: "human-liver-with-pancreas", title: "Human Liver with Pancreas", embedUrl: "https://itch.io/embed-upload/4884655/index.html", category: "biology" },
  { slug: "human-musculoskeletal-system", title: "Human Musculoskeletal System", embedUrl: "https://itch.io/embed-upload/8729747/index.html", category: "biology" },
  { slug: "nervous-system", title: "Nervous System", embedUrl: "https://itch.io/embed-upload/2212596/index.html", category: "biology" },
  { slug: "blood-vessel", title: "Blood Vessel", embedUrl: "https://itch.io/embed-upload/5844736/index.html", category: "biology" },
  { slug: "artery-vein", title: "Artery and Vein", embedUrl: "https://itch.io/embed-upload/7017411/index.html", category: "biology" },
  { slug: "male-reproductive-system", title: "Male Reproductive System", embedUrl: "https://itch.io/embed-upload/1763051/index.html", category: "biology" },
  { slug: "female-reproduction", title: "Female Reproductive System", embedUrl: "https://itch.io/embed-upload/498534/index.html", category: "biology" },
  { slug: "fetal-development-stage", title: "Fetal Development Stage", embedUrl: "https://itch.io/embed-upload/3307380/index.html", category: "biology" },
  { slug: "muscle-tissue", title: "Muscle Tissue", embedUrl: "https://itch.io/embed-upload/8716606/index.html", category: "biology" },
  { slug: "connective-tissues", title: "Connective Tissues", embedUrl: "https://itch.io/embed-upload/601157/index.html", category: "biology" },
  { slug: "epithelial-tissue", title: "Epithelial Tissue and Its Types", embedUrl: "https://itch.io/embed-upload/3149295/index.html", category: "biology" },
  { slug: "animal-tissue", title: "Animal Tissue", embedUrl: "https://itch.io/embed-upload/2235573/index.html", category: "biology" },

  // ── Biology: Cell & Microorganisms ──
  { slug: "animal-cell", title: "Animal Cell", embedUrl: "https://itch.io/embed-upload/5882503/index.html", category: "biology" },
  { slug: "cell", title: "Cell", embedUrl: "https://itch.io/embed-upload/4913820/index.html", category: "biology" },
  { slug: "bacterial-cell", title: "Bacterial Cell", embedUrl: "https://itch.io/embed-upload/5252734/index.html", category: "biology" },
  { slug: "compound-microscope", title: "Compound Microscope", embedUrl: "https://itch.io/embed-upload/3191554/index.html", category: "biology" },

  // ── Biology: Plants ──
  { slug: "photosynthesis", title: "Photosynthesis", embedUrl: "https://itch.io/embed-upload/7199934/index.html", category: "biology" },
  { slug: "flower-cross-section", title: "Flower Cross Section", embedUrl: "https://itch.io/embed-upload/3396917/index.html", category: "biology" },
  { slug: "monocot-and-dicot-plants", title: "Monocot and Dicot Plants", embedUrl: "https://itch.io/embed-upload/1853959/index.html", category: "biology" },
  { slug: "diversity-in-plants", title: "Diversity in Plants", embedUrl: "https://itch.io/embed-upload/5300686/index.html", category: "biology" },
  { slug: "herbarium-sheet", title: "Herbarium Sheet", embedUrl: "https://itch.io/embed-upload/6356124/index.html", category: "biology" },
  { slug: "plant-tissues", title: "Identifying Plant Tissues", embedUrl: "https://itch.io/embed-upload/294779/index.html", category: "biology" },
  { slug: "simple-permanent-tissue", title: "Simple Permanent Tissue in Plants", embedUrl: "https://itch.io/embed-upload/3435712/index.html", category: "biology" },
  { slug: "complex-permanent-tissue", title: "Complex Permanent Tissue in Plants", embedUrl: "https://itch.io/embed-upload/666251/index.html", category: "biology" },
  { slug: "meristematic-tissues", title: "Meristematic Tissues", embedUrl: "https://itch.io/embed-upload/7415611/index.html", category: "biology" },
  { slug: "common-disease-in-plants", title: "Common Disease in Local Plants", embedUrl: "https://itch.io/embed-upload/3242675/index.html", category: "biology" },

  // ── Biology: Animals & Life Cycles ──
  { slug: "frog-life-cycle", title: "Frog Life Cycle", embedUrl: "https://itch.io/embed-upload/4553018/index.html", category: "biology" },
  { slug: "diversity-in-animal", title: "Diversity in Animals", embedUrl: "https://itch.io/embed-upload/14429/index.html", category: "biology" },
  { slug: "earthworm", title: "Earthworm", embedUrl: "https://itch.io/embed-upload/2643878/index.html", category: "biology" },

  // ── Chemistry ──
  { slug: "ethanol-and-ethanoic-acid", title: "Ethanol and Ethanoic Acid", embedUrl: "https://itch.io/embed-upload/9450207/index.html", category: "chemistry" },
  { slug: "ethanoic-acid-properties", title: "Properties of Ethanoic Acid", embedUrl: "https://itch.io/embed-upload/5625248/index.html", category: "chemistry" },
  { slug: "identify-chemicals", title: "Identify Chemicals", embedUrl: "https://itch.io/embed-upload/6285628/index.html", category: "chemistry" },
  { slug: "hard-and-distilled-water", title: "Hard and Distilled Water", embedUrl: "https://itch.io/embed-upload/6571954/index.html", category: "chemistry" },
  { slug: "acid-base-ph-indicator", title: "Acid Base pH Indicator", embedUrl: "https://itch.io/embed-upload/841907/index.html", category: "chemistry" },
  { slug: "acid-and-base", title: "Acid and Base", embedUrl: "https://itch.io/embed-upload/1835189/index.html", category: "chemistry" },
  { slug: "double-displacement-reaction", title: "Double Displacement Reaction", embedUrl: "https://itch.io/embed-upload/8666333/index.html", category: "chemistry" },
  { slug: "displacement-reaction", title: "Displacement Reaction", embedUrl: "https://itch.io/embed-upload/9559143/index.html", category: "chemistry" },
  { slug: "decomposition-reaction", title: "Decomposition Reaction", embedUrl: "https://itch.io/embed-upload/6108447/index.html", category: "chemistry" },
  { slug: "combination-reaction", title: "Combination Reaction", embedUrl: "https://itch.io/embed-upload/6815838/index.html", category: "chemistry" },

  // ── Physics ──
  { slug: "refraction-through-glass-slab", title: "Refraction Through Glass Slab", embedUrl: "https://itch.io/embed-upload/3685520/index.html", category: "physics" },
  { slug: "concave-mirror", title: "Concave Mirror", embedUrl: "https://itch.io/embed-upload/3441877/index.html", category: "physics" },
  { slug: "convex-mirror", title: "Convex Mirror", embedUrl: "https://itch.io/embed-upload/5896639/index.html", category: "physics" },
  { slug: "archimedes-principle", title: "Archimedes' Principle", embedUrl: "https://itch.io/embed-upload/8514896/index.html", category: "physics" },
  { slug: "rutherfords-scattering-experiment", title: "Rutherford's Scattering Experiment", embedUrl: "https://itch.io/embed-upload/532447/index.html", category: "physics" },
  { slug: "flickering-test", title: "Flickering Test", embedUrl: "https://itch.io/embed-upload/772748/index.html", category: "physics" },

  // ── Environment ──
  { slug: "ozone-layer", title: "Ozone Layer", embedUrl: "https://itch.io/embed-upload/6147831/index.html", category: "environment" },
  { slug: "rain-cycle", title: "Rain Cycle (Water Cycle)", embedUrl: "https://itch.io/embed-upload/6000734/index.html", category: "environment" },
  { slug: "atmosphere-layers", title: "Atmosphere Layers", embedUrl: "https://itch.io/embed-upload/6225513/index.html", category: "environment" },
  { slug: "wind-mill", title: "Wind Mill", embedUrl: "https://itch.io/embed-upload/730271/index.html", category: "environment" },
  { slug: "hydropower-plant", title: "Hydropower Plant", embedUrl: "https://itch.io/embed-upload/1041444/index.html", category: "environment" },
];

export const categories = [
  { key: "all", label: "All" },
  { key: "biology", label: "Biology" },
  { key: "chemistry", label: "Chemistry" },
  { key: "physics", label: "Physics" },
  { key: "environment", label: "Environment" },
] as const;
