"use client";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageLoader } from "@/components/ui/loading";
import { Megaphone } from "lucide-react";
import api from "@/lib/api";
import toast from "react-hot-toast";

type Announcement = {
  enabled: boolean;
  title: string;
  subtitle: string;
  ctaText: string;
  ctaUrl: string;
  bgColor: string;
  bgColor2: string;
};

const DEFAULT: Announcement = {
  enabled: false, title: "", subtitle: "", ctaText: "", ctaUrl: "",
  bgColor: "#062a4d", bgColor2: "#0b5a53",
};

export default function AnnouncementSettingsPage() {
  const [a, setA] = useState<Announcement>(DEFAULT);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get("/admin/public-settings")
      .then(({ data }) => { if (data.data?.announcement) setA({ ...DEFAULT, ...data.data.announcement }); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const save = async () => {
    setSaving(true);
    try {
      await api.put("/admin/settings/announcement", { announcement: a });
      toast.success("Announcement saved");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to save");
    } finally { setSaving(false); }
  };

  const set = (k: keyof Announcement, v: any) => setA((p) => ({ ...p, [k]: v }));

  if (loading) return <PageLoader />;

  return (
    <div className="max-w-3xl">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center"><Megaphone className="w-5 h-5 text-primary" /></div>
        <div>
          <h1 className="text-2xl font-bold">Home Announcement</h1>
          <p className="text-sm text-gray-500">Shows as a banner above the class cards on the app & web. Use it for offers (e.g. the 3-day trial).</p>
        </div>
      </div>

      {/* Live preview */}
      <div className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-2">Preview</p>
        <div className="rounded-2xl p-5 text-white shadow-lg" style={{ background: `linear-gradient(135deg, ${a.bgColor}, ${a.bgColor2})` }}>
          <h3 className="text-xl font-black">{a.title || "Your announcement title"}</h3>
          {a.subtitle && <p className="mt-1 text-sm text-white/80">{a.subtitle}</p>}
          {a.ctaText && <span className="mt-3 inline-block rounded-lg bg-white/90 px-4 py-2 text-sm font-bold text-gray-900">{a.ctaText}</span>}
        </div>
        {!a.enabled && <p className="mt-2 text-xs text-amber-600">Currently hidden — turn on “Show announcement” to display it.</p>}
      </div>

      <Card>
        <CardHeader><h2 className="font-semibold">Content</h2></CardHeader>
        <CardContent className="space-y-4">
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={a.enabled} onChange={(e) => set("enabled", e.target.checked)} className="w-5 h-5 accent-primary" />
            <span className="text-sm font-semibold">Show announcement</span>
          </label>
          <Input label="Title" value={a.title} onChange={(e) => set("title", e.target.value)} placeholder="🎉 3-Day Free Trial" />
          <Input label="Subtitle" value={a.subtitle} onChange={(e) => set("subtitle", e.target.value)} placeholder="Full access for just ₹1 — cancel anytime" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Button text (optional)" value={a.ctaText} onChange={(e) => set("ctaText", e.target.value)} placeholder="Start Trial" />
            <Input label="Button link (optional)" value={a.ctaUrl} onChange={(e) => set("ctaUrl", e.target.value)} placeholder="https://visuallearning.in/pricing" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Background color</label>
              <input type="color" value={a.bgColor} onChange={(e) => set("bgColor", e.target.value)} className="h-10 w-full rounded-lg border border-gray-200" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Gradient color</label>
              <input type="color" value={a.bgColor2} onChange={(e) => set("bgColor2", e.target.value)} className="h-10 w-full rounded-lg border border-gray-200" />
            </div>
          </div>
          <div className="flex justify-end">
            <Button onClick={save} disabled={saving}>{saving ? "Saving..." : "Save"}</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
