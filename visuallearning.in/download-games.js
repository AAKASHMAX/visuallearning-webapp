const fs = require('fs');
const https = require('https');
const http = require('http');
const path = require('path');

const API_KEY = 'zUADMaN0QrP9PI3XTTwOE7LG0CjbNcODHZnjAlPr';
const DOWNLOAD_DIR = path.join(__dirname, 'game-downloads');

const GAME_IDS_WE_NEED = [
  2414739, 2414435, 2434754, 2434790, 2405185, 2434746, 2434784,
  2414075, 2436284, 2405387, 2239877, 2414042, 2414474, 2414466,
  2414446, 2434796, 2405138, 2434756, 2405496, 2405192, 2202263,
  2195919, 2187835, 2178892, 2411156, 2167391, 2405154, 2434778,
  2414071, 2405522, 2225338, 2208485, 2214724, 2136392, 2111243,
  2169164, 2111222, 2232152, 2434772, 2239651, 1959736, 2332640,
  2322923, 2311193, 2299092, 2291375, 2276188, 2263629, 2255897,
  2247980, 2126230, 2377912, 2373861, 2346960, 2101993, 1918190,
  2478126, 2414057, 2414051, 1959726, 2434813, 2434804,
];

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); } catch(e) { reject(new Error('Invalid JSON: ' + data.slice(0, 200))); }
      });
    }).on('error', reject);
  });
}

function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    const mod = url.startsWith('https') ? https : http;
    mod.get(url, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return downloadFile(res.headers.location, dest).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) return reject(new Error(`HTTP ${res.statusCode}`));
      const file = fs.createWriteStream(dest);
      res.pipe(file);
      file.on('finish', () => { file.close(); resolve(); });
    }).on('error', reject);
  });
}

async function main() {
  if (!fs.existsSync(DOWNLOAD_DIR)) fs.mkdirSync(DOWNLOAD_DIR, { recursive: true });

  console.log('Fetching game list...');
  const { games } = await fetchJson(`https://itch.io/api/1/${API_KEY}/my-games`);
  const toDownload = games.filter(g => GAME_IDS_WE_NEED.includes(g.id));
  console.log(`Found ${toDownload.length} games to download\n`);

  let success = 0, failed = 0;

  for (const game of toDownload) {
    const slug = game.url.split('/').pop();
    const zipPath = path.join(DOWNLOAD_DIR, `${slug}.zip`);

    // Skip if already downloaded with real size (>1KB)
    if (fs.existsSync(zipPath) && fs.statSync(zipPath).size > 1024) {
      console.log(`  SKIP ${game.title} (already exists)`);
      success++;
      continue;
    }

    try {
      // Step 1: Get upload info
      const uploadData = await fetchJson(`https://itch.io/api/1/${API_KEY}/game/${game.id}/uploads`);
      const uploads = uploadData.uploads;
      if (!uploads || (Array.isArray(uploads) && uploads.length === 0) || Object.keys(uploads).length === 0) {
        console.log(`  SKIP ${game.title} (no uploads)`);
        continue;
      }

      const upload = Array.isArray(uploads) ? uploads[0] : Object.values(uploads)[0];
      const sizeMB = ((upload.size || 0) / 1024 / 1024).toFixed(1);

      // Step 2: Get signed download URL
      const dlData = await fetchJson(`https://itch.io/api/1/${API_KEY}/upload/${upload.id}/download`);
      if (!dlData.url) {
        console.log(`  FAIL ${game.title} - no download URL in response`);
        failed++;
        continue;
      }

      // Step 3: Download from signed URL
      console.log(`  Downloading: ${game.title} (${sizeMB}MB)...`);
      await downloadFile(dlData.url, zipPath);
      const actualSize = fs.statSync(zipPath).size;
      console.log(`  OK: ${slug}.zip (${(actualSize / 1024 / 1024).toFixed(1)}MB)`);
      success++;
    } catch (err) {
      console.log(`  FAIL: ${game.title} - ${err.message}`);
      failed++;
    }
  }

  console.log(`\nDone! ${success} downloaded, ${failed} failed`);
  console.log(`Files in: ${DOWNLOAD_DIR}`);
}

main().catch(console.error);
