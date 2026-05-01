"use client";
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageLoader } from "@/components/ui/loading";
import api from "@/lib/api";
import toast from "react-hot-toast";
import { CreditCard, Save, Plus, Trash2, X, Percent } from "lucide-react";

interface PlanConfig {
  amount: number;
  label: string;
  duration: number;
  enabled: boolean;
  classSelection: number;
  billingCycle: "monthly" | "yearly";
}

export default function SubscriptionSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Plans
  const [plansConfig, setPlansConfig] = useState<Record<string, PlanConfig>>({});
  const [showAddPlan, setShowAddPlan] = useState(false);
  const [newPlanKey, setNewPlanKey] = useState("");
  const [newPlanLabel, setNewPlanLabel] = useState("");
  const [newPlanAmount, setNewPlanAmount] = useState(29900);
  const [newPlanDuration, setNewPlanDuration] = useState(365);
  const [newPlanClassSelection, setNewPlanClassSelection] = useState(0);
  const [newPlanBillingCycle, setNewPlanBillingCycle] = useState<"monthly" | "yearly">("yearly");

  // Upgrade discount
  const [upgradeDiscountPercent, setUpgradeDiscountPercent] = useState(0);

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

  const addPlan = () => {
    const key = newPlanKey.toUpperCase().replace(/[^A-Z0-9_]/g, "");
    if (!key || !newPlanLabel.trim()) {
      toast.error("Both key and name are required");
      return;
    }
    if (plansConfig[key]) {
      toast.error("Plan key already exists");
      return;
    }
    setPlansConfig({
      ...plansConfig,
      [key]: {
        label: newPlanLabel.trim(),
        amount: newPlanAmount,
        duration: newPlanDuration,
        enabled: true,
        classSelection: newPlanClassSelection,
        billingCycle: newPlanBillingCycle,
      },
    });
    setNewPlanKey("");
    setNewPlanLabel("");
    setNewPlanAmount(29900);
    setNewPlanDuration(365);
    setNewPlanClassSelection(0);
    setNewPlanBillingCycle("yearly");
    setShowAddPlan(false);
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
    } finally {
      setSaving(false);
    }
  };

  const saveUpgradeDiscount = async () => {
    setSaving(true);
    try {
      await api.put("/admin/settings/subscription", { upgradeDiscountPercent });
      toast.success("Upgrade discount saved");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <PageLoader />;

  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">Subscription Settings</h1>

      {/* Upgrade Discount */}
      <Card className="mb-8">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Percent className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-bold">Upgrade Discount</h2>
          </div>
          <p className="text-sm text-gray-500 mb-4">
            Discount percentage applied when an existing subscriber upgrades to a different plan. Set to 0 to disable.
          </p>
          <div className="flex items-center gap-4 mb-4">
            <div className="w-48">
              <label className="block text-xs font-medium text-gray-500 mb-1">Discount (%)</label>
              <input
                type="number"
                value={upgradeDiscountPercent}
                onChange={(e) => setUpgradeDiscountPercent(Math.max(0, Math.min(100, parseInt(e.target.value) || 0)))}
                className="border rounded-lg px-3 py-2 text-sm w-full"
                min={0}
                max={100}
              />
            </div>
            <div className="pt-4">
              <Button size="sm" onClick={saveUpgradeDiscount} disabled={saving}>
                <Save className="w-4 h-4 mr-1" />{saving ? "Saving..." : "Save"}
              </Button>
            </div>
          </div>
          {upgradeDiscountPercent > 0 && (
            <p className="text-sm text-emerald-600">
              Subscribers will get {upgradeDiscountPercent}% off when upgrading to another plan.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Subscription Plans */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-bold">Subscription Plans</h2>
            </div>
            <Button size="sm" onClick={() => setShowAddPlan(!showAddPlan)}>
              {showAddPlan ? <><X className="w-4 h-4 mr-1" />Cancel</> : <><Plus className="w-4 h-4 mr-1" />Add Plan</>}
            </Button>
          </div>
          <p className="text-sm text-gray-500 mb-4">
            Configure subscription plans. Amounts are in paise (100 paise = Rs 1). Set &quot;Class Selection&quot; to 0 for full access plans.
          </p>

          {showAddPlan && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-medium text-sm mb-3">Add New Plan</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                <Input
                  label="Plan Key (e.g. PREMIUM)"
                  value={newPlanKey}
                  onChange={(e) => setNewPlanKey(e.target.value.toUpperCase().replace(/[^A-Z0-9_]/g, ""))}
                  placeholder="PREMIUM"
                />
                <Input
                  label="Display Name"
                  value={newPlanLabel}
                  onChange={(e) => setNewPlanLabel(e.target.value)}
                  placeholder="Premium Plan"
                />
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Amount (paise) — Rs {newPlanAmount / 100}</label>
                  <input
                    type="number"
                    value={newPlanAmount}
                    onChange={(e) => setNewPlanAmount(parseInt(e.target.value) || 0)}
                    className="border rounded-lg px-3 py-2 text-sm w-full"
                  />
                </div>
                <Input
                  label="Duration (days)"
                  type="number"
                  value={newPlanDuration}
                  onChange={(e) => setNewPlanDuration(parseInt(e.target.value) || 1)}
                />
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Class Selection (0 = all classes)</label>
                  <input
                    type="number"
                    value={newPlanClassSelection}
                    onChange={(e) => setNewPlanClassSelection(parseInt(e.target.value) || 0)}
                    className="border rounded-lg px-3 py-2 text-sm w-full"
                    min={0}
                  />
                  <p className="text-xs text-gray-400 mt-1">0 = full access, 1 = single class, 2 = two classes, etc.</p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Billing Tab</label>
                  <select
                    value={newPlanBillingCycle}
                    onChange={(e) => setNewPlanBillingCycle(e.target.value as "monthly" | "yearly")}
                    className="border rounded-lg px-3 py-2 text-sm w-full"
                  >
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                  <p className="text-xs text-gray-400 mt-1">Which tab this plan appears under on the subscription page</p>
                </div>
              </div>
              <Button size="sm" onClick={addPlan}>Add Plan</Button>
            </div>
          )}

          <div className="space-y-6 mb-6">
            {Object.entries(plansConfig).map(([key, plan]) => (
              <div key={key} className={`p-4 rounded-lg border ${plan.enabled ? "border-green-200 bg-green-50/30" : "border-gray-200 bg-gray-50"}`}>
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="font-semibold">{plan.label}</h3>
                    <span className="text-xs text-gray-400 font-mono">{key}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={plan.enabled}
                        onChange={(e) => updatePlan(key, "enabled", e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className={`w-11 h-6 rounded-full transition-colors ${plan.enabled ? "bg-green-500" : "bg-gray-300"}`}>
                        <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${plan.enabled ? "translate-x-5" : ""}`} />
                      </div>
                    </label>
                    <button onClick={() => removePlan(key)} className="text-red-400 hover:text-red-600">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Plan Name</label>
                    <input
                      type="text"
                      value={plan.label}
                      onChange={(e) => updatePlan(key, "label", e.target.value)}
                      className="border rounded-lg px-3 py-2 text-sm w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Amount (paise) — Rs {plan.amount / 100}</label>
                    <input
                      type="number"
                      value={plan.amount}
                      onChange={(e) => updatePlan(key, "amount", parseInt(e.target.value) || 0)}
                      className="border rounded-lg px-3 py-2 text-sm w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Duration (days)</label>
                    <input
                      type="number"
                      value={plan.duration}
                      onChange={(e) => updatePlan(key, "duration", parseInt(e.target.value) || 1)}
                      className="border rounded-lg px-3 py-2 text-sm w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Class Selection</label>
                    <input
                      type="number"
                      value={plan.classSelection}
                      onChange={(e) => updatePlan(key, "classSelection", parseInt(e.target.value) || 0)}
                      className="border rounded-lg px-3 py-2 text-sm w-full"
                      min={0}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Billing Tab</label>
                    <select
                      value={plan.billingCycle || "yearly"}
                      onChange={(e) => updatePlan(key, "billingCycle", e.target.value)}
                      className="border rounded-lg px-3 py-2 text-sm w-full"
                    >
                      <option value="monthly">Monthly</option>
                      <option value="yearly">Yearly</option>
                    </select>
                  </div>
                </div>
              </div>
            ))}
            {Object.keys(plansConfig).length === 0 && (
              <p className="text-gray-400 text-center py-4">No plans configured. Add your first plan above.</p>
            )}
          </div>
          <Button onClick={savePlans} disabled={saving}>
            <Save className="w-4 h-4 mr-1" />{saving ? "Saving..." : "Save Plan Settings"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
