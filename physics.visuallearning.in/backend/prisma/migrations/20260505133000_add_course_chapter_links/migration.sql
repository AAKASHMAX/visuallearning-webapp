CREATE TABLE IF NOT EXISTS "CourseChapter" (
  "courseId" TEXT NOT NULL,
  "chapterId" TEXT NOT NULL,
  "order" INTEGER NOT NULL DEFAULT 0,
  CONSTRAINT "CourseChapter_pkey" PRIMARY KEY ("courseId","chapterId")
);

CREATE INDEX IF NOT EXISTS "CourseChapter_courseId_idx" ON "CourseChapter"("courseId");
CREATE INDEX IF NOT EXISTS "CourseChapter_chapterId_idx" ON "CourseChapter"("chapterId");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'CourseChapter_courseId_fkey'
  ) THEN
    ALTER TABLE "CourseChapter" ADD CONSTRAINT "CourseChapter_courseId_fkey"
    FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'CourseChapter_chapterId_fkey'
  ) THEN
    ALTER TABLE "CourseChapter" ADD CONSTRAINT "CourseChapter_chapterId_fkey"
    FOREIGN KEY ("chapterId") REFERENCES "Chapter"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

INSERT INTO "CourseChapter" ("courseId", "chapterId", "order")
SELECT "courseId", "id", "displayOrder"
FROM "Chapter"
WHERE "courseId" IS NOT NULL
ON CONFLICT ("courseId", "chapterId") DO NOTHING;

ALTER TABLE "Chapter" ALTER COLUMN "courseId" DROP NOT NULL;

ALTER TABLE "Chapter" DROP CONSTRAINT IF EXISTS "Chapter_courseId_fkey";
ALTER TABLE "Chapter" ADD CONSTRAINT "Chapter_courseId_fkey"
FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE SET NULL ON UPDATE CASCADE;
