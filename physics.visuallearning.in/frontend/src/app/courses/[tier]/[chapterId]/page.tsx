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
  Loader2,
  Lock,
  ChevronRight,
  Download,
  CheckCircle2,
  X,
} from "lucide-react";
import api from "@/lib/api";
import { useRequireAuth } from "@/lib/use-require-auth";

interface Video {
  id: string;
  title: string;
  youtubeUrl: string;
  thumbnailUrl?: string;
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

function getVideoThumbnail(video: Video, vimeoCache?: Record<string, string>): string {
  return video.thumbnailUrl || getYoutubeThumbnail(video.youtubeUrl, vimeoCache);
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

function ChapterPageLoading() {
  return (
    <main className="min-h-screen bg-primary">
      <Navbar />
      <section className="bg-grid px-4 pb-16 pt-28 sm:px-6 lg:px-8">
        <div className="mx-auto flex min-h-[62vh] max-w-5xl flex-col items-center justify-center rounded-2xl border border-border bg-card/85 px-6 py-16 text-center shadow-[0_24px_80px_rgba(0,0,0,0.24)]">
          <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-accent/25 bg-accent/10 text-accent shadow-[0_0_28px_rgba(0,212,255,0.16)]">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
          <h1 className="text-xl font-black text-text-bright">Loading chapter</h1>
          <p className="mt-2 max-w-md text-sm leading-relaxed text-text-muted">
            Preparing videos, notes, and chapter details.
          </p>
          <div className="mt-8 grid w-full max-w-3xl gap-4 md:grid-cols-2">
            <div className="h-48 animate-pulse rounded-2xl border border-border bg-surface/70" />
            <div className="space-y-3">
              {[...Array(4)].map((_, index) => (
                <div key={index} className="h-16 animate-pulse rounded-xl border border-border bg-surface/70" />
              ))}
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}

export default function ChapterContentPage() {
  const params = useParams();
  const router = useRouter();
  const tier = params.tier as string;
  const chapterId = params.chapterId as string;
  const canViewCourses = useRequireAuth();

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
  const [showSubscribePrompt, setShowSubscribePrompt] = useState(false);

  // Quiz state
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [showResults, setShowResults] = useState(false);

  // Vimeo thumbnail cache
  const [vimeoThumbnails, setVimeoThumbnails] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!canViewCourses) return;
    let cancelled = false;

    async function loadChapterPage() {
      setLoading(true);
      setChapterName("");
      setSelectedVideo(null);

      try {
        const [videosRes, notesRes, coursesRes] = await Promise.all([
          api.get(`/chapters/${chapterId}/videos`),
          api.get(`/chapters/${chapterId}/notes`),
          api.get(`/courses/tier/${tier}`),
        ]);

        if (cancelled) return;

        const fetchedVideos = Array.isArray(videosRes.data) ? videosRes.data : [];
        const fetchedNotes = Array.isArray(notesRes.data) ? notesRes.data : [];
        const tierCourses = Array.isArray(coursesRes.data) ? coursesRes.data : [];
        const chapter = tierCourses
          .flatMap((course: any) => course.chapters || [])
          .find((item: any) => item.id === chapterId);

        setAllVideos(fetchedVideos);
        setNotes(fetchedNotes);
        setChapterName(chapter?.name || "Chapter");

        // Auto-select the first video in the default language
        const defaultLangVideos = fetchedVideos.filter((v: Video) => v.language === "HINDI");
        const firstAccessibleVideo = defaultLangVideos.find((v: Video) => v.hasAccess && v.youtubeUrl)
          || fetchedVideos.find((v: Video) => v.hasAccess && v.youtubeUrl);
        if (firstAccessibleVideo) {
          setSelectedVideo(firstAccessibleVideo);
        }
      } catch (err) {
        if (cancelled) return;
        console.error("Failed to fetch content");
        setAllVideos([]);
        setNotes([]);
        setChapterName("Chapter");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadChapterPage();

    return () => {
      cancelled = true;
    };
  }, [chapterId, tier, canViewCourses]);

  // When language changes, auto-select first video of that language
  useEffect(() => {
    if (!canViewCourses) return;

    const langVideos = allVideos.filter((v) => v.language === language);
    const firstAccessibleVideo = langVideos.find((v) => v.hasAccess && v.youtubeUrl);
    if (firstAccessibleVideo) {
      setSelectedVideo(firstAccessibleVideo);
    } else {
      setSelectedVideo(null);
    }
  }, [language, allVideos, canViewCourses]);

  // Fetch Vimeo thumbnails
  useEffect(() => {
    if (!canViewCourses) return;

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
  }, [allVideos, canViewCourses]);

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

  function handleBack() {
    if (window.history.length > 1) {
      router.back();
      return;
    }

    router.push(`/course-details/${tier}?billing=monthly`);
  }

  function handleVideoSelect(video: Video) {
    if (video.hasAccess && video.youtubeUrl) {
      setSelectedVideo(video);
      return;
    }

    setShowSubscribePrompt(true);
  }

  const hasHindi = allVideos.some((v) => v.language === "HINDI");
  const hasEnglish = allVideos.some((v) => v.language === "ENGLISH");

  const tabs: { key: Tab; label: string; icon: any; count: number }[] = [
    { key: "videos", label: "Videos", icon: Play, count: videos.length },
    { key: "notes", label: "Notes", icon: FileText, count: notes.length },
    { key: "quiz", label: "Quiz", icon: HelpCircle, count: questions.length },
  ];

  if (!canViewCourses || loading) return <ChapterPageLoading />;

  return (
    <main className="min-h-screen bg-primary">
      <Navbar />
      <div className="pt-20 pb-4 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back + Chapter Header (compact inline) */}
        <div className="flex items-center gap-4 mb-3">
          <button
            type="button"
            onClick={handleBack}
            className="inline-flex items-center gap-1.5 text-text-muted hover:text-accent transition-colors shrink-0"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm hidden sm:inline">Back</span>
          </button>
          <div className="rounded-xl border border-border bg-gradient-to-r from-accent/10 via-card to-secondary/10 px-4 py-2.5 flex-1 flex items-center justify-between min-w-0">
            <div className="min-w-0">
              <p className="text-[10px] text-accent font-semibold uppercase tracking-wider">
                {tier === "free" ? "Free" : tier === "basic" ? "Basic" : tier === "bridge" ? "Bridge" : "Advance"}
              </p>
              <h1 className="text-base sm:text-lg font-bold text-text-bright truncate">
                {chapterName || "Chapter"}
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
            <>
              {activeTab === "videos" && (
                <div className="space-y-2 lg:max-h-[70vh] lg:overflow-y-auto lg:pr-1">
                  {videos.length === 0 ? (
                    <div className="rounded-2xl border border-border bg-card p-10 text-center"><Play className="w-10 h-10 text-accent/40 mx-auto mb-3" /><h3 className="text-lg font-semibold text-text-bright mb-1">No Videos Yet</h3><p className="text-text-muted text-sm">Videos for this chapter will be added soon.</p></div>
                  ) : (videos.map((video, idx) => {
                    const thumbnail = getVideoThumbnail(video, vimeoThumbnails);
                    const isActive = selectedVideo?.id === video.id;
                    return (
                      <div key={video.id} onClick={() => handleVideoSelect(video)}
                        className={`group flex items-center gap-3 rounded-xl border p-2.5 transition-all duration-300 cursor-pointer ${isActive ? "border-accent/40 bg-accent/5" : video.hasAccess ? "border-border bg-card hover:border-accent/30 hover:bg-card-hover" : "border-border bg-card hover:border-energy/40 hover:bg-card-hover"}`}>
                        <div className="relative w-28 h-16 sm:w-32 sm:h-[72px] rounded-lg overflow-hidden bg-surface-light shrink-0">
                          {thumbnail ? (<img src={thumbnail} alt={video.title} className="w-full h-full object-cover" />) : (<div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-surface-light to-card-hover"><Play className="w-6 h-6 text-accent/40" /></div>)}
                          {video.hasAccess ? (
                            <div className={`absolute inset-0 flex items-center justify-center bg-black/30 ${isActive ? "opacity-100" : "opacity-0 group-hover:opacity-100"} transition-opacity`}><div className="w-8 h-8 rounded-full bg-accent/90 flex items-center justify-center shadow-[0_0_12px_rgba(0,212,255,0.5)]"><Play className="w-4 h-4 text-white fill-white ml-0.5" /></div></div>
                          ) : null}
                          {(video.isFree || (video.hasAccess && idx === 0)) && <span className="absolute top-1 right-1 px-1.5 py-0.5 rounded text-[8px] font-bold bg-emerald-500/90 text-white">{video.isFree ? "FREE" : "PREVIEW"}</span>}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-xs sm:text-sm font-semibold text-text-bright mb-0.5 line-clamp-2">{idx + 1}. {video.title}</h3>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${video.videoType === "ANIMATED_VIDEO" ? "bg-accent/10 text-accent" : "bg-secondary/10 text-secondary-light"}`}>{video.videoType === "ANIMATED_VIDEO" ? "3D Animation" : "Lecture"}</span>
                        </div>
                        {!video.hasAccess && (
                          <span className="ml-auto flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-energy/30 bg-energy/10 text-energy">
                            <Lock className="h-4 w-4" />
                          </span>
                        )}
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
            </>
          </div>
        </div>
      </div>
      {showSubscribePrompt && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm" role="dialog" aria-modal="true">
          <div className="relative w-full max-w-md rounded-2xl border border-accent/25 bg-card p-6 shadow-[0_24px_90px_rgba(0,0,0,0.5)]">
            <button
              type="button"
              onClick={() => setShowSubscribePrompt(false)}
              className="absolute right-4 top-4 rounded-lg p-2 text-text-muted transition-colors hover:bg-surface-light hover:text-text-bright"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-energy/10 text-energy">
              <Lock className="h-6 w-6" />
            </div>
            <h2 className="mb-3 pr-8 text-xl font-black text-text-bright">
              Subscribe the plan to access the videos
            </h2>
            <p className="mb-6 text-sm leading-relaxed text-text-muted">
              The first video of each chapter is available as a preview. Subscribe to unlock all remaining videos, notes, and quizzes.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link href={`/subscription?plan=${tier.toUpperCase()}&billing=monthly`} className="flex-1">
                <Button className="w-full">
                  Subscribe Now
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </Link>
              <Button variant="outline" className="flex-1" onClick={() => setShowSubscribePrompt(false)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
      <Footer />
    </main>
  );
}
