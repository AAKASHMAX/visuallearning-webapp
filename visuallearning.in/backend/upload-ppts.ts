/**
 * Upload converted PPT PDFs (light + dark) to Cloudinary and emit ppt-content.json.
 * Reads the manifest produced by ppt-pdfs/convert-ppts.ps1.
 *
 * Run: npx tsx upload-ppts.ts
 */
import "dotenv/config";
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

if (!process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
  throw new Error("Missing CLOUDINARY_* env vars (run from visuallearning.in/backend).");
}
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const MANIFEST = "C:/Users/aakash123/ppt-pdfs/manifest.json";

type M = { tier: string; chapterName: string; chapterFolder: string; light: string | null; dark: string | null };

async function up(path: string, folder: string): Promise<string> {
  const res = await cloudinary.uploader.upload(path, { resource_type: "raw", folder, use_filename: true, unique_filename: false, overwrite: true });
  return res.secure_url;
}

(async () => {
  const raw = JSON.parse(fs.readFileSync(MANIFEST, "utf-8").replace(/^﻿/, ""));
  const items: M[] = Array.isArray(raw) ? raw : [raw];
  console.log(`Manifest: ${items.length} chapters`);

  const out: any[] = [];
  let n = 0;
  for (const m of items) {
    n++;
    const folder = `ppts/tier${m.tier}`;
    let lightUrl: string | null = null;
    let darkUrl: string | null = null;
    try { if (m.light && fs.existsSync(m.light)) lightUrl = await up(m.light, folder); } catch (e: any) { console.log(`  ERR light ${m.chapterName}: ${e.message}`); }
    try { if (m.dark && fs.existsSync(m.dark)) darkUrl = await up(m.dark, folder); } catch (e: any) { console.log(`  ERR dark ${m.chapterName}: ${e.message}`); }
    out.push({ tier: m.tier, chapterName: m.chapterName, lightUrl, darkUrl });
    console.log(`[${n}/${items.length}] tier${m.tier} ${m.chapterName}: light=${lightUrl ? "✓" : "·"} dark=${darkUrl ? "✓" : "·"}`);
  }

  fs.writeFileSync(__dirname + "/ppt-content.json", JSON.stringify({ items: out }, null, 2), "utf-8");
  console.log(`\nDone → ppt-content.json (${out.length} chapters)`);
})();
