import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";

type SheetVideo = {
  topic: string;
  hindiVimeo: string;
  englishVimeo: string;
};

type SheetSection = {
  header: string;
  row: number;
  classNumber: number | null;
  chapterNumber: number | null;
  chapterName: string;
  videos: SheetVideo[];
};

const root = path.resolve(__dirname, "../../..");
const physicsEnvPath = path.join(root, "physics.visuallearning.in/backend/.env");

function readEnvValue(filePath: string, key: string) {
  const parsed = dotenv.parse(fs.readFileSync(filePath, "utf8"));
  const value = parsed[key];
  if (!value) throw new Error(`${key} missing in ${filePath}`);
  return value;
}

function normalize(value: string) {
  return value
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\b(chapter|ch|class|std|standard|physics)\b/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function canonicalVimeoUrl(value: string) {
  const clean = value.trim();
  const match = clean.match(/vimeo\.com\/(?:video\/)?(\d+)(?:\/([a-zA-Z0-9]+))?/i);
  if (!match) return clean;
  return match[2] ? `https://vimeo.com/${match[1]}/${match[2]}` : `https://vimeo.com/${match[1]}`;
}

function isVimeo(value: string) {
  return /vimeo\.com/i.test(value);
}

function findChapter(sectionName: string, chapters: { id: string; name: string; displayOrder: number }[]) {
  const wanted = normalize(sectionName);
  const exact = chapters.find((chapter) => normalize(chapter.name) === wanted);
  if (exact) return exact;

  const candidates = chapters
    .map((chapter) => ({ chapter, normalized: normalize(chapter.name) }))
    .filter(({ normalized }) => normalized.startsWith(wanted) || wanted.startsWith(normalized))
    .sort((a, b) => Math.abs(a.normalized.length - wanted.length) - Math.abs(b.normalized.length - wanted.length));

  return candidates[0]?.chapter || null;
}

async function main() {
  const apply = process.argv.includes("--apply");
  const jsonArg = process.argv.find((arg) => arg.startsWith("--json="));
  const jsonPath = jsonArg?.slice("--json=".length);
  if (!jsonPath) throw new Error("Pass --json=<path-to-parsed-sheet-json>");

  const prisma = new PrismaClient({
    datasourceUrl: process.env.PHYSICS_DATABASE_URL || readEnvValue(physicsEnvPath, "DATABASE_URL"),
  });

  const stats = {
    sections: 0,
    matchedSections: 0,
    unmatchedSections: [] as string[],
    vimeoRows: 0,
    videosCreated: 0,
    videosUpdated: 0,
    videosSkippedDuplicateUrl: 0,
    remainingEmptyMatchedChapters: 0,
    remainingYoutubeLikeVideos: 0,
  };

  try {
    const sections = JSON.parse(fs.readFileSync(jsonPath, "utf8")) as SheetSection[];
    stats.sections = sections.length;

    const chapters = await prisma.chapter.findMany({
      select: { id: true, name: true, displayOrder: true },
      orderBy: [{ displayOrder: "asc" }, { name: "asc" }],
    });

    const matchedChapterIds = new Set<string>();

    for (const section of sections) {
      const chapter = findChapter(section.chapterName, chapters);
      if (!chapter) {
        stats.unmatchedSections.push(section.header);
        continue;
      }

      stats.matchedSections += 1;
      matchedChapterIds.add(chapter.id);

      for (const row of section.videos) {
        const entries = [
          { language: "HINDI", url: row.hindiVimeo },
          { language: "ENGLISH", url: row.englishVimeo },
        ].filter((entry) => entry.url && isVimeo(entry.url));

        for (const entry of entries) {
          stats.vimeoRows += 1;
          const url = canonicalVimeoUrl(entry.url);
          const title = row.topic.trim();

          if (!apply) {
            stats.videosCreated += 1;
            continue;
          }

          const existingByUrl = await prisma.video.findFirst({
            where: { chapterId: chapter.id, youtubeUrl: url },
          });
          if (existingByUrl) {
            stats.videosSkippedDuplicateUrl += 1;
            continue;
          }

          const existingByTitleLanguage = await prisma.video.findFirst({
            where: { chapterId: chapter.id, title, language: entry.language },
          });

          if (existingByTitleLanguage) {
            await prisma.video.update({
              where: { id: existingByTitleLanguage.id },
              data: {
                youtubeUrl: url,
                videoType: "ANIMATED_VIDEO",
                language: entry.language,
              },
            });
            stats.videosUpdated += 1;
          } else {
            await prisma.video.create({
              data: {
                title,
                youtubeUrl: url,
                videoType: "ANIMATED_VIDEO",
                language: entry.language,
                isFree: false,
                displayOrder: stats.vimeoRows,
                chapterId: chapter.id,
              },
            });
            stats.videosCreated += 1;
          }
        }
      }
    }

    if (matchedChapterIds.size > 0) {
      const matchedIds = [...matchedChapterIds];
      const empty = await prisma.chapter.findMany({
        where: { id: { in: matchedIds }, videos: { none: {} } },
        select: { id: true },
      });
      stats.remainingEmptyMatchedChapters = empty.length;
    }

    stats.remainingYoutubeLikeVideos = await prisma.video.count({
      where: {
        OR: [
          { youtubeUrl: { contains: "youtube", mode: "insensitive" } },
          { youtubeUrl: { contains: "youtu.be", mode: "insensitive" } },
        ],
      },
    });

    console.log(JSON.stringify({ mode: apply ? "apply" : "dry-run", stats }, null, 2));
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
