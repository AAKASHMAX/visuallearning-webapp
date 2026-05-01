"use client";
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RazorpayButton } from "@/components/payment/razorpay-button";
import { PageLoader } from "@/components/ui/loading";
import api from "@/lib/api";
import type { Subscription, Plan, ClassItem } from "@/types";
import { CheckCircle, Crown, Sparkles, Tag, ArrowUpRight } from "lucide-react";
import toast from "react-hot-toast";

type BillingTab = "yearly" | "monthly";

const PLAN_THEMES: Record<string, { border: string; bg: string; badge: string; accent: string; icon: string }> = {
  SINGLE_CLASS: { border: "border-blue-200", bg: "bg-blue-50", badge: "bg-blue-500", accent: "text-blue-600", icon: "text-blue-500" },
  MULTI_CLASS:  { border: "border-violet-200", bg: "bg-violet-50", badge: "bg-violet-500", accent: "text-violet-600", icon: "text-violet-500" },
  FULL_ACCESS:  { border: "border-emerald-200", bg: "bg-emerald-50", badge: "bg-emerald-500", accent: "text-emerald-600", icon: "text-emerald-500" },
  MONTHLY:      { border: "border-orange-200", bg: "bg-orange-50", badge: "bg-orange-500", accent: "text-orange-600", icon: "text-orange-500" },
  YEARLY:       { border: "border-rose-200", bg: "bg-rose-50", badge: "bg-rose-500", accent: "text-rose-600", icon: "text-rose-500" },
  LIVE_CLASS:   { border: "border-red-200", bg: "bg-red-50", badge: "bg-red-500", accent: "text-red-600", icon: "text-red-500" },
};

const DEFAULT_THEME = { border: "border-gray-200", bg: "bg-gray-50", badge: "bg-gray-500", accent: "text-gray-600", icon: "text-gray-500" };

function isMonthly(plan: Plan) {
  return plan.billingCycle === "monthly" || (!plan.billingCycle && plan.duration.includes("30"));
}

export default function SubscriptionPage() {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedClasses, setSelectedClasses] = useState<Record<string, string[]>>({});
  const [tab, setTab] = useState<BillingTab>("monthly");
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
        const applicablePlans = data.data.applicablePlans || [];
        setCouponApplied(true);
        setCouponDiscount(data.data.discountPercent);
        setCouponApplicablePlans(applicablePlans);
        const planMsg = applicablePlans.length === 0 ? "all plans" : `${applicablePlans.length} plan${applicablePlans.length > 1 ? "s" : ""}`;
        toast.success(`Coupon applied! ${data.data.discountPercent}% discount on ${planMsg}`);
      } else {
        toast.error(data.data.message);
        setCouponApplied(false);
        setCouponDiscount(0);
        setCouponApplicablePlans([]);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to validate coupon");
      setCouponApplied(false);
      setCouponDiscount(0);
    } finally {
      setValidatingCoupon(false);
    }
  };

  const removeCoupon = () => {
    setCouponCode("");
    setCouponApplied(false);
    setCouponDiscount(0);
    setCouponApplicablePlans([]);
  };

  const isCouponApplicable = (planId: string) => {
    if (!couponApplied) return false;
    if (couponApplicablePlans.length === 0) return true;
    return couponApplicablePlans.includes(planId);
  };

  const getDiscountedPrice = (originalPrice: number, planId?: string) => {
    let price = originalPrice;
    if (isActive && upgradeDiscountPercent > 0) {
      price = price - (price * upgradeDiscountPercent / 100);
    }
    if (couponApplied && couponDiscount > 0 && (!planId || isCouponApplicable(planId))) {
      price = price - (price * couponDiscount / 100);
    }
    return Math.max(1, Math.round(price));
  };

  if (loading) return <PageLoader />;

  const isActive = subscription?.status === "ACTIVE" && new Date(subscription.expiryDate) > new Date();

  const planLabel: Record<string, string> = {};
  plans.forEach((p) => { planLabel[p.id] = p.name; });

  const monthlyPlans = plans.filter((p) => isMonthly(p));
  const yearlyPlans = plans.filter((p) => !isMonthly(p));
  const visiblePlans = tab === "monthly" ? monthlyPlans : yearlyPlans;

  // Filter out current plan for upgrade view
  const upgradePlans = isActive
    ? visiblePlans.filter((p) => p.id !== subscription?.plan)
    : visiblePlans;

  const showPlans = isActive ? showUpgradePlans : true;
  const plansToShow = isActive ? upgradePlans : visiblePlans;

  return (
    <div className="max-w-5xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">
          {isActive ? "Manage Your Subscription" : "Choose Your Plan"}
        </h1>
        <p className="text-gray-500">
          {isActive ? "Upgrade or change your plan to access more content" : "Unlock premium content and boost your exam preparation"}
        </p>
      </div>

      {/* Active Subscription */}
      {isActive && subscription && (
        <Card className="mb-8 border-green-200 bg-green-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <Crown className="w-6 h-6 text-accent" />
                  <h2 className="text-lg font-bold">Active Subscription</h2>
                  <Badge variant="success">{planLabel[subscription.plan] || subscription.plan}</Badge>
                </div>
                <p className="text-gray-600">Expires: {new Date(subscription.expiryDate).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</p>
                {subscription.classesAccess && subscription.classesAccess.length > 0 && (
                  <p className="text-gray-500 text-sm mt-1">
                    Classes: {classes.filter((c) => subscription.classesAccess.includes(c.id)).map((c) => c.name).join(", ") || "All Classes"}
                  </p>
                )}
              </div>
              <Button
                variant={showUpgradePlans ? "outline" : "accent"}
                onClick={() => setShowUpgradePlans(!showUpgradePlans)}
              >
                {showUpgradePlans ? (
                  "Hide Plans"
                ) : (
                  <><ArrowUpRight className="w-4 h-4 mr-1" />View Other Plans</>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {showPlans && (
        <>
          {/* Billing Toggle */}
          <div className="flex justify-center mb-6">
            <div className="inline-flex bg-gray-100 rounded-xl p-1">
              <button
                onClick={() => setTab("monthly")}
                className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                  tab === "monthly"
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setTab("yearly")}
                className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-all flex items-center gap-1.5 ${
                  tab === "yearly"
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Yearly <span className="text-xs bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-full font-medium">Save more</span>
              </button>
            </div>
          </div>

          {/* Upgrade Discount Banner */}
          {isActive && upgradeDiscountPercent > 0 && (
            <div className="mb-6 p-4 bg-gradient-to-r from-violet-50 to-purple-50 border border-violet-200 rounded-xl text-center">
              <p className="text-violet-700 font-medium">
                <Tag className="w-4 h-4 inline mr-1" />
                As an existing subscriber, you get {upgradeDiscountPercent}% off on plan upgrades!
              </p>
            </div>
          )}

          {/* Coupon Code */}
          <div className="mb-8 max-w-md mx-auto">
            <div className="flex gap-2">
              <input
                type="text"
                value={couponCode}
                onChange={(e) => {
                  setCouponCode(e.target.value.toUpperCase());
                  if (couponApplied) {
                    setCouponApplied(false);
                    setCouponDiscount(0);
                  }
                }}
                placeholder="Have a coupon code?"
                className="border rounded-lg px-4 py-2.5 text-sm flex-1"
                disabled={couponApplied}
              />
              {couponApplied ? (
                <Button variant="outline" onClick={removeCoupon} className="shrink-0">
                  Remove
                </Button>
              ) : (
                <Button onClick={applyCoupon} disabled={validatingCoupon} className="shrink-0">
                  {validatingCoupon ? "Checking..." : "Apply"}
                </Button>
              )}
            </div>
            {couponApplied && (
              <div className="mt-2">
                <p className="text-sm text-emerald-600 flex items-center gap-1">
                  <CheckCircle className="w-4 h-4" />
                  Coupon &quot;{couponCode}&quot; applied - {couponDiscount}% discount
                </p>
                {couponApplicablePlans.length > 0 && (
                  <p className="text-xs text-gray-500 mt-1">
                    Applies to: {couponApplicablePlans.map((k) => planLabel[k] || k).join(", ")}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Plans Grid */}
          {plansToShow.length > 0 ? (
            <div className={`grid grid-cols-1 gap-6 ${plansToShow.length === 1 ? "max-w-md mx-auto" : plansToShow.length === 2 ? "md:grid-cols-2 max-w-3xl mx-auto" : "md:grid-cols-3"}`}>
              {plansToShow.map((plan) => {
                const theme = PLAN_THEMES[plan.id] || DEFAULT_THEME;
                const needsClassSelection = (plan.classSelection || 0) > 0;
                const selected = selectedClasses[plan.id] || [];
                const canSubscribe = !needsClassSelection || selected.length === plan.classSelection;
                const couponAppliesHere = isCouponApplicable(plan.id);
                const discountedPrice = getDiscountedPrice(plan.price, plan.id);
                const hasDiscount = discountedPrice < plan.price;

                return (
                  <Card key={plan.id} className={`relative overflow-hidden transition-all hover:shadow-lg ${plan.popular ? `${theme.border} border-2 scale-[1.02]` : theme.border}`}>
                    <div className={`h-1.5 ${theme.badge}`} />

                    {plan.popular && (
                      <div className={`absolute top-4 right-4 ${theme.badge} text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1`}>
                        <Sparkles className="w-3 h-3" /> Most Popular
                      </div>
                    )}

                    <CardContent className="p-8">
                      <h3 className={`text-xl font-bold mb-1 ${theme.accent}`}>{plan.name}</h3>
                      <p className="text-sm text-gray-400 mb-4">{plan.duration}</p>

                      <div className="mb-6">
                        {hasDiscount && (
                          <span className="text-lg text-gray-400 line-through mr-2">&#8377;{plan.price}</span>
                        )}
                        <span className="text-4xl font-bold text-gray-900">&#8377;{discountedPrice}</span>
                        <span className="text-gray-400 text-sm ml-1">/{isMonthly(plan) ? "month" : "year"}</span>
                        {hasDiscount && (
                          <div className="mt-1">
                            <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-medium">
                              You save &#8377;{plan.price - discountedPrice}
                            </span>
                          </div>
                        )}
                        {couponApplied && !couponAppliesHere && (
                          <div className="mt-1">
                            <span className="text-xs bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full font-medium">
                              Coupon not applicable for this plan
                            </span>
                          </div>
                        )}
                      </div>

                      <ul className="space-y-3 mb-6">
                        {plan.features.map((f) => (
                          <li key={f} className="flex items-start gap-2.5 text-sm">
                            <CheckCircle className={`w-4 h-4 ${theme.icon} shrink-0 mt-0.5`} />
                            <span className="text-gray-600">{f}</span>
                          </li>
                        ))}
                      </ul>

                      {needsClassSelection && (
                        <div className="mb-6">
                          <p className="text-sm font-medium text-gray-700 mb-2">
                            Select {plan.classSelection} class{(plan.classSelection || 0) > 1 ? "es" : ""}:
                          </p>
                          <div className="space-y-2">
                            {classes.map((c) => (
                              <label key={c.id} className="flex items-center gap-2 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={selected.includes(c.id)}
                                  onChange={() => toggleClass(plan.id, c.id, plan.classSelection || 1)}
                                  className="rounded border-gray-300"
                                />
                                <span className="text-sm">{c.name}</span>
                              </label>
                            ))}
                          </div>
                          {!canSubscribe && (
                            <p className="text-xs text-amber-600 mt-2">
                              Please select {plan.classSelection} class{(plan.classSelection || 0) > 1 ? "es" : ""} to continue
                            </p>
                          )}
                        </div>
                      )}

                      <div className={!canSubscribe ? "opacity-50 pointer-events-none" : ""}>
                        <RazorpayButton
                          plan={plan.id}
                          amount={discountedPrice}
                          label={plan.name}
                          classesAccess={needsClassSelection ? selected : undefined}
                          couponCode={couponApplied && couponAppliesHere ? couponCode : undefined}
                          onSuccess={load}
                        />
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <p className="text-center text-gray-400 py-8">No other plans available in this billing cycle.</p>
          )}
        </>
      )}
    </div>
  );
}
