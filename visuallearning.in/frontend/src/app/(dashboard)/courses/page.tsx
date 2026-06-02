"use client";

import Link from "next/link";
import {
  ArrowRight,
  BriefcaseBusiness,
  Check,
  Crown,
  GraduationCap,
  MonitorPlay,
  Sparkles,
  Star,
  UsersRound,
  X,
} from "lucide-react";

const allFeatures = [
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
  "Collaborate with company",
];

const plans = [
  {
    title: "Students",
    subtitle: "Class 9-12 science learning with animated chapters, notes, quiz, and more.",
    href: "/courses/students",
    icon: GraduationCap,
    gradient: "from-blue-600 via-sky-500 to-cyan-400",
    btnGradient: "from-blue-600 to-cyan-500",
    accentText: "text-sky-600",
    accentBg: "bg-sky-50",
    glowColor: "shadow-sky-500/20",
    ringColor: "ring-sky-100",
    included: new Set([
      "3D animated video 9th - 12th",
      "Visual notes",
      "NCERT Solution (Advanced)",
      "PYQ Solution (Advanced)",
      "Quiz",
      "Download (Notes, NCERT Solution, PYQs)",
      "Email support",
    ]),
  },
  {
    title: "Teachers",
    subtitle: "Teaching resources with videos, notes, PPTs, and test papers.",
    href: "/courses/teachers",
    icon: UsersRound,
    gradient: "from-emerald-600 via-emerald-500 to-teal-400",
    btnGradient: "from-emerald-600 to-teal-500",
    accentText: "text-emerald-600",
    accentBg: "bg-emerald-50",
    glowColor: "shadow-emerald-500/20",
    ringColor: "ring-emerald-100",
    popular: true,
    included: new Set([
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
    ]),
  },
  {
    title: "Professionals",
    subtitle: "Advanced subject tracks with PPTs, labs, and company collaboration.",
    href: "/courses/professional",
    icon: BriefcaseBusiness,
    gradient: "from-violet-600 via-purple-500 to-fuchsia-400",
    btnGradient: "from-violet-600 to-fuchsia-500",
    accentText: "text-violet-600",
    accentBg: "bg-violet-50",
    glowColor: "shadow-violet-500/20",
    ringColor: "ring-violet-100",
    included: new Set([
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
    ]),
  },
];

function getFeatureLabel(feature: string, planTitle: string) {
  if (feature === "3D animated video 9th - 12th" && planTitle === "Professionals") {
    return "3D animated video subject wise";
  }
  return feature;
}

function isIncluded(feature: string, plan: (typeof plans)[number]) {
  if (feature === "3D animated video 9th - 12th" && plan.title === "Professionals") {
    return plan.included.has("3D animated video subject wise");
  }
  return plan.included.has(feature);
}

export default function CoursesPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-12 flex flex-col items-center gap-4 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/10 bg-white px-4 py-1.5 text-xs font-black uppercase tracking-wider text-primary shadow-sm">
          <Sparkles className="h-3.5 w-3.5" />
          VisualLearning Courses
        </div>
        <h1 className="text-3xl font-black tracking-tight text-heading sm:text-4xl lg:text-5xl">
          Choose Your Learning Path
        </h1>
        <p className="max-w-2xl text-sm leading-relaxed text-text-muted sm:text-base">
          Pick the plan that suits you best. Every plan includes a free first-chapter preview.
        </p>
      </div>

      {/* Plan cards */}
      <div className="flex flex-col items-stretch gap-6 lg:flex-row">
        {plans.map((plan) => {
          const includedCount = allFeatures.filter((f) => isIncluded(f, plan)).length;
          return (
            <Link
              key={plan.title}
              href={plan.href}
              className={`group relative flex flex-1 flex-col overflow-hidden rounded-2xl bg-white transition-all duration-300 hover:-translate-y-1.5 ${
                plan.popular
                  ? `ring-2 ring-emerald-400/60 shadow-xl ${plan.glowColor} lg:scale-[1.04]`
                  : `ring-1 ${plan.ringColor} shadow-md hover:shadow-xl hover:${plan.glowColor}`
              }`}
            >
              {/* Popular ribbon */}
              {plan.popular && (
                <div className="absolute left-0 right-0 top-0 z-10 flex items-center justify-center gap-1.5 bg-gradient-to-r from-emerald-500 to-teal-400 py-1.5 text-[10px] font-black uppercase tracking-widest text-white">
                  <Crown className="h-3 w-3" />
                  Most Popular
                </div>
              )}

              {/* Gradient header */}
              <div
                className={`relative overflow-hidden bg-gradient-to-br ${plan.gradient} px-6 pb-6 ${plan.popular ? "pt-10" : "pt-6"}`}
              >
                {/* Decorative circles */}
                <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-white/10" />
                <div className="absolute -bottom-4 -left-4 h-16 w-16 rounded-full bg-white/10" />
                <div className="absolute right-12 top-1/2 h-8 w-8 rounded-full bg-white/5" />

                <div className="relative flex items-start justify-between">
                  <div>
                    <h2 className="text-2xl font-black text-white">{plan.title}</h2>
                    <p className="mt-1.5 max-w-[220px] text-xs leading-relaxed text-white/75">
                      {plan.subtitle}
                    </p>
                  </div>
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-white/20 text-white shadow-lg shadow-black/10 backdrop-blur-sm transition-transform group-hover:scale-110 group-hover:rotate-3">
                    <plan.icon className="h-7 w-7" />
                  </div>
                </div>

                {/* Feature count badge */}
                <div className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-[11px] font-bold text-white backdrop-blur-sm">
                  <Star className="h-3 w-3" />
                  {includedCount} of {allFeatures.length} features
                </div>
              </div>

              {/* Features list */}
              <div className="flex flex-1 flex-col px-6 pb-6 pt-5">
                <div className="flex flex-1 flex-col gap-0.5">
                  {allFeatures.map((feature, i) => {
                    const included = isIncluded(feature, plan);
                    const label = getFeatureLabel(feature, plan.title);
                    return (
                      <div
                        key={feature}
                        className={`flex items-center gap-3 rounded-lg px-2.5 py-2 ${
                          i % 2 === 0 ? "bg-gray-50/80" : ""
                        } ${!included ? "opacity-40" : ""}`}
                      >
                        {included ? (
                          <div
                            className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${plan.accentBg}`}
                          >
                            <Check className={`h-3 w-3 ${plan.accentText}`} strokeWidth={3} />
                          </div>
                        ) : (
                          <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-red-50">
                            <X className="h-3 w-3 text-red-400" strokeWidth={3} />
                          </div>
                        )}
                        <span
                          className={`text-[13px] leading-snug ${
                            included
                              ? "font-medium text-gray-700"
                              : "font-normal text-gray-400 line-through"
                          }`}
                        >
                          {label}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* CTA button */}
                <div
                  className={`mt-6 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r ${plan.btnGradient} px-5 py-3.5 text-sm font-bold text-white shadow-lg ${plan.glowColor} transition-all group-hover:gap-3 group-hover:shadow-xl`}
                >
                  Explore {plan.title}
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
