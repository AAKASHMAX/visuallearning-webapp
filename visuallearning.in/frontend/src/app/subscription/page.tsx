"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  BadgeCheck,
  CheckCircle2,
  Crown,
  GraduationCap,
  IndianRupee,
  Layers,
  ShieldCheck,
  Sparkles,
  Tag,
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

type PlanId = "SINGLE_CLASS" | "DUAL_CLASS" | "FULL_ACCESS";
type BillingCycle = "monthly" | "yearly";

type Plan = {
  id: string;
  name: string;
  monthlyPrice?: number;
  yearlyPrice?: number;
  features?: string[];
  classSelection?: number;
};

type ClassInfo = { id: string; name: string };

const PLAN_ORDER: PlanId[] = ["SINGLE_CLASS", "DUAL_CLASS", "FULL_ACCESS"];

const planVisuals: Record<PlanId, { title: string; subtitle: string; icon: any; accent: string }> = {
  SINGLE_CLASS: { title: "Single Class", subtitle: "Unlock any one class (9–12).", icon: GraduationCap, accent: "from-sky-500 to-cyan-400" },
  DUAL_CLASS: { title: "Dual Class", subtitle: "Unlock any two classes (9–12).", icon: Layers, accent: "from-violet-500 to-fuchsia-400" },
  FULL_ACCESS: { title: "Full Access", subtitle: "All four classes (9, 10, 11, 12).", icon: Crown, accent: "from-amber-500 to-orange-400" },
};

function normalizePlan(planParam: string | null): PlanId {
  const value = (planParam || "").toUpperCase();
  if (value.includes("DUAL")) return "DUAL_CLASS";
  if (value.includes("FULL")) return "FULL_ACCESS";
  return "SINGLE_CLASS";
}

function formatPrice(amount: number) {
  return amount <= 0 ? "FREE" : `₹${amount.toLocaleString("en-IN")}`;
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
  const [selectedPlanId, setSelectedPlanId] = useState<PlanId>(() => normalizePlan(searchParams.get("plan")));
  const [billingCycle, setBillingCycle] = useState<BillingCycle>(() => (searchParams.get("billing") === "monthly" ? "monthly" : "yearly"));
  const [selectedClassIds, setSelectedClassIds] = useState<string[]>([]);
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

  const orderedPlans = useMemo(
    () => PLAN_ORDER.map((id) => plans.find((plan) => plan.id === id)).filter(Boolean) as Plan[],
    [plans]
  );

  const selectedPlan = plans.find((plan) => plan.id === selectedPlanId);
  const requiredClasses = selectedPlan?.classSelection ?? 0; // 0 = all classes (Full)
  const allClassIds = classes.map((c) => c.id);
  const visual = planVisuals[selectedPlanId];

  const unitPrice = billingCycle === "monthly" ? (selectedPlan?.monthlyPrice || 0) : (selectedPlan?.yearlyPrice || 0);
  const basePrice = unitPrice; // fixed price (not per class)
  const discountedPrice = couponApplied ? Math.round(basePrice * (1 - couponDiscount / 100)) : basePrice;

  const canPay = !!selectedPlan && (requiredClasses === 0 || selectedClassIds.length === requiredClasses);
  const classesAccessToSend = requiredClasses === 0 ? allClassIds : selectedClassIds;

  const choosePlan = (planId: PlanId) => {
    setSelectedPlanId(planId);
    setSelectedClassIds([]);
    setCouponApplied(false);
  };

  const switchBillingCycle = (cycle: BillingCycle) => {
    setBillingCycle(cycle);
    setCouponApplied(false);
  };

  const toggleClass = (id: string) => {
    setCouponApplied(false);
    setSelectedClassIds((current) => {
      if (current.includes(id)) return current.filter((item) => item !== id);
      if (requiredClasses > 0 && current.length >= requiredClasses) {
        toast.error(`This plan covers ${requiredClasses} class${requiredClasses > 1 ? "es" : ""}. Deselect one first.`);
        return current;
      }
      return [...current, id];
    });
  };

  const applyCoupon = async () => {
    if (!couponCode.trim()) { toast.error("Enter a coupon code"); return; }
    if (basePrice <= 0) { toast.error("Select a paid plan first"); return; }
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
    return <div className="min-h-screen bg-surface"><Navbar /><PageLoader /></div>;
  }

  return (
    <div className="min-h-screen bg-surface">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary/10 bg-white px-3 py-1 text-xs font-black uppercase tracking-wider text-primary shadow-sm">
            <Sparkles className="h-4 w-4" /> Checkout
          </div>
          <h1 className="text-3xl font-black tracking-tight text-heading sm:text-4xl">Choose Your Subscription</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-text-muted sm:text-base">
            Pick a plan, then choose exactly which class{requiredClasses === 1 ? "" : "es"} you want. Full Access unlocks all four.
          </p>

          <div className="mt-5 inline-flex items-center rounded-full border border-gray-200 bg-white p-1 shadow-sm">
            {(["monthly", "yearly"] as BillingCycle[]).map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => switchBillingCycle(c)}
                className={cn("rounded-full px-5 py-2 text-sm font-bold capitalize transition-all", billingCycle === c ? "bg-primary text-white shadow-md" : "text-text-muted hover:text-heading")}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Plan selector */}
        <div className="grid gap-5 lg:grid-cols-3">
          {orderedPlans.map((plan) => {
            const id = plan.id as PlanId;
            const v = planVisuals[id];
            const Icon = v.icon;
            const selected = selectedPlanId === id;
            const price = billingCycle === "monthly" ? (plan.monthlyPrice || 0) : (plan.yearlyPrice || 0);
            return (
              <button
                key={plan.id}
                type="button"
                onClick={() => choosePlan(id)}
                className={cn(
                  "group relative overflow-hidden rounded-lg border bg-white p-5 text-left shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl",
                  selected ? "border-primary ring-2 ring-primary/10" : "border-gray-200 hover:border-primary/30"
                )}
              >
                <div className={`absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r ${v.accent}`} />
                <div className="mb-4 flex items-start justify-between gap-4">
                  <div className={`flex h-14 w-14 items-center justify-center rounded-lg bg-gradient-to-br ${v.accent} text-white shadow-lg`}>
                    <Icon className="h-7 w-7" />
                  </div>
                  {selected && <CheckCircle2 className="h-6 w-6 text-primary" />}
                </div>
                <h2 className="text-2xl font-black text-heading">{v.title}</h2>
                <p className="mt-2 min-h-12 text-sm leading-6 text-text-muted">{v.subtitle}</p>
                <div className="mt-4 flex items-end gap-2">
                  <span className="text-3xl font-black text-heading">{formatPrice(price)}</span>
                  <span className="pb-1 text-xs font-black uppercase tracking-wider text-text-muted">/ {billingCycle === "monthly" ? "month" : "year"}</span>
                </div>
              </button>
            );
          })}
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_23rem]">
          <div className="space-y-6">
            <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
              <div className="mb-5 flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-black text-heading">{requiredClasses === 0 ? "All Classes Included" : "Choose Classes"}</h2>
                  <p className="mt-1 text-sm text-text-muted">
                    {requiredClasses === 0
                      ? "Full Access unlocks every class — no selection needed."
                      : `Select exactly ${requiredClasses} class${requiredClasses > 1 ? "es" : ""} to continue.`}
                  </p>
                </div>
                {requiredClasses > 0 && (
                  <div className="hidden rounded-full bg-primary/10 px-3 py-1 text-xs font-black text-primary sm:block">
                    {selectedClassIds.length} / {requiredClasses}
                  </div>
                )}
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {classes.map((classItem) => {
                  const fullSelected = requiredClasses === 0;
                  const selected = fullSelected || selectedClassIds.includes(classItem.id);
                  return (
                    <button
                      key={classItem.id}
                      type="button"
                      disabled={fullSelected}
                      onClick={() => toggleClass(classItem.id)}
                      className={cn(
                        "rounded-lg border p-4 text-left transition-all",
                        selected ? "border-primary bg-primary/5 ring-2 ring-primary/10" : "border-gray-200 bg-surface hover:border-primary/30 hover:bg-white",
                        fullSelected && "cursor-default"
                      )}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white text-primary shadow-sm">
                          <GraduationCap className="h-5 w-5" />
                        </div>
                        {selected && <CheckCircle2 className="h-5 w-5 text-primary" />}
                      </div>
                      <h3 className="mt-4 text-lg font-black text-heading">{classItem.name}</h3>
                      <p className="mt-1 text-sm text-text-muted">Full class access</p>
                    </button>
                  );
                })}
              </div>
            </section>

            <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
              <h2 className="flex items-center gap-2 text-lg font-black text-heading">
                <BadgeCheck className="h-5 w-5 text-primary" /> Included Features
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
          </div>

          <aside>
            <div className="sticky top-24 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-xl">
              <div className={`bg-gradient-to-r ${visual.accent} px-5 py-4 text-white`}>
                <p className="text-[10px] font-black uppercase tracking-widest text-white/70">Order Summary</p>
                <h3 className="mt-1 text-xl font-black">{visual.title}</h3>
              </div>
              <div className="space-y-5 p-5">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm font-bold text-text-muted">
                    <span>Plan price</span>
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
                    label={visual.title}
                    classesAccess={classesAccessToSend}
                    couponCode={couponApplied ? couponCode : undefined}
                    billingCycle={billingCycle}
                    onSuccess={() => router.push("/dashboard")}
                    buttonLabel={`Pay ${formatPrice(discountedPrice)}`}
                    className="w-full rounded-lg bg-primary py-4 text-sm font-black text-white shadow-lg transition-all hover:scale-[1.01] active:scale-[0.98]"
                  />
                ) : (
                  <Button disabled className="w-full rounded-lg py-4 opacity-60">
                    {requiredClasses > 0 ? `Select ${requiredClasses} class${requiredClasses > 1 ? "es" : ""}` : "Select a plan"}
                  </Button>
                )}

                <div className="rounded-lg border border-gray-100 bg-surface p-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-text-muted">
                    <ShieldCheck className="h-4 w-4 text-emerald-500" /> Secured by Razorpay
                  </div>
                  <div className="mt-2 flex items-center gap-2 text-xs font-bold text-text-muted">
                    <IndianRupee className="h-4 w-4 text-primary" /> {billingCycle === "monthly" ? "Monthly billing" : "Yearly billing"}
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
