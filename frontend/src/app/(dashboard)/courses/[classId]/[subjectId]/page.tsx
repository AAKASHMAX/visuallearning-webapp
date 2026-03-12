"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageLoader } from "@/components/ui/loading";
import api from "@/lib/api";
import { Play, Video, FileText, Brain, ClipboardList } from "lucide-react";

interface ContentCounts {
  animatedVideos: number;
  lectureVideos: number;
  notes: number;
  quiz: number;
  boardPapers: number;
}

const CONTENT_TYPES = [
  { slug: "animated-videos", label: "3D Animated Videos", description: "Animated concept explanations", icon: Play, color: "from-violet-500 to-purple-600" },
  { slug: "lecture-videos", label: "Lecture Videos", description: "Detailed lecture recordings", icon: Video, color: "from-blue-500 to-cyan-600" },
  { slug: "notes", label: "Notes", description: "Chapter-wise PDF notes", icon: FileText, color: "from-emerald-500 to-green-600" },
  { slug: "quiz", label: "Quiz", description: "MCQ practice with scoring", icon: Brain, color: "from-orange-500 to-amber-600" },
  { slug: "board-papers", label: "Board Papers (Solved)", description: "Previous year solved papers", icon: ClipboardList, color: "from-rose-500 to-pink-600" },
];

function getCount(counts: ContentCounts | null, slug: string): number {
  if (!counts) return 0;
  const map: Record<string, number> = {
    "animated-videos": counts.animatedVideos,
    "lecture-videos": counts.lectureVideos,
    "notes": counts.notes,
    "quiz": counts.quiz,
    "board-papers": counts.boardPapers,
  };
  return map[slug] || 0;
}

export default function SubjectContentPage() {
  const { classId, subjectId } = useParams();
  const [subjectName, setSubjectName] = useState("");
  const [className, setClassName] = useState("");
  const [counts, setCounts] = useState<ContentCounts | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get(`/courses/subjects/${subjectId}/chapters`).then(({ data }) => {
        setSubjectName(data.data.subject.name);
        setClassName(data.data.subject.class?.name || "");
      }),
      api.get(`/courses/subjects/${subjectId}/content-counts`).then(({ data }) => {
        setCounts(data.data);
      }),
    ]).finally(() => setLoading(false));
  }, [subjectId]);

  if (loading) return <PageLoader />;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <p className="text-sm text-gray-400">{className}</p>
        <h1 className="text-2xl font-bold">{subjectName}</h1>
        <p className="text-gray-500">Choose a content type to explore</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {CONTENT_TYPES.map((ct) => {
          const count = getCount(counts, ct.slug);
          const Icon = ct.icon;
          return (
            <Link key={ct.slug} href={`/courses/${classId}/${subjectId}/${ct.slug}`}>
              <Card className="hover:shadow-lg transition-all cursor-pointer h-full group">
                <CardContent className="p-6 flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${ct.color} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-base">{ct.label}</h3>
                      {count === 0 && <Badge variant="warning">Coming Soon</Badge>}
                    </div>
                    <p className="text-sm text-gray-500">{ct.description}</p>
                    {count > 0 && (
                      <p className="text-xs text-gray-400 mt-1">{count} {count === 1 ? "item" : "items"}</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
