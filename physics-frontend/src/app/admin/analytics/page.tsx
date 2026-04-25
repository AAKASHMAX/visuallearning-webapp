"use client";

import { useEffect, useState } from "react";
import { BarChart3, Users, CreditCard, Play } from "lucide-react";
import api from "@/lib/api";
import toast from "react-hot-toast";

interface Analytics {
  recentUsers: number;
  recentSubs: number;
  popularVideos: { videoId: string; title: string; _count: { videoId: number } }[];
}

export default function AdminAnalyticsPage() {
  const [data, setData] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/admin/analytics").then((res) => {
      setData(res.data);
      setLoading(false);
    }).catch(() => { toast.error("Failed to load"); setLoading(false); });
  }, []);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-text-bright">Analytics</h1>
        <p className="text-text-muted text-sm mt-1">Last 30 days overview</p>
      </div>

      {loading ? (
        <div className="space-y-6">
          <div className="grid sm:grid-cols-2 gap-6">{[...Array(2)].map((_, i) => <div key={i} className="h-28 rounded-xl bg-card animate-pulse" />)}</div>
          <div className="h-64 rounded-xl bg-card animate-pulse" />
        </div>
      ) : data ? (
        <>
          {/* Summary Cards */}
          <div className="grid sm:grid-cols-2 gap-6 mb-8">
            <div className="rounded-2xl border border-border bg-card p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent to-blue-600 flex items-center justify-center">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-text-bright">{data.recentUsers}</p>
                  <p className="text-xs text-text-muted">New Users (30d)</p>
                </div>
              </div>
            </div>
            <div className="rounded-2xl border border-border bg-card p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                  <CreditCard className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-text-bright">{data.recentSubs}</p>
                  <p className="text-xs text-text-muted">New Subscriptions (30d)</p>
                </div>
              </div>
            </div>
          </div>

          {/* Popular Videos */}
          <div className="rounded-2xl border border-border bg-card p-6">
            <h3 className="font-semibold text-text-bright mb-4 flex items-center gap-2">
              <Play className="w-4 h-4 text-accent" />
              Most Watched Videos
            </h3>
            {data.popularVideos.length === 0 ? (
              <p className="text-text-muted text-sm text-center py-8">No watch data yet</p>
            ) : (
              <div className="space-y-3">
                {data.popularVideos.map((video, i) => (
                  <div key={video.videoId} className="flex items-center gap-4 p-3 rounded-xl hover:bg-surface-light/50 transition-colors">
                    <span className="w-8 h-8 rounded-lg bg-surface-light flex items-center justify-center text-sm font-bold text-text-muted">
                      {i + 1}
                    </span>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-text-bright">{video.title}</p>
                    </div>
                    <span className="text-sm font-semibold text-accent">{video._count.videoId} views</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="text-center py-12">
          <BarChart3 className="w-12 h-12 text-text-muted mx-auto mb-3" />
          <p className="text-text-muted">No analytics data available</p>
        </div>
      )}
    </div>
  );
}
