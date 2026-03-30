"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import api from "@/lib/api";
import toast from "react-hot-toast";
import { ArrowLeft } from "lucide-react";

export default function CreateLiveClassPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    scheduledAt: "",
    notifyTarget: "ALL" as "ALL" | "SUBSCRIBED",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) return toast.error("Title is required");

    setLoading(true);
    try {
      const payload: Record<string, string> = {
        title: form.title.trim(),
        notifyTarget: form.notifyTarget,
      };
      if (form.description.trim()) payload.description = form.description.trim();
      if (form.scheduledAt) payload.scheduledAt = new Date(form.scheduledAt).toISOString();

      await api.post("/live-classes", payload);
      toast.success("Live class created!");
      router.push("/admin/live-classes");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to create");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <button onClick={() => router.back()} className="text-sm text-primary flex items-center gap-1 mb-4 hover:underline">
        <ArrowLeft className="w-3 h-3" /> Back
      </button>
      <h1 className="text-2xl font-bold mb-6">Create Live Class</h1>

      <Card>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium mb-1.5">Title *</label>
              <Input
                placeholder="e.g., Physics Chapter 5 - Laws of Motion"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5">Description</label>
              <textarea
                className="w-full px-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
                rows={3}
                placeholder="Brief description of the class..."
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5">Schedule Date & Time (optional)</label>
              <Input
                type="datetime-local"
                value={form.scheduledAt}
                onChange={(e) => setForm({ ...form, scheduledAt: e.target.value })}
              />
              <p className="text-xs text-gray-400 mt-1">Leave empty to create as draft. Setting a date will send schedule notifications.</p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5">Send Notification To</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" checked={form.notifyTarget === "ALL"} onChange={() => setForm({ ...form, notifyTarget: "ALL" })} className="accent-primary" />
                  <span className="text-sm">All Users</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" checked={form.notifyTarget === "SUBSCRIBED"} onChange={() => setForm({ ...form, notifyTarget: "SUBSCRIBED" })} className="accent-primary" />
                  <span className="text-sm">Subscribed Users Only</span>
                </label>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <Button type="submit" disabled={loading}>{loading ? "Creating..." : "Create Live Class"}</Button>
              <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
