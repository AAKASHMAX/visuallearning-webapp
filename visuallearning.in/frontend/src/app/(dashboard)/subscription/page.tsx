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
import { cn } from "@/lib/utils";

/* ─── UI-only metadata for plans ─── */
const PLAN_METADATA: Record<string, {
  bgColor: string; accentColor: string; badge: string | null;
  included: string[]; excluded: string[];
}> = {
  "FOUNDATION_PASS": {
    bgColor: "#1C4D8D", accentColor: "#60A5FA", badge: null,
    included: ["Selected chapters (9–12 PCB)", "Animated concept videos", "Beginner-friendly path", "Progress tracking", "Mobile & desktop access"],
    excluded: ["Full class content", "Virtual Labs", "Priority support"],
  },
  "ACADEMIC_PLUS": {
    bgColor: "#162855", accentColor: "#38BDF8", badge: null,
    included: ["Full Class 9–10 (PCB)", "Selected 11–12 P & C", "Chapter notes (PDF)", "MCQ quizzes + solutions", "Performance analytics", "Email support (24hr)"],
    excluded: ["Virtual Labs & 3D", "WhatsApp support"],
  },
  "ELITE_LEARNING": {
    bgColor: "#2d1654", accentColor: "#D8B4FE", badge: "Most Popular",
    included: ["Full 9–12 P + C + B", "Virtual Labs (64+) 🧪", "3D Visual Learning 🔬", "Board exam practice", "Notes + formula sheets", "Priority WhatsApp support", "Deep concept tools"],
    excluded: [],
  },
  "CLASS_9": {
    bgColor: "#1e3a8a", accentColor: "#93c5fd", badge: null,
    included: ["Full 9th Grade Curriculum", "3D Animated Videos", "Virtual Labs & Simulations", "Board exam prep", "Chapter notes", "Expert support"],
    excluded: [],
  },
  "CLASS_10": {
    bgColor: "#1e1b4b", accentColor: "#c084fc", badge: null,
    included: ["Full 10th Grade Curriculum", "3D Animated Videos", "Virtual Labs & Simulations", "Board exam prep", "Chapter notes", "Expert support"],
    excluded: [],
  },
  "CLASS_11": {
    bgColor: "#312e81", accentColor: "#818cf8", badge: null,
    included: ["Full 11th Grade Curriculum", "Advanced 3D Visuals", "Complex Simulations", "Competitive exam base", "Formula sheets", "Priority support"],
    excluded: [],
  },
  "CLASS_12": {
    bgColor: "#4c1d95", accentColor: "#ddd6fe", badge: null,
    included: ["Full 12th Grade Curriculum", "Advanced 3D Visuals", "Complex Simulations", "Board & Competitive prep", "Formula sheets", "Priority support"],
    excluded: [],
  }
};

/* ─── Match plan param (slug or key) → API plan object ─── */
function matchApiPlan(plans: any[], planParam: string) {
  if (!planParam) return null;
  const pNormalized = planParam.toUpperCase().replace(/-/g, '_');
  
  // 1. Try exact match with plan key (id)
  let match = plans.find(p => p.id === pNormalized);
  if (match) return match;

  // 2. Try match by course slug (if planParam was a slug)
  match = plans.find(p => p.slug === planParam);
  if (match) return match;

  // 3. Fallback to keyword-based match
  const n = planParam.toLowerCase();
  if (n.includes("foundation")) return plans.find(p => p.id.includes("FOUNDATION"));
  if (n.includes("academic"))   return plans.find(p => p.id.includes("ACADEMIC"));
  if (n.includes("elite"))      return plans.find(p => p.id.includes("ELITE"));
  if (n.includes("class-9") || n.includes("class_9"))   return plans.find(p => p.id === "CLASS_9");
  if (n.includes("class-10") || n.includes("class_10")) return plans.find(p => p.id === "CLASS_10");
  if (n.includes("class-11") || n.includes("class_11")) return plans.find(p => p.id === "CLASS_11");
  if (n.includes("class-12") || n.includes("class_12")) return plans.find(p => p.id === "CLASS_12");
  if (n.includes("flexi"))      return plans.find(p => p.id.includes("FLEXI"));
  
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

/* ─── Old plan-grid helpers ─── */
const PLAN_INFO: Record<string, { color: string; bg: string }> = {
  foundation: { color: "text-success",    bg: "bg-success/10" },
  academic:   { color: "text-primary",    bg: "bg-primary/10" },
  elite:      { color: "text-[#05BFDB]", bg: "bg-[#05BFDB]/10" },
  class:      { color: "text-purple-600", bg: "bg-purple-100" },
  flexi:      { color: "text-cta",        bg: "bg-cta/10" },
};
function getPlanType(name: string) {
  const n = name.toLowerCase();
  if (n.includes("class")) return "class";
  if (n.includes("foundation") || n.includes("free") || n.includes("pass")) return "foundation";
  if (n.includes("academic") || n.includes("plus"))  return "academic";
  if (n.includes("elite")    || n.includes("premium")) return "elite";
  return "flexi";
}

export default function SubscriptionPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const planParam  = searchParams.get("plan")     ?? "";
  const subjectStr = searchParams.get("subjects") ?? "";
  const subjectIds = subjectStr ? subjectStr.split(",").filter(Boolean) : [];

  const [loading,          setLoading]          = useState(true);
  const [plans,            setPlans]            = useState<any[]>([]);
  const [subscription,     setSubscription]     = useState<any>(null);
  const [subjectData,      setSubjectData]      = useState<any[]>([]);
  const [couponCode,       setCouponCode]       = useState("");
  const [couponApplied,    setCouponApplied]    = useState(false);
  const [couponDiscount,   setCouponDiscount]   = useState(0);
  const [validating,       setValidating]       = useState(false);
  const [showUpgradePlans, setShowUpgradePlans] = useState(false);

  const isFocused = !!planParam;
  const apiPlan   = matchApiPlan(plans, planParam);
  const isFlexi   = apiPlan?.id === "FLEXI_PLAN" || planParam === "FLEXI_PLAN";

  const load = async () => {
    setLoading(true);
    try {
      const [subRes, planRes] = await Promise.all([
        api.get("/subscription/my-subscription"),
        api.get("/subscription/plans"),
      ]);
      setSubscription(subRes.data.data);
      const fetchedPlans = planRes.data.data.plans ?? planRes.data.data;
      setPlans(fetchedPlans);

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
      const { data } = await api.get(`/subscription/validate-coupon?code=${couponCode.trim()}&plan=${apiPlan?.id || ""}`);
      if (data.data.valid) {
        setCouponApplied(true);
        setCouponDiscount(data.data.discountPercent);
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

  if (isFocused) {
    const meta       = PLAN_METADATA[apiPlan?.id] || null;
    const basePrice  = isFlexi
      ? subjectData.reduce((s, sub) => s + (sub.price ?? 0), 0)
      : (apiPlan?.price ?? 0);
    const discounted = couponApplied
      ? Math.round(basePrice * (1 - couponDiscount / 100))
      : basePrice;
    
    const bgColor    = meta?.bgColor     || (isFlexi ? "#170C79" : "#1A3263");
    const accent     = meta?.accentColor  || (isFlexi ? "#818CF8" : "#60A5FA");
    const planName   = apiPlan?.name     || (isFlexi ? "FlexiLearn Plan" : planParam);

    return (
      <div className="min-h-screen bg-gray-50/50 pb-20">
        <div className="max-w-5xl mx-auto px-4 pt-6">
          <button onClick={() => router.back()} className="flex items-center gap-2 text-sm font-bold text-text-muted hover:text-heading transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
        </div>

        <div className="relative overflow-hidden mt-4" style={{ background: `linear-gradient(135deg, ${bgColor} 0%, ${bgColor}cc 100%)` }}>
          <div className="absolute inset-0 bg-grid-dark opacity-30 pointer-events-none" />
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full blur-[100px] opacity-20" style={{ backgroundColor: accent }} />

          <div className="relative z-10 max-w-5xl mx-auto px-4 py-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 text-white">
            <div>
              {(meta?.badge || isFlexi) && (
                <span className="inline-block mb-3 px-4 py-1 rounded-full text-xs font-black uppercase tracking-widest bg-white/20 backdrop-blur-sm shadow-lg border border-white/10">
                  ✦ {meta?.badge || "Custom Plan"}
                </span>
              )}
              <h1 className="text-3xl font-black mb-1">{planName}</h1>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-4xl font-black">
                  {discounted === 0 ? "FREE" : `₹${discounted.toLocaleString()}`}
                </span>
                {couponApplied && basePrice !== discounted && (
                  <span className="text-lg font-bold text-white/40 line-through">₹{basePrice.toLocaleString()}</span>
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
          <svg className="w-full block -mb-px" viewBox="0 0 1440 28" preserveAspectRatio="none" style={{ height: 22 }}>
            <path d="M0,10 C360,30 1080,0 1440,10 L1440,28 L0,28 Z" fill="#f9fafb" />
          </svg>
        </div>

        <div className="max-w-5xl mx-auto px-4 pt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {isFlexi ? (
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                <h2 className="text-lg font-black text-heading mb-1">Your Selected Subjects</h2>
                <p className="text-xs text-text-muted mb-5">{subjectData.length} subject{subjectData.length !== 1 ? "s" : ""} · Pay only for what you need</p>
                <div className="space-y-3">
                  {subjectData.map((sub) => {
                    const t = subjectTheme(sub.name);
                    return (
                      <div key={sub.id} className={cn("flex items-center justify-between rounded-xl border bg-gradient-to-r px-4 py-3", t.border, t.bg)}>
                        <div className="flex items-center gap-3">
                          <div className={cn("h-9 w-9 shrink-0 rounded-lg bg-gradient-to-br flex items-center justify-center shadow-sm", t.iconGrad)}>
                            <t.Icon className="h-4 w-4 text-white" />
                          </div>
                          <span className="text-sm font-black text-heading">{sub.name}</span>
                        </div>
                        <span className={cn("text-sm font-black", t.text)}>₹{sub.price.toLocaleString()}</span>
                      </div>
                    );
                  })}
                </div>
                <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-4">
                  <span className="text-sm font-bold text-text-muted">Total before discount</span>
                  <span className="text-base font-black text-heading">₹{basePrice.toLocaleString()} / year</span>
                </div>
              </div>
            ) : meta ? (
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                <h2 className="text-lg font-black text-heading mb-4 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary" /> What&apos;s Included
                </h2>
                <ul className="space-y-2 mb-5">
                  {meta.included.map((f, i) => (
                    <li key={i} className="flex items-center gap-3 rounded-xl border border-gray-100 bg-gray-50 px-3 py-2.5">
                      <div className="shrink-0 flex h-6 w-6 items-center justify-center rounded-md bg-primary/10 border border-primary/20">
                        <CheckCircle2 className="h-3.5 w-3.5 text-primary" strokeWidth={2.5} />
                      </div>
                      <span className="text-[13px] font-semibold text-heading">{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 text-center py-12">
                <p className="text-text-muted font-bold">Standard features and benefits included with this plan.</p>
              </div>
            )}

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

          <div className="lg:col-span-1">
            <div className="sticky top-24 bg-white rounded-2xl border border-gray-200 shadow-xl overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100" style={{ backgroundColor: `${bgColor}08` }}>
                <p className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-0.5">Order Summary</p>
                <h3 className="text-lg font-black text-heading">{planName}</h3>
              </div>

              <div className="p-5 space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm font-bold text-text-muted">
                    <span>Plan price</span>
                    <span className="text-heading">
                      {basePrice === 0 ? "FREE" : `₹${basePrice.toLocaleString()}`}
                    </span>
                  </div>
                  {couponApplied && (
                    <div className="flex justify-between text-sm font-bold text-emerald-600">
                      <span>Discount</span>
                      <span>- ₹{(basePrice - discounted).toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between border-t border-gray-100 pt-2 text-heading">
                    <span className="font-black">Total</span>
                    <span className="text-xl font-black">
                      {discounted === 0 ? "FREE" : `₹${discounted.toLocaleString()}`}
                    </span>
                  </div>
                </div>

                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-1.5">Coupon Code</p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      placeholder="ENTER CODE"
                      disabled={couponApplied}
                      className="flex-1 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-xs font-bold focus:outline-none focus:border-primary"
                    />
                    {couponApplied ? (
                      <button onClick={() => { setCouponApplied(false); setCouponCode(""); }} className="text-rose-500 text-xs font-black px-2">Remove</button>
                    ) : (
                      <button onClick={applyCoupon} disabled={validating} className="bg-primary text-white rounded-xl px-4 py-2 text-xs font-black">{validating ? "..." : "Apply"}</button>
                    )}
                  </div>
                </div>

                {apiPlan ? (
                  <RazorpayButton
                    plan={apiPlan.id}
                    amount={discounted}
                    label={planName}
                    subjectsAccess={isFlexi ? subjectIds : undefined}
                    couponCode={couponApplied ? couponCode : undefined}
                    onSuccess={() => router.push("/dashboard")}
                    className="w-full py-4 rounded-xl text-sm font-black text-white bg-primary shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all"
                  />
                ) : (
                  <Button disabled className="w-full opacity-50">Plan not available</Button>
                )}
                <div className="flex items-center justify-center gap-2 text-[10px] font-bold text-text-muted">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                  Secured by Razorpay
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ── Standard list view ── */
  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/5 mb-4">
          <Sparkles className="w-4 h-4 text-primary" />
          <span className="text-xs text-primary font-black uppercase tracking-widest">Premium Access</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-black text-heading mb-4 tracking-tighter">
          {isActive ? "Your Subscription" : "Choose Your Plan"}
        </h1>
        <p className="text-text-muted max-w-2xl mx-auto text-lg font-medium">
          {isActive ? "Manage your subscription or upgrade your learning experience." : "Unlock 3D animated courses, virtual labs, and complete exam preparation."}
        </p>
      </div>

      {isActive && subscription && (
        <div className="mb-12 rounded-3xl bg-primary/5 border-2 border-primary/10 p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl shadow-primary/5">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center shadow-lg"><Crown className="w-8 h-8 text-white" /></div>
            <div>
              <h2 className="text-2xl font-black text-heading">Active: {subscription.course?.name || subscription.plan}</h2>
              <p className="text-text-muted font-bold">Expires: {new Date(subscription.expiryDate).toLocaleDateString()}</p>
            </div>
          </div>
          <Button variant={showUpgradePlans ? "outline" : "default"} onClick={() => setShowUpgradePlans(!showUpgradePlans)} className="rounded-xl font-bold">{showUpgradePlans ? "Hide Plans" : "Upgrade Plan"}</Button>
        </div>
      )}

      {(!isActive || showUpgradePlans) && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {plans.map((plan) => {
            const meta = PLAN_METADATA[plan.id];
            const type = getPlanType(plan.name);
            const info = PLAN_INFO[type] || PLAN_INFO.flexi;
            const discountedPrice = Math.round(plan.price * (1 - (couponApplied ? couponDiscount / 100 : 0)));

            return (
              <div key={plan.id} className={cn("relative flex flex-col rounded-3xl border-2 p-8 transition-all hover:-translate-y-2 shadow-lg bg-white", plan.popular ? "border-primary scale-[1.03] z-10" : "border-gray-100")}>
                {plan.popular && <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-white text-[10px] font-black px-4 py-1.5 rounded-full">MOST POPULAR</div>}
                <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center mb-6", info.bg)}><Star className={cn("w-7 h-7", info.color)} /></div>
                <h3 className="text-2xl font-black text-heading mb-1">{plan.name}</h3>
                <div className="mb-8">
                  <span className="text-4xl font-black">₹{discountedPrice}</span>
                  <span className="text-text-muted text-sm font-bold ml-1">/year</span>
                </div>
                <ul className="space-y-3 mb-8 flex-1">
                  {(meta?.included || plan.features || []).slice(0, 5).map((f: string, i: number) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-text-muted font-medium"><CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" /> {f}</li>
                  ))}
                </ul>
                <RazorpayButton plan={plan.id} amount={discountedPrice} label={plan.name} onSuccess={load} className={cn("w-full py-6 font-black rounded-2xl", plan.popular ? "bg-primary text-white" : "bg-heading text-white")} />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
