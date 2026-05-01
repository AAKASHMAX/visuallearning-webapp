"use client";
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { PageLoader } from "@/components/ui/loading";
import api from "@/lib/api";
import toast from "react-hot-toast";
import { UserPlus, Trash2, Video } from "lucide-react";

interface Teacher {
  id: string;
  name: string;
  email: string;
  blocked: boolean;
  createdAt: string;
  _count: { liveClasses: number };
}

export default function TeachersPage() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [submitting, setSubmitting] = useState(false);

  const load = () => {
    setLoading(true);
    api.get("/live-classes/teachers").then(({ data }) => setTeachers(data.data)).finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.password.trim()) {
      return toast.error("All fields are required");
    }
    setSubmitting(true);
    try {
      const { data } = await api.post("/live-classes/teachers", form);
      toast.success(data.message);
      setShowForm(false);
      setForm({ name: "", email: "", password: "" });
      load();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to add teacher");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemove = async (id: string, name: string) => {
    if (!confirm(`Remove ${name} as teacher? They will be demoted to student.`)) return;
    try {
      await api.delete(`/live-classes/teachers/${id}`);
      toast.success("Teacher removed");
      load();
    } catch {
      toast.error("Failed to remove teacher");
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Teacher Management</h1>
        <Button onClick={() => setShowForm(!showForm)}>
          <UserPlus className="w-4 h-4 mr-2" /> Add Teacher
        </Button>
      </div>

      {showForm && (
        <Card className="mb-6">
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold mb-4">Add New Teacher</h2>
            <form onSubmit={handleAdd} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Input placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              <Input placeholder="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              <Input placeholder="Password" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
              <div className="sm:col-span-3 flex gap-2">
                <Button type="submit" disabled={submitting}>{submitting ? "Adding..." : "Add Teacher"}</Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
              </div>
            </form>
            <p className="text-xs text-gray-400 mt-3">
              If a user with this email already exists, they will be promoted to teacher role.
            </p>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <PageLoader />
      ) : teachers.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center text-gray-500">
            <p className="text-lg font-medium mb-2">No teachers added yet</p>
            <p className="text-sm">Add a teacher to let them manage live classes.</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left bg-gray-50">
                  <th className="p-4">Name</th>
                  <th className="p-4">Email</th>
                  <th className="p-4">Live Classes</th>
                  <th className="p-4">Joined</th>
                  <th className="p-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {teachers.map((t) => (
                  <tr key={t.id} className="border-b last:border-0">
                    <td className="p-4 font-medium">{t.name}</td>
                    <td className="p-4 text-gray-500">{t.email}</td>
                    <td className="p-4">
                      <Badge variant="default" className="flex items-center gap-1 w-fit">
                        <Video className="w-3 h-3" /> {t._count.liveClasses}
                      </Badge>
                    </td>
                    <td className="p-4 text-gray-400 text-xs">{new Date(t.createdAt).toLocaleDateString("en-IN")}</td>
                    <td className="p-4">
                      <Button variant="destructive" size="sm" onClick={() => handleRemove(t.id, t.name)}>
                        <Trash2 className="w-3 h-3 mr-1" /> Remove
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
