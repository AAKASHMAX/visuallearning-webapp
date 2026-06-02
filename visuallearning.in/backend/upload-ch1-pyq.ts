/**
 * Upload Chapter 1 (12th Physics) PYQ Solutions as a Note.
 *
 * PYQs are stored as Note records; the frontend routes the "pyq" content slug
 * to /notes and filters by title signals ("pyq", "previous year", ...). So this
 * creates a Note whose title contains "PYQ Solutions" — it shows in the PYQ
 * section and is excluded from the regular Notes section.
 *
 * - Uploads the 56 question/option images to Cloudinary, rewrites <img src>.
 * - Extracts the inline <style> into cssContent, body markup into htmlContent.
 * - Strips the standalone-only "@media screen" page-break preview CSS so the
 *   in-app viewer stays clean (KaTeX renders the \(..\) / \[..\] math).
 * - Idempotent: updates the existing Ch1 PYQ note if one already exists.
 *
 * Usage: npx tsx upload-ch1-pyq.ts
 */

import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const CHAPTER_DIR = "N:/Main data/12th class/12th PYQs/1.Electric charges and fields";
const HTML_FILE = path.join(CHAPTER_DIR, "1.Electric Charges and Fields - PYQ Solutions.html");
const IMAGES_DIR = path.join(CHAPTER_DIR, "Images");

const DB_CHAPTER_TERM = "Electric Charges and Fields";
const NOTE_TITLE = "Chapter 1: Electric Charges and Fields - PYQ Solutions";
const CLOUD_FOLDER = "pyq-html/12th-physics/ch1-electric-charges/images";

function sanitize(p: string): string {
  return p.replace(/&/g, "and").replace(/[^a-zA-Z0-9_\-./]/g, "_");
}

// Remove a top-level CSS block like "@media screen { ... }" (brace-matched).
function removeCssBlock(css: string, marker: string): string {
  const start = css.indexOf(marker);
  if (start < 0) return css;
  const open = css.indexOf("{", start);
  if (open < 0) return css;
  let depth = 0;
  for (let j = open; j < css.length; j++) {
    if (css[j] === "{") depth++;
    else if (css[j] === "}") {
      depth--;
      if (depth === 0) return css.slice(0, start) + css.slice(j + 1);
    }
  }
  return css;
}

async function findChapter(term: string) {
  return prisma.chapter.findFirst({
    where: {
      name: { contains: term, mode: "insensitive" },
      subject: {
        name: { contains: "Physics", mode: "insensitive" },
        class: { name: { contains: "12", mode: "insensitive" } },
      },
    },
    include: { subject: { include: { class: true } } },
  });
}

async function main() {
  console.log("=== Upload Ch1 PYQ Solutions (12th Physics) ===\n");

  if (!fs.existsSync(HTML_FILE)) {
    throw new Error(`HTML file not found: ${HTML_FILE}`);
  }

  const chapter = await findChapter(DB_CHAPTER_TERM);
  if (!chapter) {
    console.log(`ABORT: No 12th Physics chapter matching "${DB_CHAPTER_TERM}" found.`);
    await prisma.$disconnect();
    return;
  }
  console.log(
    `Chapter: "${chapter.name}" (id: ${chapter.id}) | ${chapter.subject.class.name} / ${chapter.subject.name}\n`
  );

  let html = fs.readFileSync(HTML_FILE, "utf-8");
  console.log(`Read HTML: ${Math.round(html.length / 1024)}KB`);

  // 1. Upload referenced Images/NNN.png and rewrite paths.
  const imgRefs = new Set<string>();
  const re = /src="Images\/([^"]+)"/g;
  let m;
  while ((m = re.exec(html)) !== null) imgRefs.add(m[1]);
  console.log(`Image references: ${imgRefs.size}`);

  const urlMap: Record<string, string> = {};
  let uploaded = 0;
  for (const name of imgRefs) {
    const fp = path.join(IMAGES_DIR, name);
    if (!fs.existsSync(fp)) {
      console.log(`  WARN missing image: ${name}`);
      continue;
    }
    const res = await cloudinary.uploader.upload(fp, {
      folder: sanitize(CLOUD_FOLDER),
      use_filename: true,
      unique_filename: false,
      overwrite: true,
    });
    urlMap[name] = res.secure_url;
    uploaded++;
    if (uploaded % 10 === 0) console.log(`  Uploaded ${uploaded}/${imgRefs.size}...`);
  }
  console.log(`Uploaded ${uploaded}/${imgRefs.size} images`);

  html = html.replace(/src="Images\/([^"]+)"/g, (full, name) =>
    urlMap[name] ? `src="${urlMap[name]}"` : full
  );

  // 2. Remove the broken MCQ 5 graph figure (mcq_option_images/ does not exist).
  html = html.replace(
    /<div class="option-figure">\s*<img[^>]*mcq_option_images[^>]*>\s*<\/div>/gi,
    ""
  );

  // 3. Extract inline <style> -> cssContent (strip standalone screen-preview block).
  const styleMatch = html.match(/<style>([\s\S]*?)<\/style>/i);
  let cssContent = styleMatch ? styleMatch[1].trim() : null;
  if (cssContent) {
    cssContent = removeCssBlock(cssContent, "@media screen");
    // Preserve base typography after scopeCSS drops body{} rules in the viewer.
    cssContent =
      `.book{font-family:'Inter','Segoe UI',sans-serif;color:#1A1A2E;line-height:1.65;}\n` +
      cssContent;
    console.log(`CSS extracted: ${Math.round(cssContent.length / 1024)}KB`);
  }

  // 4. Reduce to body markup; drop wrapper + MathJax scripts (KaTeX handles math).
  html = html
    .replace(/<!DOCTYPE[^>]*>/i, "")
    .replace(/<html[^>]*>/i, "")
    .replace(/<\/html>/i, "")
    .replace(/<head[\s\S]*?<\/head>/i, "")
    .replace(/<body[^>]*>/i, "")
    .replace(/<\/body>/i, "")
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .trim();
  console.log(`Processed HTML body: ${Math.round(html.length / 1024)}KB`);

  // 5. Create or update the PYQ note (idempotent).
  const existing = await prisma.note.findFirst({
    where: {
      chapterId: chapter.id,
      title: { contains: "PYQ", mode: "insensitive" },
    },
  });

  if (existing) {
    await prisma.note.update({
      where: { id: existing.id },
      data: { title: NOTE_TITLE, htmlContent: html, cssContent },
    });
    console.log(`\nUPDATED existing PYQ note: ${existing.id}`);
  } else {
    const created = await prisma.note.create({
      data: {
        chapterId: chapter.id,
        title: NOTE_TITLE,
        pdfUrl: "pending", // viewer renders htmlContent; "pending" hides download
        htmlContent: html,
        cssContent,
      },
    });
    console.log(`\nCREATED PYQ note: ${created.id}`);
  }

  await prisma.$disconnect();
  console.log("Done!");
}

main().catch((e) => {
  console.error(e);
  prisma.$disconnect();
  process.exit(1);
});
