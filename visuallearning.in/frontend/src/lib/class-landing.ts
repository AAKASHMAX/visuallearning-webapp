/**
 * Course landing pages, one per class: /class-12, and /class-12/physics to open on a subject.
 * Linked from YouTube descriptions ("Get Complete Course"), so they open without login and the
 * addresses must never change.
 */

export type LandingChapter = {
  id: string;
  name: string;
  order: number;
  slug: string | null;
  isFree: boolean;
  notes: boolean;
  ncert: boolean;
  pyq: boolean;
  videos: number;
};

export type LandingVideo = { id: string; title: string; level: string; duration: string | null; vimeoId: string | null };

export type LandingSubject = {
  id: string;
  name: string;
  /** phy, chem, bio or math: the same code the chapter links use (12-phy-1). */
  code: string;
  chapters: LandingChapter[];
  counts: { chapters: number; notes: number; ncert: number; pyq: number; videos: number };
  sampleVideos: { chapterId: string; chapterName: string; isFree: boolean; language: string | null; items: LandingVideo[] } | null;
};

export type ClassOverview = {
  class: { id: string; name: string; number: string };
  classes: Array<{ number: string; name: string }>;
  subjects: LandingSubject[];
  counts: { subjects: number; chapters: number; notes: number; ncert: number; pyq: number; videos: number };
};

const SUBJECT_SLUGS: Record<string, string> = { phy: "physics", chem: "chemistry", bio: "biology", math: "maths" };

/** /class-12, or /class-12/physics for a subject. */
export function classLandingPath(number: string, subjectCode?: string | null) {
  const subject = subjectCode ? SUBJECT_SLUGS[subjectCode] || subjectCode : "";
  return `/class-${number}${subject ? `/${subject}` : ""}`;
}

/** "physics" (or "phy", "mathematics") -> the subject's code; null when it names no subject. */
export function subjectCodeFromSlug(slug: string | null | undefined) {
  const s = (slug || "").toLowerCase();
  if (!s) return null;
  for (const [code, name] of Object.entries(SUBJECT_SLUGS)) if (s === code || s === name || (s.length >= 3 && name.startsWith(s))) return code;
  return s.startsWith("math") ? "math" : null;
}

/** True on a landing page, in either form of its address (/class-12 as typed, /class/12 as routed). */
export function isClassLandingPath(path: string) {
  return /^\/class[-/]\d{1,2}(\/[a-z]+)?\/?$/i.test(path);
}

/** All the subject names in one phrase: "Physics, Chemistry and Biology". */
export function subjectList(subjects: Array<{ name: string }>) {
  const names = subjects.map((s) => s.name);
  if (names.length <= 1) return names[0] || "";
  return `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}`;
}
