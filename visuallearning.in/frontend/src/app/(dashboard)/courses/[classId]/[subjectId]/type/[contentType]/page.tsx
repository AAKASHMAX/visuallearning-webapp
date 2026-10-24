"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { PageLoader } from "@/components/ui/loading";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import api from "@/lib/api";
import { AnimatedChapterCard } from "@/app/(dashboard)/courses/_components/animated-chapter-card";
import { ChevronRight, BookOpen, Sparkles, FileText, BookMarked, HelpCircle, ClipboardList, type LucideIcon } from "lucide-react";

interface Chapter {
  id: string;
  name: string;
  order?: number;
  counts?: Record<string, number>;
  animationKey?: string | null;
}

// Route each content type to its existing viewer:
//  - 3D animated videos -> the chapter video player
//  - notes / ncert / quiz / pyq / important -> the resource viewer (?type=...)
function chapterHref(classId: string, subjectId: string, chapterId: string, contentType: string) {
  // returnTo brings the viewer's back button to this chapter list (not content types).
  const back = encodeURIComponent(`/courses/${classId}/${subjectId}/type/${contentType}`);
  if (contentType === "animation") {
    return `/courses/${classId}/${subjectId}/${chapterId}?returnTo=${back}`;
  }
  let kind = contentType; // notes | ncert | quiz | pyq
  if (contentType === "important") kind = "question-bank";
  return `/courses/resource-viewer/${classId}/${subjectId}/${chapterId}?type=${kind}&returnTo=${back}`;
}

const META: Record<string, { label: string; icon: LucideIcon; gradient: string }> = {
  animation: { label: "3D Animated Videos", icon: Sparkles, gradient: "from-violet-500 to-purple-600" },
  notes: { label: "Notes", icon: FileText, gradient: "from-emerald-500 to-green-600" },
  ncert: { label: "NCERT Solutions", icon: BookMarked, gradient: "from-sky-500 to-cyan-600" },
  pyq: { label: "PYQs", icon: ClipboardList, gradient: "from-pink-500 to-rose-700" },
  important: { label: "Important Questions", icon: ClipboardList, gradient: "from-pink-500 to-rose-700" },
  quiz: { label: "Quiz", icon: HelpCircle, gradient: "from-orange-500 to-amber-600" },
};

export default function ChapterListPage() {
  const params = useParams();
  const classId = Array.isArray(params.classId) ? params.classId[0] : (params.classId as string);
  const subjectId = Array.isArray(params.subjectId) ? params.subjectId[0] : (params.subjectId as string);
  const requested = Array.isArray(params.contentType) ? params.contentType[0] : (params.contentType as string);
  // Lecture videos are not offered; old lecture links show the 3D videos.
  const contentType = requested === "lecture" ? "animation" : requested;

  const [subjectName, setSubjectName] = useState("");
  const [className, setClassName] = useState("");
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/courses/subjects/${subjectId}/chapters`).then(({ data }) => {
      const d = data.data;
      setSubjectName(d.subject.name);
      setClassName(d.subject.class?.name || "");
      setChapters(d.chapters || []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, [subjectId]);

  if (loading) return <PageLoader />;

  const meta = META[contentType] || META.animation;
  const label = meta.label;
  const Icon = meta.icon;

  return <div className="learning-page physics-chapter-page">
    <Breadcrumb items={[{ label: className, href: `/courses/${classId}` }, { label: subjectName, href: `/courses/${classId}/${subjectId}` }, { label }]} />
    <header className="learn-lesson-header"><div><span className="learn-eyebrow"><span /> {className} / {subjectName}</span><h1>{label}</h1><p>{chapters.length} chapters · Choose a chapter to start exploring.</p></div></header>
    {chapters.length === 0 ? <div className="learn-empty"><BookOpen /><h3>Chapters are on the way.</h3><p>New learning resources will appear here as they become available.</p></div> : <div className="physics-chapter-grid">{chapters.map((chapter, index) => {
      const count = chapter.counts?.[contentType] ?? 0;
      return <AnimatedChapterCard key={chapter.id} name={chapter.name} order={chapter.order || index + 1} animationKey={chapter.animationKey} href={chapterHref(classId, subjectId, chapter.id, contentType)} resourceLabel={`${count} ${contentType === "animation" ? "videos" : "resources"}`} disabled={count === 0} />;
    })}</div>}
  </div>;
}
