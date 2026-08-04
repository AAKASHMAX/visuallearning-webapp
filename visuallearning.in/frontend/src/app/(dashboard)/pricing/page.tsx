"use client";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { PageLoader } from "@/components/ui/loading";
import { RazorpayButton } from "@/components/payment/razorpay-button";
import api from "@/lib/api";
import { Check, GraduationCap, Layers, Crown, Sparkles, Tag, X, type LucideIcon } from "lucide-react";
import toast from "react-hot-toast";

type BillingCycle = "monthly" | "quarterly" | "yearly";

interface Plan {
  id: string;
  name: string;
  monthlyPrice?: number;
  quarterlyPrice?: number;
  yearlyPrice?: number;
  features?: string[];
  classSelection?: number;
}

interface ClassInfo { id: string; name: string }

const PLAN_ORDER = ["SINGLE_CLASS", "DUAL_CLASS", "FULL_ACCESS"];

const PLAN_META: Record<string, { tagline: string; icon: LucideIcon; gradient: string; popular?: boolean }> = {
  SINGLE_CLASS: { tagline: "Pick any 1 class", icon: GraduationCap, gradient: "from-sky-500 to-cyan-500" },
  DUAL_CLASS: { tagline: "Pick any 2 classes", icon: Layers, gradient: "from-violet-500 to-purple-600", popular: true },
  FULL_ACCESS: { tagline: "All 4 classes (9–12)", icon: Crown, gradient: "from-amber-500 to-orange-600" },
};

function shortClass(name: string) {
  return name.replace(/class/i, "").trim();
}

export default function PricingPage() {
  const router = useRouter();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [classes, setClasses] = useState<ClassInfo[]>([]);
  const [cycle, setCycle] = useState<BillingCycle>("yearly");
  const [selected, setSelected] = useState<Record<string, string[]>>({});
  const [loading, setLoading] = useState(true);

  // Coupon / referral code
  const [couponInput, setCouponInput] = useState("");
  const [coupon, setCoupon] = useState<{ code: string; discountPercent: number; applicablePlans: string[] } | null>(null);
  const [checkingCoupon, setCheckingCoupon] = useState(false);

  useEffect(() => {
    api.get("/subscription/plans").then(({ data }) => {
      setPlans(data.data?.plans || []);
      const cls = ((data.data?.classes || []) as ClassInfo[]).filter((c) => ["9", "10", "11", "12"].some((n) => c.name.includes(n)));
      setClasses(cls);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  // Auto-apply a referral code captured from a ?ref=CODE link.
  useEffect(() => {
    const ref = typeof window !== "undefined" ? localStorage.getItem("vl_ref") : null;
    if (ref) { setCouponInput(ref); applyCoupon(ref, true); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const applyCoupon = async (raw?: string, silent = false) => {
    const code = (raw ?? couponInput).trim().toUpperCase();
    if (!code) return;
    setCheckingCoupon(true);
    try {
      const { data } = await api.get(`/subscription/validate-coupon?code=${encodeURIComponent(code)}`);
      const r = data.data;
      if (r?.valid) {
        setCoupon({ code, discountPercent: r.discountPercent, applicablePlans: r.applicablePlans || [] });
        if (!silent) toast.success(`Code applied — ${r.discountPercent}% off`);
      } else {
        setCoupon(null);
        if (!silent) toast.error(r?.message || "Invalid code");
      }
    } catch (err: any) {
      setCoupon(null);
      if (!silent) toast.error(err.response?.data?.message || "Could not check code");
    } finally { setCheckingCoupon(false); }
  };

  const removeCoupon = () => { setCoupon(null); setCouponInput(""); localStorage.removeItem("vl_ref"); };
  const couponApplies = (planId: string) => !!coupon && (coupon.applicablePlans.length === 0 || coupon.applicablePlans.includes(planId));
  const discounted = (price: number, planId: string) =>
    couponApplies(planId) ? Math.max(1, Math.round(price * (1 - coupon!.discountPercent / 100))) : price;

  const ordered = useMemo(
    () => PLAN_ORDER.map((id) => plans.find((p) => p.id === id)).filter(Boolean) as Plan[],
    [plans]
  );
  const allClassIds = classes.map((c) => c.id);

  const toggleClass = (planId: string, classId: string, max: number) => {
    setSelected((prev) => {
      const cur = prev[planId] || [];
      let next: string[];
      if (cur.includes(classId)) next = cur.filter((x) => x !== classId);
      else if (cur.length < max) next = [...cur, classId];
      else if (max === 1) next = [classId];
      else next = [...cur.slice(1), classId];
      return { ...prev, [planId]: next };
    });
  };

  if (loading) return <PageLoader />;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-8 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/10 bg-white px-4 py-1.5 text-xs font-black uppercase tracking-wider text-primary shadow-sm">
          <Sparkles className="h-3.5 w-3.5" /> Plans &amp; Pricing
        </div>
        <h1 className="mt-4 text-3xl font-black tracking-tight text-heading sm:text-4xl">Choose your plan</h1>
        <p className="mx-auto mt-3 max-w-xl text-sm text-text-muted sm:text-base">
          Pick a plan and choose your classes right here. Single = 1 class, Dual = 2 classes, Full Access = everything.
        </p>

        <div className="mt-6 inline-flex items-center gap-1 rounded-full border border-gray-200 bg-white p-1 shadow-sm">
          {(["monthly", "quarterly", "yearly"] as BillingCycle[]).map((c) => (
            <button
              key={c}
              onClick={() => setCycle(c)}
              className={`rounded-full px-5 py-2 text-sm font-bold capitalize transition-all ${cycle === c ? "bg-primary text-white" : "text-text-muted hover:text-heading"}`}
            >
              {c}
              {c === "yearly" && <span className="ml-1.5 text-[10px] font-black text-emerald-500">Save</span>}
            </button>
          ))}
        </div>
      </div>

      {/* Coupon / referral code */}
      <div className="mx-auto mb-8 max-w-md">
        {coupon ? (
          <div className="flex items-center justify-between gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5">
            <span className="flex items-center gap-2 text-sm font-bold text-emerald-800">
              <Tag className="h-4 w-4" /> {coupon.code} — {coupon.discountPercent}% off applied
            </span>
            <button onClick={removeCoupon} className="text-emerald-700 hover:text-emerald-900"><X className="h-4 w-4" /></button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Tag className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                value={couponInput}
                onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                onKeyDown={(e) => e.key === "Enter" && applyCoupon()}
                placeholder="Have a referral / coupon code?"
                className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-9 pr-3 text-sm focus:border-primary/50 focus:outline-none"
              />
            </div>
            <button onClick={() => applyCoupon()} disabled={checkingCoupon || !couponInput.trim()}
              className="rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-white disabled:opacity-50">
              {checkingCoupon ? "..." : "Apply"}
            </button>
          </div>
        )}
      </div>

      {ordered.length === 0 ? (
        <div className="rounded-2xl bg-white p-10 text-center text-text-muted shadow-sm">No plans available right now.</div>
      ) : (
        <div className="grid items-start gap-6 lg:grid-cols-3">
          {ordered.map((plan) => {
            const meta = PLAN_META[plan.id] || PLAN_META.SINGLE_CLASS;
            const Icon = meta.icon;
            const max = plan.classSelection ?? 0;
            const isFull = max === 0;
            const sel = isFull ? allClassIds : (selected[plan.id] || []);
            const price = cycle === "monthly" ? plan.monthlyPrice || 0 : cycle === "quarterly" ? plan.quarterlyPrice || 0 : plan.yearlyPrice || 0;
            const ready = isFull || sel.length === max;
            const classesAccess = isFull ? allClassIds : sel;
            const hasDiscount = couponApplies(plan.id);
            const total = discounted(price, plan.id);

            return (
              <div
                key={plan.id}
                className={`relative flex flex-col rounded-3xl bg-white p-6 shadow-sm transition-all ${meta.popular ? "ring-2 ring-primary" : "border border-gray-100"}`}
              >
                {meta.popular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-primary px-3 py-1 text-[10px] font-black uppercase tracking-wider text-white shadow-md">Popular</span>
                )}

                {/* Header: name left, price right */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${meta.gradient} text-white`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-black leading-tight text-heading">{plan.name}</h3>
                      <p className="text-xs text-text-muted">{meta.tagline}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    {hasDiscount && <div className="text-xs font-bold text-text-muted line-through">₹{price.toLocaleString("en-IN")}</div>}
                    <div className="text-2xl font-black text-heading">₹{total.toLocaleString("en-IN")}</div>
                    <div className="text-[11px] font-bold text-text-muted">/{cycle === "monthly" ? "month" : cycle === "quarterly" ? "3 months" : "year"}</div>
                  </div>
                </div>

                {/* Feature mini cards */}
                <div className="mt-5 grid grid-cols-2 gap-2">
                  {(plan.features || []).map((f) => (
                    <div key={f} className="flex items-start gap-1.5 rounded-xl border border-gray-100 bg-surface px-2.5 py-2 text-[11px] font-semibold text-heading">
                      <Check className="mt-0.5 h-3 w-3 shrink-0 text-emerald-500" />
                      <span className="leading-snug">{f}</span>
                    </div>
                  ))}
                </div>

                {/* Class selector */}
                <div className="mt-5">
                  <p className="mb-2 text-xs font-bold text-text-muted">
                    {isFull ? "All classes included" : `Select ${max} class${max > 1 ? "es" : ""}`}
                    {!isFull && <span className="ml-1 text-primary">({sel.length}/{max})</span>}
                  </p>
                  <div className="grid grid-cols-4 gap-2">
                    {classes.map((c) => {
                      const active = isFull || sel.includes(c.id);
                      return (
                        <button
                          key={c.id}
                          type="button"
                          disabled={isFull}
                          onClick={() => toggleClass(plan.id, c.id, max)}
                          className={`rounded-xl border py-2.5 text-sm font-black transition-all ${
                            active
                              ? "border-primary bg-primary text-white"
                              : "border-gray-200 bg-white text-heading hover:border-primary/40"
                          } ${isFull ? "cursor-default opacity-90" : ""}`}
                        >
                          {shortClass(c.name)}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Action */}
                <div className="mt-6">
                  {ready ? (
                    <RazorpayButton
                      plan={plan.id}
                      amount={total}
                      label={plan.name}
                      classesAccess={classesAccess}
                      billingCycle={cycle}
                      couponCode={hasDiscount ? coupon?.code : undefined}
                      downloadAddon={true}
                      onSuccess={() => router.push("/dashboard")}
                      buttonLabel={`Subscribe • ₹${total.toLocaleString("en-IN")}`}
                      className={`w-full rounded-xl bg-gradient-to-r py-3 text-sm font-black text-white transition-all hover:opacity-90 ${meta.gradient}`}
                    />
                  ) : (
                    <button disabled className="w-full cursor-not-allowed rounded-xl bg-gray-200 py-3 text-sm font-black text-gray-400">
                      Select {max} class{max > 1 ? "es" : ""}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
