"use client";

import { useEffect, useState } from "react";
import { BookOpen, Plus, Edit2, Trash2, ChevronRight, Video, FileText, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import api from "@/lib/api";
import toast from "react-hot-toast";

interface Course {
  id: string;
  name: string;
  description: string | null;
  tier: string;
  displayOrder: number;
  isActive: boolean;
  _count: { chapters: number };
}

interface Chapter {
  id: string;
  name: string;
  displayOrder: number;
  _count: { videos: number; notes: number; questions: number };
}

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [showCourseForm, setShowCourseForm] = useState(false);
  const [showChapterForm, setShowChapterForm] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [editingChapter, setEditingChapter] = useState<Chapter | null>(null);

  const [courseName, setCourseName] = useState("");
  const [courseDesc, setCourseDesc] = useState("");
  const [courseTier, setCourseTier] = useState("FREE");
  const [courseOrder, setCourseOrder] = useState(0);

  const [chapterName, setChapterName] = useState("");
  const [chapterOrder, setChapterOrder] = useState(0);

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    if (selectedCourse) fetchChapters(selectedCourse);
  }, [selectedCourse]);

  async function fetchCourses() {
    try {
      const res = await api.get("/courses");
      setCourses(res.data);
    } catch { toast.error("Failed to load courses"); }
    setLoading(false);
  }

  async function fetchChapters(courseId: string) {
    try {
      const res = await api.get(`/courses/${courseId}`);
      setChapters(res.data.chapters || []);
    } catch { toast.error("Failed to load chapters"); }
  }

  async function saveCourse() {
    try {
      const data = { name: courseName, description: courseDesc, tier: courseTier, displayOrder: courseOrder };
      if (editingCourse) {
        await api.put(`/admin/courses/${editingCourse.id}`, data);
        toast.success("Course updated");
      } else {
        await api.post("/admin/courses", data);
        toast.success("Course created");
      }
      resetCourseForm();
      fetchCourses();
    } catch { toast.error("Failed to save course"); }
  }

  async function deleteCourse(id: string) {
    if (!confirm("Delete this course and all its content?")) return;
    try {
      await api.delete(`/admin/courses/${id}`);
      toast.success("Course deleted");
      if (selectedCourse === id) setSelectedCourse(null);
      fetchCourses();
    } catch { toast.error("Failed to delete"); }
  }

  async function saveChapter() {
    try {
      const data = { name: chapterName, courseId: selectedCourse, displayOrder: chapterOrder };
      if (editingChapter) {
        await api.put(`/admin/chapters/${editingChapter.id}`, data);
        toast.success("Chapter updated");
      } else {
        await api.post("/admin/chapters", data);
        toast.success("Chapter created");
      }
      resetChapterForm();
      fetchChapters(selectedCourse!);
      fetchCourses();
    } catch { toast.error("Failed to save chapter"); }
  }

  async function deleteChapter(id: string) {
    if (!confirm("Delete this chapter and all its content?")) return;
    try {
      await api.delete(`/admin/chapters/${id}`);
      toast.success("Chapter deleted");
      fetchChapters(selectedCourse!);
      fetchCourses();
    } catch { toast.error("Failed to delete"); }
  }

  function resetCourseForm() {
    setShowCourseForm(false);
    setEditingCourse(null);
    setCourseName("");
    setCourseDesc("");
    setCourseTier("FREE");
    setCourseOrder(0);
  }

  function resetChapterForm() {
    setShowChapterForm(false);
    setEditingChapter(null);
    setChapterName("");
    setChapterOrder(0);
  }

  function openEditCourse(course: Course) {
    setEditingCourse(course);
    setCourseName(course.name);
    setCourseDesc(course.description || "");
    setCourseTier(course.tier);
    setCourseOrder(course.displayOrder);
    setShowCourseForm(true);
  }

  function openEditChapter(ch: Chapter) {
    setEditingChapter(ch);
    setChapterName(ch.name);
    setChapterOrder(ch.displayOrder);
    setShowChapterForm(true);
  }

  const tierColors: Record<string, string> = {
    FREE: "bg-emerald-500/10 text-emerald-400",
    BASIC: "bg-accent/10 text-accent",
    ADVANCE: "bg-secondary/10 text-secondary-light",
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-text-bright">Courses</h1>
          <p className="text-text-muted text-sm mt-1">Manage physics courses, chapters, and content</p>
        </div>
        <Button onClick={() => { resetCourseForm(); setShowCourseForm(true); }}>
          <Plus className="w-4 h-4 mr-2" /> Add Course
        </Button>
      </div>

      {/* Course Form Modal */}
      {showCourseForm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-2xl p-6 w-full max-w-md">
            <h2 className="text-lg font-bold text-text-bright mb-4">
              {editingCourse ? "Edit Course" : "New Course"}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-text-muted mb-1">Name</label>
                <Input value={courseName} onChange={(e) => setCourseName(e.target.value)} placeholder="e.g. Mechanics" />
              </div>
              <div>
                <label className="block text-sm text-text-muted mb-1">Description</label>
                <Input value={courseDesc} onChange={(e) => setCourseDesc(e.target.value)} placeholder="Course description" />
              </div>
              <div>
                <label className="block text-sm text-text-muted mb-1">Tier</label>
                <select
                  value={courseTier}
                  onChange={(e) => setCourseTier(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-surface border border-border text-text focus:border-accent focus:outline-none"
                >
                  <option value="FREE">Free</option>
                  <option value="BASIC">Basic</option>
                  <option value="ADVANCE">Advance</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-text-muted mb-1">Display Order</label>
                <Input type="number" value={courseOrder} onChange={(e) => setCourseOrder(parseInt(e.target.value) || 0)} />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <Button onClick={saveCourse} className="flex-1">Save</Button>
              <Button variant="ghost" onClick={resetCourseForm} className="flex-1">Cancel</Button>
            </div>
          </div>
        </div>
      )}

      {/* Chapter Form Modal */}
      {showChapterForm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-2xl p-6 w-full max-w-md">
            <h2 className="text-lg font-bold text-text-bright mb-4">
              {editingChapter ? "Edit Chapter" : "New Chapter"}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-text-muted mb-1">Chapter Name</label>
                <Input value={chapterName} onChange={(e) => setChapterName(e.target.value)} placeholder="e.g. Newton's Laws" />
              </div>
              <div>
                <label className="block text-sm text-text-muted mb-1">Display Order</label>
                <Input type="number" value={chapterOrder} onChange={(e) => setChapterOrder(parseInt(e.target.value) || 0)} />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <Button onClick={saveChapter} className="flex-1">Save</Button>
              <Button variant="ghost" onClick={resetChapterForm} className="flex-1">Cancel</Button>
            </div>
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Courses List */}
        <div>
          <h3 className="text-sm font-semibold text-text-muted mb-3 uppercase tracking-wider">Courses</h3>
          {loading ? (
            <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="h-20 rounded-xl bg-card animate-pulse" />)}</div>
          ) : courses.length === 0 ? (
            <div className="rounded-xl border border-border bg-card p-8 text-center">
              <BookOpen className="w-8 h-8 text-text-muted mx-auto mb-2" />
              <p className="text-text-muted text-sm">No courses yet. Add your first course!</p>
            </div>
          ) : (
            <div className="space-y-2">
              {courses.map((course) => (
                <div
                  key={course.id}
                  onClick={() => setSelectedCourse(course.id)}
                  className={`rounded-xl border p-4 cursor-pointer transition-all ${
                    selectedCourse === course.id
                      ? "border-accent/50 bg-accent/5"
                      : "border-border bg-card hover:border-border-light"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-text-bright text-sm">{course.name}</h4>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${tierColors[course.tier] || ""}`}>
                          {course.tier}
                        </span>
                      </div>
                      <p className="text-xs text-text-muted">{course._count.chapters} chapters</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <button onClick={(e) => { e.stopPropagation(); openEditCourse(course); }} className="p-1.5 hover:bg-surface-light rounded-lg transition-colors">
                        <Edit2 className="w-3.5 h-3.5 text-text-muted" />
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); deleteCourse(course.id); }} className="p-1.5 hover:bg-danger/10 rounded-lg transition-colors">
                        <Trash2 className="w-3.5 h-3.5 text-danger" />
                      </button>
                      <ChevronRight className="w-4 h-4 text-text-muted ml-1" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Chapters List */}
        <div>
          {selectedCourse ? (
            <>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-text-muted uppercase tracking-wider">Chapters</h3>
                <Button size="sm" onClick={() => { resetChapterForm(); setShowChapterForm(true); }}>
                  <Plus className="w-3 h-3 mr-1" /> Add Chapter
                </Button>
              </div>
              {chapters.length === 0 ? (
                <div className="rounded-xl border border-border bg-card p-8 text-center">
                  <p className="text-text-muted text-sm">No chapters. Add the first one!</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {chapters.map((ch) => (
                    <div key={ch.id} className="rounded-xl border border-border bg-card p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-text-bright text-sm">{ch.name}</h4>
                          <div className="flex items-center gap-3 mt-1 text-xs text-text-muted">
                            <span className="flex items-center gap-1"><Video className="w-3 h-3" />{ch._count.videos}</span>
                            <span className="flex items-center gap-1"><FileText className="w-3 h-3" />{ch._count.notes}</span>
                            <span className="flex items-center gap-1"><HelpCircle className="w-3 h-3" />{ch._count.questions}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <button onClick={() => openEditChapter(ch)} className="p-1.5 hover:bg-surface-light rounded-lg transition-colors">
                            <Edit2 className="w-3.5 h-3.5 text-text-muted" />
                          </button>
                          <button onClick={() => deleteChapter(ch.id)} className="p-1.5 hover:bg-danger/10 rounded-lg transition-colors">
                            <Trash2 className="w-3.5 h-3.5 text-danger" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="rounded-xl border border-border bg-card p-8 text-center h-full flex items-center justify-center">
              <p className="text-text-muted text-sm">Select a course to view chapters</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
