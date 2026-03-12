-- AlterTable
ALTER TABLE "Video" ADD COLUMN     "type" TEXT NOT NULL DEFAULT 'ANIMATED_VIDEO';

-- CreateTable
CREATE TABLE "BoardPaper" (
    "id" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "pdfUrl" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BoardPaper_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "BoardPaper_subjectId_idx" ON "BoardPaper"("subjectId");

-- CreateIndex
CREATE UNIQUE INDEX "BoardPaper_subjectId_year_title_key" ON "BoardPaper"("subjectId", "year", "title");

-- CreateIndex
CREATE INDEX "Video_chapterId_type_idx" ON "Video"("chapterId", "type");

-- AddForeignKey
ALTER TABLE "BoardPaper" ADD CONSTRAINT "BoardPaper_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject"("id") ON DELETE CASCADE ON UPDATE CASCADE;
