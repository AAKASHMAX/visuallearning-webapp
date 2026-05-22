"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Brain,
  CheckCircle2,
  ChevronRight,
  Clock3,
  ClipboardList,
  Download,
  FileQuestion,
  FileText,
  Lock,
  Maximize2,
  Minimize2,
  Minus,
  Plus,
  Presentation,
  RotateCcw,
  X,
} from "lucide-react";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { PageLoader } from "@/components/ui/loading";
import { cn } from "@/lib/utils";
import type { Question } from "@/types";

type ResourceKind = "notes" | "quiz" | "question-bank" | "ppts" | "test-series";

type ViewerDocument = {
  id: string;
  title: string;
  pdfUrl: string | null;
  htmlContent?: string | null;
  cssContent?: string | null;
  locked?: boolean;
  meta?: string;
};

type ChapterInfo = {
  chapterName: string;
  subjectName: string;
  className: string;
};

const resourceMeta: Record<ResourceKind, { title: string; eyebrow: string; description: string; icon: any; accent: string }> = {
  notes: {
    title: "Notes Viewer",
    eyebrow: "Study Material",
    description: "Read chapter notes in a focused viewer with zoom controls and smooth scrolling.",
    icon: FileText,
    accent: "from-emerald-500 to-lime-400",
  },
  quiz: {
    title: "Quiz Viewer",
    eyebrow: "Practice",
    description: "Attempt chapter questions in a dedicated quiz page without opening the video lesson screen.",
    icon: Brain,
    accent: "from-violet-500 to-fuchsia-400",
  },
  "question-bank": {
    title: "NCERT Questions and Solutions",
    eyebrow: "Questions",
    description: "Review chapter questions and solutions in a clean scrollable viewer.",
    icon: FileQuestion,
    accent: "from-amber-500 to-orange-400",
  },
  ppts: {
    title: "PPT Viewer",
    eyebrow: "Slides",
    description: "Open presentation files in a dedicated viewer when PPT or slide PDFs are uploaded.",
    icon: Presentation,
    accent: "from-indigo-500 to-blue-400",
  },
  "test-series": {
    title: "Test Series Viewer",
    eyebrow: "Assessment",
    description: "Open available test papers in a focused viewer with zoom and scroll controls.",
    icon: ClipboardList,
    accent: "from-rose-500 to-orange-400",
  },
};

const comingSoonResourceKinds = new Set<ResourceKind>(["ppts", "test-series"]);

function normalizeResourceKind(value?: string | string[]): ResourceKind {
  const raw = Array.isArray(value) ? value[0] : value;
  if (raw === "quiz" || raw === "question-bank" || raw === "ppts" || raw === "test-series") return raw;
  return "notes";
}

function safeDecode(value?: string | string[] | null) {
  const raw = Array.isArray(value) ? value[0] : value;
  if (!raw) return "";
  try {
    return decodeURIComponent(raw);
  } catch {
    return raw;
  }
}

function scopeCSS(css: string): string {
  // Extract :root variables so they remain global, scope everything else under .notes-html-viewer
  const rootMatch = css.match(/:root\s*\{([^}]+)\}/);
  const rootVars = rootMatch ? `:root{${rootMatch[1]}}` : "";
  const rest = rootMatch ? css.replace(/:root\s*\{[^}]+\}/, "") : css;
  return `${rootVars}\n.notes-html-viewer{${rest}}`;
}

function hasSignal(document: ViewerDocument, terms: string[]) {
  const text = `${document.title} ${document.pdfUrl || ""}`.toLowerCase();
  return terms.some((term) => text.includes(term));
}

function filterDocuments(kind: ResourceKind, documents: ViewerDocument[]) {
  if (kind === "ppts") {
    return documents.filter((doc) => hasSignal(doc, ["ppt", "pptx", "presentation", "slide"]));
  }

  if (kind === "question-bank") {
    return documents.filter((doc) => hasSignal(doc, ["question", "important", "bank", "worksheet"]));
  }

  if (kind === "notes") {
    const cleanNotes = documents.filter(
      (doc) => !hasSignal(doc, ["ppt", "pptx", "presentation", "slide", "question bank", "important question", "test paper"])
    );
    return cleanNotes.length > 0 ? cleanNotes : documents;
  }

  return documents;
}

function normalizeOption(value: string) {
  return (value || "").replace(/^option/i, "").trim().toUpperCase();
}

function pdfViewerUrl(url: string) {
  const separator = url.includes("#") ? "&" : "#";
  return `${url}${separator}toolbar=0&navpanes=0&pagemode=none&scrollbar=1&view=Fit`;
}

export function ResourceViewerPage({
  classId,
  subjectId,
  chapterId,
  type,
  returnTo,
}: {
  classId: string;
  subjectId: string;
  chapterId: string;
  type?: string | string[];
  returnTo?: string | string[] | null;
}) {
  const kind = normalizeResourceKind(type);
  const meta = resourceMeta[kind];
  const isComingSoonResource = comingSoonResourceKinds.has(kind);
  const [loading, setLoading] = useState(true);
  const [chapterInfo, setChapterInfo] = useState<ChapterInfo>({ chapterName: "Chapter", subjectName: "Subject", className: "Class" });
  const [documents, setDocuments] = useState<ViewerDocument[]>([]);
  const [activeDocumentId, setActiveDocumentId] = useState("");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [locked, setLocked] = useState(false);
  const [canDownload, setCanDownload] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [zoom, setZoom] = useState(1);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [showResults, setShowResults] = useState(false);
  const [showQuestionAnswers, setShowQuestionAnswers] = useState(false);

  const backHref = safeDecode(returnTo) || `/courses/${classId}/${subjectId}`;
  const activeDocument = useMemo(
    () => documents.find((doc) => doc.id === activeDocumentId) || documents[0] || null,
    [activeDocumentId, documents]
  );
  const heroTitle = activeDocument?.title || meta.title;
  const heroDescription = activeDocument
    ? `${meta.title} - ${activeDocument.meta || "PDF Viewer"}`
    : meta.description;

  useEffect(() => {
    let mounted = true;

    async function loadViewer() {
      setLoading(true);
      setLoadError("");
      setDocuments([]);
      setActiveDocumentId("");
      setQuestions([]);
      setLocked(false);
      setSelectedAnswers({});
      setShowResults(false);
      setShowQuestionAnswers(false);

      try {
        const subjectRes = await api.get(`/courses/subjects/${subjectId}/chapters`);
        const subjectData = subjectRes.data.data;
        const currentChapter = (subjectData.chapters || []).find((chapter: any) => chapter.id === chapterId);

        if (!mounted) return;
        setChapterInfo({
          chapterName: currentChapter?.name || "Chapter",
          subjectName: subjectData.subject?.name || "Subject",
          className: subjectData.subject?.class?.name || "Class",
        });

        if (isComingSoonResource) {
          return;
        }

        if (kind === "quiz") {
          const quizRes = await api.get(`/courses/chapters/${chapterId}/questions`);
          const quizData = quizRes.data.data || {};
          if (!mounted) return;
          setQuestions((quizData.questions || quizData || []) as Question[]);
          setLocked(Boolean(quizData.locked));
          return;
        }

        if (kind === "question-bank") {
          const [notesRes, questionsRes] = await Promise.all([
            api.get(`/courses/chapters/${chapterId}/notes`),
            api.get(`/courses/chapters/${chapterId}/questions`),
          ]);
          const noteDocuments = ((notesRes.data.data?.notes || []) as any[]).map((note) => ({
            id: note.id,
            title: note.title,
            pdfUrl: note.pdfUrl || null,
            htmlContent: note.htmlContent || null,
            cssContent: note.cssContent || null,
            locked: Boolean(note.locked),
            meta: note.htmlContent ? "HTML Questions" : "Question PDF",
          }));
          const questionBankDocuments = filterDocuments(kind, noteDocuments);
          const questionData = questionsRes.data.data || {};

          if (!mounted) return;
          setDocuments(questionBankDocuments);
          setActiveDocumentId(questionBankDocuments[0]?.id || "");
          setQuestions((questionData.questions || questionData || []) as Question[]);
          setLocked(Boolean(questionData.locked) && questionBankDocuments.length === 0);
          return;
        }

        if (kind === "test-series") {
          const papersRes = await api.get(`/courses/subjects/${subjectId}/board-papers`);
          const groupedPapers = papersRes.data.data?.papers || {};
          const testDocuments = Object.entries(groupedPapers).flatMap(([year, papers]) =>
            ((papers as any[]) || []).map((paper) => ({
              id: paper.id,
              title: paper.title,
              pdfUrl: paper.pdfUrl === "locked" ? null : paper.pdfUrl || null,
              locked: Boolean(paper.locked),
              meta: `${year} Test Paper`,
            }))
          );

          if (!mounted) return;
          setDocuments(testDocuments);
          setActiveDocumentId(testDocuments[0]?.id || "");
          setLocked(testDocuments.length > 0 && testDocuments.every((doc) => doc.locked));
          return;
        }

        const notesRes = await api.get(`/courses/chapters/${chapterId}/notes`);
        const noteDocuments = ((notesRes.data.data?.notes || []) as any[]).map((note) => ({
          id: note.id,
          title: note.title,
          pdfUrl: note.pdfUrl || null,
          htmlContent: note.htmlContent || null,
          cssContent: note.cssContent || null,
          locked: Boolean(note.locked),
          meta: kind === "ppts" ? "Presentation PDF" : note.htmlContent ? "HTML Notes" : "PDF Notes",
        }));
        const filteredDocuments = filterDocuments(kind, noteDocuments);

        if (!mounted) return;
        setDocuments(filteredDocuments);
        setActiveDocumentId(filteredDocuments[0]?.id || "");
        setCanDownload(Boolean(notesRes.data.data?.canDownload));
        setLocked(Boolean(notesRes.data.data?.hasAccess === false) && filteredDocuments.length > 0);
      } catch (error) {
        if (!mounted) return;
        setLoadError("Unable to load this resource right now.");
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadViewer();

    return () => {
      mounted = false;
    };
  }, [chapterId, isComingSoonResource, kind, subjectId]);

  if (loading) return <PageLoader />;

  const Icon = meta.icon;

  const isDocumentViewer = !isComingSoonResource && !loadError && kind !== "quiz" && !(kind === "question-bank" && documents.length === 0);

  return (
    <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
      <div className="mb-4 flex items-center gap-3">
        <Link href={backHref} className="inline-flex items-center gap-2 text-sm font-bold text-text-muted hover:text-primary">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>
        {isDocumentViewer && activeDocument && (
          <>
            <span className="text-gray-300">|</span>
            <h1 className="min-w-0 truncate text-sm font-black text-heading">{heroTitle}</h1>
          </>
        )}
      </div>

      {!isDocumentViewer && (
        <div className="mb-6 rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-start gap-4">
              <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ${meta.accent} text-white shadow-lg shadow-gray-200`}>
                <Icon className="h-7 w-7" />
              </div>
              <div>
                <p className="text-xs font-black uppercase tracking-wider text-primary">{meta.eyebrow}</p>
                <h1 className="mt-1 text-2xl font-black text-heading sm:text-3xl">{heroTitle}</h1>
                <p className="mt-2 text-sm leading-6 text-text-muted">{heroDescription}</p>
              </div>
            </div>
            <ZoomControls zoom={zoom} setZoom={setZoom} />
          </div>
        </div>
      )}

      {isComingSoonResource ? (
        <ComingSoonResourcePanel meta={meta} />
      ) : loadError ? (
        <EmptyPanel title="Could not load resource" message={loadError} icon={Icon} />
      ) : kind === "quiz" ? (
        <QuestionViewer
          kind="quiz"
          questions={questions}
          locked={locked}
          zoom={zoom}
          selectedAnswers={selectedAnswers}
          setSelectedAnswers={setSelectedAnswers}
          showResults={showResults}
          setShowResults={setShowResults}
        />
      ) : kind === "question-bank" && documents.length === 0 ? (
        <QuestionViewer
          kind="question-bank"
          questions={questions}
          locked={locked}
          zoom={zoom}
          showQuestionAnswers={showQuestionAnswers}
          setShowQuestionAnswers={setShowQuestionAnswers}
        />
      ) : (
        <DocumentViewer
          kind={kind}
          documents={documents}
          activeDocument={activeDocument}
          activeDocumentId={activeDocumentId}
          setActiveDocumentId={setActiveDocumentId}
          zoom={zoom}
          setZoom={setZoom}
          locked={locked}
          canDownload={canDownload}
        />
      )}
    </div>
  );
}

function ComingSoonResourcePanel({
  meta,
}: {
  meta: { title: string; icon: any; accent: string };
}) {
  const Icon = meta.icon;

  return (
    <div className="rounded-lg border border-amber-200 bg-amber-50/70 p-10 text-center shadow-sm">
      <div className={`mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-lg bg-gradient-to-br ${meta.accent} text-white shadow-lg shadow-amber-200`}>
        <Icon className="h-8 w-8" />
      </div>
      <div className="mx-auto mb-4 inline-flex items-center gap-2 rounded-full border border-amber-200 bg-white px-3 py-1 text-xs font-black uppercase tracking-wider text-amber-700">
        <Clock3 className="h-4 w-4" />
        Coming soon
      </div>
      <h2 className="text-xl font-black text-heading">{meta.title.replace(" Viewer", "")} is coming soon</h2>
      <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-text-muted">
        This resource is visible in every course now and will become available here when the content is ready.
      </p>
    </div>
  );
}

function ZoomControls({
  zoom,
  setZoom,
}: {
  zoom: number;
  setZoom: React.Dispatch<React.SetStateAction<number>>;
}) {
  return (
    <div className="flex shrink-0 items-center gap-2 rounded-lg border border-gray-200 bg-surface p-1">
      <button
        type="button"
        onClick={() => setZoom((value) => Math.max(0.75, Number((value - 0.1).toFixed(2))))}
        className="flex h-9 w-9 items-center justify-center rounded-md text-heading hover:bg-white"
        aria-label="Zoom out"
      >
        <Minus className="h-4 w-4" />
      </button>
      <span className="min-w-14 text-center text-xs font-black text-heading">{Math.round(zoom * 100)}%</span>
      <button
        type="button"
        onClick={() => setZoom((value) => Math.min(1.6, Number((value + 0.1).toFixed(2))))}
        className="flex h-9 w-9 items-center justify-center rounded-md text-heading hover:bg-white"
        aria-label="Zoom in"
      >
        <Plus className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={() => setZoom(1)}
        className="flex h-9 w-9 items-center justify-center rounded-md text-heading hover:bg-white"
        aria-label="Reset zoom"
      >
        <RotateCcw className="h-4 w-4" />
      </button>
    </div>
  );
}

function DocumentViewer({
  kind,
  documents,
  activeDocument,
  activeDocumentId,
  setActiveDocumentId,
  zoom,
  setZoom,
  locked,
  canDownload,
}: {
  kind: ResourceKind;
  documents: ViewerDocument[];
  activeDocument: ViewerDocument | null;
  activeDocumentId: string;
  setActiveDocumentId: (id: string) => void;
  zoom: number;
  setZoom: React.Dispatch<React.SetStateAction<number>>;
  locked: boolean;
  canDownload: boolean;
}) {
  const viewerRef = useRef<HTMLElement | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const emptyCopy = kind === "ppts"
    ? "No PPT or slide PDF has been added for this chapter yet."
    : kind === "test-series"
      ? "No test paper has been added for this subject yet."
      : "No PDF has been added for this chapter yet.";

  const notesContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(document.fullscreenElement === viewerRef.current);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  // Load KaTeX auto-render for notes with raw LaTeX ($...$, $$...$$)
  useEffect(() => {
    const html = activeDocument?.htmlContent;
    if (!html || !notesContainerRef.current) return;
    // Only run if raw LaTeX delimiters are present
    if (!html.includes('$') && !html.includes('\\(') && !html.includes('\\[')) return;

    const container = notesContainerRef.current;
    let cancelled = false;

    async function renderMath() {
      // Load KaTeX + auto-render if not already loaded
      if (!(window as any).katex) {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.js';
        document.head.appendChild(script);
        await new Promise<void>((resolve) => { script.onload = () => resolve(); });
      }
      if (!(window as any).renderMathInElement) {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/contrib/auto-render.min.js';
        document.head.appendChild(script);
        await new Promise<void>((resolve) => { script.onload = () => resolve(); });
      }
      if (cancelled) return;
      try {
        (window as any).renderMathInElement(container, {
          delimiters: [
            { left: '$$', right: '$$', display: true },
            { left: '$', right: '$', display: false },
            { left: '\\(', right: '\\)', display: false },
            { left: '\\[', right: '\\]', display: true },
          ],
          throwOnError: false,
        });
      } catch {}
    }
    renderMath();
    return () => { cancelled = true; };
  }, [activeDocument?.htmlContent, isFullscreen]);

  const toggleFullscreen = async () => {
    if (!viewerRef.current) return;

    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      } else {
        await viewerRef.current.requestFullscreen();
      }
    } catch {
      setIsFullscreen((value) => !value);
    }
  };

  if (documents.length === 0) {
    return <EmptyPanel title="No files available" message={emptyCopy} icon={resourceMeta[kind].icon} />;
  }

  return (
    <section
      ref={viewerRef}
      className={cn(
        "min-w-0 rounded-lg border border-gray-200 bg-white shadow-sm",
        isFullscreen && "fixed inset-0 z-[80] overflow-hidden rounded-none border-0"
      )}
    >
      {documents.length > 1 && (
        <div className="border-b border-gray-100 p-4">
          <p className="mb-3 text-xs font-black uppercase tracking-wider text-text-light">Available files</p>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {documents.map((document, index) => (
              <button
                key={document.id}
                type="button"
                onClick={() => setActiveDocumentId(document.id)}
                className={cn(
                  "flex shrink-0 items-center gap-2 rounded-lg border px-3 py-2 text-left text-xs font-black transition-all",
                  activeDocumentId === document.id
                    ? "border-primary bg-primary-light text-heading"
                    : "border-gray-200 bg-white text-text-muted hover:border-primary/30 hover:text-heading"
                )}
              >
                {document.locked ? <Lock className="h-4 w-4 text-amber-600" /> : <FileText className="h-4 w-4 text-emerald-600" />}
                <span className="max-w-56 truncate">{index + 1}. {document.title}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      <div>
        {locked || activeDocument?.locked || (!activeDocument?.pdfUrl && !activeDocument?.htmlContent) ? (
          activeDocument?.locked || locked ? (
            <LockedPanel />
          ) : (
            <EmptyPanel title="File link missing" message="This item is listed, but no viewer link has been attached yet." icon={FileText} compact />
          )
        ) : (
          <>
            <div className="flex items-center justify-between gap-2 border-b border-gray-100 bg-white px-4 py-2">
              <p className="min-w-0 truncate text-sm font-black text-heading">
                {activeDocument.title}
              </p>
              <div className="flex shrink-0 items-center gap-2">
                <ZoomControls zoom={zoom} setZoom={setZoom} />
                {activeDocument.pdfUrl && activeDocument.pdfUrl !== "pending" && (
                  canDownload ? (
                    <a
                      href={activeDocument.pdfUrl}
                      download
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex shrink-0 items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-black text-emerald-700 hover:bg-emerald-100"
                    >
                      <Download className="h-4 w-4" />
                      <span className="hidden sm:inline">Download PDF</span>
                    </a>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setShowDownloadModal(true)}
                      className="inline-flex shrink-0 items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-xs font-black text-gray-500 hover:bg-gray-100"
                    >
                      <Download className="h-4 w-4" />
                      <span className="hidden sm:inline">Download PDF</span>
                    </button>
                  )
                )}
                <button
                  type="button"
                  onClick={toggleFullscreen}
                  className="inline-flex shrink-0 items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-xs font-black text-heading hover:border-primary/30 hover:text-primary"
                >
                  {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                  <span className="hidden sm:inline">{isFullscreen ? "Exit" : "Full screen"}</span>
                </button>
              </div>
            </div>
            {activeDocument.htmlContent ? (
              <div
                className={cn(
                  "relative overflow-auto bg-slate-100",
                  isFullscreen ? "h-[calc(100vh-64px)]" : "h-[76vh]"
                )}
                style={{ userSelect: "none", WebkitUserSelect: "none" } as React.CSSProperties}
                onContextMenu={(e) => e.preventDefault()}
              >
                <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.css" />
                {activeDocument.cssContent && (
                  <style dangerouslySetInnerHTML={{ __html: scopeCSS(activeDocument.cssContent) }} />
                )}
                <style dangerouslySetInnerHTML={{ __html: `.notes-html-viewer .page { width: min(calc(100% - 28px), 220.5mm) !important; max-width: 220.5mm !important; margin-left: auto !important; margin-right: auto !important; }` }} />
                <div
                  ref={notesContainerRef}
                  className="notes-html-viewer"
                  style={{ zoom } as React.CSSProperties}
                  dangerouslySetInnerHTML={{ __html: activeDocument.htmlContent }}
                />
              </div>
            ) : (
              <div
                className={cn(
                  "overflow-auto bg-slate-100 py-4",
                  isFullscreen
                    ? "h-[calc(100vh-64px)] px-4 sm:px-10 lg:px-24"
                    : "h-[76vh] px-4 sm:px-10 lg:px-20 xl:px-28"
                )}
              >
                <div
                  className="mx-auto origin-top overflow-hidden rounded-lg bg-white shadow-sm"
                  style={{
                    transform: `scale(${zoom})`,
                    transformOrigin: "top center",
                    width: `${100 / zoom}%`,
                    maxWidth: `${980 / zoom}px`,
                    height: isFullscreen ? `${100 / zoom}%` : `${80 / zoom}vh`,
                    minHeight: isFullscreen ? `${720 / zoom}px` : `${760 / zoom}px`,
                  }}
                >
                  <iframe
                    src={pdfViewerUrl(activeDocument.pdfUrl!)}
                    title={activeDocument.title}
                    className="h-full w-full border-0"
                  />
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {showDownloadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setShowDownloadModal(false)}>
          <div className="mx-4 w-full max-w-sm rounded-xl bg-white p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-amber-50 text-amber-600 mx-auto">
              <Lock className="h-7 w-7" />
            </div>
            <h3 className="text-center text-lg font-black text-heading">Subscribe to Download</h3>
            <p className="mt-2 text-center text-sm leading-6 text-text-muted">
              PDF downloads are available for subscribed users. Subscribe to a plan to download notes.
            </p>
            <div className="mt-5 flex gap-3">
              <button
                type="button"
                onClick={() => setShowDownloadModal(false)}
                className="flex-1 rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-black text-heading hover:bg-gray-50"
              >
                Cancel
              </button>
              <Link
                href="/subscription"
                className="flex-1 rounded-lg bg-heading px-4 py-2.5 text-center text-sm font-black text-white hover:bg-primary"
              >
                View Plans
              </Link>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

function QuestionViewer({
  kind,
  questions,
  locked,
  zoom,
  selectedAnswers,
  setSelectedAnswers,
  showResults,
  setShowResults,
  showQuestionAnswers,
  setShowQuestionAnswers,
}: {
  kind: "quiz" | "question-bank";
  questions: Question[];
  locked: boolean;
  zoom: number;
  selectedAnswers?: Record<string, string>;
  setSelectedAnswers?: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  showResults?: boolean;
  setShowResults?: React.Dispatch<React.SetStateAction<boolean>>;
  showQuestionAnswers?: boolean;
  setShowQuestionAnswers?: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  if (locked) return <LockedPanel />;

  if (questions.length === 0) {
    return (
      <EmptyPanel
        title={kind === "quiz" ? "No quiz added" : "No question bank added"}
        message="Questions for this chapter will appear here after they are added in admin."
        icon={kind === "quiz" ? Brain : FileQuestion}
      />
    );
  }

  const score = questions.filter((question) => selectedAnswers?.[question.id] === normalizeOption(question.correctOption)).length;

  return (
    <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
      <div className="flex flex-col gap-3 border-b border-gray-100 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-black text-heading">
            {kind === "quiz" ? "Chapter Quiz" : "NCERT Questions and Solutions"}
          </h2>
          <p className="text-sm text-text-muted">{questions.length} questions available</p>
        </div>
        {kind === "question-bank" ? (
          <Button type="button" variant="outline" size="sm" onClick={() => setShowQuestionAnswers?.((value) => !value)}>
            {showQuestionAnswers ? "Hide Answers" : "Show Answers"}
          </Button>
        ) : showResults ? (
          <div className="rounded-lg bg-emerald-50 px-4 py-2 text-sm font-black text-emerald-700">
            Score: {score} / {questions.length}
          </div>
        ) : null}
      </div>

      <div className="h-[72vh] overflow-auto bg-slate-50 p-4">
        <div className="space-y-4" style={{ zoom } as React.CSSProperties}>
          {questions.map((question, index) => (
            <div key={question.id} className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
              <p className="mb-4 text-sm font-black leading-6 text-heading">
                Q{index + 1}. {question.questionText}
              </p>
              <div className="grid gap-2">
                {(["A", "B", "C", "D"] as const).map((option) => {
                  const optionKey = `option${option}` as keyof Question;
                  const selected = selectedAnswers?.[question.id] === option;
                  const correct = normalizeOption(question.correctOption) === option;
                  const reveal = kind === "question-bank" ? showQuestionAnswers : showResults;
                  const wrong = Boolean(reveal && selected && !correct);

                  return (
                    <button
                      key={option}
                      type="button"
                      disabled={kind === "question-bank" || Boolean(showResults)}
                      onClick={() => setSelectedAnswers?.((answers) => ({ ...answers, [question.id]: option }))}
                      className={cn(
                        "flex items-center justify-between gap-3 rounded-lg border px-4 py-3 text-left text-sm transition-all",
                        reveal && correct
                          ? "border-emerald-400 bg-emerald-50 text-emerald-700"
                          : wrong
                            ? "border-red-400 bg-red-50 text-red-600"
                            : selected
                              ? "border-accent bg-accent/5 text-accent"
                              : "border-gray-200 bg-white text-heading hover:border-accent/40"
                      )}
                    >
                      <span>
                        <span className="mr-2 font-black">{option}.</span>
                        {String(question[optionKey] || "")}
                      </span>
                      {reveal && correct && <CheckCircle2 className="h-4 w-4 shrink-0" />}
                      {wrong && <X className="h-4 w-4 shrink-0" />}
                    </button>
                  );
                })}
              </div>
              {(kind === "question-bank" ? showQuestionAnswers : showResults) && question.solution && (
                <div className="mt-4 rounded-lg border border-blue-100 bg-blue-50 p-3 text-sm leading-6 text-blue-800">
                  <span className="font-black">Solution:</span> {question.solution}
                </div>
              )}
            </div>
          ))}

          {kind === "quiz" && (
            <div className="sticky bottom-0 rounded-lg border border-gray-200 bg-white/95 p-4 shadow-lg backdrop-blur">
              {!showResults ? (
                <Button type="button" className="w-full font-black" onClick={() => setShowResults?.(true)}>
                  Submit Quiz
                </Button>
              ) : (
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm font-black text-heading">Score: {score} / {questions.length}</p>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowResults?.(false);
                      setSelectedAnswers?.({});
                    }}
                  >
                    Retry
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function LockedPanel() {
  return (
    <div className="flex min-h-[420px] items-center justify-center p-6">
      <div className="max-w-sm text-center">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-amber-50 text-amber-600">
          <Lock className="h-8 w-8" />
        </div>
        <h2 className="text-xl font-black text-heading">Subscribe the plan to access this resource</h2>
        <p className="mt-3 text-sm leading-6 text-text-muted">
          The first chapter stays open for preview. Subscribe to unlock the full course resources.
        </p>
        <Link
          href="/subscription"
          className="mt-6 inline-flex items-center gap-2 rounded-lg bg-heading px-5 py-3 text-sm font-black text-white hover:bg-primary"
        >
          View Plans
          <ChevronRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}

function EmptyPanel({
  title,
  message,
  icon: Icon,
  compact,
}: {
  title: string;
  message: string;
  icon: any;
  compact?: boolean;
}) {
  return (
    <div className={cn("rounded-lg border border-dashed border-gray-200 bg-white p-10 text-center shadow-sm", compact && "m-4 shadow-none")}>
      <Icon className="mx-auto mb-4 h-10 w-10 text-primary/40" />
      <h2 className="text-lg font-black text-heading">{title}</h2>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-text-muted">{message}</p>
    </div>
  );
}
