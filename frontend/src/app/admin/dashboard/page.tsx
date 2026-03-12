"use client";
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { PageLoader } from "@/components/ui/loading";
import api from "@/lib/api";
import { Users, CreditCard, PlayCircle, TrendingUp } from "lucide-react";

interface Stats {
  totalUsers: number;
  activeSubscriptions: number;
  totalRevenue: number;
  totalVideos: number;
  recentUsers: { id: string; name: string; email: string; createdAt: string }[];
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/admin/stats").then(({ data }) => setStats(data.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <PageLoader />;
  if (!stats) return <p>Failed to load stats</p>;

  const cards = [
    { label: "Total Students", value: stats.totalUsers, icon: Users, color: "bg-blue-500" },
    { label: "Active Subscriptions", value: stats.activeSubscriptions, icon: CreditCard, color: "bg-green-500" },
    { label: "Total Revenue", value: `Rs ${stats.totalRevenue.toLocaleString()}`, icon: TrendingUp, color: "bg-amber-500" },
    { label: "Total Videos", value: stats.totalVideos, icon: PlayCircle, color: "bg-purple-500" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {cards.map((c) => (
          <Card key={c.label}>
            <CardContent className="p-6 flex items-center gap-4">
              <div className={`w-12 h-12 ${c.color} rounded-lg flex items-center justify-center`}>
                <c.icon className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-500">{c.label}</p>
                <p className="text-2xl font-bold">{c.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardContent className="p-6">
          <h2 className="font-semibold mb-4">Recent Signups</h2>
          <table className="w-full text-sm">
            <thead><tr className="border-b text-left text-gray-500"><th className="pb-2">Name</th><th className="pb-2">Email</th><th className="pb-2">Joined</th></tr></thead>
            <tbody>
              {stats.recentUsers.map((u) => (
                <tr key={u.id} className="border-b last:border-0">
                  <td className="py-3 font-medium">{u.name}</td>
                  <td className="py-3 text-gray-500">{u.email}</td>
                  <td className="py-3 text-gray-400">{new Date(u.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
