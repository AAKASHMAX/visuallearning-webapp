"use client";

import { useEffect, useMemo, useState } from "react";
import { redirect, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, BadgeCheck, Calendar, CheckCircle2, ShieldCheck, Sparkles, Star, Tag, X } from "lucide-react";
import toast from "react-hot-toast";
import api from "@/lib/api";
import { RazorpayButton } from "@/components/payment/razorpay-button";
import { Button } from "@/components/ui/button";
import { PageLoader } from "@/components/ui/loading";

type BillingCycle = "monthly" | "yearly";

type Plan = {
  id: string;
  name: string;
  monthlyPrice?: number;
  yearlyPrice?: number;
  features?: string[];
  popular?: boolean;
};

type SubjectInfo = {
  id: string;
  name: string;
  price: number;
};

const PLAN_METADATA: Record<string, { bgColor: string; accentColor: string; badge?: string; included: string[] }> = {
  FOUNDATION_PASS: {
    bgColor: "#1C4D8D",
    accentColor: "#60A5FA",
    included: ["Selected chapters for Classes 9-12", "Animated concept videos", "Progress tracking", "Mobile and desktop access"],
  },
  ACADEMIC_PLUS: {
    bgColor: "#162855",
    accentColor: "#38BDF8",
    included: ["Full Class 9-10 PCB", "Selected senior science chapters", "Chapter notes", "MCQ quizzes with solutions", "Performance analytics"],
  },
  ELITE_LEARNING: {
    bgColor: "#2d1654",
    accentColor: "#D8B4FE",
    badge: "Most Popular",
    included: ["Full Class 9-12 science access", "64+ Virtual Labs", "3D Visual Learning", "Board exam practice", "Priority support"],
  },
  CLASS_9: {
    bgColor: "#1e3a8a",
    accentColor: "#93c5fd",
    included: ["Full Class 9 curriculum", "3D animated videos", "Virtual labs and simulations", "Chapter notes", "Expert support"],
  },
  CLASS_10: {
    bgColor: "#1e1b4b",
    accentColor: "#c084fc",
    included: ["Full Class 10 curriculum", "3D animated videos", "Virtual labs and simulations", "Board exam prep", "Chapter notes"],
  },
  CLASS_11: {
    bgColor: "#312e81",
    accentColor: "#818cf8",
    included: ["Full Class 11 curriculum", "Advanced 3D visuals", "Complex simulations", "Formula sheets", "Priority support"],
  },
  CLASS_12: {
    bgColor: "#4c1d95",
    accentColor: "#ddd6fe",
    included: ["Full Class 12 curriculum", "Advanced 3D visuals", "Board and competitive prep", "Formula sheets", "Priority support"],
  },
  FLEXI_PLAN: {
    bgColor: "#170C79",
    accentColor: "#818CF8",
    badge: "Custom Plan",
    included: ["Choose your own subjects", "3D animated videos", "Chapter notes", "MCQ quizzes", "Flexible pricing"],
  },
};

function normalizePlanParam(planParam: string) {
  const direct = planParam.toUpperCase().replace(/-/g, "_");
  const slugMap: Record<string, string> = {
    "foundation-pass": "FOUNDATION_PASS",
    "academic-plus": "ACADEMIC_PLUS",
    "elite-learning": "ELITE_LEARNING",
    "class-9": "CLASS_9",
    "class-10": "CLASS_10",
    "class-11": "CLASS_11",
    "class-12": "CLASS_12",
    "flexi-plan": "FLEXI_PLAN",
  };

  return slugMap[planParam.toLowerCase()] || direct;
}

function findPlan(plans: Plan[], planParam: string) {
  const normalized = normalizePlanParam(planParam);
  return plans.find((plan) => plan.id === normalized)
    || plans.find((plan) => plan.id.toLowerCase() === planParam.toLowerCase())
    || null;
}

function formatPrice(amount: number) {
  return amount === 0 ? "FREE" : `\u20B9${amount.toLocaleString("en-IN")}`;
}

export default function SubscriptionPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const planParam = searchParams.get("plan") ?? "";
  const billingCycle = (searchParams.get("billing") === "yearly" ? "yearly" : "monthly") as BillingCycle;
  const subjectIds = (searchParams.get("subjects") ?? "").split(",").filter(Boolean);

  const [loading, setLoading] = useState(true);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [subjects, setSubjects] = useState<SubjectInfo[]>([]);
  const [couponCode, setCouponCode] = useState("");
  const [couponApplied, setCouponApplied] = useState(false);
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [validatingCoupon, setValidatingCoupon] = useState(false);

  if (!planParam) {
    redirect("/courses");
  }

  const plan = findPlan(plans, planParam);
  const planKey = plan?.id || normalizePlanParam(planParam);
  const isFlexi = planKey === "FLEXI_PLAN";
  const meta = PLAN_METADATA[planKey] || PLAN_METADATA.FOUNDATION_PASS;

  useEffect(() => {
    let mounted = true;

    async function loadBillingData() {
      setLoading(true);
      try {
        const { data } = await api.get("/subscription/plans");
        const fetchedPlans = data.data.plans ?? data.data;
        if (!mounted) return;
        setPlans(fetchedPlans);

        if (normalizePlanParam(planParam) === "FLEXI_PLAN" && subjectIds.length > 0) {
          const pricing = await api.get("/courses/pricing/subjects");
          if (!mounted) return;
          const classes = pricing.data.data ?? [];
          const flatSubjects = classes.flatMap((classItem: any) => classItem.subjects ?? []);
          setSubjects(flatSubjects.filter((subject: SubjectInfo) => subjectIds.includes(subject.id)));
        }
      } catch {
        toast.error("Failed to load billing details");
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadBillingData();
    return () => { mounted = false; };
  }, [planParam, subjectIds.join(",")]);

  const basePrice = useMemo(() => {
    if (isFlexi) {
      const yearlyTotal = subjects.reduce((sum, subject) => sum + (subject.price || 0), 0);
      return billingCycle === "monthly" ? Math.round(yearlyTotal / 10) : yearlyTotal;
    }

    return billingCycle === "monthly"
      ? plan?.monthlyPrice ?? 0
      : plan?.yearlyPrice ?? 0;
  }, [billingCycle, isFlexi, plan, subjects]);

  const discountedPrice = couponApplied
    ? Math.round(basePrice * (1 - couponDiscount / 100))
    : basePrice;

  const billingLabel = billingCycle === "monthly" ? "Monthly billing" : "Yearly billing";
  const planName = plan?.name || (isFlexi ? "FlexiLearn Plan" : planParam.replace(/-/g, " "));
  const featureList = meta.included.length ? meta.included : plan?.features ?? [];

  const applyCoupon = async () => {
    if (!couponCode.trim()) {
      toast.error("Enter a coupon code");
      return;
    }

    setValidatingCoupon(true);
    try {
      const { data } = await api.get(`/subscription/validate-coupon?code=${couponCode.trim()}&plan=${planKey}`);
      if (data.data.valid) {
        setCouponApplied(true);
        setCouponDiscount(data.data.discountPercent);
        toast.success(`${data.data.discountPercent}% discount applied`);
      } else {
        setCouponApplied(false);
        toast.error(data.data.message);
      }
    } catch {
      toast.error("Failed to validate coupon");
    } finally {
      setValidatingCoupon(false);
    }
  };

  if (loading) return <PageLoader />;

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      <div className="max-w-5xl mx-auto px-4 pt-6">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-sm font-bold text-text-muted hover:text-heading transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
      </div>

      <section className="relative overflow-hidden mt-4" style={{ background: `linear-gradient(135deg, ${meta.bgColor}, ${meta.bgColor}dd)` }}>
        <div className="absolute inset-0 bg-grid-dark opacity-25 pointer-events-none" />
        <div className="absolute -right-10 -top-10 h-72 w-72 rounded-full blur-[100px] opacity-25" style={{ backgroundColor: meta.accentColor }} />
        <div className="relative z-10 max-w-5xl mx-auto px-4 py-10 text-white">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div>
              {(meta.badge || plan?.popular) && (
                <span className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/15 px-4 py-1 text-xs font-black uppercase tracking-widest">
                  <Sparkles className="h-3.5 w-3.5" /> {meta.badge || "Popular"}
                </span>
              )}
              <h1 className="text-3xl md:text-4xl font-black tracking-tight capitalize">{planName}</h1>
              <p className="mt-2 max-w-2xl text-sm font-semibold text-white/65">Review your plan, apply a coupon if you have one, and continue to secure payment.</p>
            </div>
            <div className="rounded-2xl border border-white/15 bg-white/10 px-5 py-4 text-right backdrop-blur-sm">
              <p className="text-xs font-black uppercase tracking-widest text-white/50">{billingLabel}</p>
              <p className="mt-1 text-4xl font-black">{formatPrice(discountedPrice)}</p>
              <p className="text-xs font-bold text-white/45">/{billingCycle === "monthly" ? "month" : "year"}</p>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 pt-8 grid grid-cols-1 gap-8 lg:grid-cols-3">
        <main className="lg:col-span-2 space-y-6">
          {isFlexi && (
            <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-black text-heading">Selected Subjects</h2>
              <p className="mt-1 text-xs font-bold text-text-muted">{subjects.length} subject{subjects.length === 1 ? "" : "s"} included in this custom plan.</p>
              <div className="mt-5 space-y-3">
                {subjects.length > 0 ? subjects.map((subject) => (
                  <div key={subject.id} className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50 px-4 py-3">
                    <span className="text-sm font-black text-heading">{subject.name}</span>
                    <span className="text-sm font-black text-primary">{formatPrice(subject.price)}</span>
                  </div>
                )) : (
                  <p className="rounded-xl border border-dashed border-gray-200 px-4 py-6 text-center text-sm font-bold text-text-muted">No subjects selected for this custom plan.</p>
                )}
              </div>
            </section>
          )}

          <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="flex items-center gap-2 text-lg font-black text-heading">
              <BadgeCheck className="h-5 w-5 text-primary" /> Plan Details
            </h2>
            <ul className="mt-5 space-y-2">
              {featureList.map((feature, index) => (
                <li key={index} className="flex items-center gap-3 rounded-xl border border-gray-100 bg-gray-50 px-3 py-2.5">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                  </span>
                  <span className="text-[13px] font-semibold text-heading">{feature}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-base font-black text-heading">Why VisualLearning?</h2>
            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {[
                "Expert-crafted 3D animations",
                "NCERT and board exam aligned",
                "Learn at your own pace",
                "Secure Razorpay checkout",
              ].map((text) => (
                <div key={text} className="flex items-center gap-2.5 rounded-xl border border-gray-100 bg-gray-50 px-3 py-2.5">
                  <Star className="h-4 w-4 shrink-0 text-primary" />
                  <span className="text-[12px] font-semibold text-heading">{text}</span>
                </div>
              ))}
            </div>
          </section>
        </main>

        <aside className="lg:col-span-1">
          <div className="sticky top-24 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl">
            <div className="border-b border-gray-100 px-5 py-4" style={{ backgroundColor: `${meta.accentColor}12` }}>
              <p className="text-[10px] font-black uppercase tracking-widest text-text-muted">Order Summary</p>
              <h3 className="mt-1 text-lg font-black text-heading">{planName}</h3>
            </div>

            <div className="space-y-5 p-5">
              <div className="space-y-2">
                <div className="flex justify-between text-sm font-bold text-text-muted">
                  <span>{billingLabel}</span>
                  <span className="text-heading">{formatPrice(basePrice)}</span>
                </div>
                {couponApplied && (
                  <div className="flex justify-between text-sm font-bold text-emerald-600">
                    <span>Discount</span>
                    <span>- {formatPrice(basePrice - discountedPrice)}</span>
                  </div>
                )}
                <div className="flex justify-between border-t border-gray-100 pt-3 text-heading">
                  <span className="font-black">Total</span>
                  <span className="text-xl font-black">{formatPrice(discountedPrice)}</span>
                </div>
              </div>

              <div>
                <p className="mb-1.5 flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-text-muted">
                  <Tag className="h-3.5 w-3.5" /> Coupon Code
                </p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(event) => setCouponCode(event.target.value.toUpperCase())}
                    placeholder="ENTER CODE"
                    disabled={couponApplied}
                    className="min-w-0 flex-1 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-xs font-bold focus:border-primary focus:outline-none"
                  />
                  {couponApplied ? (
                    <button onClick={() => { setCouponApplied(false); setCouponCode(""); }} className="rounded-xl px-2 text-rose-500 hover:bg-rose-50">
                      <X className="h-4 w-4" />
                    </button>
                  ) : (
                    <button onClick={applyCoupon} disabled={validatingCoupon} className="rounded-xl bg-primary px-4 py-2 text-xs font-black text-white">
                      {validatingCoupon ? "..." : "Apply"}
                    </button>
                  )}
                </div>
              </div>

              {plan ? (
                <RazorpayButton
                  plan={plan.id}
                  amount={discountedPrice}
                  label={planName}
                  subjectsAccess={isFlexi ? subjectIds : undefined}
                  couponCode={couponApplied ? couponCode : undefined}
                  billingCycle={billingCycle}
                  onSuccess={() => router.push("/dashboard")}
                  buttonLabel={`Pay ${formatPrice(discountedPrice)}`}
                  className="w-full rounded-xl bg-primary py-4 text-sm font-black text-white shadow-lg transition-all hover:scale-[1.01] active:scale-[0.98]"
                />
              ) : (
                <div className="space-y-3">
                  <Button disabled className="w-full opacity-50">Plan not available</Button>
                  <Link href="/courses" className="block text-center text-xs font-bold text-primary hover:underline">
                    Compare all courses
                  </Link>
                </div>
              )}

              <div className="flex items-center justify-center gap-2 text-[10px] font-bold text-text-muted">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                Secured by Razorpay
              </div>
              <div className="flex items-center justify-center gap-2 text-[10px] font-bold text-text-muted">
                <Calendar className="h-3.5 w-3.5 text-primary" />
                Access starts after payment confirmation
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
