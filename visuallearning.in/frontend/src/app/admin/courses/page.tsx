"use client";
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageLoader } from "@/components/ui/loading";
import api from "@/lib/api";
import toast from "react-hot-toast";
import { Plus, Pencil, Trash2, X, Library, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<any>({});
  const [editing, setEditing] = useState<string | null>(null);

  useEffect(() => { loadCourses(); }, []);

  const loadCourses = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/admin/courses");
      setCourses(data.data);
    } catch { toast.error("Failed to fetch courses"); }
    setLoading(false);
  };

  const handleSave = async () => {
    try {
      const payload = {
        name: formData.name,
        slug: formData.slug || formData.name?.toLowerCase().replace(/\s+/g, "-"),
        description: formData.description,
        accentColor: formData.accentColor,
        icon: formData.icon,
        planKey: formData.planKey || null,
      };

      if (editing) {
        await api.put(`/admin/courses/${editing}`, payload);
        toast.success("Course updated");
      } else {
        await api.post("/admin/courses", payload);
        toast.success("Course created");
      }
      setShowForm(false);
      setFormData({});
      setEditing(null);
      loadCourses();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to save");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure? This will not delete chapters, only the course link.")) return;
    try {
      await api.delete(`/admin/courses/${id}`);
      toast.success("Deleted");
      loadCourses();
    } catch { toast.error("Failed to delete"); }
  };

  const startEdit = (e: React.MouseEvent, course: any) => {
    e.preventDefault();
    e.stopPropagation();
    setEditing(course.id);
    setFormData(course);
    setShowForm(true);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Library className="w-6 h-6 text-primary" />
          Course Management
        </h1>
        <Button onClick={() => { setShowForm(!showForm); setEditing(null); setFormData({}); }}>
          {showForm ? <><X className="w-4 h-4 mr-1" />Cancel</> : <><Plus className="w-4 h-4 mr-1" />Create New Course</>}
        </Button>
      </div>

      {showForm && (
        <Card className="mb-8 border-2 border-primary/20 shadow-lg">
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold mb-4">{editing ? "Edit Course" : "New Course"}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input 
                label="Course Name" 
                value={formData.name || ""} 
                onChange={(e) => setFormData({ ...formData, name: e.target.value })} 
                placeholder="e.g. Elite Learning (Physics)" 
              />
              <Input 
                label="Slug (URL identifier)" 
                value={formData.slug || ""} 
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })} 
                placeholder="e.g. elite-physics" 
              />
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={formData.description || ""}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 text-sm min-h-[80px]"
                  placeholder="What is this course about?"
                />
              </div>
              <Input 
                label="Accent Color (Tailwind hex or class)" 
                value={formData.accentColor || ""} 
                onChange={(e) => setFormData({ ...formData, accentColor: e.target.value })} 
                placeholder="e.g. #3b82f6" 
              />
              <Input
                label="Icon Key"
                value={formData.icon || ""}
                onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                placeholder="e.g. Crown, Atom, GraduationCap"
              />
              <Input
                label="Plan Key"
                value={formData.planKey || ""}
                onChange={(e) => setFormData({ ...formData, planKey: e.target.value.toUpperCase().replace(/[^A-Z0-9_]/g, "") })}
                placeholder="e.g. ELITE_LEARNING"
              />
            </div>
            <div className="mt-6 flex justify-end">
              <Button onClick={handleSave} className="px-8">{editing ? "Save Changes" : "Create Course"}</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {loading ? <PageLoader /> : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <Link key={course.id} href={`/admin/courses/${course.id}`}>
              <Card className="hover:shadow-xl transition-all group cursor-pointer border-t-4" style={{ borderTopColor: course.accentColor || '#3b82f6' }}>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="bg-primary/10 p-3 rounded-2xl">
                      <Library className="w-6 h-6 text-primary" />
                    </div>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="sm" onClick={(e) => startEdit(e, course)} className="h-8 w-8 p-0">
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleDelete(course.id); }} className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-50">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">{course.name}</h3>
                  <p className="text-sm text-gray-500 mb-4 line-clamp-2 h-10">{course.description || "No description provided."}</p>
                  
                  <div className="flex justify-between items-center text-sm">
                    <span className="bg-gray-100 px-3 py-1 rounded-full font-medium text-gray-600">
                      {course._count?.chapters || 0} Chapters
                    </span>
                    <span className="text-primary font-semibold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                      Manage Content <ArrowRight className="w-4 h-4" />
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
          {courses.length === 0 && (
            <div className="col-span-full py-20 text-center bg-white rounded-2xl border-2 border-dashed border-gray-200">
              <Library className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 font-medium">No courses found. Create your first course to get started.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
