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

function getYoutubeThumbnail(url: string): string {
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
      } catch (err) {
        console.error("Failed to fetch content");
      }
      setLoading(false);
    }

    // Fetch chapter info
    async function fetchChapterInfo() {
      try {
        // We need to find the chapter name - get all courses and find this chapter
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
      <div className="pt-28 pb-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back */}
        <Link
          href={`/courses/${tier}`}
          className="inline-flex items-center gap-2 text-text-muted hover:text-accent transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Back to Chapters</span>
        </Link>

        {/* Chapter Header */}
        <div className="rounded-2xl border border-border bg-gradient-to-r from-accent/10 via-card to-secondary/10 p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-accent font-semibold uppercase tracking-wider mb-1">
                {tier === "free" ? "Free Course" : tier === "basic" ? "Basic Course" : "Advance Course"}
              </p>
              <h1 className="text-2xl sm:text-3xl font-bold text-text-bright">
                {chapterName || "Loading..."}
              </h1>
            </div>
            <div className="hidden sm:flex flex-col items-end gap-2">
              <div className="flex items-center gap-4 text-sm text-text-muted">
                <span className="flex items-center gap-1.5">
                  <Play className="w-4 h-4 text-accent" />
                  {allVideos.length} Videos
                </span>
                <span className="flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-emerald-400" />
                  {notes.length} Notes
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs + Language Switch */}
        <div className="border-b border-border mb-6">
          <div className="flex items-center justify-between">
          <div className="flex gap-1">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => handleTabChange(tab.key)}
                className={`flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 transition-all ${
                  activeTab === tab.key
                    ? "border-accent text-accent"
                    : "border-transparent text-text-muted hover:text-text-bright"
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
                {tab.count > 0 && (
                  <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                    activeTab === tab.key ? "bg-accent/10 text-accent" : "bg-surface-light text-text-muted"
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Language Switch */}
          {(hasHindi || hasEnglish) && activeTab === "videos" && (
            <div className="flex items-center gap-1 mb-1">
              <button
                onClick={() => setLanguage("HINDI")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  language === "HINDI"
                    ? "bg-accent text-primary shadow-[0_0_10px_rgba(0,212,255,0.3)]"
                    : "bg-surface-light text-text-muted hover:text-text-bright"
                }`}
              >
                हिंदी
              </button>
              <button
                onClick={() => setLanguage("ENGLISH")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  language === "ENGLISH"
                    ? "bg-accent text-primary shadow-[0_0_10px_rgba(0,212,255,0.3)]"
                    : "bg-surface-light text-text-muted hover:text-text-bright"
                }`}
              >
                English
              </button>
            </div>
          )}
          </div>
        </div>

        {/* Video Player Modal */}
        {selectedVideo && (
          <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4" onClick={() => setSelectedVideo(null)}>
            <div className="w-full max-w-4xl" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-text-bright font-semibold text-lg truncate pr-4">
                  {selectedVideo.title}
                </h3>
                <button
                  onClick={() => setSelectedVideo(null)}
                  className="text-text-muted hover:text-white transition-colors shrink-0"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-black">
                <iframe
                  src={getYoutubeEmbedUrl(selectedVideo.youtubeUrl)}
                  className="absolute inset-0 w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </div>
          </div>
        )}

        {/* Content */}
        {loading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="rounded-xl border border-border bg-card p-4 h-24 animate-pulse" />
            ))}
          </div>
        ) : (
          <>
            {/* Videos Tab */}
            {activeTab === "videos" && (
              <div className="space-y-3">
                {videos.length === 0 ? (
                  <div className="rounded-2xl border border-border bg-card p-12 text-center">
                    <Play className="w-10 h-10 text-accent/40 mx-auto mb-3" />
                    <h3 className="text-lg font-semibold text-text-bright mb-1">No Videos Yet</h3>
                    <p className="text-text-muted text-sm">Videos for this chapter will be added soon.</p>
                  </div>
                ) : (
                  videos.map((video, idx) => {
                    const thumbnail = getYoutubeThumbnail(video.youtubeUrl);
                    return (
                      <div
                        key={video.id}
                        onClick={() => video.hasAccess ? setSelectedVideo(video) : null}
                        className={`group flex items-center gap-4 rounded-xl border border-border bg-card p-3 transition-all duration-300 ${
                          video.hasAccess
                            ? "hover:border-accent/30 hover:bg-card-hover cursor-pointer"
                            : "opacity-70 cursor-not-allowed"
                        }`}
                      >
                        {/* Thumbnail */}
                        <div className="relative w-36 h-20 sm:w-40 sm:h-[90px] rounded-lg overflow-hidden bg-surface-light shrink-0">
                          {thumbnail ? (
                            <img
                              src={thumbnail}
                              alt={video.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-surface-light to-card-hover">
                              <Play className="w-8 h-8 text-accent/40" />
                            </div>
                          )}
                          {/* Play overlay */}
                          {video.hasAccess ? (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity">
                              <div className="w-10 h-10 rounded-full bg-accent/90 flex items-center justify-center shadow-[0_0_16px_rgba(0,212,255,0.5)]">
                                <Play className="w-5 h-5 text-white fill-white ml-0.5" />
                              </div>
                            </div>
                          ) : (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                              <Lock className="w-5 h-5 text-white/70" />
                            </div>
                          )}
                          {/* Duration badge */}
                          {video.isFree && (
                            <span className="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-500/90 text-white">
                              FREE
                            </span>
                          )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm sm:text-base font-semibold text-text-bright mb-1 line-clamp-2">
                            {idx + 1}. {video.title}
                          </h3>
                          <p className="text-xs text-text-muted mb-1">
                            Chapter: {chapterName}
                          </p>
                          <div className="flex items-center gap-3">
                            <span className="text-xs text-text-muted">{video.language}</span>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${
                              video.videoType === "ANIMATED_VIDEO"
                                ? "bg-accent/10 text-accent"
                                : "bg-secondary/10 text-secondary-light"
                            }`}>
                              {video.videoType === "ANIMATED_VIDEO" ? "3D Animation" : "Lecture"}
                            </span>
                          </div>
                        </div>

                        {/* Arrow */}
                        {video.hasAccess && (
                          <ChevronRight className="w-5 h-5 text-text-muted group-hover:text-accent transition-colors shrink-0" />
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {/* Notes Tab */}
            {activeTab === "notes" && (
              <div className="space-y-3">
                {notes.length === 0 ? (
                  <div className="rounded-2xl border border-border bg-card p-12 text-center">
                    <FileText className="w-10 h-10 text-emerald-400/40 mx-auto mb-3" />
                    <h3 className="text-lg font-semibold text-text-bright mb-1">No Notes Yet</h3>
                    <p className="text-text-muted text-sm">Notes for this chapter will be added soon.</p>
                  </div>
                ) : (
                  notes.map((note, idx) => (
                    <div
                      key={note.id}
                      className={`flex items-center gap-4 rounded-xl border border-border bg-card p-4 transition-all duration-300 ${
                        note.hasAccess ? "hover:border-emerald-500/30 hover:bg-card-hover" : "opacity-70"
                      }`}
                    >
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 flex items-center justify-center shrink-0">
                        <FileText className="w-6 h-6 text-emerald-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-semibold text-text-bright mb-0.5">{idx + 1}. {note.title}</h3>
                        <p className="text-xs text-text-muted">PDF Notes</p>
                      </div>
                      {note.hasAccess ? (
                        <a href={note.fileUrl} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}>
                          <Button variant="outline" size="sm">
                            <Download className="w-4 h-4 mr-1" />
                            Download
                          </Button>
                        </a>
                      ) : (
                        <Lock className="w-5 h-5 text-text-muted shrink-0" />
                      )}
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Quiz Tab */}
            {activeTab === "quiz" && (
              <div>
                {questions.length === 0 ? (
                  <div className="rounded-2xl border border-border bg-card p-12 text-center">
                    <HelpCircle className="w-10 h-10 text-energy/40 mx-auto mb-3" />
                    <h3 className="text-lg font-semibold text-text-bright mb-1">No Quiz Yet</h3>
                    <p className="text-text-muted text-sm">Quiz questions for this chapter will be added soon.</p>
                  </div>
                ) : (
                  <>
                    <div className="space-y-6 mb-8">
                      {questions.map((q, idx) => (
                        <div key={q.id} className="rounded-xl border border-border bg-card p-5">
                          <p className="text-sm font-semibold text-text-bright mb-4">
                            Q{idx + 1}. {q.question}
                          </p>
                          <div className="grid sm:grid-cols-2 gap-3">
                            {["A", "B", "C", "D"].map((opt) => {
                              const optionKey = `option${opt}` as keyof Question;
                              const isSelected = selectedAnswers[q.id] === opt;
                              const isCorrect = showResults && q.correctAnswer === opt;
                              const isWrong = showResults && isSelected && q.correctAnswer !== opt;

                              return (
                                <button
                                  key={opt}
                                  onClick={() => {
                                    if (!showResults) {
                                      setSelectedAnswers((prev) => ({ ...prev, [q.id]: opt }));
                                    }
                                  }}
                                  className={`text-left px-4 py-3 rounded-lg border text-sm transition-all ${
                                    isCorrect
                                      ? "border-emerald-500 bg-emerald-500/10 text-emerald-400"
                                      : isWrong
                                      ? "border-danger bg-danger/10 text-danger"
                                      : isSelected
                                      ? "border-accent bg-accent/10 text-accent"
                                      : "border-border hover:border-accent/30 text-text-muted hover:text-text-bright"
                                  }`}
                                >
                                  <span className="font-semibold mr-2">{opt}.</span>
                                  {q[optionKey]}
                                  {isCorrect && <CheckCircle2 className="w-4 h-4 inline ml-2 text-emerald-400" />}
                                </button>
                              );
                            })}
                          </div>
                          {showResults && q.solution && (
                            <div className="mt-3 p-3 rounded-lg bg-surface-light border border-border">
                              <p className="text-xs text-text-muted">
                                <span className="font-semibold text-accent">Solution:</span> {q.solution}
                              </p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-center gap-4">
                      {!showResults ? (
                        <Button onClick={() => setShowResults(true)}>
                          Submit Quiz
                          <ChevronRight className="w-4 h-4 ml-1" />
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          onClick={() => {
                            setShowResults(false);
                            setSelectedAnswers({});
                          }}
                        >
                          Retry Quiz
                        </Button>
                      )}
                    </div>
                    {showResults && (
                      <div className="text-center mt-4">
                        <p className="text-text-bright font-semibold">
                          Score: {questions.filter((q) => selectedAnswers[q.id] === q.correctAnswer).length} / {questions.length}
                        </p>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </>
        )}
      </div>
      <Footer />
    </main>
  );
}
