"use client";
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { PageLoader } from "@/components/ui/loading";
import api from "@/lib/api";
import toast from "react-hot-toast";
import { Radio } from "lucide-react";

export default function FeatureSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [liveClassesEnabled, setLiveClassesEnabled] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get("/admin/settings").then(({ data }) => {
      setLiveClassesEnabled(data.data.liveClassesEnabled ?? true);
    }).finally(() => setLoading(false));
  }, []);

  const toggleLiveClasses = async () => {
    setSaving(true);
    const newValue = !liveClassesEnabled;
    try {
      await api.put("/admin/settings/features", { liveClassesEnabled: newValue });
      setLiveClassesEnabled(newValue);
      toast.success(`Live Classes ${newValue ? "enabled" : "disabled"}`);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to update");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <PageLoader />;

  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">Feature Settings</h1>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center shrink-0">
                <Radio className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-base">Live Classes</h3>
                <p className="text-sm text-gray-500">
                  {liveClassesEnabled
                    ? "Live Classes card is visible and accessible to students"
                    : "Live Classes card shows as \"Coming Soon\" and is not clickable"}
                </p>
              </div>
            </div>
            <button
              onClick={toggleLiveClasses}
              disabled={saving}
              className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${
                liveClassesEnabled ? "bg-green-500" : "bg-gray-300"
              } ${saving ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
            >
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
                  liveClassesEnabled ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
