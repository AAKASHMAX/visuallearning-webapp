import { PrismaClient } from "@prisma/client";
const p = new PrismaClient();
(async () => {
  for (const tier of ["11", "12"]) {
    const chs = await p.chapter.findMany({
      where: { course: { tier } },
      select: { name: true, notes: { select: { title: true, htmlContent: true } } },
      orderBy: { displayOrder: "asc" },
    });
    let t = 0;
    console.log(`\n===== Tier ${tier} =====`);
    for (const c of chs) {
      const withHtml = c.notes.filter((n) => n.htmlContent).length;
      t += withHtml;
      console.log(`${c.name}: ${c.notes.length} notes (${withHtml} w/ html) → ${c.notes.map((n) => n.title).join(", ")}`);
    }
    console.log(`TOTAL notes w/ html (tier ${tier}): ${t}`);
  }
  await p.$disconnect();
})();
