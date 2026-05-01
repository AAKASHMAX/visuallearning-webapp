"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageLoader } from "@/components/ui/loading";
import api from "@/lib/api";
import { Play, Video, FileText, Brain, ClipboardList, Radio, Lock } from "lucide-react";
import { Breadcrumb } from "@/components/ui/breadcrumb";

interface ContentCounts {
  animatedVideos: number;
  lectureVideos: number;
  notes: number;
  quiz: number;
  boardPapers: number;
}

// Board exam classes show "Board Papers", others show "Important Questions"
const BOARD_CLASSES = ["10", "12", "class 10", "class 12"];

function getContentTypes(className: string) {
  const isBoard = BOARD_CLASSES.some((b) => className.toLowerCase().includes(b));
  return [
    { slug: "animated-videos", label: "3D Animated Videos", description: "Animated concept explanations", icon: Play, color: "from-violet-500 to-purple-600" },
    { slug: "notes", label: "Notes", description: "Chapter-wise PDF notes", icon: FileText, color: "from-emerald-500 to-green-600" },
    { slug: "quiz", label: "Quiz", description: "MCQ practice with scoring", icon: Brain, color: "from-orange-500 to-amber-600" },
    { slug: "board-papers", label: isBoard ? "Board Papers" : "Important Questions", description: isBoard ? "Previous year solved papers" : "Important questions & sample papers", icon: ClipboardList, color: "from-rose-500 to-pink-600" },
  ];
}
 
function getCount(counts: ContentCounts | null, slug: string): number {
  if (!counts) return 0;
  const map: Record<string, number> = {
    "animated-videos": counts.animatedVideos,
    "notes": counts.notes,
    "quiz": counts.quiz,
    "board-papers": counts.boardPapers,
  };
  return map[slug] || 0;
}
 
export default function SubjectContentPage() {
  const router = useRouter();
  const params = useParams();
  // Extract only first segment if params contain extra path segments
  const classId = Array.isArray(params.classId) ? params.classId[0] : (params.classId as string);
  const subjectId = Array.isArray(params.subjectId) ? params.subjectId[0] : (params.subjectId as string);
  const subjectBase = `/courses/${classId}/${subjectId}`;
  const [subjectName, setSubjectName] = useState("");
  const [className, setClassName] = useState("");
  const [counts, setCounts] = useState<ContentCounts | null>(null);
  const [loading, setLoading] = useState(true);
  const [subjectDisabled, setSubjectDisabled] = useState(false);
 
  useEffect(() => {
    Promise.all([
      api.get(`/courses/subjects/${subjectId}/chapters`).then(({ data }) => {
        const subject = data.data.subject;
        setSubjectName(subject.name);
        setClassName(subject.class?.name || "");
        if (subject.enabled === false) {
          setSubjectDisabled(true);
        }
      }),
      api.get(`/courses/subjects/${subjectId}/content-counts`).then(({ data }) => {
        setCounts(data.data);
      }),
    ]).finally(() => setLoading(false));
  }, [subjectId]);
 
  if (loading) return <PageLoader />;
 
  if (subjectDisabled) {
    return (
      <div className="max-w-4xl mx-auto">
        <Breadcrumb items={[
          { label: className, href: `/courses/${classId}` },
          { label: subjectName },
        ]} />
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mb-6">
            <Lock className="w-10 h-10 text-gray-400" />
          </div>
          <h1 className="text-2xl font-bold text-gray-700 mb-2">{subjectName}</h1>
          <p className="text-lg text-yellow-600 font-semibold mb-2">Coming Soon</p>
          <p className="text-gray-500 mb-6">This subject is not yet available. Stay tuned!</p>
          <Link
            href={`/courses/${classId}`}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go Back
          </Link>
        </div>
      </div>
    );
  }
 
  return (
    <div className="max-w-4xl mx-auto">
      <Breadcrumb items={[
        { label: className, href: `/courses/${classId}` },
        { label: subjectName },
      ]} />
      <div className="mb-8">
        <h1 className="text-2xl font-bold">{subjectName}</h1>
        <p className="text-gray-500">Choose a content type to explore</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {getContentTypes(className).map((ct) => {
          const count = getCount(counts, ct.slug);
          const Icon = ct.icon;
          return (
            <Link key={ct.slug} href={`${subjectBase}/${ct.slug}`}>
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
  );
}
