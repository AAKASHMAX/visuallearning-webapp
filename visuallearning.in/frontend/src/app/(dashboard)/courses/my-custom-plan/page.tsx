"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PageLoader } from "@/components/ui/loading";
import api from "@/lib/api";
import { AnimatedChapterCard } from "@/app/(dashboard)/courses/_components/animated-chapter-card";
import { 
  BookOpen, Video, FileText, Layout, 
  ArrowRight, Sparkles, Star, ChevronRight,
  Atom, Lightbulb, Zap, Flame, Waves, Cpu, GraduationCap, Crown, Beaker, Microscope
} from "lucide-react";
import toast from "react-hot-toast";

// Map string names to Lucide icons
const iconMap: Record<string, any> = {
  Atom, Lightbulb, Zap, Flame, Waves, Cpu, GraduationCap, Crown, Beaker, Microscope
};

const getSubjectColor = (name: string) => {
  const n = name.toLowerCase();
  if (n.includes("physics")) return "from-blue-500 to-blue-700";
  if (n.includes("chemistry")) return "from-emerald-500 to-emerald-700";
  if (n.includes("biology")) return "from-rose-500 to-rose-700";
  return "from-primary to-primary-dark";
};

export default function MyCustomPlan() {
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState<any>(null);
  const [curriculum, setCurriculum] = useState<any[]>([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const { data: subRes } = await api.get("/subscription/my-subscription");
        const sub = subRes.data;
        setSubscription(sub);

        if (!sub || sub.plan !== "FLEXI_PLAN" || !sub.subjectsAccess) {
          setLoading(false);
          return;
        }

        // Fetch all classes and filter
        const { data: classRes } = await api.get("/courses/pricing/subjects");
        const allClasses = classRes.data;
        
        const filtered = allClasses.map((cls: any) => ({
          ...cls,
          subjects: cls.subjects.filter((s: any) => sub.subjectsAccess.includes(s.id))
        })).filter((cls: any) => cls.subjects.length > 0);

        const detailedData = await Promise.all(filtered.map(async (cls: any) => {
           const subjectsWithChapters = await Promise.all(cls.subjects.map(async (sub: any) => {
              const { data: subDetails } = await api.get(`/courses/subjects/${sub.id}/chapters`);
              return { ...sub, chapters: subDetails.data.chapters };
           }));
           return { ...cls, subjects: subjectsWithChapters };
        }));

        setCurriculum(detailedData);
      } catch (err) {
        toast.error("Failed to load your custom plan");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) return <PageLoader />;

  if (!subscription || subscription.plan !== "FLEXI_PLAN") {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
        <Layout className="w-16 h-16 text-white/10 mb-6" />
        <h2 className="text-2xl font-black text-white mb-2">No Custom Plan Found</h2>
        <p className="text-white/50 mb-8 max-w-sm">It looks like you don&apos;t have an active customized learning plan.</p>
        <Link href="/courses">
          <Button className="bg-primary hover:bg-[#04A9C4] rounded-2xl px-8">Browse Plans</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-12">
        <div className="flex items-center gap-2 text-primary mb-2">
          <Sparkles className="w-4 h-4" />
          <span className="text-[10px] font-black uppercase tracking-widest">Your Personalized Classroom</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">
          Customized <span className="text-primary">Learning Path</span>
        </h1>
        <p className="text-white/40 mt-2 font-bold uppercase tracking-widest text-xs">
          Exclusive access to {subscription.subjectsAccess?.length || 0} selected subjects
        </p>
      </div>

      {/* Subject Grid */}
      <div className="space-y-16">
        {curriculum.map((cls) => (
          <div key={cls.id} className="space-y-10">
            <div className="flex items-center gap-4">
              <div className="h-px flex-1 bg-white/5" />
              <h3 className="text-xl font-black text-white/50 uppercase tracking-widest">{cls.name}</h3>
              <div className="h-px flex-1 bg-white/5" />
            </div>

            {cls.subjects.map((sub: any) => {
              const SubjectIcon = iconMap[sub.icon] || Atom;
              const subColor = getSubjectColor(sub.name);

              return (
                <div key={sub.id} className="space-y-8">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${subColor} flex items-center justify-center shadow-2xl`}>
                      <SubjectIcon className="w-6 h-6 text-white" />
                    </div>
                    <h4 className="text-2xl font-black text-white">{sub.name}</h4>
                  </div>
                  
                  <div className="physics-chapter-grid">
                    {sub.chapters?.map((chapter: any, index: number) => <AnimatedChapterCard key={chapter.id} name={chapter.name} order={chapter.order || index + 1} animationKey={chapter.animationKey} href={`/courses/${cls.id}/${sub.id}/${chapter.id}`} resourceLabel="Explore chapter" />)}
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* Upgrade Callout */}
      <div className="mt-20 p-12 rounded-[3rem] bg-gradient-to-br from-primary/10 to-transparent border border-primary/20 flex flex-col md:flex-row items-center justify-between gap-8">
        <div>
          <h3 className="text-2xl font-black text-white mb-2">Want to explore more?</h3>
          <p className="text-white/50 max-w-md">Upgrade to Elite Learning for full access to all classes, 64+ Virtual Labs, and priority support.</p>
        </div>
        <Link href="/courses">
          <Button className="bg-white text-black hover:bg-white/90 font-black px-10 py-7 rounded-2xl shadow-2xl">
            Upgrade Plan <Star className="w-4 h-4 ml-2 text-yellow-500" />
          </Button>
        </Link>
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
    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
}
