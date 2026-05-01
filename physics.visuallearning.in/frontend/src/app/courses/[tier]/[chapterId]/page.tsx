"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  ArrowLeft,
  Play,
  FileText,
  HelpCircle,
  Lock,
  ChevronRight,
  Download,
  CheckCircle2,
  X,
} from "lucide-react";
import api from "@/lib/api";
import { useAuth } from "@/lib/auth";

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

type Tab = "videos" | "notes" | "quiz";

function getYoutubeThumbnail(url: string, vimeoCache?: Record<string, string>): string {
  // Check Vimeo cache
  if (url.includes("vimeo.com")) {
    const match = url.match(/vimeo\.com\/(\d+)/);
    if (match && vimeoCache?.[match[1]]) return vimeoCache[match[1]];
    return "";
  }
  let videoId = "";
  try {
    if (url.includes("youtu.be/")) {
      videoId = url.split("youtu.be/")[1]?.split("?")[0] || "";
    } else if (url.includes("v=")) {
      videoId = url.split("v=")[1]?.split("&")[0] || "";
    } else if (url.includes("/embed/")) {
      videoId = url.split("/embed/")[1]?.split("?")[0] || "";
    }
  } catch {}
  if (videoId) return `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
  return "";
}

function getYoutubeEmbedUrl(url: string): string {
  // Handle Vimeo URLs
  if (url.includes("vimeo.com")) {
    let vimeoId = "";
    try {
      // Handle formats: vimeo.com/123, player.vimeo.com/video/123
      if (url.includes("player.vimeo.com/video/")) {
        return url; // Already an embed URL
      }
      const match = url.match(/vimeo\.com\/(\d+)/);
      if (match) vimeoId = match[1];
    } catch {}
    if (vimeoId) return `https://player.vimeo.com/video/${vimeoId}?autoplay=1`;
    return url;
  }

  // Handle YouTube URLs
  let videoId = "";
  try {
    if (url.includes("youtu.be/")) {
      videoId = url.split("youtu.be/")[1]?.split("?")[0] || "";
    } else if (url.includes("v=")) {
      videoId = url.split("v=")[1]?.split("&")[0] || "";
    } else if (url.includes("/embed/")) {
      videoId = url.split("/embed/")[1]?.split("?")[0] || "";
    }
  } catch {}
  if (videoId) return `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`;
  return url;
}

export default function ChapterContentPage() {
  const params = useParams();
  const router = useRouter();
  const tier = params.tier as string;
  const chapterId = params.chapterId as string;
  const { isAuthenticated, hydrate } = useAuth();

  const [chapterName, setChapterName] = useState("");
  const [activeTab, setActiveTab] = useState<Tab>("videos");
  const [allVideos, setAllVideos] = useState<Video[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [language, setLanguage] = useState<"HINDI" | "ENGLISH">("HINDI");

  // Filtered videos by language
  const videos = allVideos.filter((v) => v.language === language);

  // Video player state
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);

  // Quiz state
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [showResults, setShowResults] = useState(false);

  // Vimeo thumbnail cache
  const [vimeoThumbnails, setVimeoThumbnails] = useState<Record<string, string>>({});

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    async function fetchContent() {
      setLoading(true);
      try {
        const [videosRes, notesRes] = await Promise.all([
          api.get(`/chapters/${chapterId}/videos`),
          api.get(`/chapters/${chapterId}/notes`),
        ]);
        setAllVideos(videosRes.data);
        setNotes(notesRes.data);

        // Auto-select the first video in the default language
        const defaultLangVideos = videosRes.data.filter((v: Video) => v.language === language);
        if (defaultLangVideos.length > 0 && defaultLangVideos[0].hasAccess) {
          setSelectedVideo(defaultLangVideos[0]);
        }
      } catch (err) {
        console.error("Failed to fetch content");
      }
      setLoading(false);
    }

    // Fetch chapter info
    async function fetchChapterInfo() {
      try {
        const res = await api.get("/courses");
        for (const course of res.data) {
          try {
            const courseRes = await api.get(`/courses/${course.id}`);
            const chapter = courseRes.data.chapters?.find((ch: any) => ch.id === chapterId);
            if (chapter) {
              setChapterName(chapter.name);
              break;
            }
          } catch {}
        }
      } catch {}
    }

    fetchContent();
    fetchChapterInfo();
  }, [chapterId]);

  // When language changes, auto-select first video of that language
  useEffect(() => {
    const langVideos = allVideos.filter((v) => v.language === language);
    if (langVideos.length > 0 && langVideos[0].hasAccess) {
      setSelectedVideo(langVideos[0]);
    } else {
      setSelectedVideo(null);
    }
  }, [language, allVideos]);

  // Fetch Vimeo thumbnails
  useEffect(() => {
    if (allVideos.length === 0) return;
    const vimeoIds = new Set<string>();
    for (const v of allVideos) {
      if (v.youtubeUrl?.includes("vimeo.com")) {
        const match = v.youtubeUrl.match(/vimeo\.com\/(\d+)/);
        if (match) vimeoIds.add(match[1]);
      }
    }
    if (vimeoIds.size === 0) return;

    const fetchThumbnails = async () => {
      const cache: Record<string, string> = {};
      await Promise.all(
        Array.from(vimeoIds).map(async (id) => {
          try {
            const res = await fetch(`https://vimeo.com/api/oembed.json?url=https://vimeo.com/${id}`);
            if (res.ok) {
              const data = await res.json();
              if (data.thumbnail_url) cache[id] = data.thumbnail_url;
            }
          } catch {}
        })
      );
      setVimeoThumbnails((prev) => ({ ...prev, ...cache }));
    };
    fetchThumbnails();
  }, [allVideos]);

  async function loadQuiz() {
    try {
      const res = await api.get(`/chapters/${chapterId}/questions`);
      setQuestions(res.data);
    } catch {
      setQuestions([]);
    }
  }

  function handleTabChange(tab: Tab) {
    setActiveTab(tab);
    if (tab === "quiz" && questions.length === 0) {
      loadQuiz();
    }
  }

  const hasHindi = allVideos.some((v) => v.language === "HINDI");
  const hasEnglish = allVideos.some((v) => v.language === "ENGLISH");

  const tabs: { key: Tab; label: string; icon: any; count: number }[] = [
    { key: "videos", label: "Videos", icon: Play, count: videos.length },
    { key: "notes", label: "Notes", icon: FileText, count: notes.length },
    { key: "quiz", label: "Quiz", icon: HelpCircle, count: questions.length },
  ];

  return (
    <main className="min-h-screen bg-primary">
      <Navbar />
      <div className="pt-20 pb-4 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back + Chapter Header (compact inline) */}
        <div className="flex items-center gap-4 mb-3">
          <Link
            href={`/courses/${tier}`}
            className="inline-flex items-center gap-1.5 text-text-muted hover:text-accent transition-colors shrink-0"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm hidden sm:inline">Back</span>
          </Link>
          <div className="rounded-xl border border-border bg-gradient-to-r from-accent/10 via-card to-secondary/10 px-4 py-2.5 flex-1 flex items-center justify-between min-w-0">
            <div className="min-w-0">
              <p className="text-[10px] text-accent font-semibold uppercase tracking-wider">
                {tier === "free" ? "Free" : tier === "basic" ? "Basic" : tier === "bridge" ? "Bridge" : "Advance"}
              </p>
              <h1 className="text-base sm:text-lg font-bold text-text-bright truncate">
                {chapterName || "Loading..."}
              </h1>
            </div>
            <div className="hidden sm:flex items-center gap-3 text-xs text-text-muted shrink-0 ml-4">
              <span className="flex items-center gap-1"><Play className="w-3.5 h-3.5 text-accent" />{allVideos.length} Videos</span>
              <span className="flex items-center gap-1"><FileText className="w-3.5 h-3.5 text-emerald-400" />{notes.length} Notes</span>
            </div>
          </div>
        </div>

        {/* Side-by-side: Left=Tabs/Content, Right=Player (desktop) | Player on top (mobile) */}
        <div className="flex flex-col lg:flex-row-reverse gap-6">
          {/* RIGHT: Video Player (sticky on desktop) */}
          <div className="w-full lg:w-[55%] xl:w-[60%] shrink-0">
            <div className="lg:sticky lg:top-24 rounded-2xl border border-accent/20 bg-card overflow-hidden shadow-[0_0_30px_rgba(0,212,255,0.08)]">
              {selectedVideo ? (<>
                <div className="flex items-center justify-between px-4 py-2.5 border-b border-border bg-surface-light/50">
                  <h3 className="text-text-bright font-semibold text-sm sm:text-base truncate pr-3">{selectedVideo.title}</h3>
                  {(hasHindi || hasEnglish) && (<div className="flex items-center gap-1 shrink-0">
                    <button onClick={() => setLanguage("HINDI")} className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${language === "HINDI" ? "bg-accent text-primary shadow-[0_0_10px_rgba(0,212,255,0.3)]" : "bg-surface-light text-text-muted hover:text-text-bright"}`}>हिंदी</button>
                    <button onClick={() => setLanguage("ENGLISH")} className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${language === "ENGLISH" ? "bg-accent text-primary shadow-[0_0_10px_rgba(0,212,255,0.3)]" : "bg-surface-light text-text-muted hover:text-text-bright"}`}>English</button>
                  </div>)}
                </div>
                <div className="relative w-full aspect-video bg-black">
                  <iframe key={selectedVideo.id} src={getYoutubeEmbedUrl(selectedVideo.youtubeUrl)} className="absolute inset-0 w-full h-full" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
                </div>
              </>) : (
                <div className="relative w-full aspect-video bg-black/50 flex items-center justify-center">
                  <div className="text-center"><Play className="w-12 h-12 text-accent/30 mx-auto mb-2" /><p className="text-text-muted text-sm">Select a video to play</p></div>
                </div>
              )}
            </div>
          </div>
          {/* LEFT: Tabs + Content */}
          <div className="w-full lg:w-[45%] xl:w-[40%] min-w-0">
            <div className="border-b border-border mb-4">
              <div className="flex gap-1">{tabs.map((tab) => (
                <button key={tab.key} onClick={() => handleTabChange(tab.key)} className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-all ${activeTab === tab.key ? "border-accent text-accent" : "border-transparent text-text-muted hover:text-text-bright"}`}>
                  <tab.icon className="w-4 h-4" />{tab.label}
                  {tab.count > 0 && <span className={`text-xs px-1.5 py-0.5 rounded-full ${activeTab === tab.key ? "bg-accent/10 text-accent" : "bg-surface-light text-text-muted"}`}>{tab.count}</span>}
                </button>
              ))}</div>
            </div>
            {loading ? (<div className="space-y-3">{[...Array(5)].map((_, i) => (<div key={i} className="rounded-xl border border-border bg-card p-4 h-20 animate-pulse" />))}</div>) : (<>
              {activeTab === "videos" && (
                <div className="space-y-2 lg:max-h-[70vh] lg:overflow-y-auto lg:pr-1">
                  {videos.length === 0 ? (
                    <div className="rounded-2xl border border-border bg-card p-10 text-center"><Play className="w-10 h-10 text-accent/40 mx-auto mb-3" /><h3 className="text-lg font-semibold text-text-bright mb-1">No Videos Yet</h3><p className="text-text-muted text-sm">Videos for this chapter will be added soon.</p></div>
                  ) : (videos.map((video, idx) => {
                    const thumbnail = getYoutubeThumbnail(video.youtubeUrl, vimeoThumbnails);
                    const isActive = selectedVideo?.id === video.id;
                    return (
                      <div key={video.id} onClick={() => video.hasAccess ? setSelectedVideo(video) : null}
                        className={`group flex items-center gap-3 rounded-xl border p-2.5 transition-all duration-300 ${isActive ? "border-accent/40 bg-accent/5" : video.hasAccess ? "border-border bg-card hover:border-accent/30 hover:bg-card-hover cursor-pointer" : "border-border bg-card opacity-70 cursor-not-allowed"}`}>
                        <div className="relative w-28 h-16 sm:w-32 sm:h-[72px] rounded-lg overflow-hidden bg-surface-light shrink-0">
                          {thumbnail ? (<img src={thumbnail} alt={video.title} className="w-full h-full object-cover" />) : (<div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-surface-light to-card-hover"><Play className="w-6 h-6 text-accent/40" /></div>)}
                          {video.hasAccess ? (
                            <div className={`absolute inset-0 flex items-center justify-center bg-black/30 ${isActive ? "opacity-100" : "opacity-0 group-hover:opacity-100"} transition-opacity`}><div className="w-8 h-8 rounded-full bg-accent/90 flex items-center justify-center shadow-[0_0_12px_rgba(0,212,255,0.5)]"><Play className="w-4 h-4 text-white fill-white ml-0.5" /></div></div>
                          ) : (<div className="absolute inset-0 flex items-center justify-center bg-black/50"><Lock className="w-4 h-4 text-white/70" /></div>)}
                          {video.isFree && <span className="absolute top-1 right-1 px-1.5 py-0.5 rounded text-[8px] font-bold bg-emerald-500/90 text-white">FREE</span>}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-xs sm:text-sm font-semibold text-text-bright mb-0.5 line-clamp-2">{idx + 1}. {video.title}</h3>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${video.videoType === "ANIMATED_VIDEO" ? "bg-accent/10 text-accent" : "bg-secondary/10 text-secondary-light"}`}>{video.videoType === "ANIMATED_VIDEO" ? "3D Animation" : "Lecture"}</span>
                        </div>
                      </div>);
                  }))}
                </div>
              )}
              {activeTab === "notes" && (
                <div className="space-y-3">
                  {notes.length === 0 ? (
                    <div className="rounded-2xl border border-border bg-card p-10 text-center"><FileText className="w-10 h-10 text-emerald-400/40 mx-auto mb-3" /><h3 className="text-lg font-semibold text-text-bright mb-1">No Notes Yet</h3><p className="text-text-muted text-sm">Notes for this chapter will be added soon.</p></div>
                  ) : (notes.map((note, idx) => (
                    <div key={note.id} className={`flex items-center gap-4 rounded-xl border border-border bg-card p-4 transition-all duration-300 ${note.hasAccess ? "hover:border-emerald-500/30 hover:bg-card-hover" : "opacity-70"}`}>
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 flex items-center justify-center shrink-0"><FileText className="w-6 h-6 text-emerald-400" /></div>
                      <div className="flex-1 min-w-0"><h3 className="text-sm font-semibold text-text-bright mb-0.5">{idx + 1}. {note.title}</h3><p className="text-xs text-text-muted">PDF Notes</p></div>
                      {note.hasAccess ? (<a href={note.fileUrl} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}><Button variant="outline" size="sm"><Download className="w-4 h-4 mr-1" />Download</Button></a>) : (<Lock className="w-5 h-5 text-text-muted shrink-0" />)}
                    </div>
                  )))}
                </div>
              )}
              {activeTab === "quiz" && (
                <div>
                  {questions.length === 0 ? (
                    <div className="rounded-2xl border border-border bg-card p-10 text-center"><HelpCircle className="w-10 h-10 text-energy/40 mx-auto mb-3" /><h3 className="text-lg font-semibold text-text-bright mb-1">No Quiz Yet</h3><p className="text-text-muted text-sm">Quiz questions for this chapter will be added soon.</p></div>
                  ) : (<>
                    <div className="space-y-6 mb-8">{questions.map((q, idx) => (
                      <div key={q.id} className="rounded-xl border border-border bg-card p-5">
                        <p className="text-sm font-semibold text-text-bright mb-4">Q{idx + 1}. {q.question}</p>
                        <div className="grid sm:grid-cols-2 gap-3">{["A", "B", "C", "D"].map((opt) => {
                          const optionKey = `option${opt}` as keyof Question;
                          const isSelected = selectedAnswers[q.id] === opt;
                          const isCorrect = showResults && q.correctAnswer === opt;
                          const isWrong = showResults && isSelected && q.correctAnswer !== opt;
                          return (<button key={opt} onClick={() => { if (!showResults) setSelectedAnswers((prev) => ({ ...prev, [q.id]: opt })); }} className={`text-left px-4 py-3 rounded-lg border text-sm transition-all ${isCorrect ? "border-emerald-500 bg-emerald-500/10 text-emerald-400" : isWrong ? "border-danger bg-danger/10 text-danger" : isSelected ? "border-accent bg-accent/10 text-accent" : "border-border hover:border-accent/30 text-text-muted hover:text-text-bright"}`}><span className="font-semibold mr-2">{opt}.</span>{q[optionKey]}{isCorrect && <CheckCircle2 className="w-4 h-4 inline ml-2 text-emerald-400" />}</button>);
                        })}</div>
                        {showResults && q.solution && (<div className="mt-3 p-3 rounded-lg bg-surface-light border border-border"><p className="text-xs text-text-muted"><span className="font-semibold text-accent">Solution:</span> {q.solution}</p></div>)}
                      </div>
                    ))}</div>
                    <div className="flex justify-center gap-4">{!showResults ? (<Button onClick={() => setShowResults(true)}>Submit Quiz<ChevronRight className="w-4 h-4 ml-1" /></Button>) : (<Button variant="outline" onClick={() => { setShowResults(false); setSelectedAnswers({}); }}>Retry Quiz</Button>)}</div>
                    {showResults && (<div className="text-center mt-4"><p className="text-text-bright font-semibold">Score: {questions.filter((q) => selectedAnswers[q.id] === q.correctAnswer).length} / {questions.length}</p></div>)}
                  </>)}
                </div>
              )}
            </>)}
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}
