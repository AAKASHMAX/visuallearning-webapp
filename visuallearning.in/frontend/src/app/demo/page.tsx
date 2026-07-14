"use client";

import Link from "next/link";
import {
  ArrowRight,
  BookMarked,
  Brain,
  FileCheck2,
  FileText,
  GraduationCap,
  MonitorPlay,
  Presentation,
  Sparkles,
} from "lucide-react";

const demos = [
  {
    title: "3D Animated Videos",
    description: "Immersive 3D animations that bring science concepts to life with interactive walkthroughs.",
    href: "/demo/video",
    icon: MonitorPlay,
    gradient: "from-violet-600 via-purple-500 to-fuchsia-500",
    glow: "shadow-violet-500/20",
  },
  {
    title: "Lecture Videos",
    description: "Recorded teacher lessons that walk through each concept step by step, chapter by chapter.",
    href: "/demo/lecture",
    icon: GraduationCap,
    gradient: "from-sky-500 via-blue-500 to-indigo-600",
    glow: "shadow-blue-500/20",
  },
  {
    title: "Visual Notes",
    description: "Beautifully structured notes with highlights, diagrams, and key takeaways.",
    href: "/demo/visual-notes",
    icon: FileText,
    gradient: "from-sky-600 via-cyan-500 to-blue-500",
    glow: "shadow-sky-500/20",
  },
  {
    title: "Presentations (PPTs)",
    description: "Ready-to-use teaching slides with clear visuals and structured chapter flow.",
    href: "/demo/ppt",
    icon: Presentation,
    gradient: "from-indigo-600 via-blue-500 to-cyan-500",
    glow: "shadow-indigo-500/20",
  },
  {
    title: "NCERT Solutions",
    description: "Detailed step-by-step answers with exam tips for every NCERT textbook question.",
    href: "/demo/ncert-solution",
    icon: BookMarked,
    gradient: "from-emerald-600 via-teal-500 to-cyan-500",
    glow: "shadow-emerald-500/20",
  },
  {
    title: "PYQ Solutions",
    description: "Year-wise solved board exam questions with marking schemes and answer strategies.",
    href: "/demo/pyq",
    icon: FileCheck2,
    gradient: "from-rose-600 via-orange-500 to-amber-500",
    glow: "shadow-rose-500/20",
  },
  {
    title: "Interactive Quiz",
    description: "MCQ-based quizzes with instant feedback, scoring, and detailed result analysis.",
    href: "/demo/quiz",
    icon: Brain,
    gradient: "from-amber-500 via-orange-500 to-rose-500",
    glow: "shadow-amber-500/20",
  },
];

export default function DemoIndexPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-12 flex flex-col items-center gap-4 text-center">
        <div className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-violet-500/10 to-fuchsia-500/10 px-4 py-1.5 text-xs font-black uppercase tracking-wider text-violet-600">
          <Sparkles className="h-3.5 w-3.5" />
          Try Before You Buy
        </div>
        <h1 className="text-3xl font-black tracking-tight text-heading sm:text-4xl lg:text-5xl">
          Explore Our Features
        </h1>
        <p className="max-w-2xl text-sm leading-relaxed text-text-muted sm:text-base">
          Experience every feature with interactive demos. No login or subscription required.
        </p>
      </div>

      {/* Demo grid */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {demos.map((demo) => (
          <Link
            key={demo.title}
            href={demo.href}
            className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
          >
            {/* Gradient top bar */}
            <div className={`h-1.5 bg-gradient-to-r ${demo.gradient}`} />

            <div className="p-6">
              {/* Icon */}
              <div
                className={`mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br ${demo.gradient} text-white shadow-lg ${demo.glow} transition-transform group-hover:scale-110 group-hover:rotate-3`}
              >
                <demo.icon className="h-7 w-7" />
              </div>

              <h2 className="text-lg font-black text-heading">{demo.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-text-muted">{demo.description}</p>

              <div className="mt-5 flex items-center gap-2 text-sm font-bold text-primary transition-all group-hover:gap-3">
                Try Demo
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Bottom CTA */}
      <div className="mt-12 flex flex-col items-center gap-4 rounded-2xl bg-gradient-to-r from-primary via-primary-dark to-primary p-8 text-center text-white shadow-xl">
        <h3 className="text-2xl font-black">Ready to Get Full Access?</h3>
        <p className="max-w-lg text-sm text-white/70">
          Unlock every feature for all chapters and subjects with our affordable plans.
        </p>
        <Link
          href="/courses"
          className="inline-flex items-center gap-2 rounded-lg bg-white px-6 py-3 text-sm font-bold text-primary shadow-md transition-all hover:gap-3 hover:shadow-lg"
        >
          View Plans
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
