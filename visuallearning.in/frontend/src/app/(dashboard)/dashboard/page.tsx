"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import api from "@/lib/api";
import {
  BookOpen, CreditCard, PlayCircle, Radio, Users, Clock,
  Beaker, Atom, MonitorPlay, PenTool, ClipboardList, FlaskConical, Eye,
  Crown, ArrowRight, Sparkles, AlertCircle, Layout, CheckCircle2, Zap,
  Search, Bookmark, Star, Info
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageLoader } from "@/components/ui/loading";
import type { Subscription } from "@/types";

const planMapping: Record<string, string> = {
  "Foundation Pass": "foundation-pass",
  "Academic Plus": "academic-plus",
  "Elite Learning": "elite-learning",
  "FlexiLearn": "flexilearn",
  "FLEXI_PLAN": "my-custom-plan"
};

export default function DashboardPage() {
  const { user, isAuthenticated } = useAuth();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const { data } = await api.get("/subscription/my-subscription");
        setSubscription(data.data);
      } catch (err) {
        console.error("Failed to load dashboard data", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const isActive = subscription?.status === "ACTIVE" && new Date(subscription.expiryDate) > new Date();
  const daysLeft = isActive ? Math.ceil((new Date(subscription!.expiryDate).getTime() - Date.now()) / 86400000) : 0;

  if (loading) return <PageLoader />;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* ── GREETING ── */}
      <div className="mb-12">
        <h1 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight">
          Hello, <span className="text-blue-600">{user?.name?.split(" ")[0]}!</span>
        </h1>
        <p className="text-gray-500 font-bold mt-1 text-sm md:text-base uppercase tracking-wider">Welcome to your Science Dashboard</p>
      </div>

      {/* ── COURSE ACCESS CARD ── */}
      <div className="mb-16">
        <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full glass mb-8">
          <Layout className="w-4 h-4 text-primary" />
          <span className="text-[11px] text-text-muted font-black uppercase tracking-widest">Enrollment Status</span>
        </div>

        {isActive ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1">
              <ActiveCourseCard 
                subscription={subscription!} 
                daysLeft={daysLeft}
              />
            </div>
            <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4 h-fit">
              {/* Quick Stats Cards */}
              <DashboardStatCard 
                icon={BookOpen} 
                title="Curriculum" 
                value="Class 9-12 Physics" 
                desc="Comprehensive 3D Learning"
                color="blue"
              />
              <DashboardStatCard 
                icon={MonitorPlay} 
                title="Learning Resource" 
                value="64+ Virtual Labs" 
                desc="Interactive Simulations"
                color="purple"
              />
              <DashboardStatCard 
                icon={PenTool} 
                title="Study Material" 
                value="PDF Notes & Formulae" 
                desc="Chapter-wise Downloads"
                color="emerald"
              />
              <DashboardStatCard 
                icon={Zap} 
                title="Active Path" 
                value="Animated Lessons" 
                desc="Concept Visualization"
                color="orange"
              />
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-[3rem] border-2 border-dashed border-gray-200 p-8 md:p-16 text-center shadow-sm">
            <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-8">
              <AlertCircle className="w-12 h-12 text-red-400" />
            </div>
            <h2 className="text-3xl font-black text-gray-900 mb-4 tracking-tight">No course active on your account</h2>
            <p className="text-gray-500 font-medium max-w-md mx-auto mb-10 text-lg">
              Unlock the full potential of 3D science learning by subscribing to a plan.
            </p>
            <Link href="/courses">
              <Button className="px-10 py-8 text-lg font-black bg-blue-600 hover:bg-blue-700 text-white rounded-[1.5rem] shadow-xl shadow-blue-500/20 transition-all hover:scale-[1.02]">
                View All Courses & Plans <ArrowRight className="w-6 h-6 ml-3" />
              </Button>
            </Link>
          </div>
        )}
      </div>

      {/* ── ADDITIONAL STATS (ONLY IF ACTIVE) ── */}
      {isActive && (
        <div className="bg-gray-900 rounded-[2.5rem] p-8 md:p-12 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-blue-500/10 to-transparent pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="space-y-4 text-center md:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/10">
                <Sparkles className="w-4 h-4 text-yellow-400" />
                <span className="text-[10px] font-black uppercase tracking-widest text-white/80">Premium Experience</span>
              </div>
              <h2 className="text-2xl md:text-3xl font-black tracking-tight">Ready to master science today?</h2>
              <p className="text-white/50 font-medium">Dive into your chapter lessons and virtual experiments.</p>
            </div>
            <Link href={subscription?.plan === "FLEXI_PLAN" ? "/courses/my-custom-plan" : `/courses/view-course/${planMapping[subscription!.plan] || 'foundation-pass'}`}>
              <Button className="bg-white text-black hover:bg-white/90 font-black px-8 py-7 rounded-2xl shadow-2xl">
                Go To Classroom <MonitorPlay className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

function ActiveCourseCard({ subscription, daysLeft }: { subscription: any; daysLeft: number }) {
  const plan = subscription.plan;
  const slug = planMapping[plan] || "foundation-pass";
  
  return (
    <div className="relative group rounded-[2.5rem] overflow-hidden bg-white border border-gray-100 shadow-2xl h-full flex flex-col ring-1 ring-black/5">
      {/* Gradient Header */}
      <div className={`h-48 relative overflow-hidden flex items-center justify-center ${
        plan === "Elite Learning" ? "bg-gradient-to-br from-indigo-900 to-purple-900" :
        plan === "Academic Plus" ? "bg-gradient-to-br from-blue-900 to-indigo-900" :
        "bg-gradient-to-br from-slate-900 to-blue-900"
      }`}>
        <div className="absolute inset-0 bg-grid-white opacity-10 pointer-events-none" />
        <div className="relative z-10 text-center">
          <div className="w-16 h-16 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-2xl">
             <Crown className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-xl font-black text-white uppercase tracking-wider">{plan}</h3>
        </div>
        <div className="absolute bottom-4 right-4">
           <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 font-black text-[9px] py-1">
             ACTIVE
           </Badge>
        </div>
      </div>

      <div className="p-8 flex-1 flex flex-col">
        <div className="flex items-center justify-between mb-8">
           <div className="space-y-1">
             <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Valid Until</p>
             <p className="text-sm font-bold text-gray-900">{new Date(subscription.expiryDate).toLocaleDateString('en-IN', { dateStyle: 'long' })}</p>
           </div>
           <div className="text-right space-y-1">
             <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Access</p>
             <p className="text-sm font-bold text-gray-900">{daysLeft} Days Left</p>
           </div>
        </div>

        <Link href={subscription.plan === "FLEXI_PLAN" ? "/courses/my-custom-plan" : `/courses/view-course/${slug}`} className="mt-auto">
          <Button className="w-full py-7 text-sm font-black bg-blue-600 hover:bg-blue-700 text-white rounded-2xl shadow-xl shadow-blue-500/20 transition-all hover:scale-[1.02]">
            Go To Course <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </Link>
      </div>
    </div>
  );
}

function DashboardStatCard({ icon: Icon, title, value, desc, color }: any) {
  const colors: any = {
    blue: "bg-blue-50 text-blue-600 border-blue-100",
    purple: "bg-purple-50 text-purple-600 border-purple-100",
    emerald: "bg-emerald-50 text-emerald-600 border-emerald-100",
    orange: "bg-orange-50 text-orange-600 border-orange-100"
  };
  return (
    <div className={`p-6 rounded-[2rem] border bg-white shadow-sm flex items-start gap-4 hover:shadow-md transition-shadow`}>
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${colors[color]}`}>
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{title}</p>
        <h4 className="text-sm font-black text-gray-900 mb-0.5">{value}</h4>
        <p className="text-[11px] text-gray-500 font-medium">{desc}</p>
      </div>
    </div>
  );
}
