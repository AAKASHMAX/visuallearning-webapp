/**
 * Course pages are addressed by database ids, so a scene's "watch the lesson"
 * link is resolved when clicked: class by number, subject by name, chapter by
 * the closest title. Anything that can't be matched falls back one level up.
 */
import api from "@/lib/api";
import type { Lesson } from "./content";

type Named = { id: string; name?: string; title?: string };

const cache = new Map<string, Promise<unknown>>();
function cached<T>(key: string, load: () => Promise<T>): Promise<T> {
  if (!cache.has(key)) cache.set(key, load().catch((e) => { cache.delete(key); throw e; }));
  return cache.get(key) as Promise<T>;
}

const classes = () => cached("classes", async () => (await api.get("/courses/classes")).data.data as Named[]);

async function classFor(n: number): Promise<Named | undefined> {
  return (await classes()).find((c) => (c.name ?? "").match(/\d+/)?.[0] === String(n));
}

const SMALL = new Set(["the", "and", "of", "in", "its", "their", "to"]);
const words = (s: string) => new Set(s.toLowerCase().split(/[^a-z0-9]+/).filter((w) => w.length > 1 && !SMALL.has(w)));

function bestMatch(want: string, list: Named[]): Named | undefined {
  const target = words(want);
  let best: Named | undefined;
  let score = 0;
  for (const item of list) {
    const have = words(item.name ?? item.title ?? "");
    const shared = [...target].filter((w) => have.has(w)).length;
    const s = shared / Math.max(1, Math.min(target.size, have.size));
    if (s > score) {
      score = s;
      best = item;
    }
  }
  return score >= 0.5 ? best : undefined;
}

export async function lessonHref(lesson: Lesson): Promise<string> {
  try {
    const cls = await classFor(lesson.cls);
    if (!cls) return "/courses";
    const subjects = await cached(`subjects:${cls.id}`, async () => (await api.get(`/courses/classes/${cls.id}/subjects`)).data.data.subjects as Named[]);
    const subject = subjects.find((s) => (s.name ?? "").toLowerCase().includes(lesson.subject.toLowerCase()));
    if (!subject) return `/courses/${cls.id}`;
    const chapters = await cached(`chapters:${subject.id}`, async () => ((await api.get(`/courses/subjects/${subject.id}/chapters`)).data.data.chapters ?? []) as Named[]);
    const chapter = bestMatch(lesson.chapter, chapters);
    return chapter ? `/courses/${cls.id}/${subject.id}/${chapter.id}` : `/courses/${cls.id}/${subject.id}`;
  } catch {
    return "/courses";
  }
}

export async function classHref(n: number): Promise<string> {
  try {
    const cls = await classFor(n);
    return cls ? `/courses/${cls.id}` : "/courses";
  } catch {
    return "/courses";
  }
}
