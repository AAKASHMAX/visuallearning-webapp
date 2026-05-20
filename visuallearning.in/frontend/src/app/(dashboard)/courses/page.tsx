"use client";

import Link from "next/link";
import {
  ArrowRight,
  BriefcaseBusiness,
  Brain,
  Clock3,
  ClipboardList,
  FileQuestion,
  FileText,
  FlaskConical,
  GraduationCap,
  MonitorPlay,
  Presentation,
  ShieldCheck,
  UsersRound,
} from "lucide-react";

type FeatureKind = "videos" | "notes" | "quiz" | "question-bank" | "ppts" | "virtual-lab" | "test-series";

type FeatureItem = {
  label: string;
  kind: FeatureKind;
};

const comingSoonFeatureKinds = new Set<FeatureKind>(["question-bank", "ppts", "test-series"]);

const featureVisuals: Record<FeatureKind, { icon: any; bg: string; glow: string; detail: string }> = {
  videos: {
    icon: MonitorPlay,
    bg: "from-violet-500 via-fuchsia-500 to-pink-500",
    glow: "shadow-fuchsia-500/25",
    detail: "3D lessons",
  },
  notes: {
    icon: FileText,
    bg: "from-sky-500 via-cyan-500 to-blue-600",
    glow: "shadow-sky-500/25",
    detail: "PDF study",
  },
  quiz: {
    icon: Brain,
    bg: "from-emerald-500 via-teal-500 to-cyan-500",
    glow: "shadow-emerald-500/25",
    detail: "MCQ check",
  },
  "question-bank": {
    icon: FileQuestion,
    bg: "from-amber-400 via-orange-500 to-rose-500",
    glow: "shadow-orange-500/25",
    detail: "Practice set",
  },
  ppts: {
    icon: Presentation,
    bg: "from-indigo-500 via-blue-500 to-cyan-500",
    glow: "shadow-indigo-500/25",
    detail: "Slides",
  },
  "virtual-lab": {
    icon: FlaskConical,
    bg: "from-teal-500 via-emerald-500 to-lime-400",
    glow: "shadow-teal-500/25",
    detail: "Experiments",
  },
  "test-series": {
    icon: ClipboardList,
    bg: "from-rose-500 via-red-500 to-orange-500",
    glow: "shadow-rose-500/25",
    detail: "Assessment",
  },
};

const audienceCards = [
  {
    title: "Students",
    subtitle: "Class 9 to 12 science learning with animated chapters, notes, quiz, and question bank.",
    href: "/courses/students",
    icon: GraduationCap,
    badge: "Class 9-12",
    accent: "from-sky-500 to-cyan-400",
    features: [
      { label: "Videos", kind: "videos" },
      { label: "Notes", kind: "notes" },
      { label: "Quiz", kind: "quiz" },
      { label: "NCERT Q&A", kind: "question-bank" },
    ],
  },
  {
    title: "Teachers",
    subtitle: "Class-wise teaching resources with videos, notes, PPTs, question practice, and test series.",
    href: "/courses/teachers",
    icon: UsersRound,
    badge: "Teaching tools",
    accent: "from-emerald-500 to-lime-400",
    features: [
      { label: "Videos", kind: "videos" },
      { label: "PPTs", kind: "ppts" },
      { label: "Test Series", kind: "test-series" },
      { label: "NCERT Q&A", kind: "question-bank" },
    ],
  },
  {
    title: "Professionals",
    subtitle: "Subject tracks with advanced videos, PPTs, virtual labs, tests, and practice resources.",
    href: "/courses/professional",
    icon: BriefcaseBusiness,
    badge: "Subject tracks",
    accent: "from-violet-500 to-fuchsia-400",
    features: [
      { label: "Videos", kind: "videos" },
      { label: "PPTs", kind: "ppts" },
      { label: "Virtual Lab", kind: "virtual-lab" },
      { label: "Test Series", kind: "test-series" },
    ],
  },
] satisfies Array<{
  title: string;
  subtitle: string;
  href: string;
  icon: any;
  badge: string;
  accent: string;
  features: FeatureItem[];
}>;

function FeatureInfographic({ feature }: { feature: FeatureItem }) {
  const visual = featureVisuals[feature.kind];
  const Icon = visual.icon;
  const comingSoon = comingSoonFeatureKinds.has(feature.kind);

  return (
    <div className={`flex items-center gap-3 rounded-lg border p-2.5 shadow-sm transition-all group-hover:shadow-md ${comingSoon ? "border-amber-200 bg-amber-50/70 group-hover:border-amber-300" : "border-gray-100 bg-white group-hover:border-primary/10"}`}>
      <div className={`relative flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-gradient-to-br ${visual.bg} text-white shadow-lg ${visual.glow}`}>
        <span className="absolute -right-2 -top-2 h-7 w-7 rounded-full bg-white/30" />
        <span className="absolute bottom-1 left-1 h-2.5 w-8 rounded-full bg-black/10" />
        {feature.kind === "videos" && (
          <>
            <span className="absolute left-1 top-2 h-1.5 w-1.5 rounded-sm bg-white/70" />
            <span className="absolute left-1 bottom-2 h-1.5 w-1.5 rounded-sm bg-white/70" />
            <span className="absolute right-1 top-2 h-1.5 w-1.5 rounded-sm bg-white/70" />
            <span className="absolute right-1 bottom-2 h-1.5 w-1.5 rounded-sm bg-white/70" />
          </>
        )}
        {feature.kind === "notes" && (
          <span className="absolute right-2 top-2 h-5 w-4 rounded-sm bg-white/25 shadow-inner" />
        )}
        {feature.kind === "ppts" && (
          <span className="absolute bottom-2 right-2 h-5 w-6 rounded-sm border border-white/50 bg-white/15" />
        )}
        {feature.kind === "virtual-lab" && (
          <>
            <span className="absolute right-3 top-2 h-2 w-2 rounded-full bg-white/65" />
            <span className="absolute left-3 top-4 h-1.5 w-1.5 rounded-full bg-white/50" />
          </>
        )}
        <Icon className="relative h-7 w-7 drop-shadow-sm" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="block text-xs font-black leading-tight text-heading">{feature.label}</span>
          {comingSoon && (
            <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-white px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wide text-amber-700">
              <Clock3 className="h-2.5 w-2.5" />
              Soon
            </span>
          )}
        </div>
        <span className="mt-0.5 block text-[10px] font-bold uppercase tracking-wide text-text-light">
          {comingSoon ? "Coming soon" : visual.detail}
        </span>
      </div>
    </div>
  );
}

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

            <div className="mt-6 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              {card.features.map((feature) => (
                <FeatureInfographic key={feature.label} feature={feature} />
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
