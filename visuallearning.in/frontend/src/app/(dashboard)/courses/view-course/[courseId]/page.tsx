"use client";

import { useEffect, useState, use } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { 
  Atom, Beaker, Microscope, Lightbulb, Zap, Flame, 
  Waves, Cpu, PlayCircle, BookOpen, Clock, ChevronRight,
  Monitor, FileText, Layout
} from "lucide-react";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { PageLoader } from "@/components/ui/loading";
import api from "@/lib/api";

// Map string names to Lucide icons
const iconMap: Record<string, any> = {
  Atom, Lightbulb, Zap, Flame, Waves, Cpu, Beaker, Microscope
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

  return (
    <div className="min-h-screen bg-[#f8fafd] pb-20">
      {/* ── HEADER SECTION ── */}
      <div className="bg-white border-b sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <Breadcrumb items={[{ label: "Courses", href: "/courses" }, { label: course.name }]} />
              <h1 className="text-2xl md:text-3xl font-black text-gray-900 mt-2 tracking-tight">
                {course.name}
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden sm:block text-right mr-2">
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Status</p>
                <p className="text-sm font-bold text-gray-900">Premium Access</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="space-y-16">
          {course.subjects.map((subject: any, sIdx: number) => {
            const SubjectIcon = iconMap[subject.icon] || Atom;
            return (
              <div key={sIdx} className="animate-fade-in" style={{ animationDelay: `${sIdx * 0.1}s` }}>
                {/* Subject Header */}
                <div className="flex items-center gap-4 mb-8">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${subject.color} flex items-center justify-center shadow-xl shadow-blue-500/10`}>
                    <SubjectIcon className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-black text-gray-900 tracking-tight">{subject.name}</h2>
                    <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">{subject.chapters.length} Premium Chapters</p>
                  </div>
                </div>

                {/* Chapters Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {subject.chapters.map((chapter: any) => {
                    const ChapterIcon = iconMap[chapter.icon] || Atom;
                    const classId = chapter.classId;
                    const subjectId = chapter.subjectId;

                    return (
                      <Link 
                        key={chapter.id} 
                        href={`/courses/${classId}/${subjectId}/${chapter.id}?fromCourse=${courseId}`}
                        className="group bg-white rounded-[2rem] border border-gray-100 p-2 shadow-sm hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 flex flex-col h-full"
                      >
                        {/* Chapter Card Content */}
                        <div className="relative aspect-[16/10] rounded-[1.6rem] overflow-hidden bg-gray-900 mb-4">
                          {/* Simulated Thumbnail */}
                          <div className={`absolute inset-0 bg-gradient-to-br ${chapter.gradient} opacity-20`} />
                          <div className="absolute inset-0 flex items-center justify-center">
                            <ChapterIcon className="w-16 h-16 text-white/20 group-hover:scale-125 transition-transform duration-700" />
                          </div>
                          <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
                            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-3 py-1 flex items-center gap-2">
                                <PlayCircle className="w-3.5 h-3.5 text-white" />
                                <span className="text-[10px] font-black text-white uppercase tracking-wider">Start Lesson</span>
                            </div>
                          </div>
                        </div>

                        <div className="px-5 pb-6 flex-1 flex flex-col">
                          <h3 className="text-lg font-black text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
                            {chapter.title}
                          </h3>
                          <p className="text-xs font-bold text-gray-400 mb-4 line-clamp-2">
                            {chapter.desc}
                          </p>
                          
                          <div className="mt-auto pt-4 border-t border-gray-50 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="flex items-center gap-1">
                                <Monitor className="w-3.5 h-3.5 text-gray-300" />
                                <span className="text-[10px] font-black text-gray-400">{chapter.contentCount.videos} Videos</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <FileText className="w-3.5 h-3.5 text-gray-300" />
                                <span className="text-[10px] font-black text-gray-400">{chapter.contentCount.notes} PDFs</span>
                              </div>
                            </div>
                            <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-blue-600 transition-colors">
                              <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-white" />
                            </div>
                          </div>
                        </div>
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
