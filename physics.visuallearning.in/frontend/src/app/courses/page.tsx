"use client";

import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  BookOpen,
  Rocket,
  Check,
  Sparkles,
  GraduationCap,
  ArrowRight,
} from "lucide-react";

type ClassCard = {
  tier: string;
  title: string;
  subtitle: string;
  description: string;
  features: string[];
  icon: typeof BookOpen;
  gradient: string;
  borderColor: string;
  glowColor: string;
  tag: string;
  tagColor: string;
};

const classCards: ClassCard[] = [
  {
    tier: "11",
    title: "Class 11 Physics",
    subtitle: "Build a Strong Foundation",
    description: "Master Class 11 physics with animated lessons, notes, and practice.",
    features: ["3D Animated Videos", "Notes", "NCERT Solution", "Important Questions", "Quiz"],
    icon: BookOpen,
    gradient: "from-accent to-blue-600",
    borderColor: "border-accent/30",
    glowColor: "hover:shadow-[0_0_40px_rgba(0,212,255,0.15)]",
    tag: "Foundation",
    tagColor: "bg-accent/10 text-accent",
  },
  {
    tier: "12",
    title: "Class 12 Physics",
    subtitle: "Board & Competitive Ready",
    description: "Ace Class 12 physics with animated lessons, solved PYQs, and quizzes.",
    features: ["3D Animated Videos", "Notes", "NCERT Solution", "PYQs", "Quiz"],
    icon: Rocket,
    gradient: "from-secondary to-purple-600",
    borderColor: "border-secondary/30",
    glowColor: "hover:shadow-[0_0_40px_rgba(124,58,237,0.15)]",
    tag: "Board Exam",
    tagColor: "bg-secondary/10 text-secondary-light",
  },
];

export default function CoursesPage() {
  return (
    <main className="min-h-screen bg-primary">
      <Navbar />
      <div className="pt-28 pb-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-4">
            <GraduationCap className="w-4 h-4 text-accent" />
            <span className="text-sm text-text-muted">Choose Your Class</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-text-bright mb-4">
            Physics <span className="gradient-text">Courses</span>
          </h1>
          <p className="text-text-muted max-w-2xl mx-auto">
            Pick your class to explore animated chapters, notes, and practice.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 max-w-4xl mx-auto">
          {classCards.map((course) => {
            const Icon = course.icon;
            return (
              <div
                key={course.tier}
                className={`relative rounded-2xl border ${course.borderColor} bg-card p-8 transition-all duration-500 ${course.glowColor} hover:-translate-y-2 group flex flex-col`}
              >
                <div className={`absolute right-5 top-5 inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${course.tagColor}`}>
                  {course.tag}
                </div>

                <div className="mb-6 flex items-center gap-4 pr-24">
                  <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${course.gradient} transition-transform duration-300 group-hover:scale-110`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-xl font-bold leading-tight text-text-bright">{course.title}</h3>
                    <p className="mt-1 text-sm text-accent">{course.subtitle}</p>
                  </div>
                </div>

                <p className="text-text-muted text-sm leading-relaxed mb-6">{course.description}</p>

                <div className="mb-8 flex-1 space-y-3">
                  {course.features.map((feature) => (
                    <div
                      key={feature}
                      className="flex items-center gap-3 rounded-xl border border-border/70 bg-surface/70 px-3 py-3 shadow-[0_10px_26px_rgba(0,0,0,0.14)] transition-colors duration-300 group-hover:border-accent/30"
                    >
                      <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ${course.gradient}`}>
                        <Check className="h-4 w-4 text-white" />
                      </span>
                      <span className="text-sm font-medium leading-snug text-text-bright">{feature}</span>
                    </div>
                  ))}
                </div>

                <Link href={`/courses/${course.tier}`} className="block">
                  <Button variant={course.tier === "12" ? "secondary" : "primary"} className="w-full">
                    Explore {course.title}
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </Link>
              </div>
            );
          })}
        </div>

        <div className="text-center mt-12">
          <div className="inline-flex items-center gap-2 glass rounded-full px-6 py-3">
            <Sparkles className="w-4 h-4 text-energy" />
            <span className="text-sm text-text-muted">
              Every class includes animated chapters, notes, and practice questions.
            </span>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}
