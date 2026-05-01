-- AlterTable
ALTER TABLE "Video" ADD COLUMN "vimeoVideoId" TEXT;

-- Set default for youtubeVideoId (allow empty for Vimeo-only videos)
ALTER TABLE "Video" ALTER COLUMN "youtubeVideoId" SET DEFAULT '';
