"use client";
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RazorpayButton } from "@/components/payment/razorpay-button";
import { PageLoader } from "@/components/ui/loading";
import api from "@/lib/api";
import type { Subscription, Plan, ClassItem } from "@/types";
import { CheckCircle, Crown, Sparkles } from "lucide-react";

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
  const [tab, setTab] = useState<BillingTab>("yearly");

  const load = () => {
    Promise.all([
      api.get("/subscription/my-subscription"),
      api.get("/subscription/plans"),
    ]).then(([subRes, planRes]) => {
      setSubscription(subRes.data.data);
      setPlans(planRes.data.data.plans || planRes.data.data);
      setClasses(planRes.data.data.classes || []);
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

  if (loading) return <PageLoader />;

  const isActive = subscription?.status === "ACTIVE" && new Date(subscription.expiryDate) > new Date();

  const planLabel: Record<string, string> = {};
  plans.forEach((p) => { planLabel[p.id] = p.name; });

  const monthlyPlans = plans.filter((p) => isMonthly(p));
  const yearlyPlans = plans.filter((p) => !isMonthly(p));
  const visiblePlans = tab === "monthly" ? monthlyPlans : yearlyPlans;

  return (
    <div className="max-w-5xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Choose Your Plan</h1>
        <p className="text-gray-500">Unlock premium content and boost your exam preparation</p>
      </div>

      {/* Active Subscription */}
      {isActive && subscription && (
        <Card className="mb-8 border-green-200 bg-green-50">
          <CardContent className="p-6">
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
          </CardContent>
        </Card>
      )}

      {/* Billing Toggle */}
      {!isActive && (
        <>
          <div className="flex justify-center mb-8">
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

          {/* Plans Grid */}
          <div className={`grid grid-cols-1 gap-6 ${visiblePlans.length === 1 ? "max-w-md mx-auto" : visiblePlans.length === 2 ? "md:grid-cols-2 max-w-3xl mx-auto" : "md:grid-cols-3"}`}>
            {visiblePlans.map((plan) => {
              const theme = PLAN_THEMES[plan.id] || DEFAULT_THEME;
              const needsClassSelection = (plan.classSelection || 0) > 0;
              const selected = selectedClasses[plan.id] || [];
              const canSubscribe = !needsClassSelection || selected.length === plan.classSelection;

              return (
                <Card key={plan.id} className={`relative overflow-hidden transition-all hover:shadow-lg ${plan.popular ? `${theme.border} border-2 scale-[1.02]` : theme.border}`}>
                  {/* Colored top bar */}
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
                      <span className="text-4xl font-bold text-gray-900">&#8377;{plan.price}</span>
                      <span className="text-gray-400 text-sm ml-1">/{isMonthly(plan) ? "month" : "year"}</span>
                    </div>

                    <ul className="space-y-3 mb-6">
                      {plan.features.map((f) => (
                        <li key={f} className="flex items-start gap-2.5 text-sm">
                          <CheckCircle className={`w-4 h-4 ${theme.icon} shrink-0 mt-0.5`} />
                          <span className="text-gray-600">{f}</span>
                        </li>
                      ))}
                    </ul>

                    {/* Class selection */}
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
                        amount={plan.price}
                        label={plan.name}
                        classesAccess={needsClassSelection ? selected : undefined}
                        onSuccess={load}
                      />
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
