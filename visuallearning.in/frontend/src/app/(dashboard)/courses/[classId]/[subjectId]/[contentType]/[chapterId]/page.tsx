"use client";
import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageLoader } from "@/components/ui/loading";
import { VideoPlayer } from "@/components/video/video-player";
import { useLanguage } from "@/lib/language";
import api from "@/lib/api";
import type { Video, Note, Question, BoardPaper } from "@/types";
import { PlayCircle, Lock, FileText, Globe, AlertTriangle, Crown, CheckCircle, XCircle, ChevronLeft, ChevronRight, Maximize2, Minimize2, Clock, Timer, RotateCcw, Eye, Trophy, Target, BookOpen } from "lucide-react";
import { Breadcrumb } from "@/components/ui/breadcrumb";

const VIDEO_TYPE_MAP: Record<string, string> = {
  "animated-videos": "ANIMATED_VIDEO",
  "lecture-videos": "LECTURE_VIDEO",
};

const CONTENT_TYPE_LABELS: Record<string, string> = {
  "animated-videos": "3D Animated Videos",
  "lecture-videos": "Lecture Videos",
  "notes": "Notes",
  "quiz": "Quiz",
  "board-papers": "Board Papers",
};

function useBreadcrumbData() {
  const { classId, subjectId, contentType } = useParams();
  const [className, setClassName] = useState("");
  const [subjectName, setSubjectName] = useState("");

  useEffect(() => {
    api.get(`/courses/subjects/${subjectId}/chapters`).then(({ data }) => {
      setSubjectName(data.data.subject.name);
      setClassName(data.data.subject.class?.name || "");
    }).catch(() => {});
  }, [subjectId]);

  const contentLabel = CONTENT_TYPE_LABELS[contentType as string] || (contentType as string);

  return {
    items: [
      { label: className || "...", href: `/courses/${classId}` },
      { label: subjectName || "...", href: `/courses/${classId}/${subjectId}` },
      { label: contentLabel, href: `/courses/${classId}/${subjectId}/${contentType}` },
    ],
    className,
    subjectName,
  };
}

export default function ContentViewerPage() {
  const { classId, subjectId, contentType, chapterId } = useParams();
  const router = useRouter();
  const isVideoType = contentType === "animated-videos" || contentType === "lecture-videos";
  const isNotes = contentType === "notes";
  const isQuiz = contentType === "quiz";
  const isBoardPaper = contentType === "board-papers";

  if (isVideoType) return <VideoViewer />;
  if (isNotes) return <NotesViewer />;
  if (isQuiz) return <QuizViewer />;
  if (isBoardPaper) return <BoardPaperViewer />;

  return <div className="p-8 text-center text-gray-400">Invalid content type</div>;
}

// ─── Video Viewer ──────────────────────────────────────────────
function VideoViewer() {
  const { classId, subjectId, contentType, chapterId } = useParams();
  const router = useRouter();
  const { language, enabledLanguages } = useLanguage();
  const [videos, setVideos] = useState<Video[]>([]);
  const [chapterName, setChapterName] = useState("");
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [loading, setLoading] = useState(true);
  const [usingFallback, setUsingFallback] = useState(false);
  const [availableLanguages, setAvailableLanguages] = useState<string[]>([]);
  const [showLockedModal, setShowLockedModal] = useState(false);

  const videoType = VIDEO_TYPE_MAP[contentType as string] || "ANIMATED_VIDEO";

  const loadVideos = useCallback(async () => {
    try {
      const { data } = await api.get(`/courses/chapters/${chapterId}/videos?language=${language}&type=${videoType}`);
      setVideos(data.data.videos || []);
      setChapterName(data.data.chapter?.name || "");
      setUsingFallback(data.data.usingFallback || false);
      setAvailableLanguages(data.data.availableLanguages || []);
      const firstPlayable = (data.data.videos || []).find((v: Video) => !v.locked);
      setSelectedVideo(firstPlayable || null);
    } catch {
      setVideos([]);
    }
  }, [chapterId, language, videoType]);

  useEffect(() => {
    setLoading(true);
    loadVideos().finally(() => setLoading(false));
  }, [loadVideos]);

  useEffect(() => {
    if (!loading) loadVideos();
  }, [language]); // eslint-disable-line react-hooks/exhaustive-deps

  const breadcrumb = useBreadcrumbData();

  if (loading) return <PageLoader />;

  const currentLangLabel = enabledLanguages.find((l) => l.value === language)?.label || language;

  return (
    <div className="max-w-6xl mx-auto">
      <Breadcrumb items={[...breadcrumb.items, { label: chapterName || "..." }]} />

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">{chapterName}</h1>
        {availableLanguages.length > 0 && (
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Globe className="w-4 h-4" />
            <span>Available in: {availableLanguages.map((l) => enabledLanguages.find((x) => x.value === l)?.label || l).join(", ")}</span>
          </div>
        )}
      </div>

      {usingFallback && (
        <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-center gap-2 text-sm text-amber-800">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>Videos not available in {currentLangLabel}. Showing English version instead.</span>
        </div>
      )}

      {selectedVideo && (selectedVideo.vimeoVideoId || selectedVideo.youtubeVideoId) && (
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <Globe className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">
              {enabledLanguages.find((l) => l.value === selectedVideo.language)?.label || selectedVideo.language}
            </span>
          </div>
          <VideoPlayer vimeoVideoId={selectedVideo.vimeoVideoId} youtubeVideoId={selectedVideo.youtubeVideoId} videoId={selectedVideo.id} title={selectedVideo.title} />
          <h2 className="text-lg font-semibold mt-3">{selectedVideo.title}</h2>
        </div>
      )}

      <div className="space-y-2">
        {videos.length === 0 ? (
          <p className="text-gray-400">No videos available.</p>
        ) : videos.map((v) => {
          const isComingSoon = v.hasVideo === false;
          return (
          <Card key={v.id} className={`transition-shadow ${isComingSoon ? "opacity-70" : "cursor-pointer"} ${selectedVideo?.id === v.id ? "ring-2 ring-primary" : "hover:shadow-md"}`}
            onClick={() => {
              if (isComingSoon) return;
              if (v.locked) { setShowLockedModal(true); return; }
              setSelectedVideo(v);
            }}>
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                {isComingSoon ? <Clock className="w-5 h-5 text-gray-400" /> : v.locked ? <Lock className="w-5 h-5 text-gray-400" /> : <PlayCircle className="w-5 h-5 text-primary" />}
                <div>
                  <p className={`font-medium text-sm ${isComingSoon ? "text-gray-400" : ""}`}>{v.title}</p>
                  {v.duration && <p className="text-xs text-gray-400">{v.duration}</p>}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {isComingSoon ? (
                  <Badge variant="default" className="text-xs">Coming Soon</Badge>
                ) : (
                  <>
                    <Badge variant="info" className="text-xs">
                      {enabledLanguages.find((l) => l.value === v.language)?.label || v.language}
                    </Badge>
                    {v.isFree && <Badge variant="success">Free</Badge>}
                    {v.locked && <Link href="/subscription"><Badge variant="warning">Unlock</Badge></Link>}
                  </>
                )}
              </div>
            </CardContent>
          </Card>
          );
        })}
      </div>

      {showLockedModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowLockedModal(false)}>
          <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full p-6 text-center" onClick={(e) => e.stopPropagation()}>
            <div className="mx-auto w-14 h-14 bg-amber-100 rounded-full flex items-center justify-center mb-4">
              <Crown className="w-7 h-7 text-amber-600" />
            </div>
            <h3 className="text-lg font-bold mb-2">Subscription Required</h3>
            <p className="text-gray-500 text-sm mb-6">This video is locked. Subscribe to a plan to unlock all premium content.</p>
            <div className="flex gap-3">
              <button onClick={() => setShowLockedModal(false)} className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">Cancel</button>
              <button onClick={() => { setShowLockedModal(false); router.push("/subscription"); }} className="flex-1 px-4 py-2.5 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">View Plans</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Notes Viewer ──────────────────────────────────────────────
function NotesViewer() {
  const { classId, subjectId, contentType, chapterId } = useParams();
  const router = useRouter();
  const [notes, setNotes] = useState<Note[]>([]);
  const [chapterName, setChapterName] = useState("");
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [hasAccess, setHasAccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showSubscribeModal, setShowSubscribeModal] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    api.get(`/courses/chapters/${chapterId}/notes`).then(({ data }) => {
      const notesData = data.data?.notes || data.data || [];
      setNotes(notesData);
      setHasAccess(data.data?.hasAccess || false);
      setChapterName(data.data?.chapter?.name || "");
      if (notesData.length > 0) setSelectedNote(notesData[0]);
    }).catch(() => {}).finally(() => setLoading(false));
  }, [chapterId]);

  const breadcrumb = useBreadcrumbData();

  if (loading) return <PageLoader />;

  return (
    <div className="max-w-6xl mx-auto">
      <Breadcrumb items={[...breadcrumb.items, { label: chapterName ? `${chapterName} - Notes` : "..." }]} />
      <h1 className="text-2xl font-bold mb-6">{chapterName} - Notes</h1>

      {notes.length === 0 ? (
        <p className="text-gray-400">No notes available yet.</p>
      ) : (
        <>
          {/* Notes list */}
          <div className="space-y-2 mb-6">
            {notes.map((n: any) => (
              <Card key={n.id} className={`cursor-pointer transition-shadow ${n.locked ? "opacity-70" : ""} ${selectedNote?.id === n.id ? "ring-2 ring-primary" : "hover:shadow-md"}`}
                onClick={() => n.locked ? setShowSubscribeModal(true) : setSelectedNote(n)}>
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {n.locked ? <Lock className="w-5 h-5 text-gray-400" /> : <FileText className={`w-5 h-5 ${selectedNote?.id === n.id ? "text-primary" : "text-gray-400"}`} />}
                    <span className="font-medium text-sm">{n.title}</span>
                  </div>
                  <div className="flex gap-2">
                    {n.locked ? (
                      <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); setShowSubscribeModal(true); }}>
                        <Lock className="w-3 h-3 mr-1" /> Locked
                      </Button>
                    ) : hasAccess ? (
                      <Button variant="outline" size="sm" onClick={(e) => {
                        e.stopPropagation();
                        const a = document.createElement("a");
                        a.href = n.pdfUrl;
                        a.download = n.title;
                        a.click();
                      }}>Download</Button>
                    ) : (
                      <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); setShowSubscribeModal(true); }}>
                        <Lock className="w-3 h-3 mr-1" /> Download
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Inline PDF viewer */}
          {selectedNote && !(selectedNote as any).locked && (selectedNote as any).pdfUrl && (
            <div className={isFullscreen ? "fixed inset-0 z-50 bg-white flex flex-col" : "border rounded-lg overflow-hidden"}>
              <div className="bg-gray-50 px-4 py-2 border-b flex items-center justify-between shrink-0">
                <span className="text-sm font-medium text-gray-700">{selectedNote.title}</span>
                <button
                  onClick={() => setIsFullscreen(!isFullscreen)}
                  className="p-1.5 rounded-md hover:bg-gray-200 transition-colors"
                  title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
                >
                  {isFullscreen ? <Minimize2 className="w-4 h-4 text-gray-600" /> : <Maximize2 className="w-4 h-4 text-gray-600" />}
                </button>
              </div>
              <iframe
                src={`${selectedNote.pdfUrl}#toolbar=0`}
                className={isFullscreen ? "w-full flex-1" : "w-full h-[75vh]"}
                title={selectedNote.title}
              />
            </div>
          )}
        </>
      )}

      {/* Subscribe modal */}
      {showSubscribeModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowSubscribeModal(false)}>
          <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full p-6 text-center" onClick={(e) => e.stopPropagation()}>
            <div className="mx-auto w-14 h-14 bg-amber-100 rounded-full flex items-center justify-center mb-4">
              <Crown className="w-7 h-7 text-amber-600" />
            </div>
            <h3 className="text-lg font-bold mb-2">Subscription Required</h3>
            <p className="text-gray-500 text-sm mb-6">Subscribe to download notes and access all premium content.</p>
            <div className="flex gap-3">
              <button onClick={() => setShowSubscribeModal(false)} className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">Cancel</button>
              <button onClick={() => { setShowSubscribeModal(false); router.push("/subscription"); }} className="flex-1 px-4 py-2.5 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">View Plans</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Quiz Viewer ───────────────────────────────────────────────
type QuizPhase = "start" | "active" | "result" | "review";

const QUIZ_DURATION = 30 * 60; // 30 minutes in seconds

function QuizViewer() {
  const { classId, subjectId, contentType, chapterId } = useParams();
  const router = useRouter();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [chapterName, setChapterName] = useState("");
  const [className, setClassName] = useState("");
  const [subjectName, setSubjectName] = useState("");
  const [loading, setLoading] = useState(true);

  // Quiz state
  const [phase, setPhase] = useState<QuizPhase>("start");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(QUIZ_DURATION);

  const [quizLocked, setQuizLocked] = useState(false);
  const [showSubscribeModal, setShowSubscribeModal] = useState(false);

  useEffect(() => {
    Promise.all([
      api.get(`/courses/chapters/${chapterId}/questions`).then(({ data }) => {
        const d = data.data;
        if (d?.locked) {
          setQuizLocked(true);
          setQuestions([]);
        } else {
          setQuestions(d?.questions || d || []);
        }
      }),
      api.get(`/courses/subjects/${subjectId}/chapters`).then(({ data }) => {
        const subject = data.data.subject;
        setSubjectName(subject.name || "");
        setClassName(subject.class?.name || "");
        const chapter = (data.data.chapters || []).find((c: any) => c.id === chapterId);
        setChapterName(chapter?.name || "");
      }),
    ]).catch(() => {}).finally(() => setLoading(false));
  }, [chapterId, subjectId]);

  // Timer
  useEffect(() => {
    if (phase !== "active") return;
    if (timeLeft <= 0) {
      finishQuiz();
      return;
    }
    const interval = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearInterval(interval);
  }, [phase, timeLeft]); // eslint-disable-line react-hooks/exhaustive-deps

  const breadcrumb = useBreadcrumbData();

  const finishQuiz = () => {
    let s = 0;
    questions.forEach((q) => {
      if (answers[q.id] === q.correctOption) s++;
    });
    setScore(s);
    setPhase("result");
  };

  const handleStart = () => {
    setPhase("active");
    setTimeLeft(QUIZ_DURATION);
    setCurrentIndex(0);
    setAnswers({});
    setScore(0);
  };

  const handleRetry = () => {
    handleStart();
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  if (loading) return <PageLoader />;
  if (quizLocked) {
    return (
      <div className="max-w-4xl mx-auto">
        <Breadcrumb items={[...breadcrumb.items, { label: "Quiz" }]} />
        <div className="flex flex-col items-center justify-center py-20">
          <div className="mx-auto w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mb-4">
            <Lock className="w-8 h-8 text-amber-600" />
          </div>
          <h2 className="text-xl font-bold mb-2">Subscription Required</h2>
          <p className="text-gray-500 text-sm mb-6 text-center max-w-md">This quiz is locked. Subscribe to a plan to unlock all quizzes and premium content.</p>
          <Button onClick={() => router.push("/subscription")} className="bg-primary text-white px-6">View Plans</Button>
        </div>
        {showSubscribeModal && null}
      </div>
    );
  }
  if (questions.length === 0) {
    return (
      <div className="max-w-4xl mx-auto">
        <Breadcrumb items={[...breadcrumb.items, { label: "Quiz" }]} />
        <p className="text-gray-400">No questions available yet.</p>
      </div>
    );
  }

  const answeredCount = Object.keys(answers).length;
  const correctCount = score;
  const wrongCount = answeredCount - correctCount;
  const unansweredCount = questions.length - answeredCount;
  const percentage = Math.round((score / questions.length) * 100);

  // ─── Start Screen ───
  if (phase === "start") {
    return (
      <div className="max-w-2xl mx-auto">
        <Breadcrumb items={[...breadcrumb.items, { label: chapterName ? `${chapterName} - Quiz` : "..." }]} />
        <Card className="mt-4 overflow-hidden">
          <div className="bg-gradient-to-br from-orange-500 to-amber-600 p-6 text-white">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <BookOpen className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Chapter Quiz</h1>
                <p className="text-orange-100 text-sm">Test your knowledge</p>
              </div>
            </div>
          </div>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-400 mb-1">Class</p>
                  <p className="font-semibold text-sm">{className}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-400 mb-1">Subject</p>
                  <p className="font-semibold text-sm">{subjectName}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-400 mb-1">Chapter</p>
                  <p className="font-semibold text-sm">{chapterName}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-400 mb-1">Questions</p>
                  <p className="font-semibold text-sm">{questions.length}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-amber-50 rounded-lg border border-amber-200">
                <Timer className="w-5 h-5 text-amber-600 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-amber-800">Time Limit: 30 minutes</p>
                  <p className="text-xs text-amber-600">Quiz auto-submits when time runs out</p>
                </div>
              </div>

              <div className="text-xs text-gray-400 space-y-1">
                <p>&bull; You can navigate between questions freely</p>
                <p>&bull; You can change your answers before submitting</p>
                <p>&bull; Unanswered questions are marked as wrong</p>
              </div>

              <Button className="w-full py-3 text-base" onClick={handleStart}>
                Start Quiz
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ─── Active Quiz ───
  if (phase === "active") {
    const q = questions[currentIndex];
    const isLastQuestion = currentIndex === questions.length - 1;
    const isTimeLow = timeLeft <= 60;

    return (
      <div className="max-w-4xl mx-auto">
        <Breadcrumb items={[...breadcrumb.items, { label: chapterName ? `${chapterName} - Quiz` : "..." }]} />

        {/* Header with timer */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-bold">{chapterName} - Quiz</h1>
            <p className="text-sm text-gray-500">{answeredCount}/{questions.length} answered</p>
          </div>
          <div className={`flex items-center gap-2 px-4 py-2 rounded-full font-mono text-lg font-bold ${isTimeLow ? "bg-red-100 text-red-600 animate-pulse" : "bg-gray-100 text-gray-700"}`}>
            <Timer className="w-5 h-5" />
            {formatTime(timeLeft)}
          </div>
        </div>

        {/* Navigation Grid */}
        <div className="flex flex-wrap gap-2 mb-5">
          {questions.map((q, i) => {
            const isAnswered = !!answers[q.id];
            const isCurrent = i === currentIndex;
            return (
              <button key={q.id} onClick={() => setCurrentIndex(i)}
                className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors
                  ${isCurrent ? "ring-2 ring-primary ring-offset-1" : ""}
                  ${isAnswered && !isCurrent ? "bg-green-100 text-green-700" : ""}
                  ${!isAnswered && !isCurrent ? "bg-gray-100 text-gray-600" : ""}
                  ${isCurrent && !isAnswered ? "bg-primary/10 text-primary" : ""}
                  ${isCurrent && isAnswered ? "bg-green-200 text-green-800" : ""}
                `}>
                {i + 1}
              </button>
            );
          })}
        </div>

        {/* Question Display */}
        <Card className="mb-5">
          <CardContent className="p-6">
            <p className="font-medium text-lg mb-4">Q{currentIndex + 1}. {q.questionText}</p>
            <div className="space-y-3">
              {(["A", "B", "C", "D"] as const).map((opt) => {
                const isSelected = answers[q.id] === opt;
                return (
                  <button key={opt}
                    onClick={() => setAnswers({ ...answers, [q.id]: opt })}
                    className={`w-full text-left p-3 rounded-lg border text-sm transition-colors flex items-center gap-2
                      ${isSelected ? "border-primary bg-primary/5 text-primary font-medium" : "border-gray-200 hover:border-gray-400"}
                    `}>
                    <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${isSelected ? "bg-primary text-white" : "bg-gray-100 text-gray-600"}`}>{opt}</span>
                    <span className="flex-1">{(q as any)[`option${opt}`]}</span>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between">
          <Button variant="outline" disabled={currentIndex === 0} onClick={() => setCurrentIndex(currentIndex - 1)}>
            <ChevronLeft className="w-4 h-4 mr-1" /> Previous
          </Button>

          <div className="flex gap-2">
            {isLastQuestion && (
              <Button onClick={finishQuiz} className="bg-green-600 hover:bg-green-700">
                Finish Quiz
              </Button>
            )}
            {!isLastQuestion && (
              <Button variant="outline" onClick={() => setCurrentIndex(currentIndex + 1)}>
                Next <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ─── Result Screen ───
  if (phase === "result") {
    return (
      <div className="max-w-2xl mx-auto">
        <Breadcrumb items={[...breadcrumb.items, { label: chapterName ? `${chapterName} - Result` : "..." }]} />

        <Card className="mt-4 overflow-hidden">
          <div className={`p-6 text-white text-center ${percentage >= 70 ? "bg-gradient-to-br from-green-500 to-emerald-600" : percentage >= 40 ? "bg-gradient-to-br from-amber-500 to-orange-600" : "bg-gradient-to-br from-red-500 to-rose-600"}`}>
            <Trophy className="w-12 h-12 mx-auto mb-3 opacity-90" />
            <h1 className="text-2xl font-bold mb-1">Quiz Complete!</h1>
            <p className="text-white/80 text-sm">{chapterName}</p>
          </div>
          <CardContent className="p-6">
            {/* Score circle */}
            <div className="flex justify-center mb-6">
              <div className="relative w-32 h-32">
                <svg className="w-32 h-32 -rotate-90" viewBox="0 0 128 128">
                  <circle cx="64" cy="64" r="56" fill="none" stroke="#e5e7eb" strokeWidth="10" />
                  <circle cx="64" cy="64" r="56" fill="none"
                    stroke={percentage >= 70 ? "#22c55e" : percentage >= 40 ? "#f59e0b" : "#ef4444"}
                    strokeWidth="10" strokeLinecap="round"
                    strokeDasharray={`${(percentage / 100) * 352} 352`} />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-bold">{percentage}%</span>
                  <span className="text-xs text-gray-400">{score}/{questions.length}</span>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              <div className="bg-green-50 rounded-lg p-3 text-center">
                <CheckCircle className="w-5 h-5 text-green-500 mx-auto mb-1" />
                <p className="text-lg font-bold text-green-700">{correctCount}</p>
                <p className="text-xs text-green-600">Correct</p>
              </div>
              <div className="bg-red-50 rounded-lg p-3 text-center">
                <XCircle className="w-5 h-5 text-red-500 mx-auto mb-1" />
                <p className="text-lg font-bold text-red-700">{wrongCount}</p>
                <p className="text-xs text-red-600">Wrong</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3 text-center">
                <Clock className="w-5 h-5 text-gray-400 mx-auto mb-1" />
                <p className="text-lg font-bold text-gray-700">{unansweredCount}</p>
                <p className="text-xs text-gray-500">Skipped</p>
              </div>
            </div>

            {/* Message */}
            <div className={`p-3 rounded-lg text-center text-sm font-medium mb-6 ${percentage >= 70 ? "bg-green-50 text-green-700" : percentage >= 40 ? "bg-amber-50 text-amber-700" : "bg-red-50 text-red-700"}`}>
              {percentage === 100 ? "Perfect score! Outstanding!" :
               percentage >= 70 ? "Great job! Keep it up!" :
               percentage >= 40 ? "Good effort! Review the topics and try again." :
               "Keep practicing! Review the solutions to improve."}
            </div>

            {/* Action buttons */}
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => { setPhase("review"); setCurrentIndex(0); }}>
                <Eye className="w-4 h-4 mr-2" /> Review Answers
              </Button>
              <Button className="flex-1" onClick={handleRetry}>
                <RotateCcw className="w-4 h-4 mr-2" /> Reattempt Quiz
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ─── Review Screen ───
  if (phase === "review") {
    const q = questions[currentIndex];
    const userAnswer = answers[q.id];
    const isCorrect = userAnswer === q.correctOption;

    return (
      <div className="max-w-4xl mx-auto">
        <Breadcrumb items={[...breadcrumb.items, { label: chapterName ? `${chapterName} - Review` : "..." }]} />

        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-bold">{chapterName} - Review</h1>
            <p className="text-sm text-gray-500">Question {currentIndex + 1} of {questions.length}</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setPhase("result")}>
              Back to Result
            </Button>
            <Button size="sm" onClick={handleRetry}>
              <RotateCcw className="w-4 h-4 mr-1" /> Reattempt
            </Button>
          </div>
        </div>

        {/* Navigation Grid */}
        <div className="flex flex-wrap gap-2 mb-5">
          {questions.map((q, i) => {
            const ua = answers[q.id];
            const correct = ua === q.correctOption;
            const wrong = ua && ua !== q.correctOption;
            const skipped = !ua;
            const isCurrent = i === currentIndex;
            return (
              <button key={q.id} onClick={() => setCurrentIndex(i)}
                className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors
                  ${isCurrent ? "ring-2 ring-primary ring-offset-1" : ""}
                  ${correct ? "bg-green-500 text-white" : ""}
                  ${wrong ? "bg-red-500 text-white" : ""}
                  ${skipped ? "bg-gray-200 text-gray-500" : ""}
                `}>
                {i + 1}
              </button>
            );
          })}
        </div>

        {/* Question with answers */}
        <Card className="mb-5">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              {isCorrect ? (
                <Badge variant="success" className="flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Correct</Badge>
              ) : userAnswer ? (
                <Badge variant="danger" className="flex items-center gap-1"><XCircle className="w-3 h-3" /> Wrong</Badge>
              ) : (
                <Badge variant="default" className="flex items-center gap-1"><Clock className="w-3 h-3" /> Skipped</Badge>
              )}
            </div>

            <p className="font-medium text-lg mb-4">Q{currentIndex + 1}. {q.questionText}</p>
            <div className="space-y-3">
              {(["A", "B", "C", "D"] as const).map((opt) => {
                const isSelected = userAnswer === opt;
                const isCorrectOpt = q.correctOption === opt;
                const showCorrect = isCorrectOpt;
                const showWrong = isSelected && !isCorrectOpt;

                return (
                  <div key={opt}
                    className={`w-full text-left p-3 rounded-lg border text-sm flex items-center gap-2
                      ${showCorrect ? "border-green-500 bg-green-50 text-green-800" : ""}
                      ${showWrong ? "border-red-500 bg-red-50 text-red-800" : ""}
                      ${!showCorrect && !showWrong ? "border-gray-200" : ""}
                    `}>
                    <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${showCorrect ? "bg-green-500 text-white" : showWrong ? "bg-red-500 text-white" : "bg-gray-100 text-gray-600"}`}>{opt}</span>
                    <span className="flex-1">{(q as any)[`option${opt}`]}</span>
                    {showCorrect && <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />}
                    {showWrong && <XCircle className="w-4 h-4 text-red-500 shrink-0" />}
                    {isSelected && !showWrong && !showCorrect && <span className="text-xs text-gray-400">(Your answer)</span>}
                  </div>
                );
              })}
            </div>

            {q.solution && (
              <div className="mt-4 p-3 bg-blue-50 rounded-lg text-sm text-blue-800 border border-blue-200">
                <p className="font-medium mb-1">Solution:</p>
                <p>{q.solution}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between">
          <Button variant="outline" disabled={currentIndex === 0} onClick={() => setCurrentIndex(currentIndex - 1)}>
            <ChevronLeft className="w-4 h-4 mr-1" /> Previous
          </Button>
          <Button variant="outline" disabled={currentIndex === questions.length - 1} onClick={() => setCurrentIndex(currentIndex + 1)}>
            Next <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </div>
    );
  }

  return null;
}

// ─── Board Paper Viewer ────────────────────────────────────────
function BoardPaperViewer() {
  const { classId, subjectId, chapterId: paperId } = useParams();
  const router = useRouter();
  const [paper, setPaper] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/courses/subjects/${subjectId}/board-papers`).then(({ data }) => {
      const allPapers: any[] = Object.values(data.data.papers || {}).flat();
      const found = allPapers.find((p) => p.id === paperId);
      setPaper(found || null);
    }).catch(() => {}).finally(() => setLoading(false));
  }, [subjectId, paperId]);

  const breadcrumb = useBreadcrumbData();

  if (loading) return <PageLoader />;

  return (
    <div className="max-w-6xl mx-auto">
      <Breadcrumb items={[...breadcrumb.items, { label: paper ? `${paper.title} (${paper.year})` : "..." }]} />
      {paper ? (
        <>
          <h1 className="text-xl font-bold mb-4">{paper.title} ({paper.year})</h1>
          {paper.locked ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="mx-auto w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mb-4">
                <Lock className="w-8 h-8 text-amber-600" />
              </div>
              <h2 className="text-xl font-bold mb-2">Subscription Required</h2>
              <p className="text-gray-500 text-sm mb-6 text-center max-w-md">This paper is locked. Subscribe to a plan to unlock all papers and premium content.</p>
              <Button onClick={() => router.push("/subscription")} className="bg-primary text-white px-6">View Plans</Button>
            </div>
          ) : !paper.pdfUrl || paper.pdfUrl === "pending" ? (
            <div className="w-full rounded-lg border border-dashed border-gray-300 bg-gray-50 flex flex-col items-center justify-center py-20">
              <Clock className="w-12 h-12 text-gray-300 mb-4" />
              <h2 className="text-lg font-semibold text-gray-500 mb-2">Coming Soon</h2>
              <p className="text-sm text-gray-400">This paper will be uploaded shortly.</p>
            </div>
          ) : (
            <div className="w-full h-[80vh] rounded-lg overflow-hidden border">
              <iframe
                src={paper.pdfUrl}
                className="w-full h-full"
                title={paper.title}
              />
            </div>
          )}
        </>
      ) : (
        <p className="text-gray-400">Board paper not found.</p>
      )}
    </div>
  );
}
