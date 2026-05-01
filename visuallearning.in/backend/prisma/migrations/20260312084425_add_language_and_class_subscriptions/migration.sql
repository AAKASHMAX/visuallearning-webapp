-- CreateEnum
CREATE TYPE "Language" AS ENUM ('ENGLISH', 'HINDI', 'MARATHI', 'TAMIL', 'TELUGU');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "PlanType" ADD VALUE 'SINGLE_CLASS';
ALTER TYPE "PlanType" ADD VALUE 'MULTI_CLASS';
ALTER TYPE "PlanType" ADD VALUE 'FULL_ACCESS';

-- AlterTable
ALTER TABLE "Subscription" ADD COLUMN     "classesAccess" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- AlterTable
ALTER TABLE "Video" ADD COLUMN     "language" "Language" NOT NULL DEFAULT 'ENGLISH';

-- CreateIndex
CREATE INDEX "Video_chapterId_language_idx" ON "Video"("chapterId", "language");
