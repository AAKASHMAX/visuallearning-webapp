export type DocKind = "notes" | "ncert" | "pyq" | "important" | "ppt";

/** A chapter document's kind, by the same rules as the course viewer: PPTs by title or file, then NCERT, PYQ, Important Questions, Notes. */
export function docKind(title: string, pdfUrl: string | null): DocKind {
  if (/(ppt|pptx|presentation|slide)/.test(`${title} ${pdfUrl || ""}`.toLowerCase())) return "ppt";
  const t = title.toLowerCase();
  if (t.includes("ncert")) return "ncert";
  if (/pyq|previous year|board paper/.test(t)) return "pyq";
  if (/important|question bank/.test(t)) return "important";
  return "notes";
}

export const DOC_KIND_LABELS: Record<DocKind, string> = {
  notes: "Notes",
  ncert: "NCERT Solutions",
  pyq: "PYQ Solutions",
  important: "Important Questions",
  ppt: "Presentation",
};
