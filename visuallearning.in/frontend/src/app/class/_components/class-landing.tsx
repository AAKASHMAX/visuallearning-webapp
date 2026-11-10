"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, BookOpen, Check, ChevronRight, Eye, FileText, Loader2, Lock, Play, RefreshCw, Smartphone, Sparkles, X } from "lucide-react";
import api from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { authLink } from "@/lib/auth-redirect";
import { APP_PUBLISHED, PLAY_STORE_URL } from "@/lib/app-links";
import { ClassOverview, LandingChapter, LandingSubject, classLandingPath, subjectCodeFromSlug, subjectList } from "@/lib/class-landing";
import { PUBLIC_DOC_KINDS, PUBLIC_DOC_LABELS, PublicDocKind, publicDocPath } from "@/lib/public-docs";
import { SUBJECT_THEME, subjectKind } from "@/components/courses/course-art";
import { VimeoThumb } from "@/components/video-thumb";
import { DocHtml } from "@/components/notes/doc-html";
import { cn } from "@/lib/utils";

type Plan = { id: string; name: string; monthlyPrice?: number; yearlyPrice?: number; features?: string[]; classSelection?: number };
type Preview = { subjectId: string; chapterId: string; kind: PublicDocKind };

const LANGUAGE_LABELS: Record<string, string> = { HINDI: "Hinglish", ENGLISH: "English" };
const rupees = (n: number) => `₹${n.toLocaleString("en-IN")}`;
const plural = (n: number, one: string, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;
const docKindsOf = (ch: LandingChapter) => PUBLIC_DOC_KINDS.filter((k) => ch[k]);
// The document kinds inside a sentence ("Read the full NCERT solutions").
const DOC_WORDS: Record<PublicDocKind, string> = { notes: "notes", ncert: "NCERT solutions", pyq: "PYQ solutions" };

/**
 * The course page of one class: what the course holds, every chapter by subject with a look inside
 * its notes, sample 3D lessons and the plan. `initial` comes from the server when it could reach
 * the API in time; otherwise the page loads it here.
 */
export function ClassLanding({ number, subjectSlug, initial }: { number: string; subjectSlug: string | null; initial: ClassOverview | null }) {
  const [data, setData] = useState<ClassOverview | null>(initial);
  const [status, setStatus] = useState<"loading" | "ready" | "missing" | "error">(initial ? "ready" : "loading");
  const [slow, setSlow] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [active, setActive] = useState<string | null>(subjectCodeFromSlug(subjectSlug));
  const [preview, setPreview] = useState<Preview | null>(null);
  const [plan, setPlan] = useState<Plan | null>(null);
  const { isAuthenticated, hydrate } = useAuth();

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (initial && attempt === 0) return;
    let live = true;
    setStatus("loading");
    setSlow(false);
    // The API sleeps when idle; tell the visitor why the first open can take a while.
    const slowTimer = window.setTimeout(() => live && setSlow(true), 5000);
    api
      .get(`/public/classes/${encodeURIComponent(number)}`)
      .then((res) => {
        if (!live) return;
        setData(res.data.data as ClassOverview);
        setStatus("ready");
      })
      .catch((err) => {
        if (live) setStatus(err?.response?.status === 404 ? "missing" : "error");
      })
      .finally(() => window.clearTimeout(slowTimer));
    return () => {
      live = false;
      window.clearTimeout(slowTimer);
    };
  }, [number, attempt, initial]);

  // The price of the plan that covers one class; the page works without it.
  useEffect(() => {
    let live = true;
    api
      .get("/subscription/plans")
      .then((res) => {
        const plans = ((res.data?.data?.plans || []) as Plan[]).filter((p) => (p.yearlyPrice || p.monthlyPrice || 0) > 0);
        const pick = plans.find((p) => p.classSelection === 1) || [...plans].sort((a, b) => (a.yearlyPrice || Infinity) - (b.yearlyPrice || Infinity))[0];
        if (live && pick) setPlan(pick);
      })
      .catch(() => {});
    return () => {
      live = false;
    };
  }, []);

  if (status === "loading") return <LoadingState number={number} slow={slow} />;
  if (status === "missing") return <MissingState />;
  if (status === "error" || !data) return <ErrorState onRetry={() => setAttempt((n) => n + 1)} />;

  const anonymous = !isAuthenticated;
  const here = classLandingPath(number);
  // Beyond the free first chapters, reading needs a (free) account: logged-out visitors sign up
  // first and land on what they picked.
  const gate = (href: string) => (anonymous ? authLink("/auth/signup", href) : href);
  const subject = data.subjects.find((s) => s.code === active) || data.subjects[0];
  const className = data.class.name;
  const classPage = `/courses/${data.class.id}`;

  const pickSubject = (code: string) => {
    setActive(code);
    // Keep the address in step, so a shared or reloaded link opens on the same subject.
    window.history.replaceState(null, "", `${classLandingPath(number, code)}${window.location.search}`);
  };

  const previewSubject = preview ? data.subjects.find((s) => s.id === preview.subjectId) : null;
  const previewChapter = previewSubject?.chapters.find((ch) => ch.id === preview?.chapterId) || null;

  return (
    <div>
      <Hero data={data} anonymous={anonymous} signupHref={authLink("/auth/signup", here)} classPage={classPage} number={number} plan={plan} />

      {subject && (
        <section id="chapters" className="mx-auto max-w-6xl px-3 pb-2 pt-8 sm:px-6">
          <h2 className="text-xl font-black text-heading sm:text-2xl">Every chapter, with a look inside</h2>
          <p className="mt-1 text-sm text-text-muted">Pick a chapter to preview its notes. No sign-up needed to look.</p>

          {data.subjects.length > 1 && (
            <div className="-mx-3 mt-4 flex gap-2 overflow-x-auto px-3 pb-1 sm:mx-0 sm:px-0" role="tablist" aria-label="Subjects">
              {data.subjects.map((s) => {
                const current = s.id === subject.id;
                const accent = SUBJECT_THEME[subjectKind(s.name)].accent;
                return (
                  <button
                    key={s.id}
                    type="button"
                    role="tab"
                    aria-selected={current}
                    onClick={() => pickSubject(s.code)}
                    className={cn(
                      "inline-flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-sm font-black transition-colors",
                      current ? "border-transparent text-primary-dark" : "border-card-border bg-card text-heading hover:border-accent/50"
                    )}
                    style={current ? { backgroundColor: accent } : undefined}
                  >
                    {s.name}
                    <span className={cn("text-xs font-bold", current ? "text-primary-dark/70" : "text-text-muted")}>{s.counts.chapters}</span>
                  </button>
                );
              })}
            </div>
          )}

          <SubjectSummary subject={subject} className={className} />
          <ChapterList
            subject={subject}
            anonymous={anonymous}
            chapterHref={(ch) => gate(`/courses/${data.class.id}/${subject.id}/${ch.id}`)}
            onPreview={(ch, kind) => setPreview({ subjectId: subject.id, chapterId: ch.id, kind })}
          />
          <p className="mt-4 text-xs leading-5 text-text-muted">
            The first chapter of every subject is free. A free account opens the notes, NCERT solutions and PYQs of every chapter; the 3D videos of the other chapters come with a plan.
          </p>
        </section>
      )}

      {subject?.sampleVideos && (
        <SampleVideos subject={subject} href={gate(`/courses/${data.class.id}/${subject.id}/${subject.sampleVideos.chapterId}`)} anonymous={anonymous} />
      )}

      <PlanSection data={data} plan={plan} anonymous={anonymous} signupHref={authLink("/auth/signup", here)} classPage={classPage} />

      {APP_PUBLISHED && (
        <div className="mx-auto max-w-6xl px-3 pb-10 sm:px-6">
          <a href={PLAY_STORE_URL} target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 rounded-2xl border border-card-border bg-card p-4 transition-colors hover:border-accent/40 hover:bg-card-hover">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-secondary/20 text-secondary-light">
              <Smartphone className="h-5 w-5" aria-hidden="true" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-black text-heading">Study on your phone</span>
              <span className="block text-xs text-text-muted">Notes and 3D videos in the VisualLearning Android app</span>
            </span>
            <span className="shrink-0 text-xs font-black text-accent">Get the app</span>
          </a>
        </div>
      )}

      {anonymous && <StartBar title={`${className} complete course`} href={authLink("/auth/signup", here)} />}

      {preview && previewSubject && previewChapter && (
        <DocPreview
          subject={previewSubject}
          chapter={previewChapter}
          className={className}
          kind={preview.kind}
          onKind={(kind) => setPreview({ ...preview, kind })}
          onClose={() => setPreview(null)}
          anonymous={anonymous}
          gate={gate}
          chapterHref={gate(`/courses/${data.class.id}/${previewSubject.id}/${previewChapter.id}`)}
        />
      )}
    </div>
  );
}

function Hero({ data, anonymous, signupHref, classPage, number, plan }: { data: ClassOverview; anonymous: boolean; signupHref: string; classPage: string; number: string; plan: Plan | null }) {
  const { counts } = data;
  const stats = [
    counts.videos > 0 && { value: counts.videos, label: "3D animated videos" },
    counts.notes > 0 && { value: counts.notes, label: "chapter notes" },
    counts.ncert > 0 && { value: counts.ncert, label: "NCERT solution sets" },
    counts.pyq > 0 && { value: counts.pyq, label: "solved PYQ sets" },
  ].filter(Boolean) as Array<{ value: number; label: string }>;
  // A few real lessons, so the first thing a visitor sees is the product itself: one from every
  // subject first, then second ones until there are four.
  const bySubject = data.subjects.map((s) => (s.sampleVideos?.items || []).filter((v) => v.vimeoId).map((v) => ({ ...v, subject: s.name })));
  const lessons = [0, 1, 2, 3].flatMap((round) => bySubject.map((list) => list[round]).filter(Boolean)).slice(0, 4);
  const others = data.classes.filter((c) => c.number !== number);

  return (
    <section className="border-b border-card-border bg-gradient-to-b from-primary-dark to-surface">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 pb-8 pt-7 sm:px-6 lg:flex-row lg:items-center lg:pb-12 lg:pt-12">
        <div className="min-w-0 flex-1">
          <p className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-wider text-accent">
            <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
            Complete course
          </p>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-heading sm:text-5xl">{data.class.name}</h1>
          <p className="mt-3 max-w-xl text-base leading-7 text-text sm:text-lg">
            {subjectList(data.subjects)}, chapter by chapter: 3D animated videos, notes, NCERT solutions and solved PYQs.
          </p>

          <div className="mt-5 flex flex-col gap-2.5 sm:flex-row">
            {anonymous ? (
              <>
                <Link href="/pricing" className="inline-flex items-center justify-center gap-2 rounded-xl bg-accent px-5 py-3 text-sm font-black text-primary-dark transition-colors hover:bg-accent-light">
                  Get the complete course
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
                <Link href={signupHref} className="inline-flex items-center justify-center gap-2 rounded-xl border border-accent/40 px-5 py-3 text-sm font-black text-accent transition-colors hover:bg-accent/10">
                  Start free
                </Link>
              </>
            ) : (
              <>
                <Link href={classPage} className="inline-flex items-center justify-center gap-2 rounded-xl bg-accent px-5 py-3 text-sm font-black text-primary-dark transition-colors hover:bg-accent-light">
                  Open {data.class.name}
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
                <Link href="/pricing" className="inline-flex items-center justify-center gap-2 rounded-xl border border-accent/40 px-5 py-3 text-sm font-black text-accent transition-colors hover:bg-accent/10">
                  See plans
                </Link>
              </>
            )}
          </div>
          <p className="mt-3 text-xs leading-5 text-text-muted">
            {plan?.yearlyPrice ? `Full course from ${rupees(plan.yearlyPrice)} a year. ` : ""}
            {anonymous ? "A free account opens every chapter's notes; no card needed." : "Your free account already opens every chapter's notes."}
          </p>

          {stats.length > 0 && (
            <dl className="mt-6 grid max-w-xl grid-cols-2 gap-2 sm:grid-cols-4">
              {stats.map((s) => (
                <div key={s.label} className="rounded-xl border border-card-border bg-card/70 px-3 py-2.5">
                  <dt className="sr-only">{s.label}</dt>
                  <dd className="text-xl font-black text-heading">{s.value}</dd>
                  <dd className="text-[11px] font-semibold leading-tight text-text-muted">{s.label}</dd>
                </div>
              ))}
            </dl>
          )}

          {others.length > 0 && (
            <p className="mt-5 flex flex-wrap items-center gap-2 text-xs font-semibold text-text-muted">
              In another class?
              {others.map((c) => (
                <Link key={c.number} href={classLandingPath(c.number)} className="rounded-full border border-card-border bg-card px-3 py-1 font-black text-heading transition-colors hover:border-accent/50 hover:text-accent">
                  {c.name}
                </Link>
              ))}
            </p>
          )}
        </div>

        {lessons.length > 0 && (
          <div className="w-full lg:w-[26rem] lg:shrink-0">
            <div className="grid grid-cols-2 gap-2">
              {lessons.map((v) => (
                <div key={v.id} className="relative aspect-video overflow-hidden rounded-xl border border-card-border bg-primary-dark">
                  <VimeoThumb vimeoId={v.vimeoId as string} alt="" className="absolute inset-0 h-full w-full object-cover" />
                  <span className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent" aria-hidden="true" />
                  <span className="absolute left-1.5 top-1.5 rounded-md bg-black/60 px-1.5 py-0.5 text-[10px] font-black text-white">{v.subject}</span>
                  <span className="absolute inset-x-1.5 bottom-1 line-clamp-2 text-[11px] font-bold leading-tight text-white">{v.title}</span>
                </div>
              ))}
            </div>
            <p className="mt-2 text-center text-[11px] text-text-muted">Lessons from the course, all in 3D animation</p>
          </div>
        )}
      </div>
    </section>
  );
}

function SubjectSummary({ subject, className }: { subject: LandingSubject; className: string }) {
  const { counts } = subject;
  const docs = [
    { name: "notes", count: counts.notes },
    { name: "NCERT solutions", count: counts.ncert },
    { name: "PYQs", count: counts.pyq },
  ].filter((d) => d.count > 0);
  // "notes, NCERT solutions and PYQs for every chapter", then whatever covers only some chapters.
  const complete = docs.filter((d) => d.count === counts.chapters).map((d) => d.name);
  const partial = docs.filter((d) => d.count < counts.chapters).map((d) => `${d.name} for ${plural(d.count, "chapter")}`);
  const parts = [
    plural(counts.chapters, "chapter"),
    counts.videos > 0 && plural(counts.videos, "3D video"),
    complete.length > 0 && `${complete.length > 1 ? `${complete.slice(0, -1).join(", ")} and ${complete[complete.length - 1]}` : complete[0]} for every chapter`,
    ...partial,
  ].filter(Boolean) as string[];
  return (
    <p className="mt-4 text-sm font-semibold text-text">
      <span className="font-black text-heading">
        {className} {subject.name}:
      </span>{" "}
      {parts.join(" · ")}
    </p>
  );
}

function ChapterList({
  subject,
  anonymous,
  chapterHref,
  onPreview,
}: {
  subject: LandingSubject;
  anonymous: boolean;
  chapterHref: (ch: LandingChapter) => string;
  onPreview: (ch: LandingChapter, kind: PublicDocKind) => void;
}) {
  const accent = SUBJECT_THEME[subjectKind(subject.name)].accent;
  return (
    <ol className="mt-3 grid grid-cols-1 gap-2 lg:grid-cols-2">
      {subject.chapters.map((ch, index) => {
        const kinds = docKindsOf(ch);
        const canPreview = kinds.length > 0 && !!ch.slug;
        const body = (
          <>
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-dark text-sm font-black" style={{ color: accent }}>
              {index + 1}
            </span>
            <span className="min-w-0 flex-1 text-left">
              <span className="block text-sm font-bold leading-snug text-heading">{ch.name}</span>
              <span className="mt-1 flex flex-wrap gap-1">
                {ch.isFree && <span className="rounded-md bg-emerald-500/15 px-1.5 py-0.5 text-[10px] font-black text-emerald-300">Free</span>}
                {kinds.map((k) => (
                  <span key={k} className="rounded-md bg-surface-light px-1.5 py-0.5 text-[10px] font-bold text-text">
                    {PUBLIC_DOC_LABELS[k].short}
                  </span>
                ))}
                {ch.videos > 0 && (
                  <span className="inline-flex items-center gap-0.5 rounded-md bg-secondary/20 px-1.5 py-0.5 text-[10px] font-bold text-secondary-light">
                    <Play className="h-2.5 w-2.5 fill-current" aria-hidden="true" />
                    {ch.videos} 3D
                  </span>
                )}
              </span>
            </span>
            {canPreview ? (
              <span className="inline-flex shrink-0 items-center gap-1 text-xs font-black text-accent">
                <Eye className="h-3.5 w-3.5" aria-hidden="true" />
                Preview
              </span>
            ) : anonymous ? (
              <Lock className="h-4 w-4 shrink-0 text-text-muted" aria-label="Free account needed" />
            ) : (
              <ChevronRight className="h-4 w-4 shrink-0 text-text-muted" aria-hidden="true" />
            )}
          </>
        );
        const base = "flex w-full items-center gap-3 rounded-xl border border-card-border bg-card px-3 py-2.5 transition-colors hover:border-accent/40 hover:bg-card-hover";
        return (
          <li key={ch.id}>
            {canPreview ? (
              <button type="button" onClick={() => onPreview(ch, kinds[0])} className={base} aria-label={`Preview ${ch.name}`}>
                {body}
              </button>
            ) : (
              <Link href={chapterHref(ch)} className={base}>
                {body}
              </Link>
            )}
          </li>
        );
      })}
    </ol>
  );
}

function SampleVideos({ subject, href, anonymous }: { subject: LandingSubject; href: string; anonymous: boolean }) {
  const sample = subject.sampleVideos;
  if (!sample || sample.items.length === 0) return null;
  const language = sample.language ? LANGUAGE_LABELS[sample.language] || sample.language : null;
  return (
    <section className="mx-auto max-w-6xl px-3 pb-2 pt-8 sm:px-6">
      <div className="rounded-2xl border border-card-border bg-card p-4 sm:p-6">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-secondary/20 text-secondary-light">
            <Play className="h-5 w-5 fill-current" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <h2 className="text-lg font-black text-heading">See it, don&apos;t just read it</h2>
            <p className="text-xs text-text-muted">
              {subject.name} in 3D animation{language && ` · ${language}`} · from &ldquo;{sample.chapterName}&rdquo;
            </p>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {sample.items.map((video) => (
            <Link key={video.id} href={href} className="group relative block aspect-video overflow-hidden rounded-lg bg-primary-dark">
              {video.vimeoId && <VimeoThumb vimeoId={video.vimeoId} alt="" className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />}
              <span className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" aria-hidden="true" />
              <span className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white" aria-hidden="true">
                {sample.isFree ? <Play className="ml-0.5 h-3 w-3 fill-current" /> : <Lock className="h-3 w-3" />}
              </span>
              <span className="absolute inset-x-1.5 bottom-1 line-clamp-2 text-left text-[11px] font-bold leading-tight text-white">{video.title}</span>
            </Link>
          ))}
        </div>
        <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center">
          <Link href={href} className="inline-flex items-center justify-center gap-2 rounded-lg bg-secondary px-4 py-2.5 text-sm font-black text-white transition-colors hover:bg-secondary-light">
            <Play className="h-4 w-4 fill-current" aria-hidden="true" />
            {sample.isFree ? (anonymous ? "Watch this chapter free with an account" : "Watch this chapter") : "See the 3D videos"}
          </Link>
          <Link href="/demo/video" className="inline-flex items-center justify-center gap-2 rounded-lg border border-card-border px-4 py-2.5 text-sm font-black text-heading transition-colors hover:border-accent/50 hover:text-accent">
            Watch a sample lesson now
          </Link>
        </div>
      </div>
    </section>
  );
}

function PlanSection({ data, plan, anonymous, signupHref, classPage }: { data: ClassOverview; plan: Plan | null; anonymous: boolean; signupHref: string; classPage: string }) {
  const { counts } = data;
  const className = data.class.name;
  const included = [
    counts.videos > 0 && `All ${counts.videos} 3D animated videos of ${className}`,
    counts.notes > 0 && `Notes for ${plural(counts.notes, "chapter")}`,
    counts.ncert > 0 && `NCERT solutions for ${plural(counts.ncert, "chapter")}`,
    counts.pyq > 0 && `Solved PYQs for ${plural(counts.pyq, "chapter")}`,
    "Quizzes for practice",
    "On the website and in the Android app",
  ].filter(Boolean) as string[];

  return (
    <section data-plan-card className="mx-auto max-w-6xl px-3 py-8 sm:px-6">
      <div className="overflow-hidden rounded-2xl border border-accent/30 bg-gradient-to-br from-[#0b2a4a] via-card to-[#2a1660] p-5 sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center">
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-black uppercase tracking-wider text-accent">The complete course</p>
            <h2 className="mt-1 text-2xl font-black leading-tight text-heading">Everything for {className}, in one place</h2>
            <ul className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
              {included.map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm text-text">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" aria-hidden="true" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="w-full shrink-0 rounded-2xl border border-card-border bg-primary-dark/60 p-5 lg:w-80">
            {plan?.yearlyPrice ? (
              <>
                <p className="text-xs font-bold text-text-muted">{plan.name} plan</p>
                <p className="mt-1 text-3xl font-black text-heading">
                  {rupees(plan.yearlyPrice)}
                  <span className="text-sm font-bold text-text-muted"> a year</span>
                </p>
                {plan.monthlyPrice ? <p className="mt-1 text-xs text-text-muted">or {rupees(plan.monthlyPrice)} a month</p> : null}
              </>
            ) : (
              <p className="text-sm font-bold text-heading">Monthly and yearly plans</p>
            )}
            <Link href="/pricing" className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-sm font-black text-primary-dark transition-colors hover:bg-accent-light">
              Get the complete course
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            {anonymous ? (
              <Link href={signupHref} className="mt-2 block text-center text-xs font-bold text-accent hover:underline">
                Or start free: notes of every chapter
              </Link>
            ) : (
              <Link href={classPage} className="mt-2 block text-center text-xs font-bold text-accent hover:underline">
                Open {className} in your course
              </Link>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

type PreviewDoc = { id: string; title: string; htmlContent: string | null; cssContent: string | null; pdfUrl: string | null };

/**
 * A look inside one chapter's document without leaving the page: the first part of the real notes
 * (or NCERT solutions, PYQs), then the way to the full document.
 */
function DocPreview({
  subject,
  chapter,
  className,
  kind,
  onKind,
  onClose,
  anonymous,
  gate,
  chapterHref,
}: {
  subject: LandingSubject;
  chapter: LandingChapter;
  className: string;
  kind: PublicDocKind;
  onKind: (kind: PublicDocKind) => void;
  onClose: () => void;
  anonymous: boolean;
  gate: (href: string) => string;
  chapterHref: string;
}) {
  const [doc, setDoc] = useState<PreviewDoc | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [attempt, setAttempt] = useState(0);
  const closeButton = useRef<HTMLButtonElement>(null);
  const slug = chapter.slug as string;
  const words = DOC_WORDS[kind];

  useEffect(() => {
    let live = true;
    setStatus("loading");
    setDoc(null);
    api
      .get(`/public/docs/${kind}/${encodeURIComponent(slug)}`)
      .then((res) => {
        if (!live) return;
        setDoc((res.data.data.doc as PreviewDoc | null) || null);
        setStatus("ready");
      })
      .catch(() => live && setStatus("error"));
    return () => {
      live = false;
    };
  }, [kind, slug, attempt]);

  // A dialog: the page behind doesn't scroll, Esc closes it. Set up once, whatever the parent re-renders.
  const close = useRef(onClose);
  close.current = onClose;
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close.current();
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    closeButton.current?.focus();
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, []);

  // The first chapter is free and a signed-in reader has every chapter: straight to the document.
  const open = chapter.isFree || !anonymous;
  const fullHref = open ? publicDocPath(kind, slug) : gate(publicDocPath(kind, slug));
  const fullLabel = open ? `Read the full ${words}` : `Read the full ${words} with a free account`;
  const kinds = docKindsOf(chapter);

  return (
    <div className="fixed inset-0 z-[1000] flex items-end justify-center bg-black/75 sm:items-center sm:p-6" onClick={onClose}>
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="chapter-preview-title"
        className="flex h-[100dvh] w-full max-w-3xl flex-col overflow-hidden bg-surface sm:h-[88vh] sm:rounded-2xl sm:border sm:border-card-border"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex shrink-0 items-start gap-3 border-b border-card-border px-4 py-3">
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-bold text-text-muted">
              {className} {subject.name} · Preview
            </p>
            <h2 id="chapter-preview-title" className="truncate text-base font-black text-heading">
              {chapter.name}
            </h2>
          </div>
          <button ref={closeButton} type="button" onClick={onClose} aria-label="Close preview" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-card-border text-heading hover:bg-card">
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </header>

        {kinds.length > 1 && (
          <div className="flex shrink-0 gap-2 overflow-x-auto border-b border-card-border px-4 py-2" role="tablist" aria-label="Chapter documents">
            {kinds.map((k) => (
              <button
                key={k}
                type="button"
                role="tab"
                aria-selected={k === kind}
                onClick={() => onKind(k)}
                className={cn(
                  "inline-flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-black transition-colors",
                  k === kind ? "bg-accent text-primary-dark" : "border border-card-border bg-card text-heading hover:border-accent/50"
                )}
              >
                <FileText className="h-3.5 w-3.5" aria-hidden="true" />
                {PUBLIC_DOC_LABELS[k].title}
              </button>
            ))}
          </div>
        )}

        <div className="min-h-0 flex-1 overflow-y-auto bg-slate-100">
          {status === "loading" && (
            <div className="flex h-full flex-col items-center justify-center gap-3 px-6 text-center" aria-busy="true">
              <Loader2 className="h-7 w-7 animate-spin text-slate-500" aria-hidden="true" />
              <p className="text-sm font-bold text-slate-700">Opening the {words}…</p>
            </div>
          )}
          {status === "error" && (
            <div className="flex h-full flex-col items-center justify-center gap-3 px-6 text-center">
              <p className="text-sm font-bold text-slate-700">Couldn&apos;t open this right now.</p>
              <button type="button" onClick={() => setAttempt((n) => n + 1)} className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-black text-white">
                <RefreshCw className="h-4 w-4" aria-hidden="true" />
                Try again
              </button>
            </div>
          )}
          {status === "ready" && doc?.htmlContent && (
            <>
              {/* Only the first part: the rest of the document waits on its own page. The notes' own
                  list of contents is left out here, so the preview reaches the real pages sooner. */}
              <style dangerouslySetInnerHTML={{ __html: ".vl-doc-preview .notes-html-viewer .map{display:none !important}" }} />
              <div className="vl-doc-preview relative max-h-[2800px] overflow-hidden">
                <DocHtml html={doc.htmlContent} css={doc.cssContent} lazyImages className="py-2 sm:py-4" />
                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-slate-100 to-transparent" aria-hidden="true" />
              </div>
              <div className="px-5 pb-8 pt-2 text-center">
                <p className="text-sm font-black text-slate-800">That&apos;s the start of this chapter&apos;s {words}.</p>
                <p className="mt-1 text-xs text-slate-600">The full document continues on its own page.</p>
              </div>
            </>
          )}
          {status === "ready" && doc && !doc.htmlContent && (
            <div className="flex h-full flex-col items-center justify-center gap-2 px-6 text-center">
              <BookOpen className="h-8 w-8 text-slate-500" aria-hidden="true" />
              <p className="text-sm font-bold text-slate-700">This document opens on its own page.</p>
            </div>
          )}
          {status === "ready" && !doc && (
            <div className="flex h-full flex-col items-center justify-center gap-2 px-6 text-center">
              <BookOpen className="h-8 w-8 text-slate-500" aria-hidden="true" />
              <p className="text-sm font-bold text-slate-700">{PUBLIC_DOC_LABELS[kind].title} for this chapter are coming soon.</p>
            </div>
          )}
        </div>

        <footer className="shrink-0 border-t border-card-border bg-primary-dark px-4 py-3" style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Link href={fullHref} className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-sm font-black text-primary-dark transition-colors hover:bg-accent-light">
              {!open && <Lock className="h-4 w-4" aria-hidden="true" />}
              {fullLabel}
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            {chapter.videos > 0 && (
              <Link href={chapterHref} className="inline-flex items-center justify-center gap-2 rounded-lg bg-secondary px-4 py-2.5 text-sm font-black text-white transition-colors hover:bg-secondary-light">
                <Play className="h-4 w-4 fill-current" aria-hidden="true" />
                {plural(chapter.videos, "3D video")}
              </Link>
            )}
          </div>
        </footer>
      </section>
    </div>
  );
}

// Phone-only bar that keeps the way in at hand. Slides away while the plan card or the footer is on
// screen, so it never doubles up with the card or covers the end of the page.
function StartBar({ title, href }: { title: string; href: string }) {
  const [hidden, setHidden] = useState(false);
  useEffect(() => {
    const targets = [document.querySelector("[data-plan-card]"), document.querySelector("footer")].filter(Boolean) as Element[];
    if (targets.length === 0 || typeof IntersectionObserver === "undefined") return;
    const visible = new Set<Element>();
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) visible.add(entry.target);
        else visible.delete(entry.target);
      }
      setHidden(visible.size > 0);
    });
    targets.forEach((t) => observer.observe(t));
    return () => observer.disconnect();
  }, []);

  return (
    <div
      className={cn(
        "fixed inset-x-0 bottom-0 z-40 border-t border-card-border bg-primary-dark/95 px-4 pt-2.5 backdrop-blur transition-transform duration-300 lg:hidden",
        hidden && "pointer-events-none translate-y-full"
      )}
      style={{ paddingBottom: "max(0.625rem, env(safe-area-inset-bottom))" }}
      aria-hidden={hidden}
    >
      <div className="mx-auto flex max-w-xl items-center gap-3">
        <p className="min-w-0 flex-1 text-xs leading-snug text-text-muted">
          <span className="block font-black text-heading">{title}</span>
          Notes of every chapter, free with an account
        </p>
        <Link href={href} tabIndex={hidden ? -1 : undefined} className="shrink-0 rounded-lg bg-accent px-4 py-2 text-sm font-black text-primary-dark">
          Start free
        </Link>
      </div>
    </div>
  );
}

function LoadingState({ number, slow }: { number: string; slow: boolean }) {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6" aria-busy="true">
      <p className="text-xs font-semibold text-text-muted">Class {number}</p>
      <div className="mt-2 h-9 w-2/3 max-w-md animate-pulse rounded-lg bg-card" />
      <div className="mt-6 flex h-[50vh] flex-col items-center justify-center gap-3 rounded-2xl border border-card-border bg-card px-6 text-center">
        <Loader2 className="h-7 w-7 animate-spin text-accent" aria-hidden="true" />
        <p className="text-sm font-bold text-heading">Opening the course…</p>
        {slow && <p className="max-w-xs text-xs leading-5 text-text-muted">Waking up our server. The first open can take up to a minute; after that it&apos;s quick.</p>}
      </div>
    </div>
  );
}

function MissingState() {
  return (
    <div className="mx-auto max-w-xl px-4 py-20 text-center">
      <BookOpen className="mx-auto h-10 w-10 text-text-muted" aria-hidden="true" />
      <h1 className="mt-4 text-2xl font-black text-heading">This class isn&apos;t here yet</h1>
      <p className="mt-2 text-sm leading-6 text-text-muted">You can find every class we teach in our courses.</p>
      <Link href="/courses" className="mt-6 inline-flex items-center gap-2 rounded-lg bg-accent px-5 py-2.5 text-sm font-black text-primary-dark hover:bg-accent-light">
        Browse courses
        <ArrowRight className="h-4 w-4" aria-hidden="true" />
      </Link>
    </div>
  );
}

function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="mx-auto max-w-xl px-4 py-20 text-center">
      <BookOpen className="mx-auto h-10 w-10 text-text-muted" aria-hidden="true" />
      <h1 className="mt-4 text-2xl font-black text-heading">Couldn&apos;t open this right now</h1>
      <p className="mt-2 text-sm leading-6 text-text-muted">Please check your connection and try again.</p>
      <button type="button" onClick={onRetry} className="mt-6 inline-flex items-center gap-2 rounded-lg bg-accent px-5 py-2.5 text-sm font-black text-primary-dark hover:bg-accent-light">
        <RefreshCw className="h-4 w-4" aria-hidden="true" />
        Try again
      </button>
    </div>
  );
}
