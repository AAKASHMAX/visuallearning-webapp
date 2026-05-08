"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  BadgeCheck,
  BookOpen,
  BriefcaseBusiness,
  CheckCircle2,
  GraduationCap,
  IndianRupee,
  ShieldCheck,
  Sparkles,
  Tag,
  UsersRound,
  X,
} from "lucide-react";
import toast from "react-hot-toast";
import api from "@/lib/api";
import { RazorpayButton } from "@/components/payment/razorpay-button";
import { Button } from "@/components/ui/button";
import { PageLoader } from "@/components/ui/loading";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { cn } from "@/lib/utils";

type AudiencePlanId = "STUDENTS_PLAN" | "TEACHERS_PLAN" | "PROFESSIONAL_PLAN";
type SubjectKey = "physics" | "chemistry" | "biology";

type Plan = {
  id: string;
  name: string;
  yearlyPrice?: number;
  durationYearly?: number;
  features?: string[];
  unitType?: "fixed" | "class" | "subject";
};

type ClassInfo = {
  id: string;
  name: string;
};

const audienceOrder: AudiencePlanId[] = ["STUDENTS_PLAN", "TEACHERS_PLAN", "PROFESSIONAL_PLAN"];

const planVisuals: Record<AudiencePlanId, { title: string; subtitle: string; icon: any; accent: string; unit: string; empty: string }> = {
  STUDENTS_PLAN: {
    title: "Students",
    subtitle: "Choose one or more classes and unlock student learning resources.",
    icon: GraduationCap,
    accent: "from-sky-500 to-cyan-400",
    unit: "per class",
    empty: "Select at least one class to continue.",
  },
  TEACHERS_PLAN: {
    title: "Teachers",
    subtitle: "Choose classes for teaching resources, PPTs, tests, and question practice.",
    icon: UsersRound,
    accent: "from-emerald-500 to-lime-400",
    unit: "per class",
    empty: "Select at least one class to continue.",
  },
  PROFESSIONAL_PLAN: {
    title: "Professional",
    subtitle: "Choose one or more professional subject tracks.",
    icon: BriefcaseBusiness,
    accent: "from-violet-500 to-fuchsia-400",
    unit: "per subject",
    empty: "Select at least one subject to continue.",
  },
};

const professionalSubjects = [
  { key: "physics" as SubjectKey, name: "Physics", detail: "Basic to Advanced" },
  { key: "chemistry" as SubjectKey, name: "Chemistry", detail: "Basic to Advanced" },
  { key: "biology" as SubjectKey, name: "Biology", detail: "Basic" },
];

function normalizeAudiencePlan(planParam: string | null): AudiencePlanId {
  const value = (planParam || "").toLowerCase();
  if (value.includes("teacher")) return "TEACHERS_PLAN";
  if (value.includes("professional")) return "PROFESSIONAL_PLAN";
  return "STUDENTS_PLAN";
}

function formatPrice(amount: number) {
  return amount <= 0 ? "FREE" : `\u20B9${amount.toLocaleString("en-IN")}`;
}

function isTargetClass(name: string) {
  const normalized = name.toLowerCase();
  return ["9", "10", "11", "12"].some((item) => normalized.includes(item));
}

function SubscriptionPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [classes, setClasses] = useState<ClassInfo[]>([]);
  const [selectedPlanId, setSelectedPlanId] = useState<AudiencePlanId>(() => normalizeAudiencePlan(searchParams.get("plan")));
  const [selectedClassIds, setSelectedClassIds] = useState<string[]>([]);
  const [selectedSubjectKeys, setSelectedSubjectKeys] = useState<SubjectKey[]>([]);
  const [couponCode, setCouponCode] = useState("");
  const [couponApplied, setCouponApplied] = useState(false);
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [validatingCoupon, setValidatingCoupon] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function loadData() {
      setLoading(true);
      try {
        const { data } = await api.get("/subscription/plans");
        if (!mounted) return;
        setPlans(data.data?.plans || []);
        setClasses(((data.data?.classes || []) as ClassInfo[]).filter((item) => isTargetClass(item.name)));
      } catch {
        toast.error("Failed to load subscription plans");
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadData();
    return () => { mounted = false; };
  }, []);

  const audiencePlans = useMemo(
    () => audienceOrder.map((id) => plans.find((plan) => plan.id === id)).filter(Boolean) as Plan[],
    [plans]
  );

  const selectedPlan = plans.find((plan) => plan.id === selectedPlanId);
  const selectedCount = selectedPlanId === "PROFESSIONAL_PLAN" ? selectedSubjectKeys.length : selectedClassIds.length;
  const unitPrice = selectedPlan?.yearlyPrice || 0;
  const basePrice = unitPrice * selectedCount;
  const discountedPrice = couponApplied ? Math.round(basePrice * (1 - couponDiscount / 100)) : basePrice;
  const selectedVisual = planVisuals[selectedPlanId];
  const canPay = !!selectedPlan && selectedCount > 0;

  const toggleClass = (id: string) => {
    setCouponApplied(false);
    setSelectedClassIds((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  };

  const toggleSubject = (key: SubjectKey) => {
    setCouponApplied(false);
    setSelectedSubjectKeys((current) => current.includes(key) ? current.filter((item) => item !== key) : [...current, key]);
  };

  const choosePlan = (planId: AudiencePlanId) => {
    setSelectedPlanId(planId);
    setCouponApplied(false);
  };

  const applyCoupon = async () => {
    if (!couponCode.trim()) {
      toast.error("Enter a coupon code");
      return;
    }
    if (basePrice <= 0) {
      toast.error("Select a paid plan first");
      return;
    }

    setValidatingCoupon(true);
    try {
      const { data } = await api.get(`/subscription/validate-coupon?code=${couponCode.trim()}&plan=${selectedPlanId}`);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-surface">
        <Navbar />
        <PageLoader />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary/10 bg-white px-3 py-1 text-xs font-black uppercase tracking-wider text-primary shadow-sm">
            <Sparkles className="h-4 w-4" />
            Pricing
          </div>
          <h1 className="text-3xl font-black tracking-tight text-heading sm:text-4xl">Choose Your Subscription</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-text-muted sm:text-base">
            Select Students, Teachers, or Professional, then choose the classes or subjects you need. Total pricing updates automatically.
          </p>
        </div>

        <div className="grid gap-5 lg:grid-cols-3">
          {audiencePlans.map((plan) => {
            const id = plan.id as AudiencePlanId;
            const visual = planVisuals[id];
            const Icon = visual.icon;
            const selected = selectedPlanId === id;

            return (
              <button
                key={plan.id}
                type="button"
                onClick={() => choosePlan(id)}
                className={cn(
                  "group relative overflow-hidden rounded-lg border bg-white p-5 text-left shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/10",
                  selected ? "border-primary ring-2 ring-primary/10" : "border-gray-200 hover:border-primary/30"
                )}
              >
                <div className={`absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r ${visual.accent}`} />
                <div className="mb-6 flex items-start justify-between gap-4">
                  <div className={`flex h-14 w-14 items-center justify-center rounded-lg bg-gradient-to-br ${visual.accent} text-white shadow-lg shadow-gray-200 transition-transform group-hover:scale-105`}>
                    <Icon className="h-7 w-7" />
                  </div>
                  <span className="rounded-full border border-gray-200 bg-surface px-3 py-1 text-[11px] font-black uppercase tracking-wider text-text-muted">
                    {visual.unit}
                  </span>
                </div>
                <h2 className="text-2xl font-black text-heading">{visual.title}</h2>
                <p className="mt-2 min-h-14 text-sm leading-6 text-text-muted">{visual.subtitle}</p>
                <div className="mt-5 flex items-end gap-2">
                  <span className="text-3xl font-black text-heading">{formatPrice(plan.yearlyPrice || 0)}</span>
                  <span className="pb-1 text-xs font-black uppercase tracking-wider text-text-light">/ year</span>
                </div>
              </button>
            );
          })}
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_23rem]">
          <main className="space-y-6">
            <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
              <div className="mb-5 flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-black text-heading">
                    {selectedPlanId === "PROFESSIONAL_PLAN" ? "Choose Subjects" : "Choose Classes"}
                  </h2>
                  <p className="mt-1 text-sm text-text-muted">{selectedVisual.empty}</p>
                </div>
                <div className="hidden rounded-full bg-primary/10 px-3 py-1 text-xs font-black text-primary sm:block">
                  {selectedCount} selected
                </div>
              </div>

            {selectedPlanId === "PROFESSIONAL_PLAN" ? (
              <div className="grid gap-4 md:grid-cols-3">
                {professionalSubjects.map((subject) => {
                  const selected = selectedSubjectKeys.includes(subject.key);
                  return (
                    <button
                      key={subject.key}
                      type="button"
                      onClick={() => toggleSubject(subject.key)}
                      className={cn(
                        "rounded-lg border p-4 text-left transition-all",
                        selected ? "border-primary bg-primary/5 ring-2 ring-primary/10" : "border-gray-200 bg-surface hover:border-primary/30 hover:bg-white"
                      )}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white text-primary shadow-sm">
                          <BookOpen className="h-5 w-5" />
                        </div>
                        {selected && <CheckCircle2 className="h-5 w-5 text-primary" />}
                      </div>
                      <h3 className="mt-4 text-lg font-black text-heading">{subject.name}</h3>
                      <p className="mt-1 text-sm text-text-muted">{subject.detail}</p>
                      <p className="mt-4 text-sm font-black text-primary">{formatPrice(unitPrice)} / year</p>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {classes.map((classItem) => {
                  const selected = selectedClassIds.includes(classItem.id);
                  return (
                    <button
                      key={classItem.id}
                      type="button"
                      onClick={() => toggleClass(classItem.id)}
                      className={cn(
                        "rounded-lg border p-4 text-left transition-all",
                        selected ? "border-primary bg-primary/5 ring-2 ring-primary/10" : "border-gray-200 bg-surface hover:border-primary/30 hover:bg-white"
                      )}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white text-primary shadow-sm">
                          <GraduationCap className="h-5 w-5" />
                        </div>
                        {selected && <CheckCircle2 className="h-5 w-5 text-primary" />}
                      </div>
                      <h3 className="mt-4 text-lg font-black text-heading">{classItem.name}</h3>
                      <p className="mt-1 text-sm text-text-muted">Full class resource access</p>
                      <p className="mt-4 text-sm font-black text-primary">{formatPrice(unitPrice)} / year</p>
                    </button>
                  );
                })}
              </div>
            )}
          </section>

          <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
            <h2 className="flex items-center gap-2 text-lg font-black text-heading">
              <BadgeCheck className="h-5 w-5 text-primary" />
              Included Features
            </h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {(selectedPlan?.features || []).map((feature) => (
                <div key={feature} className="flex items-center gap-3 rounded-lg border border-gray-100 bg-surface px-3 py-3">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
                  <span className="text-sm font-bold text-heading">{feature}</span>
                </div>
              ))}
            </div>
          </section>
        </main>

        <aside>
          <div className="sticky top-24 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-xl">
            <div className={`bg-gradient-to-r ${selectedVisual.accent} px-5 py-4 text-white`}>
              <p className="text-[10px] font-black uppercase tracking-widest text-white/70">Order Summary</p>
              <h3 className="mt-1 text-xl font-black">{selectedVisual.title}</h3>
            </div>
            <div className="space-y-5 p-5">
              <div className="space-y-2">
                <div className="flex justify-between text-sm font-bold text-text-muted">
                  <span>{formatPrice(unitPrice)} x {selectedCount}</span>
                  <span className="text-heading">{formatPrice(basePrice)}</span>
                </div>
                {couponApplied && (
                  <div className="flex justify-between text-sm font-bold text-emerald-600">
                    <span>Coupon discount</span>
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
                    className="min-w-0 flex-1 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-xs font-bold focus:border-primary focus:outline-none"
                  />
                  {couponApplied ? (
                    <button onClick={() => { setCouponApplied(false); setCouponCode(""); }} className="rounded-lg px-2 text-rose-500 hover:bg-rose-50">
                      <X className="h-4 w-4" />
                    </button>
                  ) : (
                    <button onClick={applyCoupon} disabled={validatingCoupon || !canPay} className="rounded-lg bg-primary px-4 py-2 text-xs font-black text-white disabled:opacity-50">
                      {validatingCoupon ? "..." : "Apply"}
                    </button>
                  )}
                </div>
              </div>

              {canPay ? (
                <RazorpayButton
                  plan={selectedPlanId}
                  amount={discountedPrice}
                  label={selectedVisual.title}
                  classesAccess={selectedPlanId === "PROFESSIONAL_PLAN" ? undefined : selectedClassIds}
                  subjectsAccess={selectedPlanId === "PROFESSIONAL_PLAN" ? selectedSubjectKeys : undefined}
                  couponCode={couponApplied ? couponCode : undefined}
                  billingCycle="yearly"
                  onSuccess={() => router.push("/dashboard")}
                  buttonLabel={`Pay ${formatPrice(discountedPrice)}`}
                  className="w-full rounded-lg bg-primary py-4 text-sm font-black text-white shadow-lg transition-all hover:scale-[1.01] active:scale-[0.98]"
                />
              ) : (
                <Button disabled className="w-full rounded-lg py-4 opacity-60">
                  Select items to continue
                </Button>
              )}

              <div className="rounded-lg border border-gray-100 bg-surface p-3">
                <div className="flex items-center gap-2 text-xs font-bold text-text-muted">
                  <ShieldCheck className="h-4 w-4 text-emerald-500" />
                  Secured by Razorpay
                </div>
                <div className="mt-2 flex items-center gap-2 text-xs font-bold text-text-muted">
                  <IndianRupee className="h-4 w-4 text-primary" />
                  Admin-controlled yearly pricing
                </div>
              </div>
            </div>
          </div>
          </aside>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default function SubscriptionPage() {
  return (
    <Suspense fallback={<PageLoader />}>
      <SubscriptionPageContent />
    </Suspense>
  );
}
