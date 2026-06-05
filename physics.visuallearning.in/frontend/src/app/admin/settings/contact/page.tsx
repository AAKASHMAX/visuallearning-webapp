"use client";

import { useEffect, useState } from "react";
import { MapPin, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import api from "@/lib/api";
import toast from "react-hot-toast";

export default function ContactSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");

  useEffect(() => {
    api
      .get("/admin/settings")
      .then((res) => {
        const c = res.data?.contact_info;
        if (c) {
          setEmail(c.email || "");
          setPhone(c.phone || "");
          setAddress(c.address || "");
        }
      })
      .catch(() => toast.error("Failed to load contact info"))
      .finally(() => setLoading(false));
  }, []);

  async function save() {
    setSaving(true);
    try {
      await api.put("/admin/settings", { key: "contact_info", value: { email, phone, address } });
      toast.success("Contact info saved");
    } catch {
      toast.error("Failed to save");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <div className="h-64 rounded-2xl bg-card animate-pulse max-w-2xl" />;
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-text-bright">Contact Us</h1>
        <p className="text-text-muted text-sm mt-1">Support details shown across the site and footer.</p>
      </div>

      <div className="rounded-2xl border border-border bg-card p-6">
        <h3 className="font-semibold text-text-bright mb-4 flex items-center gap-2">
          <MapPin className="w-4 h-4 text-accent" /> Contact Information
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-text-muted mb-1">Support Email</label>
            <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="support@example.com" />
          </div>
          <div>
            <label className="block text-sm text-text-muted mb-1">Phone</label>
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91..." />
          </div>
          <div>
            <label className="block text-sm text-text-muted mb-1">Address</label>
            <Input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="City, State" />
          </div>
          <Button size="sm" onClick={save} disabled={saving}>
            <Save className="w-4 h-4 mr-2" /> {saving ? "Saving..." : "Save Contact"}
          </Button>
        </div>
      </div>
    </div>
  );
}
