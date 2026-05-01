"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Lightbulb,
  BookOpen,
  Rocket,
  Play,
  FlaskConical,
  FileText,
  Check,
  ChevronRight,
  Lock,
} from "lucide-react";

const courses = [
  {
    tier: "free",
    title: "Free Course",
    subtitle: "Get Started",
    description: "Explore physics with free animated videos, basic notes, and introductory quizzes.",
    features: [
      "First chapter of every topic free",
      "Selected 3D animations",
      "Basic chapter notes",
      "Introductory MCQ quizzes",
    ],
    icon: Lightbulb,
    gradient: "from-emerald-500 to-teal-600",
    borderColor: "border-emerald-500/30",
    glowColor: "hover:shadow-[0_0_40px_rgba(16,185,129,0.15)]",
    tag: "Free Forever",
    tagColor: "bg-emerald-500/10 text-emerald-400",
    locked: false,
  },
  {
    tier: "basic",
    title: "Basic Course",
    subtitle: "Build Foundation",
    description: "Complete chapter-wise video lectures with notes and quizzes for strong fundamentals.",
    features: [
      "All animated video lectures",
      "Complete chapter notes (PDF)",
      "Chapter-wise MCQ quizzes",
      "Progress tracking dashboard",
    ],
    icon: BookOpen,
    gradient: "from-accent to-blue-600",
    borderColor: "border-accent/30",
    glowColor: "hover:shadow-[0_0_40px_rgba(0,212,255,0.15)]",
    tag: "Most Popular",
    tagColor: "bg-accent/10 text-accent",
    locked: true,
  },
  {
    tier: "advance",
    title: "Advance Course",
    subtitle: "Go Beyond",
    description: "Everything in Basic plus expert lectures, virtual labs, board papers, and priority support.",
    features: [
      "Everything in Basic",
      "Expert lecture videos",
      "3D Virtual Lab experiments",
      "Previous year board papers",
    ],
    icon: Rocket,
    gradient: "from-secondary to-purple-600",
    borderColor: "border-secondary/30",
    glowColor: "hover:shadow-[0_0_40px_rgba(124,58,237,0.15)]",
    tag: "Best Value",
    tagColor: "bg-secondary/10 text-secondary-light",
    locked: true,
  },
];

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

        {/* Course Cards */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-text-bright mb-2">Your Courses</h2>
          <p className="text-text-muted text-sm">Pick a course and start learning</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {courses.map((course, i) => (
            <div
              key={i}
              className={`relative rounded-2xl border ${course.borderColor} bg-card p-8 transition-all duration-500 ${course.glowColor} hover:-translate-y-2 group flex flex-col`}
            >
              {/* Tag */}
              <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold mb-6 w-fit ${course.tagColor}`}>
                {course.tag}
              </div>

              {/* Icon */}
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${course.gradient} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                <course.icon className="w-7 h-7 text-white" />
              </div>

              <h3 className="text-xl font-bold text-text-bright mb-1">{course.title}</h3>
              <p className="text-sm text-accent mb-3">{course.subtitle}</p>
              <p className="text-text-muted text-sm leading-relaxed mb-6">{course.description}</p>

              {/* Features */}
              <ul className="space-y-3 mb-8 flex-1">
                {course.features.map((feature, j) => (
                  <li key={j} className="flex items-start gap-3 text-sm">
                    <Check className="w-4 h-4 text-success mt-0.5 shrink-0" />
                    <span className="text-text-muted">{feature}</span>
                  </li>
                ))}
              </ul>

              <Link href={`/courses/${course.tier}`}>
                <Button
                  variant={i === 1 ? "primary" : i === 2 ? "secondary" : "outline"}
                  className="w-full"
                >
                  {course.locked && <Lock className="w-4 h-4 mr-2" />}
                  Start Learning
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </main>
  );
}
