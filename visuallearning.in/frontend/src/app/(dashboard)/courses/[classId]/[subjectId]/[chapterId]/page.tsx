"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PageLoader } from "@/components/ui/loading";
import { VimeoThumb } from "@/components/video-thumb";
import { VideoPlayer } from "@/components/video/video-player";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import api from "@/lib/api";
import { 
  ArrowLeft, 
  Play, 
  FileText, 
  Brain, 
  Lock, 
  ChevronRight, 
  Download, 
  CheckCircle2, 
  X, 
  Globe,
  Crown,
  MonitorPlay
} from "lucide-react";
import { Video, Note, Question, BoardPaper } from "@/types";

type Tab = "videos" | "lecture" | "notes" | "quiz" | "quiz_active";

export default function UnifiedChapterPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const fromCourse = searchParams.get("fromCourse");
  const fromDetails = searchParams.get("fromDetails");
  const wantLecture = searchParams.get("tab") === "lecture";

  const classId = Array.isArray(params.classId) ? params.classId[0] : (params.classId as string);
  const subjectId = Array.isArray(params.subjectId) ? params.subjectId[0] : (params.subjectId as string);
  const chapterId = Array.isArray(params.chapterId) ? params.chapterId[0] : (params.chapterId as string);

  const [chapterName, setChapterName] = useState("");
  const [subjectName, setSubjectName] = useState("");
  const [className, setClassName] = useState("");
  // Video-only page with 3D-animated and lecture tabs; open lecture when requested.
  const [activeTab, setActiveTab] = useState<Tab>(wantLecture ? "lecture" : "videos");
  
  const [allVideos, setAllVideos] = useState<Video[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [language, setLanguage] = useState<string>("HINDI");

  // Video player state
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [showLockedModal, setShowLockedModal] = useState(false);
  const [quizLocked, setQuizLocked] = useState(false);

  // Quiz state
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        // Fetch Subject & Chapter Info
        const subjectRes = await api.get(`/courses/subjects/${subjectId}/chapters`);
        const subData = subjectRes.data.data;
        setSubjectName(subData.subject.name);
        setClassName(subData.subject.class?.name || "");
        const currentChapter = (subData.chapters || []).find((c: any) => c.id === chapterId);
        setChapterName(currentChapter?.name || "Chapter");

        // Fetch All Content
        const [videosRes, notesRes, quizRes] = await Promise.all([
          api.get(`/courses/chapters/${chapterId}/videos?language=all`),
          api.get(`/courses/chapters/${chapterId}/notes`),
          api.get(`/courses/chapters/${chapterId}/questions`)
        ]);
  
        const videoList = videosRes.data.data.videos || [];
        setAllVideos(videoList);
        setNotes(notesRes.data.data.notes || notesRes.data.data || []);
        const quizData = quizRes.data.data;
        setQuestions(quizData.questions || quizData || []);
        setQuizLocked(quizData.locked || false);

        // Initial Video Selection
        const initialLang = "HINDI";
        // Select the first video of the requested tab (lecture, else 3D animated).
        const isWanted = (v: Video) => (wantLecture ? v.type === "LECTURE_VIDEO" : v.type !== "LECTURE_VIDEO");
        const langVideos = videoList.filter((v: Video) => v.language === initialLang && isWanted(v));
        const firstVideo = langVideos[0] || videoList.filter(isWanted)[0] || videoList[0];
        if (firstVideo) setSelectedVideo(firstVideo);
        
      } catch (err) {
        console.error("Failed to fetch chapter content", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [chapterId, subjectId]);

  // Videos split by content type (3D animated vs lecture), filtered by language.
  // `filteredVideos` is the list for the active tab, so the list rendering below
  // works unchanged for both tabs.
  const animatedVideos = allVideos.filter((v) => v.language === language && v.type !== "LECTURE_VIDEO");
  const lectureVideos = allVideos.filter((v) => v.language === language && v.type === "LECTURE_VIDEO");
  const hasLectures = allVideos.some((v) => v.type === "LECTURE_VIDEO");
  const filteredVideos = activeTab === "lecture" ? lectureVideos : animatedVideos;

  const handleTabChange = (tab: Tab) => {
    setActiveTab(tab);
    if (tab === "videos" || tab === "lecture") {
      const list = allVideos.filter((v) => v.language === language && (tab === "lecture" ? v.type === "LECTURE_VIDEO" : v.type !== "LECTURE_VIDEO"));
      if (list.length) setSelectedVideo(list[0]);
    }
  };

  const tabs: { key: Tab; label: string; icon: any; count: number }[] = [
    { key: "videos", label: "3D Animated", icon: Play, count: animatedVideos.length },
    ...(hasLectures ? [{ key: "lecture" as Tab, label: "Lecture Videos", icon: MonitorPlay, count: lectureVideos.length }] : []),
  ];

  const returnTo = searchParams.get("returnTo");

  const backUrl = returnTo ? decodeURIComponent(returnTo) :
                 fromDetails ? `/course-details/${fromDetails}` : 
                 fromCourse ? `/courses/view-course/${fromCourse}` : 
                 `/courses/${classId}/${subjectId}`;

  if (loading) return <PageLoader />;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Breadcrumbs */}
      {!returnTo && (
        <Breadcrumb items={
          fromDetails ? [
            { label: "Course Details", href: backUrl },
            { label: chapterName },
          ] :
          fromCourse ? [
            { label: "My Course", href: backUrl },
            { label: chapterName },
          ] : [
            { label: className, href: `/courses/${classId}` },
            { label: subjectName, href: `/courses/${classId}/${subjectId}` },
            { label: chapterName },
          ]
        } />
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mt-6 mb-8 p-6 bg-primary-light rounded-2xl border border-primary/10 shadow-sm">
        <div className="flex items-center gap-4">
          <Link href={backUrl} className="p-2 hover:bg-white rounded-full transition-colors group">
            <ArrowLeft className="w-5 h-5 text-primary group-hover:-translate-x-1 transition-transform" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-heading">{chapterName}</h1>
            <p className="text-sm text-text-muted">{subjectName} • {className}</p>
          </div>
        </div>
      </div>

      {/* Main Layout: Right=Player, Left=Tabs/Content */}
      <div className="flex flex-col lg:flex-row-reverse gap-8">
        
        {/* Video Player Section */}
        <div className="w-full lg:w-[60%] shrink-0">
          <div className="lg:sticky lg:top-24 rounded-2xl border border-card-border bg-white overflow-hidden shadow-2xl shadow-primary/10 ring-1 ring-primary/5">
            {selectedVideo ? (
              <>
                <div className="flex items-center justify-between px-5 py-3 border-b border-card-border bg-alternate">
                  <h3 className="text-heading font-bold text-sm sm:text-base truncate pr-3">{selectedVideo.title}</h3>
                  <div className="flex items-center gap-1 shrink-0">
                    <button 
                      onClick={() => setLanguage("HINDI")} 
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${language === "HINDI" ? "bg-accent text-white shadow-md" : "bg-white text-text-muted hover:bg-surface"}`}
                    >
                      Hinglish
                    </button>
                    <button 
                      onClick={() => setLanguage("ENGLISH")} 
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${language === "ENGLISH" ? "bg-accent text-white shadow-md" : "bg-white text-text-muted hover:bg-surface"}`}
                    >
                      English
                    </button>
                  </div>
                </div>
                <div className="bg-black relative aspect-video">
                  {selectedVideo.locked ? (
                    <div 
                      className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900/80 backdrop-blur-md z-20 cursor-pointer group"
                      onClick={() => setShowLockedModal(true)}
                    >
                      <div className="w-20 h-20 rounded-full bg-cta/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <Crown className="w-10 h-10 text-cta" />
                      </div>
                      <h4 className="text-white font-bold text-lg mb-2">Premium Content</h4>
                      <p className="text-gray-400 text-sm px-8 text-center max-w-sm">Subscribe to a plan to unlock all 3D animations and expert lessons for this chapter.</p>
                      <Button className="mt-6 bg-cta hover:bg-cta/90 text-white font-bold px-8 py-2 rounded-full">
                        Unlock Now
                      </Button>
                    </div>
                  ) : (
                    <VideoPlayer 
                      videoId={selectedVideo.id} 
                      youtubeVideoId={selectedVideo.youtubeVideoId} 
                      vimeoVideoId={selectedVideo.vimeoVideoId}
                      title={selectedVideo.title} 
                    />
                  )}
                </div>
              </>
            ) : (
              <div className="aspect-video bg-surface flex flex-col items-center justify-center text-text-light p-8 text-center">
                <Play className="w-12 h-12 mb-3 opacity-20 text-primary" />
                <p>Select a video from the list to start learning</p>
              </div>
            )}
          </div>
        </div>

        {/* Tabs & Content List Section */}
        <div className="w-full lg:w-[40%] min-w-0">
          <div className="flex border-b border-card-border mb-6 overflow-x-auto scrollbar-hide whitespace-nowrap">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => handleTabChange(tab.key)}
                className={`flex items-center gap-1.5 px-3 py-4 text-[13px] font-bold border-b-2 transition-all shrink-0 ${activeTab === tab.key || (activeTab === "quiz_active" && tab.key === "quiz") ? "border-accent text-accent" : "border-transparent text-text-muted hover:text-heading"}`}
              >
                <tab.icon className="w-3.5 h-3.5" />
                {tab.label}
                {tab.count > 0 && (
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full ml-0.5 ${activeTab === tab.key ? "bg-accent/10 text-accent" : "bg-surface text-text-muted"}`}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          <div className="space-y-3 max-h-[60vh] lg:max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
            {/* Videos List (3D animated or lecture, per active tab) */}
            {(activeTab === "videos" || activeTab === "lecture") && (
              <>
                {filteredVideos.length === 0 ? (
                  <div className="text-center py-12 bg-white rounded-xl border border-dashed border-card-border">
                    <Play className="w-8 h-8 text-primary-light mx-auto mb-2" />
                    <p className="text-sm text-text-muted">Coming soon in {language === "HINDI" ? "Hinglish" : "English"}</p>
                    <button 
                      onClick={() => setLanguage(language === "HINDI" ? "ENGLISH" : "HINDI")}
                      className="text-xs text-accent font-bold mt-2 hover:underline"
                    >
                      Switch to {language === "HINDI" ? "English" : "Hinglish"}
                    </button>
                  </div>
                ) : (
                  filteredVideos.map((video, idx) => {
                    const isActive = selectedVideo?.id === video.id;
                    const ytThumb = !video.vimeoVideoId && video.youtubeVideoId
                      ? `https://img.youtube.com/vi/${video.youtubeVideoId}/hqdefault.jpg`
                      : null;

                    return (
                      <div 
                        key={video.id} 
                        onClick={() => {
                          if (video.locked) { setShowLockedModal(true); return; }
                          setSelectedVideo(video);
                        }}
                        className={`group flex items-center gap-4 rounded-xl border p-3.5 mb-3 transition-all duration-300 cursor-pointer ${isActive ? "border-accent bg-accent/5 ring-1 ring-accent/20" : "border-card-border bg-white card-shadow hover:border-accent/40 hover:-translate-y-0.5"}`}
                      >
                        <div className="relative w-36 h-20 rounded-lg bg-surface overflow-hidden shrink-0 flex items-center justify-center">
                          <div className="w-9 h-9 rounded-full bg-accent/90 flex items-center justify-center text-white shadow-sm">
                            <Play className="w-4 h-4 fill-current ml-0.5" />
                          </div>
                          {video.vimeoVideoId ? (
                            <VimeoThumb vimeoId={video.vimeoVideoId} alt={video.title} className="absolute inset-0 w-full h-full object-cover" />
                          ) : ytThumb ? (
                            <img
                              src={ytThumb}
                              alt={video.title}
                              loading="lazy"
                              className="absolute inset-0 w-full h-full object-cover"
                              onError={(e) => { e.currentTarget.style.display = "none"; }}
                            />
                          ) : null}
                          {video.isFree && <span className="absolute top-0 right-0 px-1.5 py-0.5 bg-success text-[9px] font-bold text-white rounded-bl-lg z-20">FREE</span>}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className={`text-base font-bold truncate ${isActive ? "text-accent" : "text-heading"}`}>
                            {idx + 1}. {video.title}
                          </h3>
                          <div className="flex items-center gap-2 mt-1.5">
                            <span className="text-[11px] text-gray-500">{video.duration || "Animated"}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </>
            )}

            {/* Notes List */}
            {activeTab === "notes" && (
              <>
                {notes.length === 0 ? (
                  <div className="text-center py-12 bg-white rounded-xl border border-dashed border-card-border">
                    <FileText className="w-8 h-8 text-primary-light mx-auto mb-2" />
                    <p className="text-sm text-text-muted">No notes available yet</p>
                  </div>
                ) : (
                  notes
                    .filter(n => !n.title.toLowerCase().includes("important question"))
                    .map((note, idx) => (
                    <div
                      key={note.id}
                      onClick={() => {
                        if (note.locked) { setShowLockedModal(true); return; }
                        router.push(`/courses/resource-viewer/${classId}/${subjectId}/${chapterId}?type=notes`);
                      }}
                      className={`flex items-center gap-4 rounded-xl border p-4 card-shadow transition-all cursor-pointer ${note.locked ? "border-card-border bg-surface opacity-80" : "border-card-border bg-white hover:border-success/40 hover:-translate-y-0.5"}`}
                    >
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${note.locked ? "bg-gray-200 text-gray-400" : "bg-success/10 text-success"}`}>
                        {note.locked ? <Lock className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className={`text-sm font-bold truncate ${note.locked ? "text-text-muted" : "text-heading"}`}>{idx + 1}. {note.title}</h3>
                        <p className="text-[10px] text-text-muted uppercase font-medium">{note.htmlContent ? "Interactive Notes" : "PDF Study Material"}</p>
                      </div>
                      {!note.locked && (
                        <ChevronRight className="w-5 h-5 text-success shrink-0" />
                      )}
                      {note.locked && <Lock className="w-4 h-4 text-gray-400" />}
                    </div>
                  ))
                )}
              </>
            )}

            {/* Quiz Section */}
            {activeTab === "quiz" && (
              <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-dashed border-card-border text-center px-6 card-shadow">
                <div className="w-16 h-16 bg-primary-light rounded-full flex items-center justify-center text-primary mb-6">
                  <Brain className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-heading mb-2">Chapter Quiz</h3>
                <p className="text-sm text-text-muted mb-8 max-w-[250px]">Test your knowledge of {chapterName} with our interactive MCQ quiz.</p>
                
                {quizLocked ? (
                  <Button 
                    className="w-full py-6 text-base font-bold bg-gray-400 text-white shadow-lg" 
                    onClick={() => setShowLockedModal(true)}
                  >
                    <Lock className="w-4 h-4 mr-2" />
                    Unlock Quiz
                  </Button>
                ) : questions.length === 0 ? (
                  <p className="text-xs text-gray-400">Quiz coming soon.</p>
                ) : (
                  <Button 
                    className="w-full py-6 text-base font-bold bg-cta hover:bg-cta/90 text-white shadow-lg shadow-cta/20 transition-all hover:-translate-y-0.5" 
                    onClick={() => setActiveTab("quiz_active")}
                  >
                    Start Quiz
                  </Button>
                )}
              </div>
            )}

            {/* Active Quiz View */}
            {activeTab === "quiz_active" && (
              <div className="space-y-6 pb-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-heading">Practice Quiz</h3>
                  <button onClick={() => setActiveTab("quiz")} className="text-xs text-text-muted hover:text-heading">Cancel</button>
                </div>
                {questions.map((q, idx) => (
                  <div key={q.id} className="rounded-xl border border-card-border bg-white p-5 card-shadow">
                    <p className="text-sm font-bold text-heading mb-4">Q{idx + 1}. {q.questionText}</p>
                    <div className="grid grid-cols-1 gap-2">
                      {(["A", "B", "C", "D"] as const).map((opt) => {
                        const optionKey = `option${opt}` as keyof Question;
                        const isSelected = selectedAnswers[q.id] === opt;
                        const isCorrect = showResults && q.correctOption === opt;
                        const isWrong = showResults && isSelected && q.correctOption !== opt;
 
                        return (
                          <button
                            key={opt}
                            disabled={showResults}
                            onClick={() => setSelectedAnswers(prev => ({ ...prev, [q.id]: opt }))}
                            className={`text-left px-4 py-3 rounded-lg border text-sm transition-all flex items-center justify-between ${isCorrect ? "border-success bg-success/10 text-success font-bold" : isWrong ? "border-red-500 bg-red-50 text-red-600" : isSelected ? "border-accent bg-accent/5 text-accent font-bold" : "border-card-border hover:border-accent/40 text-text-muted hover:bg-surface"}`}
                          >
                            <span><span className="opacity-50 mr-2">{opt}.</span> {String(q[optionKey])}</span>
                            {isCorrect && <CheckCircle2 className="w-4 h-4 text-success" />}
                            {isWrong && <X className="w-4 h-4 text-red-500" />}
                          </button>
                        );
                      })}
                    </div>
                    {showResults && q.solution && (
                      <div className="mt-4 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                        <p className="text-xs text-blue-300"><span className="font-bold">Solution:</span> {q.solution}</p>
                      </div>
                    )}
                  </div>
                ))}
                
                <div className="flex flex-col items-center gap-3 pt-4">
                  {!showResults ? (
                    <Button className="w-full py-6 text-base font-bold bg-cta hover:bg-cta/90 text-white" onClick={() => setShowResults(true)}>
                      Submit Quiz
                    </Button>
                  ) : (
                    <div className="text-center w-full">
                      <div className="text-2xl font-bold text-heading mb-2">
                        Score: {questions.filter(q => selectedAnswers[q.id] === q.correctOption).length} / {questions.length}
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" className="flex-1" onClick={() => { setShowResults(false); setSelectedAnswers({}); }}>
                          Retry
                        </Button>
                        <Button className="flex-1" onClick={() => setActiveTab("quiz")}>
                          Finish
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Subscription Locked Modal */}
      {showLockedModal && (
        <div className="fixed inset-0 bg-heading/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-8 text-center animate-fade-in border border-card-border">
            <div className="mx-auto w-16 h-16 bg-cta/10 rounded-full flex items-center justify-center mb-6">
              <Crown className="w-8 h-8 text-cta" />
            </div>
            <h3 className="text-xl font-bold text-heading mb-2">Unlock Premium Content</h3>
            <p className="text-text-muted text-sm mb-8">This video is part of our premium curriculum. Subscribe to a plan to unlock all 3D animations and expert lessons.</p>
            <div className="flex flex-col gap-3">
              <Button onClick={() => router.push("/subscription")} className="w-full py-6 text-base bg-primary hover:bg-primary-dark text-white font-bold transition-all hover:shadow-lg hover:shadow-primary/20">
                View Courses &amp; Plans
              </Button>
              <button onClick={() => setShowLockedModal(false)} className="text-sm text-text-muted hover:text-heading font-medium py-2">
                Maybe later
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
