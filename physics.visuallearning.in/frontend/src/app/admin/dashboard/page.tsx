"use client";

import { useEffect, useState } from "react";
import { Users, BookOpen, Play, CreditCard, TrendingUp, ArrowUpRight } from "lucide-react";
import api from "@/lib/api";
import Link from "next/link";

interface Stats {
  totalUsers: number;
  totalCourses: number;
  totalVideos: number;
  activeSubscriptions: number;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/admin/stats").then((res) => {
      setStats(res.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const statCards = stats ? [
    { label: "Total Students", value: stats.totalUsers, icon: Users, gradient: "from-accent to-blue-600", href: "/admin/users" },
    { label: "Courses", value: stats.totalCourses, icon: BookOpen, gradient: "from-secondary to-purple-600", href: "/admin/courses" },
    { label: "Videos", value: stats.totalVideos, icon: Play, gradient: "from-energy to-orange-600", href: "/admin/courses" },
    { label: "Active Subs", value: stats.activeSubscriptions, icon: CreditCard, gradient: "from-emerald-500 to-teal-600", href: "/admin/subscriptions" },
  ] : [];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-text-bright">Dashboard</h1>
        <p className="text-text-muted text-sm mt-1">PhysicsLab overview</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="rounded-2xl border border-border bg-card p-6 animate-pulse h-32" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {statCards.map((card, i) => (
            <Link
              key={i}
              href={card.href}
              className="rounded-2xl border border-border bg-card p-6 hover:border-accent/30 transition-all duration-300 hover:-translate-y-1 group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${card.gradient} flex items-center justify-center`}>
                  <card.icon className="w-5 h-5 text-white" />
                </div>
                <ArrowUpRight className="w-4 h-4 text-text-muted group-hover:text-accent transition-colors" />
              </div>
              <p className="text-2xl font-bold text-text-bright">{card.value}</p>
              <p className="text-sm text-text-muted">{card.label}</p>
            </Link>
          ))}
        </div>
      )}

      {/* Quick actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-border bg-card p-6">
          <h3 className="font-semibold text-text-bright mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-accent" />
            Quick Actions
          </h3>
          <div className="space-y-3">
            {[
              { label: "Add New Course", href: "/admin/courses", desc: "Create a physics course" },
              { label: "Manage Users", href: "/admin/users", desc: "View and manage students" },
              { label: "View Subscriptions", href: "/admin/subscriptions", desc: "Track active plans" },
              { label: "Create Coupon", href: "/admin/coupons", desc: "Add discount codes" },
            ].map((action, i) => (
              <Link
                key={i}
                href={action.href}
                className="block p-3 rounded-xl hover:bg-surface-light transition-colors"
              >
                <p className="text-sm font-medium text-text-bright">{action.label}</p>
                <p className="text-xs text-text-muted">{action.desc}</p>
              </Link>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6">
          <h3 className="font-semibold text-text-bright mb-4 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-secondary-light" />
            Course Tiers
          </h3>
          <div className="space-y-3">
            {[
              { tier: "BRIDGE", desc: "Foundation strengthening before advanced chapters", color: "text-orange-400" },
              { tier: "BASIC", desc: "All animated videos, notes, quizzes", color: "text-accent" },
              { tier: "ADVANCE", desc: "Everything + expert lectures, labs, board papers", color: "text-secondary-light" },
            ].map((t, i) => (
              <div key={i} className="p-3 rounded-xl bg-surface-light/50">
                <p className={`text-sm font-semibold ${t.color}`}>{t.tier}</p>
                <p className="text-xs text-text-muted">{t.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
