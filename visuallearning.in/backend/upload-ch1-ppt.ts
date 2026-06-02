/**
 * Upload Chapter 1 (12th Physics) PPT as a Note.
 *
 * PPTs are stored as Note records; the frontend routes the "ppts" content slug
 * to /notes and filters by title signals ("ppt", "presentation", "slide", ...).
 * The viewer renders the note's pdfUrl as a "Presentation PDF". So this uploads
 * the converted PDF to Cloudinary and creates a Note whose title contains "PPT"
 * (shown in the PPTs section, excluded from regular Notes).
 *
 * Idempotent: updates the existing Ch1 PPT note if one already exists.
 *
 * Usage (production):
 *   DATABASE_URL="<prod>" npx tsx upload-ch1-ppt.ts
 */

import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

const prisma = new PrismaClient();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const PDF_FILE = "N:/Main data/12th class/12th PPTs/Chapter1_Electric_Charges_and_Fields_.pdf";
const DB_CHAPTER_TERM = "Electric Charges and Fields";
const NOTE_TITLE = "Chapter 1: Electric Charges and Fields - PPT";
const CLOUD_FOLDER = "ppts/class-12/physics";
const PUBLIC_ID = "1_Electric_Charges_and_Fields_PPT";

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
  console.log("=== Upload Ch1 PPT (12th Physics) ===\n");
  const host = (process.env.DATABASE_URL || "").replace(/.*@/, "").replace(/\/.*/, "");
  console.log("DB host:", host);

  if (!fs.existsSync(PDF_FILE)) throw new Error(`PDF not found: ${PDF_FILE}`);

  const chapter = await findChapter(DB_CHAPTER_TERM);
  if (!chapter) {
    console.log(`ABORT: No 12th Physics chapter matching "${DB_CHAPTER_TERM}".`);
    await prisma.$disconnect();
    return;
  }
  console.log(`Chapter: "${chapter.name}" (id: ${chapter.id}) | ${chapter.subject.class.name}/${chapter.subject.name}\n`);

  console.log(`Uploading PDF (${Math.round(fs.statSync(PDF_FILE).size / 1024 / 1024)}MB) to Cloudinary...`);
  const res = await cloudinary.uploader.upload(PDF_FILE, {
    resource_type: "raw",
    folder: CLOUD_FOLDER,
    public_id: PUBLIC_ID,
    use_filename: false,
    unique_filename: false,
    overwrite: true,
  });
  console.log("PDF url:", res.secure_url);

  const existing = await prisma.note.findFirst({
    where: { chapterId: chapter.id, title: { contains: "PPT", mode: "insensitive" } },
  });

  if (existing) {
    await prisma.note.update({
      where: { id: existing.id },
      data: { title: NOTE_TITLE, pdfUrl: res.secure_url, htmlContent: null, cssContent: null },
    });
    console.log(`\nUPDATED existing PPT note: ${existing.id}`);
  } else {
    const created = await prisma.note.create({
      data: { chapterId: chapter.id, title: NOTE_TITLE, pdfUrl: res.secure_url },
    });
    console.log(`\nCREATED PPT note: ${created.id}`);
  }

  await prisma.$disconnect();
  console.log("Done!");
}

main().catch((e) => {
  console.error(e);
  prisma.$disconnect();
  process.exit(1);
});
