"use client";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PageLoader } from "@/components/ui/loading";
import api from "@/lib/api";
import { 
  CheckCircle2, ArrowRight, Zap, 
  BookOpen, Video, FileText, HelpCircle, Layout,
  Atom, Lightbulb, Flame, Waves, Cpu, GraduationCap, Crown, Beaker, Microscope, PlayCircle
} from "lucide-react";
import toast from "react-hot-toast";

// Map string names to Lucide icons
const iconMap: Record<string, any> = {
  Atom, Lightbulb, Zap, Flame, Waves, Cpu, GraduationCap, Crown, Beaker, Microscope
};

const getSubjectTheme = (name: string) => {
  const n = name.toLowerCase();
  if (n.includes("physics")) return {
    headerGrad: "from-blue-500 to-blue-700",
    bg: "from-sky-50 to-blue-50",
    border: "border-sky-100",
    iconGrad: "from-sky-400 to-blue-600",
    ring: "ring-sky-300",
    priceColor: "text-sky-600",
    subtitleColor: "text-sky-400",
    badgeBg: "bg-sky-100",
    badgeText: "text-sky-600",
  };
  if (n.includes("chemistry")) return {
    headerGrad: "from-emerald-500 to-emerald-700",
    bg: "from-emerald-50 to-teal-50",
    border: "border-emerald-100",
    iconGrad: "from-emerald-400 to-teal-500",
    ring: "ring-emerald-300",
    priceColor: "text-emerald-600",
    subtitleColor: "text-emerald-400",
    badgeBg: "bg-emerald-100",
    badgeText: "text-emerald-700",
  };
  if (n.includes("biology")) return {
    headerGrad: "from-rose-500 to-rose-700",
    bg: "from-rose-50 to-pink-50",
    border: "border-rose-100",
    iconGrad: "from-rose-400 to-fuchsia-500",
    ring: "ring-rose-300",
    priceColor: "text-rose-500",
    subtitleColor: "text-rose-400",
    badgeBg: "bg-rose-100",
    badgeText: "text-rose-600",
  };
  return {
    headerGrad: "from-violet-500 to-purple-700",
    bg: "from-violet-50 to-purple-50",
    border: "border-violet-100",
    iconGrad: "from-violet-400 to-purple-600",
    ring: "ring-violet-300",
    priceColor: "text-violet-600",
    subtitleColor: "text-violet-400",
    badgeBg: "bg-violet-100",
    badgeText: "text-violet-700",
  };
};

export default function CustomPlanPreview() {
  const searchParams = useSearchParams();
  const subjectIds = searchParams.get("subjects")?.split(",") || [];
  
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any[]>([]);
  const [totalPrice, setTotalPrice] = useState(0);

  useEffect(() => {
    if (subjectIds.length === 0) {
      setLoading(false);
      return;
    }

    const loadData = async () => {
      try {
        const { data: res } = await api.get("/courses/pricing/subjects");
        const allClasses = res.data;
        
        const filtered = allClasses.map((cls: any) => ({
          ...cls,
          subjects: cls.subjects.filter((s: any) => subjectIds.includes(s.id))
        })).filter((cls: any) => cls.subjects.length > 0);

        // Fetch detailed chapters for these subjects
        const detailedData = await Promise.all(filtered.map(async (cls: any) => {
           const subjectsWithChapters = await Promise.all(cls.subjects.map(async (sub: any) => {
              const { data: subDetails } = await api.get(`/courses/subjects/${sub.id}/chapters`);
              return { ...sub, chapters: subDetails.data.chapters };
           }));
           return { ...cls, subjects: subjectsWithChapters };
        }));

        setData(detailedData);
        setTotalPrice(filtered.reduce((sum: number, cls: any) => 
          sum + cls.subjects.reduce((sSum: number, s: any) => sSum + s.price, 0), 0)
        );
      } catch (err) {
        toast.error("Failed to load custom plan details");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) return <PageLoader />;

  if (subjectIds.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
        <Layout className="w-16 h-16 text-white/10 mb-6" />
        <h2 className="text-2xl font-black text-white mb-2">No Subjects Selected</h2>
        <p className="text-white/50 mb-8 max-w-sm">Please go back to the library and select the subjects you want to include in your custom plan.</p>
        <Link href="/courses">
          <Button variant="outline" className="rounded-2xl px-8">Back to Library</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      {/* Hero Section */}
      <div className="relative rounded-[3rem] overflow-hidden bg-gradient-to-br from-[#162855] to-[#0A1025] p-12 mb-12 border border-white/5">
        <div className="absolute inset-0 bg-grid-white opacity-5 pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/20 border border-primary/30 mb-6">
              <Zap className="w-4 h-4 text-primary" />
              <span className="text-[10px] font-black text-white uppercase tracking-widest">Customized Learning Path</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-white mb-6 leading-tight">
              Your Tailored <span className="text-primary">Curriculum</span>
            </h1>
            <p className="text-white/60 text-lg mb-8">
              Based on your selection, we&apos;ve curated {subjectIds.length} subjects across {data.length} classes. Unlock full access to these and start learning today.
            </p>
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-xl border border-white/5">
                <Video className="w-4 h-4 text-primary" />
                <span className="text-xs font-bold text-white/80">3D Animated Videos</span>
              </div>
              <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-xl border border-white/5">
                <FileText className="w-4 h-4 text-primary" />
                <span className="text-xs font-bold text-white/80">Premium Notes</span>
              </div>
              <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-xl border border-white/5">
                <HelpCircle className="w-4 h-4 text-primary" />
                <span className="text-xs font-bold text-white/80">Practice Quizzes</span>
              </div>
            </div>
          </div>

          <div className="glass-morphism p-8 rounded-[2.5rem] border border-white/10 w-full md:w-80 text-center">
             <span className="text-[10px] font-black text-white/40 uppercase tracking-widest block mb-1">One-time Investment</span>
             <div className="text-5xl font-black text-white mb-6">₹{totalPrice}</div>
             <Link href={`/subscription?plan=FLEXI_PLAN&subjects=${subjectIds.join(",")}&billing=yearly`}>
               <Button className="w-full py-7 rounded-2xl font-black text-sm shadow-2xl shadow-primary/20 bg-primary hover:bg-[#04A9C4] text-white">
                 Unlock All Content <ArrowRight className="w-4 h-4 ml-2" />
               </Button>
             </Link>
             <p className="mt-4 text-[10px] text-white/30 font-bold uppercase tracking-widest">Secure Payment via Razorpay</p>
          </div>
        </div>
      </div>

      {/* Curriculum Preview */}
      <div className="space-y-16">
        <h2 className="text-3xl font-black text-white mb-12 tracking-tight flex items-center gap-3">
          <BookOpen className="w-8 h-8 text-primary" /> 
          Course <span className="text-primary">Content</span>
        </h2>

        {data.map((cls) => (
          <div key={cls.id} className="space-y-8">
            <div className="flex items-center gap-4">
              <div className="h-px flex-1 bg-white/10" />
              <h3 className="text-xl font-black text-white/50 uppercase tracking-widest">{cls.name}</h3>
              <div className="h-px flex-1 bg-white/10" />
            </div>

            {cls.subjects.map((sub: any) => {
              const SubjectIcon = iconMap[sub.icon] || Atom;
              const theme = getSubjectTheme(sub.name);

              return (
                <div key={sub.id} className="space-y-4">
                  {/* Subject header */}
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${theme.iconGrad} flex items-center justify-center shadow-md`}>
                      <SubjectIcon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h4 className={`text-xl font-black ${theme.priceColor} leading-tight`}>{sub.name}</h4>
                      <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">{sub.chapters?.length ?? 0} chapters included</p>
                    </div>
                  </div>

                  {/* Chapter cards */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                    {sub.chapters?.map((ch: any) => {
                      const ChapterIcon = iconMap[ch.icon] || SubjectIcon;
                      return (
                        <Link
                          key={ch.id}
                          href={`/courses/${cls.id}/${sub.id}/${ch.id}?returnTo=${encodeURIComponent(`/courses/custom-plan?subjects=${subjectIds.join(",")}`)}`}
                          className="group flex flex-col items-center text-center bg-white rounded-xl border border-gray-200 p-3.5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 cursor-pointer"
                        >
                          {/* Icon */}
                          <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${theme.iconGrad} flex items-center justify-center shadow-md mb-2.5 group-hover:scale-105 transition-transform duration-300`}>
                            <ChapterIcon className="w-5 h-5 text-white drop-shadow" />
                          </div>

                          {/* Chapter name */}
                          <h5 className="text-[12px] font-black text-heading leading-snug mb-1">
                            {ch.name}
                          </h5>

                          {/* Subtitle */}
                          <p className="text-[10px] text-text-muted leading-snug">
                            Comprehensive lessons for{" "}
                            <span className={theme.priceColor}>{ch.name}</span>
                          </p>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

function Badge({ children, variant = "default", className = "" }: any) {
  const variants: any = {
    default: "bg-white/10 text-white",
    info: "bg-primary/20 text-primary border border-primary/30",
  };
  return (
    <span className={`px-3 py-1 rounded-full ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
}
