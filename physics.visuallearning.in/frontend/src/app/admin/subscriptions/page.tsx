"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, CreditCard, Edit2, Plus, Save, Search, Trash2, UserRound, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import api from "@/lib/api";
import toast from "react-hot-toast";

interface SubItem {
  id: string;
  plan: string;
  status: string;
  startDate: string;
  expiryDate: string;
  amount: number;
  user: { name: string; email: string };
  planDetails?: { name: string; price: number; durationDays: number } | null;
}

interface CourseOption {
  id: string;
  name: string;
  tier: string;
}

interface PlanItem {
  id: string;
  code: string;
  name: string;
  description: string | null;
  price: number;
  durationDays: number;
  features: string[];
  isActive: boolean;
  displayOrder: number;
  courseIds: string[];
  assignedCourses: CourseOption[];
}

interface UserSuggestion {
  id: string;
  name: string;
  email: string;
  subscription?: { plan: string; status: string; expiryDate: string } | null;
}

export default function AdminSubscriptionsPage() {
  const [subs, setSubs] = useState<SubItem[]>([]);
  const [plans, setPlans] = useState<PlanItem[]>([]);
  const [courses, setCourses] = useState<CourseOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [showGrant, setShowGrant] = useState(false);
  const [showPlanForm, setShowPlanForm] = useState(false);
  const [editingPlan, setEditingPlan] = useState<PlanItem | null>(null);
  const [grantUserSearch, setGrantUserSearch] = useState("");
  const [selectedGrantUser, setSelectedGrantUser] = useState<UserSuggestion | null>(null);
  const [userSuggestions, setUserSuggestions] = useState<UserSuggestion[]>([]);
  const [searchingUsers, setSearchingUsers] = useState(false);
  const [grantPlan, setGrantPlan] = useState("BASIC");
  const [grantDays, setGrantDays] = useState(30);
  const [planForm, setPlanForm] = useState({
    code: "",
    name: "",
    description: "",
    price: 0,
    durationDays: 30,
    featuresText: "",
    isActive: true,
    displayOrder: 0,
    courseIds: [] as string[],
  });

  useEffect(() => {
    fetchSubs();
    fetchPlans();
    fetchCourses();
  }, []);

  useEffect(() => {
    if (!showGrant || selectedGrantUser) {
      setUserSuggestions([]);
      setSearchingUsers(false);
      return;
    }

    const query = grantUserSearch.trim();
    if (query.length < 2) {
      setUserSuggestions([]);
      setSearchingUsers(false);
      return;
    }

    let cancelled = false;
    const timer = window.setTimeout(async () => {
      setSearchingUsers(true);
      try {
        const res = await api.get(`/admin/users?search=${encodeURIComponent(query)}&limit=8`);
        if (!cancelled) setUserSuggestions(res.data.users || []);
      } catch {
        if (!cancelled) setUserSuggestions([]);
      } finally {
        if (!cancelled) setSearchingUsers(false);
      }
    }, 250);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [grantUserSearch, selectedGrantUser, showGrant]);

  async function fetchSubs() {
    try {
      const res = await api.get("/admin/subscriptions");
      setSubs(res.data.subscriptions);
    } catch { toast.error("Failed to load"); }
    setLoading(false);
  }

  async function fetchPlans() {
    try {
      const res = await api.get("/admin/subscription-plans");
      setPlans(res.data);
      if (res.data?.[0]) {
        setGrantPlan(res.data[0].code);
        setGrantDays(res.data[0].durationDays || 30);
      }
    } catch { toast.error("Failed to load plans"); }
  }

  async function fetchCourses() {
    try {
      const res = await api.get("/courses");
      setCourses(res.data);
    } catch { toast.error("Failed to load courses"); }
  }

  async function grantSub() {
    try {
      if (!selectedGrantUser) {
        toast.error("Select a user from suggestions");
        return;
      }

      await api.post("/admin/subscriptions", { userId: selectedGrantUser.id, planCode: grantPlan, days: grantDays });
      toast.success("Subscription granted!");
      resetGrantForm();
      fetchSubs();
    } catch { toast.error("Failed to grant"); }
  }

  function resetGrantForm() {
    setShowGrant(false);
    setGrantUserSearch("");
    setSelectedGrantUser(null);
    setUserSuggestions([]);
    setSearchingUsers(false);
  }

  function resetPlanForm() {
    setShowPlanForm(false);
    setEditingPlan(null);
    setPlanForm({ code: "", name: "", description: "", price: 0, durationDays: 30, featuresText: "", isActive: true, displayOrder: 0, courseIds: [] });
  }

  function openPlanForm(plan?: PlanItem) {
    if (plan) {
      setEditingPlan(plan);
      setPlanForm({
        code: plan.code,
        name: plan.name,
        description: plan.description || "",
        price: plan.price,
        durationDays: plan.durationDays,
        featuresText: plan.features.join("\n"),
        isActive: plan.isActive,
        displayOrder: plan.displayOrder,
        courseIds: plan.courseIds || [],
      });
    } else {
      resetPlanForm();
      setShowPlanForm(true);
      return;
    }
    setShowPlanForm(true);
  }

  async function savePlan() {
    try {
      const payload = {
        code: planForm.code,
        name: planForm.name,
        description: planForm.description,
        price: planForm.price,
        durationDays: planForm.durationDays,
        features: planForm.featuresText.split("\n").map((line) => line.trim()).filter(Boolean),
        isActive: planForm.isActive,
        displayOrder: planForm.displayOrder,
        courseIds: planForm.courseIds,
      };
      if (editingPlan) {
        await api.put(`/admin/subscription-plans/${editingPlan.id}`, payload);
        toast.success("Plan updated");
      } else {
        await api.post("/admin/subscription-plans", payload);
        toast.success("Plan created");
      }
      resetPlanForm();
      fetchPlans();
    } catch { toast.error("Failed to save plan"); }
  }

  async function deletePlan(id: string) {
    if (!confirm("Delete this subscription plan?")) return;
    try {
      await api.delete(`/admin/subscription-plans/${id}`);
      toast.success("Plan deleted");
      fetchPlans();
    } catch { toast.error("Failed to delete plan"); }
  }

  function togglePlanCourse(courseId: string) {
    setPlanForm((form) => ({
      ...form,
      courseIds: form.courseIds.includes(courseId)
        ? form.courseIds.filter((id) => id !== courseId)
        : [...form.courseIds, courseId],
    }));
  }

  async function cancelSub(id: string) {
    if (!confirm("Cancel this subscription?")) return;
    try {
      await api.delete(`/admin/subscriptions/${id}`);
      toast.success("Cancelled");
      fetchSubs();
    } catch { toast.error("Failed to cancel"); }
  }

  const statusColors: Record<string, string> = {
    ACTIVE: "bg-success/10 text-success",
    EXPIRED: "bg-energy/10 text-energy",
    CANCELLED: "bg-danger/10 text-danger",
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-text-bright">Subscriptions</h1>
          <p className="text-text-muted text-sm mt-1">{subs.length} total</p>
        </div>
        <Button onClick={() => setShowGrant(true)}>
          <Plus className="w-4 h-4 mr-2" /> Grant Subscription
        </Button>
      </div>

      {/* Plan Management */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-text-bright">Course Plans</h2>
            <p className="text-text-muted text-sm">Control pricing and which courses each plan unlocks</p>
          </div>
          <Button variant="outline" onClick={() => openPlanForm()}>
            <Plus className="w-4 h-4 mr-2" /> Add Plan
          </Button>
        </div>

        <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-4">
          {plans.map((plan) => (
            <div key={plan.id} className="rounded-2xl border border-border bg-card p-5">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                  <p className="text-xs font-semibold text-accent">{plan.code}</p>
                  <h3 className="text-text-bright font-bold">{plan.name}</h3>
                </div>
                <span className={`text-[10px] px-2 py-1 rounded-full font-semibold ${plan.isActive ? "bg-success/10 text-success" : "bg-danger/10 text-danger"}`}>
                  {plan.isActive ? "ACTIVE" : "OFF"}
                </span>
              </div>
              <p className="text-2xl font-black text-text-bright mb-2">&#8377;{plan.price}</p>
              <p className="text-xs text-text-muted mb-3">{plan.durationDays} days access</p>
              <div className="flex flex-wrap gap-1.5 mb-4">
                {plan.assignedCourses.length === 0 ? (
                  <span className="text-xs text-text-muted">No courses assigned</span>
                ) : plan.assignedCourses.map((course) => (
                  <span key={course.id} className="text-[10px] px-2 py-1 rounded-full bg-surface-light text-text-muted">{course.name}</span>
                ))}
              </div>
              <div className="flex gap-2">
                <button onClick={() => openPlanForm(plan)} className="flex-1 rounded-xl border border-border px-3 py-2 text-xs font-semibold text-text-muted hover:text-accent hover:border-accent/30 transition-colors">
                  <Edit2 className="w-3.5 h-3.5 inline mr-1" /> Edit
                </button>
                <button onClick={() => deletePlan(plan.id)} className="rounded-xl border border-border px-3 py-2 text-danger hover:bg-danger/10 transition-colors">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Plan Modal */}
      {showPlanForm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-text-bright">{editingPlan ? "Edit Course Plan" : "New Course Plan"}</h2>
              <button onClick={resetPlanForm}><X className="w-5 h-5 text-text-muted" /></button>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div><label className="block text-sm text-text-muted mb-1">Code</label><Input value={planForm.code} onChange={(e) => setPlanForm({ ...planForm, code: e.target.value.toUpperCase() })} placeholder="BASIC" /></div>
              <div><label className="block text-sm text-text-muted mb-1">Name</label><Input value={planForm.name} onChange={(e) => setPlanForm({ ...planForm, name: e.target.value })} placeholder="Basic Course" /></div>
              <div><label className="block text-sm text-text-muted mb-1">Price</label><Input type="number" value={planForm.price} onChange={(e) => setPlanForm({ ...planForm, price: parseInt(e.target.value) || 0 })} /></div>
              <div><label className="block text-sm text-text-muted mb-1">Duration Days</label><Input type="number" value={planForm.durationDays} onChange={(e) => setPlanForm({ ...planForm, durationDays: parseInt(e.target.value) || 30 })} /></div>
              <div><label className="block text-sm text-text-muted mb-1">Display Order</label><Input type="number" value={planForm.displayOrder} onChange={(e) => setPlanForm({ ...planForm, displayOrder: parseInt(e.target.value) || 0 })} /></div>
              <label className="flex items-end gap-2 pb-3 cursor-pointer">
                <input type="checkbox" checked={planForm.isActive} onChange={(e) => setPlanForm({ ...planForm, isActive: e.target.checked })} className="w-4 h-4 accent-accent" />
                <span className="text-sm text-text-muted">Active plan</span>
              </label>
              <div className="sm:col-span-2"><label className="block text-sm text-text-muted mb-1">Description</label><Input value={planForm.description} onChange={(e) => setPlanForm({ ...planForm, description: e.target.value })} placeholder="Short plan description" /></div>
              <div className="sm:col-span-2">
                <label className="block text-sm text-text-muted mb-1">Features</label>
                <textarea value={planForm.featuresText} onChange={(e) => setPlanForm({ ...planForm, featuresText: e.target.value })} rows={4} className="w-full px-4 py-3 rounded-xl bg-surface border border-border text-text focus:border-accent focus:outline-none" placeholder="One feature per line" />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm text-text-muted mb-2">Courses This Plan Unlocks</label>
                <div className="grid sm:grid-cols-2 gap-2">
                  {courses.map((course) => (
                    <label key={course.id} className="flex items-center gap-2 rounded-xl border border-border bg-surface px-3 py-2 cursor-pointer">
                      <input type="checkbox" checked={planForm.courseIds.includes(course.id)} onChange={() => togglePlanCourse(course.id)} className="w-4 h-4 accent-accent" />
                      <span className="text-sm text-text-bright">{course.name}</span>
                      <span className="ml-auto text-[10px] text-text-muted">{course.tier}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <Button onClick={savePlan} className="flex-1"><Save className="w-4 h-4 mr-2" />Save Plan</Button>
              <Button variant="ghost" onClick={resetPlanForm} className="flex-1">Cancel</Button>
            </div>
          </div>
        </div>
      )}

      {/* Grant Modal */}
      {showGrant && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-text-bright">Grant Subscription</h2>
              <button onClick={resetGrantForm}><X className="w-5 h-5 text-text-muted" /></button>
            </div>
            <div className="space-y-4">
              <div className="relative">
                <label className="block text-sm text-text-muted mb-1">Search User</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                  <Input
                    value={grantUserSearch}
                    onChange={(e) => {
                      setGrantUserSearch(e.target.value);
                      setSelectedGrantUser(null);
                    }}
                    placeholder="Type name or email"
                    className="pl-10 pr-10"
                  />
                  {selectedGrantUser && <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-success" />}
                </div>
                {(searchingUsers || userSuggestions.length > 0 || grantUserSearch.trim().length >= 2) && !selectedGrantUser && (
                  <div className="absolute left-0 right-0 top-full mt-2 max-h-64 overflow-y-auto rounded-xl border border-border bg-surface shadow-2xl z-20">
                    {searchingUsers ? (
                      <div className="px-4 py-3 text-sm text-text-muted">Searching users...</div>
                    ) : userSuggestions.length === 0 ? (
                      <div className="px-4 py-3 text-sm text-text-muted">No matching user found</div>
                    ) : userSuggestions.map((user) => (
                      <button
                        key={user.id}
                        type="button"
                        onClick={() => {
                          setSelectedGrantUser(user);
                          setGrantUserSearch(`${user.name} - ${user.email}`);
                          setUserSuggestions([]);
                        }}
                        className="w-full px-4 py-3 text-left hover:bg-card transition-colors border-b border-border last:border-b-0"
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center shrink-0">
                            <UserRound className="w-4 h-4 text-accent" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-text-bright truncate">{user.name}</p>
                            <p className="text-xs text-text-muted truncate">{user.email}</p>
                            {user.subscription && (
                              <p className="text-[10px] text-text-muted mt-1">{user.subscription.plan} - {user.subscription.status}</p>
                            )}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm text-text-muted mb-1">Plan</label>
                <select value={grantPlan} onChange={(e) => {
                  const plan = plans.find((item) => item.code === e.target.value);
                  setGrantPlan(e.target.value);
                  if (plan) setGrantDays(plan.durationDays);
                }}
                  className="w-full px-4 py-3 rounded-xl bg-surface border border-border text-text focus:border-accent focus:outline-none">
                  {plans.filter((plan) => plan.isActive).map((plan) => (
                    <option key={plan.id} value={plan.code}>{plan.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-text-muted mb-1">Days</label>
                <Input type="number" value={grantDays} onChange={(e) => setGrantDays(parseInt(e.target.value) || 30)} />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <Button onClick={grantSub} className="flex-1">Grant</Button>
              <Button variant="ghost" onClick={resetGrantForm} className="flex-1">Cancel</Button>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-surface-light/50">
              <th className="text-left px-6 py-3 text-xs font-semibold text-text-muted uppercase">User</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-text-muted uppercase">Plan</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-text-muted uppercase">Status</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-text-muted uppercase">Expiry</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-text-muted uppercase">Amount</th>
              <th className="text-right px-6 py-3 text-xs font-semibold text-text-muted uppercase">Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              [...Array(3)].map((_, i) => (
                <tr key={i} className="border-b border-border">
                  <td colSpan={6} className="px-6 py-4"><div className="h-4 bg-surface-light rounded animate-pulse" /></td>
                </tr>
              ))
            ) : subs.length === 0 ? (
              <tr><td colSpan={6} className="px-6 py-12 text-center text-text-muted">
                <CreditCard className="w-8 h-8 mx-auto mb-2 opacity-50" /> No subscriptions yet
              </td></tr>
            ) : (
              subs.map((sub) => (
                <tr key={sub.id} className="border-b border-border hover:bg-surface-light/30 transition-colors">
                  <td className="px-6 py-4">
                    <p className="text-sm text-text-bright font-medium">{sub.user.name}</p>
                    <p className="text-xs text-text-muted">{sub.user.email}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-text-bright font-medium">{sub.planDetails?.name || sub.plan}</p>
                    <p className="text-xs text-text-muted">{sub.plan}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-xs px-2 py-1 rounded-full font-semibold ${statusColors[sub.status] || ""}`}>{sub.status}</span>
                  </td>
                  <td className="px-6 py-4 text-sm text-text-muted">{new Date(sub.expiryDate).toLocaleDateString()}</td>
                  <td className="px-6 py-4 text-sm text-text-bright">&#8377;{sub.amount}</td>
                  <td className="px-6 py-4 text-right">
                    {sub.status === "ACTIVE" && (
                      <button onClick={() => cancelSub(sub.id)} className="text-xs px-3 py-1.5 rounded-lg font-medium bg-danger/10 text-danger hover:bg-danger/20 transition-colors">
                        Cancel
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
