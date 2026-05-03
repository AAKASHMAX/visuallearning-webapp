"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { PageLoader } from "@/components/ui/loading";
import api from "@/lib/api";
import toast from "react-hot-toast";
import {
  CreditCard, Save, Plus, Trash2, X, Percent,
  Star, Zap, Crown, Layers, ArrowRight, ExternalLink,
  BookOpen, CheckCircle2, ToggleLeft, ToggleRight
} from "lucide-react";
import Link from "next/link";

interface PlanConfig {
  amount: number;
  label: string;
  duration: number;
  enabled: boolean;
  classSelection: number;
  billingCycle: "monthly" | "yearly";
}

// Theme per known plan key / label
function getPlanTheme(key: string, label: string) {
  const k = (key + label).toLowerCase();
  if (k.includes("foundation") || k.includes("free"))
    return {
      grad: "from-sky-500 to-blue-600",
      lightBg: "from-sky-50 to-blue-50",
      border: "border-sky-200",
      ring: "ring-sky-300",
      text: "text-sky-700",
      badge: "bg-sky-100 text-sky-700 border-sky-200",
      Icon: Star,
    };
  if (k.includes("academic") || k.includes("plus"))
    return {
      grad: "from-blue-500 to-indigo-600",
      lightBg: "from-blue-50 to-indigo-50",
      border: "border-blue-200",
      ring: "ring-blue-300",
      text: "text-blue-700",
      badge: "bg-blue-100 text-blue-700 border-blue-200",
      Icon: Zap,
    };
  if (k.includes("elite") || k.includes("premium"))
    return {
      grad: "from-violet-500 to-purple-700",
      lightBg: "from-violet-50 to-purple-50",
      border: "border-violet-200",
      ring: "ring-violet-300",
      text: "text-violet-700",
      badge: "bg-violet-100 text-violet-700 border-violet-200",
      Icon: Crown,
    };
  if (k.includes("flexi") || k.includes("custom"))
    return {
      grad: "from-indigo-500 to-[#170C79]",
      lightBg: "from-indigo-50 to-purple-50",
      border: "border-indigo-200",
      ring: "ring-indigo-300",
      text: "text-indigo-700",
      badge: "bg-indigo-100 text-indigo-700 border-indigo-200",
      Icon: Layers,
    };
  return {
    grad: "from-gray-500 to-gray-700",
    lightBg: "from-gray-50 to-slate-50",
    border: "border-gray-200",
    ring: "ring-gray-300",
    text: "text-gray-700",
    badge: "bg-gray-100 text-gray-600 border-gray-200",
    Icon: CreditCard,
  };
}

export default function SubscriptionSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [plansConfig, setPlansConfig] = useState<Record<string, PlanConfig>>({});
  const [showAddPlan, setShowAddPlan] = useState(false);
  const [newPlanKey, setNewPlanKey] = useState("");
  const [newPlanLabel, setNewPlanLabel] = useState("");
  const [newPlanRupees, setNewPlanRupees] = useState(2999);
  const [newPlanDuration, setNewPlanDuration] = useState(365);
  const [newPlanClassSelection, setNewPlanClassSelection] = useState(0);
  const [newPlanBillingCycle, setNewPlanBillingCycle] = useState<"monthly" | "yearly">("yearly");
  const [upgradeDiscountPercent, setUpgradeDiscountPercent] = useState(0);
  const [savingDiscount, setSavingDiscount] = useState(false);

  useEffect(() => {
    Promise.all([
      api.get("/admin/settings"),
      api.get("/admin/settings/subscription"),
    ]).then(([settingsRes, subSettingsRes]) => {
      setPlansConfig(settingsRes.data.data.plansConfig);
      setUpgradeDiscountPercent(subSettingsRes.data.data.upgradeDiscountPercent || 0);
    }).finally(() => setLoading(false));
  }, []);

  const updatePlan = (key: string, field: string, value: any) => {
    setPlansConfig((prev) => ({
      ...prev,
      [key]: { ...prev[key], [field]: value },
    }));
  };

  // amount stored in paise; UI shows rupees
  const updatePlanRupees = (key: string, rupees: number) => {
    updatePlan(key, "amount", Math.round(rupees * 100));
  };

  const addPlan = () => {
    const key = newPlanKey.toUpperCase().replace(/[^A-Z0-9_]/g, "");
    if (!key || !newPlanLabel.trim()) { toast.error("Both key and name are required"); return; }
    if (plansConfig[key]) { toast.error("Plan key already exists"); return; }
    setPlansConfig({
      ...plansConfig,
      [key]: {
        label: newPlanLabel.trim(),
        amount: Math.round(newPlanRupees * 100),
        duration: newPlanDuration,
        enabled: true,
        classSelection: newPlanClassSelection,
        billingCycle: newPlanBillingCycle,
      },
    });
    setNewPlanKey(""); setNewPlanLabel(""); setNewPlanRupees(2999);
    setNewPlanDuration(365); setNewPlanClassSelection(0);
    setNewPlanBillingCycle("yearly"); setShowAddPlan(false);
  };

  const removePlan = (key: string) => {
    if (!confirm(`Delete plan "${plansConfig[key]?.label}"? This won't affect existing subscriptions.`)) return;
    const updated = { ...plansConfig };
    delete updated[key];
    setPlansConfig(updated);
  };

  const savePlans = async () => {
    setSaving(true);
    try {
      await api.put("/admin/settings/plans", { plansConfig });
      toast.success("Plan settings saved");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to save");
    } finally { setSaving(false); }
  };

  const saveUpgradeDiscount = async () => {
    setSavingDiscount(true);
    try {
      await api.put("/admin/settings/subscription", { upgradeDiscountPercent });
      toast.success("Upgrade discount saved");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to save");
    } finally { setSavingDiscount(false); }
  };

  if (loading) return <PageLoader />;

  return (
    <div className="max-w-5xl space-y-8">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-gray-900">Subscription Plans</h1>
        <p className="text-sm text-gray-500 mt-1">Configure pricing, duration, and availability for each plan</p>
      </div>

      {/* Plan Cards */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-black text-gray-900">Active Plans</h2>
          </div>
          <Button size="sm" onClick={() => setShowAddPlan(!showAddPlan)}
            className="rounded-xl font-bold gap-1.5">
            {showAddPlan ? <><X className="w-4 h-4" /> Cancel</> : <><Plus className="w-4 h-4" /> Add Plan</>}
          </Button>
        </div>

        {/* Add Plan Form */}
        {showAddPlan && (
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
            <h4 className="font-black text-gray-900 text-sm mb-4 flex items-center gap-2">
              <Plus className="w-4 h-4 text-primary" /> New Plan
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Plan Key</label>
                <input value={newPlanKey}
                  onChange={(e) => setNewPlanKey(e.target.value.toUpperCase().replace(/[^A-Z0-9_]/g, ""))}
                  placeholder="e.g. PREMIUM" className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-primary/50 bg-white" />
              </div>
              <div>
                <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Display Name</label>
                <input value={newPlanLabel} onChange={(e) => setNewPlanLabel(e.target.value)}
                  placeholder="e.g. Premium Plan" className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-primary/50 bg-white" />
              </div>
              <div>
                <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Price (₹)</label>
                <input type="number" value={newPlanRupees} onChange={(e) => setNewPlanRupees(parseFloat(e.target.value) || 0)}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-primary/50 bg-white" />
              </div>
              <div>
                <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Duration (days)</label>
                <input type="number" value={newPlanDuration} onChange={(e) => setNewPlanDuration(parseInt(e.target.value) || 1)}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-primary/50 bg-white" />
              </div>
              <div>
                <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Class Access</label>
                <input type="number" value={newPlanClassSelection} min={0}
                  onChange={(e) => setNewPlanClassSelection(parseInt(e.target.value) || 0)}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-primary/50 bg-white" />
                <p className="text-[10px] text-gray-400 mt-1">0 = all classes</p>
              </div>
              <div>
                <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Billing Tab</label>
                <select value={newPlanBillingCycle} onChange={(e) => setNewPlanBillingCycle(e.target.value as "monthly" | "yearly")}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none bg-white">
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>
            </div>
            <Button size="sm" onClick={addPlan} className="rounded-xl font-bold">Add Plan</Button>
          </div>
        )}

        {/* Plan cards grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {Object.entries(plansConfig).map(([key, plan]) => {
            const theme = getPlanTheme(key, plan.label);
            const { Icon } = theme;
            const isFlexiLearn = (key + plan.label).toLowerCase().includes("flexi") || (key + plan.label).toLowerCase().includes("custom");
            return (
              <div key={key}
                className={`bg-gradient-to-br ${theme.lightBg} border ${theme.border} rounded-2xl overflow-hidden shadow-sm transition-all ${!plan.enabled ? "opacity-60" : ""}`}>

                {/* Card header */}
                <div className={`bg-gradient-to-r ${theme.grad} px-5 py-4 flex items-center justify-between`}>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-black text-white text-sm leading-tight">{plan.label}</h3>
                      <span className="text-[10px] font-bold text-white/60 font-mono uppercase tracking-widest">{key}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border ${plan.enabled ? "bg-white/20 text-white border-white/30" : "bg-black/20 text-white/50 border-white/10"}`}>
                      {plan.enabled ? "Active" : "Disabled"}
                    </span>
                    <button onClick={() => removePlan(key)}
                      className="w-7 h-7 flex items-center justify-center rounded-lg bg-white/10 hover:bg-red-500 text-white/60 hover:text-white transition-all">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Card body */}
                <div className="p-5 space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Plan Name</label>
                      <input type="text" value={plan.label}
                        onChange={(e) => updatePlan(key, "label", e.target.value)}
                        className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:border-primary/50" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">
                        Price (₹)
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-black text-gray-400">₹</span>
                        <input type="number" value={Math.round(plan.amount / 100)}
                          onChange={(e) => updatePlanRupees(key, parseFloat(e.target.value) || 0)}
                          className={`w-full border border-gray-200 rounded-xl pl-7 pr-3 py-2 text-sm font-black ${theme.text} bg-white focus:outline-none focus:border-primary/50`} />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Duration (days)</label>
                      <input type="number" value={plan.duration}
                        onChange={(e) => updatePlan(key, "duration", parseInt(e.target.value) || 1)}
                        className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:border-primary/50" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Class Access</label>
                      <input type="number" value={plan.classSelection} min={0}
                        onChange={(e) => updatePlan(key, "classSelection", parseInt(e.target.value) || 0)}
                        className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:border-primary/50" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Billing Tab</label>
                      <select value={plan.billingCycle || "yearly"}
                        onChange={(e) => updatePlan(key, "billingCycle", e.target.value)}
                        className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white focus:outline-none">
                        <option value="monthly">Monthly</option>
                        <option value="yearly">Yearly</option>
                      </select>
                    </div>
                    <div className="flex items-end">
                      <button
                        onClick={() => updatePlan(key, "enabled", !plan.enabled)}
                        className={`flex items-center gap-2 w-full px-3 py-2 rounded-xl border text-sm font-bold transition-all ${
                          plan.enabled
                            ? "bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100"
                            : "bg-gray-50 border-gray-200 text-gray-500 hover:bg-gray-100"
                        }`}>
                        {plan.enabled
                          ? <ToggleRight className="w-4 h-4 text-emerald-500" />
                          : <ToggleLeft className="w-4 h-4 text-gray-400" />}
                        {plan.enabled ? "Enabled" : "Disabled"}
                      </button>
                    </div>
                  </div>

                  {/* FlexiLearn pricing note */}
                  {isFlexiLearn && (
                    <div className="flex items-start gap-2.5 bg-indigo-50 border border-indigo-100 rounded-xl p-3">
                      <BookOpen className="w-4 h-4 text-indigo-500 mt-0.5 shrink-0" />
                      <div className="min-w-0">
                        <p className="text-[11px] font-black text-indigo-700 leading-snug">Subject-wise pricing</p>
                        <p className="text-[10px] text-indigo-500 mt-0.5 leading-snug">
                          Per-subject prices for this plan are managed in the Subscriptions section.
                        </p>
                        <Link href="/admin/subscriptions" className="inline-flex items-center gap-1 text-[10px] font-black text-indigo-600 hover:text-indigo-800 mt-1">
                          Manage Subject Prices <ArrowRight className="w-3 h-3" />
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {Object.keys(plansConfig).length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <CreditCard className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm">No plans configured. Add your first plan above.</p>
          </div>
        )}

        {Object.keys(plansConfig).length > 0 && (
          <div className="flex justify-end pt-2">
            <Button onClick={savePlans} disabled={saving} className="rounded-xl font-bold px-6 gap-2">
              <Save className="w-4 h-4" />{saving ? "Saving..." : "Save All Plans"}
            </Button>
          </div>
        )}
      </div>

      {/* Upgrade Discount */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center">
            <Percent className="w-4 h-4 text-amber-600" />
          </div>
          <div>
            <h2 className="text-base font-black text-gray-900">Upgrade Discount</h2>
            <p className="text-xs text-gray-500">Applied when a user upgrades from one plan to another</p>
          </div>
        </div>
        <div className="flex items-end gap-4">
          <div className="w-44">
            <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Discount (%)</label>
            <div className="relative">
              <input type="number" value={upgradeDiscountPercent} min={0} max={100}
                onChange={(e) => setUpgradeDiscountPercent(Math.max(0, Math.min(100, parseInt(e.target.value) || 0)))}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm pr-8 focus:outline-none focus:border-primary/50" />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-black text-gray-400">%</span>
            </div>
          </div>
          <Button size="sm" onClick={saveUpgradeDiscount} disabled={savingDiscount} className="rounded-xl font-bold gap-1.5">
            <Save className="w-4 h-4" />{savingDiscount ? "Saving..." : "Save"}
          </Button>
          {upgradeDiscountPercent > 0 && (
            <div className="flex items-center gap-1.5 text-sm text-emerald-600 font-bold">
              <CheckCircle2 className="w-4 h-4" />
              {upgradeDiscountPercent}% off on upgrades
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
