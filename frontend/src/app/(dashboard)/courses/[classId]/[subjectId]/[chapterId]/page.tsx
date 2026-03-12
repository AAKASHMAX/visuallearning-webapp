"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageLoader } from "@/components/ui/loading";
import { VideoPlayer } from "@/components/video/video-player";
import api from "@/lib/api";
import type { Video, Note, Question } from "@/types";
import { PlayCircle, Lock, FileText, CheckCircle, XCircle } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";

export default function ChapterDetailPage() {
  const { chapterId } = useParams();
  const [videos, setVideos] = useState<Video[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [chapterName, setChapterName] = useState("");
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"videos" | "notes" | "questions">("videos");
  const [showAnswers, setShowAnswers] = useState<Record<string, boolean>>({});

  useEffect(() => {
    Promise.all([
      api.get(`/courses/chapters/${chapterId}/videos`),
      api.get(`/courses/chapters/${chapterId}/notes`),
      api.get(`/courses/chapters/${chapterId}/questions`),
    ]).then(([vRes, nRes, qRes]) => {
      setVideos(vRes.data.data.videos || []);
      setChapterName(vRes.data.data.chapter?.name || "");
      setNotes(nRes.data.data || []);
      setQuestions(qRes.data.data || []);
      const firstPlayable = (vRes.data.data.videos || []).find((v: Video) => !v.locked);
      if (firstPlayable) setSelectedVideo(firstPlayable);
    }).finally(() => setLoading(false));
  }, [chapterId]);

  if (loading) return <PageLoader />;

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">{chapterName}</h1>

      {/* Video Player */}
      {selectedVideo && selectedVideo.youtubeVideoId && (
        <div className="mb-6">
          <VideoPlayer youtubeVideoId={selectedVideo.youtubeVideoId} videoId={selectedVideo.id} title={selectedVideo.title} />
          <h2 className="text-lg font-semibold mt-3">{selectedVideo.title}</h2>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 mb-4 border-b">
        {(["videos", "notes", "questions"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`px-4 py-2 font-medium text-sm capitalize transition-colors ${tab === t ? "border-b-2 border-primary text-primary" : "text-gray-400 hover:text-gray-600"}`}>
            {t} ({t === "videos" ? videos.length : t === "notes" ? notes.length : questions.length})
          </button>
        ))}
      </div>

      {/* Videos Tab */}
      {tab === "videos" && (
        <div className="space-y-2">
          {videos.map((v) => (
            <Card key={v.id} className={`cursor-pointer transition-shadow ${selectedVideo?.id === v.id ? "ring-2 ring-primary" : "hover:shadow-md"}`}
              onClick={() => {
                if (v.locked) { toast.error("Subscribe to unlock this video"); return; }
                setSelectedVideo(v);
              }}>
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {v.locked ? <Lock className="w-5 h-5 text-gray-400" /> : <PlayCircle className="w-5 h-5 text-primary" />}
                  <div>
                    <p className="font-medium text-sm">{v.title}</p>
                    {v.duration && <p className="text-xs text-gray-400">{v.duration}</p>}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {v.isFree && <Badge variant="success">Free</Badge>}
                  {v.locked && <Link href="/subscription"><Badge variant="warning">Unlock</Badge></Link>}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Notes Tab */}
      {tab === "notes" && (
        <div className="space-y-2">
          {notes.length === 0 ? <p className="text-gray-400">No notes available yet.</p> : notes.map((n) => (
            <Card key={n.id}>
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-primary" />
                  <span className="font-medium text-sm">{n.title}</span>
                </div>
                <Button variant="outline" size="sm" onClick={() => window.open(n.pdfUrl, "_blank")}>Download</Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Questions Tab */}
      {tab === "questions" && (
        <div className="space-y-4">
          {questions.length === 0 ? <p className="text-gray-400">No questions available yet.</p> : questions.map((q, i) => (
            <Card key={q.id}>
              <CardContent className="p-5">
                <p className="font-medium mb-3">Q{i + 1}. {q.questionText}</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
                  {["A", "B", "C", "D"].map((opt) => (
                    <div key={opt} className={`p-2 rounded border text-sm ${showAnswers[q.id] && q.correctOption === opt ? "border-green-500 bg-green-50" : "border-gray-200"}`}>
                      <span className="font-medium mr-2">{opt}.</span>{(q as any)[`option${opt}`]}
                      {showAnswers[q.id] && q.correctOption === opt && <CheckCircle className="w-4 h-4 text-green-500 inline ml-2" />}
                    </div>
                  ))}
                </div>
                <Button variant="ghost" size="sm" onClick={() => setShowAnswers((p) => ({ ...p, [q.id]: !p[q.id] }))}>
                  {showAnswers[q.id] ? "Hide Answer" : "Show Answer"}
                </Button>
                {showAnswers[q.id] && q.solution && <p className="text-sm text-gray-600 mt-2 p-3 bg-gray-50 rounded">{q.solution}</p>}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
