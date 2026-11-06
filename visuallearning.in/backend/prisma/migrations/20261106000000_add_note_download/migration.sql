-- Downloadable PDFs of notes (image pages + logo watermark, stored on R2). One row per note that
-- has a PDF; its R2 key never leaves the server. Additive and idempotent, safe to re-run.

CREATE TABLE IF NOT EXISTS "NoteDownload" (
    "noteId" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "pages" INTEGER NOT NULL,
    "bytes" INTEGER NOT NULL,
    "sourceHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NoteDownload_pkey" PRIMARY KEY ("noteId")
);

DO $$ BEGIN
    ALTER TABLE "NoteDownload" ADD CONSTRAINT "NoteDownload_noteId_fkey" FOREIGN KEY ("noteId") REFERENCES "Note"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
