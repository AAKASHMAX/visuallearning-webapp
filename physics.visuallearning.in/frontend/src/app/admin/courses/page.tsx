"use client";

import { useEffect, useState } from "react";
import { Atom, BookOpen, Plus, Edit2, Trash2, ChevronRight, ChevronLeft, Video, FileText, HelpCircle, X, Library, Search, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import api from "@/lib/api";
import toast from "react-hot-toast";
import { chapterAnimationOptions } from "@/components/chapter-animations";

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
  animationKey?: string | null;
  displayOrder: number;
  _count: { videos: number; notes: number; questions: number };
}

interface VideoItem {
  id: string;
  title: string;
  youtubeUrl: string;
  videoType: string;
  language: string;
  isFree: boolean;
  displayOrder: number;
}

interface NoteItem {
  id: string;
  title: string;
  fileUrl: string;
  isFree: boolean;
  displayOrder: number;
}

type ContentView = "courses" | "chapters" | "content";
type ContentTab = "videos" | "notes" | "questions";

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [allChapters, setAllChapters] = useState<Chapter[]>([]);
  const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<ContentView>("courses");
  const [contentTab, setContentTab] = useState<ContentTab>("videos");
  const [showAttachModal, setShowAttachModal] = useState(false);
  const [chapterSearch, setChapterSearch] = useState("");

  // Chapter content
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [chapterNotes, setChapterNotes] = useState<NoteItem[]>([]);

  // Form states
  const [showCourseForm, setShowCourseForm] = useState(false);
  const [showChapterForm, setShowChapterForm] = useState(false);
  const [showVideoForm, setShowVideoForm] = useState(false);
  const [showNoteForm, setShowNoteForm] = useState(false);

  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [editingChapter, setEditingChapter] = useState<Chapter | null>(null);
  const [editingVideo, setEditingVideo] = useState<VideoItem | null>(null);
  const [editingNote, setEditingNote] = useState<NoteItem | null>(null);

  // Course form
  const [courseName, setCourseName] = useState("");
  const [courseDesc, setCourseDesc] = useState("");
  const [courseTier, setCourseTier] = useState("FREE");
  const [courseOrder, setCourseOrder] = useState(0);

  // Chapter form
  const [chapterName, setChapterName] = useState("");
  const [chapterAnimationKey, setChapterAnimationKey] = useState("");
  const [chapterOrder, setChapterOrder] = useState(0);

  // Video form
  const [videoTitle, setVideoTitle] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [videoType, setVideoType] = useState("ANIMATED_VIDEO");
  const [videoLang, setVideoLang] = useState("HINDI");
  const [videoFree, setVideoFree] = useState(false);
  const [videoOrder, setVideoOrder] = useState(0);

  // Note form
  const [noteTitle, setNoteTitle] = useState("");
  const [noteUrl, setNoteUrl] = useState("");
  const [noteFree, setNoteFree] = useState(false);
  const [noteOrder, setNoteOrder] = useState(0);

  useEffect(() => { fetchCourses(); fetchAllChapters(); }, []);

  async function fetchCourses() {
    try {
      const res = await api.get("/courses");
      setCourses(res.data);
    } catch { toast.error("Failed to load courses"); }
    setLoading(false);
  }

  async function fetchChapters(courseId: string) {
    try {
      const res = await api.get(`/admin/courses/${courseId}`);
      setChapters(res.data.chapters || []);
    } catch { toast.error("Failed to load chapters"); }
  }

  async function fetchAllChapters() {
    try {
      const res = await api.get("/admin/chapters-list");
      setAllChapters(res.data);
    } catch { setAllChapters([]); }
  }

  async function fetchChapterContent(chapterId: string) {
    try {
      const [vRes, nRes] = await Promise.all([
        api.get(`/admin/videos/chapter/${chapterId}`),
        api.get(`/admin/notes/chapter/${chapterId}`),
      ]);
      setVideos(vRes.data);
      setChapterNotes(nRes.data);
    } catch { toast.error("Failed to load content"); }
  }

  // Course CRUD
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
      fetchCourses();
    } catch { toast.error("Failed to delete"); }
  }

  // Chapter CRUD
  async function saveChapter() {
    try {
      const data = { name: chapterName, courseId: selectedCourse!.id, displayOrder: chapterOrder, animationKey: chapterAnimationKey || null };
      if (editingChapter) {
        await api.put(`/admin/chapters/${editingChapter.id}`, data);
        toast.success("Chapter updated");
      } else {
        await api.post("/admin/chapters", data);
        toast.success("Chapter created");
      }
      resetChapterForm();
      fetchChapters(selectedCourse!.id);
      fetchCourses();
      fetchAllChapters();
    } catch { toast.error("Failed to save chapter"); }
  }

  async function deleteChapter(id: string) {
    if (!confirm("Remove this chapter from the course? The chapter stays in Content Management.")) return;
    try {
      await api.delete(`/admin/courses/${selectedCourse!.id}/chapters/${id}`);
      toast.success("Chapter removed from course");
      fetchChapters(selectedCourse!.id);
      fetchCourses();
    } catch { toast.error("Failed to delete"); }
  }

  async function attachChapter(chapterId: string) {
    try {
      await api.post(`/admin/courses/${selectedCourse!.id}/chapters`, { chapterId, order: chapters.length + 1 });
      toast.success("Chapter added to course");
      fetchChapters(selectedCourse!.id);
      fetchCourses();
      fetchAllChapters();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to add chapter");
    }
  }

  // Video CRUD
  async function saveVideo() {
    try {
      const data = { title: videoTitle, youtubeUrl: videoUrl, videoType: videoType, language: videoLang, isFree: videoFree, displayOrder: videoOrder, chapterId: selectedChapter!.id };
      if (editingVideo) {
        await api.put(`/admin/videos/${editingVideo.id}`, data);
        toast.success("Video updated");
      } else {
        await api.post("/admin/videos", data);
        toast.success("Video added");
      }
      resetVideoForm();
      fetchChapterContent(selectedChapter!.id);
      fetchChapters(selectedCourse!.id);
    } catch { toast.error("Failed to save video"); }
  }

  async function deleteVideo(id: string) {
    if (!confirm("Delete this video?")) return;
    try {
      await api.delete(`/admin/videos/${id}`);
      toast.success("Video deleted");
      fetchChapterContent(selectedChapter!.id);
      fetchChapters(selectedCourse!.id);
    } catch { toast.error("Failed to delete"); }
  }

  // Note CRUD
  async function saveNote() {
    try {
      const data = { title: noteTitle, fileUrl: noteUrl, isFree: noteFree, displayOrder: noteOrder, chapterId: selectedChapter!.id };
      if (editingNote) {
        await api.put(`/admin/notes/${editingNote.id}`, data);
        toast.success("Note updated");
      } else {
        await api.post("/admin/notes", data);
        toast.success("Note added");
      }
      resetNoteForm();
      fetchChapterContent(selectedChapter!.id);
      fetchChapters(selectedCourse!.id);
    } catch { toast.error("Failed to save note"); }
  }

  async function deleteNote(id: string) {
    if (!confirm("Delete this note?")) return;
    try {
      await api.delete(`/admin/notes/${id}`);
      toast.success("Note deleted");
      fetchChapterContent(selectedChapter!.id);
      fetchChapters(selectedCourse!.id);
    } catch { toast.error("Failed to delete"); }
  }

  // Reset helpers
  function resetCourseForm() { setShowCourseForm(false); setEditingCourse(null); setCourseName(""); setCourseDesc(""); setCourseTier("FREE"); setCourseOrder(0); }
  function resetChapterForm() { setShowChapterForm(false); setEditingChapter(null); setChapterName(""); setChapterAnimationKey(""); setChapterOrder(0); }
  function resetVideoForm() { setShowVideoForm(false); setEditingVideo(null); setVideoTitle(""); setVideoUrl(""); setVideoType("ANIMATED_VIDEO"); setVideoLang("HINDI"); setVideoFree(false); setVideoOrder(0); }
  function resetNoteForm() { setShowNoteForm(false); setEditingNote(null); setNoteTitle(""); setNoteUrl(""); setNoteFree(false); setNoteOrder(0); }

  function openEditVideo(v: VideoItem) { setEditingVideo(v); setVideoTitle(v.title); setVideoUrl(v.youtubeUrl); setVideoType(v.videoType); setVideoLang(v.language); setVideoFree(v.isFree); setVideoOrder(v.displayOrder); setShowVideoForm(true); }
  function openEditNote(n: NoteItem) { setEditingNote(n); setNoteTitle(n.title); setNoteUrl(n.fileUrl); setNoteFree(n.isFree); setNoteOrder(n.displayOrder); setShowNoteForm(true); }

  function selectCourse(course: Course) { setSelectedCourse(course); setView("chapters"); fetchChapters(course.id); }
  function selectChapter(ch: Chapter) { setSelectedChapter(ch); setView("content"); setContentTab("videos"); fetchChapterContent(ch.id); }
  function goBack() {
    if (view === "content") { setView("chapters"); setSelectedChapter(null); }
    else if (view === "chapters") { setView("courses"); setSelectedCourse(null); }
  }

  const tierColors: Record<string, string> = {
    FREE: "bg-emerald-500/10 text-emerald-400",
    BASIC: "bg-accent/10 text-accent",
    ADVANCE: "bg-secondary/10 text-secondary-light",
    BRIDGE: "bg-orange-500/10 text-orange-400",
  };
  const getAnimationLabel = (key?: string | null) => chapterAnimationOptions.find((option) => option.key === key)?.label || "Auto by chapter name";
  const filteredLibraryChapters = allChapters.filter((chapter) => chapter.name.toLowerCase().includes(chapterSearch.toLowerCase()));
  const isChapterInCourse = (chapterId: string) => chapters.some((chapter) => chapter.id === chapterId);

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          {view !== "courses" && (
            <button onClick={goBack} className="p-2 hover:bg-surface-light rounded-lg transition-colors">
              <ChevronLeft className="w-5 h-5 text-text-muted" />
            </button>
          )}
          <div>
            <h1 className="text-2xl font-bold text-text-bright">
              {view === "courses" ? "Courses" : view === "chapters" ? selectedCourse?.name : selectedChapter?.name}
            </h1>
            <p className="text-text-muted text-sm mt-0.5">
              {view === "courses" ? "Manage courses, chapters, and content" : view === "chapters" ? "Manage chapters" : "Manage videos, notes & questions"}
            </p>
          </div>
        </div>
        {view === "courses" && (
          <Button onClick={() => { resetCourseForm(); setShowCourseForm(true); }}><Plus className="w-4 h-4 mr-2" />Add Course</Button>
        )}
        {view === "chapters" && (
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => { fetchAllChapters(); setShowAttachModal(true); }}><Library className="w-4 h-4 mr-2" />Add From Content</Button>
            <Button onClick={() => { resetChapterForm(); setShowChapterForm(true); }}><Plus className="w-4 h-4 mr-2" />Create Chapter</Button>
          </div>
        )}
        {view === "content" && contentTab === "videos" && (
          <Button onClick={() => { resetVideoForm(); setVideoOrder(videos.length + 1); setShowVideoForm(true); }}><Plus className="w-4 h-4 mr-2" />Add Video</Button>
        )}
        {view === "content" && contentTab === "notes" && (
          <Button onClick={() => { resetNoteForm(); setNoteOrder(chapterNotes.length + 1); setShowNoteForm(true); }}><Plus className="w-4 h-4 mr-2" />Add Note</Button>
        )}
      </div>

      {/* ===== COURSES VIEW ===== */}
      {view === "courses" && (
        loading ? (
          <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="h-20 rounded-xl bg-card animate-pulse" />)}</div>
        ) : courses.length === 0 ? (
          <div className="rounded-xl border border-border bg-card p-8 text-center">
            <BookOpen className="w-8 h-8 text-text-muted mx-auto mb-2" />
            <p className="text-text-muted text-sm">No courses yet.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {courses.map((course) => (
              <div key={course.id} onClick={() => selectCourse(course)} className="rounded-xl border border-border bg-card p-4 cursor-pointer hover:border-accent/30 transition-all">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-text-bright text-sm">{course.name}</h4>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${tierColors[course.tier] || ""}`}>{course.tier}</span>
                    </div>
                    <p className="text-xs text-text-muted">{course._count.chapters} chapters</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={(e) => { e.stopPropagation(); setEditingCourse(course); setCourseName(course.name); setCourseDesc(course.description || ""); setCourseTier(course.tier); setCourseOrder(course.displayOrder); setShowCourseForm(true); }} className="p-1.5 hover:bg-surface-light rounded-lg"><Edit2 className="w-3.5 h-3.5 text-text-muted" /></button>
                    <button onClick={(e) => { e.stopPropagation(); deleteCourse(course.id); }} className="p-1.5 hover:bg-danger/10 rounded-lg"><Trash2 className="w-3.5 h-3.5 text-danger" /></button>
                    <ChevronRight className="w-4 h-4 text-text-muted ml-1" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {/* ===== CHAPTERS VIEW ===== */}
      {view === "chapters" && (
        chapters.length === 0 ? (
          <div className="rounded-xl border border-border bg-card p-8 text-center">
            <p className="text-text-muted text-sm">No chapters. Add from Content Management or create a new one.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {chapters.map((ch) => (
              <div key={ch.id} onClick={() => selectChapter(ch)} className="rounded-xl border border-border bg-card p-4 cursor-pointer hover:border-accent/30 transition-all">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-text-bright text-sm">{ch.name}</h4>
                    <div className="flex items-center gap-3 mt-1 text-xs text-text-muted">
                      <span className="flex items-center gap-1"><Video className="w-3 h-3" />{ch._count.videos}</span>
                      <span className="flex items-center gap-1"><FileText className="w-3 h-3" />{ch._count.notes}</span>
                      <span className="flex items-center gap-1"><HelpCircle className="w-3 h-3" />{ch._count.questions}</span>
                      <span className="flex items-center gap-1 text-accent"><Atom className="w-3 h-3" />{getAnimationLabel(ch.animationKey)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={(e) => { e.stopPropagation(); setEditingChapter(ch); setChapterName(ch.name); setChapterAnimationKey(ch.animationKey || ""); setChapterOrder(ch.displayOrder); setShowChapterForm(true); }} className="p-1.5 hover:bg-surface-light rounded-lg"><Edit2 className="w-3.5 h-3.5 text-text-muted" /></button>
                    <button onClick={(e) => { e.stopPropagation(); deleteChapter(ch.id); }} className="p-1.5 hover:bg-danger/10 rounded-lg" title="Remove from course"><Trash2 className="w-3.5 h-3.5 text-danger" /></button>
                    <ChevronRight className="w-4 h-4 text-text-muted ml-1" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {/* ===== CONTENT VIEW (Videos / Notes / Questions) ===== */}
      {view === "content" && (
        <>
          {/* Content Tabs */}
          <div className="border-b border-border mb-6">
            <div className="flex gap-1">
              {(["videos", "notes", "questions"] as ContentTab[]).map((tab) => (
                <button key={tab} onClick={() => setContentTab(tab)} className={`px-5 py-3 text-sm font-medium border-b-2 transition-all capitalize ${contentTab === tab ? "border-accent text-accent" : "border-transparent text-text-muted hover:text-text-bright"}`}>
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Videos */}
          {contentTab === "videos" && (
            <div className="space-y-2">
              {videos.length === 0 ? (
                <div className="rounded-xl border border-border bg-card p-8 text-center">
                  <Video className="w-8 h-8 text-text-muted mx-auto mb-2" />
                  <p className="text-text-muted text-sm">No videos yet. Add the first one!</p>
                </div>
              ) : videos.map((v) => (
                <div key={v.id} className="rounded-xl border border-border bg-card p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h4 className="font-medium text-text-bright text-sm">{v.title}</h4>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${v.language === "HINDI" ? "bg-orange-500/10 text-orange-400" : "bg-blue-500/10 text-blue-400"}`}>{v.language}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-accent/10 text-accent">{v.videoType === "ANIMATED_VIDEO" ? "Animation" : "Lecture"}</span>
                        {v.isFree && <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-emerald-500/10 text-emerald-400">FREE</span>}
                      </div>
                      <p className="text-xs text-text-muted truncate">{v.youtubeUrl}</p>
                    </div>
                    <div className="flex items-center gap-1 ml-2">
                      <button onClick={() => openEditVideo(v)} className="p-1.5 hover:bg-surface-light rounded-lg"><Edit2 className="w-3.5 h-3.5 text-text-muted" /></button>
                      <button onClick={() => deleteVideo(v.id)} className="p-1.5 hover:bg-danger/10 rounded-lg"><Trash2 className="w-3.5 h-3.5 text-danger" /></button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Notes */}
          {contentTab === "notes" && (
            <div className="space-y-2">
              {chapterNotes.length === 0 ? (
                <div className="rounded-xl border border-border bg-card p-8 text-center">
                  <FileText className="w-8 h-8 text-text-muted mx-auto mb-2" />
                  <p className="text-text-muted text-sm">No notes yet. Add the first one!</p>
                </div>
              ) : chapterNotes.map((n) => (
                <div key={n.id} className="rounded-xl border border-border bg-card p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-text-bright text-sm mb-1">{n.title}</h4>
                      <p className="text-xs text-text-muted truncate">{n.fileUrl}</p>
                    </div>
                    <div className="flex items-center gap-1 ml-2">
                      <button onClick={() => openEditNote(n)} className="p-1.5 hover:bg-surface-light rounded-lg"><Edit2 className="w-3.5 h-3.5 text-text-muted" /></button>
                      <button onClick={() => deleteNote(n.id)} className="p-1.5 hover:bg-danger/10 rounded-lg"><Trash2 className="w-3.5 h-3.5 text-danger" /></button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Questions placeholder */}
          {contentTab === "questions" && (
            <div className="rounded-xl border border-border bg-card p-8 text-center">
              <HelpCircle className="w-8 h-8 text-text-muted mx-auto mb-2" />
              <p className="text-text-muted text-sm">Question management coming soon</p>
            </div>
          )}
        </>
      )}

      {/* ===== MODALS ===== */}

      {/* Course Form */}
      {showCourseForm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-text-bright">{editingCourse ? "Edit Course" : "New Course"}</h2>
              <button onClick={resetCourseForm}><X className="w-5 h-5 text-text-muted" /></button>
            </div>
            <div className="space-y-4">
              <div><label className="block text-sm text-text-muted mb-1">Name</label><Input value={courseName} onChange={(e) => setCourseName(e.target.value)} placeholder="e.g. Basic Physics" /></div>
              <div><label className="block text-sm text-text-muted mb-1">Description</label><Input value={courseDesc} onChange={(e) => setCourseDesc(e.target.value)} placeholder="Course description" /></div>
              <div><label className="block text-sm text-text-muted mb-1">Tier</label>
                <select value={courseTier} onChange={(e) => setCourseTier(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-surface border border-border text-text focus:border-accent focus:outline-none">
                  <option value="FREE">Free</option><option value="BASIC">Basic</option><option value="ADVANCE">Advance</option><option value="BRIDGE">Bridge</option>
                </select>
              </div>
              <div><label className="block text-sm text-text-muted mb-1">Display Order</label><Input type="number" value={courseOrder} onChange={(e) => setCourseOrder(parseInt(e.target.value) || 0)} /></div>
            </div>
            <div className="flex gap-3 mt-6"><Button onClick={saveCourse} className="flex-1">Save</Button><Button variant="ghost" onClick={resetCourseForm} className="flex-1">Cancel</Button></div>
          </div>
        </div>
      )}

      {/* Chapter Form */}
      {showChapterForm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-text-bright">{editingChapter ? "Edit Chapter" : "New Chapter"}</h2>
              <button onClick={resetChapterForm}><X className="w-5 h-5 text-text-muted" /></button>
            </div>
            <div className="space-y-4">
              <div><label className="block text-sm text-text-muted mb-1">Chapter Name</label><Input value={chapterName} onChange={(e) => setChapterName(e.target.value)} placeholder="e.g. Newton's Laws" /></div>
              <div><label className="block text-sm text-text-muted mb-1">Animation Graphic</label>
                <select value={chapterAnimationKey} onChange={(e) => setChapterAnimationKey(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-surface border border-border text-text focus:border-accent focus:outline-none">
                  <option value="">Auto by chapter name</option>
                  {chapterAnimationOptions.map((option) => (
                    <option key={option.key} value={option.key}>{option.label}</option>
                  ))}
                </select>
                <div className="mt-2 flex items-center gap-2 text-xs text-text-muted">
                  <Atom className="w-3.5 h-3.5 text-accent" />
                  <span>This controls the animated visual on the chapter card.</span>
                </div>
              </div>
              <div><label className="block text-sm text-text-muted mb-1">Display Order</label><Input type="number" value={chapterOrder} onChange={(e) => setChapterOrder(parseInt(e.target.value) || 0)} /></div>
            </div>
            <div className="flex gap-3 mt-6"><Button onClick={saveChapter} className="flex-1">Save</Button><Button variant="ghost" onClick={resetChapterForm} className="flex-1">Cancel</Button></div>
          </div>
        </div>
      )}

      {/* Video Form */}
      {showVideoForm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-text-bright">{editingVideo ? "Edit Video" : "Add Video"}</h2>
              <button onClick={resetVideoForm}><X className="w-5 h-5 text-text-muted" /></button>
            </div>
            <div className="space-y-4">
              <div><label className="block text-sm text-text-muted mb-1">Title</label><Input value={videoTitle} onChange={(e) => setVideoTitle(e.target.value)} placeholder="e.g. Introduction to Motion" /></div>
              <div><label className="block text-sm text-text-muted mb-1">Video URL (YouTube / Vimeo)</label><Input value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} placeholder="https://youtube.com/watch?v=..." /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-sm text-text-muted mb-1">Type</label>
                  <select value={videoType} onChange={(e) => setVideoType(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-surface border border-border text-text focus:border-accent focus:outline-none text-sm">
                    <option value="ANIMATED_VIDEO">3D Animation</option><option value="LECTURE">Lecture</option>
                  </select>
                </div>
                <div><label className="block text-sm text-text-muted mb-1">Language</label>
                  <select value={videoLang} onChange={(e) => setVideoLang(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-surface border border-border text-text focus:border-accent focus:outline-none text-sm">
                    <option value="HINDI">Hindi</option><option value="ENGLISH">English</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-sm text-text-muted mb-1">Display Order</label><Input type="number" value={videoOrder} onChange={(e) => setVideoOrder(parseInt(e.target.value) || 0)} /></div>
                <div className="flex items-end pb-1">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={videoFree} onChange={(e) => setVideoFree(e.target.checked)} className="w-4 h-4 rounded border-border accent-accent" />
                    <span className="text-sm text-text-muted">Free video</span>
                  </label>
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-6"><Button onClick={saveVideo} className="flex-1">Save</Button><Button variant="ghost" onClick={resetVideoForm} className="flex-1">Cancel</Button></div>
          </div>
        </div>
      )}

      {/* Note Form */}
      {showNoteForm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-text-bright">{editingNote ? "Edit Note" : "Add Note"}</h2>
              <button onClick={resetNoteForm}><X className="w-5 h-5 text-text-muted" /></button>
            </div>
            <div className="space-y-4">
              <div><label className="block text-sm text-text-muted mb-1">Title</label><Input value={noteTitle} onChange={(e) => setNoteTitle(e.target.value)} placeholder="e.g. Chapter Summary" /></div>
              <div><label className="block text-sm text-text-muted mb-1">File URL (PDF)</label><Input value={noteUrl} onChange={(e) => setNoteUrl(e.target.value)} placeholder="https://..." /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-sm text-text-muted mb-1">Display Order</label><Input type="number" value={noteOrder} onChange={(e) => setNoteOrder(parseInt(e.target.value) || 0)} /></div>
                <div className="flex items-end pb-1">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={noteFree} onChange={(e) => setNoteFree(e.target.checked)} className="w-4 h-4 rounded border-border accent-accent" />
                    <span className="text-sm text-text-muted">Free note</span>
                  </label>
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-6"><Button onClick={saveNote} className="flex-1">Save</Button><Button variant="ghost" onClick={resetNoteForm} className="flex-1">Cancel</Button></div>
          </div>
        </div>
      )}

      {showAttachModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-2xl p-6 w-full max-w-3xl max-h-[80vh] flex flex-col">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <h2 className="text-lg font-bold text-text-bright">Add Chapters to Course</h2>
                <p className="text-sm text-text-muted mt-1">Select chapters from Content Management for {selectedCourse?.name}</p>
              </div>
              <button onClick={() => setShowAttachModal(false)}><X className="w-5 h-5 text-text-muted" /></button>
            </div>

            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
              <Input value={chapterSearch} onChange={(e) => setChapterSearch(e.target.value)} placeholder="Search chapters..." className="pl-10" />
            </div>

            <div className="overflow-y-auto space-y-2 pr-1">
              {filteredLibraryChapters.length === 0 ? (
                <div className="rounded-xl border border-border bg-surface p-8 text-center text-text-muted">No chapters found. Create chapters from Content Management first.</div>
              ) : filteredLibraryChapters.map((chapter) => {
                const alreadyIn = isChapterInCourse(chapter.id);
                return (
                  <div key={chapter.id} className={`rounded-xl border p-4 transition-colors ${alreadyIn ? "border-success/25 bg-success/10" : "border-border bg-surface hover:border-accent/30"}`}>
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <h4 className="font-semibold text-text-bright text-sm">{chapter.name}</h4>
                        <div className="flex items-center gap-3 mt-1 text-xs text-text-muted flex-wrap">
                          <span className="flex items-center gap-1"><Video className="w-3 h-3" />{chapter._count?.videos || 0}</span>
                          <span className="flex items-center gap-1"><FileText className="w-3 h-3" />{chapter._count?.notes || 0}</span>
                          <span className="flex items-center gap-1"><HelpCircle className="w-3 h-3" />{chapter._count?.questions || 0}</span>
                          <span className="flex items-center gap-1 text-accent"><Atom className="w-3 h-3" />{getAnimationLabel(chapter.animationKey)}</span>
                        </div>
                      </div>
                      {alreadyIn ? (
                        <CheckCircle2 className="w-5 h-5 text-success shrink-0" />
                      ) : (
                        <Button size="sm" variant="outline" onClick={() => attachChapter(chapter.id)}>Add</Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
