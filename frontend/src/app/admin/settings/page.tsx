"use client";
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageLoader } from "@/components/ui/loading";
import { Badge } from "@/components/ui/badge";
import api from "@/lib/api";
import toast from "react-hot-toast";
import { Globe, CreditCard, Save, Plus, Trash2, X, MapPin } from "lucide-react";

interface LangItem {
  key: string;
  label: string;
}

interface PlanConfig {
  amount: number;
  label: string;
  duration: number;
  enabled: boolean;
  classSelection: number;
}

interface ContactInfo {
  companyName: string;
  address: string;
  phone: string;
  email: string;
}

export default function AdminSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Languages
  const [languages, setLanguages] = useState<LangItem[]>([]);
  const [showAddLang, setShowAddLang] = useState(false);
  const [newLangKey, setNewLangKey] = useState("");
  const [newLangLabel, setNewLangLabel] = useState("");

  // Plans
  const [plansConfig, setPlansConfig] = useState<Record<string, PlanConfig>>({});
  const [showAddPlan, setShowAddPlan] = useState(false);
  const [newPlanKey, setNewPlanKey] = useState("");
  const [newPlanLabel, setNewPlanLabel] = useState("");
  const [newPlanAmount, setNewPlanAmount] = useState(29900);
  const [newPlanDuration, setNewPlanDuration] = useState(365);
  const [newPlanClassSelection, setNewPlanClassSelection] = useState(0);

  // Contact Info
  const [contactInfo, setContactInfo] = useState<ContactInfo>({
    companyName: "",
    address: "",
    phone: "",
    email: "",
  });

  useEffect(() => {
    api.get("/admin/settings").then(({ data }) => {
      // Normalize languages: handle both old (string[]) and new ({key,label}[]) format
      const rawLangs = data.data.enabledLanguages;
      const normalized: LangItem[] = rawLangs.map((l: any) =>
        typeof l === "string" ? { key: l, label: l.charAt(0) + l.slice(1).toLowerCase() } : l
      );
      setLanguages(normalized);
      setPlansConfig(data.data.plansConfig);
      if (data.data.contactInfo) {
        setContactInfo(data.data.contactInfo);
      }
    }).finally(() => setLoading(false));
  }, []);

  // --- Language handlers ---
  const addLanguage = () => {
    const key = newLangKey.toUpperCase().replace(/[^A-Z_]/g, "");
    if (!key || !newLangLabel.trim()) {
      toast.error("Both key and label are required");
      return;
    }
    if (languages.some((l) => l.key === key)) {
      toast.error("Language key already exists");
      return;
    }
    setLanguages([...languages, { key, label: newLangLabel.trim() }]);
    setNewLangKey("");
    setNewLangLabel("");
    setShowAddLang(false);
  };

  const removeLanguage = (key: string) => {
    if (key === "ENGLISH") return;
    setLanguages(languages.filter((l) => l.key !== key));
  };

  const saveLanguages = async () => {
    setSaving(true);
    try {
      await api.put("/admin/settings/languages", { enabledLanguages: languages });
      toast.success("Language settings saved");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  // --- Plan handlers ---
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
      },
    });
    setNewPlanKey("");
    setNewPlanLabel("");
    setNewPlanAmount(29900);
    setNewPlanDuration(365);
    setNewPlanClassSelection(0);
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

  // --- Contact handlers ---
  const saveContact = async () => {
    setSaving(true);
    try {
      await api.put("/admin/settings/contact", { contactInfo });
      toast.success("Contact info saved");
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

      {/* ========== Language Settings ========== */}
      <Card className="mb-8">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Globe className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-bold">Languages</h2>
            </div>
            <Button size="sm" onClick={() => setShowAddLang(!showAddLang)}>
              {showAddLang ? <><X className="w-4 h-4 mr-1" />Cancel</> : <><Plus className="w-4 h-4 mr-1" />Add Language</>}
            </Button>
          </div>
          <p className="text-sm text-gray-500 mb-4">
            Manage languages available on the platform. English cannot be removed (it&apos;s the fallback).
          </p>

          {/* Add Language Form */}
          {showAddLang && (
            <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-medium text-sm mb-3">Add New Language</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                <Input
                  label="Key (e.g. KANNADA)"
                  value={newLangKey}
                  onChange={(e) => setNewLangKey(e.target.value.toUpperCase().replace(/[^A-Z_]/g, ""))}
                  placeholder="KANNADA"
                />
                <Input
                  label="Display Label"
                  value={newLangLabel}
                  onChange={(e) => setNewLangLabel(e.target.value)}
                  placeholder="Kannada"
                />
              </div>
              <Button size="sm" onClick={addLanguage}>Add Language</Button>
            </div>
          )}

          {/* Languages List */}
          <div className="space-y-2 mb-6">
            {languages.map((lang) => (
              <div key={lang.key} className="flex items-center justify-between p-3 rounded-lg border">
                <div className="flex items-center gap-3">
                  <span className="font-medium">{lang.label}</span>
                  <span className="text-xs text-gray-400 font-mono">{lang.key}</span>
                  {lang.key === "ENGLISH" && <Badge variant="info">Required</Badge>}
                </div>
                {lang.key !== "ENGLISH" && (
                  <button onClick={() => removeLanguage(lang.key)} className="text-red-400 hover:text-red-600">
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
          <Button onClick={saveLanguages} disabled={saving}>
            <Save className="w-4 h-4 mr-1" />{saving ? "Saving..." : "Save Language Settings"}
          </Button>
        </CardContent>
      </Card>

      {/* ========== Subscription Plans ========== */}
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

          {/* Add Plan Form */}
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
              </div>
              <Button size="sm" onClick={addPlan}>Add Plan</Button>
            </div>
          )}

          {/* Plans List */}
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
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
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

      {/* ========== Contact Info ========== */}
      <Card className="mt-8">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <MapPin className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-bold">Contact Information</h2>
          </div>
          <p className="text-sm text-gray-500 mb-4">
            These details appear on the Contact Us page and footer.
          </p>

          <div className="space-y-4 mb-6">
            <Input
              label="Company Name"
              value={contactInfo.companyName}
              onChange={(e) => setContactInfo({ ...contactInfo, companyName: e.target.value })}
              placeholder="Company name"
            />
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Address</label>
              <textarea
                value={contactInfo.address}
                onChange={(e) => setContactInfo({ ...contactInfo, address: e.target.value })}
                className="border rounded-lg px-3 py-2 text-sm w-full"
                rows={3}
                placeholder="Full address"
              />
            </div>
            <Input
              label="Phone Number"
              value={contactInfo.phone}
              onChange={(e) => setContactInfo({ ...contactInfo, phone: e.target.value })}
              placeholder="9718154204"
            />
            <Input
              label="Email"
              type="email"
              value={contactInfo.email}
              onChange={(e) => setContactInfo({ ...contactInfo, email: e.target.value })}
              placeholder="contact@example.com"
            />
          </div>
          <Button onClick={saveContact} disabled={saving}>
            <Save className="w-4 h-4 mr-1" />{saving ? "Saving..." : "Save Contact Info"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
