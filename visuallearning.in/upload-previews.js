const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { execSync } = require('child_process');

const PREVIEW_DIR = 'N:/Main data/virtual lab preview';
const CLOUD_NAME = 'dvtuf1zqn';
const API_KEY = '727822633118353';
const API_SECRET = 'D41LANrVz7TTgOiGFMs4gfNIEpg';

// Map filename (without extension) -> game slug
const FILE_TO_SLUG = {
  'Acid-and-base-by-akmax3202-Google-Chrome-2023-12-16-16-45-28_x264': 'acid-and-base',
  'Acid-base-indicator-by-akmax3202-Google-Chrome-2023-12-16-16-59-44_x264': 'acid-base-ph-indicator',
  'animal-cell0001-0125': 'animal-cell',
  'Animal-tissue-by-akmax3202-Google-Chrome-2023-12-16-11-03-00_x264': 'animal-tissue',
  'Archimedes-Principle-Final-by-akmax3202-Google-Chrome-2023-12-16-09-56-23_x264': 'archimedes-principle',
  'Artery-and-vein0001-0125': 'artery-vein',
  'Becteria20001-0125': 'bacterial-cell',
  'blood-vesul0001-0125': 'blood-vessel',
  'Brain0001-0125': 'brain',
  'brain-and-Eye0001-0125': 'brain-stem-and-eye',
  'Brain-and-skull-reconstruction0001-0125': 'brain-and-skull-reconstruction',
  'Combination-Reaction-Lower-quality-by-akmax3202-Google-Chrome-2023-12-16-10-15-09_x264': 'combination-reaction',
  'Common-desease-in-local-plants-by-akmax3202-Google-Chrome-2023-12-16-11-59-43_x264': 'common-disease-in-plants',
  'Complex-Permanent-Tissue-in-Plants-by-akmax3202-Google-Chrome-2023-12-16-10-49-42_x264': 'complex-permanent-tissue',
  'Concave-Mirrror-by-akmax3202-Google-Chrome-2023-12-16-17-45-56_x264': 'concave-mirror',
  'Connective-tissues-by-akmax3202-Google-Chrome-2023-12-16-11-16-32_x264': 'connective-tissues',
  'Convex-mirror-by-akmax3202-Google-Chrome-2023-12-16-17-41-24_x264': 'convex-mirror',
  'Decomposition-reaction-by-akmax3202-Google-Chrome-2023-12-16-12-18-08_x264': 'decomposition-reaction',
  'Displacement-reaction-by-akmax3202-Google-Chrome-2023-12-17-11-34-04_x264': 'displacement-reaction',
  'Diversity-in-Animal-by-akmax3202-Google-Chrome-2023-12-16-12-13-21_x264': 'diversity-in-animal',
  'Diversity-in-Plants-by-akmax3202-Google-Chrome-2023-12-16-11-28-35_x264': 'diversity-in-plants',
  'Double-displacement-reaction-by-akmax3202-Google-Chrome-2023-12-16-12-30-58_x264': 'double-displacement-reaction',
  'Ear-Cross-section0001-0125': 'human-ear',
  'Epithelial-tissue-and-its-types-by-akmax3202-Google-Chrome-2023-12-16-10-54-15_x264': 'epithelial-tissue',
  'Ethanoic-acid-by-akmax3202-Google-Chrome-2024-01-02-16-59-45_x264': 'ethanoic-acid-properties',
  'Ethanol-and-ethanoic-acid-by-akmax3202-Google-Chrome-2023-12-16-17-32-44_x264': 'ethanol-and-ethanoic-acid',
  'Eyes0001-0250': 'human-eye',
  'Female-reproductive-set0001-0125': 'female-reproduction',
  'fetal-0001-0125': 'fetal-development-stage',
  'Flower-cross-section0001-0125': 'flower-cross-section',
  'Hard-and-distilled-water-by-akmax3202-Google-Chrome-2023-12-16-17-08-30_x264': 'hard-and-distilled-water',
  'Heart-20000-0125': 'human-heart',
  'Herbarium-sheet-by-akmax3202-Google-Chrome-2023-12-16-11-42-52_x264': 'herbarium-sheet',
  'how-breathing-work0001-0125': 'how-breathing-works',
  'Human-body-musculer_0001-0125': 'human-musculoskeletal-system',
  'Human-Eye-cross-section0001-0125': 'human-eye-cross-section',
  'Human-Liver-and-Pancharesh.png0001-0250': 'human-liver-with-pancreas',
  'Human-Respiratory-system0001-0125': 'human-respiratory-system',
  'Hydropower-plant0001-0125': 'hydropower-plant',
  'Identify-chemicals-by-akmax3202-Google-Chrome-2023-12-16-17-18-42_x264': 'identify-chemicals',
  'Identifying-the-Different-Plant-Tissues-by-akmax3202-Google-Chrome-2023-12-16-10-26-34_x264': 'plant-tissues',
  'Kidney0001-0125': 'human-kidney',
  'lung-and-branch0001-0125': 'lungs-with-bronchial-tree',
  'male-reproductve-set_x264_x264': 'male-reproductive-system',
  'Medically-accurate-Human-heart-and-lung0001-0125': 'human-heart-and-lungs',
  'Meristematic-Tissues.-by-akmax3202-Google-Chrome-2023-12-16-10-35-45_x264': 'meristematic-tissues',
  'Monocot-and-Dicot-Plants-by-akmax3202-Google-Chrome-2023-12-16-11-36-46_x264': 'monocot-and-dicot-plants',
  'Muscle-tissue-by-akmax3202-Google-Chrome-2023-12-16-11-23-15_x264': 'muscle-tissue',
  'Nephrone0001-0250': 'nephrone',
  'Nervous-system-and-Dura-mater0001-0125': 'nervous-system',
  'Ozone-layer0001-0125': 'ozone-layer',
  'Photoshynthisis.png0001-0125': 'photosynthesis',
  'Rain-cycle0001-0125': 'rain-cycle',
  'Refraction-through-glass-slab-by-akmax3202-Google-Chrome-2023-12-16-17-51-27_x264': 'refraction-through-glass-slab',
  'Simple-Permanent-Tissue-in-Plants-by-akmax3202-Google-Chrome-2023-12-16-10-42-51_x264': 'simple-permanent-tissue',
  'skull0001-0125': 'human-skull',
  'Wind-mil0001-0125': 'wind-mill',
};

async function main() {
  const files = fs.readdirSync(PREVIEW_DIR);
  const results = {};
  let uploaded = 0, skipped = 0;

  for (const file of files) {
    const ext = path.extname(file);
    const baseName = path.basename(file, ext);
    const slug = FILE_TO_SLUG[baseName];

    if (!slug) {
      console.log(`  SKIP (no mapping): ${file}`);
      skipped++;
      continue;
    }

    if (results[slug]) {
      console.log(`  SKIP (duplicate): ${file}`);
      skipped++;
      continue;
    }

    const filePath = path.join(PREVIEW_DIR, file);
    const publicId = `virtual-lab-previews/${slug}`;

    console.log(`  Uploading: ${file} -> ${slug}...`);
    try {
      const timestamp = Math.floor(Date.now() / 1000);
      const sigStr = `public_id=${publicId}&timestamp=${timestamp}${API_SECRET}`;
      const signature = crypto.createHash('sha1').update(sigStr).digest('hex');

      const output = execSync(
        `curl -s -X POST "https://api.cloudinary.com/v1_1/${CLOUD_NAME}/video/upload" ` +
        `-F "file=@${filePath.replace(/\\/g, '/')}" ` +
        `-F "public_id=${publicId}" ` +
        `-F "timestamp=${timestamp}" ` +
        `-F "api_key=${API_KEY}" ` +
        `-F "signature=${signature}"`,
        { timeout: 300000, maxBuffer: 10 * 1024 * 1024 }
      ).toString();

      const data = JSON.parse(output);
      if (data.secure_url) {
        results[slug] = data.secure_url;
        console.log(`  OK: ${data.secure_url}`);
        uploaded++;
      } else {
        console.log(`  FAIL: ${JSON.stringify(data).slice(0, 200)}`);
      }
    } catch (err) {
      console.log(`  FAIL: ${err.message.slice(0, 200)}`);
    }
  }

  console.log(`\nDone! ${uploaded} uploaded, ${skipped} skipped`);

  // Output the mapping for the data file
  const outputPath = path.join(__dirname, 'preview-urls.json');
  fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));
  console.log(`URL mapping saved to: ${outputPath}`);
}

main().catch(console.error);
