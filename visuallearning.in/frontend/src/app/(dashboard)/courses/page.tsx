"use client";

import Link from "next/link";
import {
  ArrowRight,
  BriefcaseBusiness,
  CheckCircle2,
  GraduationCap,
  MonitorPlay,
  ShieldCheck,
  UsersRound,
} from "lucide-react";

const audienceCards = [
  {
    title: "Students",
    subtitle: "Class 9 to 12 science learning with animated chapters, notes, quiz, and question bank.",
    href: "/courses/students",
    icon: GraduationCap,
    badge: "Class 9-12",
    accent: "from-sky-500 to-cyan-400",
    features: ["Animated videos", "Chapter notes", "Quiz practice", "Question bank"],
  },
  {
    title: "Teachers",
    subtitle: "Class-wise teaching resources with videos, notes, PPTs, question practice, and test series.",
    href: "/courses/teachers",
    icon: UsersRound,
    badge: "Teaching tools",
    accent: "from-emerald-500 to-lime-400",
    features: ["Animated videos", "PPTs", "Test series", "Question bank"],
  },
  {
    title: "Professionals",
    subtitle: "Subject tracks with advanced videos, PPTs, virtual labs, tests, and practice resources.",
    href: "/courses/professional",
    icon: BriefcaseBusiness,
    badge: "Subject tracks",
    accent: "from-violet-500 to-fuchsia-400",
    features: ["Animated videos", "PPTs", "Virtual lab", "Test series"],
  },
];

export default function CoursesPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-col gap-3">
        <div className="inline-flex w-fit items-center gap-2 rounded-full border border-primary/10 bg-white px-3 py-1 text-xs font-black uppercase tracking-wider text-primary shadow-sm">
          <MonitorPlay className="h-4 w-4" />
          VisualLearning Courses
        </div>
        <div className="max-w-3xl">
          <h1 className="text-3xl font-black tracking-tight text-heading sm:text-4xl">Choose Your Learning Path</h1>
          <p className="mt-3 text-sm leading-6 text-text-muted sm:text-base">
            Select one path first. Each path opens into clean class, subject, content, and chapter pages.
          </p>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        {audienceCards.map((card) => (
          <Link
            key={card.title}
            href={card.href}
            className="group relative overflow-hidden rounded-lg border border-gray-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/10"
          >
            <div className={`absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r ${card.accent}`} />
            <div className="mb-8 flex items-start justify-between gap-4">
              <div className={`flex h-14 w-14 items-center justify-center rounded-lg bg-gradient-to-br ${card.accent} text-white shadow-lg shadow-gray-200 transition-transform group-hover:scale-105`}>
                <card.icon className="h-7 w-7" />
              </div>
              <span className="rounded-full border border-gray-200 bg-surface px-3 py-1 text-[11px] font-black uppercase tracking-wider text-text-muted">
                {card.badge}
              </span>
            </div>

            <h2 className="text-2xl font-black text-heading">{card.title}</h2>
            <p className="mt-3 min-h-20 text-sm leading-6 text-text-muted">{card.subtitle}</p>

            <div className="mt-6 grid gap-2">
              {card.features.map((feature) => (
                <div key={feature} className="flex items-center gap-2 text-sm font-bold text-heading">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  {feature}
                </div>
              ))}
            </div>

            <div className="mt-8 flex items-center justify-between border-t border-gray-100 pt-5">
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-text-light">
                <ShieldCheck className="h-4 w-4 text-primary" />
                First chapter preview
              </div>
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-heading text-white transition-transform group-hover:translate-x-1">
                <ArrowRight className="h-4 w-4" />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
