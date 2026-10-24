-- Two versions of every 3D video: BASIC (the original videos, all existing rows) and
-- ADVANCED (the new versions published from the animation tracker).
-- Idempotent so it can be applied to prod safely.

ALTER TABLE "Video" ADD COLUMN IF NOT EXISTS "level" TEXT NOT NULL DEFAULT 'BASIC';

CREATE INDEX IF NOT EXISTS "Video_chapterId_level_idx" ON "Video"("chapterId", "level");
