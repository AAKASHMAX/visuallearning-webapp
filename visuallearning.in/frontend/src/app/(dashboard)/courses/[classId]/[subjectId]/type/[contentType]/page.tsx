"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { PageLoader } from "@/components/ui/loading";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import api from "@/lib/api";
import { ChevronRight, BookOpen, Sparkles, GraduationCap, FileText, BookMarked, HelpCircle, ClipboardList, type LucideIcon } from "lucide-react";

interface Chapter {
  id: string;
  name: string;
  order?: number;
  counts?: Record<string, number>;
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
  if (contentType === "lecture") {
    return `/courses/${classId}/${subjectId}/${chapterId}?tab=lecture&returnTo=${back}`;
  }
  let kind = contentType; // notes | ncert | quiz | pyq
  if (contentType === "important") kind = "question-bank";
  return `/courses/resource-viewer/${classId}/${subjectId}/${chapterId}?type=${kind}&returnTo=${back}`;
}

const META: Record<string, { label: string; icon: LucideIcon; gradient: string }> = {
  animation: { label: "3D Animated Videos", icon: Sparkles, gradient: "from-violet-500 to-purple-600" },
  lecture: { label: "Lecture Videos", icon: GraduationCap, gradient: "from-sky-500 to-blue-600" },
  notes: { label: "Notes", icon: FileText, gradient: "from-emerald-500 to-green-600" },
  ncert: { label: "NCERT Solution", icon: BookMarked, gradient: "from-sky-500 to-cyan-600" },
  pyq: { label: "PYQs", icon: ClipboardList, gradient: "from-pink-500 to-rose-700" },
  important: { label: "Important Questions", icon: ClipboardList, gradient: "from-pink-500 to-rose-700" },
  quiz: { label: "Quiz", icon: HelpCircle, gradient: "from-orange-500 to-amber-600" },
};

export default function ChapterListPage() {
  const params = useParams();
  const classId = Array.isArray(params.classId) ? params.classId[0] : (params.classId as string);
  const subjectId = Array.isArray(params.subjectId) ? params.subjectId[0] : (params.subjectId as string);
  const contentType = Array.isArray(params.contentType) ? params.contentType[0] : (params.contentType as string);

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

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <Breadcrumb items={[
        { label: className, href: `/courses/${classId}` },
        { label: subjectName, href: `/courses/${classId}/${subjectId}` },
        { label },
      ]} />

      {/* Header banner */}
      <div className={`rounded-2xl bg-gradient-to-br ${meta.gradient} p-6 mb-6 shadow-lg flex items-center justify-between`}>
        <div>
          <h1 className="text-2xl font-bold text-white">{label}</h1>
          <p className="text-white/80 text-sm mt-1">{subjectName} • {className}</p>
          <p className="text-white/70 text-xs mt-1">{chapters.length} Chapters</p>
        </div>
        <div className="w-12 h-12 rounded-xl bg-white/15 flex items-center justify-center shrink-0">
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>

      <h2 className="text-base font-semibold text-gray-500 mb-3">Chapters</h2>

      {chapters.length === 0 ? (
        <div className="rounded-2xl bg-white p-10 text-center text-gray-400 shadow-sm">
          <BookOpen className="w-10 h-10 mx-auto mb-3 opacity-40" />
          <p className="text-sm">Chapters will be added soon.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {chapters.map((ch, idx) => {
            // "Coming soon" when the chapter has no content of this type yet.
            const isEmpty = (ch.counts?.[contentType] ?? 0) === 0;
            if (isEmpty) {
              return (
                <div key={ch.id} className="flex items-center gap-4 rounded-2xl bg-white p-4 shadow-sm opacity-90 cursor-not-allowed">
                  <div className="w-11 h-11 rounded-xl bg-gray-200 flex items-center justify-center shrink-0 text-gray-400 font-bold">
                    {ch.order || idx + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-400 truncate">{ch.name}</h3>
                    <p className="text-xs text-gray-400 mt-0.5">{label}</p>
                  </div>
                  <span className="rounded-full bg-amber-100 text-amber-700 px-2.5 py-1 text-[11px] font-bold shrink-0">Coming soon</span>
                </div>
              );
            }
            return (
              <Link key={ch.id} href={chapterHref(classId, subjectId, ch.id, contentType)} className="block">
                <div className="flex items-center gap-4 rounded-2xl bg-white p-4 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5 cursor-pointer">
                  <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${meta.gradient} flex items-center justify-center shrink-0 text-white font-bold`}>
                    {ch.order || idx + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-heading truncate">{ch.name}</h3>
                    <p className="text-xs text-gray-500 mt-0.5">{label}</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-300 shrink-0" />
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
