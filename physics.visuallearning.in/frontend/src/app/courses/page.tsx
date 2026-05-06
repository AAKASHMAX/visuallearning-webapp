"use client";

import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import api from "@/lib/api";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { FreeOfferCountdown, FreePriceHighlight } from "@/components/subscription/free-offer";
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
} from "lucide-react";

type BillingCycle = "monthly" | "yearly";

type ApiPlan = {
  code: string;
  baseCode?: string;
  billingCycle?: BillingCycle;
  name: string;
  description?: string | null;
  price: number;
  originalPrice?: number;
  isFreeOfferActive?: boolean;
  freeOfferUntil?: string | null;
  durationDays: number;
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
  monthlyCode: string;
  yearlyCode: string;
  monthlyPrice: number;
  yearlyPrice: number;
  monthlyOriginalPrice: number;
  yearlyOriginalPrice: number;
  monthlyFreeOfferActive: boolean;
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
    monthlyCode: "BRIDGE",
    yearlyCode: "BRIDGE_YEARLY",
    monthlyPrice: 999,
    yearlyPrice: 9990,
    monthlyOriginalPrice: 999,
    yearlyOriginalPrice: 9990,
    monthlyFreeOfferActive: false,
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
    monthlyCode: "BASIC",
    yearlyCode: "BASIC_YEARLY",
    monthlyPrice: 299,
    yearlyPrice: 2990,
    monthlyOriginalPrice: 299,
    yearlyOriginalPrice: 2990,
    monthlyFreeOfferActive: false,
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
    monthlyCode: "ADVANCE",
    yearlyCode: "ADVANCE_YEARLY",
    monthlyPrice: 499,
    yearlyPrice: 4990,
    monthlyOriginalPrice: 499,
    yearlyOriginalPrice: 4990,
    monthlyFreeOfferActive: false,
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

function billingFor(plan: ApiPlan): BillingCycle {
  return plan.billingCycle || (plan.code.endsWith("_YEARLY") || plan.durationDays >= 365 ? "yearly" : "monthly");
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
      const monthly = variants.find((plan) => billingFor(plan) === "monthly") || variants[0];
      const yearly = variants.find((plan) => billingFor(plan) === "yearly");
      const monthlyPrice = monthly?.price ?? fallback.monthlyPrice;
      const yearlyPrice = yearly?.price ?? (monthlyPrice > 0 ? Math.round(monthlyPrice * 10) : 0);
      const monthlyOriginalPrice = monthly?.originalPrice ?? monthlyPrice;
      const yearlyOriginalPrice = yearly?.originalPrice ?? yearlyPrice;

      return {
        ...fallback,
        ...visual,
        tier: base,
        title: monthly?.name || fallback.title,
        description: monthly?.description || fallback.description,
        features: monthly?.features?.length ? monthly.features : fallback.features,
        monthlyCode: monthly?.code || fallback.monthlyCode,
        yearlyCode: yearly?.code || fallback.yearlyCode || monthly?.code || fallback.monthlyCode,
        monthlyPrice,
        yearlyPrice,
        monthlyOriginalPrice,
        yearlyOriginalPrice,
        monthlyFreeOfferActive: Boolean(monthly?.isFreeOfferActive),
        yearlyFreeOfferActive: Boolean(yearly?.isFreeOfferActive),
        freeOfferUntil: monthly?.freeOfferUntil || yearly?.freeOfferUntil || null,
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

export default function CoursesPage() {
  const [plans, setPlans] = useState<CoursePlan[]>(defaultPlans);
  const [billing, setBilling] = useState<BillingCycle>("monthly");

  useEffect(() => {
    api.get("/subscription/plans")
      .then((res) => {
        if (Array.isArray(res.data) && res.data.length > 0) {
          setPlans(groupPlans(res.data));
        }
      })
      .catch(() => setPlans(defaultPlans));
  }, []);

  const maxDiscount = useMemo(() => {
    const discounts = plans
      .filter((plan) => plan.monthlyPrice > 0 && plan.yearlyPrice > 0)
      .map((plan) => Math.round(((plan.monthlyPrice * 12 - plan.yearlyPrice) / (plan.monthlyPrice * 12)) * 100))
      .filter((value) => value > 0);
    return discounts.length ? Math.max(...discounts) : 15;
  }, [plans]);

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
            Explore each course in detail, then choose monthly or yearly access when you are ready.
          </p>
        </div>

        <div className="flex justify-center mb-10">
          <div className="inline-flex items-center rounded-2xl border border-border bg-card p-1.5 shadow-lg shadow-black/10">
            <button
              onClick={() => setBilling("monthly")}
              className={`px-7 py-2.5 rounded-xl text-sm font-bold transition-all ${billing === "monthly" ? "bg-accent text-primary shadow-[0_0_18px_rgba(0,212,255,0.25)]" : "text-text-muted hover:text-text-bright"}`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBilling("yearly")}
              className={`px-7 py-2.5 rounded-xl text-sm font-bold transition-all ${billing === "yearly" ? "bg-accent text-primary shadow-[0_0_18px_rgba(0,212,255,0.25)]" : "text-text-muted hover:text-text-bright"}`}
            >
              Yearly
              <span className="ml-2 rounded-full bg-success/15 px-2 py-0.5 text-[10px] font-black text-success">Save {maxDiscount}%</span>
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {plans.map((course, index) => {
            const Icon = course.icon;
            const price = billing === "monthly" ? course.monthlyPrice : course.yearlyPrice;
            const originalPrice = billing === "monthly" ? course.monthlyOriginalPrice : course.yearlyOriginalPrice;
            const isFreeOffer = billing === "monthly" ? course.monthlyFreeOfferActive : course.yearlyFreeOfferActive;
            const planCode = billing === "monthly" ? course.monthlyCode : course.yearlyCode;
            const period = price <= 0 ? "" : billing === "monthly" ? "/mo" : "/yr";

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
                  <span className="text-text-muted text-sm ml-1">{period}</span>
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
                  <Link href={`/course-details/${detailSlug(course.tier)}?billing=${billing}`} className="block">
                    <Button variant={index === 1 ? "primary" : index === 2 ? "secondary" : "outline"} className="w-full">
                      Explore Course
                      <ArrowRight className="w-4 h-4 ml-1" />
                    </Button>
                  </Link>
                  <Link href={`/subscription?plan=${planCode}&billing=${billing}`} className="block">
                    <Button variant="ghost" className="w-full">
                      <Lock className="w-4 h-4 mr-2" />
                      {price > 0 ? `Subscribe ${formatPrice(price)}` : "Start Free"}
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
