"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageLoader } from "@/components/ui/loading";
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
  Clock,
  Crown
} from "lucide-react";
import { Video, Note, Question, BoardPaper } from "@/types";

type Tab = "videos" | "notes" | "quiz" | "quiz_active";

export default function UnifiedChapterPage() {
  const params = useParams();
  const router = useRouter();
  const classId = Array.isArray(params.classId) ? params.classId[0] : (params.classId as string);
  const subjectId = Array.isArray(params.subjectId) ? params.subjectId[0] : (params.subjectId as string);
  const chapterId = Array.isArray(params.chapterId) ? params.chapterId[0] : (params.chapterId as string);

  const [chapterName, setChapterName] = useState("");
  const [subjectName, setSubjectName] = useState("");
  const [className, setClassName] = useState("");
  const [activeTab, setActiveTab] = useState<Tab>("videos");
  
  const [allVideos, setAllVideos] = useState<Video[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [language, setLanguage] = useState<string>("HINDI");

  // Video player state
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [showLockedModal, setShowLockedModal] = useState(false);

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
        setQuestions(quizRes.data.data.questions || quizRes.data.data || []);

        // Initial Video Selection
        const initialLang = "HINDI";
        const langVideos = videoList.filter((v: Video) => v.language === initialLang);
        const firstPlayable = langVideos.find((v: Video) => !v.locked) || videoList.find((v: Video) => !v.locked);
        if (firstPlayable) setSelectedVideo(firstPlayable);
        
      } catch (err) {
        console.error("Failed to fetch chapter content", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [chapterId, subjectId]);

  // Filtered videos by language
  const filteredVideos = allVideos.filter((v) => v.language === language);

  const handleTabChange = (tab: Tab) => {
    setActiveTab(tab);
  };

  const tabs: { key: Tab; label: string; icon: any; count: number }[] = [
    { key: "videos", label: "Video(3D)", icon: Play, count: filteredVideos.length },
    { key: "notes", label: "Notes", icon: FileText, count: notes.length },
    { key: "quiz", label: "Quiz", icon: Brain, count: questions.length },
  ];

  if (loading) return <PageLoader />;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Breadcrumbs */}
      <Breadcrumb items={[
        { label: className, href: `/courses/${classId}` },
        { label: subjectName, href: `/courses/${classId}/${subjectId}` },
        { label: chapterName },
      ]} />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mt-6 mb-8">
        <div className="flex items-center gap-3">
          <Link href={`/courses/${classId}/${subjectId}`} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white">{chapterName}</h1>
            <p className="text-sm text-text-muted">{subjectName} • {className}</p>
          </div>
        </div>
      </div>

      {/* Main Layout: Right=Player, Left=Tabs/Content */}
      <div className="flex flex-col lg:flex-row-reverse gap-8">
        
        {/* Video Player Section */}
        <div className="w-full lg:w-[60%] shrink-0">
          <div className="lg:sticky lg:top-24 rounded-2xl border border-white/5 bg-card overflow-hidden shadow-sm">
            {selectedVideo ? (
              <>
                <div className="flex items-center justify-between px-5 py-3 border-b border-white/5 bg-primary/20">
                  <h3 className="text-white font-bold text-sm sm:text-base truncate pr-3">{selectedVideo.title}</h3>
                  <div className="flex items-center gap-1 shrink-0">
                    <button 
                      onClick={() => setLanguage("HINDI")} 
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${language === "HINDI" ? "bg-accent text-primary-dark shadow-md" : "bg-white/5 text-text-muted hover:bg-white/10"}`}
                    >
                      हिंदी
                    </button>
                    <button 
                      onClick={() => setLanguage("ENGLISH")} 
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${language === "ENGLISH" ? "bg-accent text-primary-dark shadow-md" : "bg-white/5 text-text-muted hover:bg-white/10"}`}
                    >
                      English
                    </button>
                  </div>
                </div>
                <div className="bg-black">
                  <VideoPlayer 
                    videoId={selectedVideo.id} 
                    youtubeVideoId={selectedVideo.youtubeVideoId} 
                    vimeoVideoId={selectedVideo.vimeoVideoId}
                    title={selectedVideo.title} 
                  />
                </div>
              </>
            ) : (
              <div className="aspect-video bg-primary/20 flex flex-col items-center justify-center text-white/20 p-8 text-center">
                <Play className="w-12 h-12 mb-3 opacity-20" />
                <p>Select a video from the list to start learning</p>
              </div>
            )}
          </div>
        </div>

        {/* Tabs & Content List Section */}
        <div className="w-full lg:w-[40%] min-w-0">
          <div className="flex border-b border-white/5 mb-6 overflow-x-auto scrollbar-hide whitespace-nowrap">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => handleTabChange(tab.key)}
                className={`flex items-center gap-1.5 px-3 py-4 text-[13px] font-bold border-b-2 transition-all shrink-0 ${activeTab === tab.key || (activeTab === "quiz_active" && tab.key === "quiz") ? "border-accent text-accent" : "border-transparent text-text-muted hover:text-white"}`}
              >
                <tab.icon className="w-3.5 h-3.5" />
                {tab.label}
                {tab.count > 0 && (
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full ml-0.5 ${activeTab === tab.key ? "bg-accent/10 text-accent" : "bg-white/5 text-text-muted"}`}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          <div className="space-y-3 max-h-[60vh] lg:max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
            {/* Videos List */}
            {activeTab === "videos" && (
              <>
                {filteredVideos.length === 0 ? (
                  <div className="text-center py-12 bg-primary/20 rounded-xl border border-dashed border-white/10">
                    <Play className="w-8 h-8 text-white/20 mx-auto mb-2" />
                    <p className="text-sm text-text-muted">No videos available in {language === "HINDI" ? "Hindi" : "English"}</p>
                    <button 
                      onClick={() => setLanguage(language === "HINDI" ? "ENGLISH" : "HINDI")}
                      className="text-xs text-accent font-bold mt-2 hover:underline"
                    >
                      Switch to {language === "HINDI" ? "English" : "Hindi"}
                    </button>
                  </div>
                ) : (
                  filteredVideos.map((video, idx) => {
                    const isActive = selectedVideo?.id === video.id;
                    const isComingSoon = !video.youtubeVideoId && !video.vimeoVideoId;
                    
                    return (
                      <div 
                        key={video.id} 
                        onClick={() => {
                          if (isComingSoon) return;
                          if (video.locked) { setShowLockedModal(true); return; }
                          setSelectedVideo(video);
                        }}
                        className={`group flex items-center gap-4 rounded-xl border p-3 mb-3 transition-all duration-300 ${isActive ? "border-accent bg-accent/5 ring-1 ring-accent/20" : video.locked ? "border-white/5 bg-primary/10 opacity-80" : "border-white/5 bg-card hover:border-accent/40 hover:shadow-sm cursor-pointer"}`}
                      >
                        <div className="relative w-24 h-14 rounded-lg bg-primary/30 overflow-hidden shrink-0 flex items-center justify-center">
                          {isComingSoon ? (
                            <Clock className="w-5 h-5 text-gray-300" />
                          ) : video.locked ? (
                            <Lock className="w-5 h-5 text-gray-400" />
                          ) : (
                            <div className={`w-8 h-8 rounded-full bg-accent/90 flex items-center justify-center text-white shadow-sm ${isActive ? "scale-110" : "group-hover:scale-110"} transition-transform`}>
                              <Play className="w-4 h-4 fill-current ml-0.5" />
                            </div>
                          )}
                          {video.isFree && <span className="absolute top-0 right-0 px-1 py-0.5 bg-green-500 text-[8px] font-bold text-white rounded-bl-lg">FREE</span>}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className={`text-sm font-bold truncate ${isActive ? "text-accent" : "text-white"}`}>
                            {idx + 1}. {video.title}
                          </h3>
                          <div className="flex items-center gap-2 mt-1">
                            {isComingSoon ? (
                              <Badge className="text-[9px] px-1.5 py-0">Coming Soon</Badge>
                            ) : (
                              <span className="text-[10px] text-gray-500">{video.duration || "Animated"}</span>
                            )}
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
                  <div className="text-center py-12 bg-primary/20 rounded-xl border border-dashed border-white/10">
                    <FileText className="w-8 h-8 text-white/20 mx-auto mb-2" />
                    <p className="text-sm text-text-muted">No notes available yet</p>
                  </div>
                ) : (
                  notes
                    .filter(n => !n.title.toLowerCase().includes("important question"))
                    .map((note, idx) => (
                    <div key={note.id} className="flex items-center gap-4 rounded-xl border border-white/5 bg-card p-4 hover:border-emerald-500/40 hover:shadow-sm transition-all">
                      <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 shrink-0">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-bold text-white truncate">{idx + 1}. {note.title}</h3>
                        <p className="text-[10px] text-text-muted uppercase font-medium">PDF Study Material</p>
                      </div>
                      <a 
                        href={note.pdfUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="p-2 hover:bg-emerald-50 rounded-lg text-emerald-600 transition-colors"
                      >
                        <Download className="w-5 h-5" />
                      </a>
                    </div>
                  ))
                )}
              </>
            )}

            {/* Quiz Section */}
            {activeTab === "quiz" && (
              <div className="flex flex-col items-center justify-center py-20 bg-primary/20 rounded-2xl border border-dashed border-white/10 text-center px-6">
                <div className="w-16 h-16 bg-purple-500/10 rounded-full flex items-center justify-center text-purple-400 mb-6">
                  <Brain className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Chapter Quiz</h3>
                <p className="text-sm text-text-muted mb-8 max-w-[250px]">Test your knowledge of {chapterName} with our interactive MCQ quiz.</p>
                
                {questions.length === 0 ? (
                  <p className="text-xs text-gray-400">No questions available for this chapter yet.</p>
                ) : (
                  <Button 
                    className="w-full py-6 text-base font-bold shadow-lg shadow-purple-200" 
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
                  <h3 className="font-bold text-white">Practice Quiz</h3>
                  <button onClick={() => setActiveTab("quiz")} className="text-xs text-text-muted hover:text-white">Cancel</button>
                </div>
                {questions.map((q, idx) => (
                  <div key={q.id} className="rounded-xl border border-white/5 bg-card p-5 shadow-sm">
                    <p className="text-sm font-bold text-white mb-4">Q{idx + 1}. {q.questionText}</p>
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
                            className={`text-left px-4 py-3 rounded-lg border text-sm transition-all flex items-center justify-between ${isCorrect ? "border-green-500 bg-green-500/10 text-green-400 font-bold" : isWrong ? "border-red-500 bg-red-500/10 text-red-400" : isSelected ? "border-accent bg-accent/5 text-accent font-bold" : "border-white/5 hover:border-white/10 text-text-muted hover:bg-white/5"}`}
                          >
                            <span><span className="opacity-50 mr-2">{opt}.</span> {String(q[optionKey])}</span>
                            {isCorrect && <CheckCircle2 className="w-4 h-4 text-green-400" />}
                            {isWrong && <X className="w-4 h-4 text-red-400" />}
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
                    <Button className="w-full py-6 text-base" onClick={() => setShowResults(true)}>
                      Submit Quiz
                    </Button>
                  ) : (
                    <div className="text-center w-full">
                      <div className="text-2xl font-bold text-white mb-2">
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
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-card rounded-2xl shadow-2xl max-w-sm w-full p-8 text-center animate-fade-in border border-white/10">
            <div className="mx-auto w-16 h-16 bg-amber-500/10 rounded-full flex items-center justify-center mb-6">
              <Crown className="w-8 h-8 text-amber-500" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Unlock Premium Content</h3>
            <p className="text-text-muted text-sm mb-8">This video is part of our premium curriculum. Subscribe to a plan to unlock all 3D animations and expert lessons.</p>
            <div className="flex flex-col gap-3">
              <Button onClick={() => router.push("/subscription")} className="w-full py-6 text-base bg-accent text-primary-dark hover:bg-accent-light">
                View Subscription Plans
              </Button>
              <button onClick={() => setShowLockedModal(false)} className="text-sm text-text-muted hover:text-white font-medium py-2">
                Maybe later
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
