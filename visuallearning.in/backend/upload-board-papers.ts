/**
 * Download CBSE board papers from official site, upload to Cloudinary, update production DB
 *
 * Usage: DATABASE_URL="..." npx ts-node upload-board-papers.ts
 */

import { PrismaClient } from "@prisma/client";
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import path from "path";
import { execSync } from "child_process";

const prisma = new PrismaClient();

cloudinary.config({
  cloud_name: "dvtuf1zqn",
  api_key: "727822633118353",
  api_secret: "D41LANrVz7TTgOiGFMs4gfNIEpg",
});

const TEMP_DIR = "C:/Users/aakash123/blender/temp_cbse";
const PAPERS_DIR = "N:/papers/cbse";

interface Download {
  url: string;
  zipName: string;
  className: string;
  classFolder: string;
  subjects: string[];
  year: number;
  subjectKeyword: string; // keyword to find correct PDF in ZIP (e.g. "Science", "Physics")
}

const DOWNLOADS: Download[] = [];

// Class 10 Science (applies to Physics, Chemistry, Biology in DB)
for (const [year, url] of [
  [2016, "https://www.cbse.gov.in/cbsenew/question-paper/2016/X/SCIENCE.zip"],
  [2018, "https://www.cbse.gov.in/cbsenew/question-paper/2018/X/SCIENCE.zip"],
  [2019, "https://www.cbse.gov.in/cbsenew/question-paper/2019/X/SCIENCE.zip"],
  [2020, "https://www.cbse.gov.in/cbsenew/question-paper/2020/X/SCIENCE.zip"],
  [2023, "https://www.cbse.gov.in/cbsenew/question-paper/2023/X/SCIENCE.zip"],
  [2024, "https://www.cbse.gov.in/cbsenew/question-paper/2024/X/SCIENCE.zip"],
] as [number, string][]) {
  DOWNLOADS.push({
    url, zipName: `c10_sci_${year}.zip`, className: "10", classFolder: "class_10",
    subjects: ["Physics", "Chemistry", "Biology"], year, subjectKeyword: "Science",
  });
}

// Class 10 Mathematics
for (const [year, url] of [
  [2019, "https://www.cbse.gov.in/cbsenew/question-paper/2019/X/MATHEMATICS.zip"],
  [2023, "https://www.cbse.gov.in/cbsenew/question-paper/2023/X/MATHEMATICS_STANDARD.zip"],
  [2024, "https://www.cbse.gov.in/cbsenew/question-paper/2024/X/MATHEMATICS_STANDARD.zip"],
] as [number, string][]) {
  DOWNLOADS.push({
    url, zipName: `c10_math_${year}.zip`, className: "10", classFolder: "class_10",
    subjects: ["Mathematics"], year, subjectKeyword: "Math",
  });
}

// Class 12 subjects
const c12: Array<{ name: string; zip: string; keyword: string; years: number[] }> = [
  { name: "Physics", zip: "PHYSICS", keyword: "Physics", years: [2016, 2018, 2019, 2020, 2022, 2023, 2024, 2025] },
  { name: "Chemistry", zip: "CHEMISTRY", keyword: "Chemistry", years: [2016, 2018, 2019, 2020, 2022, 2023, 2024, 2025] },
  { name: "Biology", zip: "BIOLOGY", keyword: "Biology", years: [2016, 2019, 2020, 2022, 2023, 2024, 2025] },
  { name: "Mathematics", zip: "MATHEMATICS", keyword: "Math", years: [2019, 2020, 2023, 2024, 2025] },
];

for (const s of c12) {
  for (const year of s.years) {
    DOWNLOADS.push({
      url: `https://www.cbse.gov.in/cbsenew/question-paper/${year}/XII/${s.zip}.zip`,
      zipName: `c12_${s.name.toLowerCase()}_${year}.zip`,
      className: "12", classFolder: "class_12",
      subjects: [s.name], year, subjectKeyword: s.keyword,
    });
  }
}

/**
 * Pick the best PDF from a ZIP listing.
 * Strategy: find files containing the subject keyword, exclude blind/visually challenged,
 * exclude wrong subjects (e.g. Social Science in Science zip), prefer "Set 1" or "1-1" or "1_1".
 */
function pickBestPdf(zipPath: string, subjectKeyword: string): string | null {
  let listing: string;
  try {
    listing = execSync(`unzip -l "${zipPath}"`, { encoding: "utf-8" });
  } catch {
    return null;
  }

  const lines = listing.split("\n");
  const pdfFiles: string[] = [];

  for (const line of lines) {
    // unzip -l format: "  12345  2024-01-01 12:00   folder/filename.pdf"
    const match = line.match(/\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}\s+(.+\.pdf)\s*$/i);
    if (match) {
      pdfFiles.push(match[1].trim());
    }
  }

  if (pdfFiles.length === 0) return null;

  // Filter: must contain subject keyword (case-insensitive)
  let candidates = pdfFiles.filter(f => {
    const lower = f.toLowerCase();
    const kw = subjectKeyword.toLowerCase();
    return lower.includes(kw);
  });

  // Exclude blind/visually challenged variants
  candidates = candidates.filter(f => {
    const lower = f.toLowerCase();
    return !lower.includes("blind") && !lower.includes("visually") && !lower.includes("(b)") && !lower.includes("_b_") && !lower.includes(" b.");
  });

  // Exclude wrong subjects (e.g. "Social Science" when looking for "Science")
  if (subjectKeyword.toLowerCase() === "science") {
    candidates = candidates.filter(f => !f.toLowerCase().includes("social"));
  }

  // Exclude Urdu/Punjabi/other language variants for Science
  candidates = candidates.filter(f => {
    const lower = f.toLowerCase();
    return !lower.includes("urdu") && !lower.includes("punjabi") && !lower.includes("tamil") && !lower.includes("telugu");
  });

  if (candidates.length === 0) {
    // Fallback: try all PDFs excluding blind
    candidates = pdfFiles.filter(f => {
      const lower = f.toLowerCase();
      return !lower.includes("blind") && !lower.includes("visually") && !lower.includes("(b)");
    });
  }

  if (candidates.length === 0) return pdfFiles[0]; // last resort

  // Prefer Set 1 / 1-1 / 1_1 patterns
  const set1 = candidates.find(f => /[_-]1[_-]1|Set.?1/i.test(f));
  if (set1) return set1;

  // Prefer the first candidate
  return candidates[0];
}

async function uploadToCloudinary(filePath: string, folder: string): Promise<string> {
  const fileSize = fs.statSync(filePath).size;

  // Cloudinary free tier: 10 MB limit
  if (fileSize > 10 * 1024 * 1024) {
    console.log(`  ⚠ File too large (${(fileSize / 1024 / 1024).toFixed(1)} MB), skipping Cloudinary upload`);
    return "";
  }

  const result = await cloudinary.uploader.upload(filePath, {
    resource_type: "raw",
    folder: `board-papers/${folder}`,
    use_filename: true,
    unique_filename: false,
    overwrite: true,
  });
  return result.secure_url;
}

async function updateBoardPaper(subjectId: string, year: number, titleContains: string, pdfUrl: string) {
  const paper = await prisma.boardPaper.findFirst({
    where: { subjectId, year, title: { contains: titleContains, mode: "insensitive" } },
  });
  if (paper) {
    await prisma.boardPaper.update({ where: { id: paper.id }, data: { pdfUrl } });
    return true;
  }
  return false;
}

async function main() {
  if (!fs.existsSync(TEMP_DIR)) fs.mkdirSync(TEMP_DIR, { recursive: true });

  console.log(`\nTotal downloads: ${DOWNLOADS.length}\n`);

  let uploaded = 0, failed = 0, dbUpdated = 0, skippedLarge = 0;

  for (const dl of DOWNLOADS) {
    const zipPath = path.join(TEMP_DIR, dl.zipName);
    const extractDir = path.join(TEMP_DIR, `ext_${dl.year}_${dl.subjects[0].slice(0, 4).toLowerCase()}`);

    try {
      console.log(`\n--- Class ${dl.className} | ${dl.subjects.join("/")} | ${dl.year} ---`);

      // 1. Download ZIP
      console.log(`  Downloading...`);
      execSync(`curl -s "${dl.url}" -o "${zipPath}"`, { timeout: 180000 });
      const zipSize = fs.statSync(zipPath).size;
      console.log(`  Downloaded: ${(zipSize / 1024 / 1024).toFixed(1)} MB`);

      // 2. Pick best PDF from ZIP
      const bestPdf = pickBestPdf(zipPath, dl.subjectKeyword);
      if (!bestPdf) {
        console.log(`  ⚠ No suitable PDF found in ZIP`);
        failed++;
        if (fs.existsSync(zipPath)) fs.unlinkSync(zipPath);
        continue;
      }
      console.log(`  Selected: ${bestPdf}`);

      // 3. Extract the selected PDF
      if (!fs.existsSync(extractDir)) fs.mkdirSync(extractDir, { recursive: true });

      // Use wildcard extraction to handle spaces - extract all then pick
      execSync(`unzip -o -j "${zipPath}" -d "${extractDir}"`, { timeout: 60000 });

      // Find the extracted file matching our selection
      const baseName = path.basename(bestPdf);
      let pdfPath = path.join(extractDir, baseName);

      if (!fs.existsSync(pdfPath)) {
        // Try to find any PDF in extracted directory
        const allPdfs = fs.readdirSync(extractDir).filter(f => f.toLowerCase().endsWith(".pdf"));
        if (allPdfs.length === 0) {
          console.log(`  ⚠ No PDF extracted`);
          failed++;
          continue;
        }
        // Pick one matching our keyword
        const match = allPdfs.find(f => f.toLowerCase().includes(dl.subjectKeyword.toLowerCase()));
        pdfPath = path.join(extractDir, match || allPdfs[0]);
      }

      const pdfSize = fs.statSync(pdfPath).size;
      console.log(`  Extracted: ${path.basename(pdfPath)} (${(pdfSize / 1024).toFixed(0)} KB)`);

      // 4. Save to N: drive
      for (const subjectName of dl.subjects) {
        const destDir = path.join(PAPERS_DIR, dl.classFolder, subjectName.toLowerCase(), String(dl.year));
        if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });
        fs.copyFileSync(pdfPath, path.join(destDir, `question_paper_${dl.year}.pdf`));
      }

      // 5. Upload to Cloudinary
      const cloudFolder = `class_${dl.className}/${dl.subjects[0].toLowerCase()}/${dl.year}`;
      console.log(`  Uploading to Cloudinary...`);
      const cloudUrl = await uploadToCloudinary(pdfPath, cloudFolder);

      if (!cloudUrl) {
        skippedLarge++;
        // Cleanup
        fs.rmSync(extractDir, { recursive: true, force: true });
        fs.unlinkSync(zipPath);
        continue;
      }

      console.log(`  ✓ Uploaded`);
      uploaded++;

      // 6. Update DB
      for (const subjectName of dl.subjects) {
        const cls = await prisma.class.findFirst({
          where: { name: { contains: dl.className, mode: "insensitive" } },
        });
        if (!cls) continue;
        const subject = await prisma.subject.findFirst({
          where: { classId: cls.id, name: { contains: subjectName, mode: "insensitive" } },
        });
        if (!subject) continue;
        const updated = await updateBoardPaper(subject.id, dl.year, "Question Paper", cloudUrl);
        if (updated) {
          console.log(`  ✓ DB: ${subjectName} ${dl.year}`);
          dbUpdated++;
        }
      }

      // Cleanup
      fs.rmSync(extractDir, { recursive: true, force: true });
      fs.unlinkSync(zipPath);

    } catch (err: any) {
      console.log(`  ✗ Error: ${err.message?.slice(0, 120)}`);
      failed++;
      try {
        if (fs.existsSync(zipPath)) fs.unlinkSync(zipPath);
        if (fs.existsSync(extractDir)) fs.rmSync(extractDir, { recursive: true, force: true });
      } catch {}
    }
  }

  console.log(`\n========================================`);
  console.log(`Uploaded: ${uploaded}`);
  console.log(`DB updated: ${dbUpdated}`);
  console.log(`Too large for Cloudinary: ${skippedLarge}`);
  console.log(`Failed: ${failed}`);
  console.log(`========================================\n`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
