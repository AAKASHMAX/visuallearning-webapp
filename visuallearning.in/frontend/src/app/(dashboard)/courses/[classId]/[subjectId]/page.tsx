"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { PageLoader } from "@/components/ui/loading";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import api from "@/lib/api";
import { Sparkles, GraduationCap, FileText, BookMarked, HelpCircle, ClipboardList, ChevronRight, type LucideIcon } from "lucide-react";

interface ContentType {
  slug: string;
  title: string;
  subtitle: string;
  icon: LucideIcon;
  gradient: string;
  badge: string;
}

export default function SubjectContentTypesPage() {
  const params = useParams();
  const classId = Array.isArray(params.classId) ? params.classId[0] : (params.classId as string);
  const subjectId = Array.isArray(params.subjectId) ? params.subjectId[0] : (params.subjectId as string);

  const [subjectName, setSubjectName] = useState("");
  const [className, setClassName] = useState("");
  const [chapterCount, setChapterCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/courses/subjects/${subjectId}/chapters`).then(({ data }) => {
      const d = data.data;
      setSubjectName(d.subject.name);
      setClassName(d.subject.class?.name || "");
      setChapterCount((d.chapters || []).length);
    }).catch(() => {}).finally(() => setLoading(false));
  }, [subjectId]);

  if (loading) return <PageLoader />;

  // Classes 10 & 12 = board papers; 9 & 11 = important questions.
  const hasBoardPapers = className.includes("10") || className.includes("12");

  const contentTypes: ContentType[] = [
    { slug: "animation", title: "3D Animated Videos", subtitle: "Visual learning with animations", icon: Sparkles, gradient: "from-violet-500 to-purple-600", badge: "bg-violet-100 text-violet-700" },
    { slug: "lecture", title: "Lecture Videos", subtitle: "Concept lectures by expert teachers", icon: GraduationCap, gradient: "from-sky-500 to-blue-600", badge: "bg-sky-100 text-sky-700" },
    { slug: "notes", title: "Notes", subtitle: "Chapter-wise study notes", icon: FileText, gradient: "from-emerald-500 to-green-600", badge: "bg-emerald-100 text-emerald-700" },
    { slug: "ncert", title: "NCERT Solution", subtitle: "Step-by-step textbook answers", icon: BookMarked, gradient: "from-sky-500 to-cyan-600", badge: "bg-sky-100 text-sky-700" },
    hasBoardPapers
      ? { slug: "pyq", title: "PYQs", subtitle: "Previous year questions", icon: ClipboardList, gradient: "from-pink-500 to-rose-700", badge: "bg-pink-100 text-pink-700" }
      : { slug: "important", title: "Important Questions", subtitle: "Practice questions", icon: ClipboardList, gradient: "from-pink-500 to-rose-700", badge: "bg-pink-100 text-pink-700" },
    { slug: "quiz", title: "Quiz", subtitle: "Test your knowledge", icon: HelpCircle, gradient: "from-orange-500 to-amber-600", badge: "bg-orange-100 text-orange-700" },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <Breadcrumb items={[
        { label: className, href: `/courses/${classId}` },
        { label: subjectName },
      ]} />

      {/* Header banner */}
      <div className="rounded-2xl bg-gradient-to-br from-primary to-[#2a4a8a] p-6 mb-6 shadow-lg">
        <h1 className="text-2xl font-bold text-white">{subjectName}</h1>
        <p className="text-white/80 text-sm mt-1">{className}</p>
        <p className="text-white/70 text-xs mt-1">{chapterCount} Chapters available</p>
      </div>

      <h2 className="text-base font-semibold text-gray-500 mb-3">Choose content type</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {contentTypes.map((ct) => {
          const Icon = ct.icon;
          return (
            <Link key={ct.slug} href={`/courses/${classId}/${subjectId}/type/${ct.slug}`}>
              <div className="flex items-center gap-4 rounded-2xl bg-white p-3.5 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5 cursor-pointer">
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${ct.gradient} flex items-center justify-center shrink-0`}>
                  <Icon className="w-7 h-7 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-heading">{ct.title}</h3>
                  <p className="text-sm text-gray-500">{ct.subtitle}</p>
                </div>
                <span className={`rounded-full px-2.5 py-1 text-xs font-semibold shrink-0 ${ct.badge}`}>{chapterCount} ch</span>
                <ChevronRight className="w-5 h-5 text-gray-300 shrink-0" />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
