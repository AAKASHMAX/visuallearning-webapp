/**
 * Replace Class-12 Ch2 (Electrostatic Potential and Capacitance) HINDI videos
 * with the updated 16 from ch2-hindi.json. English videos are left untouched.
 *
 * Run: DATABASE_URL="<physics-prod>" npx tsx update-ch2-hindi.ts   (DRY=1 to preview)
 */
import { PrismaClient } from "@prisma/client";
import fs from "fs";

const prisma = new PrismaClient();
const DRY = process.env.DRY === "1";
type V = { order: number; title: string; vimeoId: string };

(async () => {
  const host = (process.env.DATABASE_URL || "").replace(/.*@/, "").replace(/\/.*/, "");
  console.log(`Physics ${host}${DRY ? "  (DRY)" : ""}`);
  const vids: V[] = JSON.parse(fs.readFileSync("C:/Users/aakash123/ch2-hindi.json", "utf-8"));

  const ch = await prisma.chapter.findFirst({ where: { name: { contains: "Electrostatic", mode: "insensitive" }, course: { tier: "12" } }, select: { id: true, name: true } });
  if (!ch) { console.log("ABORT: ch2 not found"); await prisma.$disconnect(); return; }
  console.log(`Chapter: ${ch.id} "${ch.name}"`);

  const existing = await prisma.video.count({ where: { chapterId: ch.id, language: "HINDI" } });
  console.log(`Deleting ${existing} existing HINDI videos, inserting ${vids.length} new.`);

  if (!DRY) {
    await prisma.video.deleteMany({ where: { chapterId: ch.id, language: "HINDI" } });
    for (const v of vids) {
      await prisma.video.create({ data: {
        title: v.title, youtubeUrl: `https://vimeo.com/${v.vimeoId}`, language: "HINDI",
        videoType: "ANIMATED_VIDEO", isFree: false, displayOrder: v.order, chapterId: ch.id,
      } });
    }
  }
  vids.forEach((v) => console.log(`  ${DRY ? "+" : "✓"} #${v.order} "${v.title}" -> https://vimeo.com/${v.vimeoId}`));
  console.log(DRY ? "(dry run — nothing written)" : "Done.");
  await prisma.$disconnect();
})();
