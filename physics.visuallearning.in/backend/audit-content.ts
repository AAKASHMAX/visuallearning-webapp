/**
 * Audit PHYSICS app content coverage per chapter (tiers 11 & 12).
 * For each chapter reports presence (with real content) of:
 *   Notes / NCERT / PYQ / Important / PPT / Quiz
 *
 * Run: DATABASE_URL="<physics-prod>" npx tsx audit-content.ts
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const has = (b: boolean) => (b ? "✓" : "·");
const t = (s: string) => (s || "").toLowerCase();

type Note = { title: string; htmlContent: string | null; fileUrl: string };
function classify(notes: Note[]) {
  const html = (n: Note) => !!(n.htmlContent && n.htmlContent.replace(/<[^>]*>/g, "").trim().length > 40);
  const isNcert = (n: Note) => t(n.title).includes("ncert");
  const isPyq = (n: Note) => /pyq|previous year|board paper/.test(t(n.title));
  const isImp = (n: Note) => t(n.title).includes("important");
  const isPpt = (n: Note) => /ppt|presentation/.test(t(n.title));
  const isPlain = (n: Note) => !isNcert(n) && !isPyq(n) && !isImp(n) && !isPpt(n);
  return {
    notes: notes.some((n) => isPlain(n) && html(n)),
    ncert: notes.some((n) => isNcert(n) && html(n)),
    pyq: notes.some((n) => isPyq(n) && (html(n) || !!n.fileUrl)),
    imp: notes.some((n) => isImp(n) && html(n)),
    ppt: notes.some((n) => isPpt(n) && (!!n.fileUrl || html(n))),
  };
}

(async () => {
  console.log("PHYSICS app — tiers 11 & 12   (✓ = has real content)\n");
  console.log("Chapter".padEnd(46), "Notes NCERT PYQ  Imp  PPT  Quiz");
  const missing: string[] = [];

  for (const tier of ["11", "12"]) {
    const chapters = await prisma.chapter.findMany({
      where: { course: { tier } },
      include: { notes: { select: { title: true, htmlContent: true, fileUrl: true } }, _count: { select: { questions: true } } },
      orderBy: { displayOrder: "asc" },
    });
    console.log(`\n## Class ${tier}  (${chapters.length} chapters)`);
    for (const ch of chapters) {
      const c = classify(ch.notes as Note[]);
      const quiz = ch._count.questions > 0;
      console.log(
        ch.name.slice(0, 45).padEnd(46),
        ` ${has(c.notes)}    ${has(c.ncert)}    ${has(c.pyq)}    ${has(c.imp)}    ${has(c.ppt)}    ${has(quiz)}`
      );
      const gaps = [!c.notes && "Notes", !c.ncert && "NCERT", !c.pyq && "PYQ", !quiz && "Quiz"].filter(Boolean);
      if (gaps.length) missing.push(`Class ${tier} / ${ch.name}: ${gaps.join(", ")}`);
    }
  }

  console.log(`\n=== Core gaps (Notes/NCERT/PYQ/Quiz) — ${missing.length} chapters ===`);
  missing.forEach((m) => console.log("  - " + m));
  await prisma.$disconnect();
})();
