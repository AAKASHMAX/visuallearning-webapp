"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, Check, ChevronRight, Clock3, FileText, Loader2, Lock, Play, RefreshCw, Smartphone, Sparkles } from "lucide-react";
import api from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { authLink } from "@/lib/auth-redirect";
import { APP_PUBLISHED, PLAY_STORE_URL } from "@/lib/app-links";
import { PUBLIC_DOC_KINDS, PUBLIC_DOC_LABELS, PublicDocKind, describeSlug, publicDocPath } from "@/lib/public-docs";
import { VimeoThumb } from "@/components/video-thumb";
import { cn } from "@/lib/utils";

type ChapterSummary = { id: string; name: string; order: number; slug: string | null; notes: boolean; ncert: boolean; pyq: boolean; videos: number };

type PublicDocData = {
  kind: PublicDocKind;
  slug: string;
  doc: { id: string; title: string; htmlContent: string | null; cssContent: string | null; pdfUrl: string | null } | null;
  chapter: { id: string; name: string; order: number; slug: string; isFree: boolean };
  subject: { id: string; name: string };
  class: { id: string; name: string };
  available: Record<PublicDocKind, boolean>;
  videos: {
    total: number;
    advanced: number;
    basic: number;
    language: string | null;
    languages: string[];
    items: Array<{ id: string; title: string; level: string; duration: string | null; vimeoId: string | null }>;
  };
  chapters: ChapterSummary[];
};

// Same scoping as the course viewer: keep :root variables global, nest the rest under the viewer.
function scopeCSS(css: string) {
  const rootMatch = css.match(/:root\s*\{([^}]+)\}/);
  const rootVars = rootMatch ? `:root{${rootMatch[1]}}` : "";
  const rest = rootMatch ? css.replace(/:root\s*\{[^}]+\}/, "") : css;
  return `${rootVars}\n.notes-html-viewer{${rest}}`;
}

// Pages fit the screen; an equation wider than a phone scrolls on its own instead of the whole page.
const PAGE_FIT = `.notes-html-viewer .page { width: min(calc(100% - 8px), 220.5mm) !important; max-width: 220.5mm !important; margin-left: auto !important; margin-right: auto !important; }
.notes-html-viewer .katex-display { max-width: 100%; overflow-x: auto; overflow-y: hidden; }`;

const LANGUAGE_LABELS: Record<string, string> = { HINDI: "Hinglish", ENGLISH: "English" };

function loadScript(src: string) {
  return new Promise<void>((resolve, reject) => {
    const s = document.createElement("script");
    s.src = src;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error(`failed: ${src}`));
    document.head.appendChild(s);
  });
}

export function PublicDocPage({ kind, slug }: { kind: PublicDocKind; slug: string }) {
  const [data, setData] = useState<PublicDocData | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "missing" | "error">("loading");
  const [slow, setSlow] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const { isAuthenticated, hydrate } = useAuth();
  const docRef = useRef<HTMLDivElement>(null);
  const label = PUBLIC_DOC_LABELS[kind];

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    let active = true;
    setStatus("loading");
    setSlow(false);
    // The API sleeps when idle; tell the visitor why the first open can take a while.
    const slowTimer = window.setTimeout(() => active && setSlow(true), 5000);
    api
      .get(`/public/docs/${kind}/${encodeURIComponent(slug.toLowerCase())}`)
      .then((res) => {
        if (!active) return;
        const payload = res.data.data as PublicDocData;
        setData(payload);
        setStatus("ready");
        document.title = `${payload.chapter.name}: ${label.title} | VisualLearning`;
      })
      .catch((err) => {
        if (active) setStatus(err?.response?.status === 404 ? "missing" : "error");
      })
      .finally(() => window.clearTimeout(slowTimer));
    return () => {
      active = false;
      window.clearTimeout(slowTimer);
    };
  }, [kind, slug, attempt, label.title]);

  const html = data?.doc?.htmlContent || "";

  // Most documents fit a phone at full size. A few equation-heavy ones have rows that can't wrap;
  // shrink just those until they fit (never below 50%) instead of making readers scroll sideways.
  const fitDoc = useRef<() => void>(() => {});
  useEffect(() => {
    const inner = docRef.current;
    const box = inner?.parentElement;
    if (!html || !inner || !box) return;
    let frame = 0;
    const overflow = () => box.scrollWidth - box.clientWidth;
    const fit = () => {
      inner.style.removeProperty("zoom");
      if (overflow() <= 2) return;
      let zoom = 1;
      // Content reflows at each zoom, so tighten a couple of times.
      for (let i = 0; i < 3 && overflow() > 2 && zoom > 0.5; i += 1) {
        zoom = Math.max(0.5, Math.floor(zoom * (box.clientWidth / box.scrollWidth) * 100) / 100);
        inner.style.setProperty("zoom", String(zoom));
      }
    };
    const schedule = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(fit);
    };
    fitDoc.current = schedule;
    schedule();
    // Math and handwriting fonts arrive after the first paint and widen some rows.
    document.fonts?.ready.then(schedule).catch(() => {});
    document.fonts?.addEventListener?.("loadingdone", schedule);
    const timer = window.setTimeout(schedule, 1500);
    window.addEventListener("resize", schedule);
    window.addEventListener("load", schedule);
    return () => {
      cancelAnimationFrame(frame);
      window.clearTimeout(timer);
      document.fonts?.removeEventListener?.("loadingdone", schedule);
      window.removeEventListener("resize", schedule);
      window.removeEventListener("load", schedule);
      fitDoc.current = () => {};
    };
  }, [html]);

  // KaTeX for documents that still carry raw LaTeX ($...$, \(...\), \[...\]).
  useEffect(() => {
    const container = docRef.current;
    if (!html || !container) return;
    if (!html.includes("$") && !html.includes("\\(") && !html.includes("\\[")) return;
    let cancelled = false;
    (async () => {
      try {
        const w = window as any;
        if (!w.katex) await loadScript("https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.js");
        if (!w.renderMathInElement) await loadScript("https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/contrib/auto-render.min.js");
        if (cancelled) return;
        w.renderMathInElement(container, {
          delimiters: [
            { left: "$$", right: "$$", display: true },
            { left: "$", right: "$", display: false },
            { left: "\\(", right: "\\)", display: false },
            { left: "\\[", right: "\\]", display: true },
          ],
          throwOnError: false,
        });
        fitDoc.current();
      } catch {}
    })();
    return () => {
      cancelled = true;
    };
  }, [html]);

  if (status === "loading") return <LoadingState kind={kind} slug={slug} slow={slow} />;
  if (status === "missing") return <MissingState />;
  if (status === "error" || !data) return <ErrorState onRetry={() => setAttempt((n) => n + 1)} />;

  const anonymous = !isAuthenticated;
  // Anything beyond this one document needs a (free) account: logged-out visitors go to sign-up
  // first and land on the page they picked afterwards.
  const gate = (href: string) => (anonymous ? authLink("/auth/signup", href) : href);
  const chapterPage = `/courses/${data.class.id}/${data.subject.id}/${data.chapter.id}`;
  const subjectPage = `/courses/${data.class.id}/${data.subject.id}`;
  const subjectTitle = `${data.class.name} ${data.subject.name}`;

  return (
    <div>
      <section className="border-b border-card-border bg-gradient-to-b from-primary-dark to-surface">
        <div className="mx-auto max-w-6xl px-4 pb-5 pt-6 sm:px-6">
          <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1 text-xs font-semibold text-text-muted">
            <span>{data.class.name}</span>
            <ChevronRight className="h-3 w-3" aria-hidden="true" />
            <span>{data.subject.name}</span>
            <ChevronRight className="h-3 w-3" aria-hidden="true" />
            <span>Chapter {data.chapter.order}</span>
          </nav>
          <h1 className="mt-2 text-2xl font-black tracking-tight text-heading sm:text-3xl">{data.chapter.name}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <span className="text-sm font-bold text-accent">{label.title}</span>
            {data.doc && anonymous && (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-bold text-emerald-300">
                <Check className="h-3 w-3" aria-hidden="true" />
                Free · no sign-up needed
              </span>
            )}
          </div>

          <div className="-mx-4 mt-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0" role="tablist" aria-label="Chapter documents">
            {PUBLIC_DOC_KINDS.map((k) => {
              const current = k === kind;
              const exists = data.available[k];
              const text = PUBLIC_DOC_LABELS[k].title;
              if (current) {
                return (
                  <span key={k} role="tab" aria-selected="true" className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-accent px-3.5 py-1.5 text-xs font-black text-primary-dark">
                    <FileText className="h-3.5 w-3.5" aria-hidden="true" />
                    {text}
                  </span>
                );
              }
              if (!exists) {
                return (
                  <span key={k} role="tab" aria-selected="false" aria-disabled="true" className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-card-border px-3.5 py-1.5 text-xs font-bold text-text-muted/70">
                    <Clock3 className="h-3.5 w-3.5" aria-hidden="true" />
                    {text} · soon
                  </span>
                );
              }
              // When this page's own document isn't out yet, the chapter's notes stand in for it, free.
              const locked = anonymous && !(k === "notes" && !data.doc);
              return (
                <Link key={k} role="tab" aria-selected="false" href={locked ? gate(publicDocPath(k, data.slug)) : publicDocPath(k, data.slug)} className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-card-border bg-card px-3.5 py-1.5 text-xs font-bold text-heading transition-colors hover:border-accent/50 hover:text-accent">
                  {locked ? <Lock className="h-3.5 w-3.5 text-accent" aria-hidden="true" /> : <FileText className="h-3.5 w-3.5" aria-hidden="true" />}
                  {text}
                  {locked && <span className="font-semibold text-text-muted">· free account</span>}
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <div className="mx-auto flex max-w-6xl flex-col gap-5 px-3 py-5 sm:px-6 lg:flex-row lg:items-start">
        <div className="min-w-0 flex-1">
          {data.doc && (data.doc.htmlContent || data.doc.pdfUrl) ? (
            <article className="overflow-hidden rounded-2xl border border-card-border bg-slate-100 shadow-xl shadow-black/20">
              <div className="flex items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 py-2.5">
                <p className="min-w-0 truncate text-sm font-bold text-slate-800">{data.doc.title}</p>
                <span className="shrink-0 text-[11px] font-bold text-slate-500">VisualLearning</span>
              </div>
              {data.doc.htmlContent ? (
                <div
                  // relative: keeps KaTeX's hidden, absolutely positioned MathML inside this box.
                  className="relative overflow-x-auto py-2 sm:py-4"
                  style={{ userSelect: "none", WebkitUserSelect: "none" } as React.CSSProperties}
                  onContextMenu={(e) => e.preventDefault()}
                  onCopy={(e) => e.preventDefault()}
                >
                  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.css" />
                  {data.doc.cssContent && <style dangerouslySetInnerHTML={{ __html: scopeCSS(data.doc.cssContent) }} />}
                  <style dangerouslySetInnerHTML={{ __html: PAGE_FIT }} />
                  <div ref={docRef} className="notes-html-viewer" style={{ color: "#1f2937" }} dangerouslySetInnerHTML={{ __html: data.doc.htmlContent }} />
                </div>
              ) : (
                <iframe src={`${data.doc.pdfUrl}#toolbar=0&navpanes=0&view=FitH`} title={data.doc.title} className="h-[80vh] w-full border-0 bg-white" />
              )}
            </article>
          ) : (
            <div className="rounded-2xl border border-dashed border-card-border bg-card px-6 py-12 text-center">
              <Clock3 className="mx-auto h-8 w-8 text-accent" aria-hidden="true" />
              <h2 className="mt-3 text-lg font-black text-heading">{label.title} for this chapter are coming soon</h2>
              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-text-muted">We&apos;re preparing them now.</p>
              {data.available.notes && kind !== "notes" && (
                <Link href={publicDocPath("notes", data.slug)} className="mt-5 inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-sm font-black text-primary-dark hover:bg-accent-light">
                  Read the free chapter notes
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              )}
            </div>
          )}
        </div>

        <aside className="flex w-full flex-col gap-4 lg:sticky lg:top-24 lg:w-80 lg:shrink-0">
          {anonymous ? (
            <SignupCard data={data} subjectTitle={subjectTitle} signupHref={authLink("/auth/signup", subjectPage)} loginHref={authLink("/auth/login", publicDocPath(kind, data.slug))} />
          ) : (
            <ContinueCard subjectTitle={subjectTitle} subjectPage={subjectPage} />
          )}
          <VideosTeaser data={data} href={gate(chapterPage)} anonymous={anonymous} />
        </aside>
      </div>

      <ChaptersSection data={data} kind={kind} gate={gate} anonymous={anonymous} subjectTitle={subjectTitle} />

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

      {anonymous && (
        <SignupBar
          title={data.doc ? `Like these ${kind === "notes" ? "notes" : "solutions"}?` : "Don't miss new chapters"}
          href={authLink("/auth/signup", subjectPage)}
        />
      )}
    </div>
  );
}

// Phone-only sign-up bar. Slides away while the sign-up card or the footer is on screen, so it never
// doubles up with the card or covers the end of the page.
function SignupBar({ title, href }: { title: string; href: string }) {
  const [hidden, setHidden] = useState(false);
  useEffect(() => {
    const targets = [document.querySelector("[data-signup-card]"), document.querySelector("footer")].filter(Boolean) as Element[];
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
          More chapters free with an account
        </p>
        <Link href={href} tabIndex={hidden ? -1 : undefined} className="shrink-0 rounded-lg bg-accent px-4 py-2 text-sm font-black text-primary-dark">
          Sign up free
        </Link>
      </div>
    </div>
  );
}

function SignupCard({ data, subjectTitle, signupHref, loginHref }: { data: PublicDocData; subjectTitle: string; signupHref: string; loginHref: string }) {
  const count = (k: PublicDocKind) => data.chapters.filter((c) => c[k]).length;
  const total = data.chapters.length;
  const notes = count("notes");
  const perks = [
    notes === total ? `Notes for all ${total} chapters` : notes > 1 ? `Notes for ${notes} chapters, more on the way` : "New chapter notes as they're released",
    count("ncert") > 0 && `NCERT solutions for ${count("ncert")} chapter${count("ncert") === 1 ? "" : "s"}`,
    count("pyq") > 0 && `Solved PYQs for ${count("pyq")} chapter${count("pyq") === 1 ? "" : "s"}`,
    (data.chapters[0]?.videos ?? 0) > 0 && `Free 3D videos for chapter ${data.chapters[0].order}`,
  ].filter(Boolean) as string[];

  return (
    <section data-signup-card className="rounded-2xl border border-accent/30 bg-gradient-to-br from-[#0b2a4a] via-card to-[#2a1660] p-5">
      <p className="text-[11px] font-black uppercase tracking-wider text-accent">Free account</p>
      <h2 className="mt-1 text-lg font-black leading-snug text-heading">Keep going with {subjectTitle}</h2>
      <ul className="mt-3 space-y-2">
        {perks.map((perk) => (
          <li key={perk} className="flex items-start gap-2 text-sm text-text">
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" aria-hidden="true" />
            {perk}
          </li>
        ))}
      </ul>
      <Link href={signupHref} className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-sm font-black text-primary-dark transition-colors hover:bg-accent-light">
        Create free account
        <ArrowRight className="h-4 w-4" aria-hidden="true" />
      </Link>
      <p className="mt-2.5 text-center text-xs text-text-muted">
        Already have one?{" "}
        <Link href={loginHref} className="font-bold text-accent hover:underline">
          Log in
        </Link>
      </p>
    </section>
  );
}

function ContinueCard({ subjectTitle, subjectPage }: { subjectTitle: string; subjectPage: string }) {
  return (
    <section className="rounded-2xl border border-card-border bg-card p-5">
      <h2 className="text-base font-black text-heading">Continue in your course</h2>
      <p className="mt-1 text-sm text-text-muted">Every chapter of {subjectTitle}, with notes, NCERT, PYQs and 3D videos.</p>
      <Link href={subjectPage} className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-sm font-black text-primary-dark transition-colors hover:bg-accent-light">
        Open {subjectTitle}
        <ArrowRight className="h-4 w-4" aria-hidden="true" />
      </Link>
      <Link href="/pricing" className="mt-2 block text-center text-xs font-bold text-accent hover:underline">
        See plans for all 3D videos
      </Link>
    </section>
  );
}

function VideosTeaser({ data, href, anonymous }: { data: PublicDocData; href: string; anonymous: boolean }) {
  const { videos, chapter } = data;
  if (videos.total === 0) return null;
  const language = videos.language ? LANGUAGE_LABELS[videos.language] || videos.language : null;
  const free = chapter.isFree;
  const cta = free ? (anonymous ? "Watch free with an account" : "Watch the 3D videos") : anonymous ? "Sign up to explore the videos" : "See the 3D videos";
  const note = free ? "This chapter's videos are free to watch." : "3D videos come with a plan. The first chapter of every subject is free.";

  return (
    <section className="rounded-2xl border border-card-border bg-card p-4">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-secondary/20 text-secondary-light">
          <Sparkles className="h-5 w-5" aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <h2 className="text-base font-black text-heading">Watch this chapter in 3D</h2>
          <p className="text-xs text-text-muted">
            {videos.total} animated video{videos.total === 1 ? "" : "s"}
            {language && ` · ${language}`}
            {videos.advanced > 0 && " · Advanced"}
          </p>
        </div>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2">
        {videos.items.slice(0, 4).map((video) => (
          <Link key={video.id} href={href} className="group relative block aspect-video overflow-hidden rounded-lg bg-primary-dark">
            {video.vimeoId && <VimeoThumb vimeoId={video.vimeoId} alt="" className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />}
            <span className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" aria-hidden="true" />
            <span className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white" aria-hidden="true">
              {free ? <Play className="ml-0.5 h-3 w-3 fill-current" /> : <Lock className="h-3 w-3" />}
            </span>
            <span className="absolute inset-x-1.5 bottom-1 line-clamp-2 text-left text-[11px] font-bold leading-tight text-white">{video.title}</span>
          </Link>
        ))}
      </div>
      <Link href={href} className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg bg-secondary px-4 py-2.5 text-sm font-black text-white transition-colors hover:bg-secondary-light">
        <Play className="h-4 w-4 fill-current" aria-hidden="true" />
        {cta}
      </Link>
      <p className="mt-2 text-center text-[11px] leading-snug text-text-muted">{note}</p>
    </section>
  );
}

function ChaptersSection({
  data,
  kind,
  gate,
  anonymous,
  subjectTitle,
}: {
  data: PublicDocData;
  kind: PublicDocKind;
  gate: (href: string) => string;
  anonymous: boolean;
  subjectTitle: string;
}) {
  if (data.chapters.length < 2) return null;
  return (
    <section className="mx-auto max-w-6xl px-3 pb-8 pt-2 sm:px-6">
      <h2 className="text-xl font-black text-heading">More from {subjectTitle}</h2>
      <p className="mt-1 text-sm text-text-muted">{anonymous ? "Sign up once, free, to open any chapter." : "Pick a chapter to keep reading."}</p>
      <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
        {data.chapters.map((ch) => {
          const current = ch.id === data.chapter.id;
          // Open the same kind of document as this page when the chapter has it.
          const docKind = ([kind, "notes", "ncert", "pyq"] as PublicDocKind[]).find((k) => ch[k]);
          const href = docKind && ch.slug ? gate(publicDocPath(docKind, ch.slug)) : ch.videos > 0 ? gate(`/courses/${data.class.id}/${data.subject.id}/${ch.id}`) : null;
          const chips = [ch.notes && "Notes", ch.ncert && "NCERT", ch.pyq && "PYQs"].filter(Boolean) as string[];
          const body = (
            <>
              <span className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-sm font-black", current ? "bg-accent text-primary-dark" : "bg-primary-dark text-accent")}>{ch.order}</span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-bold text-heading">{ch.name}</span>
                <span className="mt-1 flex flex-wrap gap-1">
                  {chips.map((chip) => (
                    <span key={chip} className="rounded-md bg-surface-light px-1.5 py-0.5 text-[10px] font-bold text-text">
                      {chip}
                    </span>
                  ))}
                  {ch.videos > 0 && (
                    <span className="inline-flex items-center gap-0.5 rounded-md bg-secondary/20 px-1.5 py-0.5 text-[10px] font-bold text-secondary-light">
                      <Play className="h-2.5 w-2.5 fill-current" aria-hidden="true" />
                      {ch.videos} 3D
                    </span>
                  )}
                  {chips.length === 0 && ch.videos === 0 && <span className="text-[11px] text-text-muted">Coming soon</span>}
                </span>
              </span>
              {current ? (
                <span className="shrink-0 text-[11px] font-black text-accent">Reading</span>
              ) : href ? (
                anonymous ? <Lock className="h-4 w-4 shrink-0 text-text-muted" aria-label="Free account needed" /> : <ChevronRight className="h-4 w-4 shrink-0 text-text-muted" aria-hidden="true" />
              ) : null}
            </>
          );
          const base = "flex items-center gap-3 rounded-xl border px-3 py-2.5";
          if (current) return <div key={ch.id} className={cn(base, "border-accent/50 bg-accent/5")}>{body}</div>;
          if (!href) return <div key={ch.id} className={cn(base, "border-card-border/60 bg-card/50 opacity-70")}>{body}</div>;
          return (
            <Link key={ch.id} href={href} className={cn(base, "border-card-border bg-card transition-colors hover:border-accent/40 hover:bg-card-hover")}>
              {body}
            </Link>
          );
        })}
      </div>
      <div className="mt-5 flex flex-col items-center gap-2 text-center">
        <Link href={anonymous ? "/courses" : `/courses/${data.class.id}/${data.subject.id}`} className="inline-flex items-center gap-2 rounded-lg border border-accent/40 px-4 py-2.5 text-sm font-black text-accent transition-colors hover:bg-accent/10">
          Explore all courses
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>
    </section>
  );
}

function LoadingState({ kind, slug, slow }: { kind: PublicDocKind; slug: string; slow: boolean }) {
  const chapter = describeSlug(slug);
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6" aria-busy="true">
      {chapter && <p className="text-xs font-semibold text-text-muted">{chapter}</p>}
      <div className="mt-2 h-8 w-2/3 max-w-md animate-pulse rounded-lg bg-card" />
      <div className="mt-6 flex h-[60vh] flex-col items-center justify-center gap-3 rounded-2xl border border-card-border bg-card px-6 text-center">
        <Loader2 className="h-7 w-7 animate-spin text-accent" aria-hidden="true" />
        <p className="text-sm font-bold text-heading">Opening your {PUBLIC_DOC_LABELS[kind].title.toLowerCase()}…</p>
        {slow && <p className="max-w-xs text-xs leading-5 text-text-muted">Waking up our server. The first open can take up to a minute; after that it&apos;s quick.</p>}
      </div>
    </div>
  );
}

function MissingState() {
  return (
    <div className="mx-auto max-w-xl px-4 py-20 text-center">
      <FileText className="mx-auto h-10 w-10 text-text-muted" aria-hidden="true" />
      <h1 className="mt-4 text-2xl font-black text-heading">This link doesn&apos;t open a document</h1>
      <p className="mt-2 text-sm leading-6 text-text-muted">It may be mistyped or the chapter has moved. You can find every chapter in our courses.</p>
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
      <FileText className="mx-auto h-10 w-10 text-text-muted" aria-hidden="true" />
      <h1 className="mt-4 text-2xl font-black text-heading">Couldn&apos;t open this right now</h1>
      <p className="mt-2 text-sm leading-6 text-text-muted">Please check your connection and try again.</p>
      <button type="button" onClick={onRetry} className="mt-6 inline-flex items-center gap-2 rounded-lg bg-accent px-5 py-2.5 text-sm font-black text-primary-dark hover:bg-accent-light">
        <RefreshCw className="h-4 w-4" aria-hidden="true" />
        Try again
      </button>
    </div>
  );
}
