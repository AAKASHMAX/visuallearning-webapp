"use client";
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageLoader } from "@/components/ui/loading";
import api from "@/lib/api";
import toast from "react-hot-toast";
import { MapPin, Save } from "lucide-react";

interface ContactInfo {
  companyName: string;
  address: string;
  phone: string;
  email: string;
}

export default function ContactSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [contactInfo, setContactInfo] = useState<ContactInfo>({
    companyName: "",
    address: "",
    phone: "",
    email: "",
  });

  useEffect(() => {
    api.get("/admin/settings").then(({ data }) => {
      if (data.data.contactInfo) {
        setContactInfo(data.data.contactInfo);
      }
    }).finally(() => setLoading(false));
  }, []);

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
      <h1 className="text-2xl font-bold mb-6">Contact Us Settings</h1>

      <Card>
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
