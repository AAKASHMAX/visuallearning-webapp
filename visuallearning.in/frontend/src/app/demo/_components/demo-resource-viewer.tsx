"use client";

import { useEffect, useRef, useState } from "react";
import { CheckCircle2, FileText, Loader2, Maximize2, Minimize2, X } from "lucide-react";
import api from "@/lib/api";
import { cn } from "@/lib/utils";

/**
 * Renders real Chapter 1 (Class 12 Physics — "Electric Charges and Fields")
 * content on the public demo pages, by kind. Ch1 is the free first chapter,
 * so the public API returns its content without login.
 */
const DEMO_CHAPTER_ID = "cmmos51yc0001uuz8ecig0bew"; // production chapter id

export type DemoKind = "notes" | "ncert" | "pyq" | "ppt" | "quiz";

type NoteDoc = {
  id: string;
  title: string;
  pdfUrl?: string | null;
  htmlContent?: string | null;
  cssContent?: string | null;
};

type QuizQuestion = {
  id: string;
  questionText: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctOption: string;
  solution?: string | null;
};

function scopeCSS(css: string): string {
  const rootMatch = css.match(/:root\s*\{([^}]+)\}/);
  const rootVars = rootMatch ? `:root{${rootMatch[1]}}` : "";
  const rest = rootMatch ? css.replace(/:root\s*\{[^}]+\}/, "") : css;
  return `${rootVars}\n.demo-notes-viewer{${rest}}`;
}

function pdfViewerUrl(url: string) {
  const sep = url.includes("#") ? "&" : "#";
  return `${url}${sep}toolbar=0&navpanes=0&pagemode=none&view=Fit`;
}

function hasTerm(title: string, term: string) {
  return title.toLowerCase().includes(term);
}

function pickNote(notes: NoteDoc[], kind: DemoKind): NoteDoc | null {
  if (kind === "ncert") return notes.find((n) => hasTerm(n.title, "ncert")) || null;
  if (kind === "pyq") return notes.find((n) => hasTerm(n.title, "pyq") || hasTerm(n.title, "previous year")) || null;
  if (kind === "ppt") return notes.find((n) => hasTerm(n.title, "ppt") || hasTerm(n.title, "presentation")) || null;
  // Main notes: exclude the specialised note types.
  const excluded = ["ppt", "presentation", "pyq", "previous year", "important", "ncert", "question"];
  return notes.find((n) => !excluded.some((t) => hasTerm(n.title, t))) || null;
}

function StateBox({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-[60vh] flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-gray-200 bg-white text-text-muted">
      {children}
    </div>
  );
}

export function DemoResourceViewer({ kind }: { kind: DemoKind }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [doc, setDoc] = useState<NoteDoc | null>(null);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Mobile renders desktop-formatted notes at 50% so they fit the screen.
  const [docZoom] = useState(() => (typeof window !== "undefined" && window.innerWidth < 768 ? 0.5 : 1));

  // Fullscreen state
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Quiz state
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      setError(false);
      try {
        if (kind === "quiz") {
          const res = await api.get(`/courses/chapters/${DEMO_CHAPTER_ID}/questions`);
          const data = res.data.data || {};
          const qs = (data.questions || data || []) as QuizQuestion[];
          if (mounted) setQuestions(qs);
        } else {
          const res = await api.get(`/courses/chapters/${DEMO_CHAPTER_ID}/notes`);
          const notes = (res.data.data?.notes || []) as NoteDoc[];
          if (mounted) setDoc(pickNote(notes, kind));
        }
      } catch {
        if (mounted) setError(true);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, [kind]);

  // Keep state in sync with the native Fullscreen API.
  useEffect(() => {
    const onChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  const toggleFullscreen = async () => {
    if (!wrapperRef.current) return;
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await wrapperRef.current.requestFullscreen();
    } catch {
      // Fallback for browsers that block the Fullscreen API.
      setIsFullscreen((v) => !v);
    }
  };

  // KaTeX auto-render for HTML docs with raw LaTeX.
  useEffect(() => {
    const html = doc?.htmlContent;
    if (!html || !containerRef.current) return;
    if (!html.includes("$") && !html.includes("\\(") && !html.includes("\\[")) return;
    const container = containerRef.current;
    let cancelled = false;

    async function renderMath() {
      if (!(window as any).katex) {
        const s = document.createElement("script");
        s.src = "https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.js";
        document.head.appendChild(s);
        await new Promise<void>((resolve) => { s.onload = () => resolve(); });
      }
      if (!(window as any).renderMathInElement) {
        const s = document.createElement("script");
        s.src = "https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/contrib/auto-render.min.js";
        document.head.appendChild(s);
        await new Promise<void>((resolve) => { s.onload = () => resolve(); });
      }
      if (cancelled) return;
      try {
        (window as any).renderMathInElement(container, {
          delimiters: [
            { left: "$$", right: "$$", display: true },
            { left: "$", right: "$", display: false },
            { left: "\\(", right: "\\)", display: false },
            { left: "\\[", right: "\\]", display: true },
          ],
          throwOnError: false,
        });
      } catch {}
    }
    renderMath();
    return () => { cancelled = true; };
  }, [doc?.htmlContent, isFullscreen]);

  if (loading) {
    return (
      <StateBox>
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <p className="text-sm font-medium">Loading demo content…</p>
      </StateBox>
    );
  }

  if (error) {
    return (
      <StateBox>
        <FileText className="h-7 w-7 opacity-30" />
        <p className="text-sm font-medium">Couldn&apos;t load the demo right now. Please try again.</p>
      </StateBox>
    );
  }

  // Heights adapt when the viewer is expanded to fullscreen.
  const docHeight = isFullscreen ? "h-[calc(100vh-72px)]" : "h-[80vh]";

  let content: React.ReactNode;

  if (kind === "quiz") {
    if (questions.length === 0) {
      return (
        <StateBox>
          <FileText className="h-7 w-7 opacity-30" />
          <p className="text-sm font-medium">No quiz questions available.</p>
        </StateBox>
      );
    }
    const score = questions.filter((q) => answers[q.id] === q.correctOption).length;
    content = (
      <div className="space-y-4">
        {questions.map((q, idx) => (
          <div key={q.id} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <p className="mb-4 text-sm font-bold text-heading">Q{idx + 1}. {q.questionText}</p>
            <div className="grid grid-cols-1 gap-2">
              {(["A", "B", "C", "D"] as const).map((opt) => {
                const value = q[`option${opt}` as keyof QuizQuestion] as string;
                const selected = answers[q.id] === opt;
                const correct = showResults && q.correctOption === opt;
                const wrong = showResults && selected && q.correctOption !== opt;
                return (
                  <button
                    key={opt}
                    disabled={showResults}
                    onClick={() => setAnswers((prev) => ({ ...prev, [q.id]: opt }))}
                    className={`flex items-center justify-between rounded-lg border px-4 py-3 text-left text-sm transition-all ${
                      correct
                        ? "border-emerald-500 bg-emerald-50 font-bold text-emerald-700"
                        : wrong
                        ? "border-red-500 bg-red-50 text-red-600"
                        : selected
                        ? "border-primary bg-primary/5 font-bold text-primary"
                        : "border-gray-200 text-text-muted hover:border-primary/40 hover:bg-gray-50"
                    }`}
                  >
                    <span><span className="mr-2 opacity-50">{opt}.</span>{value}</span>
                    {correct && <CheckCircle2 className="h-4 w-4 text-emerald-600" />}
                    {wrong && <X className="h-4 w-4 text-red-500" />}
                  </button>
                );
              })}
            </div>
            {showResults && q.solution && (
              <div className="mt-3 rounded-lg border border-blue-200 bg-blue-50 p-3">
                <p className="text-xs text-blue-800"><span className="font-bold">Solution:</span> {q.solution}</p>
              </div>
            )}
          </div>
        ))}
        <div className="sticky bottom-0 flex items-center justify-between gap-3 rounded-xl border border-gray-200 bg-white/95 p-4 shadow-sm backdrop-blur">
          {showResults ? (
            <>
              <span className="text-base font-black text-heading">Score: {score} / {questions.length}</span>
              <button
                onClick={() => { setShowResults(false); setAnswers({}); }}
                className="rounded-lg bg-primary px-5 py-2.5 text-sm font-bold text-white hover:bg-primary-dark"
              >
                Retry
              </button>
            </>
          ) : (
            <>
              <span className="text-xs font-medium text-text-muted">{Object.keys(answers).length} / {questions.length} answered</span>
              <button
                onClick={() => setShowResults(true)}
                className="rounded-lg bg-primary px-5 py-2.5 text-sm font-bold text-white hover:bg-primary-dark"
              >
                Submit Quiz
              </button>
            </>
          )}
        </div>
      </div>
    );
  } else if (!doc) {
    return (
      <StateBox>
        <FileText className="h-7 w-7 opacity-30" />
        <p className="text-sm font-medium">Demo content is being prepared.</p>
      </StateBox>
    );
  } else if (doc.pdfUrl && doc.pdfUrl !== "pending" && !doc.htmlContent) {
    // PDF-based (PPT or any note without HTML).
    content = (
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-slate-100 shadow-sm">
        <iframe src={pdfViewerUrl(doc.pdfUrl)} title={doc.title} className={cn("w-full", docHeight)} />
      </div>
    );
  } else {
    // HTML-based notes / NCERT / PYQ.
    content = (
      <div className={cn("relative overflow-auto rounded-2xl border border-gray-200 bg-slate-100 shadow-sm", docHeight)}>
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.css" />
        {doc.cssContent && <style dangerouslySetInnerHTML={{ __html: scopeCSS(doc.cssContent) }} />}
        <div ref={containerRef} className="demo-notes-viewer" style={{ zoom: docZoom }} dangerouslySetInnerHTML={{ __html: doc.htmlContent || "" }} />
      </div>
    );
  }

  return (
    <div
      ref={wrapperRef}
      className={cn("relative", isFullscreen && "fixed inset-0 z-[80] flex flex-col overflow-auto bg-white p-4 sm:p-6")}
    >
      <div className="mb-3 flex items-center justify-end">
        <button
          onClick={toggleFullscreen}
          className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-bold text-heading transition-all hover:border-primary/40 hover:text-primary"
        >
          {isFullscreen ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
          {isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
        </button>
      </div>
      <div className={cn(isFullscreen && "min-h-0 flex-1")}>{content}</div>
    </div>
  );
}
