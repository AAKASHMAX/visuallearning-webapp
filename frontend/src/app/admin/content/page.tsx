"use client";
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageLoader } from "@/components/ui/loading";
import api from "@/lib/api";
import toast from "react-hot-toast";
import { Plus, Pencil, Trash2, X } from "lucide-react";
import { useLanguage, type LangOption } from "@/lib/language";

type Tab = "classes" | "subjects" | "chapters" | "videos" | "notes" | "questions" | "board-papers";

export default function AdminContentPage() {
  const [tab, setTab] = useState<Tab>("classes");
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<any>({});
  const [editing, setEditing] = useState<string | null>(null);

  // Languages from API
  const { enabledLanguages } = useLanguage();

  // Parent selectors
  const [classes, setClasses] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [chapters, setChapters] = useState<any[]>([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedChapter, setSelectedChapter] = useState("");

  useEffect(() => {
    api.get("/courses/classes").then(({ data }) => setClasses(data.data));
  }, []);

  // Load subjects when class is selected (needed for chapters/videos/board-papers tabs)
  useEffect(() => {
    if (selectedClass && tab !== "classes") {
      api.get(`/courses/classes/${selectedClass}/subjects`).then(({ data }) => {
        setSubjects(data.data.subjects);
      });
    }
  }, [selectedClass]);

  // Load chapters when subject is selected (needed for videos/notes/questions tabs)
  useEffect(() => {
    if (selectedSubject && (tab === "videos" || tab === "chapters" || tab === "notes" || tab === "questions")) {
      api.get(`/courses/subjects/${selectedSubject}/chapters`).then(({ data }) => {
        setChapters(data.data.chapters);
      });
    }
  }, [selectedSubject]);

  useEffect(() => { loadData(); }, [tab, selectedClass, selectedSubject, selectedChapter]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (tab === "classes") {
        const { data } = await api.get("/courses/classes");
        setData(data.data);
      } else if (tab === "subjects" && selectedClass) {
        const { data } = await api.get(`/courses/classes/${selectedClass}/subjects`);
        setData(data.data.subjects);
        setSubjects(data.data.subjects);
      } else if (tab === "chapters" && selectedSubject) {
        const { data } = await api.get(`/courses/subjects/${selectedSubject}/chapters`);
        setData(data.data.chapters);
        setChapters(data.data.chapters);
      } else if (tab === "videos" && selectedChapter) {
        const { data } = await api.get(`/courses/chapters/${selectedChapter}/videos`);
        setData(data.data.videos || []);
      } else if (tab === "notes" && selectedChapter) {
        const { data } = await api.get(`/courses/chapters/${selectedChapter}/notes`);
        setData(data.data || []);
      } else if (tab === "questions" && selectedChapter) {
        const { data } = await api.get(`/courses/chapters/${selectedChapter}/questions`);
        setData(data.data || []);
      } else if (tab === "board-papers" && selectedSubject) {
        const { data } = await api.get(`/courses/subjects/${selectedSubject}/board-papers`);
        const allPapers: any[] = Object.values(data.data.papers || {}).flat();
        setData(allPapers);
      } else {
        setData([]);
      }
    } catch { setData([]); }
    setLoading(false);
  };

  const getCleanPayload = () => {
    if (tab === "classes") return { name: formData.name, order: formData.order };
    if (tab === "subjects") return { name: formData.name, icon: formData.icon, classId: formData.classId || selectedClass };
    if (tab === "chapters") return { name: formData.name, order: formData.order, subjectId: formData.subjectId || selectedSubject };
    if (tab === "videos") return {
      title: formData.title, youtubeVideoId: formData.youtubeVideoId,
      language: formData.language || "ENGLISH", duration: formData.duration,
      order: formData.order, isFree: formData.isFree,
      type: formData.type || "ANIMATED_VIDEO",
      chapterId: formData.chapterId || selectedChapter,
    };
    if (tab === "notes") return {
      title: formData.title, pdfUrl: formData.pdfUrl,
      chapterId: formData.chapterId || selectedChapter,
    };
    if (tab === "questions") return {
      questionText: formData.questionText, optionA: formData.optionA, optionB: formData.optionB,
      optionC: formData.optionC, optionD: formData.optionD, correctOption: formData.correctOption,
      solution: formData.solution,
      chapterId: formData.chapterId || selectedChapter,
    };
    if (tab === "board-papers") return {
      subjectId: formData.subjectId || selectedSubject,
      year: parseInt(formData.year), title: formData.title, pdfUrl: formData.pdfUrl,
      order: formData.order,
    };
    return formData;
  };

  const handleSave = async () => {
    try {
      const endpoint = `/admin/${tab}`;
      const payload = getCleanPayload();
      if (editing) {
        await api.put(`${endpoint}/${editing}`, payload);
        toast.success("Updated");
      } else {
        await api.post(endpoint, payload);
        toast.success("Created");
      }
      setShowForm(false);
      setFormData({});
      setEditing(null);
      loadData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to save");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure?")) return;
    try {
      await api.delete(`/admin/${tab}/${id}`);
      toast.success("Deleted");
      loadData();
    } catch { toast.error("Failed to delete"); }
  };

  const startEdit = (item: any) => {
    setEditing(item.id);
    setFormData(item);
    setShowForm(true);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Content Management</h1>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {(["classes", "subjects", "chapters", "videos", "notes", "questions", "board-papers"] as Tab[]).map((t) => (
          <button key={t} onClick={() => { setTab(t); setShowForm(false); }}
            className={`px-4 py-2 rounded-lg text-sm font-medium capitalize ${tab === t ? "bg-primary text-white" : "bg-white text-gray-600 border"}`}>
            {t === "board-papers" ? "Board Papers" : t}
          </button>
        ))}
      </div>

      {/* Parent Selectors */}
      <div className="flex gap-3 mb-4 flex-wrap">
        {tab !== "classes" && (
          <select value={selectedClass} onChange={(e) => { setSelectedClass(e.target.value); setSelectedSubject(""); setSelectedChapter(""); }}
            className="border rounded-lg px-3 py-2 text-sm">
            <option value="">Select Class</option>
            {classes.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        )}
        {tab !== "classes" && tab !== "subjects" && selectedClass && (
          <select value={selectedSubject} onChange={(e) => { setSelectedSubject(e.target.value); setSelectedChapter(""); }}
            className="border rounded-lg px-3 py-2 text-sm">
            <option value="">Select Subject</option>
            {subjects.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        )}
        {(tab === "videos" || tab === "notes" || tab === "questions") && selectedSubject && (
          <select value={selectedChapter} onChange={(e) => setSelectedChapter(e.target.value)}
            className="border rounded-lg px-3 py-2 text-sm">
            <option value="">Select Chapter</option>
            {chapters.map((ch: any) => <option key={ch.id} value={ch.id}>{ch.name}</option>)}
          </select>
        )}
      </div>

      <div className="flex justify-end mb-4">
        <Button onClick={() => { setShowForm(!showForm); setEditing(null); setFormData({}); }}>
          {showForm ? <><X className="w-4 h-4 mr-1" />Cancel</> : <><Plus className="w-4 h-4 mr-1" />Add {tab === "board-papers" ? "Board Paper" : tab === "questions" ? "Question" : tab === "notes" ? "Note" : tab.slice(0, -1)}</>}
        </Button>
      </div>

      {/* Form */}
      {showForm && (
        <Card className="mb-6">
          <CardContent className="p-6 space-y-3">
            {tab === "classes" && (
              <>
                <Input label="Class Name" value={formData.name || ""} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="e.g. Class 9" />
                <Input label="Order" type="number" value={formData.order || ""} onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })} />
              </>
            )}
            {tab === "subjects" && (
              <>
                <Input label="Subject Name" value={formData.name || ""} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="e.g. Physics" />
                <Input label="Icon (lucide name)" value={formData.icon || ""} onChange={(e) => setFormData({ ...formData, icon: e.target.value })} placeholder="e.g. atom" />
              </>
            )}
            {tab === "chapters" && (
              <>
                <Input label="Chapter Name" value={formData.name || ""} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                <Input label="Order" type="number" value={formData.order || ""} onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })} />
              </>
            )}
            {tab === "videos" && (
              <>
                <Input label="Title" value={formData.title || ""} onChange={(e) => setFormData({ ...formData, title: e.target.value })} />
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                  <select
                    value={formData.type || "ANIMATED_VIDEO"}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="border rounded-lg px-3 py-2 text-sm w-full"
                  >
                    <option value="ANIMATED_VIDEO">3D Animated Video</option>
                    <option value="LECTURE_VIDEO">Lecture Video</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Language</label>
                  <select
                    value={formData.language || "ENGLISH"}
                    onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                    className="border rounded-lg px-3 py-2 text-sm w-full"
                  >
                    {enabledLanguages.map((lang) => (
                      <option key={lang.value} value={lang.value}>{lang.label}</option>
                    ))}
                  </select>
                </div>
                <Input label="YouTube Link or Video ID" value={formData.youtubeVideoId || ""} onChange={(e) => {
                  let value = e.target.value.trim();
                  try {
                    if (value.includes("youtube.com") || value.includes("youtu.be")) {
                      let id = "";
                      if (value.includes("youtu.be/")) {
                        id = value.split("youtu.be/")[1].split(/[?&#]/)[0];
                      } else {
                        const url = new URL(value);
                        id = url.searchParams.get("v") || "";
                      }
                      if (id) value = id;
                    }
                  } catch {}
                  setFormData({ ...formData, youtubeVideoId: value });
                }} placeholder="Paste full YouTube link or just the Video ID" />
                <Input label="Duration" value={formData.duration || ""} onChange={(e) => setFormData({ ...formData, duration: e.target.value })} placeholder="e.g. 15:30" />
                <Input label="Order" type="number" value={formData.order || ""} onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })} />
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={formData.isFree || false} onChange={(e) => setFormData({ ...formData, isFree: e.target.checked })} />
                  Free video (visible without subscription)
                </label>
              </>
            )}
            {tab === "notes" && (
              <>
                <Input label="Title" value={formData.title || ""} onChange={(e) => setFormData({ ...formData, title: e.target.value })} placeholder="e.g. Chapter 1 Notes" />
                <Input label="PDF URL" value={formData.pdfUrl || ""} onChange={(e) => setFormData({ ...formData, pdfUrl: e.target.value })} placeholder="https://..." />
              </>
            )}
            {tab === "questions" && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Question Text</label>
                  <textarea
                    value={formData.questionText || ""}
                    onChange={(e) => setFormData({ ...formData, questionText: e.target.value })}
                    className="border rounded-lg px-3 py-2 text-sm w-full min-h-[80px]"
                    placeholder="Enter the question..."
                  />
                </div>
                <Input label="Option A" value={formData.optionA || ""} onChange={(e) => setFormData({ ...formData, optionA: e.target.value })} />
                <Input label="Option B" value={formData.optionB || ""} onChange={(e) => setFormData({ ...formData, optionB: e.target.value })} />
                <Input label="Option C" value={formData.optionC || ""} onChange={(e) => setFormData({ ...formData, optionC: e.target.value })} />
                <Input label="Option D" value={formData.optionD || ""} onChange={(e) => setFormData({ ...formData, optionD: e.target.value })} />
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Correct Option</label>
                  <select
                    value={formData.correctOption || ""}
                    onChange={(e) => setFormData({ ...formData, correctOption: e.target.value })}
                    className="border rounded-lg px-3 py-2 text-sm w-full"
                  >
                    <option value="">Select correct answer</option>
                    <option value="A">A</option>
                    <option value="B">B</option>
                    <option value="C">C</option>
                    <option value="D">D</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Solution (optional)</label>
                  <textarea
                    value={formData.solution || ""}
                    onChange={(e) => setFormData({ ...formData, solution: e.target.value })}
                    className="border rounded-lg px-3 py-2 text-sm w-full min-h-[60px]"
                    placeholder="Explain the answer..."
                  />
                </div>
              </>
            )}
            {tab === "board-papers" && (
              <>
                <Input label="Title" value={formData.title || ""} onChange={(e) => setFormData({ ...formData, title: e.target.value })} placeholder="e.g. Physics 2024 Solved" />
                <Input label="Year" type="number" value={formData.year || ""} onChange={(e) => setFormData({ ...formData, year: e.target.value })} placeholder="e.g. 2024" />
                <Input label="PDF URL" value={formData.pdfUrl || ""} onChange={(e) => setFormData({ ...formData, pdfUrl: e.target.value })} placeholder="https://..." />
                <Input label="Order" type="number" value={formData.order || ""} onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })} />
              </>
            )}
            <Button onClick={handleSave}>{editing ? "Update" : "Create"}</Button>
          </CardContent>
        </Card>
      )}

      {/* Data Table */}
      {loading ? <PageLoader /> : (
        <Card>
          <CardContent className="p-0 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-gray-50 text-left">
                  <th className="p-4">{tab === "questions" ? "Question" : "Name/Title"}</th>
                  {tab === "videos" && <th className="p-4">Type</th>}
                  {tab === "videos" && <th className="p-4">Language</th>}
                  {tab === "videos" && <th className="p-4">YouTube ID</th>}
                  {tab === "videos" && <th className="p-4">Duration</th>}
                  {tab === "notes" && <th className="p-4">PDF URL</th>}
                  {tab === "questions" && <th className="p-4">Correct</th>}
                  {tab === "board-papers" && <th className="p-4">Year</th>}
                  {tab === "board-papers" && <th className="p-4">PDF URL</th>}
                  <th className="p-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.map((item: any) => (
                  <tr key={item.id} className="border-b last:border-0">
                    <td className="p-4 font-medium max-w-[300px] truncate">{tab === "questions" ? item.questionText : (item.name || item.title)}</td>
                    {tab === "videos" && <td className="p-4 text-gray-500 text-xs">{item.type === "LECTURE_VIDEO" ? "Lecture" : "Animated"}</td>}
                    {tab === "videos" && <td className="p-4 text-gray-500 text-xs">{item.language || "ENGLISH"}</td>}
                    {tab === "videos" && <td className="p-4 text-gray-500 font-mono text-xs">{item.youtubeVideoId}</td>}
                    {tab === "videos" && <td className="p-4 text-gray-500">{item.duration}</td>}
                    {tab === "notes" && <td className="p-4 text-gray-500 text-xs truncate max-w-[200px]">{item.pdfUrl}</td>}
                    {tab === "questions" && <td className="p-4 text-gray-500 font-medium">{item.correctOption}</td>}
                    {tab === "board-papers" && <td className="p-4 text-gray-500">{item.year}</td>}
                    {tab === "board-papers" && <td className="p-4 text-gray-500 text-xs truncate max-w-[200px]">{item.pdfUrl}</td>}
                    <td className="p-4 flex gap-2">
                      <Button variant="ghost" size="sm" onClick={() => startEdit(item)}><Pencil className="w-4 h-4" /></Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(item.id)} className="text-red-500"><Trash2 className="w-4 h-4" /></Button>
                    </td>
                  </tr>
                ))}
                {data.length === 0 && (
                  <tr><td colSpan={10} className="p-8 text-center text-gray-400">No data. {tab !== "classes" ? "Select a parent first or add new items." : "Add your first class."}</td></tr>
                )}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
