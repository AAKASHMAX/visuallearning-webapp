"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
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
  MonitorPlay,
  Gift,
  Check,
  Sparkles
} from "lucide-react";
import { Video, Note, Question } from "@/types";
import { useLanguage } from "@/lib/language";

type Tab = "advanced" | "basic" | "notes" | "quiz" | "quiz_active";

// Every 3D video comes in two versions: Basic (the original) and Advanced (its new, more detailed version).
const isAdvanced = (v: Video) => v.level === "ADVANCED";

const LANG_LABEL: Record<string, string> = { HINDI: "Hinglish", ENGLISH: "English" };

export default function UnifiedChapterPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const fromCourse = searchParams.get("fromCourse");
  const fromDetails = searchParams.get("fromDetails");

  const classId = Array.isArray(params.classId) ? params.classId[0] : (params.classId as string);
  const subjectId = Array.isArray(params.subjectId) ? params.subjectId[0] : (params.subjectId as string);
  const chapterId = Array.isArray(params.chapterId) ? params.chapterId[0] : (params.chapterId as string);

  const [chapterName, setChapterName] = useState("");
  const [subjectName, setSubjectName] = useState("");
  const [className, setClassName] = useState("");
  // Video-only page: the chapter's 3D videos, Advanced and Basic in their own tabs.
  const [activeTab, setActiveTab] = useState<Tab>("basic");
  
  const [allVideos, setAllVideos] = useState<Video[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  // Language comes from the saved preference (Sidebar → Language). Switching it
  // here changes the default for every chapter, so we confirm first.
  const { language, setLanguage, hydrate: hydrateLanguage } = useLanguage();
  const [pendingLang, setPendingLang] = useState<string | null>(null);
  useEffect(() => { hydrateLanguage(); }, [hydrateLanguage]);

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
      setLoadError(false);
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
  
        // Lecture videos are not offered, so they are never listed or played.
        const videoList = (videosRes.data.data.videos || []).filter((v: Video) => v.type !== "LECTURE_VIDEO");
        setAllVideos(videoList);
        setNotes(notesRes.data.data.notes || notesRes.data.data || []);
        const quizData = quizRes.data.data;
        setQuestions(quizData.questions || quizData || []);
        setQuizLocked(quizData.locked || false);

        // Initial Video Selection — honour the saved language preference, and open
        // on Advanced when the chapter has it in that language.
        const initialLang = (typeof window !== "undefined" && localStorage.getItem("vl_language")) || "HINDI";
        const startTab: Tab = videoList.some((v: Video) => isAdvanced(v) && v.language === initialLang) ? "advanced" : "basic";
        setActiveTab(startTab);
        const tabVideos = videoList.filter((v: Video) => isAdvanced(v) === (startTab === "advanced"));
        const firstVideo = tabVideos.find((v: Video) => v.language === initialLang) || tabVideos[0] || videoList[0];
        if (firstVideo) setSelectedVideo(firstVideo);
        
      } catch (err) {
        setLoadError(true);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [chapterId, subjectId, reloadKey]);

  // The chapter's videos in the chosen language, per version; the list shows the active tab's.
  const advancedVideos = allVideos.filter((v) => v.language === language && isAdvanced(v));
  const basicVideos = allVideos.filter((v) => v.language === language && !isAdvanced(v));
  const videoTab = activeTab === "advanced" || activeTab === "basic";
  const shownVideos = activeTab === "advanced" ? advancedVideos : basicVideos;
  const hasAdvanced = allVideos.some(isAdvanced);

  const handleTabChange = (tab: Tab) => {
    setActiveTab(tab);
    const list = tab === "advanced" ? advancedVideos : tab === "basic" ? basicVideos : [];
    if (list.length) setSelectedVideo(list[0]);
  };

  // Ask before switching, since this changes the default language for every chapter.
  const requestLanguage = (lang: string) => {
    if (lang !== language) setPendingLang(lang);
  };
  const confirmLanguage = () => {
    if (!pendingLang) return;
    setLanguage(pendingLang); // persists as the new default
    // Re-select the first video of the current tab in the new language.
    const list = allVideos.filter((v) => v.language === pendingLang && isAdvanced(v) === (activeTab === "advanced"));
    if (list.length) setSelectedVideo(list[0]);
    setPendingLang(null);
  };

  const tabs: { key: Tab; label: string; icon: any; count: number }[] = [
    { key: "advanced", label: "Advanced", icon: Sparkles, count: advancedVideos.length },
    { key: "basic", label: "Basic", icon: Play, count: basicVideos.length },
  ];

  const returnTo = searchParams.get("returnTo");

  const backUrl = returnTo ? decodeURIComponent(returnTo) :
                 fromDetails ? `/course-details/${fromDetails}` : 
                 fromCourse ? `/courses/view-course/${fromCourse}` : 
                 `/courses/${classId}/${subjectId}`;

  if (loading) return <PageLoader />;
  if (loadError) return <div className="learning-page"><div className="learn-empty" role="alert"><MonitorPlay /><h3>Let’s try that lesson again.</h3><p>We couldn’t load this chapter. Please check your connection and try again.</p><button className="learn-button" onClick={() => setReloadKey(value => value + 1)}>Reload chapter</button></div></div>;

  return (
    <div className="learning-page learn-chapter-page">
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

      <header className="learn-lesson-header">
        <Link href={backUrl} className="learn-text-link"><ArrowLeft size={16} /> Back to chapters</Link>
        <div><span className="learn-eyebrow"><span /> {className} / {subjectName}</span><h1>{chapterName}</h1><p>Give this idea a little space. Watch, pause, and make the connections.</p></div>
      </header>

      {/* Lesson player with a chapter playlist alongside it. */}
      <div className="learn-lesson-layout">
        
        {/* Video Player Section */}
        <div className="learn-lesson-player-column">
          <div className="learn-lesson-player">
            {selectedVideo ? (
              <>
                <div className="learn-lesson-toolbar">
                  <h3 className="learn-now-playing">
                    <span className={`learn-level-tag ${isAdvanced(selectedVideo) ? "is-advanced" : ""}`}>
                      {isAdvanced(selectedVideo) ? "Advanced" : "Basic"}
                    </span>
                    {selectedVideo.title}
                  </h3>
                  <div className="learn-language-switch">
                    <button
                      onClick={() => requestLanguage("HINDI")}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${language === "HINDI" ? "bg-primary text-white" : "bg-white text-text-muted hover:bg-surface"}`}
                    >
                      Hinglish
                    </button>
                    <button
                      onClick={() => requestLanguage("ENGLISH")}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${language === "ENGLISH" ? "bg-primary text-white" : "bg-white text-text-muted hover:bg-surface"}`}
                    >
                      English
                    </button>
                  </div>
                </div>
                <div className="bg-black relative aspect-video">
                  {selectedVideo.locked ? (
                    <div 
                      className="learn-locked-video absolute inset-0 flex flex-col items-center justify-center bg-gray-900/80 backdrop-blur-md z-20 cursor-pointer group"
                      onClick={() => setShowLockedModal(true)}
                    >
                      <div className="w-20 h-20 rounded-full bg-accent/15 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <Gift className="w-10 h-10 text-accent" />
                      </div>
                      <h4 className="text-white font-bold text-lg mb-2">Premium Content</h4>
                      <p className="text-gray-400 text-sm px-8 text-center max-w-sm"><span className="text-white font-semibold">Subscribe</span> to unlock all 3D animations and expert lessons.</p>
                      <Button className="mt-6 bg-accent hover:bg-accent/90 text-[#050815] font-bold px-8 py-2 rounded-full">
                        View Plans
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
        <div className="learn-lesson-playlist">
          <div className="learn-lesson-tabs">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                aria-pressed={activeTab === tab.key}
                onClick={() => handleTabChange(tab.key)}
                className={activeTab === tab.key || (activeTab === "quiz_active" && tab.key === "quiz") ? "is-active" : ""}
              >
                <tab.icon className="w-3.5 h-3.5" />
                {tab.label}
                {tab.count > 0 && (
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full ml-0.5 ${activeTab === tab.key ? "bg-black/15 text-[#050815]" : "bg-surface text-text-muted"}`}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          <div className="learn-lesson-list">
            {/* 3D videos: the active tab's version */}
            {videoTab && (
              <>
                {shownVideos.length === 0 ? (
                  activeTab === "advanced" && !hasAdvanced ? (
                    <div className="text-center py-12 bg-white rounded-xl border border-dashed border-card-border">
                      <Sparkles className="w-8 h-8 text-primary-light mx-auto mb-2" />
                      <p className="text-sm text-text-muted">The Advanced version of this chapter is on its way.</p>
                      {basicVideos.length > 0 && (
                        <button onClick={() => handleTabChange("basic")} className="text-xs text-primary font-bold mt-2 hover:underline">
                          Watch the Basic videos
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-12 bg-white rounded-xl border border-dashed border-card-border">
                      <Play className="w-8 h-8 text-primary-light mx-auto mb-2" />
                      <p className="text-sm text-text-muted">Coming soon in {language === "HINDI" ? "Hinglish" : "English"}</p>
                      <button
                        onClick={() => requestLanguage(language === "HINDI" ? "ENGLISH" : "HINDI")}
                        className="text-xs text-primary font-bold mt-2 hover:underline"
                      >
                        Switch to {language === "HINDI" ? "English" : "Hinglish"}
                      </button>
                    </div>
                  )
                ) : (
                  shownVideos.map((video, idx) => {
                    const isActive = selectedVideo?.id === video.id;
                    const ytThumb = !video.vimeoVideoId && video.youtubeVideoId
                      ? `https://img.youtube.com/vi/${video.youtubeVideoId}/hqdefault.jpg`
                      : null;

                    return (
                      <div 
                        key={video.id}
                        role="button"
                        tabIndex={0}
                        aria-pressed={isActive}
                        onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); if (video.locked) setShowLockedModal(true); else setSelectedVideo(video); } }}
                        onClick={() => {
                          if (video.locked) { setShowLockedModal(true); return; }
                          setSelectedVideo(video);
                        }}
                        className={`learn-video-row ${isActive ? "is-active" : ""} ${video.locked ? "is-locked" : ""}`}
                      >
                        <div className="learn-video-thumbnail">
                          <div className="learn-video-play-icon">
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
                          {video.isFree && <span className="learn-video-free">FREE</span>}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="learn-video-title">
                            {idx + 1}. {video.title}
                          </h3>
                          <div className="flex items-center gap-2 mt-1.5">
                            <span className="text-[11px] text-gray-500">{video.duration || "3D animation"}{video.locked && " · Premium"}</span>
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
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${note.locked ? "bg-gray-200 text-gray-400" : "bg-success/10 text-primary"}`}>
                        {note.locked ? <Lock className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className={`text-sm font-bold truncate ${note.locked ? "text-text-muted" : "text-heading"}`}>{idx + 1}. {note.title}</h3>
                        <p className="text-[10px] text-text-muted uppercase font-medium">{note.htmlContent ? "Interactive Notes" : "PDF Study Material"}</p>
                      </div>
                      {!note.locked && (
                        <ChevronRight className="w-5 h-5 text-primary shrink-0" />
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
                    className="w-full py-6 text-base font-bold bg-secondary hover:bg-secondary-dark text-white shadow-lg shadow-cta/20 transition-all hover:-translate-y-0.5"
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
                            className={`text-left px-4 py-3 rounded-lg border text-sm transition-all flex items-center justify-between ${isCorrect ? "border-success bg-success/10 text-primary font-bold" : isWrong ? "border-red-500 bg-red-50 text-red-600" : isSelected ? "border-primary bg-accent/5 text-primary font-bold" : "border-card-border hover:border-primary/40 text-text-muted hover:bg-surface"}`}
                          >
                            <span><span className="opacity-50 mr-2">{opt}.</span> {String(q[optionKey])}</span>
                            {isCorrect && <CheckCircle2 className="w-4 h-4 text-primary" />}
                            {isWrong && <X className="w-4 h-4 text-red-500" />}
                          </button>
                        );
                      })}
                    </div>
                    {showResults && q.solution && (
                      <div className="mt-4 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                        <p className="text-xs text-primary"><span className="font-bold">Solution:</span> {q.solution}</p>
                      </div>
                    )}
                  </div>
                ))}
                
                <div className="flex flex-col items-center gap-3 pt-4">
                  {!showResults ? (
                    <Button className="w-full py-6 text-base font-bold bg-primary hover:bg-primary-dark text-white" onClick={() => setShowResults(true)}>
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

      {/* Locked Modal — 3D animation videos require a subscription */}
      {showLockedModal && (
        <div className="fixed inset-0 bg-[#050815]/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div role="dialog" aria-modal="true" aria-labelledby="locked-video-title" className="learn-lesson-modal bg-white rounded-2xl max-w-sm w-full p-8 text-center border border-card-border">
            <div className="mx-auto w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mb-5">
              <Gift className="w-8 h-8 text-primary" />
            </div>
            <h3 id="locked-video-title" className="text-xl font-bold text-heading mb-2">There’s more to discover.</h3>
            <p className="text-text-muted text-sm mb-4">
              Notes, NCERT, PYQ &amp; quizzes are free to read. Subscribe to also watch all{" "}
              <span className="font-bold text-heading">3D animated videos</span> and download PDFs.
            </p>
            <ul className="text-left text-xs text-text-muted mb-6 space-y-1.5 mx-auto max-w-[15rem]">
              <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-primary" /> All 3D animated videos</li>
              <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-primary" /> Download Notes, NCERT &amp; PYQ PDFs</li>
            </ul>
            <div className="flex flex-col gap-2">
              <button onClick={() => router.push("/pricing")} className="w-full rounded-lg bg-accent hover:bg-accent/90 text-[#050815] font-bold py-2.5 text-sm">
                View Plans
              </button>
              <button onClick={() => setShowLockedModal(false)} className="text-sm text-text-muted hover:text-heading font-medium py-1">
                Maybe later
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Language switch confirmation */}
      {pendingLang && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#050815]/80 p-4 backdrop-blur-sm">
          <div role="dialog" aria-modal="true" aria-labelledby="lesson-language-title" className="learn-lesson-modal w-full max-w-sm rounded-2xl border border-card-border bg-white p-6 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-accent/10">
              <Globe className="h-7 w-7 text-primary" />
            </div>
            <h3 id="lesson-language-title" className="text-lg font-bold text-heading">Switch to {LANG_LABEL[pendingLang]}?</h3>
            <p className="mt-2 text-sm text-text-muted">
              This will set <span className="font-bold text-heading">{LANG_LABEL[pendingLang]}</span> as your
              default language, and every chapter will open in it. You can change it anytime from the sidebar.
            </p>
            <div className="mt-6 flex gap-2">
              <button
                onClick={() => setPendingLang(null)}
                className="flex-1 rounded-lg border border-gray-200 py-2.5 text-sm font-bold text-heading hover:bg-surface"
              >
                Cancel
              </button>
              <button
                onClick={confirmLanguage}
                className="flex-1 rounded-lg bg-primary py-2.5 text-sm font-bold text-white hover:bg-primary-dark"
              >
                Set as default
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
