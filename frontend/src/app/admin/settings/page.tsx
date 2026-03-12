"use client";
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageLoader } from "@/components/ui/loading";
import { Badge } from "@/components/ui/badge";
import api from "@/lib/api";
import toast from "react-hot-toast";
import { Globe, CreditCard, Save } from "lucide-react";

const ALL_LANGUAGES = [
  { value: "ENGLISH", label: "English", required: true },
  { value: "HINDI", label: "Hindi" },
  { value: "MARATHI", label: "Marathi" },
  { value: "TAMIL", label: "Tamil" },
  { value: "TELUGU", label: "Telugu" },
];

const PLAN_KEYS = ["SINGLE_CLASS", "MULTI_CLASS", "FULL_ACCESS", "MONTHLY", "YEARLY"];

interface PlanConfig {
  amount: number;
  label: string;
  duration: number;
  enabled: boolean;
  classSelection: number;
}

export default function AdminSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [enabledLanguages, setEnabledLanguages] = useState<string[]>([]);
  const [plansConfig, setPlansConfig] = useState<Record<string, PlanConfig>>({});

  useEffect(() => {
    api.get("/admin/settings").then(({ data }) => {
      setEnabledLanguages(data.data.enabledLanguages);
      setPlansConfig(data.data.plansConfig);
    }).finally(() => setLoading(false));
  }, []);

  const toggleLanguage = (lang: string) => {
    if (lang === "ENGLISH") return; // Cannot disable English
    setEnabledLanguages((prev) =>
      prev.includes(lang) ? prev.filter((l) => l !== lang) : [...prev, lang]
    );
  };

  const saveLanguages = async () => {
    setSaving(true);
    try {
      await api.put("/admin/settings/languages", { enabledLanguages });
      toast.success("Language settings saved");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const updatePlan = (key: string, field: string, value: any) => {
    setPlansConfig((prev) => ({
      ...prev,
      [key]: { ...prev[key], [field]: value },
    }));
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

  if (loading) return <PageLoader />;

  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">Platform Settings</h1>

      {/* Language Settings */}
      <Card className="mb-8">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Globe className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-bold">Language Settings</h2>
          </div>
          <p className="text-sm text-gray-500 mb-4">
            Enable or disable languages across the platform. English is always enabled as the fallback language.
          </p>
          <div className="space-y-3 mb-6">
            {ALL_LANGUAGES.map((lang) => {
              const isEnabled = enabledLanguages.includes(lang.value);
              return (
                <div key={lang.value} className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="flex items-center gap-3">
                    <span className="font-medium">{lang.label}</span>
                    {lang.required && <Badge variant="info">Required</Badge>}
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isEnabled}
                      onChange={() => toggleLanguage(lang.value)}
                      disabled={lang.required}
                      className="sr-only peer"
                    />
                    <div className={`w-11 h-6 rounded-full transition-colors ${isEnabled ? "bg-primary" : "bg-gray-300"} ${lang.required ? "opacity-60" : ""}`}>
                      <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${isEnabled ? "translate-x-5" : ""}`} />
                    </div>
                  </label>
                </div>
              );
            })}
          </div>
          <Button onClick={saveLanguages} disabled={saving}>
            <Save className="w-4 h-4 mr-1" />{saving ? "Saving..." : "Save Language Settings"}
          </Button>
        </CardContent>
      </Card>

      {/* Subscription Plans Settings */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <CreditCard className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-bold">Subscription Plans</h2>
          </div>
          <p className="text-sm text-gray-500 mb-4">
            Configure pricing, duration, and availability of subscription plans. Amounts are in paise (100 paise = Rs 1).
          </p>
          <div className="space-y-6 mb-6">
            {PLAN_KEYS.map((key) => {
              const plan = plansConfig[key];
              if (!plan) return null;
              return (
                <div key={key} className={`p-4 rounded-lg border ${plan.enabled ? "border-green-200 bg-green-50/30" : "border-gray-200 bg-gray-50"}`}>
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="font-semibold">{plan.label}</h3>
                      <span className="text-xs text-gray-400">{key}</span>
                    </div>
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
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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
                  </div>
                  {plan.classSelection > 0 && (
                    <p className="text-xs text-gray-400 mt-2">Class selection: {plan.classSelection} class{plan.classSelection > 1 ? "es" : ""}</p>
                  )}
                </div>
              );
            })}
          </div>
          <Button onClick={savePlans} disabled={saving}>
            <Save className="w-4 h-4 mr-1" />{saving ? "Saving..." : "Save Plan Settings"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
