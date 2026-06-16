"use client";

import { useEffect, useState } from "react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import api from "@/lib/api";
import { DEMOS } from "../demo/_components/demo-list";
import {
  BookOpen,
  Rocket,
  Check,
  Sparkles,
  GraduationCap,
  ArrowRight,
  CreditCard,
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

interface Plan {
  id: string;
  code: string;
  name: string;
  price: number;
  durationDays: number;
}

const isYearly = (p: Plan) => (p.durationDays || 0) >= 180;

// Seed the price cards so they paint instantly (same time as the class cards);
// the API fetch below refines them. Mirrors backend defaultPlanSeeds.
const DEFAULT_PLANS: Plan[] = [
  { id: "seed-11m", code: "CLASS_11_MONTHLY", name: "Class 11 Physics", price: 499, durationDays: 30 },
  { id: "seed-12m", code: "CLASS_12_MONTHLY", name: "Class 12 Physics", price: 699, durationDays: 30 },
  { id: "seed-11y", code: "CLASS_11_YEARLY", name: "Class 11 Physics", price: 1999, durationDays: 365 },
  { id: "seed-12y", code: "CLASS_12_YEARLY", name: "Class 12 Physics", price: 2999, durationDays: 365 },
];

export default function CoursesPage() {
  const [plans, setPlans] = useState<Plan[]>(DEFAULT_PLANS);
  const [cycle, setCycle] = useState<"monthly" | "yearly">("monthly");

  useEffect(() => {
    api.get("/subscription/plans")
      .then((r) => { if (Array.isArray(r.data) && r.data.length) setPlans(r.data); })
      .catch(() => { /* keep the seeded defaults */ });
  }, []);

  const priceCards = plans.filter((p) =>
    cycle === "yearly" ? isYearly(p) : !isYearly(p) && (p.durationDays || 0) > 0
  );

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

        {/* Demo section — small cards, above the class cards. */}
        <div className="mb-14">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-text-bright mb-2">
              Try a Free <span className="gradient-text">Demo</span>
            </h2>
            <p className="text-text-muted text-sm">No login required — explore real Class 12 content.</p>
          </div>
          <div className="mx-auto grid max-w-5xl gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
            {DEMOS.map((demo) => {
              const Icon = demo.icon;
              return (
                <Link
                  key={demo.href}
                  href={demo.href}
                  className="group flex flex-col items-center rounded-xl border border-border bg-card p-4 text-center transition-all duration-300 hover:-translate-y-1 hover:border-accent/40"
                >
                  <div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${demo.gradient} transition-transform duration-300 group-hover:scale-110`}>
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="text-sm font-bold leading-tight text-text-bright">{demo.title}</h3>
                  <span className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-accent transition-all group-hover:gap-1.5">
                    Try
                    <ArrowRight className="h-3 w-3" />
                  </span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Class (plan) cards */}
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

        {/* Subscription price cards (below the class cards) — price only, no feature list. */}
        {priceCards.length > 0 && (
          <div className="mt-16">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-text-bright mb-3">
                Subscription <span className="gradient-text">Plans</span>
              </h2>
              <div className="inline-flex items-center gap-1 rounded-xl border border-border bg-card p-1">
                {(["monthly", "yearly"] as const).map((c) => (
                  <button
                    key={c}
                    onClick={() => setCycle(c)}
                    className={`rounded-lg px-5 py-1.5 text-sm font-semibold capitalize transition-all ${
                      cycle === c ? "bg-accent text-primary" : "text-text-muted hover:text-text-bright"
                    }`}
                  >
                    {c}
                    {c === "yearly" && <span className="ml-1.5 text-[10px] text-emerald-400">Save</span>}
                  </button>
                ))}
              </div>
            </div>
            <div className="mx-auto grid max-w-4xl gap-6 sm:grid-cols-2">
              {priceCards.map((p) => (
                <div
                  key={p.id}
                  className="relative flex flex-col rounded-2xl border border-border bg-card p-6 transition-all duration-300 hover:-translate-y-1 hover:border-accent/40"
                >
                  <div className="mb-3 flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent/10">
                      <CreditCard className="h-4 w-4 text-accent" />
                    </span>
                    <h3 className="text-lg font-bold text-text-bright">{p.name}</h3>
                  </div>
                  <div className="flex items-end gap-1">
                    <span className="text-base text-text-muted">&#8377;</span>
                    <span className="text-3xl font-extrabold text-text-bright">{p.price.toLocaleString("en-IN")}</span>
                    <span className="mb-1 text-sm text-text-muted">/{isYearly(p) ? "year" : "month"}</span>
                  </div>
                  <Link
                    href={`/subscription?plan=${p.code}`}
                    className="mt-5 flex items-center justify-center gap-2 rounded-xl bg-accent px-5 py-2.5 text-sm font-bold text-primary transition-all hover:gap-3 hover:bg-accent/90"
                  >
                    Subscribe
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}

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
