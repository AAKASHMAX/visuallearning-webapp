"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/auth";
import api from "@/lib/api";
import { BookOpen, CreditCard, PlayCircle, Radio, Users, Clock, Beaker } from "lucide-react";
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

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Welcome back, {user?.name}!</h1>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
              <CreditCard className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Subscription</p>
              {isActive ? (
                <Badge variant="success">{subscription!.plan} - Active</Badge>
              ) : (
                <Badge variant="warning">No active plan</Badge>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-accent" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Available</p>
              <p className="font-semibold">4 Classes, 16 Subjects</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
              <PlayCircle className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Content</p>
              <p className="font-semibold">Videos, Notes & MCQs</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Live Classes Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold">Live Classes</h2>
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
        ) : liveClasses.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="p-8 text-center">
              <Radio className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">No live classes right now</p>
              <p className="text-gray-400 text-sm mt-1">Check back later for upcoming sessions</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Live Now */}
            {liveNow.map((lc) => (
              <Card key={lc.id} className="border-red-200 bg-gradient-to-br from-red-50 to-white overflow-hidden hover:shadow-lg transition-shadow">
                <CardContent className="p-5">
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
                </CardContent>
              </Card>
            ))}

            {/* Scheduled */}
            {scheduled.map((lc) => (
              <Card key={lc.id} className="border-blue-100 bg-gradient-to-br from-blue-50 to-white hover:shadow-lg transition-shadow">
                <CardContent className="p-5">
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
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {!isActive && (
        <Card className="border-accent border-2 mb-8">
          <CardContent className="p-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-lg">Unlock all content</h3>
              <p className="text-gray-500">Subscribe to access all video lectures, notes, and practice questions.</p>
            </div>
            <Link href="/subscription"><Button variant="accent">View Plans</Button></Link>
          </CardContent>
        </Card>
      )}

      {/* Virtual Lab Quick Access */}
      <div className="mb-8">
        <Link href="/courses/virtual-lab">
          <div className="bg-gradient-to-r from-teal-500 to-cyan-600 text-white rounded-xl p-5 hover:shadow-lg transition-shadow cursor-pointer flex items-center gap-4">
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
              <Beaker className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-lg">Virtual Lab</h3>
              <p className="text-white/70 text-sm">64+ interactive 3D simulations &amp; experiments</p>
            </div>
            <span className="text-white/60 text-sm font-medium">Explore &rarr;</span>
          </div>
        </Link>
      </div>

      <h2 className="text-xl font-bold mb-4">Start Learning</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {["Class 9", "Class 10", "Class 11", "Class 12"].map((name) => (
          <Link key={name} href="/courses">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-6 text-center">
                <BookOpen className="w-10 h-10 text-primary mx-auto mb-3" />
                <h3 className="font-semibold">{name}</h3>
                <p className="text-sm text-gray-400">4 Subjects</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
