"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { 
  Atom, Beaker, Microscope, Lightbulb, Zap, Flame, 
  Waves, Cpu, PlayCircle, BookOpen, Clock, ChevronRight,
  Monitor, FileText, Layout
} from "lucide-react";
import { Breadcrumb } from "@/components/ui/breadcrumb";

// Map string names to Lucide icons
const iconMap: Record<string, any> = {
  Atom, Lightbulb, Zap, Flame, Waves, Cpu, Beaker, Microscope
};

const getCourseData = (courseId: string) => {
  const isFoundation = courseId === "foundation-pass";
  const isAcademic = courseId === "academic-plus";
  const isElite = courseId === "elite-learning";
  
  return {
    title: isFoundation ? "Foundation Pass: Physics Essentials" :
           isAcademic ? "Academic Plus: Complete Class 9–10 Physics" :
           isElite ? "Elite Learning: Advanced Physics 11–12" :
           "Complete Physics Masterclass",
    accentColor: isFoundation ? "#60A5FA" : isAcademic ? "#38BDF8" : isElite ? "#D8B4FE" : "#818CF8",
    subjects: [
      {
        name: "Physics",
        icon: "Atom",
        color: "from-blue-500 to-blue-700",
        chapters: [
          { id: 1, title: "Mechanics", desc: "Motion, Forces, Gravitation", icon: "Atom", gradient: "from-blue-500 to-blue-700", progress: 0 },
          { id: 2, title: "Optics", desc: "Light, Lenses, Mirrors", icon: "Lightbulb", gradient: "from-amber-500 to-amber-700", progress: 0 },
          { id: 3, title: "Electricity", desc: "Current, Circuits, EMF", icon: "Zap", gradient: "from-indigo-500 to-indigo-700", progress: 0 },
        ]
      },
      {
        name: "Chemistry",
        icon: "Beaker",
        color: "from-emerald-500 to-emerald-700",
        chapters: [
          { id: 4, title: "Atomic Structure", desc: "Electrons, Protons, Neutrons", icon: "Cpu", gradient: "from-emerald-500 to-emerald-700", progress: 0 },
          { id: 5, title: "Chemical Bonding", desc: "Ionic & Covalent Bonds", icon: "Zap", gradient: "from-teal-500 to-teal-700", progress: 0 },
          { id: 6, title: "Thermodynamics", desc: "Heat, Energy, Entropy", icon: "Flame", gradient: "from-rose-500 to-rose-700", progress: 0 },
        ]
      },
      {
        name: "Biology",
        icon: "Microscope",
        color: "from-rose-500 to-rose-700",
        chapters: [
          { id: 7, title: "Cell Biology", desc: "Structure and Function", icon: "Microscope", gradient: "from-rose-500 to-rose-700", progress: 0 },
          { id: 8, title: "Genetics", desc: "Heredity and Variation", icon: "Atom", gradient: "from-pink-500 to-pink-700", progress: 0 },
          { id: 9, title: "Waves", desc: "Sound, EM Waves", icon: "Waves", gradient: "from-cyan-500 to-cyan-700", progress: 0 },
        ]
      }
    ]
  };
};

export default function CourseContentPage() {
  const params = useParams();
  const courseId = params?.courseId as string || "default";
  const data = getCourseData(courseId);

  return (
    <div className="min-h-screen bg-[#f8fafd] pb-20">
      {/* ── HEADER SECTION ── */}
      <div className="bg-white border-b sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <Breadcrumb items={[{ label: "Courses", href: "/courses" }, { label: data.title }]} />
              <h1 className="text-2xl md:text-3xl font-black text-gray-900 mt-2 tracking-tight">
                {data.title}
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden sm:block text-right mr-2">
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Total Progress</p>
                <p className="text-sm font-bold text-gray-900">0% Complete</p>
              </div>
              <div className="w-32 h-2 bg-gray-100 rounded-full overflow-hidden hidden sm:block">
                <div className="h-full bg-blue-500 w-0" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="space-y-16">
          {data.subjects.map((subject, sIdx) => {
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
                  {subject.chapters.map((chapter) => {
                    const ChapterIcon = iconMap[chapter.icon] || Atom;
                    return (
                      <Link 
                        key={chapter.id} 
                        href={`/courses/${courseId}/${subject.name.toLowerCase()}/${chapter.id}`}
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
                                <span className="text-[10px] font-black text-gray-400">3D Lab</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <FileText className="w-3.5 h-3.5 text-gray-300" />
                                <span className="text-[10px] font-black text-gray-400">PDF Notes</span>
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
        </div>
      </div>
    </div>
  );
}
