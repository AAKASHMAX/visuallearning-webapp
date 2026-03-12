"use client";
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RazorpayButton } from "@/components/payment/razorpay-button";
import { PageLoader } from "@/components/ui/loading";
import api from "@/lib/api";
import type { Subscription, Plan } from "@/types";
import { CheckCircle, Crown } from "lucide-react";

export default function SubscriptionPage() {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    Promise.all([
      api.get("/subscription/my-subscription"),
      api.get("/subscription/plans"),
    ]).then(([subRes, planRes]) => {
      setSubscription(subRes.data.data);
      setPlans(planRes.data.data);
    }).finally(() => setLoading(false));
  };

  useEffect(load, []);

  if (loading) return <PageLoader />;

  const isActive = subscription?.status === "ACTIVE" && new Date(subscription.expiryDate) > new Date();

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Subscription</h1>

      {/* Current subscription */}
      {isActive && subscription && (
        <Card className="mb-8 border-green-200 bg-green-50">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-3">
              <Crown className="w-6 h-6 text-accent" />
              <h2 className="text-lg font-bold">Active Subscription</h2>
              <Badge variant="success">{subscription.plan}</Badge>
            </div>
            <p className="text-gray-600">Expires: {new Date(subscription.expiryDate).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</p>
          </CardContent>
        </Card>
      )}

      {/* Plans */}
      {!isActive && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {plans.map((plan) => (
            <Card key={plan.id} className={`relative ${plan.popular ? "border-accent border-2" : ""}`}>
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-accent text-primary-dark px-4 py-1 rounded-full text-sm font-bold">Most Popular</div>
              )}
              <CardContent className="p-8">
                <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                <div className="text-3xl font-bold text-primary mb-1">&#8377;{plan.price}<span className="text-base text-gray-400 font-normal">/{plan.duration}</span></div>
                <ul className="mt-6 space-y-3 mb-8">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm"><CheckCircle className="w-4 h-4 text-green-500 shrink-0" />{f}</li>
                  ))}
                </ul>
                <RazorpayButton plan={plan.id as any} amount={plan.price} label={plan.name} onSuccess={load} />
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
