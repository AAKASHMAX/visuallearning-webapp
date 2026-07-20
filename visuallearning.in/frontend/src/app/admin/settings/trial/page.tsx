"use client";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageLoader } from "@/components/ui/loading";
import { Gift } from "lucide-react";
import api from "@/lib/api";
import toast from "react-hot-toast";

type Trial = { enabled: boolean; label: string; durationDays: number };

const DEFAULT: Trial = { enabled: true, label: "3-Day Free Trial", durationDays: 3 };

export default function TrialSettingsPage() {
  const [t, setT] = useState<Trial>(DEFAULT);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get("/admin/public-settings")
      .then(({ data }) => { if (data.data?.trial) setT({ ...DEFAULT, ...data.data.trial }); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const save = async () => {
    setSaving(true);
    try {
      await api.put("/admin/settings/trial", { trial: t });
      toast.success("Trial plan saved");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to save");
    } finally { setSaving(false); }
  };

  const set = (k: keyof Trial, v: any) => setT((p) => ({ ...p, [k]: v }));

  if (loading) return <PageLoader />;

  return (
    <div className="max-w-3xl">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center"><Gift className="w-5 h-5 text-primary" /></div>
        <div>
          <h1 className="text-2xl font-bold">Free Trial Plan</h1>
          <p className="text-sm text-gray-500">Controls the trial everywhere — website, mobile app and the locked-content popup.</p>
        </div>
      </div>

      {/* Live preview */}
      <div className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-2">Preview</p>
        <div className="rounded-2xl border-2 border-primary/30 bg-primary/5 p-5">
          <h3 className="text-xl font-black">{t.label || "Free Trial"}</h3>
          <p className="mt-1 text-sm text-gray-600">
            Full access to every class for <b>{t.durationDays} day{t.durationDays === 1 ? "" : "s"}</b> — activated in one click, no payment required.
          </p>
          <p className="mt-1 text-xs text-gray-500">Document downloads are not included. One trial per account.</p>
        </div>
        {!t.enabled && <p className="mt-2 text-xs text-amber-600">Currently hidden — turn on “Offer the free trial” to show it.</p>}
      </div>

      <Card>
        <CardHeader><h2 className="font-semibold">Settings</h2></CardHeader>
        <CardContent className="space-y-4">
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={t.enabled} onChange={(e) => set("enabled", e.target.checked)} className="w-5 h-5 accent-primary" />
            <span className="text-sm font-semibold">Offer the free trial</span>
          </label>
          <Input label="Plan name" value={t.label} onChange={(e) => set("label", e.target.value)} placeholder="3-Day Free Trial" />
          <div>
            <Input
              label="Duration (days)" type="number" min={1} max={90}
              value={String(t.durationDays)}
              onChange={(e) => set("durationDays", Number(e.target.value))}
            />
            <p className="mt-1 text-xs text-gray-500">Between 1 and 90 days. The trial is free — users are never sent to a payment page.</p>
          </div>
          <div className="flex justify-end">
            <Button onClick={save} disabled={saving}>{saving ? "Saving..." : "Save"}</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
