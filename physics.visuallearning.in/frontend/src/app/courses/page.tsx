"use client";

import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import api from "@/lib/api";
import Link from "next/link";
import { useEffect, useState } from "react";
import { FreeOfferCountdown, FreePriceHighlight } from "@/components/subscription/free-offer";
import { useRequireAuthStatus } from "@/lib/use-require-auth";
import {
  BookOpen,
  Rocket,
  Check,
  ChevronRight,
  Lock,
  Sparkles,
  GraduationCap,
  Target,
  ArrowRight,
  Loader2,
} from "lucide-react";

type ApiPlan = {
  code: string;
  baseCode?: string;
  billingCycle?: "yearly";
  name: string;
  description?: string | null;
  price: number;
  originalPrice?: number;
  isFreeOfferActive?: boolean;
  freeOfferUntil?: string | null;
  durationDays: number;
  accessDurationDays?: number;
  features: string[];
};

type CoursePlan = {
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
  yearlyCode: string;
  yearlyPrice: number;
  yearlyOriginalPrice: number;
  yearlyFreeOfferActive: boolean;
  freeOfferUntil?: string | null;
  locked: boolean;
};

const defaultPlans: CoursePlan[] = [
  {
    tier: "BRIDGE",
    title: "Physics Bridge Course",
    subtitle: "Master the Basics",
    description: "Strengthen core physics concepts before advanced chapters.",
    features: ["Core concepts", "Foundational modules", "Concept strengthening", "Bridge tests"],
    icon: Target,
    gradient: "from-orange-500 to-red-600",
    borderColor: "border-orange-500/30",
    glowColor: "hover:shadow-[0_0_40px_rgba(249,115,22,0.15)]",
    tag: "Premium",
    tagColor: "bg-orange-500/10 text-orange-400",
    yearlyCode: "BRIDGE_YEARLY",
    yearlyPrice: 9990,
    yearlyOriginalPrice: 9990,
    yearlyFreeOfferActive: false,
    locked: true,
  },
  {
    tier: "BASIC",
    title: "Basic Course",
    subtitle: "Build Foundation",
    description: "Complete animated lessons, notes, and quizzes for foundation physics.",
    features: ["All animated videos", "Chapter notes", "MCQ quizzes", "Progress tracking"],
    icon: BookOpen,
    gradient: "from-accent to-blue-600",
    borderColor: "border-accent/30",
    glowColor: "hover:shadow-[0_0_40px_rgba(0,212,255,0.15)]",
    tag: "Most Popular",
    tagColor: "bg-accent/10 text-accent",
    yearlyCode: "BASIC_YEARLY",
    yearlyPrice: 2990,
    yearlyOriginalPrice: 2990,
    yearlyFreeOfferActive: false,
    locked: true,
  },
  {
    tier: "ADVANCE",
    title: "Advance Course",
    subtitle: "Go Beyond",
    description: "Advanced physics learning with richer practice and deep concept coverage.",
    features: ["Everything in Basic", "Advanced chapter support", "Exam practice", "Performance tracking"],
    icon: Rocket,
    gradient: "from-secondary to-purple-600",
    borderColor: "border-secondary/30",
    glowColor: "hover:shadow-[0_0_40px_rgba(124,58,237,0.15)]",
    tag: "Best Value",
    tagColor: "bg-secondary/10 text-secondary-light",
    yearlyCode: "ADVANCE_YEARLY",
    yearlyPrice: 4990,
    yearlyOriginalPrice: 4990,
    yearlyFreeOfferActive: false,
    locked: true,
  },
];

const planVisuals: Record<string, Pick<CoursePlan, "subtitle" | "icon" | "gradient" | "borderColor" | "glowColor" | "tag" | "tagColor">> = {
  BRIDGE: defaultPlans[0],
  BASIC: defaultPlans[1],
  ADVANCE: defaultPlans[2],
};

function baseCodeFor(plan: ApiPlan) {
  return (plan.baseCode || plan.code.replace(/_YEARLY$/, "")).toUpperCase();
}

function detailSlug(baseCode: string) {
  return baseCode.toLowerCase().replace(/_/g, "-");
}

function groupPlans(apiPlans: ApiPlan[]): CoursePlan[] {
  if (!apiPlans.length) return defaultPlans;
  const grouped = new Map<string, ApiPlan[]>();
  for (const plan of apiPlans.filter((item) => baseCodeFor(item) !== "FREE")) {
    const base = baseCodeFor(plan);
    grouped.set(base, [...(grouped.get(base) || []), plan]);
  }

  return Array.from(grouped.entries())
    .map(([base, variants]) => {
      const fallback = defaultPlans.find((plan) => plan.tier === base) || defaultPlans[0];
      const visual = planVisuals[base] || planVisuals.BASIC;
      const yearly = variants.find((plan) => plan.code.endsWith("_YEARLY") || plan.durationDays >= 365) || variants[0];
      const yearlyPrice = yearly?.price ?? fallback.yearlyPrice;
      const yearlyOriginalPrice = yearly?.originalPrice ?? yearlyPrice;

      return {
        ...fallback,
        ...visual,
        tier: base,
        title: yearly?.name || fallback.title,
        description: yearly?.description || fallback.description,
        features: yearly?.features?.length ? yearly.features : fallback.features,
        yearlyCode: yearly?.code || fallback.yearlyCode,
        yearlyPrice,
        yearlyOriginalPrice,
        yearlyFreeOfferActive: Boolean(yearly?.isFreeOfferActive),
        freeOfferUntil: yearly?.freeOfferUntil || null,
        locked: true,
      };
    })
    .sort((a, b) => {
      const order = ["BRIDGE", "BASIC", "ADVANCE"];
      return (order.indexOf(a.tier) === -1 ? 99 : order.indexOf(a.tier)) - (order.indexOf(b.tier) === -1 ? 99 : order.indexOf(b.tier));
    });
}

function formatPrice(price: number) {
  if (price <= 0) return "FREE";
  return `Rs ${price.toLocaleString("en-IN")}`;
}

function monthlyEquivalent(yearlyPrice: number) {
  return Math.round(yearlyPrice / 12).toLocaleString("en-IN");
}

export default function CoursesPage() {
  const { canView: canViewCourses, checking: checkingAuth } = useRequireAuthStatus();
  const [plans, setPlans] = useState<CoursePlan[]>(defaultPlans);

  useEffect(() => {
    if (!canViewCourses) return;

    api.get("/subscription/plans")
      .then((res) => {
        if (Array.isArray(res.data) && res.data.length > 0) {
          setPlans(groupPlans(res.data));
        }
      })
      .catch(() => setPlans(defaultPlans));
  }, [canViewCourses]);

  if (checkingAuth) {
    return (
      <main className="min-h-screen bg-primary">
        <Navbar />
        <div className="min-h-[70vh] pt-28 flex flex-col items-center justify-center px-4 text-center">
          <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-accent/25 bg-accent/10 text-accent">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
          <h1 className="text-2xl font-bold text-text-bright">Loading courses</h1>
          <p className="mt-2 max-w-md text-sm text-text-muted">
            Checking your account and preparing available course plans.
          </p>
        </div>
      </main>
    );
  }

  if (!canViewCourses) return null;

  return (
    <main className="min-h-screen bg-primary">
      <Navbar />
      <div className="pt-28 pb-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-4">
            <GraduationCap className="w-4 h-4 text-accent" />
            <span className="text-sm text-text-muted">Choose Your Path</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-text-bright mb-4">
            Physics <span className="gradient-text">Courses</span>
          </h1>
          <p className="text-text-muted max-w-2xl mx-auto">
            Explore each course in detail, then choose a yearly access plan when you are ready.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {plans.map((course, index) => {
            const Icon = course.icon;
            const price = course.yearlyPrice;
            const originalPrice = course.yearlyOriginalPrice;
            const isFreeOffer = course.yearlyFreeOfferActive;
            const planCode = course.yearlyCode;

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

                <div className="mb-4">
                  {isFreeOffer && originalPrice > 0 && (
                    <div className="mb-1 text-sm font-bold text-text-muted line-through">&#8377;{originalPrice.toLocaleString("en-IN")}</div>
                  )}
                  {price > 0 && <span className="text-text-muted text-lg">&#8377;</span>}
                  {price > 0 ? (
                    <span className="text-3xl font-extrabold text-text-bright">{price.toLocaleString("en-IN")}</span>
                  ) : (
                    <FreePriceHighlight size="md" />
                  )}
                  <span className="text-text-muted text-sm ml-1">{price > 0 ? "/yr" : "30 days"}</span>
                  {price > 0 && (
                    <p className="mt-1 text-sm font-bold text-accent">Only Rs {monthlyEquivalent(price)}/month</p>
                  )}
                  {price <= 0 && (
                    <p className="mt-1 text-sm font-bold text-accent">30-day free trial, then yearly subscription</p>
                  )}
                  {isFreeOffer && <FreeOfferCountdown until={course.freeOfferUntil} />}
                </div>

                <p className="text-text-muted text-sm leading-relaxed mb-6">{course.description}</p>

                <div className="mb-8 flex-1 space-y-3">
                  {course.features.slice(0, 6).map((feature) => (
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

                <div className="space-y-3">
                  <Link href={`/course-details/${detailSlug(course.tier)}`} className="block">
                    <Button variant={index === 1 ? "primary" : index === 2 ? "secondary" : "outline"} className="w-full">
                      Explore Course
                      <ArrowRight className="w-4 h-4 ml-1" />
                    </Button>
                  </Link>
                  <Link href={`/subscription?plan=${planCode}`} className="block">
                    <Button variant="ghost" className="w-full">
                      <Lock className="w-4 h-4 mr-2" />
                      {price > 0 ? `Subscribe ${formatPrice(price)}/yr` : "Start 30-Day Trial"}
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        <div className="text-center mt-12">
          <div className="inline-flex items-center gap-2 glass rounded-full px-6 py-3">
            <Sparkles className="w-4 h-4 text-energy" />
            <span className="text-sm text-text-muted">
              Course content is managed from the admin panel and shown with physics animated chapter cards.
            </span>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}
