-- Short public link per chapter (e.g. "12-bio-1" -> visuallearning.in/notes/12-bio-1), used in
-- YouTube descriptions. Filled by the API at startup and never changed afterwards.
-- Additive and idempotent, so it is safe to apply to prod at any time.

ALTER TABLE "Chapter" ADD COLUMN IF NOT EXISTS "slug" TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS "Chapter_slug_key" ON "Chapter"("slug");
