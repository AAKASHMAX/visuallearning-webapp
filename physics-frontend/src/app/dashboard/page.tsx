"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Atom, BookOpen, Play, FlaskConical, FileText } from "lucide-react";

export default function DashboardPage() {
  const { isAuthenticated, user, hydrate } = useAuth();
  const router = useRouter();

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/auth/login");
    }
  }, [isAuthenticated, router]);

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

        {/* Placeholder for course content */}
        <div className="rounded-2xl border border-border bg-card p-12 text-center">
          <Atom className="w-12 h-12 text-accent mx-auto mb-4 animate-pulse" />
          <h2 className="text-xl font-bold text-text-bright mb-2">
            Course Content Coming Soon
          </h2>
          <p className="text-text-muted max-w-md mx-auto">
            Chapters, videos, and interactive content will be integrated here.
            Stay tuned for the complete physics learning experience!
          </p>
        </div>
      </div>
      <Footer />
    </main>
  );
}
