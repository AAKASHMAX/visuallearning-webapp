"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import api from "@/lib/api";
import {
  BookOpen, CreditCard, PlayCircle, Radio, Users, Clock,
  Beaker, Atom, MonitorPlay, PenTool, ClipboardList, FlaskConical, Eye,
  Crown, ArrowRight, Sparkles,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Subscription } from "@/types";

interface LiveClass {
  id: string;
  title: string;
  description?: string;
  teacher: { id: string; name: string };
  status: "LIVE" | "SCHEDULED";
  scheduledAt?: string;
  hasAccess: boolean;
}

const featureCards = [
  {
    title: "3D Animated Videos",
    description: "Watch complex science concepts come alive with stunning 3D animations",
    icon: Atom,
    gradient: "from-violet-500 to-indigo-600",
    bgLight: "bg-violet-50",
    iconBg: "bg-violet-100",
    iconColor: "text-violet-600",
    features: ["Molecular structures", "Physics simulations", "Biology diagrams"],
    href: "/courses",
  },
  {
    title: "Virtual Lab",
    description: "64+ interactive 3D simulations — explore, experiment & learn hands-on",
    icon: Beaker,
    gradient: "from-teal-500 to-cyan-600",
    bgLight: "bg-teal-50",
    iconBg: "bg-teal-100",
    iconColor: "text-teal-600",
    features: ["3D Viewer models", "Virtual experiments", "Biology, Chemistry & Physics"],
    href: "/courses/virtual-lab",
  },
  {
    title: "Video Lectures",
    description: "Expert teachers explain every chapter with clear animated video lessons",
    icon: MonitorPlay,
    gradient: "from-blue-500 to-cyan-500",
    bgLight: "bg-blue-50",
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
    features: ["Chapter-wise coverage", "HD quality", "Learn at your pace"],
    href: "/courses",
  },
  {
    title: "Study Notes",
    description: "Downloadable chapter-wise notes crafted for revision & deep understanding",
    icon: PenTool,
    gradient: "from-emerald-500 to-green-600",
    bgLight: "bg-emerald-50",
    iconBg: "bg-emerald-100",
    iconColor: "text-emerald-600",
    features: ["Exam-focused notes", "Key formulas & diagrams", "PDF downloads"],
    href: "/courses",
  },
  {
    title: "Quiz & MCQs",
    description: "Practice with chapter-wise MCQs and track your progress",
    icon: ClipboardList,
    gradient: "from-amber-500 to-orange-500",
    bgLight: "bg-amber-50",
    iconBg: "bg-amber-100",
    iconColor: "text-amber-600",
    features: ["1000+ MCQs", "Instant results", "Track your score"],
    href: "/courses",
  },
  {
    title: "Question Papers",
    description: "Previous year board papers & chapter-wise tests to ace your exams",
    icon: FlaskConical,
    gradient: "from-rose-500 to-pink-600",
    bgLight: "bg-rose-50",
    iconBg: "bg-rose-100",
    iconColor: "text-rose-600",
    features: ["Previous year papers", "Practice tests", "With solutions"],
    href: "/courses",
  },
  {
    title: "Live Classes",
    description: "Join real-time sessions with teachers, ask doubts & learn together",
    icon: Radio,
    gradient: "from-red-500 to-rose-600",
    bgLight: "bg-red-50",
    iconBg: "bg-red-100",
    iconColor: "text-red-600",
    features: ["Real-time doubt solving", "Interactive sessions", "Chat with teachers"],
    href: "/courses/live-classes",
  },
];

export default function DashboardPage() {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [liveClasses, setLiveClasses] = useState<LiveClass[]>([]);
  const [loadingLive, setLoadingLive] = useState(true);

  useEffect(() => {
    const cached = sessionStorage.getItem("vl_my_sub");
    if (cached) {
      try {
        const { data: sub, ts } = JSON.parse(cached);
        if (Date.now() - ts < 5 * 60 * 1000) {
          setSubscription(sub);
          return;
        }
      } catch { /* ignore */ }
    }
    api.get("/subscription/my-subscription").then(({ data }) => {
      setSubscription(data.data);
      sessionStorage.setItem("vl_my_sub", JSON.stringify({ data: data.data, ts: Date.now() }));
    }).catch(() => {});
  }, []);

  useEffect(() => {
    api.get("/live-classes/active")
      .then(({ data }) => setLiveClasses(data.data?.classes || []))
      .catch(() => {})
      .finally(() => setLoadingLive(false));
  }, []);

  const isActive = subscription?.status === "ACTIVE" && new Date(subscription.expiryDate) > new Date();
  const liveNow = liveClasses.filter((c) => c.status === "LIVE");
  const scheduled = liveClasses.filter((c) => c.status === "SCHEDULED");
  const daysLeft = isActive ? Math.ceil((new Date(subscription!.expiryDate).getTime() - Date.now()) / 86400000) : 0;

  return (
    <div className="max-w-6xl mx-auto">
      {/* Greeting */}
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
          Welcome back, {user?.name?.split(" ")[0]}!
        </h1>
        <p className="text-gray-500 mt-1">Here&apos;s your learning overview</p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {/* Subscription Status */}
        <div className={`relative overflow-hidden rounded-2xl p-5 ${isActive ? "bg-gradient-to-br from-emerald-500 to-teal-600 text-white" : "bg-gradient-to-br from-gray-100 to-gray-200 text-gray-800"}`}>
          <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/10 rounded-full blur-xl" />
          <div className="relative">
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isActive ? "bg-white/20" : "bg-white/60"}`}>
                {isActive ? <Crown className="w-5 h-5 text-white" /> : <CreditCard className="w-5 h-5 text-gray-600" />}
              </div>
              <div>
                <p className={`text-xs font-medium ${isActive ? "text-white/70" : "text-gray-500"}`}>Subscription</p>
                <p className="font-bold text-sm">{isActive ? subscription!.plan : "No active plan"}</p>
              </div>
            </div>
            {isActive ? (
              <p className="text-xs text-white/70">{daysLeft} days remaining</p>
            ) : (
              <Link href="/subscription">
                <span className="text-xs font-semibold text-primary hover:underline">View Plans &rarr;</span>
              </Link>
            )}
          </div>
        </div>

        {/* Classes & Subjects */}
        <div className="relative overflow-hidden rounded-2xl p-5 bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100">
          <div className="absolute -top-4 -right-4 w-24 h-24 bg-blue-200/30 rounded-full blur-xl" />
          <div className="relative">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500">Available</p>
                <p className="font-bold text-sm text-gray-900">4 Classes, 16 Subjects</p>
              </div>
            </div>
            <p className="text-xs text-gray-500">Class 9, 10, 11 &amp; 12</p>
          </div>
        </div>

        {/* Content Types */}
        <div className="relative overflow-hidden rounded-2xl p-5 bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-100">
          <div className="absolute -top-4 -right-4 w-24 h-24 bg-amber-200/30 rounded-full blur-xl" />
          <div className="relative">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                <PlayCircle className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500">Content</p>
                <p className="font-bold text-sm text-gray-900">Videos, Notes, MCQs & Labs</p>
              </div>
            </div>
            <p className="text-xs text-gray-500">500+ videos, 1000+ questions</p>
          </div>
        </div>
      </div>

      {/* Live Classes Section */}
      {(loadingLive || liveClasses.length > 0) && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-bold">Live Classes</h2>
              {liveNow.length > 0 && (
                <span className="flex items-center gap-1.5 px-2.5 py-1 bg-red-50 text-red-600 text-xs font-semibold rounded-full">
                  <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                  {liveNow.length} Live Now
                </span>
              )}
            </div>
            <Link href="/courses/live-classes">
              <Button variant="ghost" className="text-sm text-primary">View All &rarr;</Button>
            </Link>
          </div>

          {loadingLive ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2].map((i) => (
                <div key={i} className="h-32 bg-gray-100 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {liveNow.map((lc) => (
                <div key={lc.id} className="border border-red-200 bg-gradient-to-br from-red-50 to-white rounded-xl p-5 hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse" />
                      <Badge variant="danger">LIVE</Badge>
                    </div>
                    <div className="flex items-center gap-1 text-gray-400 text-xs">
                      <Users className="w-3.5 h-3.5" />
                      <span>{lc.teacher?.name}</span>
                    </div>
                  </div>
                  <h3 className="font-bold text-gray-900 mb-1">{lc.title}</h3>
                  {lc.description && <p className="text-sm text-gray-500 mb-3 line-clamp-2">{lc.description}</p>}
                  {lc.hasAccess ? (
                    <Link href="/courses/live-classes">
                      <Button size="sm" className="bg-red-500 hover:bg-red-600 text-white w-full">
                        <Radio className="w-4 h-4 mr-1.5" /> Join Now
                      </Button>
                    </Link>
                  ) : (
                    <Link href="/subscription">
                      <Button size="sm" variant="outline" className="w-full text-red-500 border-red-200">
                        Subscribe to Join
                      </Button>
                    </Link>
                  )}
                </div>
              ))}
              {scheduled.map((lc) => (
                <div key={lc.id} className="border border-blue-100 bg-gradient-to-br from-blue-50 to-white rounded-xl p-5 hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <Badge variant="info">Scheduled</Badge>
                    {lc.scheduledAt && (
                      <div className="flex items-center gap-1 text-gray-400 text-xs">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{new Date(lc.scheduledAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}</span>
                      </div>
                    )}
                  </div>
                  <h3 className="font-bold text-gray-900 mb-1">{lc.title}</h3>
                  {lc.description && <p className="text-sm text-gray-500 mb-3 line-clamp-2">{lc.description}</p>}
                  <div className="text-xs text-gray-400">By {lc.teacher?.name}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Subscribe CTA for non-subscribers */}
      {!isActive && (
        <div className="mb-8 relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary via-primary-light to-primary-dark p-6 text-white">
          <div className="absolute -top-8 -right-8 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
          <div className="relative flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <Crown className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-lg">Unlock All Content</h3>
                <p className="text-white/70 text-sm">Get access to all videos, notes, quizzes, labs & live classes</p>
              </div>
            </div>
            <Link href="/subscription">
              <Button variant="accent" className="whitespace-nowrap">View Plans</Button>
            </Link>
          </div>
        </div>
      )}

      {/* Explore Features */}
      <div className="mb-8">
        <h2 className="text-lg font-bold mb-4">Explore Features</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {featureCards.map((card) => (
            <Link key={card.title} href={card.href}>
              <div className="group bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-lg hover:border-gray-300 transition-all cursor-pointer h-full">
                {/* Gradient header */}
                <div className={`h-2 bg-gradient-to-r ${card.gradient}`} />
                <div className="p-5">
                  <div className="flex items-start gap-3 mb-3">
                    <div className={`w-10 h-10 rounded-xl ${card.iconBg} flex items-center justify-center flex-shrink-0`}>
                      <card.icon className={`w-5 h-5 ${card.iconColor}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-gray-900 group-hover:text-primary transition-colors">{card.title}</h3>
                      <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{card.description}</p>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    {card.features.map((f, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs text-gray-500">
                        <Sparkles className={`w-3 h-3 ${card.iconColor} flex-shrink-0`} />
                        {f}
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 flex items-center gap-1 text-xs font-semibold text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                    Explore <ArrowRight className="w-3 h-3" />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Start Learning - Classes */}
      <div>
        <h2 className="text-lg font-bold mb-4">Start Learning</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { name: "Class 9", color: "from-blue-500 to-blue-700" },
            { name: "Class 10", color: "from-green-500 to-green-700" },
            { name: "Class 11", color: "from-purple-500 to-purple-700" },
            { name: "Class 12", color: "from-orange-500 to-orange-700" },
          ].map((c) => (
            <Link key={c.name} href="/courses">
              <div className={`bg-gradient-to-br ${c.color} text-white rounded-2xl p-5 hover:scale-[1.02] transition-all cursor-pointer shadow-md hover:shadow-lg`}>
                <BookOpen className="w-8 h-8 text-white/70 mb-2" />
                <h3 className="text-lg font-bold">{c.name}</h3>
                <p className="text-white/70 text-xs">4 Subjects</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
