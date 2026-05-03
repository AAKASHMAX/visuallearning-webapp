"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import api from "@/lib/api";
import {
  BookOpen, CreditCard, PlayCircle, Radio, Users, Clock,
  Beaker, Atom, MonitorPlay, PenTool, ClipboardList, FlaskConical, Eye,
  Crown, ArrowRight, Sparkles, AlertCircle, Layout, CheckCircle2, Zap,
  Search, Bookmark, Star, Info,
  GraduationCap, Layers, ChevronRight, FlaskRound
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageLoader } from "@/components/ui/loading";
import type { Subscription, ClassItem } from "@/types";

const iconMap: Record<string, any> = {
  Atom, FlaskConical, FlaskRound, Beaker, GraduationCap, Layers, BookOpen, Zap, Crown, Sparkles
};

function subjectTheme(name: string) {
  const n = name.toLowerCase();
  if (n.includes("physics"))   return { grad: "from-sky-500 to-blue-600",    bg: "bg-sky-50",    text: "text-sky-700",    border: "border-sky-200" };
  if (n.includes("chemistry")) return { grad: "from-emerald-500 to-teal-600", bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200" };
  if (n.includes("biology"))   return { grad: "from-rose-500 to-pink-600",    bg: "bg-rose-50",   text: "text-rose-700",   border: "border-rose-200" };
  if (n.includes("math"))      return { grad: "from-violet-500 to-purple-600", bg: "bg-violet-50", text: "text-violet-700", border: "border-violet-200" };
  return                              { grad: "from-primary to-primary-dark", bg: "bg-primary/10", text: "text-primary",   border: "border-primary/20" };
}

interface SubjectInfo {
  subjectId: string;
  subjectName: string;
  classId: string;
  className: string;
  icon?: string;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [allClasses, setAllClasses] = useState<ClassItem[]>([]);
  const [flexiSubjects, setFlexiSubjects] = useState<SubjectInfo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [subRes, classRes] = await Promise.all([
          api.get("/subscription/my-subscription"),
          api.get("/courses/classes"),
        ]);
        const sub: Subscription = subRes.data.data;
        setSubscription(sub);
        setAllClasses(classRes.data.data);

        // For FLEXI_PLAN, resolve subject names from pricing endpoint
        if (sub && sub.status === "ACTIVE" && sub.plan === "FLEXI_PLAN" && sub.subjectsAccess?.length > 0) {
          const { data: pricingRes } = await api.get("/courses/pricing/subjects");
          const allCls = pricingRes.data as any[];
          const found: SubjectInfo[] = [];
          for (const cls of allCls) {
            for (const s of cls.subjects) {
              if (sub.subjectsAccess.includes(s.id)) {
                found.push({ subjectId: s.id, subjectName: s.name, classId: cls.id, className: cls.name, icon: s.icon });
              }
            }
          }
          setFlexiSubjects(found);
        }
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

  // Determine access type
  const isFlexiPlan = isActive && subscription?.plan === "FLEXI_PLAN";
  const subscribedClassIds = subscription?.classesAccess ?? [];
  const isFullAccess = isActive && !isFlexiPlan && (subscribedClassIds.length === 0 || subscribedClassIds.length >= allClasses.length);
  const isClassSpecific = isActive && !isFlexiPlan && !isFullAccess && subscribedClassIds.length > 0;
  const subscribedClasses = allClasses.filter(c => subscribedClassIds.includes(c.id));

  if (loading) return <PageLoader />;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Greeting */}
      <div className="mb-12">
        <h1 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight">
          Hello, <span className="text-blue-600">{user?.name?.split(" ")[0]}!</span>
        </h1>
        <p className="text-gray-500 font-bold mt-1 text-sm md:text-base uppercase tracking-wider">Welcome to your Science Dashboard</p>
      </div>

      {/* Course Access Section */}
      <div className="mb-16">
        <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full glass mb-8">
          <Layout className="w-4 h-4 text-primary" />
          <span className="text-[11px] text-text-muted font-black uppercase tracking-widest">Enrollment Status</span>
        </div>

        {isActive ? (
          <>
            {/* FLEXI_PLAN: Subject-by-subject cards */}
            {isFlexiPlan && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-black text-gray-900">Your FlexiLearn Subjects</h2>
                    <p className="text-sm text-gray-500 mt-0.5">{flexiSubjects.length} subjects · {daysLeft} days remaining</p>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200 text-[10px] font-black uppercase tracking-widest">Active</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {flexiSubjects.map((sub) => {
                    const theme = subjectTheme(sub.subjectName);
                    const SubIcon = iconMap[sub.icon ?? ""] || Atom;
                    return (
                      <div key={sub.subjectId} className={`bg-white rounded-2xl border ${theme.border} shadow-sm overflow-hidden`}>
                        <div className={`h-2 bg-gradient-to-r ${theme.grad}`} />
                        <div className="p-5">
                          <div className="flex items-center gap-3 mb-4">
                            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${theme.grad} flex items-center justify-center shadow-sm shrink-0`}>
                              <SubIcon className="w-5 h-5 text-white" />
                            </div>
                            <div className="min-w-0">
                              <h4 className={`font-black text-sm ${theme.text} leading-tight`}>{sub.subjectName}</h4>
                              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{sub.className}</p>
                            </div>
                          </div>
                          <Link href={`/courses/${sub.classId}/${sub.subjectId}`}>
                            <button className={`w-full py-2.5 rounded-xl text-xs font-black bg-gradient-to-r ${theme.grad} text-white flex items-center justify-center gap-1.5 hover:opacity-90 transition-opacity`}>
                              Go to Course <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
                {/* Expiry row */}
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <Clock className="w-3.5 h-3.5" />
                  Valid until {new Date(subscription!.expiryDate).toLocaleDateString("en-IN", { dateStyle: "long" })}
                </div>
              </div>
            )}

            {/* Class-specific plan: show subscribed classes */}
            {isClassSpecific && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-black text-gray-900">Your Course Access</h2>
                    <p className="text-sm text-gray-500 mt-0.5">{subscribedClasses.length} class{subscribedClasses.length > 1 ? "es" : ""} · {daysLeft} days remaining</p>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200 text-[10px] font-black uppercase tracking-widest">Active</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {subscribedClasses.map((cls) => (
                    <div key={cls.id} className="bg-white rounded-2xl border border-blue-200 shadow-sm overflow-hidden">
                      <div className="h-2 bg-gradient-to-r from-blue-500 to-indigo-600" />
                      <div className="p-5">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-sm shrink-0">
                            <GraduationCap className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <h4 className="font-black text-sm text-blue-700 leading-tight">{cls.name}</h4>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">All Subjects</p>
                          </div>
                        </div>
                        <Link href={`/courses/${cls.id}`}>
                          <button className="w-full py-2.5 rounded-xl text-xs font-black bg-gradient-to-r from-blue-500 to-indigo-600 text-white flex items-center justify-center gap-1.5 hover:opacity-90 transition-opacity">
                            Go to Course <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <Clock className="w-3.5 h-3.5" />
                  Valid until {new Date(subscription!.expiryDate).toLocaleDateString("en-IN", { dateStyle: "long" })}
                </div>
              </div>
            )}

            {/* Full access: generic card layout */}
            {isFullAccess && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1">
                  <ActiveCourseCard subscription={subscription!} daysLeft={daysLeft} />
                </div>
                <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4 h-fit">
                  <DashboardStatCard icon={BookOpen} title="Curriculum" value="Class 9-12 Science" desc="Comprehensive 3D Learning" color="blue" />
                  <DashboardStatCard icon={MonitorPlay} title="Learning Resource" value="64+ Virtual Labs" desc="Interactive Simulations" color="purple" />
                  <DashboardStatCard icon={PenTool} title="Study Material" value="PDF Notes & Formulae" desc="Chapter-wise Downloads" color="emerald" />
                  <DashboardStatCard icon={Zap} title="Active Path" value="Animated Lessons" desc="Concept Visualization" color="orange" />
                </div>
              </div>
            )}
          </>
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

      {/* Bottom CTA (only for active users) */}
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
            <Link href={isFlexiPlan ? "/courses/my-custom-plan" : isClassSpecific && subscribedClasses[0] ? `/courses/${subscribedClasses[0].id}` : "/courses"}>
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

function ActiveCourseCard({ subscription, daysLeft }: { subscription: Subscription; daysLeft: number }) {
  const plan = subscription.plan;

  return (
    <div className="relative group rounded-[2.5rem] overflow-hidden bg-white border border-gray-100 shadow-2xl h-full flex flex-col ring-1 ring-black/5">
      <div className={`h-48 relative overflow-hidden flex items-center justify-center ${
        plan.includes("Elite") || plan.includes("ELITE") ? "bg-gradient-to-br from-indigo-900 to-purple-900" :
        plan.includes("Academic") || plan.includes("ACADEMIC") ? "bg-gradient-to-br from-blue-900 to-indigo-900" :
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
          <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 font-black text-[9px] py-1">ACTIVE</Badge>
        </div>
      </div>
      <div className="p-8 flex-1 flex flex-col">
        <div className="flex items-center justify-between mb-8">
          <div className="space-y-1">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Valid Until</p>
            <p className="text-sm font-bold text-gray-900">{new Date(subscription.expiryDate).toLocaleDateString("en-IN", { dateStyle: "long" })}</p>
          </div>
          <div className="text-right space-y-1">
            <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Access</p>
            <p className="text-sm font-bold text-gray-900">{daysLeft} Days Left</p>
          </div>
        </div>
        <Link href="/courses" className="mt-auto">
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
    <div className="p-6 rounded-[2rem] border bg-white shadow-sm flex items-start gap-4 hover:shadow-md transition-shadow">
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
