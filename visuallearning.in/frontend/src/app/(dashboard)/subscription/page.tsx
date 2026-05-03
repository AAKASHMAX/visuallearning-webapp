"use client";
import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { RazorpayButton } from "@/components/payment/razorpay-button";
import { PageLoader } from "@/components/ui/loading";
import api from "@/lib/api";
import {
  CheckCircle2, XCircle, Zap, Crown, Sparkles, Tag,
  CheckCircle, AlertCircle, ShieldCheck, ArrowLeft,
  Atom, Lightbulb, FlaskConical, Dna, Calculator, BookOpen,
  Calendar, BadgeCheck, Star
} from "lucide-react";
import toast from "react-hot-toast";

/* ─── Hardcoded plan details matching the courses page ─── */
const PLAN_DATA: Record<string, {
  displayName: string; price: number; originalPrice: number;
  bgColor: string; accentColor: string; badge: string | null;
  included: string[]; excluded: string[];
}> = {
  "foundation-pass": {
    displayName: "Foundation Pass", price: 0, originalPrice: 3999,
    bgColor: "#1C4D8D", accentColor: "#60A5FA", badge: null,
    included: ["Selected chapters (9–12 PCB)", "Animated concept videos", "Beginner-friendly path", "Progress tracking", "Mobile & desktop access"],
    excluded: ["Full class content", "Virtual Labs", "Priority support"],
  },
  "academic-plus": {
    displayName: "Academic Plus", price: 8999, originalPrice: 12000,
    bgColor: "#162855", accentColor: "#38BDF8", badge: null,
    included: ["Full Class 9–10 (PCB)", "Selected 11–12 P & C", "Chapter notes (PDF)", "MCQ quizzes + solutions", "Performance analytics", "Email support (24hr)"],
    excluded: ["Virtual Labs & 3D", "WhatsApp support"],
  },
  "elite-learning": {
    displayName: "Elite Learning", price: 15999, originalPrice: 20000,
    bgColor: "#2d1654", accentColor: "#D8B4FE", badge: "Most Popular",
    included: ["Full 9–12 P + C + B", "Virtual Labs (64+) 🧪", "3D Visual Learning 🔬", "Board exam practice", "Notes + formula sheets", "Priority WhatsApp support", "Deep concept tools"],
    excluded: [],
  },
};

/* ─── Match plan param → API plan object ─── */
function matchApiPlan(plans: any[], planParam: string) {
  const n = planParam.toLowerCase();
  if (n.includes("foundation")) return plans.find((p) => p.name.toLowerCase().includes("foundation"));
  if (n.includes("academic"))   return plans.find((p) => p.name.toLowerCase().includes("academic"));
  if (n.includes("elite"))      return plans.find((p) => p.name.toLowerCase().includes("elite"));
  if (n.includes("flexi"))      return plans.find((p) => p.name.toLowerCase().includes("flexi"));
  return null;
}

/* ─── Subject color helper ─── */
function subjectTheme(name: string) {
  const n = name.toLowerCase();
  if (n.includes("physics"))   return { iconGrad: "from-sky-400 to-blue-600",    bg: "from-sky-50 to-blue-50",    border: "border-sky-100",    text: "text-sky-600",    Icon: Atom };
  if (n.includes("chemistry")) return { iconGrad: "from-emerald-400 to-teal-500", bg: "from-emerald-50 to-teal-50", border: "border-emerald-100", text: "text-emerald-600", Icon: FlaskConical };
  if (n.includes("biology"))   return { iconGrad: "from-rose-400 to-fuchsia-500", bg: "from-rose-50 to-pink-50",   border: "border-rose-100",   text: "text-rose-500",   Icon: Dna };
  return                               { iconGrad: "from-violet-400 to-purple-600", bg: "from-violet-50 to-purple-50", border: "border-violet-100", text: "text-violet-600", Icon: Calculator };
}

/* ─── Old plan-grid helpers (for fallback view) ─── */
const PLAN_INFO: Record<string, { color: string; bg: string }> = {
  foundation: { color: "text-success",    bg: "bg-success/10" },
  academic:   { color: "text-primary",    bg: "bg-primary/10" },
  elite:      { color: "text-[#05BFDB]", bg: "bg-[#05BFDB]/10" },
  flexi:      { color: "text-cta",        bg: "bg-cta/10" },
};
function getPlanType(name: string) {
  const n = name.toLowerCase();
  if (n.includes("foundation") || n.includes("free") || n.includes("pass")) return "foundation";
  if (n.includes("academic") || n.includes("plus"))  return "academic";
  if (n.includes("elite")    || n.includes("premium")) return "elite";
  return "flexi";
}

/* ══════════════════════════════════════════════ */
export default function SubscriptionPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const planParam  = searchParams.get("plan")     ?? "";
  const subjectStr = searchParams.get("subjects") ?? "";
  const subjectIds = subjectStr ? subjectStr.split(",").filter(Boolean) : [];

  const isFocused = !!planParam;
  const isFlexi   = planParam === "FLEXI_PLAN";

  const [loading,          setLoading]          = useState(true);
  const [plans,            setPlans]            = useState<any[]>([]);
  const [subscription,     setSubscription]     = useState<any>(null);
  const [subjectData,      setSubjectData]      = useState<any[]>([]);   // for flexi
  const [couponCode,       setCouponCode]       = useState("");
  const [couponApplied,    setCouponApplied]    = useState(false);
  const [couponDiscount,   setCouponDiscount]   = useState(0);
  const [couponApplPlans,  setCouponApplPlans]  = useState<string[]>([]);
  const [validating,       setValidating]       = useState(false);
  const [showUpgradePlans, setShowUpgradePlans] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const [subRes, planRes] = await Promise.all([
        api.get("/subscription/my-subscription"),
        api.get("/subscription/plans"),
      ]);
      setSubscription(subRes.data.data);
      setPlans(planRes.data.data.plans ?? planRes.data.data);

      if (isFlexi && subjectIds.length > 0) {
        const { data } = await api.get("/courses/pricing/subjects");
        const all: any[] = data.data ?? [];
        const flat = all.flatMap((cls: any) => cls.subjects);
        setSubjectData(flat.filter((s: any) => subjectIds.includes(s.id)));
      }
    } catch {
      toast.error("Failed to load plans");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const applyCoupon = async () => {
    if (!couponCode.trim()) { toast.error("Enter a coupon code"); return; }
    setValidating(true);
    try {
      const { data } = await api.get(`/subscription/validate-coupon?code=${couponCode.trim()}`);
      if (data.data.valid) {
        setCouponApplied(true);
        setCouponDiscount(data.data.discountPercent);
        setCouponApplPlans(data.data.applicablePlans ?? []);
        toast.success(`${data.data.discountPercent}% discount applied!`);
      } else {
        toast.error(data.data.message);
        setCouponApplied(false);
      }
    } catch {
      toast.error("Failed to validate coupon");
    } finally {
      setValidating(false);
    }
  };

  if (loading) return <PageLoader />;

  const isActive = subscription?.status === "ACTIVE" && new Date(subscription.expiryDate) > new Date();

  /* ── Focused checkout (specific plan) ── */
  if (isFocused) {
    const planDef   = PLAN_DATA[planParam] ?? null;
    const apiPlan   = matchApiPlan(plans, planParam);
    const basePrice = isFlexi
      ? subjectData.reduce((s, sub) => s + (sub.price ?? 0), 0)
      : (planDef?.price ?? apiPlan?.price ?? 0);
    const discounted = couponApplied
      ? Math.round(basePrice * (1 - couponDiscount / 100))
      : basePrice;
    const bgColor    = isFlexi ? "#170C79" : (planDef?.bgColor ?? "#1A3263");
    const accent     = isFlexi ? "#818CF8" : (planDef?.accentColor ?? "#60A5FA");
    const planName   = isFlexi ? "FlexiLearn Plan" : (planDef?.displayName ?? planParam);

    return (
      <div className="min-h-screen bg-gray-50/50 pb-20">

        {/* Back link */}
        <div className="max-w-5xl mx-auto px-4 pt-6">
          <button onClick={() => router.back()} className="flex items-center gap-2 text-sm font-bold text-text-muted hover:text-heading transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
        </div>

        {/* Dark gradient header */}
        <div className="relative overflow-hidden mt-4" style={{ background: `linear-gradient(135deg, ${bgColor} 0%, ${bgColor}cc 100%)` }}>
          <div className="absolute inset-0 bg-grid-dark opacity-30 pointer-events-none" />
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full blur-[100px] opacity-20" style={{ backgroundColor: accent }} />

          <div className="relative z-10 max-w-5xl mx-auto px-4 py-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
            <div>
              {planDef?.badge && (
                <span className="inline-block mb-3 px-4 py-1 rounded-full text-xs font-black uppercase tracking-widest text-white shadow-lg"
                  style={{ background: "linear-gradient(135deg, #a855f7, #7c3aed)" }}>
                  ✦ {planDef.badge}
                </span>
              )}
              {isFlexi && (
                <span className="inline-block mb-3 px-4 py-1 rounded-full text-sm font-black uppercase tracking-widest text-white shadow-lg"
                  style={{ background: `linear-gradient(135deg, ${accent}, ${bgColor})`, boxShadow: `0 0 18px ${accent}55` }}>
                  ✦ FlexiLearn Plan
                </span>
              )}
              <h1 className="text-3xl font-black text-white mb-1">{planName}</h1>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-4xl font-black text-white">
                  {discounted === 0 ? "FREE" : `₹${discounted.toLocaleString()}`}
                </span>
                {couponApplied && basePrice !== discounted && (
                  <span className="text-lg font-bold text-white/40 line-through">₹{basePrice.toLocaleString()}</span>
                )}
                {!couponApplied && planDef?.originalPrice && planDef.originalPrice !== planDef.price && (
                  <span className="text-lg font-bold text-white/40 line-through">₹{planDef.originalPrice.toLocaleString()}</span>
                )}
                <span className="text-sm font-bold text-white/50">/year</span>
              </div>
            </div>
            <div className="flex items-center gap-3 text-white/60 text-sm font-bold">
              <Calendar className="w-4 h-4" />
              <span>1 Year Access</span>
              <span className="mx-2 text-white/20">|</span>
              <ShieldCheck className="w-4 h-4" />
              <span>Razorpay Secured</span>
            </div>
          </div>

          {/* Wave */}
          <svg className="w-full block -mb-px" viewBox="0 0 1440 28" preserveAspectRatio="none" style={{ height: 22 }}>
            <path d="M0,10 C360,30 1080,0 1440,10 L1440,28 L0,28 Z" fill="#f9fafb" />
          </svg>
        </div>

        {/* Body */}
        <div className="max-w-5xl mx-auto px-4 pt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Left — features / subjects */}
          <div className="lg:col-span-2 space-y-6">

            {isFlexi ? (
              /* Flexi: selected subjects */
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                <h2 className="text-lg font-black text-heading mb-1">Your Selected Subjects</h2>
                <p className="text-xs text-text-muted mb-5">{subjectData.length} subject{subjectData.length !== 1 ? "s" : ""} · Pay only for what you need</p>
                <div className="space-y-3">
                  {subjectData.map((sub) => {
                    const t = subjectTheme(sub.name);
                    return (
                      <div key={sub.id} className={`flex items-center justify-between rounded-xl border ${t.border} bg-gradient-to-r ${t.bg} px-4 py-3`}>
                        <div className="flex items-center gap-3">
                          <div className={`h-9 w-9 shrink-0 rounded-lg bg-gradient-to-br ${t.iconGrad} flex items-center justify-center shadow-sm`}>
                            <t.Icon className="h-4 w-4 text-white" />
                          </div>
                          <span className="text-sm font-black text-heading">{sub.name}</span>
                        </div>
                        <span className={`text-sm font-black ${t.text}`}>₹{sub.price.toLocaleString()}</span>
                      </div>
                    );
                  })}
                </div>
                <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-4">
                  <span className="text-sm font-bold text-text-muted">Total before discount</span>
                  <span className="text-base font-black text-heading">₹{basePrice.toLocaleString()} / year</span>
                </div>
              </div>
            ) : planDef ? (
              /* Standard plan: feature list */
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                <h2 className="text-lg font-black text-heading mb-4 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-[#00b4d8]" /> What&apos;s Included
                </h2>
                <ul className="space-y-2 mb-5">
                  {planDef.included.map((f, i) => (
                    <li key={i} className="flex items-center gap-3 rounded-xl border border-gray-100 bg-gray-50 px-3 py-2.5">
                      <div className="shrink-0 flex h-6 w-6 items-center justify-center rounded-md"
                        style={{ backgroundColor: `${accent}18`, border: `1px solid ${accent}35` }}>
                        <CheckCircle2 className="h-3.5 w-3.5" style={{ color: accent }} strokeWidth={2.5} />
                      </div>
                      <span className="text-[13px] font-semibold text-heading">{f}</span>
                    </li>
                  ))}
                </ul>

                {planDef.excluded.length > 0 && (
                  <>
                    <h3 className="text-xs font-black uppercase tracking-widest text-rose-500/70 mb-2 flex items-center gap-1">
                      <XCircle className="w-3 h-3" /> Not in this plan
                    </h3>
                    <ul className="space-y-1">
                      {planDef.excluded.map((f, i) => (
                        <li key={i} className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg border border-dashed border-rose-200/70 bg-rose-50/50">
                          <XCircle className="h-3.5 w-3.5 shrink-0 text-rose-300" strokeWidth={2} />
                          <span className="text-[12px] font-medium text-text-muted line-through decoration-rose-300">{f}</span>
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </div>
            ) : null}

            {/* Why VisualLearning */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
              <h2 className="text-base font-black text-heading mb-4">Why VisualLearning?</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { icon: Star,        text: "Expert-crafted 3D animations"  },
                  { icon: BadgeCheck,  text: "NCERT & board exam aligned"     },
                  { icon: Zap,         text: "Learn at your own pace"         },
                  { icon: ShieldCheck, text: "1-year full access guarantee"   },
                ].map(({ icon: Icon, text }, i) => (
                  <div key={i} className="flex items-center gap-2.5 rounded-xl bg-gray-50 border border-gray-100 px-3 py-2.5">
                    <Icon className="w-4 h-4 text-primary shrink-0" />
                    <span className="text-[12px] font-semibold text-heading">{text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right — sticky payment card */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 bg-white rounded-2xl border border-gray-200 shadow-xl overflow-hidden">

              {/* Card header */}
              <div className="px-5 py-4 border-b border-gray-100" style={{ background: `linear-gradient(135deg, ${bgColor}10, ${accent}08)` }}>
                <p className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-0.5">Order Summary</p>
                <h3 className="text-lg font-black text-heading">{planName}</h3>
              </div>

              <div className="p-5 space-y-4">
                {/* Price breakdown */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-text-muted font-semibold">Plan price</span>
                    <span className="font-black text-heading">
                      {basePrice === 0 ? "FREE" : `₹${basePrice.toLocaleString()}`}
                    </span>
                  </div>
                  {couponApplied && (
                    <div className="flex justify-between text-sm">
                      <span className="text-emerald-600 font-semibold">Coupon ({couponDiscount}% off)</span>
                      <span className="font-black text-emerald-600">- ₹{(basePrice - discounted).toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between border-t border-gray-100 pt-2">
                    <span className="font-black text-heading">Total</span>
                    <span className="text-xl font-black" style={{ color: accent }}>
                      {discounted === 0 ? "FREE" : `₹${discounted.toLocaleString()}`}
                    </span>
                  </div>
                  <p className="text-[10px] text-text-muted font-semibold">Includes 1 year access · GST inclusive</p>
                </div>

                {/* Coupon */}
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-1.5">Coupon Code</p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      placeholder="ENTER CODE"
                      disabled={couponApplied}
                      className="flex-1 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-xs font-bold tracking-widest focus:outline-none focus:border-primary/40"
                    />
                    {couponApplied ? (
                      <button onClick={() => { setCouponApplied(false); setCouponCode(""); }}
                        className="rounded-xl px-3 py-2 text-xs font-black text-rose-500 border border-rose-200 bg-rose-50 hover:bg-rose-100 transition-colors">
                        Remove
                      </button>
                    ) : (
                      <button onClick={applyCoupon} disabled={validating}
                        className="rounded-xl px-3 py-2 text-xs font-black text-white transition-colors"
                        style={{ backgroundColor: bgColor }}>
                        {validating ? "..." : "Apply"}
                      </button>
                    )}
                  </div>
                  {couponApplied && (
                    <p className="text-[10px] font-bold text-emerald-600 mt-1">✓ {couponDiscount}% discount applied</p>
                  )}
                </div>

                {/* Pay button */}
                {apiPlan ? (
                  <RazorpayButton
                    plan={apiPlan.id}
                    amount={discounted}
                    label={planName}
                    couponCode={couponApplied ? couponCode : undefined}
                    onSuccess={() => router.push("/dashboard")}
                    className="w-full py-3.5 rounded-xl text-sm font-black text-white shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98]"
                  />
                ) : (
                  <button
                    disabled
                    className="w-full py-3.5 rounded-xl text-sm font-black text-white opacity-50 cursor-not-allowed"
                    style={{ backgroundColor: bgColor }}
                  >
                    Plan not available
                  </button>
                )}

                {/* Trust */}
                <div className="flex items-center justify-center gap-2 text-[10px] font-bold text-text-muted">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                  Secured by Razorpay · 256-bit SSL
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ══════ Generic plans grid (no plan param) ══════ */
  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-4">
          <Sparkles className="w-4 h-4 text-[#05BFDB]" />
          <span className="text-sm text-text-muted font-bold uppercase tracking-widest">Premium Access</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-black text-heading mb-4 tracking-tighter">
          {isActive ? "Your Subscription" : "Choose Your Plan"}
        </h1>
        <p className="text-text-muted max-w-2xl mx-auto text-lg font-medium">
          {isActive
            ? "Manage your current plan or upgrade for more advanced features."
            : "Unlock premium 3D animations, virtual labs, and expert-led science courses."}
        </p>
      </div>

      {/* Active Subscription Banner */}
      {isActive && subscription && (
        <div className="mb-12 relative overflow-hidden rounded-3xl border-2 border-primary/20 bg-primary/5 p-8 shadow-xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -mr-32 -mt-32" />
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/30">
                <Crown className="w-8 h-8 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="text-2xl font-black text-heading tracking-tight">Active Plan</h2>
                  <span className="px-2 py-0.5 rounded-full bg-success text-white text-[10px] font-black uppercase tracking-widest">ACTIVE</span>
                </div>
                <p className="text-text-muted font-bold">
                  Expires: {new Date(subscription.expiryDate).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
                </p>
              </div>
            </div>
            <Button variant={showUpgradePlans ? "outline" : "accent"} onClick={() => setShowUpgradePlans(!showUpgradePlans)} className="rounded-xl font-bold px-8 py-6">
              {showUpgradePlans ? "Hide Upgrades" : "View Upgrade Options"}
            </Button>
          </div>
        </div>
      )}

      {(!isActive || showUpgradePlans) && (
        <>
          {/* Coupon */}
          <div className="max-w-md mx-auto mb-12 bg-white rounded-2xl p-2 shadow-md border border-card-border flex gap-2">
            <input type="text" value={couponCode} onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
              placeholder="ENTER COUPON CODE" disabled={couponApplied}
              className="flex-1 bg-transparent px-4 font-bold text-sm tracking-widest focus:outline-none" />
            {couponApplied ? (
              <Button variant="ghost" onClick={() => { setCouponApplied(false); setCouponCode(""); }} className="text-rose-500 font-bold">REMOVE</Button>
            ) : (
              <Button onClick={applyCoupon} disabled={validating} className="bg-heading text-white font-bold px-6 rounded-xl">
                {validating ? "..." : "APPLY"}
              </Button>
            )}
          </div>

          {/* Plans grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {plans.map((plan) => {
              const type = getPlanType(plan.name);
              const info = PLAN_INFO[type] ?? { color: "text-primary", bg: "bg-primary/5" };
              const discountedPrice = Math.round(plan.price * (1 - (couponApplied ? couponDiscount / 100 : 0)));
              return (
                <div key={plan.id} className={`group relative rounded-3xl border-2 ${plan.popular ? "border-[#05BFDB] bg-[#1A3263]/5 shadow-2xl scale-[1.03]" : "border-card-border bg-white shadow-lg"} p-8 transition-all duration-500 hover:-translate-y-2 flex flex-col`}>
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full bg-gradient-to-r from-primary to-[#05BFDB] text-white text-[10px] font-black tracking-widest uppercase z-10 shadow-lg">
                      BEST VALUE
                    </div>
                  )}
                  <div className={`w-14 h-14 rounded-2xl ${info.bg} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                    <Sparkles className={`w-7 h-7 ${info.color}`} />
                  </div>
                  <h3 className="text-2xl font-black text-heading mb-1 tracking-tight">{plan.name}</h3>
                  <p className="text-sm text-text-muted font-bold mb-6 opacity-60 uppercase tracking-widest">{plan.duration}</p>
                  <div className="mb-8">
                    {couponApplied && <span className="text-lg text-text-muted line-through mr-2 font-bold opacity-40">₹{plan.price}</span>}
                    <span className="text-4xl font-black text-heading">₹{discountedPrice}</span>
                    <span className="text-text-muted text-sm font-bold ml-1">/year</span>
                  </div>
                  <ul className="space-y-3 mb-8 flex-1">
                    {plan.features.map((f: string, i: number) => (
                      <li key={i} className="flex items-start gap-3 text-sm text-text-muted font-medium leading-tight">
                        <CheckCircle2 className={`w-5 h-5 ${info.color} shrink-0 mt-0.5`} />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                  <RazorpayButton plan={plan.id} amount={discountedPrice} label={plan.name}
                    couponCode={couponApplied ? couponCode : undefined} onSuccess={load}
                    className={`w-full py-6 text-base font-black rounded-2xl shadow-xl transition-all ${plan.popular ? "bg-gradient-to-r from-primary to-[#05BFDB] hover:opacity-90 text-white" : "bg-heading hover:bg-black text-white"}`} />
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Trust Badges */}
      <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-6 opacity-50 hover:opacity-80 transition-all duration-700">
        {[
          { icon: CheckCircle,  label: "Secure Payment"   },
          { icon: AlertCircle,  label: "24/7 Support"     },
          { icon: Sparkles,     label: "Premium Content"  },
          { icon: Tag,          label: "Best Price"       },
        ].map(({ icon: Icon, label }) => (
          <div key={label} className="flex flex-col items-center text-center gap-2">
            <Icon className="w-8 h-8 text-primary" />
            <p className="text-xs font-black uppercase tracking-widest">{label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
