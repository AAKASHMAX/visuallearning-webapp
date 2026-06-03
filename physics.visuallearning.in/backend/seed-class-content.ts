/**
 * Rebuild physics course content from physics-class-content.json.
 *
 * DESTRUCTIVE: wipes all existing courses/chapters/videos/notes/questions
 * (and watch progress), then creates Class 11 & Class 12 courses (tier 11/12)
 * with chapters and Vimeo videos (Hindi + English). Users / subscriptions /
 * plans / settings are kept.
 *
 * Run against PRODUCTION:
 *   DATABASE_URL="<physics-prod>" npx tsx seed-class-content.ts
 * Dry run (no writes):
 *   DATABASE_URL="<physics-prod>" npx tsx seed-class-content.ts --dry
 */
import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();
const DRY = process.argv.includes("--dry");

type Vid = { title: string; hindi: string | null; english: string | null };
type Chap = { name: string; videos: Vid[] };
type Data = Record<string, Chap[]>;

const CLASS_META: Record<string, { name: string; order: number }> = {
  "11": { name: "Class 11 Physics", order: 1 },
  "12": { name: "Class 12 Physics", order: 2 },
};

async function main() {
  const host = (process.env.DATABASE_URL || "").replace(/.*@/, "").replace(/\/.*/, "");
  console.log(`=== Rebuild physics content ${DRY ? "(DRY RUN)" : ""} ===`);
  console.log("DB host:", host || "(none)");

  const json = path.join(__dirname, "physics-class-content.json");
  const data: Data = JSON.parse(fs.readFileSync(json, "utf-8"));

  // Summary
  for (const cls of Object.keys(CLASS_META)) {
    const chs = data[cls] || [];
    const rows = chs.reduce((n, c) => n + c.videos.filter((v) => v.hindi).length + c.videos.filter((v) => v.english).length, 0);
    console.log(`  Class ${cls}: ${chs.length} chapters, ${rows} video rows`);
  }

  // Current content (for the log)
  const before = {
    courses: await prisma.course.count(),
    chapters: await prisma.chapter.count(),
    videos: await prisma.video.count(),
  };
  console.log("  Existing:", before);

  if (DRY) {
    console.log("\nDRY RUN — no changes written.");
    await prisma.$disconnect();
    return;
  }

  // 1. Wipe content (order respects FK constraints).
  console.log("\nWiping old content...");
  await prisma.watchProgress.deleteMany();
  await prisma.video.deleteMany();
  await prisma.note.deleteMany();
  await prisma.question.deleteMany();
  await prisma.courseChapter.deleteMany();
  await prisma.chapter.deleteMany();
  await prisma.planCourse.deleteMany();
  await prisma.course.deleteMany();
  console.log("  Wiped.");

  // 2. Create class courses -> chapters -> videos.
  for (const cls of Object.keys(CLASS_META)) {
    const meta = CLASS_META[cls];
    const chs = data[cls] || [];
    const course = await prisma.course.create({
      data: { name: meta.name, tier: cls, displayOrder: meta.order, isActive: true, description: `${meta.name} — animated chapters and practice.` },
    });
    let chapterCount = 0;
    let videoCount = 0;
    for (let ci = 0; ci < chs.length; ci++) {
      const chap = chs[ci];
      const chapter = await prisma.chapter.create({
        data: { name: chap.name, displayOrder: ci + 1, courseId: course.id },
      });
      chapterCount++;
      const isFree = ci === 0; // first chapter is a free preview
      for (let vi = 0; vi < chap.videos.length; vi++) {
        const v = chap.videos[vi];
        if (v.hindi) {
          await prisma.video.create({
            data: { title: v.title, youtubeUrl: v.hindi, language: "HINDI", videoType: "ANIMATED_VIDEO", isFree, displayOrder: vi + 1, chapterId: chapter.id },
          });
          videoCount++;
        }
        if (v.english) {
          await prisma.video.create({
            data: { title: v.title, youtubeUrl: v.english, language: "ENGLISH", videoType: "ANIMATED_VIDEO", isFree, displayOrder: vi + 1, chapterId: chapter.id },
          });
          videoCount++;
        }
      }
    }
    console.log(`  Created ${meta.name} (tier ${cls}): ${chapterCount} chapters, ${videoCount} videos`);
  }

  console.log("\nDone!");
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  prisma.$disconnect();
  process.exit(1);
});
