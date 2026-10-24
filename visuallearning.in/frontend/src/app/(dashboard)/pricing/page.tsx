"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, ArrowUpRight, Check, GraduationCap, Layers, Globe2, Tag, X, ShieldCheck, BookOpen, type LucideIcon } from "lucide-react";
import { RazorpayButton } from "@/components/payment/razorpay-button";
import { useAuth } from "@/lib/auth";
import api from "@/lib/api";
import toast from "react-hot-toast";

type BillingCycle = "monthly" | "quarterly" | "yearly";
interface Plan { id: string; name: string; monthlyPrice?: number; quarterlyPrice?: number; yearlyPrice?: number; features?: string[]; classSelection?: number }
interface ClassInfo { id: string; name: string }
const PLAN_ORDER = ["SINGLE_CLASS", "DUAL_CLASS", "FULL_ACCESS"];
const PLAN_META: Record<string, { tagline: string; icon: LucideIcon; classes: number; popular?: boolean }> = {
  SINGLE_CLASS: { tagline: "A focused start for your school year.", icon: GraduationCap, classes: 1 },
  DUAL_CLASS: { tagline: "Build on what you know. See what’s next.", icon: Layers, classes: 2, popular: true },
  FULL_ACCESS: { tagline: "Room for every question and possibility.", icon: Globe2, classes: 0 },
};
const CHOICES_KEY = "vl_pricing_choices";
function extractCode(input: string) {
  const value = input.trim();
  if (!/^https?:\/\//i.test(value)) return value.toUpperCase();
  try { const url = new URL(value); return (url.searchParams.get("ref") || url.searchParams.get("coupon") || url.searchParams.get("code") || url.pathname.split("/").filter(Boolean).pop() || "").trim().toUpperCase(); }
  catch { return value.toUpperCase(); }
}

export default function PricingPage() {
  const router = useRouter();
  const { isAuthenticated, hydrate } = useAuth();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [classes, setClasses] = useState<ClassInfo[]>([]);
  const [cycle, setCycle] = useState<BillingCycle>("yearly");
  const [selected, setSelected] = useState<Record<string, string[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [couponInput, setCouponInput] = useState("");
  const [coupon, setCoupon] = useState<{ code: string; discountPercent: number; applicablePlans: string[] } | null>(null);
  const [checkingCoupon, setCheckingCoupon] = useState(false);

  const load = useCallback(async () => {
    setLoading(true); setError(false);
    try {
      const { data } = await api.get("/subscription/plans");
      setPlans(data.data?.plans || []);
      setClasses(((data.data?.classes || []) as ClassInfo[]).filter(c => /\b(9|10|11|12)\b/.test(c.name)));
    } catch { setError(true); }
    finally { setLoading(false); }
  }, []);
  const applyCoupon = useCallback(async (raw: string, silent = false) => {
    const code = extractCode(raw);
    if (!code) return;
    setCouponInput(code);
    // Coupon validation requires a signed-in account. Remember the entered code
    // through the auth transition without displaying an unverified discount.
    if (!useAuth.getState().isAuthenticated) return;
    setCheckingCoupon(true);
    try {
      const { data } = await api.get(`/subscription/validate-coupon?code=${encodeURIComponent(code)}`);
      const result = data.data;
      if (result?.valid) {
        setCoupon({ code, discountPercent: result.discountPercent, applicablePlans: result.applicablePlans || [] });
        localStorage.setItem("vl_ref", code);
        if (!silent) toast.success(`${result.discountPercent}% off applied`);
      } else { setCoupon(null); if (!silent) toast.error(result?.message || "This code is not valid."); }
    } catch { setCoupon(null); if (!silent) toast.error("We couldn’t check that code. Please try again."); }
    finally { setCheckingCoupon(false); }
  }, []);
  useEffect(() => {
    hydrate(); void load();
    let savedCoupon = "";
    try {
      const saved = JSON.parse(sessionStorage.getItem(CHOICES_KEY) || "null");
      if (saved && ["monthly", "quarterly", "yearly"].includes(saved.cycle)) setCycle(saved.cycle);
      if (typeof saved?.coupon === "string") savedCoupon = saved.coupon;
      if (saved?.selected && typeof saved.selected === "object") {
        const valid = Object.fromEntries(Object.entries(saved.selected).filter(([key, value]) => PLAN_ORDER.includes(key) && Array.isArray(value) && value.every(id => typeof id === "string")));
        setSelected(valid as Record<string, string[]>);
      }
    } catch { /* Ignore an outdated saved selection. */ }
    const ref = savedCoupon || localStorage.getItem("vl_ref");
    if (ref) void applyCoupon(ref, true);
  }, [hydrate, load, applyCoupon]);

  const ordered = useMemo(() => PLAN_ORDER.map(id => plans.find(p => p.id === id)).filter((p): p is Plan => Boolean(p)), [plans]);
  const allClassIds = classes.map(c => c.id);
  const saveChoices = () => { sessionStorage.setItem(CHOICES_KEY, JSON.stringify({ cycle, selected, coupon: coupon?.code || couponInput })); };
  const toggleClass = (planId: string, classId: string, max: number) => setSelected(prev => {
    const current = (prev[planId] || []).filter(id => allClassIds.includes(id));
    const next = current.includes(classId) ? current.filter(id => id !== classId) : [...current.slice(Math.max(0, current.length - max + 1)), classId];
    return { ...prev, [planId]: next };
  });
  const removeCoupon = () => { setCoupon(null); setCouponInput(""); localStorage.removeItem("vl_ref"); sessionStorage.setItem(CHOICES_KEY, JSON.stringify({ cycle, selected, coupon: "" })); };

  return <div className="learning-page learn-pricing-page">
    <header className="learn-page-header learn-pricing-header"><div><span className="learn-eyebrow"><span /> INVEST IN YOUR CURIOSITY</span><h1>A little more clarity.<br /><em>A lot more possibility.</em></h1><p>Choose the classes you need. Explore animated lessons, study resources, and a more visual way to learn.</p></div></header>
    <div className="learn-pricing-controls"><div className="learn-cycle-switch" aria-label="Billing period">{(["monthly", "quarterly", "yearly"] as BillingCycle[]).map(c => <button key={c} type="button" aria-pressed={cycle === c} onClick={() => setCycle(c)} className={cycle === c ? "is-active" : ""}>{c === "quarterly" ? "3 months" : c === "yearly" ? "Yearly" : "Monthly"}</button>)}</div><span className="learn-pricing-period"><ShieldCheck size={16} /> Secure payment with Razorpay</span></div>
    {loading ? <div className="learn-plan-grid" role="status" aria-label="Loading plans">{PLAN_ORDER.map(id => <div key={id} className="learn-plan-card learn-skeleton" />)}</div>
      : error ? <div className="learn-empty" role="alert"><BookOpen /><h3>Plans couldn’t load.</h3><p>Please check your connection and try again.</p><button onClick={() => void load()} className="learn-button">Try again <ArrowRight size={16} /></button></div>
      : ordered.length === 0 ? <div className="learn-empty"><BookOpen /><h3>New plans are on the way.</h3><p>You can still explore the free demos while we get things ready.</p><Link className="learn-button" href="/demo">Explore demos <ArrowRight size={16} /></Link></div>
      : <div className="learn-plan-grid">{ordered.map(plan => {
        const meta = PLAN_META[plan.id];
        const Icon = meta.icon;
        const max = plan.classSelection ?? meta.classes;
        const isFull = max === 0;
        const selection = isFull ? allClassIds : (selected[plan.id] || []).filter(id => allClassIds.includes(id)).slice(0, max);
        const price = (cycle === "monthly" ? plan.monthlyPrice : cycle === "quarterly" ? plan.quarterlyPrice : plan.yearlyPrice) || 0;
        const discountApplies = !!coupon && (coupon.applicablePlans.length === 0 || coupon.applicablePlans.includes(plan.id));
        const total = discountApplies ? Math.max(1, Math.round(price * (1 - coupon!.discountPercent / 100))) : price;
        const ready = classes.length > 0 && (isFull || selection.length === max);
        return <article key={plan.id} className={`learn-plan-card ${meta.popular ? "learn-plan-popular" : ""}`}>
          <div className="learn-plan-top"><span className="learn-resource-icon"><Icon size={24} strokeWidth={1.5} /></span>{meta.popular && <span className="learn-pill">A little more room</span>}</div>
          <h2>{plan.name}</h2><p className="learn-plan-tagline">{meta.tagline}</p>
          <div className="learn-plan-price">{discountApplies && <del>₹{price.toLocaleString("en-IN")}</del>}<strong>₹{total.toLocaleString("en-IN")}</strong><span>per {cycle === "yearly" ? "year" : cycle === "quarterly" ? "3 months" : "month"}</span></div>
          <div className="learn-plan-class-select"><div><strong>{isFull ? "Every class included" : `Choose ${max} class${max === 1 ? "" : "es"}`}</strong>{!isFull && <span>{selection.length}/{max} selected</span>}</div><div className="learn-class-choices">{classes.map(cls => <button key={cls.id} type="button" aria-label={`Class ${cls.name.replace(/class/i, "").trim()}`} aria-pressed={selection.includes(cls.id)} disabled={isFull} className={selection.includes(cls.id) ? "is-selected" : ""} onClick={() => toggleClass(plan.id, cls.id, max)}>{cls.name.replace(/class/i, "").trim()}</button>)}</div></div>
          <ul className="learn-plan-features">{(plan.features || []).map(feature => <li key={feature}><Check size={16} /><span>{feature}</span></li>)}</ul>
          <div className="learn-plan-action">{ready ? isAuthenticated ? <RazorpayButton plan={plan.id} amount={total} label={plan.name} classesAccess={selection} billingCycle={cycle} couponCode={discountApplies ? coupon?.code : undefined} downloadAddon={true} onSuccess={() => { sessionStorage.removeItem("vl_my_sub"); sessionStorage.removeItem(CHOICES_KEY); router.push("/dashboard"); }} buttonLabel="Start exploring →" className={`learn-button learn-plan-checkout ${meta.popular ? "learn-button-light" : ""}`} /> : <Link href="/auth/login?next=%2Fpricing" onClick={saveChoices} className={`learn-button ${meta.popular ? "learn-button-light" : ""}`}>Sign in to subscribe <ArrowUpRight size={16} /></Link> : <button className="learn-button" disabled>{classes.length === 0 ? "Classes unavailable" : `Select ${max} class${max === 1 ? "" : "es"} to continue`}</button>}</div>
        </article>;
      })}</div>}
    <section className="learn-coupon-panel" aria-label="Coupon or referral code"><div><Tag size={21} /><div><h2>A little something extra?</h2><p>Apply your coupon or referral code.</p></div></div>{coupon ? <div className="learn-coupon-applied"><Check size={16} /><strong>{coupon.code}</strong><span>{coupon.discountPercent}% off eligible plans</span><button onClick={removeCoupon} aria-label="Remove coupon"><X size={17} /></button></div> : <form className="learn-coupon-form" onSubmit={e => { e.preventDefault(); if (isAuthenticated) void applyCoupon(couponInput); else { saveChoices(); router.push("/auth/login?next=%2Fpricing"); } }}><label className="sr-only" htmlFor="pricing-coupon">Coupon or referral code</label><input id="pricing-coupon" value={couponInput} onChange={e => setCouponInput(e.target.value)} placeholder="Enter your code or referral link" /><button className="learn-button" disabled={checkingCoupon || !couponInput.trim()}>{!isAuthenticated ? "Sign in to apply" : checkingCoupon ? "Checking…" : "Apply"}</button></form>}</section>
    {!isAuthenticated && <p className="learn-pricing-signup">New around here? <Link onClick={saveChoices} href="/auth/signup?next=%2Fpricing">Create a free account <ArrowUpRight size={14} /></Link> Your plan selections will be waiting.</p>}
    <div className="learn-pricing-footnote"><BookOpen size={19} /><p>Still finding your feet? <Link href="/demo">Try a free demo</Link> and discover how visual learning works for you.</p></div>
  </div>;
}
