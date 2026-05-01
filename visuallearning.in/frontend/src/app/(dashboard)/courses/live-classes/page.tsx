"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageLoader } from "@/components/ui/loading";
import { useAuth } from "@/lib/auth";
import api from "@/lib/api";
import {
  ArrowLeft, Radio, Clock, Calendar, Play, Lock, ArrowRight,
  Users, MessageCircle, GraduationCap, Target, Headphones,
  Star, CheckCircle, Zap,
} from "lucide-react";

interface LiveClassItem {
  id: string;
  title: string;
  description: string | null;
  status: "SCHEDULED" | "LIVE";
  scheduledAt: string | null;
  startedAt: string | null;
  teacher: { id: string; name: string };
  hasAccess: boolean;
}

const BENEFITS = [
  { icon: Users, title: "Small Batch Size", description: "Only 10-15 students per session so every student gets personal attention.", color: "bg-blue-100 text-blue-600" },
  { icon: MessageCircle, title: "Live Doubt Clearing", description: "Ask your doubts in real-time and get instant, clear explanations.", color: "bg-emerald-100 text-emerald-600" },
  { icon: GraduationCap, title: "Expert Teachers", description: "Learn from educators with 5+ years of board exam coaching experience.", color: "bg-violet-100 text-violet-600" },
  { icon: Target, title: "Exam-Focused Sessions", description: "Sessions built around important topics and high-scoring strategies.", color: "bg-orange-100 text-orange-600" },
  { icon: Calendar, title: "Flexible Scheduling", description: "Multiple time slots available throughout the week.", color: "bg-pink-100 text-pink-600" },
  { icon: Headphones, title: "Session Recordings", description: "Missed a class? Every session is recorded so you can rewatch anytime.", color: "bg-amber-100 text-amber-600" },
];

export default function LiveClassesPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [classes, setClasses] = useState<LiveClassItem[]>([]);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) { setLoading(false); return; }
    api.get("/live-classes/active")
      .then(({ data }) => {
        setClasses(data.data.classes);
        setIsSubscribed(data.data.isSubscribed);
        setLoaded(true);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [isAuthenticated]);

  const liveClasses = classes.filter((c) => c.status === "LIVE");
  const scheduledClasses = classes.filter((c) => c.status === "SCHEDULED");

  return (
    <div className="max-w-4xl mx-auto">
      <button onClick={() => router.back()} className="text-sm text-primary flex items-center gap-1 mb-4 hover:underline">
        <ArrowLeft className="w-3 h-3" /> Back
      </button>

      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-red-500 to-rose-600 p-8 sm:p-10 mb-8">
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
              <Radio className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white">Live Classes</h1>
              <p className="text-red-100">Face-to-face interactive sessions with expert teachers</p>
            </div>
          </div>
          {liveClasses.length > 0 && (
            <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2 inline-flex items-center gap-2 mb-4">
              <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
              <span className="text-white font-medium text-sm">{liveClasses.length} class{liveClasses.length > 1 ? "es" : ""} live now!</span>
            </div>
          )}
          <p className="text-white/90 text-base sm:text-lg max-w-xl leading-relaxed mb-6">
            Join live video sessions where you can see your teacher, ask doubts face-to-face,
            and interact with classmates in real-time.
          </p>
          {!isSubscribed && (
            <Link href="/subscription">
              <Button className="bg-white text-red-600 hover:bg-red-50 font-semibold px-6 py-2.5 rounded-lg text-base shadow-lg">
                Subscribe for Access <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          )}
        </div>
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full" />
        <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-white/10 rounded-full" />
      </div>

      {/* Live Now Section */}
      {loading ? (
        <PageLoader />
      ) : (
        <>
          {liveClasses.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <span className="w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse" />
                Live Now
              </h2>
              <div className="grid gap-4">
                {liveClasses.map((lc) => (
                  <Card key={lc.id} className="border-red-200 bg-red-50/50 hover:shadow-md transition-shadow">
                    <CardContent className="p-5">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <Radio className="w-4 h-4 text-red-500" />
                            <h3 className="font-semibold text-lg">{lc.title}</h3>
                            <Badge variant="success">LIVE</Badge>
                          </div>
                          {lc.description && <p className="text-sm text-gray-500 mb-1">{lc.description}</p>}
                          <p className="text-xs text-gray-400">by {lc.teacher.name}</p>
                        </div>
                        {lc.hasAccess ? (
                          <Link href={`/live-class/${lc.id}`}>
                            <Button className="bg-red-500 hover:bg-red-600 text-white">
                              <Play className="w-4 h-4 mr-2" /> Join Now
                            </Button>
                          </Link>
                        ) : (
                          <Link href="/subscription">
                            <Button variant="outline" className="border-red-300 text-red-600">
                              <Lock className="w-4 h-4 mr-2" /> Subscribe to Join
                            </Button>
                          </Link>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Upcoming Classes */}
          {scheduledClasses.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-500" />
                Upcoming Classes
              </h2>
              <div className="grid gap-3">
                {scheduledClasses.map((lc) => (
                  <Card key={lc.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-5">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <Clock className="w-4 h-4 text-blue-500" />
                            <h3 className="font-semibold">{lc.title}</h3>
                            <Badge variant="default">Scheduled</Badge>
                          </div>
                          {lc.description && <p className="text-sm text-gray-500 mb-1">{lc.description}</p>}
                          <div className="flex items-center gap-3 text-xs text-gray-400">
                            <span>by {lc.teacher.name}</span>
                            {lc.scheduledAt && (
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {new Date(lc.scheduledAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}
                              </span>
                            )}
                          </div>
                        </div>
                        {!lc.hasAccess && (
                          <Badge variant="default" className="flex items-center gap-1">
                            <Lock className="w-3 h-3" /> Subscription Required
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {loaded && classes.length === 0 && (
            <Card className="mb-8">
              <CardContent className="p-8 text-center text-gray-500">
                <Clock className="w-10 h-10 mx-auto mb-3 text-gray-300" />
                <p className="font-medium mb-1">No live classes right now</p>
                <p className="text-sm">Check back later or wait for a notification when a class is scheduled.</p>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* Benefits Grid */}
      <div className="mb-10">
        <h2 className="text-xl font-bold mb-5">Why Join Live Classes?</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {BENEFITS.map((b) => {
            const Icon = b.icon;
            return (
              <Card key={b.title} className="h-full hover:shadow-md transition-shadow">
                <CardContent className="p-5 flex items-start gap-4">
                  <div className={`w-11 h-11 rounded-lg flex items-center justify-center shrink-0 ${b.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm mb-1">{b.title}</h3>
                    <p className="text-sm text-gray-500 leading-relaxed">{b.description}</p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* What Makes Us Different */}
      <Card className="border-red-100 mb-10">
        <CardContent className="p-6">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Star className="w-5 h-5 text-red-500" /> What Makes Us Different
          </h2>
          <div className="space-y-3">
            {[
              "Batch size strictly limited to 10-15 students",
              "Teachers with 5+ years of board exam coaching experience",
              "Subject-wise and chapter-wise doubt sessions",
              "Special revision sessions before exams",
              "All sessions recorded — rewatch anytime",
              "Available in Hindi and English",
            ].map((point) => (
              <div key={point} className="flex items-start gap-3">
                <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                <p className="text-sm text-gray-600">{point}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* CTA */}
      {!isSubscribed && (
        <Card className="bg-gradient-to-r from-red-50 to-rose-50 border-red-100 mb-4">
          <CardContent className="p-8 text-center">
            <Zap className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="font-bold text-xl mb-2">Ready to Boost Your Learning?</h3>
            <p className="text-sm text-gray-500 mb-5 max-w-md mx-auto">
              Subscribe now to get access to live classes, doubt-clearing sessions,
              and all our premium content.
            </p>
            <Link href="/subscription">
              <Button className="bg-red-500 hover:bg-red-600 text-white font-semibold px-8 py-3 rounded-lg text-base shadow-md">
                View Subscription Plans <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
