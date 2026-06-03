"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import api from "@/lib/api";
import { BookOpen, Rocket, CalendarDays, Clock3, ShieldCheck, ChevronRight, CheckCircle2, Lock, UserPlus } from "lucide-react";

interface DashboardCourse { id: string; name: string; tier: string }
interface SubscriptionInfo { plan: string; status: string; startDate?: string; expiryDate?: string }

const CLASSES = [
  { tier: "11", name: "Class 11 Physics", icon: BookOpen, gradient: "from-accent to-blue-600", accent: "text-accent", border: "border-accent/30", glow: "hover:shadow-[0_0_40px_rgba(0,212,255,0.15)]" },
  { tier: "12", name: "Class 12 Physics", icon: Rocket, gradient: "from-secondary to-purple-600", accent: "text-secondary-light", border: "border-secondary/30", glow: "hover:shadow-[0_0_40px_rgba(124,58,237,0.15)]" },
];

function formatDate(value?: string) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}
function daysLeft(value?: string) {
  if (!value) return "—";
  const n = Math.ceil((new Date(value).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  if (n <= 0) return "Expired";
  return `${n} ${n === 1 ? "day" : "days"}`;
}

export default function DashboardPage() {
  const { isAuthenticated, user, hydrate } = useAuth();
  const router = useRouter();
  const [courses, setCourses] = useState<DashboardCourse[]>([]);
  const [subscription, setSubscription] = useState<SubscriptionInfo | null>(null);
  const [joinedAt, setJoinedAt] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(true);

  useEffect(() => { hydrate(); }, [hydrate]);
  useEffect(() => { if (!isAuthenticated) router.push("/auth/login"); }, [isAuthenticated, router]);

  useEffect(() => {
    if (!isAuthenticated) return;
    (async () => {
      try {
        const [coursesRes, subRes, profileRes] = await Promise.all([
          api.get("/subscription/my-courses"),
          api.get("/subscription/my-subscription"),
          api.get("/auth/profile").catch(() => null),
        ]);
        setCourses(Array.isArray(coursesRes.data) ? coursesRes.data : []);
        setSubscription(subRes.data || null);
        setJoinedAt(profileRes?.data?.createdAt || profileRes?.data?.user?.createdAt);
      } catch {
        setCourses([]); setSubscription(null);
      } finally {
        setLoading(false);
      }
    })();
  }, [isAuthenticated]);

  if (!isAuthenticated) return null;

  const subscribedTiers = new Set(courses.map((c) => String(c.tier)));

  return (
    <main className="min-h-screen bg-primary">
      <Navbar />
      <div className="pt-28 pb-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-text-bright mb-2">
            Welcome back, <span className="gradient-text">{user?.name?.split(" ")[0]}</span>
          </h1>
          <p className="text-text-muted">Your courses and subscription status</p>
        </div>

        {loading ? (
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl">
            {[...Array(2)].map((_, i) => <div key={i} className="h-64 rounded-2xl border border-border bg-card animate-pulse" />)}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl">
            {CLASSES.map((c) => {
              const Icon = c.icon;
              const subscribed = subscribedTiers.has(c.tier);
              return (
                <div key={c.tier} className={`relative overflow-hidden rounded-2xl border ${c.border} bg-card p-7 transition-all duration-500 ${c.glow} flex flex-col shadow-[0_18px_60px_rgba(0,0,0,0.18)]`}>
                  <div className={`absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r ${c.gradient}`} />

                  <div className="flex items-start justify-between gap-4 mb-6 pt-2">
                    <div className="flex items-center gap-4 min-w-0">
                      <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${c.gradient} flex items-center justify-center shrink-0`}>
                        <Icon className="w-7 h-7 text-white" />
                      </div>
                      <h3 className="text-lg font-bold text-text-bright">{c.name}</h3>
                    </div>
                    {subscribed ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-success/15 px-2.5 py-1 text-[11px] font-black uppercase tracking-wide text-success">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Subscribed
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-energy/15 px-2.5 py-1 text-[11px] font-black uppercase tracking-wide text-energy">
                        <Lock className="w-3.5 h-3.5" /> Not Subscribed
                      </span>
                    )}
                  </div>

                  {subscribed ? (
                    <>
                      <div className="mb-6 flex-1 space-y-3.5">
                        {[
                          { label: "Joining Date", value: formatDate(joinedAt), icon: UserPlus },
                          { label: "Start Date", value: formatDate(subscription?.startDate), icon: CalendarDays },
                          { label: "End Date", value: formatDate(subscription?.expiryDate), icon: ShieldCheck },
                          { label: "Validity", value: daysLeft(subscription?.expiryDate), icon: Clock3 },
                        ].map((item) => (
                          <div key={item.label} className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-text-muted">
                              <item.icon className={`w-3.5 h-3.5 ${c.accent}`} />
                              {item.label}
                            </div>
                            <span className={`text-sm font-black text-right ${item.label === "Validity" ? c.accent : "text-text-bright"}`}>{item.value}</span>
                          </div>
                        ))}
                      </div>
                      <Link href={`/courses/${c.tier}`}>
                        <Button variant={c.tier === "12" ? "secondary" : "primary"} className="w-full">
                          Go to Course<ChevronRight className="w-4 h-4 ml-1" />
                        </Button>
                      </Link>
                    </>
                  ) : (
                    <>
                      <div className="mb-6 flex-1 flex items-center">
                        <p className="text-sm text-text-muted">Subscribe to unlock all chapters, notes, NCERT & PYQ solutions, and quizzes for {c.name}.</p>
                      </div>
                      <Link href="/pricing">
                        <Button variant="outline" className="w-full">
                          View Plans<ChevronRight className="w-4 h-4 ml-1" />
                        </Button>
                      </Link>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
      <Footer />
    </main>
  );
}
