"use client";

import { useEffect, useState } from "react";
import { CreditCard, Save, Plus, Trash2, X, ToggleLeft, ToggleRight, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import api from "@/lib/api";
import toast from "react-hot-toast";

interface Plan {
  id: string;
  code: string;
  name: string;
  description?: string | null;
  price: number;
  durationDays: number;
  isActive: boolean;
  displayOrder: number;
  features?: string[];
  assignedCourses?: { id: string; name: string; tier: string }[];
}

function cycleOf(code: string): "Monthly" | "Yearly" | "Plan" {
  if (code.endsWith("_MONTHLY")) return "Monthly";
  if (code.endsWith("_YEARLY")) return "Yearly";
  return "Plan";
}

export default function SubscriptionPlansSettingsPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string>("");
  const [showAdd, setShowAdd] = useState(false);

  // Add-plan form
  const [newName, setNewName] = useState("");
  const [newCode, setNewCode] = useState("");
  const [newPrice, setNewPrice] = useState(499);
  const [newDuration, setNewDuration] = useState(365);

  function load() {
    setLoading(true);
    api
      .get("/admin/subscription-plans")
      .then((res) => setPlans(Array.isArray(res.data) ? res.data : []))
      .catch(() => toast.error("Failed to load plans"))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
  }, []);

  const editField = (id: string, field: keyof Plan, value: any) =>
    setPlans((prev) => prev.map((p) => (p.id === id ? { ...p, [field]: value } : p)));

  async function savePlan(plan: Plan) {
    if (!plan.name.trim()) {
      toast.error("Plan name is required");
      return;
    }
    setSavingId(plan.id);
    try {
      await api.put(`/admin/subscription-plans/${plan.id}`, {
        name: plan.name,
        description: plan.description,
        price: plan.price,
        durationDays: plan.durationDays,
        isActive: plan.isActive,
        displayOrder: plan.displayOrder,
      });
      toast.success(`${plan.name} (${cycleOf(plan.code)}) saved`);
    } catch {
      toast.error("Failed to save plan");
    } finally {
      setSavingId("");
    }
  }

  async function deletePlan(plan: Plan) {
    if (!confirm(`Delete plan "${plan.name} — ${cycleOf(plan.code)}"? Existing subscriptions are not affected.`)) return;
    try {
      await api.delete(`/admin/subscription-plans/${plan.id}`);
      toast.success("Plan deleted");
      setPlans((prev) => prev.filter((p) => p.id !== plan.id));
    } catch {
      toast.error("Failed to delete plan");
    }
  }

  async function addPlan() {
    if (!newName.trim()) {
      toast.error("Plan name is required");
      return;
    }
    try {
      await api.post("/admin/subscription-plans", {
        code: newCode || newName,
        name: newName,
        price: newPrice,
        durationDays: newDuration,
        isActive: true,
      });
      toast.success("Plan added");
      setShowAdd(false);
      setNewName("");
      setNewCode("");
      setNewPrice(499);
      setNewDuration(365);
      load();
    } catch {
      toast.error("Failed to add plan");
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-44 rounded-2xl bg-card animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="max-w-4xl">
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-bright">Subscription Plans</h1>
          <p className="text-text-muted text-sm mt-1">Edit pricing, duration and availability for each plan.</p>
        </div>
        <Button size="sm" onClick={() => setShowAdd((v) => !v)}>
          {showAdd ? <><X className="w-4 h-4 mr-1.5" /> Cancel</> : <><Plus className="w-4 h-4 mr-1.5" /> Add Plan</>}
        </Button>
      </div>

      {showAdd && (
        <div className="mb-6 rounded-2xl border border-accent/20 bg-accent/5 p-5">
          <h3 className="font-semibold text-text-bright mb-4 flex items-center gap-2">
            <Plus className="w-4 h-4 text-accent" /> New Plan
          </h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Display Name">
              <input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="e.g. Class 11 Physics" className={inputCls} />
            </Field>
            <Field label="Plan Code (optional)">
              <input value={newCode} onChange={(e) => setNewCode(e.target.value.toUpperCase().replace(/[^A-Z0-9_]/g, ""))} placeholder="e.g. CLASS_11" className={inputCls} />
            </Field>
            <Field label="Price (₹)">
              <input type="number" value={newPrice} onChange={(e) => setNewPrice(parseInt(e.target.value) || 0)} className={inputCls} />
            </Field>
            <Field label="Duration (days)">
              <input type="number" value={newDuration} onChange={(e) => setNewDuration(parseInt(e.target.value) || 0)} className={inputCls} />
            </Field>
          </div>
          <p className="mt-3 text-xs text-text-muted">New plans are created as yearly (<code>_YEARLY</code>). Edit existing monthly plans below.</p>
          <Button size="sm" onClick={addPlan} className="mt-4"><Plus className="w-4 h-4 mr-1.5" /> Create Plan</Button>
        </div>
      )}

      <div className="space-y-4">
        {plans.map((plan) => {
          const cycle = cycleOf(plan.code);
          return (
            <div key={plan.id} className={`rounded-2xl border border-border bg-card p-5 ${!plan.isActive ? "opacity-60" : ""}`}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent/10 text-accent">
                    <CreditCard className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-text-bright text-sm leading-tight">{plan.name}</h3>
                    <span className="text-[10px] font-mono uppercase tracking-widest text-text-muted">{plan.code}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${cycle === "Monthly" ? "bg-secondary/15 text-secondary-light" : "bg-accent/15 text-accent"}`}>
                    {cycle}
                  </span>
                  <button onClick={() => deletePlan(plan)} className="flex h-7 w-7 items-center justify-center rounded-lg bg-surface-light text-text-muted hover:bg-danger hover:text-white transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <Field label="Plan Name">
                  <input value={plan.name} onChange={(e) => editField(plan.id, "name", e.target.value)} className={inputCls} />
                </Field>
                <Field label="Price (₹)">
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-text-muted">₹</span>
                    <input type="number" value={plan.price} onChange={(e) => editField(plan.id, "price", parseInt(e.target.value) || 0)} className={`${inputCls} pl-7 font-bold text-accent`} />
                  </div>
                </Field>
                <Field label="Duration (days)">
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted" />
                    <input type="number" value={plan.durationDays} onChange={(e) => editField(plan.id, "durationDays", parseInt(e.target.value) || 0)} className={`${inputCls} pl-8`} />
                  </div>
                </Field>
                <Field label="Display Order">
                  <input type="number" value={plan.displayOrder} onChange={(e) => editField(plan.id, "displayOrder", parseInt(e.target.value) || 0)} className={inputCls} />
                </Field>
              </div>

              {plan.assignedCourses && plan.assignedCourses.length > 0 && (
                <div className="mt-3 flex flex-wrap items-center gap-1.5">
                  <span className="text-[10px] uppercase tracking-widest text-text-muted">Unlocks:</span>
                  {plan.assignedCourses.map((c) => (
                    <span key={c.id} className="rounded-md bg-surface-light px-2 py-0.5 text-[11px] text-text-bright">{c.name}</span>
                  ))}
                </div>
              )}

              <div className="mt-4 flex items-center justify-between">
                <button
                  onClick={() => editField(plan.id, "isActive", !plan.isActive)}
                  className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-semibold transition-all ${plan.isActive ? "border-success/30 bg-success/10 text-success" : "border-border bg-surface-light text-text-muted"}`}
                >
                  {plan.isActive ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                  {plan.isActive ? "Active" : "Hidden"}
                </button>
                <Button size="sm" onClick={() => savePlan(plan)} disabled={savingId === plan.id}>
                  <Save className="w-4 h-4 mr-1.5" />
                  {savingId === plan.id ? "Saving..." : "Save"}
                </Button>
              </div>
            </div>
          );
        })}

        {plans.length === 0 && (
          <div className="rounded-2xl border border-dashed border-border bg-card py-12 text-center text-text-muted">
            <CreditCard className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm">No plans yet. Add your first plan above.</p>
          </div>
        )}
      </div>
    </div>
  );
}

const inputCls =
  "w-full rounded-xl border border-border bg-surface-light px-3 py-2 text-sm text-text-bright placeholder:text-text-muted focus:outline-none focus:border-accent/50";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-[10px] font-bold uppercase tracking-widest text-text-muted mb-1">{label}</label>
      {children}
    </div>
  );
}
