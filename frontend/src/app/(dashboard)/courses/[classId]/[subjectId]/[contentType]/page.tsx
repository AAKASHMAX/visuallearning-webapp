"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageLoader } from "@/components/ui/loading";
import api from "@/lib/api";
import type { Chapter, BoardPaper } from "@/types";
import { ArrowLeft } from "lucide-react";

const CONTENT_TYPE_MAP: Record<string, { apiParam: string; label: string; countLabel: string }> = {
  "animated-videos": { apiParam: "animated_videos", label: "3D Animated Videos", countLabel: "videos" },
  "lecture-videos": { apiParam: "lecture_videos", label: "Lecture Videos", countLabel: "videos" },
  "notes": { apiParam: "notes", label: "Notes", countLabel: "notes" },
  "quiz": { apiParam: "quiz", label: "Quiz", countLabel: "questions" },
  "board-papers": { apiParam: "board_papers", label: "Board Papers (Solved)", countLabel: "papers" },
};

export default function ContentTypeChapterListPage() {
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
              <div className="space-y-2">
                {boardPapers[year].map((paper) => (
                  <Link key={paper.id} href={`/courses/${classId}/${subjectId}/board-papers/${paper.id}`}>
                    <Card className="hover:shadow-md transition-shadow cursor-pointer mb-2">
                      <CardContent className="p-4 flex items-center justify-between">
                        <span className="font-medium text-sm">{paper.title}</span>
                        <Badge variant="info">View PDF</Badge>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
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
