"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageLoader } from "@/components/ui/loading";
import api from "@/lib/api";
import type { Chapter } from "@/types";
import { PlayCircle, FileText, HelpCircle } from "lucide-react";

export default function ChaptersPage() {
  const { classId, subjectId } = useParams();
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [subjectName, setSubjectName] = useState("");
  const [className, setClassName] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/courses/subjects/${subjectId}/chapters`).then(({ data }) => {
      setChapters(data.data.chapters);
      setSubjectName(data.data.subject.name);
      setClassName(data.data.subject.class?.name || "");
    }).finally(() => setLoading(false));
  }, [subjectId]);

  if (loading) return <PageLoader />;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <p className="text-sm text-gray-400">{className}</p>
        <h1 className="text-2xl font-bold">{subjectName}</h1>
        <p className="text-gray-500">{chapters.length} Chapters</p>
      </div>
      <div className="space-y-3">
        {chapters.map((ch, i) => (
          <Link key={ch.id} href={`/courses/${classId}/${subjectId}/${ch.id}`}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer mb-3">
              <CardContent className="p-5 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-primary text-white rounded-lg flex items-center justify-center font-bold text-sm">
                    {i + 1}
                  </div>
                  <div>
                    <h3 className="font-medium">{ch.name}</h3>
                    <div className="flex gap-3 mt-1">
                      <span className="flex items-center gap-1 text-xs text-gray-400">
                        <PlayCircle className="w-3 h-3" /> {ch._count?.videos || 0} videos
                      </span>
                      <span className="flex items-center gap-1 text-xs text-gray-400">
                        <FileText className="w-3 h-3" /> {ch._count?.notes || 0} notes
                      </span>
                      <span className="flex items-center gap-1 text-xs text-gray-400">
                        <HelpCircle className="w-3 h-3" /> {ch._count?.questions || 0} MCQs
                      </span>
                    </div>
                  </div>
                </div>
                <Badge variant="info">View</Badge>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
