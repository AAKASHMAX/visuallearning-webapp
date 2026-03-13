"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageLoader } from "@/components/ui/loading";
import api from "@/lib/api";
import type { Chapter, BoardPaper } from "@/types";
import {
  ArrowLeft, FileText, Clock, Users, MessageCircle, GraduationCap,
  Video, ShieldCheck, Star, CheckCircle, Radio, Calendar, Headphones, Target,
} from "lucide-react";

const CONTENT_TYPE_MAP: Record<string, { apiParam: string; label: string; countLabel: string }> = {
  "animated-videos": { apiParam: "animated_videos", label: "3D Animated Videos", countLabel: "videos" },
  "lecture-videos": { apiParam: "lecture_videos", label: "Lecture Videos", countLabel: "videos" },
  "notes": { apiParam: "notes", label: "Notes", countLabel: "notes" },
  "quiz": { apiParam: "quiz", label: "Quiz", countLabel: "questions" },
  "board-papers": { apiParam: "board_papers", label: "Board Papers (Solved)", countLabel: "papers" },
};

// ─── Chapter List Page ──────────────────────────────────────────
function ChapterListPage() {
  const { classId, subjectId, contentType } = useParams();
  const ct = CONTENT_TYPE_MAP[contentType as string];

  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [boardPapers, setBoardPapers] = useState<Record<string, BoardPaper[]>>({});
  const [subjectName, setSubjectName] = useState("");
  const [className, setClassName] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!ct) return;

    if (contentType === "board-papers") {
      api.get(`/courses/subjects/${subjectId}/board-papers`).then(({ data }) => {
        setBoardPapers(data.data.papers || {});
        setSubjectName(data.data.subject?.name || "");
        setClassName(data.data.subject?.class?.name || "");
      }).finally(() => setLoading(false));
    } else {
      api.get(`/courses/subjects/${subjectId}/chapters?contentType=${ct.apiParam}`).then(({ data }) => {
        setChapters(data.data.chapters);
        setSubjectName(data.data.subject.name);
        setClassName(data.data.subject.class?.name || "");
      }).finally(() => setLoading(false));
    }
  }, [subjectId, contentType]);

  if (!ct) return <div className="p-8 text-center text-gray-400">Invalid content type</div>;
  if (loading) return <PageLoader />;

  const years = Object.keys(boardPapers).sort((a, b) => Number(b) - Number(a));

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <Link href={`/courses/${classId}/${subjectId}`} className="text-sm text-primary flex items-center gap-1 mb-2 hover:underline">
          <ArrowLeft className="w-3 h-3" /> Back
        </Link>
        <p className="text-sm text-gray-400">{className} &middot; {subjectName}</p>
        <h1 className="text-2xl font-bold">{ct.label}</h1>
      </div>

      {contentType === "board-papers" ? (
        <div className="space-y-6">
          {years.length === 0 && <p className="text-gray-400">No board papers available yet.</p>}
          {years.map((year) => (
            <div key={year}>
              <h2 className="text-lg font-semibold mb-3">{year}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {boardPapers[year].map((paper) => {
                  const isPending = !paper.pdfUrl || paper.pdfUrl === "pending";
                  const isSolution = paper.title.toLowerCase().includes("solution");
                  return isPending ? (
                    <Card key={paper.id} className="opacity-60 mb-0">
                      <CardContent className="p-5 flex items-center gap-4">
                        <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${isSolution ? "bg-emerald-100" : "bg-blue-100"}`}>
                          {isSolution ? <FileText className="w-5 h-5 text-emerald-600" /> : <FileText className="w-5 h-5 text-blue-600" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm text-gray-400">{paper.title}</p>
                        </div>
                        <Badge variant="warning" className="shrink-0 flex items-center gap-1">
                          <Clock className="w-3 h-3" /> Coming Soon
                        </Badge>
                      </CardContent>
                    </Card>
                  ) : (
                    <Link key={paper.id} href={`/courses/${classId}/${subjectId}/board-papers/${paper.id}`}>
                      <Card className="hover:shadow-md transition-shadow cursor-pointer mb-0 h-full">
                        <CardContent className="p-5 flex items-center gap-4">
                          <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${isSolution ? "bg-emerald-100" : "bg-blue-100"}`}>
                            {isSolution ? <FileText className="w-5 h-5 text-emerald-600" /> : <FileText className="w-5 h-5 text-blue-600" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm">{paper.title}</p>
                          </div>
                          <Badge variant="info" className="shrink-0">View PDF</Badge>
                        </CardContent>
                      </Card>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {chapters.length === 0 && <p className="text-gray-400">No chapters available for this content type yet.</p>}
          {chapters.map((ch, i) => (
            <Link key={ch.id} href={`/courses/${classId}/${subjectId}/${contentType}/${ch.id}`}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer mb-3">
                <CardContent className="p-5 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-primary text-white rounded-lg flex items-center justify-center font-bold text-sm">
                      {i + 1}
                    </div>
                    <div>
                      <h3 className="font-medium">{ch.name}</h3>
                      {ch.contentCount !== undefined && (
                        <p className="text-xs text-gray-400 mt-1">{ch.contentCount} {ct.countLabel}</p>
                      )}
                    </div>
                  </div>
                  <Badge variant="info">View</Badge>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Live Classes Page ──────────────────────────────────────────
const BENEFITS = [
  { icon: Users, title: "Small Batch Size", description: "Only 10-15 students per session for personalized attention and better interaction with teachers.", color: "bg-blue-100 text-blue-600" },
  { icon: MessageCircle, title: "Live Doubt Clearing", description: "Ask your doubts in real-time and get instant explanations from expert teachers.", color: "bg-emerald-100 text-emerald-600" },
  { icon: GraduationCap, title: "Expert Teachers", description: "Learn from experienced educators who specialize in board exam preparation.", color: "bg-violet-100 text-violet-600" },
  { icon: Target, title: "Exam-Focused Sessions", description: "Sessions designed around important topics, common mistakes, and high-scoring strategies.", color: "bg-orange-100 text-orange-600" },
  { icon: Calendar, title: "Flexible Scheduling", description: "Multiple time slots available so you can pick what works best for your routine.", color: "bg-pink-100 text-pink-600" },
  { icon: Headphones, title: "Session Recordings", description: "Missed a class? All live sessions are recorded and available for you to rewatch anytime.", color: "bg-amber-100 text-amber-600" },
];

const HOW_IT_WORKS = [
  { step: 1, title: "Choose your subject", description: "Pick the subject you need help with" },
  { step: 2, title: "Book a slot", description: "Select a convenient time slot from available sessions" },
  { step: 3, title: "Join the session", description: "Get a link and join the live class at scheduled time" },
  { step: 4, title: "Ask & Learn", description: "Interact with the teacher, ask doubts, and learn effectively" },
];

function LiveClassesPage() {
  const { classId, subjectId } = useParams();

  return (
    <div className="max-w-4xl mx-auto">
      <Link href={`/courses/${classId}/${subjectId}`} className="text-sm text-primary flex items-center gap-1 mb-4 hover:underline">
        <ArrowLeft className="w-3 h-3" /> Back
      </Link>

      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-red-500 to-rose-600 p-8 mb-8">
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
              <Radio className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Live Classes</h1>
              <p className="text-red-100">Interactive doubt-clearing sessions</p>
            </div>
          </div>
          <p className="text-white/90 text-base max-w-xl leading-relaxed">
            Join small group live sessions with expert teachers. Get your doubts cleared in real-time,
            learn exam strategies, and boost your confidence before the big day.
          </p>
          <div className="mt-6">
            <Badge variant="warning" className="text-sm px-4 py-1.5">Launching Soon</Badge>
          </div>
        </div>
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full" />
        <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-white/10 rounded-full" />
      </div>

      {/* Benefits Grid */}
      <div className="mb-8">
        <h2 className="text-lg font-bold mb-4">Why Live Classes?</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {BENEFITS.map((b) => {
            const Icon = b.icon;
            return (
              <Card key={b.title} className="h-full">
                <CardContent className="p-5 flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${b.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm mb-1">{b.title}</h3>
                    <p className="text-sm text-gray-500 leading-relaxed">{b.description}</p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* How It Works */}
      <div className="mb-8">
        <h2 className="text-lg font-bold mb-4">How It Works</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {HOW_IT_WORKS.map((item) => (
            <div key={item.step} className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-red-500 text-white flex items-center justify-center font-bold text-sm shrink-0">
                {item.step}
              </div>
              <div>
                <h3 className="font-semibold text-sm">{item.title}</h3>
                <p className="text-sm text-gray-500">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Highlights */}
      <Card className="border-red-100 mb-8">
        <CardContent className="p-6">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Star className="w-5 h-5 text-red-500" /> What Makes Us Different
          </h2>
          <div className="space-y-3">
            {[
              "Batch size limited to 10-15 students only",
              "Teachers with 5+ years of board exam coaching experience",
              "Subject-wise and chapter-wise sessions",
              "Special sessions before exams for last-minute revision",
              "Recordings available if you miss a session",
            ].map((point) => (
              <div key={point} className="flex items-start gap-3">
                <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                <p className="text-sm text-gray-600">{point}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* CTA */}
      <Card className="bg-gradient-to-r from-red-50 to-rose-50 border-red-100">
        <CardContent className="p-6 text-center">
          <ShieldCheck className="w-10 h-10 text-red-500 mx-auto mb-3" />
          <h3 className="font-bold text-lg mb-2">Get Notified When We Launch</h3>
          <p className="text-sm text-gray-500 mb-1">
            We&apos;re working hard to bring you the best live learning experience. Stay tuned!
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Router ─────────────────────────────────────────────────────
export default function ContentTypeChapterListPage() {
  const { contentType } = useParams();

  if (contentType === "live-classes") {
    return <LiveClassesPage />;
  }

  return <ChapterListPage />;
}
