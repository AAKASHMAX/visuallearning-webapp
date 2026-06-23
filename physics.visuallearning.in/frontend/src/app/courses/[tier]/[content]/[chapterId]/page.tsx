"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { VideoThumb } from "@/components/video-thumb";
import Link from "next/link";
import {
  ArrowLeft,
  Play,
  Lock,
  Loader2,
  CheckCircle2,
  ChevronRight,
  FileText,
  X,
  ZoomIn,
  ZoomOut,
  Download,
  Maximize2,
  Minimize2,
} from "lucide-react";
import api from "@/lib/api";

interface Video {
  id: string;
  title: string;
  youtubeUrl: string;
  videoType: string;
  language: string;
  isFree: boolean;
  displayOrder: number;
  hasAccess: boolean;
}
interface Note {
  id: string;
  title: string;
  fileUrl: string;
  htmlContent?: string | null;
  cssContent?: string | null;
  isFree: boolean;
  hasAccess: boolean;
}
interface Question {
  id: string;
  question: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctAnswer: string;
  solution: string | null;
}

const CONTENT_LABEL: Record<string, (tier: string) => string> = {
  videos: () => "3D Animated Videos",
  notes: () => "Notes",
  ncert: () => "NCERT Solutions",
  pyq: (t) => (t === "11" ? "Important Questions" : "PYQ Solutions"),
  quiz: () => "Quiz",
};

function vimeoEmbed(url: string): string {
  if (url.includes("vimeo.com")) {
    if (url.includes("player.vimeo.com/video/")) return url;
    const m = url.match(/vimeo\.com\/(\d+)/);
    if (m) return `https://player.vimeo.com/video/${m[1]}?autoplay=1`;
    return url;
  }
  let id = "";
  if (url.includes("youtu.be/")) id = url.split("youtu.be/")[1]?.split("?")[0] || "";
  else if (url.includes("v=")) id = url.split("v=")[1]?.split("&")[0] || "";
  else if (url.includes("/embed/")) id = url.split("/embed/")[1]?.split("?")[0] || "";
  return id ? `https://www.youtube.com/embed/${id}?autoplay=1&rel=0` : url;
}

function noteMatches(content: string, title: string): boolean {
  const t = title.toLowerCase();
  if (content === "ncert") return t.includes("ncert");
  if (content === "pyq") return t.includes("pyq") || t.includes("previous year") || t.includes("important");
  return !["ncert", "pyq", "previous year", "important", "question"].some((k) => t.includes(k));
}

function scopeCSS(css: string): string {
  const rootMatch = css.match(/:root\s*\{([^}]+)\}/);
  const rootVars = rootMatch ? `:root{${rootMatch[1]}}` : "";
  const rest = rootMatch ? css.replace(/:root\s*\{[^}]+\}/, "") : css;
  return `${rootVars}\n.physics-notes-viewer{${rest}}`;
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen bg-primary">
      <Navbar />
      <div className="pt-20 pb-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">{children}</div>
      <Footer />
    </main>
  );
}

export default function ContentViewerPage() {
  const params = useParams();
  const tier = params.tier as string;
  const content = (params.content as string) || "videos";
  const chapterId = params.chapterId as string;
  const label = (CONTENT_LABEL[content] || CONTENT_LABEL.videos)(tier);

  const [chapterName, setChapterName] = useState("");
  const [loading, setLoading] = useState(true);
  const [allVideos, setAllVideos] = useState<Video[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);

  const [language, setLanguage] = useState<"HINDI" | "ENGLISH">("HINDI");
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [activeNoteId, setActiveNoteId] = useState<string>("");
  const [showSubscribe, setShowSubscribe] = useState(false);
  const [quizLocked, setQuizLocked] = useState(false);

  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [showResults, setShowResults] = useState(false);

  const notesRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<HTMLDivElement>(null);
  // Mobile defaults to 50% zoom so desktop-formatted documents fit the screen.
  const [zoom, setZoom] = useState(() => (typeof window !== "undefined" && window.innerWidth < 768 ? 50 : 100));
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const coursesReq = api.get(`/courses/tier/${tier}`);
        let videos: Video[] = [];
        let noteList: Note[] = [];
        let qs: Question[] = [];
        if (content === "videos") {
          const r = await api.get(`/chapters/${chapterId}/videos`);
          videos = Array.isArray(r.data) ? r.data : [];
        } else if (content === "quiz") {
          try {
            const r = await api.get(`/chapters/${chapterId}/questions`);
            qs = Array.isArray(r.data) ? r.data : [];
          } catch (e: any) {
            qs = [];
            if (e?.response?.status === 403 && !cancelled) setQuizLocked(true);
          }
        } else {
          const r = await api.get(`/chapters/${chapterId}/notes`);
          noteList = (Array.isArray(r.data) ? r.data : []).filter((n: Note) => noteMatches(content, n.title));
        }
        const coursesRes = await coursesReq;
        const chapter = (Array.isArray(coursesRes.data) ? coursesRes.data : [])
          .flatMap((c: any) => c.chapters || [])
          .find((c: any) => c.id === chapterId);
        if (cancelled) return;
        setChapterName(chapter?.name || "Chapter");
        setAllVideos(videos);
        setNotes(noteList);
        setQuestions(qs);
        const firstVideo = videos.find((v) => v.language === "HINDI" && v.hasAccess && v.youtubeUrl) || videos.find((v) => v.hasAccess && v.youtubeUrl);
        if (firstVideo) setSelectedVideo(firstVideo);
        const firstNote = noteList.find((n) => n.hasAccess) || noteList[0];
        if (firstNote) setActiveNoteId(firstNote.id);
      } catch {
        if (!cancelled) { setAllVideos([]); setNotes([]); setQuestions([]); setChapterName("Chapter"); }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [tier, content, chapterId]);

  const videos = allVideos.filter((v) => v.language === language);
  const hasHindi = allVideos.some((v) => v.language === "HINDI");
  const hasEnglish = allVideos.some((v) => v.language === "ENGLISH");
  const activeNote = notes.find((n) => n.id === activeNoteId) || null;

  // KaTeX render for HTML notes
  useEffect(() => {
    const html = activeNote?.htmlContent;
    if (!html || !notesRef.current) return;
    if (!html.includes("$") && !html.includes("\\(") && !html.includes("\\[")) return;
    const el = notesRef.current;
    let cancelled = false;
    (async () => {
      if (!(window as any).katex) {
        const s = document.createElement("script");
        s.src = "https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.js";
        document.head.appendChild(s);
        await new Promise<void>((res) => { s.onload = () => res(); });
      }
      if (!(window as any).renderMathInElement) {
        const s = document.createElement("script");
        s.src = "https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/contrib/auto-render.min.js";
        document.head.appendChild(s);
        await new Promise<void>((res) => { s.onload = () => res(); });
      }
      if (cancelled) return;
      try {
        (window as any).renderMathInElement(el, {
          delimiters: [
            { left: "$$", right: "$$", display: true },
            { left: "$", right: "$", display: false },
            { left: "\\(", right: "\\)", display: false },
            { left: "\\[", right: "\\]", display: true },
          ],
          throwOnError: false,
        });
      } catch {}
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

  // Keep fullscreen state in sync with the native API.
  useEffect(() => {
    const onChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  const toggleFullscreen = async () => {
    if (!viewerRef.current) return;
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await viewerRef.current.requestFullscreen();
    } catch {
      setIsFullscreen((v) => !v);
    }
  };

  function downloadNote(note: Note) {
    if (note.fileUrl) {
      window.open(note.fileUrl, "_blank", "noopener");
      return;
    }
    if (!note.htmlContent) return;
    const w = window.open("", "_blank");
    if (!w) return;
    const delims = JSON.stringify([
      { left: "$$", right: "$$", display: true },
      { left: "$", right: "$", display: false },
      { left: "\\(", right: "\\)", display: false },
      { left: "\\[", right: "\\]", display: true },
    ]);
    w.document.write(
      '<!DOCTYPE html><html><head><meta charset="utf-8"><title>' + note.title + '</title>' +
      '<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.css">' +
      '<style>' + (note.cssContent || "") + '</style></head><body>' + note.htmlContent +
      '<script src="https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.js"><\/script>' +
      '<script src="https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/contrib/auto-render.min.js"><\/script>' +
      '<script>window.addEventListener("load",function(){try{renderMathInElement(document.body,{delimiters:' + delims + ',throwOnError:false});}catch(e){}setTimeout(function(){window.print();},700);});<\/script>' +
      '</body></html>'
    );
    w.document.close();
  }

  if (loading) {
    return (
      <Shell>
        <div className="flex flex-col items-center justify-center py-32">
          <Loader2 className="w-10 h-10 text-accent animate-spin mb-3" />
          <p className="text-text-muted text-sm">Loading {label.toLowerCase()}...</p>
        </div>
      </Shell>
    );
  }

  const Empty = ({ icon: Icon, text }: { icon: any; text: string }) => (
    <div className="rounded-2xl border border-border bg-card p-12 text-center">
      <Icon className="w-12 h-12 text-accent/40 mx-auto mb-3" />
      <h3 className="text-lg font-semibold text-text-bright mb-1">Coming Soon</h3>
      <p className="text-text-muted text-sm">{text}</p>
    </div>
  );

  return (
    <Shell>
      {/* Header */}
      <div className="flex items-center gap-3 mb-3">
        <Link href={`/courses/${tier}/${content}`} className="inline-flex items-center gap-1.5 text-text-muted hover:text-accent transition-colors shrink-0">
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm hidden sm:inline">Back</span>
        </Link>
        <div className="flex items-baseline gap-2.5 rounded-xl border border-border bg-gradient-to-r from-accent/10 via-card to-secondary/10 px-3.5 py-1.5 flex-1 min-w-0">
          <p className="text-[10px] text-accent font-semibold uppercase tracking-wider shrink-0">{label} · Class {tier}</p>
          <h1 className="text-sm sm:text-base font-bold text-text-bright truncate">{chapterName}</h1>
        </div>
      </div>

      {/* VIDEOS */}
      {content === "videos" && (
        videos.length === 0 ? <Empty icon={Play} text="Videos for this chapter will be added soon." /> : (
          <div className="flex flex-col lg:flex-row-reverse gap-6">
            <div className="w-full lg:w-[58%] shrink-0">
              <div className="lg:sticky lg:top-24 rounded-2xl border border-accent/20 bg-card overflow-hidden shadow-[0_0_30px_rgba(0,212,255,0.08)]">
                {selectedVideo ? (
                  <>
                    <div className="flex items-center justify-between px-4 py-2.5 border-b border-border bg-surface-light/50">
                      <h3 className="text-text-bright font-semibold text-sm truncate pr-3">{selectedVideo.title}</h3>
                      {(hasHindi || hasEnglish) && (
                        <div className="flex items-center gap-1 shrink-0">
                          <button onClick={() => setLanguage("HINDI")} className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${language === "HINDI" ? "bg-accent text-primary" : "bg-surface-light text-text-muted hover:text-text-bright"}`}>Hinglish</button>
                          <button onClick={() => setLanguage("ENGLISH")} className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${language === "ENGLISH" ? "bg-accent text-primary" : "bg-surface-light text-text-muted hover:text-text-bright"}`}>English</button>
                        </div>
                      )}
                    </div>
                    <div className="relative w-full aspect-video bg-black">
                      <iframe key={selectedVideo.id} src={vimeoEmbed(selectedVideo.youtubeUrl)} className="absolute inset-0 w-full h-full" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
                    </div>
                  </>
                ) : (
                  <div className="relative w-full aspect-video bg-black/50 flex items-center justify-center">
                    <div className="text-center"><Play className="w-12 h-12 text-accent/30 mx-auto mb-2" /><p className="text-text-muted text-sm">Select a video to play</p></div>
                  </div>
                )}
              </div>
            </div>
            <div className="w-full lg:w-[42%] min-w-0 space-y-2 lg:max-h-[72vh] lg:overflow-y-auto lg:pr-1">
              {videos.map((video, idx) => {
                const isActive = selectedVideo?.id === video.id;
                return (
                  <div key={video.id} onClick={() => (video.hasAccess && video.youtubeUrl ? setSelectedVideo(video) : setShowSubscribe(true))}
                    className={`group flex items-center gap-3 rounded-xl border p-2.5 transition-all cursor-pointer ${isActive ? "border-accent/40 bg-accent/5" : "border-border bg-card hover:border-accent/30 hover:bg-card-hover"}`}>
                    <div className="relative w-24 h-14 rounded-lg overflow-hidden bg-surface-light shrink-0 flex items-center justify-center">
                      <Play className="w-6 h-6 text-accent/40" />
                      <VideoThumb url={video.youtubeUrl} alt={video.title} className="absolute inset-0 w-full h-full object-cover" />
                      {(video.isFree || (video.hasAccess && idx === 0)) && <span className="absolute top-1 right-1 px-1 py-0.5 rounded text-[8px] font-bold bg-emerald-500/90 text-white z-10">{video.isFree ? "FREE" : "PREVIEW"}</span>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-xs sm:text-sm font-semibold text-text-bright line-clamp-2">{idx + 1}. {video.title}</h3>
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-accent/10 text-accent">3D Animation</span>
                    </div>
                    {!video.hasAccess && <Lock className="h-4 w-4 text-energy shrink-0" />}
                  </div>
                );
              })}
            </div>
          </div>
        )
      )}

      {/* NOTES / NCERT / PYQ */}
      {(content === "notes" || content === "ncert" || content === "pyq") && (
        notes.length === 0 ? <Empty icon={FileText} text={`${label} for this chapter will be added soon.`} /> : (
          <div className="flex flex-col lg:flex-row gap-6">
            {notes.length > 1 && (
              <div className="w-full lg:w-72 shrink-0 space-y-2">
                {notes.map((n, idx) => (
                  <button key={n.id} onClick={() => (n.hasAccess ? setActiveNoteId(n.id) : setShowSubscribe(true))}
                    className={`w-full flex items-center gap-3 rounded-xl border px-3 py-3 text-left transition-all ${activeNoteId === n.id ? "border-accent/40 bg-accent/5" : "border-border bg-card hover:border-accent/30"}`}>
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-400"><FileText className="h-4 w-4" /></span>
                    <span className="text-sm font-medium text-text-bright truncate">{idx + 1}. {n.title}</span>
                    {!n.hasAccess && <Lock className="ml-auto h-4 w-4 text-energy shrink-0" />}
                  </button>
                ))}
              </div>
            )}
            <div className="min-w-0 flex-1">
              {!activeNote ? (
                <Empty icon={FileText} text="Select a note." />
              ) : !activeNote.hasAccess ? (
                <div className="rounded-2xl border border-border bg-card p-12 text-center">
                  <Lock className="w-10 h-10 text-energy mx-auto mb-3" />
                  <h3 className="text-lg font-semibold text-text-bright mb-1">Subscribe to unlock</h3>
                  <p className="text-text-muted text-sm mb-5">This note is part of the paid plan.</p>
                  <Link href={`/subscription?plan=${tier.toUpperCase()}`}><Button>Subscribe Now</Button></Link>
                </div>
              ) : activeNote.htmlContent ? (
                <div ref={viewerRef} className={isFullscreen ? "fixed inset-0 z-[80] flex flex-col bg-primary p-3" : "relative"}>
                  <div className="mb-2 flex items-center justify-end gap-1.5">
                    <button onClick={() => setZoom((z) => Math.max(50, z - 10))} className="rounded-lg border border-border bg-card p-1.5 text-text-muted transition-colors hover:border-accent/40 hover:text-accent" aria-label="Zoom out"><ZoomOut className="h-4 w-4" /></button>
                    <span className="w-11 text-center text-xs font-semibold text-text-muted">{zoom}%</span>
                    <button onClick={() => setZoom((z) => Math.min(200, z + 10))} className="rounded-lg border border-border bg-card p-1.5 text-text-muted transition-colors hover:border-accent/40 hover:text-accent" aria-label="Zoom in"><ZoomIn className="h-4 w-4" /></button>
                    <div className="mx-1 h-5 w-px bg-border" />
                    <button onClick={() => downloadNote(activeNote)} className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-2.5 py-1.5 text-xs font-semibold text-text-muted transition-colors hover:border-accent/40 hover:text-accent"><Download className="h-3.5 w-3.5" /><span className="hidden sm:inline">PDF</span></button>
                    <button onClick={toggleFullscreen} className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-2.5 py-1.5 text-xs font-semibold text-text-muted transition-colors hover:border-accent/40 hover:text-accent">{isFullscreen ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}<span className="hidden sm:inline">{isFullscreen ? "Exit" : "Fullscreen"}</span></button>
                  </div>
                  <div className={`relative overflow-auto rounded-2xl border border-border bg-slate-100 shadow-sm ${isFullscreen ? "flex-1" : "h-[calc(100vh-170px)] min-h-[420px]"}`}>
                    {/* Constrain the document to A4 width, centered like a paper page. */}
                    <div ref={notesRef} className="physics-notes-viewer mx-auto my-4 box-border max-w-[210mm] rounded-md bg-white px-3 py-5 shadow-[0_2px_12px_rgba(0,0,0,0.10)] sm:px-9 sm:py-8" style={{ zoom: zoom / 100 }} dangerouslySetInnerHTML={{ __html: activeNote.htmlContent }} />
                  </div>
                </div>
              ) : activeNote.fileUrl ? (
                <div className="overflow-hidden rounded-2xl border border-border bg-slate-100">
                  <iframe src={activeNote.fileUrl} title={activeNote.title} className="w-full h-[calc(100vh-170px)] min-h-[420px]" />
                </div>
              ) : (
                <Empty icon={FileText} text="This note has no content yet." />
              )}
            </div>
          </div>
        )
      )}

      {/* QUIZ */}
      {content === "quiz" && (
        quizLocked ? (
          <div className="rounded-2xl border border-border bg-card p-12 text-center">
            <Lock className="w-10 h-10 text-energy mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-text-bright mb-1">Subscribe to unlock</h3>
            <p className="text-text-muted text-sm mb-5">The quiz for this chapter is part of the paid plan.</p>
            <Link href={`/subscription?plan=${tier.toUpperCase()}`}><Button>Subscribe Now</Button></Link>
          </div>
        ) : questions.length === 0 ? <Empty icon={CheckCircle2} text="Quiz questions for this chapter will be added soon." /> : (
          <div className="max-w-3xl">
            <div className="space-y-5">
              {questions.map((q, idx) => (
                <div key={q.id} className="rounded-xl border border-border bg-card p-5">
                  <p className="text-sm font-semibold text-text-bright mb-4">Q{idx + 1}. {q.question}</p>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {(["A", "B", "C", "D"] as const).map((opt) => {
                      const val = q[`option${opt}` as keyof Question] as string;
                      const sel = answers[q.id] === opt;
                      const correct = showResults && q.correctAnswer === opt;
                      const wrong = showResults && sel && q.correctAnswer !== opt;
                      return (
                        <button key={opt} onClick={() => { if (!showResults) setAnswers((p) => ({ ...p, [q.id]: opt })); }}
                          className={`text-left px-4 py-3 rounded-lg border text-sm transition-all ${correct ? "border-emerald-500 bg-emerald-500/10 text-emerald-400" : wrong ? "border-danger bg-danger/10 text-danger" : sel ? "border-accent bg-accent/10 text-accent" : "border-border hover:border-accent/30 text-text-muted hover:text-text-bright"}`}>
                          <span className="font-semibold mr-2">{opt}.</span>{val}
                          {correct && <CheckCircle2 className="w-4 h-4 inline ml-2 text-emerald-400" />}
                        </button>
                      );
                    })}
                  </div>
                  {showResults && q.solution && <div className="mt-3 p-3 rounded-lg bg-surface-light border border-border"><p className="text-xs text-text-muted"><span className="font-semibold text-accent">Solution:</span> {q.solution}</p></div>}
                </div>
              ))}
            </div>
            <div className="flex items-center justify-center gap-4 mt-6">
              {!showResults ? (
                <Button onClick={() => setShowResults(true)}>Submit Quiz<ChevronRight className="w-4 h-4 ml-1" /></Button>
              ) : (
                <>
                  <span className="text-text-bright font-semibold">Score: {questions.filter((q) => answers[q.id] === q.correctAnswer).length} / {questions.length}</span>
                  <Button variant="outline" onClick={() => { setShowResults(false); setAnswers({}); }}>Retry</Button>
                </>
              )}
            </div>
          </div>
        )
      )}

      {/* Subscribe modal */}
      {showSubscribe && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm" role="dialog" aria-modal="true">
          <div className="relative w-full max-w-md rounded-2xl border border-accent/25 bg-card p-6 shadow-[0_24px_90px_rgba(0,0,0,0.5)]">
            <button type="button" onClick={() => setShowSubscribe(false)} className="absolute right-4 top-4 rounded-lg p-2 text-text-muted hover:bg-surface-light hover:text-text-bright" aria-label="Close"><X className="h-4 w-4" /></button>
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-energy/10 text-energy"><Lock className="h-6 w-6" /></div>
            <h2 className="mb-3 pr-8 text-xl font-black text-text-bright">Subscribe to unlock</h2>
            <p className="mb-6 text-sm leading-relaxed text-text-muted">The first chapter is free to preview. Subscribe to unlock all videos, notes, and quizzes.</p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link href={`/subscription?plan=${tier.toUpperCase()}`} className="flex-1"><Button className="w-full">Subscribe Now<ChevronRight className="ml-1 h-4 w-4" /></Button></Link>
              <Button variant="outline" className="flex-1" onClick={() => setShowSubscribe(false)}>Close</Button>
            </div>
          </div>
        </div>
      )}
    </Shell>
  );
}
