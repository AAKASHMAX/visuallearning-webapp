"use client";
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageLoader } from "@/components/ui/loading";
import api from "@/lib/api";
import toast from "react-hot-toast";
import { Plus, Pencil, Trash2, X, Search, Upload, Loader2 } from "lucide-react";
import { useLanguage } from "@/lib/language";

type Tab = "chapters" | "videos" | "notes" | "questions" | "questionBank" | "ppts" | "testSeries";

const tabs: { key: Tab; label: string }[] = [
  { key: "chapters", label: "Chapters" },
  { key: "videos", label: "Animated Videos" },
  { key: "notes", label: "Notes" },
  { key: "questions", label: "Quiz" },
  { key: "questionBank", label: "NCERT Q&A" },
  { key: "ppts", label: "PPTs" },
  { key: "testSeries", label: "Test Series" },
];

function stripVideoTitleNumber(title: string) {
  return title.replace(/^\s*\d+([.)]|[-:]|\s)+\s*/, "").trim();
}

function readContentList(responseData: any, key: "notes" | "questions") {
  if (Array.isArray(responseData?.data)) return responseData.data;
  if (Array.isArray(responseData?.data?.[key])) return responseData.data[key];
  return [];
}

export default function AdminContentPage() {
  const [tab, setTab] = useState<Tab>("chapters");
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<any>({});
  const [editing, setEditing] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [htmlUploading, setHtmlUploading] = useState(false);
  const [selectedImages, setSelectedImages] = useState<FileList | null>(null);
  const [selectedHtml, setSelectedHtml] = useState<File | null>(null);
  const [selectedCss, setSelectedCss] = useState<File | null>(null);

  const { enabledLanguages } = useLanguage();

  const handleFileUpload = async (file: File) => {
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("folder", "notes");
      const { data } = await api.post("/admin/upload", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const url = data.data?.url;
      if (url) {
        setFormData((prev: any) => ({ ...prev, pdfUrl: url }));
        toast.success("PDF uploaded");
      } else {
        toast.error("Upload failed - no URL returned");
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleHtmlNoteUpload = async () => {
    if (!selectedHtml) return toast.error("Select an HTML file first");
    setHtmlUploading(true);
    try {
      const fd = new FormData();
      fd.append("html", selectedHtml);
      if (selectedCss) fd.append("css", selectedCss);
      if (selectedImages) {
        Array.from(selectedImages).forEach((img) => fd.append("images", img));
      }
      const { data } = await api.post("/admin/upload-html-note", fd, {
        headers: { "Content-Type": "multipart/form-data" },
        timeout: 120000,
      });
      const result = data.data;
      setFormData((prev: any) => ({
        ...prev,
        htmlContent: result.htmlContent || prev.htmlContent,
        cssContent: result.cssContent || prev.cssContent,
        pdfUrl: result.pdfUrl || prev.pdfUrl,
      }));
      toast.success(`HTML note processed (${result.imagesUploaded} images uploaded)`);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "HTML upload failed");
    } finally {
      setHtmlUploading(false);
    }
  };

  const [classes, setClasses] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [allChapters, setAllChapters] = useState<any[]>([]);
  const [selectedChapter, setSelectedChapter] = useState("");
  const [chapterSearch, setChapterSearch] = useState("");
  const [videoLangFilter, setVideoLangFilter] = useState<string>("ALL");

  useEffect(() => {
    api.get("/courses/classes").then(({ data }) => setClasses(data.data || []));
    loadChapters();
  }, []);

  useEffect(() => {
    if (!formData.classId) {
      setSubjects([]);
      return;
    }

    api.get(`/courses/classes/${formData.classId}/subjects`)
      .then(({ data }) => setSubjects(data.data?.subjects || []))
      .catch(() => setSubjects([]));
  }, [formData.classId]);

  useEffect(() => { loadData(); }, [tab, selectedChapter]);

  const loadChapters = async () => {
    try {
      const { data } = await api.get("/admin/chapters-list");
      setAllChapters(data.data || []);
      if (tab === "chapters") setData(data.data || []);
    } catch {
      setAllChapters([]);
    }
  };

  const loadData = async () => {
    setLoading(true);
    try {
      if (tab === "chapters") {
        const { data } = await api.get("/admin/chapters-list");
        setData(data.data || []);
        setAllChapters(data.data || []);
      } else if (tab === "videos" && selectedChapter) {
        const { data } = await api.get(`/admin/videos/chapter/${selectedChapter}`);
        setData(data.data || []);
      } else if (tab === "notes" && selectedChapter) {
        const { data } = await api.get(`/courses/chapters/${selectedChapter}/notes`);
        setData(readContentList(data, "notes"));
      } else if ((tab === "questions" || tab === "questionBank") && selectedChapter) {
        const { data } = await api.get(`/courses/chapters/${selectedChapter}/questions`);
        setData(readContentList(data, "questions"));
      } else {
        setData([]);
      }
    } catch {
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  const getCleanPayload = () => {
    if (tab === "chapters") {
      return {
        name: formData.name,
        order: Number(formData.order) || 0,
        subjectId: formData.subjectId,
      };
    }

    if (tab === "videos") {
      return {
        title: stripVideoTitleNumber(formData.title || ""),
        youtubeVideoId: formData.youtubeVideoId || "",
        vimeoVideoId: formData.vimeoVideoId || null,
        language: formData.language || "ENGLISH",
        duration: formData.duration,
        order: Number(formData.order) || 0,
        isFree: !!formData.isFree,
        type: "ANIMATED_VIDEO",
        chapterId: formData.chapterId || selectedChapter,
      };
    }

    if (tab === "notes") {
      return {
        title: formData.title,
        pdfUrl: formData.pdfUrl,
        htmlContent: formData.htmlContent || null,
        cssContent: formData.cssContent || null,
        chapterId: formData.chapterId || selectedChapter,
      };
    }

    return {
      questionText: formData.questionText,
      optionA: formData.optionA,
      optionB: formData.optionB,
      optionC: formData.optionC,
      optionD: formData.optionD,
      correctOption: formData.correctOption,
      solution: formData.solution,
      chapterId: formData.chapterId || selectedChapter,
    };
  };

  const handleSave = async () => {
    try {
      if (tab === "ppts" || tab === "testSeries") {
        toast.error("PPTs and Test Series storage will be added in the next backend pass");
        return;
      }

      const endpoint = `/admin/${tab === "questionBank" ? "questions" : tab}`;
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
      await loadData();
      if (tab === "chapters") await loadChapters();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to save");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure?")) return;
    try {
      const endpoint = tab === "questionBank" ? "questions" : tab;
      await api.delete(`/admin/${endpoint}/${id}`);
      toast.success("Deleted");
      loadData();
    } catch {
      toast.error("Failed to delete");
    }
  };

  const startEdit = (item: any) => {
    setEditing(item.id);
    setFormData({
      ...item,
      title: tab === "videos" ? stripVideoTitleNumber(item.title || "") : item.title,
      classId: item.subject?.class?.id || "",
      subjectId: item.subjectId || item.subject?.id || "",
    });
    setShowForm(true);
  };

  const startCreate = () => {
    setEditing(null);
    setFormData({
      language: enabledLanguages[0]?.value || "ENGLISH",
      chapterId: selectedChapter,
      type: "ANIMATED_VIDEO",
    });
    setShowForm(true);
  };

  const filteredData = (tab === "videos" ? data.filter((item: any) =>
    videoLangFilter === "ALL" || (item.language || "ENGLISH") === videoLangFilter
  ) : data).filter((item: any) => {
    if (tab === "chapters" && chapterSearch) {
      const search = chapterSearch.toLowerCase();
      return (item.name?.toLowerCase() || "").includes(search) ||
             (item.subject?.name?.toLowerCase() || "").includes(search) ||
             (item.subject?.class?.name?.toLowerCase() || "").includes(search);
    }
    return true;
  });

  const canAdd = (tab === "chapters" || !!selectedChapter) && tab !== "ppts" && tab !== "testSeries";
  const isQuestionTab = tab === "questions" || tab === "questionBank";
  const emptyText = tab === "chapters"
    ? "No chapters found."
    : tab === "ppts" || tab === "testSeries"
      ? "This admin section is ready in the menu. Storage and upload fields will be added next."
      : "Choose a chapter to manage this content.";

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Content Management</h1>
          <p className="text-sm text-gray-500 mt-1">Manage content according to Students, Teachers, and Professional learning sections</p>
        </div>
      </div>

      <div className="flex gap-2 mb-6 flex-wrap">
        {tabs.map((t) => (
          <button key={t.key} onClick={() => { setTab(t.key); setShowForm(false); setEditing(null); }}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${tab === t.key ? "bg-primary text-white" : "bg-white text-gray-600 border"}`}>
            {t.label}
          </button>
        ))}
      </div>

      <div className="flex gap-3 mb-4 flex-wrap">
        {tab !== "chapters" && (
          <select value={selectedChapter} onChange={(e) => setSelectedChapter(e.target.value)}
            className="border rounded-lg px-3 py-2 text-sm min-w-[300px]">
            <option value="">Choose Chapter to manage content</option>
            {allChapters.map((ch: any) => (
              <option key={ch.id} value={ch.id}>
                {ch.name} ({ch.subject?.class?.name || "N/A"} - {ch.subject?.name || "N/A"})
              </option>
            ))}
          </select>
        )}

        {tab === "chapters" && (
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search chapters by name, class or subject..."
              className="pl-10"
              value={chapterSearch}
              onChange={(e) => setChapterSearch(e.target.value)}
            />
          </div>
        )}

        {tab === "videos" && selectedChapter && (
          <select value={videoLangFilter} onChange={(e) => setVideoLangFilter(e.target.value)}
            className="border rounded-lg px-3 py-2 text-sm">
            <option value="ALL">All Languages</option>
            {enabledLanguages.map((lang) => (
              <option key={lang.value} value={lang.value}>{lang.label}</option>
            ))}
          </select>
        )}
      </div>

      <div className="flex justify-end mb-4">
        {canAdd && (
          <Button onClick={showForm ? () => { setShowForm(false); setEditing(null); setFormData({}); } : startCreate}>
            {showForm ? <><X className="w-4 h-4 mr-1" />Cancel</> : <><Plus className="w-4 h-4 mr-1" />Add {tab === "questionBank" || tab === "questions" ? "Question" : tab === "notes" ? "Note" : "Video"}</>}
          </Button>
        )}
      </div>

      {showForm && (
        <Card className="mb-6 shadow-lg border-primary/10">
          <CardContent className="p-6 space-y-3">
            {tab === "chapters" && (
              <>
                <Input label="Chapter Name" value={formData.name || ""} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                <Input label="Order" type="number" value={formData.order || ""} onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })} />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Class</label>
                    <select value={formData.classId || ""} onChange={(e) => setFormData({ ...formData, classId: e.target.value, subjectId: "" })} className="w-full border rounded-lg p-2 text-sm">
                      <option value="">Select Class</option>
                      {classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Subject</label>
                    <select value={formData.subjectId || ""} onChange={(e) => setFormData({ ...formData, subjectId: e.target.value })} className="w-full border rounded-lg p-2 text-sm">
                      <option value="">Select Subject</option>
                      {subjects.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                  </div>
                </div>
              </>
            )}

            {tab === "videos" && (
              <>
                <Input label="Title" value={formData.title || ""} onChange={(e) => setFormData({ ...formData, title: e.target.value })} />
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
                <Input label="Vimeo Video ID" value={formData.vimeoVideoId || ""} onChange={(e) => setFormData({ ...formData, vimeoVideoId: e.target.value })} placeholder="e.g. 123456789" />
                <Input label="YouTube Link or Video ID" value={formData.youtubeVideoId || ""} onChange={(e) => setFormData({ ...formData, youtubeVideoId: e.target.value })} />
                <Input label="Duration" value={formData.duration || ""} onChange={(e) => setFormData({ ...formData, duration: e.target.value })} placeholder="e.g. 15:30" />
                <Input label="Order" type="number" value={formData.order || ""} onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })} />
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={formData.isFree || false} onChange={(e) => setFormData({ ...formData, isFree: e.target.checked })} />
                  Free video
                </label>
              </>
            )}

            {tab === "notes" && (
              <>
                <Input label="Title" value={formData.title || ""} onChange={(e) => setFormData({ ...formData, title: e.target.value })} />

                <div className="border rounded-lg p-4 bg-blue-50/50 space-y-3">
                  <p className="text-sm font-bold text-blue-800">HTML Note (for viewing)</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">HTML File</label>
                      <input type="file" accept=".html,.htm" className="text-sm w-full"
                        onChange={(e) => setSelectedHtml(e.target.files?.[0] || null)} />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">CSS File (optional)</label>
                      <input type="file" accept=".css" className="text-sm w-full"
                        onChange={(e) => setSelectedCss(e.target.files?.[0] || null)} />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Images folder (select all images)</label>
                    <input type="file" accept="image/*,.svg" multiple className="text-sm w-full"
                      onChange={(e) => setSelectedImages(e.target.files)} />
                    {selectedImages && <span className="text-xs text-gray-500">{selectedImages.length} images selected</span>}
                  </div>
                  <Button type="button" onClick={handleHtmlNoteUpload} disabled={htmlUploading || !selectedHtml} className="w-full">
                    {htmlUploading ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Processing & Uploading...</> : <><Upload className="w-4 h-4 mr-2" />Upload HTML Note</>}
                  </Button>
                  {formData.htmlContent && <p className="text-xs text-green-600 font-medium">HTML content loaded ({Math.round(formData.htmlContent.length / 1024)}KB)</p>}
                </div>

                <div className="border rounded-lg p-4 bg-emerald-50/50 space-y-3">
                  <p className="text-sm font-bold text-emerald-800">PDF (for download)</p>
                  <div className="flex gap-2 items-center">
                    <label className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium cursor-pointer border ${uploading ? "bg-gray-100 text-gray-400" : "bg-white text-gray-700 hover:bg-gray-50"}`}>
                      {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                      {uploading ? "Uploading..." : "Choose PDF"}
                      <input type="file" accept=".pdf" className="hidden" disabled={uploading}
                        onChange={(e) => { const file = e.target.files?.[0]; if (file) handleFileUpload(file); e.target.value = ""; }} />
                    </label>
                    {formData.pdfUrl && (
                      <a href={formData.pdfUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 underline truncate max-w-[300px]">
                        View current PDF
                      </a>
                    )}
                  </div>
                  <Input label="Or paste PDF URL" value={formData.pdfUrl || ""} onChange={(e) => setFormData({ ...formData, pdfUrl: e.target.value })} placeholder="https://..." />
                </div>
              </>
            )}

            {(tab === "questions" || tab === "questionBank") && (
              <>
                <Input label="Question Text" value={formData.questionText || ""} onChange={(e) => setFormData({ ...formData, questionText: e.target.value })} />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <Input label="A" value={formData.optionA || ""} onChange={(e) => setFormData({ ...formData, optionA: e.target.value })} />
                  <Input label="B" value={formData.optionB || ""} onChange={(e) => setFormData({ ...formData, optionB: e.target.value })} />
                  <Input label="C" value={formData.optionC || ""} onChange={(e) => setFormData({ ...formData, optionC: e.target.value })} />
                  <Input label="D" value={formData.optionD || ""} onChange={(e) => setFormData({ ...formData, optionD: e.target.value })} />
                </div>
                <select
                  value={formData.correctOption || ""}
                  onChange={(e) => setFormData({ ...formData, correctOption: e.target.value })}
                  className="border rounded-lg px-3 py-2 text-sm w-full"
                >
                  <option value="">Correct Option</option>
                  <option value="A">A</option>
                  <option value="B">B</option>
                  <option value="C">C</option>
                  <option value="D">D</option>
                </select>
                <Input label="Solution" value={formData.solution || ""} onChange={(e) => setFormData({ ...formData, solution: e.target.value })} />
              </>
            )}

            <Button onClick={handleSave} className="w-full">{editing ? "Update" : "Create"}</Button>
          </CardContent>
        </Card>
      )}

      {loading ? <PageLoader /> : (
        <Card className="overflow-hidden border-none shadow-xl bg-white rounded-2xl">
          <CardContent className="p-0 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-gray-50/50 text-left">
                  <th className="p-4 font-black uppercase tracking-wider text-[10px] text-gray-400">
                    {isQuestionTab ? "Question" : "Name/Title"}
                  </th>
                  {tab === "chapters" && <th className="p-4 font-black uppercase tracking-wider text-[10px] text-gray-400">Class/Subject</th>}
                  {tab === "chapters" && <th className="p-4 font-black uppercase tracking-wider text-[10px] text-gray-400">Content Stats</th>}
                  {tab === "videos" && <th className="p-4 font-black uppercase tracking-wider text-[10px] text-gray-400">Details</th>}
                  <th className="p-4 font-black uppercase tracking-wider text-[10px] text-gray-400">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map((item: any) => (
                  <tr key={item.id} className="border-b last:border-0 hover:bg-gray-50 transition-colors">
                    <td className="p-4">
                      <div className="font-bold text-gray-900 max-w-[300px] truncate">
                        {isQuestionTab ? item.questionText : (item.name || item.title)}
                      </div>
                      {tab === "videos" && <div className="text-[10px] font-mono text-gray-400">{item.vimeoVideoId || item.youtubeVideoId}</div>}
                    </td>
                    {tab === "chapters" && (
                      <td className="p-4">
                        <div className="flex flex-col gap-1">
                          <span className="text-[10px] font-black uppercase text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full w-fit">{item.subject?.class?.name || "N/A"}</span>
                          <span className="text-[10px] font-black uppercase text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full w-fit">{item.subject?.name || "N/A"}</span>
                        </div>
                      </td>
                    )}
                    {tab === "chapters" && (
                      <td className="p-4">
                        <div className="flex gap-2 text-[10px] font-bold">
                          <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">{item._count?.videos || 0} Videos</span>
                          <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">{item._count?.notes || 0} Notes</span>
                          <span className="bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">{item._count?.questions || 0} Quiz</span>
                        </div>
                      </td>
                    )}
                    {tab === "videos" && (
                      <td className="p-4">
                        <div className="flex flex-col gap-1 text-[10px] font-bold text-gray-500">
                          <span>{item.language || "ENGLISH"} - {item.duration || "No duration"}</span>
                          <span>Order: {item.order ?? 0}</span>
                        </div>
                      </td>
                    )}
                    <td className="p-4">
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm" onClick={() => startEdit(item)} className="h-8 w-8 p-0"><Pencil className="w-4 h-4" /></Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(item.id)} className="h-8 w-8 p-0 text-red-500 hover:bg-red-50"><Trash2 className="w-4 h-4" /></Button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredData.length === 0 && (
                  <tr><td colSpan={10} className="p-12 text-center text-gray-400 font-medium italic">{emptyText}</td></tr>
                )}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
