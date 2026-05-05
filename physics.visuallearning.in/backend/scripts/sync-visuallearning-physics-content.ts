import fs from "fs";
import path from "path";
import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";

type SourceChapter = {
  className: string;
  subjectName: string;
  chapterId: string;
  chapterName: string;
  chapterOrder: number;
};

type SourceVideo = {
  chapterId: string;
  title: string;
  vimeoVideoId: string | null;
  language: string | null;
  order: number | null;
  isFree: boolean | null;
  type: string | null;
};

type SourceNote = {
  chapterId: string;
  title: string;
  pdfUrl: string;
};

type SourceQuestion = {
  chapterId: string;
  questionText: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctOption: string;
  solution: string | null;
};

const root = path.resolve(__dirname, "../../..");
const visualEnvPath = path.join(root, "visuallearning.in/backend/.env");
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
    .replace(/\b(chapter|ch|class|std|standard)\b/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function stripVideoTitleNumber(title: string) {
  return title.replace(/^\s*\d+([.)]|[-:]|\s)+\s*/, "").trim();
}

function toVimeoUrl(vimeoVideoId: string | null) {
  const clean = (vimeoVideoId || "").trim();
  if (!clean) return "";
  if (/^https?:\/\//i.test(clean)) return clean;
  return `https://vimeo.com/${clean}`;
}

function isVimeoUrl(value: string | null | undefined) {
  return Boolean(value && /vimeo\.com/i.test(value));
}

function isClass9To12(className: string) {
  return /\b(9|10|11|12)(th)?\b/i.test(className);
}

async function main() {
  const apply = process.argv.includes("--apply");
  const source = new PrismaClient({
    datasourceUrl: process.env.VISUAL_DATABASE_URL || readEnvValue(visualEnvPath, "DATABASE_URL"),
  });
  const target = new PrismaClient({
    datasourceUrl: process.env.PHYSICS_DATABASE_URL || readEnvValue(physicsEnvPath, "DATABASE_URL"),
  });

  const stats = {
    sourceChapters: 0,
    duplicateChaptersRemoved: 0,
    chaptersCreated: 0,
    chaptersReused: 0,
    youtubeOnlyVideosDeleted: 0,
    videosCreated: 0,
    videosUpdated: 0,
    videosSkippedNoVimeo: 0,
    notesCreated: 0,
    questionsCreated: 0,
    finalDuplicateChapterGroups: 0,
    remainingYoutubeOnlyVideos: 0,
  };

  try {
    const sourceChapters = await source.$queryRawUnsafe<SourceChapter[]>(`
      SELECT c."name" AS "className", s."name" AS "subjectName", ch."id" AS "chapterId",
             ch."name" AS "chapterName", ch."order" AS "chapterOrder"
      FROM "Chapter" ch
      JOIN "Subject" s ON s."id" = ch."subjectId"
      JOIN "Class" c ON c."id" = s."classId"
      WHERE s."name" ILIKE '%physics%'
      ORDER BY c."order" ASC, s."name" ASC, ch."order" ASC, ch."name" ASC
    `);

    const chapters = sourceChapters.filter((chapter) => isClass9To12(chapter.className));
    stats.sourceChapters = chapters.length;
    const sourceChapterIds = chapters.map((chapter) => chapter.chapterId);

    const [sourceVideos, sourceNotes, sourceQuestions] = await Promise.all([
      source.$queryRawUnsafe<SourceVideo[]>(`
        SELECT "chapterId", "title", "vimeoVideoId", "language", "order", "isFree", "type"
        FROM "Video"
        WHERE "chapterId" = ANY($1)
        ORDER BY "order" ASC, "title" ASC
      `, sourceChapterIds),
      source.$queryRawUnsafe<SourceNote[]>(`
        SELECT "chapterId", "title", "pdfUrl"
        FROM "Note"
        WHERE "chapterId" = ANY($1)
        ORDER BY "createdAt" ASC, "title" ASC
      `, sourceChapterIds),
      source.$queryRawUnsafe<SourceQuestion[]>(`
        SELECT "chapterId", "questionText", "optionA", "optionB", "optionC", "optionD", "correctOption", "solution"
        FROM "Question"
        WHERE "chapterId" = ANY($1)
        ORDER BY "createdAt" ASC
      `, sourceChapterIds),
    ]);

    const targetChapters = await target.chapter.findMany({
      include: {
        videos: true,
        notes: true,
        questions: true,
        courseLinks: true,
      },
      orderBy: [{ displayOrder: "asc" }, { createdAt: "asc" }],
    });

    const byName = new Map<string, typeof targetChapters>();
    for (const chapter of targetChapters) {
      const key = normalize(chapter.name);
      byName.set(key, [...(byName.get(key) || []), chapter]);
    }

    if (apply) {
      for (const [, group] of byName) {
        if (group.length < 2) continue;
        const primary = [...group].sort((a, b) => {
          const aCount = a.videos.length + a.notes.length + a.questions.length + a.courseLinks.length;
          const bCount = b.videos.length + b.notes.length + b.questions.length + b.courseLinks.length;
          return bCount - aCount;
        })[0];

        for (const duplicate of group) {
          if (duplicate.id === primary.id) continue;
          for (const link of duplicate.courseLinks) {
            await target.courseChapter.upsert({
              where: { courseId_chapterId: { courseId: link.courseId, chapterId: primary.id } },
              update: { order: link.order },
              create: { courseId: link.courseId, chapterId: primary.id, order: link.order },
            });
          }
          await target.video.updateMany({ where: { chapterId: duplicate.id }, data: { chapterId: primary.id } });
          await target.note.updateMany({ where: { chapterId: duplicate.id }, data: { chapterId: primary.id } });
          await target.question.updateMany({ where: { chapterId: duplicate.id }, data: { chapterId: primary.id } });
          await target.chapter.delete({ where: { id: duplicate.id } });
          stats.duplicateChaptersRemoved += 1;
        }
      }
    } else {
      stats.duplicateChaptersRemoved = [...byName.values()].reduce((sum, group) => sum + Math.max(0, group.length - 1), 0);
    }

    const refreshedChapters = await target.chapter.findMany({
      include: { videos: true, notes: true, questions: true },
      orderBy: [{ displayOrder: "asc" }, { createdAt: "asc" }],
    });
    const targetByName = new Map(refreshedChapters.map((chapter) => [normalize(chapter.name), chapter]));
    const sourceToTargetChapter = new Map<string, string>();

    for (const chapter of chapters) {
      const key = normalize(chapter.chapterName);
      let targetChapter = targetByName.get(key);

      if (!targetChapter) {
        stats.chaptersCreated += 1;
        if (apply) {
          targetChapter = await target.chapter.create({
            data: {
              name: chapter.chapterName,
              displayOrder: chapter.chapterOrder || 0,
            },
            include: { videos: true, notes: true, questions: true },
          });
          targetByName.set(key, targetChapter);
        }
      } else {
        stats.chaptersReused += 1;
      }

      if (targetChapter) sourceToTargetChapter.set(chapter.chapterId, targetChapter.id);
    }

    const migratedChapterIds = [...new Set([...sourceToTargetChapter.values()])];
    if (apply && migratedChapterIds.length > 0) {
      const deleteResult = await target.video.deleteMany({
        where: {
          chapterId: { in: migratedChapterIds },
          NOT: { youtubeUrl: { contains: "vimeo.com", mode: "insensitive" } },
        },
      });
      stats.youtubeOnlyVideosDeleted = deleteResult.count;
    }

    for (const sourceVideo of sourceVideos) {
      const chapterId = sourceToTargetChapter.get(sourceVideo.chapterId);
      if (!chapterId) continue;
      const vimeoUrl = toVimeoUrl(sourceVideo.vimeoVideoId);
      if (!isVimeoUrl(vimeoUrl)) {
        stats.videosSkippedNoVimeo += 1;
        continue;
      }

      const cleanTitle = stripVideoTitleNumber(sourceVideo.title);
      if (apply) {
        const existing = await target.video.findFirst({
          where: {
            chapterId,
            OR: [
              { youtubeUrl: vimeoUrl },
              { title: cleanTitle, language: sourceVideo.language || "HINDI" },
            ],
          },
        });

        if (existing) {
          await target.video.update({
            where: { id: existing.id },
            data: {
              title: cleanTitle,
              youtubeUrl: vimeoUrl,
              videoType: sourceVideo.type || "ANIMATED_VIDEO",
              language: sourceVideo.language || "HINDI",
              isFree: Boolean(sourceVideo.isFree),
              displayOrder: sourceVideo.order || 0,
            },
          });
          stats.videosUpdated += 1;
        } else {
          await target.video.create({
            data: {
              title: cleanTitle,
              youtubeUrl: vimeoUrl,
              videoType: sourceVideo.type || "ANIMATED_VIDEO",
              language: sourceVideo.language || "HINDI",
              isFree: Boolean(sourceVideo.isFree),
              displayOrder: sourceVideo.order || 0,
              chapterId,
            },
          });
          stats.videosCreated += 1;
        }
      } else {
        stats.videosCreated += 1;
      }
    }

    for (const sourceNote of sourceNotes) {
      const chapterId = sourceToTargetChapter.get(sourceNote.chapterId);
      if (!chapterId || !sourceNote.pdfUrl) continue;
      if (apply) {
        const existing = await target.note.findFirst({
          where: { chapterId, OR: [{ fileUrl: sourceNote.pdfUrl }, { title: sourceNote.title }] },
        });
        if (!existing) {
          await target.note.create({
            data: {
              title: sourceNote.title,
              fileUrl: sourceNote.pdfUrl,
              chapterId,
            },
          });
          stats.notesCreated += 1;
        }
      } else {
        stats.notesCreated += 1;
      }
    }

    for (const sourceQuestion of sourceQuestions) {
      const chapterId = sourceToTargetChapter.get(sourceQuestion.chapterId);
      if (!chapterId) continue;
      if (apply) {
        const existing = await target.question.findFirst({
          where: { chapterId, question: sourceQuestion.questionText },
        });
        if (!existing) {
          await target.question.create({
            data: {
              question: sourceQuestion.questionText,
              optionA: sourceQuestion.optionA,
              optionB: sourceQuestion.optionB,
              optionC: sourceQuestion.optionC,
              optionD: sourceQuestion.optionD,
              correctAnswer: sourceQuestion.correctOption,
              solution: sourceQuestion.solution,
              chapterId,
            },
          });
          stats.questionsCreated += 1;
        }
      } else {
        stats.questionsCreated += 1;
      }
    }

    const finalChapters = await target.chapter.findMany({ select: { id: true, name: true } });
    const finalGroups = new Map<string, number>();
    for (const chapter of finalChapters) {
      const key = normalize(chapter.name);
      finalGroups.set(key, (finalGroups.get(key) || 0) + 1);
    }
    stats.finalDuplicateChapterGroups = [...finalGroups.values()].filter((count) => count > 1).length;

    const finalMigratedChapterIds = [...new Set([...sourceToTargetChapter.values()])];
    if (finalMigratedChapterIds.length > 0) {
      stats.remainingYoutubeOnlyVideos = await target.video.count({
        where: {
          chapterId: { in: finalMigratedChapterIds },
          NOT: { youtubeUrl: { contains: "vimeo.com", mode: "insensitive" } },
        },
      });
    }

    console.log(JSON.stringify({ mode: apply ? "apply" : "dry-run", stats }, null, 2));
  } finally {
    await source.$disconnect();
    await target.$disconnect();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
