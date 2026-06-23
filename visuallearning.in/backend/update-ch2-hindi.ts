/**
 * Replace Class-12 Ch2 (Electrostatic Potential and Capacitance) HINDI videos
 * with the updated 16 from ch2-hindi.json. English videos are left untouched.
 *
 * Run: DATABASE_URL="<main-prod>" npx tsx update-ch2-hindi.ts   (DRY=1 to preview)
 */
import { PrismaClient } from "@prisma/client";
import fs from "fs";

const prisma = new PrismaClient();
const DRY = process.env.DRY === "1";
const CH2 = "cmmos57db001luuz8welu430o"; // main: Class 12 Physics — Electrostatic Potential and Capacitance
type V = { order: number; title: string; vimeoId: string };

(async () => {
  const host = (process.env.DATABASE_URL || "").replace(/.*@/, "").replace(/\/.*/, "");
  console.log(`Main ${host}${DRY ? "  (DRY)" : ""}`);
  const vids: V[] = JSON.parse(fs.readFileSync("C:/Users/aakash123/ch2-hindi.json", "utf-8"));

  const ch = await prisma.chapter.findUnique({ where: { id: CH2 }, select: { id: true, name: true } });
  if (!ch) { console.log("ABORT: ch2 not found"); await prisma.$disconnect(); return; }
  console.log(`Chapter: ${ch.id} "${ch.name}"`);

  const existing = await prisma.video.count({ where: { chapterId: CH2, language: "HINDI" } });
  console.log(`Deleting ${existing} existing HINDI videos, inserting ${vids.length} new.`);

  if (!DRY) {
    await prisma.video.deleteMany({ where: { chapterId: CH2, language: "HINDI" } });
    for (const v of vids) {
      await prisma.video.create({ data: {
        title: v.title, vimeoVideoId: v.vimeoId, youtubeVideoId: "", language: "HINDI",
        type: "ANIMATED_VIDEO", isFree: v.order === 1, order: v.order, chapterId: CH2,
      } });
    }
  }
  vids.forEach((v) => console.log(`  ${DRY ? "+" : "✓"} #${v.order}${v.order === 1 ? " (free)" : ""} "${v.title}" -> vimeo=${v.vimeoId}`));
  console.log(DRY ? "(dry run — nothing written)" : "Done.");
  await prisma.$disconnect();
})();
