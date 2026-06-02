"use client";

import Link from "next/link";
import {
  ArrowRight,
  BriefcaseBusiness,
  Check,
  GraduationCap,
  MonitorPlay,
  UsersRound,
} from "lucide-react";

const plans = [
  {
    title: "Students",
    subtitle: "Class 9 to 12 science learning with animated chapters, notes, quiz, and more.",
    href: "/courses/students",
    icon: GraduationCap,
    accent: "from-sky-500 to-cyan-400",
    accentText: "text-sky-600",
    accentBorder: "border-sky-200",
    accentBg: "bg-sky-50",
    features: [
      "3D animated video 9th - 12th",
      "Visual notes",
      "NCERT Solution (Advanced)",
      "PYQ Solution (Advanced)",
      "Quiz",
      "Download (Notes, NCERT Solution, PYQs)",
      "Email support",
    ],
  },
  {
    title: "Teachers",
    subtitle: "Class-wise teaching resources with videos, notes, PPTs, and test papers.",
    href: "/courses/teachers",
    icon: UsersRound,
    accent: "from-emerald-500 to-lime-400",
    accentText: "text-emerald-600",
    accentBorder: "border-emerald-200",
    accentBg: "bg-emerald-50",
    popular: true,
    features: [
      "3D animated video 9th - 12th",
      "Visual notes",
      "PPTs (Advanced)",
      "NCERT Solution (Advanced)",
      "PYQ Solution (Advanced)",
      "Quiz",
      "Download (Notes, NCERT Solution, PYQs)",
      "Email support",
      "Direct call support",
      "Content on demand (Notes, PPT, PYQs, Test Paper)",
    ],
  },
  {
    title: "Professionals",
    subtitle: "Subject tracks with advanced videos, PPTs, virtual labs, and collaboration.",
    href: "/courses/professional",
    icon: BriefcaseBusiness,
    accent: "from-violet-500 to-fuchsia-400",
    accentText: "text-violet-600",
    accentBorder: "border-violet-200",
    accentBg: "bg-violet-50",
    features: [
      "3D animated video subject wise",
      "Visual notes",
      "PPTs (Advanced)",
      "NCERT Solution (Advanced)",
      "PYQ Solution (Advanced)",
      "Quiz",
      "Download (Notes, NCERT Solution, PYQs)",
      "Email support",
      "Direct call support",
      "Content on demand (Notes, PPT, PYQs, Test Paper)",
      "Collaborate with company",
    ],
  },
];

export default function CoursesPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-10 flex flex-col gap-3 text-center">
        <div className="mx-auto inline-flex w-fit items-center gap-2 rounded-full border border-primary/10 bg-white px-3 py-1 text-xs font-black uppercase tracking-wider text-primary shadow-sm">
          <MonitorPlay className="h-4 w-4" />
          VisualLearning Courses
        </div>
        <h1 className="text-3xl font-black tracking-tight text-heading sm:text-4xl">
          Choose Your Learning Path
        </h1>
        <p className="mx-auto max-w-2xl text-sm leading-6 text-text-muted sm:text-base">
          Select a plan that fits your needs. Each path opens into class, subject, and chapter pages.
        </p>
      </div>

      <div className="flex flex-col gap-5 lg:flex-row lg:items-start">
        {plans.map((plan) => (
          <Link
            key={plan.title}
            href={plan.href}
            className={`group relative flex flex-1 flex-col overflow-hidden rounded-xl border bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/10 ${
              plan.popular
                ? "border-emerald-300 shadow-md lg:scale-[1.03]"
                : "border-gray-200 hover:border-primary/30"
            }`}
          >
            <div className={`h-1.5 bg-gradient-to-r ${plan.accent}`} />

            {plan.popular && (
              <div className="absolute right-4 top-4 rounded-full bg-emerald-500 px-3 py-0.5 text-[10px] font-black uppercase tracking-wider text-white shadow-sm">
                Popular
              </div>
            )}

            <div className="flex flex-col p-6">
              <div
                className={`flex h-14 w-14 items-center justify-center rounded-lg bg-gradient-to-br ${plan.accent} text-white shadow-lg shadow-gray-200 transition-transform group-hover:scale-105`}
              >
                <plan.icon className="h-7 w-7" />
              </div>

              <h2 className="mt-4 text-2xl font-black text-heading">{plan.title}</h2>
              <p className="mt-2 text-sm leading-6 text-text-muted">{plan.subtitle}</p>

              <div className="mt-6 flex flex-col gap-3">
                {plan.features.map((feature) => (
                  <div key={feature} className="flex items-start gap-2.5">
                    <div
                      className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${plan.accentBg}`}
                    >
                      <Check className={`h-3 w-3 ${plan.accentText}`} strokeWidth={3} />
                    </div>
                    <span className="text-sm leading-snug text-text-muted">{feature}</span>
                  </div>
                ))}
              </div>

              <div className="mt-8 flex items-center justify-center gap-2 rounded-lg bg-heading px-4 py-3 text-sm font-bold text-white transition-all group-hover:gap-3">
                Explore {plan.title}
                <ArrowRight className="h-4 w-4" />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
