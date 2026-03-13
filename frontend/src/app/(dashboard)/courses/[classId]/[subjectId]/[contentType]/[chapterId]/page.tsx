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
import { PlayCircle, Lock, FileText, Globe, AlertTriangle, Crown, ArrowLeft, CheckCircle, ChevronLeft, ChevronRight, Maximize2, Minimize2, X, Clock } from "lucide-react";

const VIDEO_TYPE_MAP: Record<string, string> = {
  "animated-videos": "ANIMATED_VIDEO",
  "lecture-videos": "LECTURE_VIDEO",
};

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

  if (loading) return <PageLoader />;

  const currentLangLabel = enabledLanguages.find((l) => l.value === language)?.label || language;

  return (
    <div className="max-w-6xl mx-auto">
      <Link href={`/courses/${classId}/${subjectId}/${contentType}`} className="text-sm text-primary flex items-center gap-1 mb-4 hover:underline">
        <ArrowLeft className="w-3 h-3" /> Back to chapters
      </Link>

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

      {selectedVideo && selectedVideo.youtubeVideoId && (
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <Globe className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">
              {enabledLanguages.find((l) => l.value === selectedVideo.language)?.label || selectedVideo.language}
            </span>
          </div>
          <VideoPlayer youtubeVideoId={selectedVideo.youtubeVideoId} videoId={selectedVideo.id} title={selectedVideo.title} />
          <h2 className="text-lg font-semibold mt-3">{selectedVideo.title}</h2>
        </div>
      )}

      <div className="space-y-2">
        {videos.length === 0 ? (
          <p className="text-gray-400">No videos available.</p>
        ) : videos.map((v) => {
          const isComingSoon = !v.youtubeVideoId;
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
    Promise.all([
      api.get(`/courses/chapters/${chapterId}/notes`).then(({ data }) => {
        const notesData = data.data?.notes || data.data || [];
        setNotes(notesData);
        setHasAccess(data.data?.hasAccess || false);
        if (notesData.length > 0) setSelectedNote(notesData[0]);
      }),
      api.get(`/courses/chapters/${chapterId}/videos`).then(({ data }) => setChapterName(data.data.chapter?.name || "")),
    ]).finally(() => setLoading(false));
  }, [chapterId]);

  if (loading) return <PageLoader />;

  return (
    <div className="max-w-6xl mx-auto">
      <Link href={`/courses/${classId}/${subjectId}/${contentType}`} className="text-sm text-primary flex items-center gap-1 mb-4 hover:underline">
        <ArrowLeft className="w-3 h-3" /> Back to chapters
      </Link>
      <h1 className="text-2xl font-bold mb-6">{chapterName} - Notes</h1>

      {notes.length === 0 ? (
        <p className="text-gray-400">No notes available yet.</p>
      ) : (
        <>
          {/* Notes list */}
          <div className="space-y-2 mb-6">
            {notes.map((n) => (
              <Card key={n.id} className={`cursor-pointer transition-shadow ${selectedNote?.id === n.id ? "ring-2 ring-primary" : "hover:shadow-md"}`}
                onClick={() => setSelectedNote(n)}>
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileText className={`w-5 h-5 ${selectedNote?.id === n.id ? "text-primary" : "text-gray-400"}`} />
                    <span className="font-medium text-sm">{n.title}</span>
                  </div>
                  <div className="flex gap-2">
                    {hasAccess ? (
                      <Button variant="outline" size="sm" onClick={(e) => {
                        e.stopPropagation();
                        const a = document.createElement("a");
                        a.href = n.pdfUrl;
                        a.download = n.title;
                        a.click();
                      }}>Download</Button>
                    ) : (
                      <Button variant="outline" size="sm" onClick={(e) => {
                        e.stopPropagation();
                        setShowSubscribeModal(true);
                      }}>
                        <Lock className="w-3 h-3 mr-1" /> Download
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Inline PDF viewer */}
          {selectedNote && (
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
function QuizViewer() {
  const { classId, subjectId, contentType, chapterId } = useParams();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [chapterName, setChapterName] = useState("");
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  useEffect(() => {
    Promise.all([
      api.get(`/courses/chapters/${chapterId}/questions`).then(({ data }) => setQuestions(data.data || [])),
      api.get(`/courses/chapters/${chapterId}/videos`).then(({ data }) => setChapterName(data.data.chapter?.name || "")),
    ]).finally(() => setLoading(false));
  }, [chapterId]);

  if (loading) return <PageLoader />;
  if (questions.length === 0) {
    return (
      <div className="max-w-4xl mx-auto">
        <Link href={`/courses/${classId}/${subjectId}/${contentType}`} className="text-sm text-primary flex items-center gap-1 mb-4 hover:underline">
          <ArrowLeft className="w-3 h-3" /> Back to chapters
        </Link>
        <p className="text-gray-400">No questions available yet.</p>
      </div>
    );
  }

  const q = questions[currentIndex];
  const answeredCount = Object.keys(answers).length;

  const handleSubmit = () => {
    let s = 0;
    questions.forEach((q) => {
      if (answers[q.id] === q.correctOption) s++;
    });
    setScore(s);
    setIsSubmitted(true);
  };

  const handleRetry = () => {
    setAnswers({});
    setIsSubmitted(false);
    setScore(0);
    setCurrentIndex(0);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <Link href={`/courses/${classId}/${subjectId}/${contentType}`} className="text-sm text-primary flex items-center gap-1 mb-4 hover:underline">
        <ArrowLeft className="w-3 h-3" /> Back to chapters
      </Link>
      <h1 className="text-2xl font-bold mb-2">{chapterName} - Quiz</h1>
      <p className="text-sm text-gray-500 mb-6">{questions.length} questions &middot; {answeredCount} answered</p>

      {/* Score Card */}
      {isSubmitted && (
        <Card className="mb-6 border-2 border-primary">
          <CardContent className="p-6 text-center">
            <h2 className="text-xl font-bold mb-2">Quiz Complete!</h2>
            <p className="text-4xl font-bold text-primary mb-2">{score}/{questions.length}</p>
            <p className="text-gray-500 mb-4">
              {score === questions.length ? "Perfect score!" : score >= questions.length * 0.7 ? "Great job!" : "Keep practicing!"}
            </p>
            <Button onClick={handleRetry}>Retry Quiz</Button>
          </CardContent>
        </Card>
      )}

      {/* Navigation Grid */}
      <div className="flex flex-wrap gap-2 mb-6">
        {questions.map((q, i) => {
          const isAnswered = !!answers[q.id];
          const isCurrent = i === currentIndex;
          const isCorrect = isSubmitted && answers[q.id] === q.correctOption;
          const isWrong = isSubmitted && answers[q.id] && answers[q.id] !== q.correctOption;
          return (
            <button key={q.id} onClick={() => setCurrentIndex(i)}
              className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors
                ${isCurrent ? "ring-2 ring-primary ring-offset-1" : ""}
                ${isSubmitted && isCorrect ? "bg-green-500 text-white" : ""}
                ${isSubmitted && isWrong ? "bg-red-500 text-white" : ""}
                ${!isSubmitted && isAnswered ? "bg-green-100 text-green-700" : ""}
                ${!isSubmitted && !isAnswered && !isCurrent ? "bg-gray-100 text-gray-600" : ""}
                ${!isSubmitted && !isAnswered && isCurrent ? "bg-primary/10 text-primary" : ""}
              `}>
              {i + 1}
            </button>
          );
        })}
      </div>

      {/* Question Display */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <p className="font-medium text-lg mb-4">Q{currentIndex + 1}. {q.questionText}</p>
          <div className="space-y-3">
            {(["A", "B", "C", "D"] as const).map((opt) => {
              const isSelected = answers[q.id] === opt;
              const isCorrectOpt = q.correctOption === opt;
              const showCorrect = isSubmitted && isCorrectOpt;
              const showWrong = isSubmitted && isSelected && !isCorrectOpt;

              return (
                <button key={opt}
                  disabled={isSubmitted}
                  onClick={() => setAnswers({ ...answers, [q.id]: opt })}
                  className={`w-full text-left p-3 rounded-lg border text-sm transition-colors flex items-center gap-2
                    ${showCorrect ? "border-green-500 bg-green-50 text-green-800" : ""}
                    ${showWrong ? "border-red-500 bg-red-50 text-red-800" : ""}
                    ${!isSubmitted && isSelected ? "border-primary bg-primary/5 text-primary" : ""}
                    ${!isSubmitted && !isSelected ? "border-gray-200 hover:border-gray-400" : ""}
                  `}>
                  <span className="font-medium shrink-0">{opt}.</span>
                  <span className="flex-1">{(q as any)[`option${opt}`]}</span>
                  {showCorrect && <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />}
                </button>
              );
            })}
          </div>

          {isSubmitted && q.solution && (
            <div className="mt-4 p-3 bg-gray-50 rounded-lg text-sm text-gray-600">
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

        {currentIndex === questions.length - 1 && !isSubmitted ? (
          <Button onClick={handleSubmit} disabled={answeredCount === 0}>
            Submit Quiz ({answeredCount}/{questions.length})
          </Button>
        ) : (
          <Button variant="outline" disabled={currentIndex === questions.length - 1} onClick={() => setCurrentIndex(currentIndex + 1)}>
            Next <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        )}
      </div>
    </div>
  );
}

// ─── Board Paper Viewer ────────────────────────────────────────
function BoardPaperViewer() {
  const { classId, subjectId, chapterId: paperId } = useParams();
  const [paper, setPaper] = useState<BoardPaper | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch all board papers and find the one matching paperId
    api.get(`/courses/subjects/${subjectId}/board-papers`).then(({ data }) => {
      const allPapers: BoardPaper[] = Object.values(data.data.papers || {}).flat() as BoardPaper[];
      const found = allPapers.find((p) => p.id === paperId);
      setPaper(found || null);
    }).finally(() => setLoading(false));
  }, [subjectId, paperId]);

  if (loading) return <PageLoader />;

  return (
    <div className="max-w-6xl mx-auto">
      <Link href={`/courses/${classId}/${subjectId}/board-papers`} className="text-sm text-primary flex items-center gap-1 mb-4 hover:underline">
        <ArrowLeft className="w-3 h-3" /> Back to board papers
      </Link>
      {paper ? (
        <>
          <h1 className="text-xl font-bold mb-4">{paper.title} ({paper.year})</h1>
          {!paper.pdfUrl || paper.pdfUrl === "pending" ? (
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
