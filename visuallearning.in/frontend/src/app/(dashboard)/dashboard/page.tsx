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
  GraduationCap, Layers, ChevronRight, FlaskRound, BriefcaseBusiness
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageLoader } from "@/components/ui/loading";
import type { Subscription, ClassItem } from "@/types";

const iconMap: Record<string, any> = {
  Atom, FlaskConical, FlaskRound, Beaker, GraduationCap, Layers, BookOpen, Zap, Crown, Sparkles, BriefcaseBusiness
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

function subjectTrackKey(name: string) {
  const normalized = name.toLowerCase();
  if (normalized.includes("chemistry")) return "chemistry";
  if (normalized.includes("biology")) return "biology";
  return "physics";
}

function planMeta(plan: string) {
  const key = plan.toUpperCase();
  if (key === "STUDENTS_PLAN") {
    return {
      badge: "STUDENTS",
      title: "Students Plan",
      subtitle: "Class-wise student learning resources",
      grad: "from-sky-900 to-blue-900",
      tint: "blue",
      href: "/courses/students",
      icon: GraduationCap,
    };
  }
  if (key === "TEACHERS_PLAN") {
    return {
      badge: "TEACHERS",
      title: "Teachers Plan",
      subtitle: "Class-wise teaching resources",
      grad: "from-emerald-900 to-teal-900",
      tint: "emerald",
      href: "/courses/teachers",
      icon: Users,
    };
  }
  if (key === "PROFESSIONAL_PLAN") {
    return {
      badge: "PROFESSIONAL",
      title: "Professional Plan",
      subtitle: "Subject tracks for advanced learning",
      grad: "from-violet-900 to-fuchsia-900",
      tint: "violet",
      href: "/courses/professional",
      icon: BriefcaseBusiness,
    };
  }
  return {
    badge: key.replace(/_/g, " "),
    title: key.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase()),
    subtitle: "Active learning access",
    grad: "from-blue-900 to-indigo-900",
    tint: "blue",
    href: "/courses",
    icon: Crown,
  };
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [allClasses, setAllClasses] = useState<ClassItem[]>([]);
  const [subjectAccessBySubId, setSubjectAccessBySubId] = useState<Record<string, SubjectInfo[]>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [subRes, classRes] = await Promise.all([
          api.get("/subscription/my-subscription"),
          api.get("/courses/classes"),
        ]);
        const subs: Subscription[] = Array.isArray(subRes.data.data) ? subRes.data.data : [subRes.data.data].filter(Boolean);
        setSubscriptions(subs);
        setAllClasses(classRes.data.data);

        // Resolve subject names for Flexi and Professional subject-track plans.
        const subjectSubs = subs.filter(s => s.status === "ACTIVE" && s.subjectsAccess?.length > 0);
        if (subjectSubs.length > 0) {
          const { data: pricingRes } = await api.get("/courses/pricing/subjects");
          const allCls = (pricingRes.data || pricingRes) as any[];
          const byId: Record<string, SubjectInfo> = {};
          const allSubjects: SubjectInfo[] = [];

          for (const cls of allCls) {
            for (const s of cls.subjects) {
              const info = { subjectId: s.id, subjectName: s.name, classId: cls.id, className: cls.name, icon: s.icon };
              byId[s.id] = info;
              allSubjects.push(info);
            }
          }

          const nextMap: Record<string, SubjectInfo[]> = {};
          for (const sub of subjectSubs) {
            nextMap[sub.id] = sub.subjectsAccess.flatMap((access) => {
              if (byId[access]) return [byId[access]];
              const key = access.toLowerCase();
              return allSubjects.filter((subject) => subject.subjectName.toLowerCase().includes(key));
            });
          }
          setSubjectAccessBySubId(nextMap);
        }
      } catch (err) {
        console.error("Failed to load dashboard data", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const activeSubs = subscriptions.filter(s => s.status === "ACTIVE" && new Date(s.expiryDate) > new Date());
  const isActive = activeSubs.length > 0;

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
          <span className="text-[11px] text-text-muted font-black uppercase tracking-widest">My Active Plans</span>
        </div>

        {isActive ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {activeSubs.map((sub) => (
              <SubscriptionCard 
                key={sub.id} 
                sub={sub} 
                subjectAccess={subjectAccessBySubId[sub.id] || []}
                allClasses={allClasses}
              />
            ))}
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

      {/* Stats / Features Grid (only for active users) */}
      {isActive && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-16">
          <DashboardStatCard icon={BookOpen} title="Curriculum" value="Class 9-12 Science" desc="Comprehensive 3D Learning" color="blue" />
          <DashboardStatCard icon={MonitorPlay} title="Learning Resource" value="64+ Virtual Labs" desc="Interactive Simulations" color="purple" />
          <DashboardStatCard icon={PenTool} title="Study Material" value="PDF Notes & Formulae" desc="Chapter-wise Downloads" color="emerald" />
          <DashboardStatCard icon={Zap} title="Active Path" value="Animated Lessons" desc="Concept Visualization" color="orange" />
        </div>
      )}

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
            <Link href="/courses">
              <Button className="bg-white text-black hover:bg-white/90 font-black px-8 py-7 rounded-2xl shadow-2xl">
                Explore More Courses <MonitorPlay className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

function SubscriptionCard({ sub, subjectAccess, allClasses }: { sub: Subscription; subjectAccess: SubjectInfo[]; allClasses: ClassItem[] }) {
  const daysLeft = Math.ceil((new Date(sub.expiryDate).getTime() - Date.now()) / 86400000);
  const planName = sub.plan.replace(/_/g, " ");
  const meta = planMeta(sub.plan);
  const HeaderIcon = meta.icon;

  // Subject-track plans (FlexiLearn / Professional)
  if (sub.plan === "FLEXI_PLAN" || sub.plan === "PROFESSIONAL_PLAN" || (sub.subjectsAccess?.length || 0) > 0) {
    const isProfessional = sub.plan === "PROFESSIONAL_PLAN";
    const professionalTracks = Array.from(
      new Map(subjectAccess.map((subject) => [subjectTrackKey(subject.subjectName), subject])).values()
    );
    const visibleSubjects = isProfessional ? professionalTracks : subjectAccess;

    return (
      <div className="bg-white rounded-3xl border border-indigo-100 shadow-xl overflow-hidden flex flex-col">
        <div className={`p-6 bg-gradient-to-br ${isProfessional ? meta.grad : "from-indigo-900 to-slate-900"} text-white`}>
          <div className="flex items-center justify-between mb-4">
            <Badge className="bg-white/15 text-white border-white/20 font-black text-[9px]">{isProfessional ? meta.badge : "FLEXI LEARN"}</Badge>
            <span className="text-[10px] font-bold text-white/60">{daysLeft} days left</span>
          </div>
          <div className="flex items-center gap-3">
            <HeaderIcon className="w-7 h-7 text-white/80" />
            <div>
              <h3 className="text-xl font-black mb-1">{isProfessional ? "Professional Subject Tracks" : "Customized Subjects"}</h3>
              <p className="text-xs text-white/60 font-medium">
                {isProfessional
                  ? `${visibleSubjects.length || sub.subjectsAccess.length} selected professional subject${(visibleSubjects.length || sub.subjectsAccess.length) === 1 ? "" : "s"}`
                  : `You have access to ${visibleSubjects.length || sub.subjectsAccess.length} selected subjects`}
              </p>
            </div>
          </div>
        </div>
        <div className="p-5 flex-1 space-y-3 max-h-72 overflow-y-auto custom-scrollbar">
          {visibleSubjects.map((s) => {
            const theme = subjectTheme(s.subjectName);
            const SubIcon = iconMap[s.icon ?? ""] || Atom;
            const href = isProfessional ? `/courses/professional/${subjectTrackKey(s.subjectName)}` : `/courses/${s.classId}/${s.subjectId}`;
            return (
              <Link href={href} key={`${s.subjectId}-${href}`}>
                <div className={`group flex items-center justify-between p-3 rounded-xl border ${theme.border} ${theme.bg} hover:shadow-md transition-all mb-2`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${theme.grad} flex items-center justify-center shadow-sm`}>
                      <SubIcon className="w-4 h-4 text-white" />
                    </div>
                    <div className="min-w-0">
                      <p className={`text-xs font-black ${theme.text} truncate`}>{s.subjectName}</p>
                      <p className="text-[9px] font-bold text-gray-400 uppercase">{isProfessional ? "Professional Track" : s.className}</p>
                    </div>
                  </div>
                  <ChevronRight className={`w-4 h-4 ${theme.text} group-hover:translate-x-1 transition-transform`} />
                </div>
              </Link>
          )})}
        </div>
      </div>
    );
  }

  // Course-based plan (Standard/Grade courses)
  if (sub.course) {
    return (
      <div className="bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden flex flex-col">
        <div className="h-2" style={{ background: sub.course.accentColor || "#3b82f6" }} />
        <div className="p-8 flex flex-col h-full">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-md" style={{ background: sub.course.accentColor || "#3b82f6" }}>
              {(() => { const I = iconMap[sub.course.icon ?? ""] || Crown; return <I className="w-7 h-7 text-white" />; })()}
            </div>
            <div>
              <h3 className="text-lg font-black text-gray-900 leading-tight">{sub.course.name}</h3>
              <Badge variant="info" className="text-[9px] mt-1 font-black uppercase tracking-widest">{planName}</Badge>
            </div>
          </div>
          
          <div className="space-y-4 mb-8">
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-400 font-bold uppercase tracking-widest">Status</span>
              <span className="text-emerald-500 font-black">ACTIVE</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-400 font-bold uppercase tracking-widest">Valid Until</span>
              <span className="text-gray-900 font-black">{new Date(sub.expiryDate).toLocaleDateString("en-IN", { dateStyle: "medium" })}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-400 font-bold uppercase tracking-widest">Remaining</span>
              <span className="text-blue-600 font-black">{daysLeft} Days</span>
            </div>
          </div>

          <Link href={`/courses/view-course/${sub.course.slug}`} className="mt-auto">
            <button className="w-full py-4 rounded-2xl text-sm font-black text-white flex items-center justify-center gap-2 hover:opacity-90 transition-all shadow-lg hover:shadow-xl active:scale-95" style={{ background: sub.course.accentColor || "#3b82f6" }}>
              Go To Classroom <ArrowRight className="w-4 h-4" />
            </button>
          </Link>
        </div>
      </div>
    );
  }

  // Class-based plan fallback
  const subClasses = allClasses.filter(c => sub.classesAccess.includes(c.id));
  const isFullAccess = sub.classesAccess.length === 0 || sub.classesAccess.length >= allClasses.length;
  const tintClasses: Record<string, { badge: string; text: string; button: string }> = {
    blue: { badge: "bg-blue-500/20 text-blue-200 border-blue-500/30", text: "text-blue-400", button: "bg-blue-600 hover:bg-blue-700" },
    emerald: { badge: "bg-emerald-500/20 text-emerald-200 border-emerald-500/30", text: "text-emerald-400", button: "bg-emerald-600 hover:bg-emerald-700" },
    violet: { badge: "bg-violet-500/20 text-violet-200 border-violet-500/30", text: "text-violet-400", button: "bg-violet-600 hover:bg-violet-700" },
  };
  const tint = tintClasses[meta.tint] || tintClasses.blue;

  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden flex flex-col">
      <div className={`p-6 bg-gradient-to-br ${meta.grad} text-white`}>
        <div className="flex items-center justify-between mb-4">
          <Badge className={`${tint.badge} font-black text-[9px]`}>{meta.badge}</Badge>
          <span className={`text-[10px] font-bold ${tint.text}`}>{daysLeft} days left</span>
        </div>
        <div className="flex items-center gap-3">
          <HeaderIcon className="w-7 h-7 text-white/80" />
          <div>
            <h3 className="text-xl font-black mb-1">{meta.title}</h3>
            <p className="text-xs text-white/60 font-medium">{isFullAccess ? "All Class 9-12 access" : `${subClasses.length} selected class${subClasses.length === 1 ? "" : "es"}`}</p>
          </div>
        </div>
      </div>
      <div className="p-6 flex-1 flex flex-col">
        {!isFullAccess && (
          <div className="space-y-2 mb-6">
            {subClasses.map(c => (
              <div key={c.id} className="flex items-center gap-2 text-xs font-bold text-gray-600">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-500" /> {c.name}
              </div>
            ))}
          </div>
        )}
        <Link href={meta.href} className="mt-auto">
          <Button className={`w-full py-6 text-sm font-black ${tint.button} text-white rounded-2xl shadow-xl transition-all`}>
            Enter Classroom <ArrowRight className="w-4 h-4 ml-2" />
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
