"use client";
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { PageLoader } from "@/components/ui/loading";
import api from "@/lib/api";
import { TrendingUp, PlayCircle } from "lucide-react";

export default function AdminAnalyticsPage() {
  const [mostWatched, setMostWatched] = useState<any[]>([]);
  const [revenue, setRevenue] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get("/admin/analytics/most-watched"),
      api.get("/admin/analytics/revenue"),
    ]).then(([mw, rev]) => {
      setMostWatched(mw.data.data || []);
      setRevenue(rev.data.data || {});
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <PageLoader />;

  const revenueEntries = Object.entries(revenue).sort(([a], [b]) => a.localeCompare(b));
  const totalRevenue = revenueEntries.reduce((sum, [, v]) => sum + v, 0);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Analytics</h1>

      {/* Revenue */}
      <Card className="mb-8">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <TrendingUp className="w-5 h-5 text-green-600" />
            <h2 className="font-semibold text-lg">Revenue by Month</h2>
            <span className="ml-auto text-lg font-bold text-green-600">Total: Rs {totalRevenue.toLocaleString()}</span>
          </div>
          {revenueEntries.length > 0 ? (
            <div className="space-y-3">
              {revenueEntries.map(([month, amount]) => (
                <div key={month} className="flex items-center gap-4">
                  <span className="w-24 text-sm font-medium text-gray-600">{month}</span>
                  <div className="flex-1 bg-gray-100 rounded-full h-6 overflow-hidden">
                    <div className="bg-green-500 h-full rounded-full flex items-center justify-end px-2"
                      style={{ width: `${Math.max((amount / Math.max(...Object.values(revenue))) * 100, 10)}%` }}>
                      <span className="text-xs text-white font-medium">Rs {amount.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400">No revenue data yet.</p>
          )}
        </CardContent>
      </Card>

      {/* Most Watched */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <PlayCircle className="w-5 h-5 text-primary" />
            <h2 className="font-semibold text-lg">Most Watched Videos</h2>
          </div>
          {mostWatched.length > 0 ? (
            <table className="w-full text-sm">
              <thead><tr className="border-b text-left text-gray-500"><th className="pb-2">#</th><th className="pb-2">Video</th><th className="pb-2">Chapter</th><th className="pb-2">Views</th></tr></thead>
              <tbody>
                {mostWatched.map((v: any, i: number) => (
                  <tr key={i} className="border-b last:border-0">
                    <td className="py-3 font-bold text-primary">{i + 1}</td>
                    <td className="py-3 font-medium">{v.title || "Unknown"}</td>
                    <td className="py-3 text-gray-500">{v.chapter?.name || ""}</td>
                    <td className="py-3 font-bold">{v.watchCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-gray-400">No watch data yet.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
