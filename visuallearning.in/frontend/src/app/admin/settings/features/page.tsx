"use client";
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { PageLoader } from "@/components/ui/loading";
import api from "@/lib/api";
import toast from "react-hot-toast";
import { Radio, BookOpen } from "lucide-react";

interface SubjectAccess {
  id: string;
  name: string;
  icon?: string;
  enabled: boolean;
}

interface ClassWithSubjects {
  id: string;
  name: string;
  subjects: SubjectAccess[];
}

export default function FeatureSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [liveClassesEnabled, setLiveClassesEnabled] = useState(true);
  const [saving, setSaving] = useState(false);
  const [classes, setClasses] = useState<ClassWithSubjects[]>([]);
  const [togglingSubject, setTogglingSubject] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      api.get("/admin/settings").then(({ data }) => {
        setLiveClassesEnabled(data.data.liveClassesEnabled ?? true);
      }),
      api.get("/admin/subjects/access").then(({ data }) => {
        setClasses(data.data);
      }),
    ]).finally(() => setLoading(false));
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

  const toggleSubject = async (subjectId: string) => {
    setTogglingSubject(subjectId);
    try {
      const { data } = await api.patch(`/admin/subjects/${subjectId}/toggle-access`);
      const updated = data.data;
      setClasses((prev) =>
        prev.map((cls) => ({
          ...cls,
          subjects: cls.subjects.map((s) =>
            s.id === subjectId ? { ...s, enabled: updated.enabled } : s
          ),
        }))
      );
      toast.success(data.message);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to toggle subject");
    } finally {
      setTogglingSubject(null);
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

      {/* Subject Access Control */}
      <h2 className="text-xl font-bold mt-10 mb-4 flex items-center gap-2">
        <BookOpen className="w-5 h-5" />
        Subject Access Control
      </h2>
      <p className="text-sm text-gray-500 mb-4">
        Toggle subjects on/off per class. Disabled subjects show as &quot;Coming Soon&quot; and are not accessible to students.
      </p>

      <div className="space-y-4">
        {classes.map((cls) => (
          <Card key={cls.id}>
            <CardContent className="p-6">
              <h3 className="font-semibold text-base mb-4">{cls.name}</h3>
              <div className="space-y-3">
                {cls.subjects.map((subject) => {
                  const isToggling = togglingSubject === subject.id;
                  return (
                    <div
                      key={subject.id}
                      className="flex items-center justify-between py-2 px-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                    >
                      <div>
                        <span className="font-medium text-sm">{subject.name}</span>
                        <span className={`ml-2 text-xs px-2 py-0.5 rounded-full ${
                          subject.enabled
                            ? "bg-green-100 text-green-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}>
                          {subject.enabled ? "Active" : "Coming Soon"}
                        </span>
                      </div>
                      <button
                        onClick={() => toggleSubject(subject.id)}
                        disabled={isToggling}
                        className={`relative inline-flex h-6 w-10 items-center rounded-full transition-colors ${
                          subject.enabled ? "bg-green-500" : "bg-gray-300"
                        } ${isToggling ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                            subject.enabled ? "translate-x-5" : "translate-x-1"
                          }`}
                        />
                      </button>
                    </div>
                  );
                })}
                {cls.subjects.length === 0 && (
                  <p className="text-sm text-gray-400 italic">No subjects added yet</p>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
