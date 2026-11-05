/**
 * Public document pages linked from YouTube descriptions: /notes/12-bio-1, /ncert/12-bio-1,
 * /pyq/12-bio-1. The linked document opens without login; everything else asks for a free account.
 */

export const PUBLIC_DOC_KINDS = ["notes", "ncert", "pyq"] as const;
export type PublicDocKind = (typeof PUBLIC_DOC_KINDS)[number];

export const PUBLIC_DOC_LABELS: Record<PublicDocKind, { title: string; short: string }> = {
  notes: { title: "Notes", short: "Notes" },
  ncert: { title: "NCERT Solutions", short: "NCERT" },
  pyq: { title: "PYQ Solutions", short: "PYQs" },
};

export function isPublicDocPath(path: string) {
  return /^\/(notes|ncert|pyq)\/[^/]+\/?$/.test(path);
}

export function publicDocPath(kind: PublicDocKind, slug: string) {
  return `/${kind}/${slug}`;
}

const SUBJECTS: Record<string, string> = { phy: "Physics", chem: "Chemistry", bio: "Biology", math: "Mathematics" };

/** "12-bio-1" -> "Class 12 Biology · Chapter 1", for titles shown before the API answers. */
export function describeSlug(slug: string) {
  const match = /^(\d{1,2})-([a-z]+)-(\d+)[a-z]?$/.exec(slug.toLowerCase());
  if (!match) return null;
  const subject = SUBJECTS[match[2]] || match[2].charAt(0).toUpperCase() + match[2].slice(1);
  return `Class ${match[1]} ${subject} · Chapter ${match[3]}`;
}
