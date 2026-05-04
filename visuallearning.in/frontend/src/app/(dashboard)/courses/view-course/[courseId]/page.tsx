"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Atom, Beaker, Microscope, Lightbulb, Zap, Flame,
  Waves, Cpu, PlayCircle, ChevronRight,
  Monitor, FileText, Layout, BookOpen
} from "lucide-react";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { PageLoader } from "@/components/ui/loading";
import api from "@/lib/api";

const iconMap: Record<string, any> = {
  Atom, Lightbulb, Zap, Flame, Waves, Cpu, Beaker, Microscope, BookOpen
};

const subjectStyle = (name: string) => {
  const n = name.toLowerCase();
  if (n.includes("physics"))   return { gradient: "from-blue-500 to-indigo-600", light: "bg-blue-50", text: "text-blue-700", ring: "ring-blue-500/20", accent: "#3b82f6" };
  if (n.includes("chemistry")) return { gradient: "from-emerald-500 to-teal-600", light: "bg-emerald-50", text: "text-emerald-700", ring: "ring-emerald-500/20", accent: "#10b981" };
  if (n.includes("biology"))   return { gradient: "from-rose-500 to-pink-600", light: "bg-rose-50", text: "text-rose-700", ring: "ring-rose-500/20", accent: "#f43f5e" };
  return { gradient: "from-violet-500 to-purple-600", light: "bg-violet-50", text: "text-violet-700", ring: "ring-violet-500/20", accent: "#8b5cf6" };
};

export default function CourseContentPage({ params }: { params: { courseId: string } }) {
  const { courseId } = params;
  const [course, setCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCourse() {
      setLoading(true);
      try {
        const { data } = await api.get(`/courses/course-content/${courseId}`);
        setCourse(data.data);
      } catch (err) {
        console.error("Failed to fetch course content", err);
      } finally {
        setLoading(false);
      }
    }
    fetchCourse();
  }, [courseId]);

  if (loading) return <PageLoader />;
  if (!course) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-xl font-bold mb-2">Course not found</h2>
        <Link href="/courses" className="text-primary hover:underline">Back to all courses</Link>
      </div>
    </div>
  );

  const accentColor = course.accentColor || "#3b82f6";

  return (
    <div className="min-h-screen bg-[#f8fafd] pb-20">
      {/* ── HEADER ── */}
      <div className="border-b sticky top-0 z-30 backdrop-blur-xl bg-white/80">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <Breadcrumb items={[{ label: "Courses", href: "/courses" }, { label: course.name }]} />
              <h1 className="text-xl md:text-2xl font-black text-gray-900 mt-1 tracking-tight">
                {course.name}
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border" style={{ color: accentColor, borderColor: `${accentColor}30`, backgroundColor: `${accentColor}08` }}>
                Premium Access
              </span>
              <div className="w-2.5 h-2.5 rounded-full animate-pulse" style={{ backgroundColor: accentColor }} />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="space-y-12">
          {course.subjects.map((subject: any, sIdx: number) => {
            const SubjectIcon = iconMap[subject.icon] || Atom;
            const style = subjectStyle(subject.name);
            return (
              <div key={sIdx}>
                {/* Subject Header */}
                <div className="flex items-center gap-3 mb-5">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${style.gradient} flex items-center justify-center shadow-lg`}>
                    <SubjectIcon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-gray-900 tracking-tight">{subject.name}</h2>
                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">{subject.chapters.length} chapters</p>
                  </div>
                </div>

                {/* Chapters Grid — compact cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                  {subject.chapters.map((chapter: any, cIdx: number) => {
                    const ChapterIcon = iconMap[chapter.icon] || Atom;
                    const classId = chapter.classId;
                    const subjectId = chapter.subjectId;

                    return (
                      <Link
                        key={chapter.id}
                        href={`/courses/${classId}/${subjectId}/${chapter.id}?fromCourse=${courseId}`}
                        className={`group relative bg-white rounded-2xl border border-gray-100 hover:border-gray-200 p-4 hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 flex items-start gap-3.5`}
                      >
                        {/* Icon */}
                        <div className={`shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br ${style.gradient} flex items-center justify-center shadow-sm group-hover:shadow-md group-hover:scale-105 transition-all`}>
                          <ChapterIcon className="w-5 h-5 text-white" />
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-bold text-gray-900 leading-snug mb-1 group-hover:text-gray-700 transition-colors line-clamp-2">
                            {chapter.title}
                          </h3>
                          <div className="flex items-center gap-2.5 text-[10px] font-semibold text-gray-400">
                            {chapter.contentCount.videos > 0 && (
                              <span className="flex items-center gap-0.5">
                                <PlayCircle className="w-3 h-3" />
                                {chapter.contentCount.videos}
                              </span>
                            )}
                            {chapter.contentCount.notes > 0 && (
                              <span className="flex items-center gap-0.5">
                                <FileText className="w-3 h-3" />
                                {chapter.contentCount.notes}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Arrow */}
                        <ChevronRight className="w-4 h-4 text-gray-200 group-hover:text-gray-400 shrink-0 mt-1 transition-colors" />
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
          {course.subjects.length === 0 && (
            <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
               <Layout className="w-12 h-12 text-gray-300 mx-auto mb-4" />
               <p className="text-gray-500 font-bold">This course content is being prepared. Stay tuned!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
