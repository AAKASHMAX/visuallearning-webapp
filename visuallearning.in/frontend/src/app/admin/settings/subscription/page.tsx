"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { PageLoader } from "@/components/ui/loading";
import api from "@/lib/api";
import toast from "react-hot-toast";
import {
  CreditCard, Save, Plus, Trash2, X, Percent,
  Star, Zap, Crown, Layers, CheckCircle2,
  ToggleLeft, ToggleRight, Pencil, IndianRupee,
  Atom, FlaskConical, Dna, Calculator, Sparkles
} from "lucide-react";

interface PlanConfig {
  monthlyAmount: number;
  yearlyAmount: number;
  label: string;
  durationMonthly: number;
  durationYearly: number;
  enabled: boolean;
  classSelection: number;
}

function getPlanTheme(key: string, label: string) {
  const k = (key + " " + label).toLowerCase();
  if (k.includes("single") || k.includes("foundation") || k.includes("free") || k.includes("monthly"))
    return { grad: "from-sky-500 to-blue-600", lightBg: "from-sky-50 to-blue-50", border: "border-sky-200", text: "text-sky-700", Icon: Star };
  if (k.includes("multi") || k.includes("academic") || k.includes("plus"))
    return { grad: "from-blue-500 to-indigo-600", lightBg: "from-blue-50 to-indigo-50", border: "border-blue-200", text: "text-blue-700", Icon: Zap };
  if (k.includes("full") || k.includes("yearly") || k.includes("elite") || k.includes("premium") || k.includes("live"))
    return { grad: "from-violet-500 to-purple-700", lightBg: "from-violet-50 to-purple-50", border: "border-violet-200", text: "text-violet-700", Icon: Crown };
  if (k.includes("flexi") || k.includes("custom"))
    return { grad: "from-indigo-500 to-[#170C79]", lightBg: "from-indigo-50 to-purple-50", border: "border-indigo-200", text: "text-indigo-700", Icon: Layers };
  return { grad: "from-gray-500 to-gray-700", lightBg: "from-gray-50 to-slate-50", border: "border-gray-200", text: "text-gray-700", Icon: CreditCard };
}

function subjectTheme(name: string) {
  const n = name.toLowerCase();
  if (n.includes("physics"))   return { Icon: Atom,        grad: "from-sky-400 to-blue-600",    bg: "from-sky-50 to-blue-50",    border: "border-sky-100",    text: "text-sky-600" };
  if (n.includes("chemistry")) return { Icon: FlaskConical, grad: "from-emerald-400 to-teal-500", bg: "from-emerald-50 to-teal-50", border: "border-emerald-100", text: "text-emerald-600" };
  if (n.includes("biology"))   return { Icon: Dna,          grad: "from-rose-400 to-fuchsia-500", bg: "from-rose-50 to-pink-50",   border: "border-rose-100",   text: "text-rose-500" };
  if (n.includes("math"))      return { Icon: Calculator,   grad: "from-violet-400 to-purple-600", bg: "from-violet-50 to-purple-50", border: "border-violet-100", text: "text-violet-600" };
  return                              { Icon: Sparkles,     grad: "from-cyan-400 to-teal-500",    bg: "from-cyan-50 to-teal-50",   border: "border-cyan-100",   text: "text-cyan-600" };
}

export default function SubscriptionSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [plansConfig, setPlansConfig] = useState<Record<string, PlanConfig>>({});
  const [showAddPlan, setShowAddPlan] = useState(false);
  const [newPlanKey, setNewPlanKey] = useState("");
  const [newPlanLabel, setNewPlanLabel] = useState("");
  const [newPlanMonthlyRupees, setNewPlanMonthlyRupees] = useState(299);
  const [newPlanYearlyRupees, setNewPlanYearlyRupees] = useState(2999);
  const [newPlanDurationMonthly, setNewPlanDurationMonthly] = useState(30);
  const [newPlanDurationYearly, setNewPlanDurationYearly] = useState(365);
  const [newPlanClassSelection, setNewPlanClassSelection] = useState(0);
  const [upgradeDiscountPercent, setUpgradeDiscountPercent] = useState(0);
  const [savingDiscount, setSavingDiscount] = useState(false);

  // Subject pricing
  const [subjectPricing, setSubjectPricing] = useState<any[]>([]);
  const [activeClassTab, setActiveClassTab] = useState("");
  const [editingPrice, setEditingPrice] = useState<{ id: string; price: number } | null>(null);
  const [savingPrice, setSavingPrice] = useState(false);

  useEffect(() => {
    Promise.all([
      api.get("/admin/settings"),
      api.get("/admin/settings/subscription"),
      api.get("/admin/subjects/access"),
    ]).then(([settingsRes, subSettingsRes, pricingRes]) => {
      setPlansConfig(settingsRes.data.data.plansConfig);
      setUpgradeDiscountPercent(subSettingsRes.data.data.upgradeDiscountPercent || 0);
      const pricing = pricingRes.data.data || [];
      setSubjectPricing(pricing);
      setActiveClassTab(pricing[0]?.id ?? "");
    }).finally(() => setLoading(false));
  }, []);

  const reloadPricing = () => {
    api.get("/admin/subjects/access").then(({ data }) => {
      setSubjectPricing(data.data || []);
    });
  };

  const updateSubjectPrice = async (id: string, price: number) => {
    setSavingPrice(true);
    try {
      await api.put(`/admin/subjects/${id}`, { price });
      toast.success("Price updated");
      setEditingPrice(null);
      reloadPricing();
    } catch { toast.error("Failed to update price"); }
    finally { setSavingPrice(false); }
  };

  const updatePlan = (key: string, field: string, value: any) =>
    setPlansConfig((prev) => ({ ...prev, [key]: { ...prev[key], [field]: value } }));

  const updatePlanMonthlyRupees = (key: string, rupees: number) =>
    updatePlan(key, "monthlyAmount", Math.round(rupees * 100));

  const updatePlanYearlyRupees = (key: string, rupees: number) =>
    updatePlan(key, "yearlyAmount", Math.round(rupees * 100));

  const addPlan = () => {
    const key = newPlanKey.toUpperCase().replace(/[^A-Z0-9_]/g, "");
    if (!key || !newPlanLabel.trim()) { toast.error("Both key and name are required"); return; }
    if (plansConfig[key]) { toast.error("Plan key already exists"); return; }
    setPlansConfig({
      ...plansConfig,
      [key]: { label: newPlanLabel.trim(), monthlyAmount: Math.round(newPlanMonthlyRupees * 100), yearlyAmount: Math.round(newPlanYearlyRupees * 100), durationMonthly: newPlanDurationMonthly, durationYearly: newPlanDurationYearly, enabled: true, classSelection: newPlanClassSelection },
    });
    setNewPlanKey(""); setNewPlanLabel(""); setNewPlanMonthlyRupees(299); setNewPlanYearlyRupees(2999);
    setNewPlanDurationMonthly(30); setNewPlanDurationYearly(365); setNewPlanClassSelection(0); setShowAddPlan(false);
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

  const activeClassData = subjectPricing.find((c) => c.id === activeClassTab);

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
          <Button size="sm" onClick={() => setShowAddPlan(!showAddPlan)} className="rounded-xl font-bold gap-1.5">
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
              {[
                { label: "Plan Key", el: <input value={newPlanKey} onChange={(e) => setNewPlanKey(e.target.value.toUpperCase().replace(/[^A-Z0-9_]/g, ""))} placeholder="e.g. PREMIUM" className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-primary/50 bg-white" /> },
                { label: "Display Name", el: <input value={newPlanLabel} onChange={(e) => setNewPlanLabel(e.target.value)} placeholder="e.g. Premium Plan" className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-primary/50 bg-white" /> },
                { label: "Class Access (0=all)", el: <input type="number" min={0} value={newPlanClassSelection} onChange={(e) => setNewPlanClassSelection(parseInt(e.target.value) || 0)} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-primary/50 bg-white" /> },
                { label: "Monthly Price (₹)", el: <input type="number" value={newPlanMonthlyRupees} onChange={(e) => setNewPlanMonthlyRupees(parseFloat(e.target.value) || 0)} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-primary/50 bg-white" /> },
                { label: "Monthly Duration (days)", el: <input type="number" value={newPlanDurationMonthly} onChange={(e) => setNewPlanDurationMonthly(parseInt(e.target.value) || 30)} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-primary/50 bg-white" /> },
                { label: "Yearly Price (₹)", el: <input type="number" value={newPlanYearlyRupees} onChange={(e) => setNewPlanYearlyRupees(parseFloat(e.target.value) || 0)} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-primary/50 bg-white" /> },
                { label: "Yearly Duration (days)", el: <input type="number" value={newPlanDurationYearly} onChange={(e) => setNewPlanDurationYearly(parseInt(e.target.value) || 365)} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-primary/50 bg-white" /> },
              ].map(({ label, el }) => (
                <div key={label}>
                  <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">{label}</label>
                  {el}
                </div>
              ))}
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
              <div key={key} className={`bg-gradient-to-br ${theme.lightBg} border ${theme.border} rounded-2xl overflow-hidden shadow-sm ${!plan.enabled ? "opacity-60" : ""}`}>

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
                    <button onClick={() => removePlan(key)} className="w-7 h-7 flex items-center justify-center rounded-lg bg-white/10 hover:bg-red-500 text-white/60 hover:text-white transition-all">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Card body */}
                <div className="p-5 space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Plan Name</label>
                      <input type="text" value={plan.label} onChange={(e) => updatePlan(key, "label", e.target.value)}
                        className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:border-primary/50" />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Class Access (0=All)</label>
                      <input type="number" min={0} value={plan.classSelection} onChange={(e) => updatePlan(key, "classSelection", parseInt(e.target.value) || 0)}
                        className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:border-primary/50" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Monthly Price (₹)</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-black text-gray-400">₹</span>
                        <input type="number" value={Math.round((plan.monthlyAmount || 0) / 100)} onChange={(e) => updatePlanMonthlyRupees(key, parseFloat(e.target.value) || 0)}
                          className={`w-full border border-gray-200 rounded-xl pl-7 pr-3 py-2 text-sm font-black ${theme.text} bg-white focus:outline-none focus:border-primary/50`} />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Monthly Dur. (days)</label>
                      <input type="number" value={plan.durationMonthly || 30} onChange={(e) => updatePlan(key, "durationMonthly", parseInt(e.target.value) || 30)}
                        className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:border-primary/50" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Yearly Price (₹)</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-black text-gray-400">₹</span>
                        <input type="number" value={Math.round((plan.yearlyAmount || 0) / 100)} onChange={(e) => updatePlanYearlyRupees(key, parseFloat(e.target.value) || 0)}
                          className={`w-full border border-gray-200 rounded-xl pl-7 pr-3 py-2 text-sm font-black ${theme.text} bg-white focus:outline-none focus:border-primary/50`} />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Yearly Dur. (days)</label>
                      <input type="number" value={plan.durationYearly || 365} onChange={(e) => updatePlan(key, "durationYearly", parseInt(e.target.value) || 365)}
                        className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:border-primary/50" />
                    </div>
                    <div className="flex items-end">
                      <button onClick={() => updatePlan(key, "enabled", !plan.enabled)}
                        className={`flex items-center gap-2 w-full px-3 py-2 rounded-xl border text-sm font-bold transition-all ${plan.enabled ? "bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100" : "bg-gray-50 border-gray-200 text-gray-500 hover:bg-gray-100"}`}>
                        {plan.enabled ? <ToggleRight className="w-4 h-4 text-emerald-500" /> : <ToggleLeft className="w-4 h-4 text-gray-400" />}
                        {plan.enabled ? "Enabled" : "Disabled"}
                      </button>
                    </div>
                  </div>
                </div>

                {/* FlexiLearn: subject pricing inline */}
                {isFlexiLearn && (
                  <div className="border-t border-indigo-100 bg-white/60 px-5 py-5 space-y-4">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-indigo-100 flex items-center justify-center">
                        <IndianRupee className="w-3.5 h-3.5 text-indigo-600" />
                      </div>
                      <div>
                        <p className="text-xs font-black text-gray-900">Subject-wise Pricing</p>
                        <p className="text-[10px] text-gray-400">Set per-subject prices for FlexiLearn</p>
                      </div>
                    </div>

                    {/* Class tabs */}
                    <div className="flex gap-2 overflow-x-auto pb-1">
                      {subjectPricing.map((cls) => (
                        <button key={cls.id} onClick={() => setActiveClassTab(cls.id)}
                          className={`shrink-0 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest border transition-all ${
                            activeClassTab === cls.id
                              ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                              : "bg-white text-gray-500 border-gray-200 hover:border-gray-300"
                          }`}>
                          {cls.name}
                        </button>
                      ))}
                    </div>

                    {/* Subject price cards */}
                    {activeClassData ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {activeClassData.subjects.map((sub: any) => {
                          const t = subjectTheme(sub.name);
                          const isEditing = editingPrice?.id === sub.id;
                          return (
                            <div key={sub.id} className={`bg-gradient-to-br ${t.bg} border ${t.border} rounded-xl p-3`}>
                              <div className="flex items-center gap-2.5 mb-3">
                                <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${t.grad} flex items-center justify-center shadow-sm shrink-0`}>
                                  <t.Icon className="w-4 h-4 text-white" />
                                </div>
                                <div className="min-w-0">
                                  <p className="text-xs font-black text-gray-900 truncate">{sub.name}</p>
                                  <span className={`text-[10px] font-bold ${sub.enabled ? "text-emerald-600" : "text-gray-400"}`}>
                                    {sub.enabled ? "Enabled" : "Disabled"}
                                  </span>
                                </div>
                              </div>
                              {isEditing ? (
                                <div className="flex items-center gap-1.5">
                                  <div className="flex items-center flex-1 border border-gray-300 rounded-lg overflow-hidden bg-white">
                                    <span className="px-2 text-xs font-bold text-gray-400">₹</span>
                                    <input type="number" value={editingPrice!.price} autoFocus
                                      onChange={(e) => setEditingPrice({ ...editingPrice!, price: parseInt(e.target.value) || 0 })}
                                      className="flex-1 py-1.5 pr-2 text-sm font-black focus:outline-none" />
                                  </div>
                                  <button onClick={() => updateSubjectPrice(sub.id, editingPrice!.price)} disabled={savingPrice}
                                    className="w-8 h-8 flex items-center justify-center rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white transition-colors">
                                    <Save className="w-3.5 h-3.5" />
                                  </button>
                                  <button onClick={() => setEditingPrice(null)}
                                    className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-400 hover:text-gray-600 transition-colors">
                                    <X className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              ) : (
                                <div className="flex items-center justify-between">
                                  <span className={`text-lg font-black ${t.text}`}>₹{sub.price || 0}</span>
                                  <button onClick={() => setEditingPrice({ id: sub.id, price: sub.price || 0 })}
                                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-gray-200 bg-white text-[10px] font-bold text-gray-500 hover:text-gray-700 hover:border-gray-300 transition-all">
                                    <Pencil className="w-3 h-3" /> Edit
                                  </button>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-xs text-gray-400 text-center py-4">No subjects found.</p>
                    )}
                  </div>
                )}
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
