/**
 * Export ALL Physics notes + NCERT (Class 11 & Class 12) from the main prod DB.
 *
 * Reads every chapter whose subject is Physics, grouped by class, and dumps each
 * chapter's notes (title, htmlContent, cssContent, pdfUrl). htmlContent already
 * references Cloudinary image URLs, so the export is self-contained — no image
 * re-upload is needed when importing into the physics app.
 *
 * Run (production):
 *   DATABASE_URL="<main-prod>" npx tsx export-all-notes.ts
 *
 * Output: all-notes-export.json  (consumed by physics import-all-notes.ts)
 */
import { PrismaClient } from "@prisma/client";
import fs from "fs";

const prisma = new PrismaClient();

(async () => {
  const host = (process.env.DATABASE_URL || "").replace(/.*@/, "").replace(/\/.*/, "");
  console.log("Reading from:", host);

  // All Physics chapters across every class, with their notes.
  const chapters = await prisma.chapter.findMany({
    where: { subject: { name: { contains: "Physics", mode: "insensitive" } } },
    include: {
      subject: { include: { class: true } },
      notes: {
        select: { title: true, htmlContent: true, cssContent: true, pdfUrl: true, createdAt: true },
        orderBy: { createdAt: "asc" },
      },
    },
    orderBy: { order: "asc" },
  });

  // Group by class name.
  const byClass: Record<string, any> = {};
  for (const ch of chapters) {
    const className = ch.subject.class.name;
    (byClass[className] ??= { className, chapters: [] }).chapters.push({
      chapterName: ch.name,
      order: ch.order,
      notes: ch.notes.map((n) => ({
        title: n.title,
        htmlContent: n.htmlContent,
        cssContent: n.cssContent,
        pdfUrl: n.pdfUrl,
      })),
    });
  }

  const out = { classes: Object.values(byClass) };
  fs.writeFileSync(__dirname + "/all-notes-export.json", JSON.stringify(out, null, 2), "utf-8");

  // Summary.
  let totalNotes = 0;
  console.log("\n=== Export summary ===");
  for (const c of out.classes as any[]) {
    console.log(`\n${c.className}  (${c.chapters.length} chapters)`);
    for (const ch of c.chapters) {
      totalNotes += ch.notes.length;
      const titles = ch.notes.map((n: any) => `"${n.title}"${n.htmlContent ? "" : " [no-html]"}`).join(", ");
      console.log(`  - ${ch.chapterName}: ${ch.notes.length} notes  ${titles ? "→ " + titles : ""}`);
    }
  }
  console.log(`\nTotal: ${chapters.length} Physics chapters, ${totalNotes} notes → all-notes-export.json`);
  await prisma.$disconnect();
})();
