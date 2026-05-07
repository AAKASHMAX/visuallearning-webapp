"use client";

import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";
import { Button } from "@/components/ui/button";
import api from "@/lib/api";
import { useRequireAuth } from "@/lib/use-require-auth";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  Check,
  Clock3,
  CreditCard,
  Mail,
  Phone,
  ShieldCheck,
  Sparkles,
  User,
} from "lucide-react";

type ProfileUser = {
  id: string;
  name: string;
  email: string;
  role: string;
  phone?: string | null;
  mobile?: string | null;
  number?: string | null;
  createdAt?: string;
};

type Subscription = {
  id: string;
  plan: string;
  status: string;
  startDate?: string;
  expiryDate?: string;
  amount?: number;
  discountAmount?: number;
  couponCode?: string | null;
};

type Plan = {
  code: string;
  baseCode?: string;
  billingCycle?: "yearly";
  name: string;
  description?: string | null;
  price: number;
  originalPrice?: number;
  durationDays: number;
  features: string[];
};

function formatDate(value?: string) {
  if (!value) return "Not available";
  return new Date(value).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function daysRemaining(value?: string) {
  if (!value) return "Not available";
  const days = Math.ceil((new Date(value).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  if (days <= 0) return "Expired";
  return `${days} ${days === 1 ? "day" : "days"}`;
}

function formatAmount(value?: number) {
  if (value === undefined || value === null) return "Not available";
  if (value <= 0) return "Free";
  return `Rs ${value.toLocaleString("en-IN")}`;
}

export default function ProfilePage() {
  const canViewProfile = useRequireAuth();
  const [profile, setProfile] = useState<ProfileUser | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!canViewProfile) return;

    async function loadProfile() {
      setLoading(true);
      try {
        const [profileRes, subscriptionRes, plansRes] = await Promise.all([
          api.get("/auth/profile"),
          api.get("/subscription/my-subscription"),
          api.get("/subscription/plans"),
        ]);
        setProfile(profileRes.data || null);
        setSubscription(subscriptionRes.data || null);
        setPlans(Array.isArray(plansRes.data) ? plansRes.data : []);
      } catch {
        setProfile(null);
        setSubscription(null);
        setPlans([]);
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, [canViewProfile]);

  const activeSubscription = subscription?.status === "ACTIVE" && (!subscription.expiryDate || new Date(subscription.expiryDate) > new Date())
    ? subscription
    : null;
  const activePlan = useMemo(
    () => plans.find((plan) => plan.code === activeSubscription?.plan) || null,
    [plans, activeSubscription]
  );
  const phoneNumber = profile?.phone || profile?.mobile || profile?.number || "Not added";

  if (!canViewProfile) return null;

  return (
    <main className="min-h-screen bg-primary text-text">
      <Navbar />

      <section className="relative overflow-hidden bg-grid px-4 pb-20 pt-32 sm:px-6 lg:px-8">
        <div className="absolute left-1/2 top-24 h-80 w-80 -translate-x-1/2 rounded-full bg-accent/8 blur-[120px]" />
        <div className="relative z-10 mx-auto max-w-6xl">
          <div className="mb-10">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-accent/25 bg-surface/80 px-4 py-2 text-sm text-text-muted">
              <User className="h-4 w-4 text-accent" />
              Account Profile
            </div>
            <h1 className="text-4xl font-extrabold text-text-bright sm:text-5xl">Profile</h1>
            <p className="mt-4 max-w-2xl text-text-muted">
              Your account details and current PhysicsLab subscription status.
            </p>
          </div>

          {loading ? (
            <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
              <div className="h-80 animate-pulse rounded-lg border border-border bg-card" />
              <div className="h-80 animate-pulse rounded-lg border border-border bg-card" />
            </div>
          ) : (
            <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
              <section className="rounded-lg border border-border bg-card/90 p-6">
                <div className="mb-6 flex items-center gap-4">
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-accent to-secondary">
                    <User className="h-8 w-8 text-white" />
                  </div>
                  <div className="min-w-0">
                    <h2 className="truncate text-2xl font-black text-text-bright">
                      {profile?.name || "Student"}
                    </h2>
                    <p className="text-sm uppercase tracking-widest text-accent">{profile?.role || "STUDENT"}</p>
                  </div>
                </div>

                <div className="space-y-3">
                  {[
                    { label: "Name", value: profile?.name || "Not available", icon: User },
                    { label: "Email", value: profile?.email || "Not available", icon: Mail },
                    { label: "Number", value: phoneNumber, icon: Phone },
                    { label: "Joined", value: formatDate(profile?.createdAt), icon: CalendarDays },
                  ].map((item) => (
                    <div key={item.label} className="flex items-start gap-3 rounded-lg border border-border bg-surface/70 p-4">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent/10 text-accent">
                        <item.icon className="h-4 w-4" />
                      </span>
                      <div className="min-w-0">
                        <p className="text-xs font-bold uppercase tracking-wider text-text-muted">{item.label}</p>
                        <p className="break-words text-sm font-semibold text-text-bright">{item.value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <section className="rounded-lg border border-accent/25 bg-card/90 p-6">
                <div className="mb-6 flex items-start justify-between gap-4">
                  <div>
                    <p className="mb-2 text-xs font-bold uppercase tracking-widest text-accent">Active Plan</p>
                    <h2 className="text-2xl font-black text-text-bright">
                      {activePlan?.name || activeSubscription?.plan || "No active plan"}
                    </h2>
                    <p className="mt-2 text-sm leading-relaxed text-text-muted">
                      {activePlan?.description || (activeSubscription ? "Your current subscription details." : "Subscribe to unlock full course access.")}
                    </p>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-black uppercase ${
                    activeSubscription ? "bg-success/10 text-success" : "bg-energy/10 text-energy"
                  }`}>
                    {activeSubscription ? "Active" : "Inactive"}
                  </span>
                </div>

                {activeSubscription ? (
                  <>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {[
                        { label: "Plan Code", value: activeSubscription.plan, icon: Sparkles },
                        { label: "Billing", value: activePlan?.billingCycle || "Not available", icon: CreditCard },
                        { label: "Start Date", value: formatDate(activeSubscription.startDate), icon: CalendarDays },
                        { label: "Valid Until", value: formatDate(activeSubscription.expiryDate), icon: ShieldCheck },
                        { label: "Remaining", value: daysRemaining(activeSubscription.expiryDate), icon: Clock3 },
                        { label: "Amount Paid", value: formatAmount(activeSubscription.amount), icon: CreditCard },
                      ].map((item) => (
                        <div key={item.label} className="rounded-lg border border-border bg-surface/70 p-4">
                          <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-text-muted">
                            <item.icon className="h-3.5 w-3.5 text-accent" />
                            {item.label}
                          </div>
                          <p className="text-sm font-black capitalize text-text-bright">{item.value}</p>
                        </div>
                      ))}
                    </div>

                    {activePlan?.features?.length ? (
                      <div className="mt-6">
                        <h3 className="mb-3 text-sm font-black uppercase tracking-widest text-text-bright">Plan Details</h3>
                        <div className="grid gap-3 sm:grid-cols-2">
                          {activePlan.features.slice(0, 8).map((feature) => (
                            <div key={feature} className="flex items-center gap-3 rounded-lg border border-border bg-surface/70 px-4 py-3">
                              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-success/10 text-success">
                                <Check className="h-4 w-4" />
                              </span>
                              <span className="text-sm font-semibold text-text-bright">{feature}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : null}
                  </>
                ) : (
                  <div className="rounded-lg border border-border bg-surface/70 p-6">
                    <p className="mb-5 text-sm leading-relaxed text-text-muted">
                      You do not have an active plan right now. Choose a course plan to unlock full access.
                    </p>
                    <Link href="/courses">
                      <Button>
                        Explore Courses
                      </Button>
                    </Link>
                  </div>
                )}
              </section>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </main>
  );
}
