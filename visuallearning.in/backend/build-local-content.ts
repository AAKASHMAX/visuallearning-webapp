/**
 * Build physics-ready note content from local HTML folders on the N: drive.
 *
 * Self-detecting: for each chapter folder it picks the largest .html file, reads
 * its inline <style> + any linked .css, resolves every <img src> / css url() ref
 * against the file's ACTUAL location on disk (so it handles ../images, images,
 * ../Image, Images, NCERT solution/images, etc.), uploads each found image to
 * Cloudinary, rewrites the refs to Cloudinary URLs, strips the html wrapper, and
 * writes everything to local-content.json. NO database writes.
 *
 * Run:
 *   CATEGORIES="11NCERT,11Notes,12Notes" npx tsx build-local-content.ts
 *   (omit CATEGORIES to process all 5)
 *
 * Output: local-content.json  (consumed by physics import-local-content.ts)
 */
import "dotenv/config";
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import path from "path";

// Creds come from the main backend's .env (loaded by dotenv/config). Never hardcode them.
if (!process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
  throw new Error("Missing CLOUDINARY_* env vars — run from visuallearning.in/backend where .env defines them.");
}
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

type Cat = { root: string; tier: string; type: "notes" | "ncert" | "pyq"; subDir?: string };
const CATS: Record<string, Cat> = {
  "11NCERT": { root: "N:/Main data/11th Class/11th NCERT", tier: "11", type: "ncert" },
  "11Notes": { root: "N:/Main data/11th Class/11th Notes", tier: "11", type: "notes" },
  "12Notes": { root: "N:/Main data/12th class/12th Notes/12th Physics", tier: "12", type: "notes" },
  "12NCERT": { root: "N:/Main data/12th class/12th NCERT", tier: "12", type: "ncert" },
  "12PYQ": { root: "N:/Main data/12th class/12th PYQs", tier: "12", type: "pyq" },
  // "Codex Notes creation/Output": each chapter folder holds Notes/ and NCERT solution/ subfolders.
  "OUT11Notes": { root: "N:/Codex Notes creation/Output/11th", tier: "11", type: "notes", subDir: "Notes" },
  "OUT11NCERT": { root: "N:/Codex Notes creation/Output/11th", tier: "11", type: "ncert", subDir: "NCERT solution" },
  "OUT12Notes": { root: "N:/Codex Notes creation/Output/12th", tier: "12", type: "notes", subDir: "Notes" },
  "OUT12NCERT": { root: "N:/Codex Notes creation/Output/12th", tier: "12", type: "ncert", subDir: "NCERT solution" },
  // "Notes workflow/Output": Class-12 Arihant PYQ solutions, one PYQ SOLUTION/ subfolder per chapter.
  "WFPYQ": { root: "N:/Notes workflow/Output", tier: "12", type: "pyq", subDir: "PYQ SOLUTION" },
  // Codex Output 9th/10th = full Science (Physics+Chemistry+Biology). Importer maps each chapter to its subject.
  "OUT9NCERT": { root: "N:/Codex Notes creation/Output/9th", tier: "9", type: "ncert", subDir: "NCERT solution" },
  "OUT9Notes": { root: "N:/Codex Notes creation/Output/9th", tier: "9", type: "notes", subDir: "Notes" },
  "OUT10NCERT": { root: "N:/Codex Notes creation/Output/10th", tier: "10", type: "ncert", subDir: "NCERT solution" },
  "OUT10Notes": { root: "N:/Codex Notes creation/Output/10th", tier: "10", type: "notes", subDir: "Notes" },
};

const slug = (s: string) => s.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
const chapterNameFromFolder = (folder: string) => folder.replace(/^[\s._\d]+/, "").replace(/\s+/g, " ").trim();

// Recursively collect files under dir.
function walk(dir: string): string[] {
  const out: string[] = [];
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...walk(p));
    else out.push(p);
  }
  return out;
}

function isExternalRef(ref: string) {
  return /^(https?:)?\/\//i.test(ref) || ref.startsWith("data:") || ref.startsWith("#");
}

// Resolve a possibly-url-encoded relative ref against baseDir, return on-disk path or null.
function resolveRef(baseDir: string, ref: string): string | null {
  const clean = ref.split("?")[0].split("#")[0];
  for (const cand of [clean, decodeURIComponent(clean)]) {
    const p = path.resolve(baseDir, cand);
    if (fs.existsSync(p) && fs.statSync(p).isFile()) return p;
  }
  return null;
}

async function uploadImage(file: string, folder: string): Promise<string> {
  const isSvg = path.extname(file).toLowerCase() === ".svg";
  const res = await cloudinary.uploader.upload(file, {
    resource_type: isSvg ? "raw" : "image",
    folder: slug(folder).replace(/-/g, "_"),
    use_filename: true,
    unique_filename: false,
    overwrite: true,
  });
  return res.secure_url;
}

async function rewriteRefs(text: string, refs: Set<string>, baseDir: string, cloudFolder: string, stats: { up: number; miss: number }) {
  let out = text;
  for (const ref of refs) {
    if (isExternalRef(ref)) continue;
    const disk = resolveRef(baseDir, ref);
    if (!disk) {
      stats.miss++;
      console.log(`    WARN missing: ${ref}`);
      continue;
    }
    try {
      const url = await uploadImage(disk, cloudFolder);
      out = out.split(ref).join(url); // literal replace of the exact ref string
      stats.up++;
    } catch (e: any) {
      console.log(`    ERR upload ${ref}: ${e.message}`);
      stats.miss++;
    }
  }
  return out;
}

function collectImgSrcs(html: string): Set<string> {
  const refs = new Set<string>();
  const re = /<img[^>]+src\s*=\s*["']([^"']+)["']/gi;
  let m;
  while ((m = re.exec(html)) !== null) refs.add(m[1]);
  return refs;
}
function collectCssUrls(css: string): Set<string> {
  const refs = new Set<string>();
  const re = /url\(\s*["']?([^"')]+)["']?\s*\)/gi;
  let m;
  while ((m = re.exec(css)) !== null) refs.add(m[1]);
  return refs;
}

function stripWrapper(html: string): string {
  return html
    .replace(/<!DOCTYPE[^>]*>/i, "")
    .replace(/<html[^>]*>/i, "")
    .replace(/<\/html>/i, "")
    .replace(/<head[\s\S]*?<\/head>/i, "")
    .replace(/<body[^>]*>/i, "")
    .replace(/<\/body>/i, "")
    .replace(/<link[^>]*stylesheet[^>]*>/gi, "")
    .replace(/<link[^>]*\.css[^>]*>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .trim();
}

async function processChapter(catName: string, cat: Cat, folder: string) {
  const chDir = cat.subDir ? path.join(cat.root, folder, cat.subDir) : path.join(cat.root, folder);
  if (!fs.existsSync(chDir)) return null;
  const htmls = walk(chDir).filter((f) => f.toLowerCase().endsWith(".html"));
  if (htmls.length === 0) return null;
  // Largest html = the full content file.
  const htmlFile = htmls.sort((a, b) => fs.statSync(b).size - fs.statSync(a).size)[0];
  const htmlDir = path.dirname(htmlFile);
  let html = fs.readFileSync(htmlFile, "utf-8");
  if (html.replace(/<[^>]*>/g, "").trim().length < 80) return null; // basically empty

  const chapterName = chapterNameFromFolder(folder);
  const cloudFolder = `physics-content/${catName}/${slug(folder)}`;
  console.log(`  [${catName}] ${folder}  → "${chapterName}"`);
  console.log(`    html: ${path.relative(chDir, htmlFile)} (${Math.round(html.length / 1024)}KB)`);
  const stats = { up: 0, miss: 0 };

  // --- CSS: inline <style> blocks (base = htmlDir) + linked .css files (base = css dir) ---
  let css = "";
  const styleRe = /<style[^>]*>([\s\S]*?)<\/style>/gi;
  let sm;
  while ((sm = styleRe.exec(html)) !== null) css += "\n" + sm[1];
  const linkRe = /<link[^>]+href\s*=\s*["']([^"']+\.css)["'][^>]*>/gi;
  let lm;
  while ((lm = linkRe.exec(html)) !== null) {
    const cssPath = resolveRef(htmlDir, lm[1]);
    if (cssPath) {
      let linkedCss = fs.readFileSync(cssPath, "utf-8");
      linkedCss = await rewriteRefs(linkedCss, collectCssUrls(linkedCss), path.dirname(cssPath), cloudFolder, stats);
      css += "\n" + linkedCss;
    }
  }
  // Rewrite url() refs inside inline css (base = htmlDir).
  if (css) css = await rewriteRefs(css, collectCssUrls(css), htmlDir, cloudFolder, stats);

  // --- Images referenced in HTML (base = htmlDir) ---
  html = await rewriteRefs(html, collectImgSrcs(html), htmlDir, cloudFolder, stats);

  // --- Reduce HTML to body markup ---
  html = stripWrapper(html);

  console.log(`    images: ${stats.up} uploaded${stats.miss ? `, ${stats.miss} missing` : ""}; css ${Math.round(css.length / 1024)}KB`);
  return {
    category: catName,
    tier: cat.tier,
    type: cat.type,
    folderName: folder,
    chapterName,
    htmlContent: html,
    cssContent: css.trim() || null,
    imagesUploaded: stats.up,
    imagesMissing: stats.miss,
  };
}

(async () => {
  const want = (process.env.CATEGORIES || Object.keys(CATS).join(",")).split(",").map((s) => s.trim()).filter(Boolean);
  console.log("Categories:", want.join(", "));
  const items: any[] = [];

  for (const catName of want) {
    const cat = CATS[catName];
    if (!cat) { console.log(`(unknown category ${catName})`); continue; }
    if (!fs.existsSync(cat.root)) { console.log(`(missing root ${cat.root})`); continue; }
    console.log(`\n================ ${catName}  (${cat.root}) ================`);
    const only = (process.env.ONLY || "").split(",").map((s) => s.trim().toLowerCase()).filter(Boolean);
    let folders = fs.readdirSync(cat.root, { withFileTypes: true }).filter((e) => e.isDirectory()).map((e) => e.name).sort();
    if (only.length) folders = folders.filter((f) => only.some((o) => f.toLowerCase().includes(o)));
    for (const folder of folders) {
      try {
        const item = await processChapter(catName, cat, folder);
        if (item) items.push(item);
        else console.log(`  [${catName}] ${folder}  → SKIP (no usable html)`);
      } catch (e: any) {
        console.log(`  [${catName}] ${folder}  → ERROR: ${e.message}`);
      }
    }
  }

  fs.writeFileSync(__dirname + "/local-content.json", JSON.stringify({ items }, null, 2), "utf-8");
  console.log(`\n=== Built ${items.length} content items → local-content.json ===`);
  for (const it of items) console.log(`  ${it.category} | ${it.chapterName} | ${it.type} | ${it.imagesUploaded} imgs${it.imagesMissing ? ` (${it.imagesMissing} missing)` : ""}`);
})();
