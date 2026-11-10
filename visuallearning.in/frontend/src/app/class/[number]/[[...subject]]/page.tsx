import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ClassLanding } from "../../_components/class-landing";
import { ClassOverview, classLandingPath, subjectCodeFromSlug } from "@/lib/class-landing";

// The course landing page of a class. Visitors see /class-12 (or /class-12/physics); next.config
// rewrites that address to this route. Built once and refreshed every few minutes, so it opens at
// once even while the API is waking up.
export const revalidate = 300;

// No class pages are built ahead of time; each is built on its first visit and then kept.
export function generateStaticParams() {
  return [];
}

type Params = { number: string; subject?: string[] };

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

/** The class's subjects and chapters, or null when the API can't be reached in time (the page then loads them itself). */
async function loadOverview(number: string): Promise<ClassOverview | "missing" | null> {
  try {
    const res = await fetch(`${API}/public/classes/${number}`, { next: { revalidate }, signal: AbortSignal.timeout(8000) });
    if (res.status === 404) return "missing";
    if (!res.ok) return null;
    return ((await res.json()).data as ClassOverview) || null;
  } catch {
    return null;
  }
}

const validClass = (number: string) => /^\d{1,2}$/.test(number);

export function generateMetadata({ params }: { params: Params }): Metadata {
  if (!validClass(params.number)) return {};
  const title = `Class ${params.number} complete course: 3D videos, notes, NCERT solutions | VisualLearning`;
  const description = `Class ${params.number} chapter by chapter: 3D animated videos, chapter notes, NCERT solutions and solved PYQs. Preview any chapter's notes free.`;
  const url = classLandingPath(params.number);
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { title, description, url, type: "website", siteName: "VisualLearning", images: [{ url: "/images/logo2.png" }] },
  };
}

export default async function ClassLandingPage({ params }: { params: Params }) {
  const subject = params.subject || [];
  if (!validClass(params.number) || subject.length > 1) notFound();
  // A subject in the address has to be one we know: /class-12/anything-else is not a page.
  if (subject[0] && !subjectCodeFromSlug(subject[0])) notFound();

  const overview = await loadOverview(params.number);
  if (overview === "missing") notFound();

  return <ClassLanding number={params.number} subjectSlug={subject[0] || null} initial={overview} />;
}
