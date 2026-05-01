/**
 * Upload chapter notes PDFs to Cloudinary and seed/update the database.
 * Uses only the main chapter PDF per folder (not topic-wise PDFs in subfolders).
 *
 * Usage: npx ts-node upload-notes.ts [--dry-run]
 */

import { PrismaClient } from "@prisma/client";
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();

cloudinary.config({
  cloud_name: "dvtuf1zqn",
  api_key: "727822633118353",
  api_secret: "D41LANrVz7TTgOiGFMs4gfNIEpg",
});

const DRY_RUN = process.argv.includes("--dry-run");
const NOTES_ROOT = "G:/My Drive/Visual learnig data/All Chapter Notes";

// ─── Mapping: folder chapter name → DB chapter ID ───
// For 9th & 10th class, chapters are stored under Physics/Chemistry/Biology subjects
// but the folder structure is flat (numbered by NCERT order, not subject-wise)

interface NoteEntry {
  pdfPath: string; // full path to the PDF
  chapterId: string; // DB chapter ID
  title: string; // note title for DB
  folder: string; // Cloudinary folder
}

function normalize(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Find the main chapter PDF in a folder (not in subfolders like PDF/, pdf/, Pdf/)
 * Only looks at root-level .pdf files
 */
function findMainPdf(folderPath: string): string | null {
  if (!fs.existsSync(folderPath)) return null;
  const entries = fs.readdirSync(folderPath, { withFileTypes: true });
  const pdfs = entries.filter(
    (e) => e.isFile() && e.name.toLowerCase().endsWith(".pdf")
  );
  if (pdfs.length === 0) return null;
  // If multiple PDFs at root level, pick the largest one (usually the full chapter)
  let best = pdfs[0];
  let bestSize = 0;
  for (const p of pdfs) {
    const size = fs.statSync(path.join(folderPath, p.name)).size;
    if (size > bestSize) {
      bestSize = size;
      best = p;
    }
  }
  return path.join(folderPath, best.name);
}

async function getChapterMap(): Promise<
  Map<string, { id: string; name: string; subjectName: string; className: string }>
> {
  const chapters = await prisma.chapter.findMany({
    include: { subject: { include: { class: true } } },
    orderBy: { order: "asc" },
  });
  const map = new Map<
    string,
    { id: string; name: string; subjectName: string; className: string }
  >();
  for (const ch of chapters) {
    // Key: "className|subjectName|normalizedChapterName"
    const key = `${ch.subject.class.name}|${ch.subject.name}|${normalize(ch.name)}`;
    if (!map.has(key)) {
      map.set(key, {
        id: ch.id,
        name: ch.name,
        subjectName: ch.subject.name,
        className: ch.subject.class.name,
      });
    }
  }
  return map;
}

function findChapter(
  chapterMap: Map<string, any>,
  className: string,
  subjectName: string,
  folderName: string
): { id: string; name: string } | null {
  // Clean the folder name: remove leading number and trailing _E, underscores → spaces
  const cleaned = folderName
    .replace(/^\d+\.?\s*/, "")
    .replace(/_E$/, "")
    .replace(/_/g, " ")
    .trim();

  const normalizedFolder = normalize(cleaned);

  // Fix known typos in folder names
  const typoFixes: Record<string, string> = {
    "haloalkane sand haloarenes": "haloalkanes and haloarenes",
  };
  const fixedFolder = typoFixes[normalizedFolder] || normalizedFolder;

  // Try exact match first
  const key = `${className}|${subjectName}|${fixedFolder}`;
  if (chapterMap.has(key)) return chapterMap.get(key);

  // Fuzzy match: check if folder name words are a subset of chapter name or vice versa
  for (const [k, v] of chapterMap.entries()) {
    if (!k.startsWith(`${className}|${subjectName}|`)) continue;
    const dbNorm = k.split("|")[2];
    // Check if one contains most words of the other
    const folderWords = fixedFolder.split(" ").filter((w) => w.length > 2);
    const dbWords = dbNorm.split(" ").filter((w) => w.length > 2);
    const matchCount = folderWords.filter((w) => dbWords.includes(w)).length;
    if (matchCount >= Math.min(folderWords.length, dbWords.length) * 0.6 && matchCount >= 1) {
      return v;
    }
  }
  return null;
}

async function uploadToCloudinary(
  filePath: string,
  folder: string
): Promise<string> {
  const fileSize = fs.statSync(filePath).size;
  if (fileSize > 10 * 1024 * 1024) {
    console.log(
      `  ⚠ File too large (${(fileSize / 1024 / 1024).toFixed(1)} MB), skipping`
    );
    return "";
  }
  const result = await cloudinary.uploader.upload(filePath, {
    resource_type: "raw",
    folder: `notes/${folder}`,
    use_filename: true,
    unique_filename: false,
    overwrite: true,
  });
  return result.secure_url;
}

async function main() {
  const chapterMap = await getChapterMap();
  const entries: NoteEntry[] = [];
  const unmapped: string[] = [];

  // ─── 9th class (flat structure, mixed subjects) ──���
  const class9Map: Record<string, { subject: string; folderName: string }> = {
    "1.MATTER_IN_OUR_SURROUNDINGS": { subject: "Chemistry", folderName: "1.MATTER_IN_OUR_SURROUNDINGS" },
    "2.IS_MATTER_AROUND_US_PURE_E": { subject: "Chemistry", folderName: "2.IS_MATTER_AROUND_US_PURE_E" },
    "3.ATOMS_AND_MOLECULES_E": { subject: "Chemistry", folderName: "3.ATOMS_AND_MOLECULES_E" },
    "4.STRUCTURE_OF_THE_ATOM_E": { subject: "Chemistry", folderName: "4.STRUCTURE_OF_THE_ATOM_E" },
    "5.THE_FUNDAMENTAL_UNIT_OF_LIFE_E": { subject: "Biology", folderName: "5.THE_FUNDAMENTAL_UNIT_OF_LIFE_E" },
    "6.TISSUES_E": { subject: "Biology", folderName: "6.TISSUES_E" },
    "7.Diversity In Living Organisms": { subject: "Biology", folderName: "7.Diversity In Living Organisms" },
    "8. MOTION_E": { subject: "Physics", folderName: "8. MOTION_E" },
    "9. FORCE_AND_LAWS_OF_MOTION_E": { subject: "Physics", folderName: "9. FORCE_AND_LAWS_OF_MOTION_E" },
    "10. GRAVITATION_E": { subject: "Physics", folderName: "10. GRAVITATION_E" },
    "11. WORK_AND_ENERGY_E": { subject: "Physics", folderName: "11. WORK_AND_ENERGY_E" },
    "12. SOUND_E": { subject: "Physics", folderName: "12. SOUND_E" },
    "13. WHY DO WE FALL ILL": { subject: "Biology", folderName: "13. WHY DO WE FALL ILL" },
    "14. Natural Resources": { subject: "Biology", folderName: "14. Natural Resources" },
    "15. IMPROVEMENT_IN_FOOD_RESOURCES_E": { subject: "Biology", folderName: "15. IMPROVEMENT_IN_FOOD_RESOURCES_E" },
  };

  for (const [folder, info] of Object.entries(class9Map)) {
    const folderPath = path.join(NOTES_ROOT, "9th class", folder);
    const pdf = findMainPdf(folderPath);
    if (!pdf) { unmapped.push(`9th/${folder} - no PDF`); continue; }
    const ch = findChapter(chapterMap, "Class 9", info.subject, info.folderName);
    if (!ch) { unmapped.push(`9th/${folder} → ${info.subject} - no DB match`); continue; }
    entries.push({
      pdfPath: pdf,
      chapterId: ch.id,
      title: ch.name + " - Notes",
      folder: "class-9/" + info.subject.toLowerCase(),
    });
  }

  // ─── 10th class (flat structure, mixed subjects) ───
  const class10Map: Record<string, { subject: string }> = {
    "1.Chemical_Reactions_and_Equations_E": { subject: "Chemistry" },
    "2.Acids_Bases_and_Salts_E": { subject: "Chemistry" },
    "3.Metals_and_Non-metals_E": { subject: "Chemistry" },
    "4.Carbon_and_its_Compounds_E": { subject: "Chemistry" },
    "5.Periodic_Classification_of_Elements_E": { subject: "Chemistry" },
    "6.Life_Processes_E": { subject: "Biology" },
    "7.Control_and_Coordination_E": { subject: "Biology" },
    "8.How_do_Organisms_Reproduce_E": { subject: "Biology" },
    "9.Heredity_E": { subject: "Biology" },
    "10.Light_-_Reflection_and_Refraction_E": { subject: "Physics" },
    "11.The_Human_Eye_and_the_Colourful_World_E": { subject: "Physics" },
    "12.Electricity_E": { subject: "Physics" },
    "13.Magnetic_Effects_of_Electric_Current_E": { subject: "Physics" },
    "14.Our_Environment_E": { subject: "Biology" },
    "15.Management_of_Natural_Resources_E": { subject: "Biology" },
  };

  for (const [folder, info] of Object.entries(class10Map)) {
    const folderPath = path.join(NOTES_ROOT, "10Th class", folder);
    const pdf = findMainPdf(folderPath);
    if (!pdf) { unmapped.push(`10th/${folder} - no PDF`); continue; }
    const ch = findChapter(chapterMap, "Class 10", info.subject, folder);
    if (!ch) { unmapped.push(`10th/${folder} → ${info.subject} - no DB match`); continue; }
    entries.push({
      pdfPath: pdf,
      chapterId: ch.id,
      title: ch.name + " - Notes",
      folder: "class-10/" + info.subject.toLowerCase(),
    });
  }

  // ─── 11th & 12th class (subject subfolders) ───
  for (const [classFolder, className] of [
    ["11Th class", "Class 11"],
    ["12th class", "Class 12"],
  ] as const) {
    for (const subject of ["Physics", "Chemistry", "Biology"]) {
      const subjectPath = path.join(NOTES_ROOT, classFolder, subject);
      if (!fs.existsSync(subjectPath)) continue;
      const folders = fs.readdirSync(subjectPath, { withFileTypes: true })
        .filter((d) => d.isDirectory())
        .map((d) => d.name);

      for (const folder of folders) {
        const folderPath = path.join(subjectPath, folder);
        const pdf = findMainPdf(folderPath);
        if (!pdf) { unmapped.push(`${classFolder}/${subject}/${folder} - no PDF`); continue; }
        const ch = findChapter(chapterMap, className, subject, folder);
        if (!ch) { unmapped.push(`${classFolder}/${subject}/${folder} - no DB match`); continue; }
        entries.push({
          pdfPath: pdf,
          chapterId: ch.id,
          title: ch.name + " - Notes",
          folder: `${className.toLowerCase().replace(" ", "-")}/${subject.toLowerCase()}`,
        });
      }
    }
  }

  // ─── Report ───
  console.log(`\n✅ Matched ${entries.length} PDFs to DB chapters`);
  if (unmapped.length > 0) {
    console.log(`\n⚠ Unmatched (${unmapped.length}):`);
    unmapped.forEach((u) => console.log(`  - ${u}`));
  }

  console.log("\n── Mapping ──");
  for (const e of entries) {
    console.log(`  ${path.basename(e.pdfPath)} → ${e.title} (${e.chapterId})`);
  }

  if (DRY_RUN) {
    console.log("\n🏁 Dry run — no uploads or DB changes.");
    await prisma.$disconnect();
    return;
  }

  // ─── Upload & seed ───
  console.log(`\n🚀 Uploading ${entries.length} PDFs to Cloudinary...\n`);
  let uploaded = 0;
  let failed = 0;

  for (const e of entries) {
    try {
      console.log(`  Uploading: ${path.basename(e.pdfPath)}...`);
      const url = await uploadToCloudinary(e.pdfPath, e.folder);
      if (!url) { failed++; continue; }

      // Delete existing notes for this chapter (old Firebase URLs) and create new
      await prisma.note.deleteMany({ where: { chapterId: e.chapterId } });
      await prisma.note.create({
        data: {
          chapterId: e.chapterId,
          title: e.title,
          pdfUrl: url,
        },
      });
      console.log(`  ✅ ${e.title} → ${url}`);
      uploaded++;
    } catch (err: any) {
      console.error(`  ❌ ${e.title}: ${err.message}`);
      failed++;
    }
  }

  console.log(`\n🏁 Done! Uploaded: ${uploaded}, Failed: ${failed}`);
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
