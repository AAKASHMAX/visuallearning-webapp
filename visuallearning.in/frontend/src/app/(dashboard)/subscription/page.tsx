"use client";
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RazorpayButton } from "@/components/payment/razorpay-button";
import { PageLoader } from "@/components/ui/loading";
import api from "@/lib/api";
import type { Subscription, Plan, ClassItem } from "@/types";
import { 
  CheckCircle, Crown, Sparkles, Tag, ArrowUpRight, 
  CheckCircle2, Zap, GraduationCap, Target, AlertCircle 
} from "lucide-react";
import toast from "react-hot-toast";

type BillingTab = "yearly" | "monthly";

// Map our new plans to themes/icons
const PLAN_INFO: Record<string, { icon: any; color: string; bg: string; border: string }> = {
  "foundation": { icon: Zap, color: "text-success", bg: "bg-success/10", border: "border-success/20" },
  "academic": { icon: GraduationCap, color: "text-primary", bg: "bg-primary/10", border: "border-primary/20" },
  "elite": { icon: Crown, color: "text-[#05BFDB]", bg: "bg-[#05BFDB]/10", border: "border-[#05BFDB]/30" },
  "flexi": { icon: Target, color: "text-cta", bg: "bg-cta/10", border: "border-cta/20" },
};

const DEFAULT_INFO = { icon: Sparkles, color: "text-primary", bg: "bg-primary/5", border: "border-card-border" };

export default function SubscriptionPage() {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedClasses, setSelectedClasses] = useState<Record<string, string[]>>({});
  const [tab, setTab] = useState<BillingTab>("yearly"); // Default to yearly as requested by new plans
  const [upgradeDiscountPercent, setUpgradeDiscountPercent] = useState(0);
  const [showUpgradePlans, setShowUpgradePlans] = useState(false);

  // Coupon
  const [couponCode, setCouponCode] = useState("");
  const [couponApplied, setCouponApplied] = useState(false);
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponApplicablePlans, setCouponApplicablePlans] = useState<string[]>([]);
  const [validatingCoupon, setValidatingCoupon] = useState(false);

  const load = () => {
    Promise.all([
      api.get("/subscription/my-subscription"),
      api.get("/subscription/plans"),
    ]).then(([subRes, planRes]) => {
      setSubscription(subRes.data.data);
      setPlans(planRes.data.data.plans || planRes.data.data);
      setClasses(planRes.data.data.classes || []);
      setUpgradeDiscountPercent(planRes.data.data.upgradeDiscountPercent || 0);
    }).finally(() => setLoading(false));
  };

  useEffect(load, []);

  const toggleClass = (planId: string, classId: string, maxSelection: number) => {
    setSelectedClasses((prev) => {
      const current = prev[planId] || [];
      if (current.includes(classId)) {
        return { ...prev, [planId]: current.filter((id) => id !== classId) };
      }
      if (current.length >= maxSelection) return prev;
      return { ...prev, [planId]: [...current, classId] };
    });
  };

  const applyCoupon = async () => {
    if (!couponCode.trim()) { toast.error("Enter a coupon code"); return; }
    setValidatingCoupon(true);
    try {
      const { data } = await api.get(`/subscription/validate-coupon?code=${couponCode.trim()}`);
      if (data.data.valid) {
        setCouponApplied(true);
        setCouponDiscount(data.data.discountPercent);
        setCouponApplicablePlans(data.data.applicablePlans || []);
        toast.success(`Coupon applied! ${data.data.discountPercent}% discount`);
      } else {
        toast.error(data.data.message);
        setCouponApplied(false);
      }
    } catch (err: any) {
      toast.error("Failed to validate coupon");
    } finally {
      setValidatingCoupon(false);
    }
  };

  if (loading) return <PageLoader />;

  const isActive = subscription?.status === "ACTIVE" && new Date(subscription.expiryDate) > new Date();
  
  // Try to match API plans to our new 4 categories
  const getPlanType = (name: string) => {
    const n = name.toLowerCase();
    if (n.includes("foundation") || n.includes("free") || n.includes("pass")) return "foundation";
    if (n.includes("academic") || n.includes("plus") || n.includes("school")) return "academic";
    if (n.includes("elite") || n.includes("premium") || n.includes("pro")) return "elite";
    if (n.includes("flexi") || n.includes("personalized") || n.includes("custom")) return "flexi";
    return "default";
  };

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
                  <Badge className="bg-success text-white font-bold border-none">ACTIVE</Badge>
                </div>
                <p className="text-text-muted font-bold">
                  Expires: {new Date(subscription.expiryDate).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
                </p>
              </div>
            </div>
            <Button 
              variant={showUpgradePlans ? "outline" : "accent"}
              onClick={() => setShowUpgradePlans(!showUpgradePlans)}
              className="rounded-xl font-bold px-8 py-6"
            >
              {showUpgradePlans ? "Hide Upgrades" : "View Upgrade Options"}
            </Button>
          </div>
        </div>
      )}

      {(!isActive || showUpgradePlans) && (
        <>
          {/* Coupon Section */}
          <div className="max-w-md mx-auto mb-16 bg-white rounded-2xl p-2 shadow-md border border-card-border flex gap-2">
            <input
              type="text"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
              placeholder="ENTER COUPON CODE"
              className="flex-1 bg-transparent px-4 font-bold text-sm tracking-widest focus:outline-none"
              disabled={couponApplied}
            />
            {couponApplied ? (
              <Button variant="ghost" onClick={() => { setCouponApplied(false); setCouponCode(""); }} className="text-rose-500 font-bold">REMOVE</Button>
            ) : (
              <Button onClick={applyCoupon} disabled={validatingCoupon} className="bg-heading text-white font-bold px-6 rounded-xl">
                {validatingCoupon ? "..." : "APPLY"}
              </Button>
            )}
          </div>

          {/* Plans Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {plans.map((plan) => {
              const type = getPlanType(plan.name);
              const info = PLAN_INFO[type] || DEFAULT_INFO;
              const PlanIcon = info.icon;
              const discountedPrice = Math.round(plan.price * (1 - (couponApplied ? couponDiscount / 100 : 0)));

              return (
                <div key={plan.id} className={`group relative rounded-3xl border-2 ${plan.popular ? "border-[#05BFDB] bg-[#1A3263]/5 shadow-2xl scale-[1.03]" : "border-card-border bg-white shadow-lg"} p-8 transition-all duration-500 hover:-translate-y-2 flex flex-col`}>
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full bg-gradient-to-r from-primary to-[#05BFDB] text-white text-[10px] font-black tracking-widest uppercase z-10 shadow-lg">
                      BEST VALUE
                    </div>
                  )}
                  
                  <div className={`w-14 h-14 rounded-2xl ${info.bg} flex items-center justify-center mb-6 transition-transform group-hover:scale-110 duration-500`}>
                    <PlanIcon className={`w-7 h-7 ${info.color}`} />
                  </div>

                  <h3 className="text-2xl font-black text-heading mb-1 tracking-tight">{plan.name}</h3>
                  <p className="text-sm text-text-muted font-bold mb-6 opacity-60 uppercase tracking-widest">{plan.duration}</p>

                  <div className="mb-8">
                    {couponApplied && <span className="text-lg text-text-muted line-through mr-2 font-bold opacity-40">₹{plan.price}</span>}
                    <span className="text-4xl font-black text-heading">₹{discountedPrice}</span>
                    <span className="text-text-muted text-sm font-bold ml-1">/year</span>
                  </div>

                  <ul className="space-y-4 mb-10 flex-1">
                    {plan.features.map((f, i) => (
                      <li key={i} className="flex items-start gap-3 text-sm text-text-muted font-medium leading-tight">
                        <CheckCircle2 className={`w-5 h-5 ${info.color} shrink-0 mt-0.5`} />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>

                  <RazorpayButton
                    plan={plan.id}
                    amount={discountedPrice}
                    label={plan.name}
                    couponCode={couponApplied ? couponCode : undefined}
                    onSuccess={load}
                    className={`w-full py-7 text-base font-black rounded-2xl shadow-xl transition-all ${
                      plan.popular 
                        ? "bg-gradient-to-r from-primary to-[#05BFDB] hover:opacity-90 text-white shadow-[#05BFDB]/30" 
                        : "bg-heading hover:bg-black text-white shadow-black/10"
                    }`}
                  />
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Trust Badges */}
      <div className="mt-24 grid grid-cols-2 md:grid-cols-4 gap-8 opacity-50 grayscale hover:grayscale-0 transition-all duration-700">
        <div className="flex flex-col items-center text-center gap-2">
          <CheckCircle className="w-8 h-8 text-success" />
          <p className="text-xs font-black uppercase tracking-widest">Secure Payment</p>
        </div>
        <div className="flex flex-col items-center text-center gap-2">
          <AlertCircle className="w-8 h-8 text-primary" />
          <p className="text-xs font-black uppercase tracking-widest">24/7 Support</p>
        </div>
        <div className="flex flex-col items-center text-center gap-2">
          <Sparkles className="w-8 h-8 text-[#05BFDB]" />
          <p className="text-xs font-black uppercase tracking-widest">Premium Content</p>
        </div>
        <div className="flex flex-col items-center text-center gap-2">
          <Tag className="w-8 h-8 text-cta" />
          <p className="text-xs font-black uppercase tracking-widest">Best Price</p>
        </div>
      </div>
    </div>
  );
}
