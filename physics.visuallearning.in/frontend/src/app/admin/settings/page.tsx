"use client";

import { useEffect, useState } from "react";
import { Settings, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import api from "@/lib/api";
import toast from "react-hot-toast";

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);

  // Contact info
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");

  // Plan prices
  const [basicYearlyPrice, setBasicYearlyPrice] = useState(2499);
  const [advanceYearlyPrice, setAdvanceYearlyPrice] = useState(3999);

  useEffect(() => {
    api.get("/admin/settings").then((res) => {
      setSettings(res.data);
      if (res.data.contact_info) {
        setEmail(res.data.contact_info.email || "");
        setPhone(res.data.contact_info.phone || "");
        setAddress(res.data.contact_info.address || "");
      }
      if (res.data.plans_config) {
        const plans = res.data.plans_config;
        if (plans.BASIC_YEARLY) setBasicYearlyPrice(plans.BASIC_YEARLY?.price || 2499);
        if (plans.ADVANCE_YEARLY) setAdvanceYearlyPrice(plans.ADVANCE_YEARLY?.price || 3999);
      }
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  async function saveContact() {
    try {
      await api.put("/admin/settings", { key: "contact_info", value: { email, phone, address } });
      toast.success("Contact info saved!");
    } catch { toast.error("Failed to save"); }
  }

  async function savePlans() {
    try {
      await api.put("/admin/settings", {
        key: "plans_config",
        value: {
          BASIC_YEARLY: { name: "Basic Yearly", price: basicYearlyPrice, duration: 365, features: ["All Basic features", "1 year access", "Save 30%"] },
          ADVANCE_YEARLY: { name: "Advance Yearly", price: advanceYearlyPrice, duration: 365, features: ["All Advance features", "1 year access", "Save 33%"] },
        },
      });
      toast.success("Plans saved!");
    } catch { toast.error("Failed to save"); }
  }

  if (loading) {
    return <div className="space-y-6">{[...Array(3)].map((_, i) => <div key={i} className="h-40 rounded-xl bg-card animate-pulse" />)}</div>;
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-text-bright">Settings</h1>
        <p className="text-text-muted text-sm mt-1">Configure PhysicsLab</p>
      </div>

      <div className="space-y-8 max-w-2xl">
        {/* Contact Info */}
        <div className="rounded-2xl border border-border bg-card p-6">
          <h3 className="font-semibold text-text-bright mb-4 flex items-center gap-2">
            <Settings className="w-4 h-4 text-accent" />
            Contact Information
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
            <Button onClick={saveContact} size="sm">
              <Save className="w-4 h-4 mr-2" /> Save Contact
            </Button>
          </div>
        </div>

        {/* Plan Pricing */}
        <div className="rounded-2xl border border-border bg-card p-6">
          <h3 className="font-semibold text-text-bright mb-4 flex items-center gap-2">
            <Settings className="w-4 h-4 text-secondary-light" />
            Plan Pricing (in Rupees)
          </h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-text-muted mb-1">Basic Yearly</label>
              <Input type="number" value={basicYearlyPrice} onChange={(e) => setBasicYearlyPrice(parseInt(e.target.value) || 0)} />
            </div>
            <div>
              <label className="block text-sm text-text-muted mb-1">Advance Yearly</label>
              <Input type="number" value={advanceYearlyPrice} onChange={(e) => setAdvanceYearlyPrice(parseInt(e.target.value) || 0)} />
            </div>
          </div>
          <Button onClick={savePlans} size="sm" className="mt-4">
            <Save className="w-4 h-4 mr-2" /> Save Plans
          </Button>
        </div>
      </div>
    </div>
  );
}
