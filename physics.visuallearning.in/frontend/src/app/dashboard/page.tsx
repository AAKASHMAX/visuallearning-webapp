"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import api from "@/lib/api";
import {
  Lightbulb,
  BookOpen,
  Rocket,
  Play,
  FlaskConical,
  FileText,
  ChevronRight,
  Target,
  CalendarDays,
  Clock3,
  ShieldCheck,
} from "lucide-react";

interface DashboardCourse {
  id: string;
  name: string;
  description: string | null;
  tier: string;
  _count?: { chapters: number };
}

interface SubscriptionInfo {
  plan: string;
  status: string;
  startDate?: string;
  expiryDate?: string;
}

const tierStyles: Record<string, any> = {
  FREE: { icon: Lightbulb, gradient: "from-emerald-500 to-teal-600", accent: "text-emerald-400", borderColor: "border-emerald-500/30", glowColor: "hover:shadow-[0_0_40px_rgba(16,185,129,0.15)]", tag: "Free Access", tagColor: "bg-emerald-500/10 text-emerald-400", button: "outline" },
  BASIC: { icon: BookOpen, gradient: "from-accent to-blue-600", accent: "text-accent", borderColor: "border-accent/30", glowColor: "hover:shadow-[0_0_40px_rgba(0,212,255,0.15)]", tag: "Assigned", tagColor: "bg-accent/10 text-accent", button: "primary" },
  ADVANCE: { icon: Rocket, gradient: "from-secondary to-purple-600", accent: "text-secondary-light", borderColor: "border-secondary/30", glowColor: "hover:shadow-[0_0_40px_rgba(124,58,237,0.15)]", tag: "Assigned", tagColor: "bg-secondary/10 text-secondary-light", button: "secondary" },
  BRIDGE: { icon: Target, gradient: "from-orange-500 to-red-600", accent: "text-orange-400", borderColor: "border-orange-500/30", glowColor: "hover:shadow-[0_0_40px_rgba(249,115,22,0.15)]", tag: "Assigned", tagColor: "bg-orange-500/10 text-orange-400", button: "outline" },
};

function formatDate(value?: string) {
  if (!value) return "Always";
  return new Date(value).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

function getDaysRemaining(value?: string) {
  if (!value) return "Unlimited";
  const remaining = Math.ceil((new Date(value).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  if (remaining <= 0) return "Expired";
  return `${remaining} ${remaining === 1 ? "Day" : "Days"}`;
}

function getStatusLabel(course: DashboardCourse, subscription: SubscriptionInfo | null) {
  if (course.tier === "FREE" && !subscription?.expiryDate) return "FREE";
  return subscription?.status || "ACTIVE";
}

export default function DashboardPage() {
  const { isAuthenticated, user, hydrate } = useAuth();
  const router = useRouter();
  const [courses, setCourses] = useState<DashboardCourse[]>([]);
  const [subscription, setSubscription] = useState<SubscriptionInfo | null>(null);
  const [coursesLoading, setCoursesLoading] = useState(true);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/auth/login");
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    if (!isAuthenticated) return;
    async function loadCourses() {
      try {
        const [coursesRes, subscriptionRes] = await Promise.all([
          api.get("/subscription/my-courses"),
          api.get("/subscription/my-subscription"),
        ]);
        setCourses(coursesRes.data || []);
        setSubscription(subscriptionRes.data || null);
      } catch {
        setCourses([]);
        setSubscription(null);
      } finally {
        setCoursesLoading(false);
      }
    }
    loadCourses();
  }, [isAuthenticated]);

  const assignedCourses = courses.filter((course) => course.tier !== "FREE");
  const visibleCourses = assignedCourses.length > 0 ? assignedCourses : courses;

  if (!isAuthenticated) return null;

  return (
    <main className="min-h-screen bg-primary">
      <Navbar />
      <div className="pt-28 pb-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Welcome */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-text-bright mb-2">
            Welcome back, <span className="gradient-text">{user?.name?.split(" ")[0]}</span>
          </h1>
          <p className="text-text-muted">Continue your physics learning journey</p>
        </div>

        {/* Quick access cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {[
            { icon: Play, label: "Video Lectures", desc: "Watch animated lessons", gradient: "from-accent to-blue-600" },
            { icon: FlaskConical, label: "Virtual Labs", desc: "Interactive experiments", gradient: "from-secondary to-purple-600" },
            { icon: FileText, label: "Notes", desc: "Chapter-wise PDFs", gradient: "from-emerald-500 to-teal-600" },
            { icon: BookOpen, label: "Quizzes", desc: "Test your knowledge", gradient: "from-energy to-orange-600" },
          ].map((item, i) => (
            <div
              key={i}
              className="rounded-2xl border border-border bg-card p-6 hover:border-accent/30 transition-all duration-300 hover:-translate-y-1 cursor-pointer group"
            >
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${item.gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <item.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold text-text-bright mb-1">{item.label}</h3>
              <p className="text-sm text-text-muted">{item.desc}</p>
            </div>
          ))}
        </div>

        {/* Course Cards */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-text-bright mb-2">Your Active Courses</h2>
          <p className="text-text-muted text-sm">Your assigned courses and subscription validity</p>
        </div>

        {coursesLoading ? (
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-8">
            {[...Array(3)].map((_, i) => <div key={i} className="h-72 rounded-2xl border border-border bg-card animate-pulse" />)}
          </div>
        ) : visibleCourses.length === 0 ? (
          <div className="rounded-2xl border border-border bg-card p-12 text-center">
            <BookOpen className="w-10 h-10 text-accent/50 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-text-bright mb-1">No courses assigned yet</h3>
            <p className="text-sm text-text-muted">Your assigned course plans will appear here.</p>
          </div>
        ) : (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-8">
          {visibleCourses.map((course) => {
            const style = tierStyles[course.tier] || tierStyles.FREE;
            const Icon = style.icon;
            const status = getStatusLabel(course, subscription);
            const isFreeCourse = status === "FREE";
            return (
            <div
              key={course.id}
              className={`relative overflow-hidden rounded-2xl border ${style.borderColor} bg-card p-7 transition-all duration-500 ${style.glowColor} hover:-translate-y-1 group flex flex-col shadow-[0_18px_60px_rgba(0,0,0,0.18)]`}
            >
              <div className={`absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r ${style.gradient}`} />

              <div className="flex items-start justify-between gap-4 mb-7 pt-2">
                <div className="flex items-center gap-4 min-w-0">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${style.gradient} flex items-center justify-center group-hover:scale-105 transition-transform duration-300 shrink-0`}>
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-lg font-bold text-text-bright truncate">{course.name}</h3>
                    <span className={`inline-flex mt-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${style.tagColor}`}>
                      {course.tier}
                    </span>
                  </div>
                </div>
                <span className={`text-[11px] font-black uppercase ${status === "ACTIVE" ? "text-success" : isFreeCourse ? style.accent : "text-energy"}`}>
                  {status}
                </span>
              </div>

              <div className="space-y-4 mb-7 flex-1">
                {[
                  { label: "Start From", value: isFreeCourse ? "Available" : formatDate(subscription?.startDate), icon: CalendarDays },
                  { label: "Valid Until", value: isFreeCourse ? "Always" : formatDate(subscription?.expiryDate), icon: ShieldCheck },
                  { label: "Remaining", value: isFreeCourse ? "Unlimited" : getDaysRemaining(subscription?.expiryDate), icon: Clock3 },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-text-muted">
                      <item.icon className={`w-3.5 h-3.5 ${style.accent}`} />
                      {item.label}
                    </div>
                    <span className={`text-sm font-black text-right ${item.label === "Remaining" ? style.accent : "text-text-bright"}`}>{item.value}</span>
                  </div>
                ))}
              </div>

              <Link href={`/courses/${course.tier.toLowerCase()}`}>
                <Button
                  variant={style.button}
                  className="w-full shadow-[0_12px_30px_rgba(0,0,0,0.18)]"
                >
                  Go To Course
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </div>
          )})}
        </div>
        )}
      </div>
      <Footer />
    </main>
  );
}
