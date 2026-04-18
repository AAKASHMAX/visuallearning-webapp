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

// Cloudinary preview video URLs — use f_mp4 transformation for browser compatibility
const CLOUDINARY_BASE = "https://res.cloudinary.com/dvtuf1zqn/video/upload/f_mp4,q_auto";

export const previewVideos: Record<string, string> = {
  "acid-and-base": `${CLOUDINARY_BASE}/v1776489275/virtual-lab-previews/acid-and-base.mp4`,
  "acid-base-ph-indicator": `${CLOUDINARY_BASE}/v1776489283/virtual-lab-previews/acid-base-ph-indicator.mp4`,
  "animal-cell": `${CLOUDINARY_BASE}/v1776489290/virtual-lab-previews/animal-cell.mkv`,
  "animal-tissue": `${CLOUDINARY_BASE}/v1776489297/virtual-lab-previews/animal-tissue.mp4`,
  "archimedes-principle": `${CLOUDINARY_BASE}/v1776489313/virtual-lab-previews/archimedes-principle.mp4`,
  "artery-vein": `${CLOUDINARY_BASE}/v1776489320/virtual-lab-previews/artery-vein.mkv`,
  "bacterial-cell": `${CLOUDINARY_BASE}/v1776489329/virtual-lab-previews/bacterial-cell.mkv`,
  "blood-vessel": `${CLOUDINARY_BASE}/v1776489336/virtual-lab-previews/blood-vessel.mkv`,
  "brain": `${CLOUDINARY_BASE}/v1776489356/virtual-lab-previews/brain.mkv`,
  "brain-stem-and-eye": `${CLOUDINARY_BASE}/v1776489343/virtual-lab-previews/brain-stem-and-eye.mkv`,
  "brain-and-skull-reconstruction": `${CLOUDINARY_BASE}/v1776489350/virtual-lab-previews/brain-and-skull-reconstruction.mkv`,
  "combination-reaction": `${CLOUDINARY_BASE}/v1776489364/virtual-lab-previews/combination-reaction.mp4`,
  "common-disease-in-plants": `${CLOUDINARY_BASE}/v1776489371/virtual-lab-previews/common-disease-in-plants.mp4`,
  "complex-permanent-tissue": `${CLOUDINARY_BASE}/v1776489378/virtual-lab-previews/complex-permanent-tissue.mp4`,
  "concave-mirror": `${CLOUDINARY_BASE}/v1776489385/virtual-lab-previews/concave-mirror.mp4`,
  "connective-tissues": `${CLOUDINARY_BASE}/v1776489393/virtual-lab-previews/connective-tissues.mp4`,
  "convex-mirror": `${CLOUDINARY_BASE}/v1776489399/virtual-lab-previews/convex-mirror.mp4`,
  "decomposition-reaction": `${CLOUDINARY_BASE}/v1776489406/virtual-lab-previews/decomposition-reaction.mp4`,
  "displacement-reaction": `${CLOUDINARY_BASE}/v1776489415/virtual-lab-previews/displacement-reaction.mp4`,
  "diversity-in-animal": `${CLOUDINARY_BASE}/v1776489423/virtual-lab-previews/diversity-in-animal.mp4`,
  "diversity-in-plants": `${CLOUDINARY_BASE}/v1776489432/virtual-lab-previews/diversity-in-plants.mp4`,
  "double-displacement-reaction": `${CLOUDINARY_BASE}/v1776489442/virtual-lab-previews/double-displacement-reaction.mp4`,
  "epithelial-tissue": `${CLOUDINARY_BASE}/v1776489458/virtual-lab-previews/epithelial-tissue.mp4`,
  "ethanoic-acid-properties": `${CLOUDINARY_BASE}/v1776489467/virtual-lab-previews/ethanoic-acid-properties.mp4`,
  "ethanol-and-ethanoic-acid": `${CLOUDINARY_BASE}/v1776489476/virtual-lab-previews/ethanol-and-ethanoic-acid.mp4`,
  "female-reproduction": `${CLOUDINARY_BASE}/v1776489489/virtual-lab-previews/female-reproduction.mkv`,
  "fetal-development-stage": `${CLOUDINARY_BASE}/v1776489495/virtual-lab-previews/fetal-development-stage.mkv`,
  "flower-cross-section": `${CLOUDINARY_BASE}/v1776489501/virtual-lab-previews/flower-cross-section.mkv`,
  "hard-and-distilled-water": `${CLOUDINARY_BASE}/v1776489509/virtual-lab-previews/hard-and-distilled-water.mp4`,
  "herbarium-sheet": `${CLOUDINARY_BASE}/v1776489525/virtual-lab-previews/herbarium-sheet.mp4`,
  "how-breathing-works": `${CLOUDINARY_BASE}/v1776489533/virtual-lab-previews/how-breathing-works.mkv`,
  "human-ear": `${CLOUDINARY_BASE}/v1776489448/virtual-lab-previews/human-ear.mkv`,
  "human-eye": `${CLOUDINARY_BASE}/v1776489482/virtual-lab-previews/human-eye.mkv`,
  "human-eye-cross-section": `${CLOUDINARY_BASE}/v1776489547/virtual-lab-previews/human-eye-cross-section.mkv`,
  "human-heart": `${CLOUDINARY_BASE}/v1776489516/virtual-lab-previews/human-heart.mkv`,
  "human-heart-and-lungs": `${CLOUDINARY_BASE}/v1776489617/virtual-lab-previews/human-heart-and-lungs.mkv`,
  "human-kidney": `${CLOUDINARY_BASE}/v1776489592/virtual-lab-previews/human-kidney.mkv`,
  "human-liver-with-pancreas": `${CLOUDINARY_BASE}/v1776489556/virtual-lab-previews/human-liver-with-pancreas.mkv`,
  "human-musculoskeletal-system": `${CLOUDINARY_BASE}/v1776489539/virtual-lab-previews/human-musculoskeletal-system.mkv`,
  "human-respiratory-system": `${CLOUDINARY_BASE}/v1776489562/virtual-lab-previews/human-respiratory-system.mkv`,
  "human-skull": `${CLOUDINARY_BASE}/v1776489703/virtual-lab-previews/human-skull.mkv`,
  "hydropower-plant": `${CLOUDINARY_BASE}/v1776489569/virtual-lab-previews/hydropower-plant.mkv`,
  "identify-chemicals": `${CLOUDINARY_BASE}/v1776489578/virtual-lab-previews/identify-chemicals.mp4`,
  "lungs-with-bronchial-tree": `${CLOUDINARY_BASE}/v1776489601/virtual-lab-previews/lungs-with-bronchial-tree.mkv`,
  "male-reproductive-system": `${CLOUDINARY_BASE}/v1776489609/virtual-lab-previews/male-reproductive-system.mp4`,
  "meristematic-tissues": `${CLOUDINARY_BASE}/v1776489626/virtual-lab-previews/meristematic-tissues.mp4`,
  "monocot-and-dicot-plants": `${CLOUDINARY_BASE}/v1776489635/virtual-lab-previews/monocot-and-dicot-plants.mp4`,
  "muscle-tissue": `${CLOUDINARY_BASE}/v1776489645/virtual-lab-previews/muscle-tissue.mp4`,
  "nephrone": `${CLOUDINARY_BASE}/v1776489651/virtual-lab-previews/nephrone.mkv`,
  "nervous-system": `${CLOUDINARY_BASE}/v1776489659/virtual-lab-previews/nervous-system.mkv`,
  "ozone-layer": `${CLOUDINARY_BASE}/v1776489664/virtual-lab-previews/ozone-layer.mkv`,
  "photosynthesis": `${CLOUDINARY_BASE}/v1776489672/virtual-lab-previews/photosynthesis.mkv`,
  "plant-tissues": `${CLOUDINARY_BASE}/v1776489585/virtual-lab-previews/plant-tissues.mp4`,
  "rain-cycle": `${CLOUDINARY_BASE}/v1776489681/virtual-lab-previews/rain-cycle.mkv`,
  "refraction-through-glass-slab": `${CLOUDINARY_BASE}/v1776489689/virtual-lab-previews/refraction-through-glass-slab.mp4`,
  "simple-permanent-tissue": `${CLOUDINARY_BASE}/v1776489697/virtual-lab-previews/simple-permanent-tissue.mp4`,
  "wind-mill": `${CLOUDINARY_BASE}/v1776489710/virtual-lab-previews/wind-mill.mkv`,
};
