"use client";

import { useEffect, useRef, useState } from "react";
import { Play, Loader2, CheckCircle2, ChevronRight, FileText, ZoomIn, ZoomOut, Download, Maximize2, Minimize2 } from "lucide-react";
import api from "@/lib/api";

/** Class 12 Ch1 "Electric Charges and Fields" (physics prod) — free, public demo content. */
const DEMO_CHAPTER_ID = "cmpxnxlno0065uuo8j9ketsm8";

export type DemoKind = "videos" | "notes" | "ncert" | "pyq" | "quiz";

interface Video { id: string; title: string; youtubeUrl: string; language: string; isFree: boolean; hasAccess: boolean; chapter?: string }

// Curated sample of real 3D animated lessons (Hindi) — same list as the main webapp demo.
const DEMO_VIDEOS: Video[] = [
  { title: "Gauss's Theorem", chapter: "Electric Charges and Fields", vimeoId: "1182958272" },
  { title: "Electric Potential", chapter: "Electrostatic Potential and Capacitance", vimeoId: "1183254112" },
  { title: "Kirchhoff's Rules", chapter: "Current Electricity", vimeoId: "1183254625" },
  { title: "Photoelectric Effect", chapter: "Dual Nature of Radiation and Matter", vimeoId: "1183623574" },
  { title: "Bernoulli's Theorem", chapter: "Mechanical Properties of Fluids", vimeoId: "1186852505" },
  { title: "Rutherford's Model of Atom", chapter: "Atoms", vimeoId: "1183623647" },
  { title: "Wave Front & Huygens' Principle", chapter: "Wave Optics", vimeoId: "1183623397" },
  { title: "Young's Double Slit Experiment & Fringe Width", chapter: "Wave Optics", vimeoId: "1183623426" },
].map((v) => ({ id: v.vimeoId, title: v.title, youtubeUrl: `https://vimeo.com/${v.vimeoId}`, language: "HINDI", isFree: true, hasAccess: true, chapter: v.chapter }));
interface Note { id: string; title: string; fileUrl: string; htmlContent?: string | null; cssContent?: string | null; hasAccess: boolean }
interface Question { id: string; question: string; optionA: string; optionB: string; optionC: string; optionD: string; correctAnswer: string; solution: string | null }

function vimeoEmbed(url: string): string {
  if (url.includes("vimeo.com")) {
    if (url.includes("player.vimeo.com/video/")) return url;
    const m = url.match(/vimeo\.com\/(\d+)/);
    return m ? `https://player.vimeo.com/video/${m[1]}?autoplay=1` : url;
  }
  let id = "";
  if (url.includes("youtu.be/")) id = url.split("youtu.be/")[1]?.split("?")[0] || "";
  else if (url.includes("v=")) id = url.split("v=")[1]?.split("&")[0] || "";
  return id ? `https://www.youtube.com/embed/${id}?autoplay=1&rel=0` : url;
}
function noteMatches(kind: string, title: string): boolean {
  const t = title.toLowerCase();
  if (kind === "ncert") return t.includes("ncert");
  if (kind === "pyq") return t.includes("pyq") || t.includes("previous year") || t.includes("important");
  return !["ncert", "pyq", "previous year", "important", "question"].some((k) => t.includes(k));
}
function scopeCSS(css: string): string {
  const m = css.match(/:root\s*\{([^}]+)\}/);
  const root = m ? `:root{${m[1]}}` : "";
  const rest = m ? css.replace(/:root\s*\{[^}]+\}/, "") : css;
  return `${root}\n.physics-notes-viewer{${rest}}`;
}

function StateBox({ icon: Icon, text }: { icon: any; text: string }) {
  return (
    <div className="flex h-[60vh] flex-col items-center justify-center gap-3 rounded-2xl border border-border bg-card text-text-muted">
      <Icon className="h-8 w-8 text-accent/40" />
      <p className="text-sm">{text}</p>
    </div>
  );
}

export function DemoResourceViewer({ kind }: { kind: DemoKind }) {
  const [loading, setLoading] = useState(true);
  const [videos, setVideos] = useState<Video[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [language, setLanguage] = useState<"HINDI" | "ENGLISH">("HINDI");
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [activeNoteId, setActiveNoteId] = useState("");
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [showResults, setShowResults] = useState(false);
  const [zoom, setZoom] = useState(100);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const notesRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        if (kind === "videos") {
          // Curated demo playlist (same as the main webapp) — no fetch.
          if (!cancelled) { setVideos(DEMO_VIDEOS); setSelectedVideo(DEMO_VIDEOS[0] || null); }
        } else if (kind === "quiz") {
          const r = await api.get(`/chapters/${DEMO_CHAPTER_ID}/questions`);
          if (!cancelled) setQuestions(Array.isArray(r.data) ? r.data : []);
        } else {
          const r = await api.get(`/chapters/${DEMO_CHAPTER_ID}/notes`);
          const ns: Note[] = (Array.isArray(r.data) ? r.data : []).filter((n: Note) => noteMatches(kind, n.title));
          if (!cancelled) { setNotes(ns); setActiveNoteId(ns[0]?.id || ""); }
        }
      } catch { /* ignore */ } finally { if (!cancelled) setLoading(false); }
    })();
    return () => { cancelled = true; };
  }, [kind]);

  const langVideos = videos.filter((v) => v.language === language);
  const hasHindi = videos.some((v) => v.language === "HINDI");
  const hasEnglish = videos.some((v) => v.language === "ENGLISH");
  const activeNote = notes.find((n) => n.id === activeNoteId) || null;

  useEffect(() => {
    const html = activeNote?.htmlContent;
    if (!html || !notesRef.current) return;
    if (!html.includes("$") && !html.includes("\\(") && !html.includes("\\[")) return;
    const el = notesRef.current; let cancelled = false;
    (async () => {
      if (!(window as any).katex) { const s = document.createElement("script"); s.src = "https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.js"; document.head.appendChild(s); await new Promise<void>((r) => { s.onload = () => r(); }); }
      if (!(window as any).renderMathInElement) { const s = document.createElement("script"); s.src = "https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/contrib/auto-render.min.js"; document.head.appendChild(s); await new Promise<void>((r) => { s.onload = () => r(); }); }
      if (cancelled) return;
      try { (window as any).renderMathInElement(el, { delimiters: [{ left: "$$", right: "$$", display: true }, { left: "$", right: "$", display: false }, { left: "\\(", right: "\\)", display: false }, { left: "\\[", right: "\\]", display: true }], throwOnError: false }); } catch {}
    })();
    return () => { cancelled = true; };
  }, [activeNote?.htmlContent, isFullscreen, zoom]);

  // Inject the note's scoped CSS (and KaTeX CSS) into <head>. A <style> nested
  // inside the viewer stops applying once the element enters the native
  // fullscreen top layer (and stays broken after exit until a refresh), so we
  // keep the note's stylesheet global where it always applies.
  useEffect(() => {
    if (!document.getElementById("katex-css")) {
      const link = document.createElement("link");
      link.id = "katex-css";
      link.rel = "stylesheet";
      link.href = "https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.css";
      document.head.appendChild(link);
    }
  }, []);

  useEffect(() => {
    if (!activeNote?.cssContent) return;
    const el = document.createElement("style");
    el.setAttribute("data-physics-note-css", "");
    el.textContent = scopeCSS(activeNote.cssContent);
    document.head.appendChild(el);
    return () => { el.remove(); };
  }, [activeNote?.cssContent]);

  useEffect(() => {
    const onChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  const toggleFullscreen = async () => {
    if (!viewerRef.current) return;
    try { if (document.fullscreenElement) await document.exitFullscreen(); else await viewerRef.current.requestFullscreen(); } catch { setIsFullscreen((v) => !v); }
  };
  function downloadNote(note: Note) {
    if (note.fileUrl) { window.open(note.fileUrl, "_blank", "noopener"); return; }
    if (!note.htmlContent) return;
    const w = window.open("", "_blank"); if (!w) return;
    const delims = JSON.stringify([{ left: "$$", right: "$$", display: true }, { left: "$", right: "$", display: false }, { left: "\\(", right: "\\)", display: false }, { left: "\\[", right: "\\]", display: true }]);
    w.document.write('<!DOCTYPE html><html><head><meta charset="utf-8"><title>' + note.title + '</title><link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.css"><style>' + (note.cssContent || "") + '</style></head><body>' + note.htmlContent + '<script src="https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.js"><\/script><script src="https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/contrib/auto-render.min.js"><\/script><script>window.addEventListener("load",function(){try{renderMathInElement(document.body,{delimiters:' + delims + ',throwOnError:false});}catch(e){}setTimeout(function(){window.print();},700);});<\/script></body></html>');
    w.document.close();
  }

  if (loading) return <div className="flex h-[60vh] flex-col items-center justify-center gap-3 rounded-2xl border border-border bg-card text-text-muted"><Loader2 className="h-8 w-8 animate-spin text-accent" /><p className="text-sm">Loading demo...</p></div>;

  if (kind === "videos") {
    if (langVideos.length === 0) return <StateBox icon={Play} text="No demo videos available." />;
    return (
      <div className="flex flex-col lg:flex-row-reverse gap-6">
        <div className="w-full lg:w-[58%] shrink-0">
          <div className="lg:sticky lg:top-24 rounded-2xl border border-accent/20 bg-card overflow-hidden">
            {selectedVideo && (
              <>
                <div className="flex items-center justify-between px-4 py-2.5 border-b border-border bg-surface-light/50">
                  <h3 className="text-text-bright font-semibold text-sm truncate pr-3">{selectedVideo.title}</h3>
                  {hasHindi && hasEnglish && (
                    <div className="flex items-center gap-1 shrink-0">
                      <button onClick={() => setLanguage("HINDI")} className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${language === "HINDI" ? "bg-accent text-primary" : "bg-surface-light text-text-muted"}`}>हिंदी</button>
                      <button onClick={() => setLanguage("ENGLISH")} className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${language === "ENGLISH" ? "bg-accent text-primary" : "bg-surface-light text-text-muted"}`}>English</button>
                    </div>
                  )}
                </div>
                <div className="relative w-full aspect-video bg-black">
                  <iframe key={selectedVideo.id} src={vimeoEmbed(selectedVideo.youtubeUrl)} className="absolute inset-0 w-full h-full" allow="autoplay; fullscreen; picture-in-picture; encrypted-media" allowFullScreen />
                </div>
              </>
            )}
          </div>
        </div>
        <div className="w-full lg:w-[42%] min-w-0 space-y-2 lg:max-h-[72vh] lg:overflow-y-auto lg:pr-1">
          {langVideos.map((video, idx) => (
            <div key={video.id} onClick={() => setSelectedVideo(video)} className={`group flex items-center gap-3 rounded-xl border p-2.5 cursor-pointer transition-all ${selectedVideo?.id === video.id ? "border-accent/40 bg-accent/5" : "border-border bg-card hover:border-accent/30 hover:bg-card-hover"}`}>
              <div className="relative w-24 h-14 rounded-lg overflow-hidden bg-surface-light shrink-0 flex items-center justify-center"><Play className="w-6 h-6 text-accent/40" /></div>
              <div className="flex-1 min-w-0"><h3 className="text-xs sm:text-sm font-semibold text-text-bright line-clamp-2">{idx + 1}. {video.title}</h3>{video.chapter && <p className="mt-0.5 truncate text-[11px] text-text-muted">{video.chapter}</p>}</div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (kind === "quiz") {
    if (questions.length === 0) return <StateBox icon={CheckCircle2} text="No quiz questions available." />;
    return (
      <div className="max-w-3xl">
        <div className="space-y-5">
          {questions.map((q, idx) => (
            <div key={q.id} className="rounded-xl border border-border bg-card p-5">
              <p className="text-sm font-semibold text-text-bright mb-4">Q{idx + 1}. {q.question}</p>
              <div className="grid sm:grid-cols-2 gap-3">
                {(["A", "B", "C", "D"] as const).map((opt) => {
                  const val = q[`option${opt}` as keyof Question] as string;
                  const sel = answers[q.id] === opt; const correct = showResults && q.correctAnswer === opt; const wrong = showResults && sel && q.correctAnswer !== opt;
                  return (
                    <button key={opt} onClick={() => { if (!showResults) setAnswers((p) => ({ ...p, [q.id]: opt })); }} className={`text-left px-4 py-3 rounded-lg border text-sm transition-all ${correct ? "border-emerald-500 bg-emerald-500/10 text-emerald-400" : wrong ? "border-danger bg-danger/10 text-danger" : sel ? "border-accent bg-accent/10 text-accent" : "border-border hover:border-accent/30 text-text-muted hover:text-text-bright"}`}>
                      <span className="font-semibold mr-2">{opt}.</span>{val}{correct && <CheckCircle2 className="w-4 h-4 inline ml-2 text-emerald-400" />}
                    </button>
                  );
                })}
              </div>
              {showResults && q.solution && <div className="mt-3 p-3 rounded-lg bg-surface-light border border-border"><p className="text-xs text-text-muted"><span className="font-semibold text-accent">Solution:</span> {q.solution}</p></div>}
            </div>
          ))}
        </div>
        <div className="flex items-center justify-center gap-4 mt-6">
          {!showResults ? <Button onClick={() => setShowResults(true)}>Submit Quiz<ChevronRight className="w-4 h-4 ml-1" /></Button> : (<><span className="text-text-bright font-semibold">Score: {questions.filter((q) => answers[q.id] === q.correctAnswer).length} / {questions.length}</span><Button variant="outline" onClick={() => { setShowResults(false); setAnswers({}); }}>Retry</Button></>)}
        </div>
      </div>
    );
  }

  // notes / ncert / pyq
  if (notes.length === 0) return <StateBox icon={FileText} text="Demo content is being prepared." />;
  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {notes.length > 1 && (
        <div className="w-full lg:w-72 shrink-0 space-y-2">
          {notes.map((n, idx) => (
            <button key={n.id} onClick={() => setActiveNoteId(n.id)} className={`w-full flex items-center gap-3 rounded-xl border px-3 py-3 text-left transition-all ${activeNoteId === n.id ? "border-accent/40 bg-accent/5" : "border-border bg-card hover:border-accent/30"}`}>
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-400"><FileText className="h-4 w-4" /></span>
              <span className="text-sm font-medium text-text-bright truncate">{idx + 1}. {n.title}</span>
            </button>
          ))}
        </div>
      )}
      <div className="min-w-0 flex-1">
        {!activeNote ? <StateBox icon={FileText} text="Select a note." /> : activeNote.htmlContent ? (
          <div ref={viewerRef} className={isFullscreen ? "fixed inset-0 z-[80] flex flex-col bg-primary p-3" : "relative"}>
            <div className="mb-2 flex items-center justify-end gap-1.5">
              <button onClick={() => setZoom((z) => Math.max(50, z - 10))} className="rounded-lg border border-border bg-card p-1.5 text-text-muted hover:border-accent/40 hover:text-accent" aria-label="Zoom out"><ZoomOut className="h-4 w-4" /></button>
              <span className="w-11 text-center text-xs font-semibold text-text-muted">{zoom}%</span>
              <button onClick={() => setZoom((z) => Math.min(200, z + 10))} className="rounded-lg border border-border bg-card p-1.5 text-text-muted hover:border-accent/40 hover:text-accent" aria-label="Zoom in"><ZoomIn className="h-4 w-4" /></button>
              <div className="mx-1 h-5 w-px bg-border" />
              <button onClick={() => downloadNote(activeNote)} className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-2.5 py-1.5 text-xs font-semibold text-text-muted hover:border-accent/40 hover:text-accent"><Download className="h-3.5 w-3.5" /><span className="hidden sm:inline">PDF</span></button>
              <button onClick={toggleFullscreen} className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-2.5 py-1.5 text-xs font-semibold text-text-muted hover:border-accent/40 hover:text-accent">{isFullscreen ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}<span className="hidden sm:inline">{isFullscreen ? "Exit" : "Fullscreen"}</span></button>
            </div>
            <div className={`relative overflow-auto rounded-2xl border border-border bg-slate-100 shadow-sm ${isFullscreen ? "flex-1" : "h-[78vh]"}`}>
              <div ref={notesRef} className="physics-notes-viewer" style={{ zoom: zoom / 100 }} dangerouslySetInnerHTML={{ __html: activeNote.htmlContent }} />
            </div>
          </div>
        ) : <StateBox icon={FileText} text="This note has no content yet." />}
      </div>
    </div>
  );
}

function Button({ children, onClick, variant }: { children: React.ReactNode; onClick?: () => void; variant?: "outline" }) {
  return (
    <button onClick={onClick} className={`inline-flex items-center justify-center rounded-lg px-5 py-2.5 text-sm font-semibold transition-all ${variant === "outline" ? "border border-border bg-card text-text-bright hover:border-accent/40" : "bg-accent text-primary hover:bg-accent/90"}`}>
      {children}
    </button>
  );
}
