"use client";
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RazorpayButton } from "@/components/payment/razorpay-button";
import { PageLoader } from "@/components/ui/loading";
import api from "@/lib/api";
import type { Subscription, Plan, ClassItem } from "@/types";
import { CheckCircle, Crown } from "lucide-react";

export default function SubscriptionPage() {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedClasses, setSelectedClasses] = useState<Record<string, string[]>>({});

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

  // Build plan labels from fetched plans
  const planLabel: Record<string, string> = {};
  plans.forEach((p) => { planLabel[p.id] = p.name; });

  return (
    <div className="max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Subscription</h1>

      {/* Current subscription */}
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

      {/* Plans */}
      {!isActive && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => {
            const needsClassSelection = (plan.classSelection || 0) > 0;
            const selected = selectedClasses[plan.id] || [];
            const canSubscribe = !needsClassSelection || selected.length === plan.classSelection;

            return (
              <Card key={plan.id} className={`relative ${plan.popular ? "border-accent border-2" : ""}`}>
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-accent text-primary-dark px-4 py-1 rounded-full text-sm font-bold">Most Popular</div>
                )}
                <CardContent className="p-8">
                  <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                  <div className="text-3xl font-bold text-primary mb-1">
                    &#8377;{plan.price}<span className="text-base text-gray-400 font-normal">/{plan.duration}</span>
                  </div>
                  <ul className="mt-6 space-y-3 mb-6">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-center gap-2 text-sm"><CheckCircle className="w-4 h-4 text-green-500 shrink-0" />{f}</li>
                    ))}
                  </ul>

                  {/* Class selection for SINGLE_CLASS / MULTI_CLASS */}
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
                        <p className="text-xs text-amber-600 mt-2">Please select {plan.classSelection} class{(plan.classSelection || 0) > 1 ? "es" : ""} to continue</p>
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
      )}
    </div>
  );
}
