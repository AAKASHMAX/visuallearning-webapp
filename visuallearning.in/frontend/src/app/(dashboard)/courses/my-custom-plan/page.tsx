"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PageLoader } from "@/components/ui/loading";
import api from "@/lib/api";
import { 
  BookOpen, Video, FileText, Layout, 
  ArrowRight, Sparkles, Star, ChevronRight
} from "lucide-react";
import toast from "react-hot-toast";

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
      <div className="space-y-12">
        {curriculum.map((cls) => (
          <div key={cls.id} className="space-y-6">
            <div className="flex items-center gap-4">
              <h3 className="text-xl font-black text-white/90">{cls.name}</h3>
              <div className="h-px flex-1 bg-white/5" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {cls.subjects.map((sub: any) => (
                <div key={sub.id} className="group glass rounded-[2.5rem] border border-white/5 overflow-hidden hover:border-primary/30 transition-all duration-500 hover:-translate-y-1">
                  <div className="p-8">
                    <div className="flex items-center justify-between mb-6">
                      <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20 group-hover:bg-primary group-hover:text-white transition-colors">
                        <BookOpen className="w-6 h-6" />
                      </div>
                      <Badge variant="info">{sub.chapters?.length || 0} Chapters</Badge>
                    </div>
                    
                    <h4 className="text-xl font-black text-white mb-2">{sub.name}</h4>
                    <p className="text-white/40 text-sm mb-6 line-clamp-2">Master all concepts of {sub.name} with 3D visualizations and interactive labs.</p>
                    
                    <div className="space-y-3 mb-8">
                      {sub.chapters?.slice(0, 3).map((ch: any) => (
                        <Link key={ch.id} href={`/courses/${cls.id}/${sub.id}/${ch.id}`} className="flex items-center justify-between text-xs font-bold text-white/60 hover:text-primary transition-colors group/item">
                          <span className="truncate mr-2">{ch.name}</span>
                          <ChevronRight className="w-3 h-3 group-hover/item:translate-x-1 transition-transform" />
                        </Link>
                      ))}
                    </div>

                    <Link href={`/courses/${cls.id}/${sub.id}/${sub.chapters?.[0]?.id || ''}`}>
                      <Button className="w-full py-6 rounded-2xl font-black text-[10px] uppercase tracking-widest bg-white/5 hover:bg-primary border border-white/10 hover:border-primary text-white transition-all">
                        Resume Learning <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
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
