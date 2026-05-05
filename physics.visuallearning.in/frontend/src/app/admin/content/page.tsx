"use client";

import { useEffect, useState } from "react";
import { Atom, Edit2, FileText, HelpCircle, Plus, Search, Trash2, Video, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import api from "@/lib/api";
import toast from "react-hot-toast";
import { chapterAnimationOptions } from "@/components/chapter-animations";

interface Chapter {
  id: string;
  name: string;
  animationKey?: string | null;
  displayOrder: number;
  _count: { videos: number; notes: number; questions: number; courseLinks: number };
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

type Tab = "chapters" | "videos" | "notes" | "questions";
type QuestionItem = {
  id: string;
  question: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctAnswer: string;
  solution?: string | null;
  displayOrder: number;
};

export default function AdminContentPage() {
  const [tab, setTab] = useState<Tab>("chapters");
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [selectedChapter, setSelectedChapter] = useState("");
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [notes, setNotes] = useState<NoteItem[]>([]);
  const [questions, setQuestions] = useState<QuestionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [showChapterForm, setShowChapterForm] = useState(false);
  const [editingChapter, setEditingChapter] = useState<Chapter | null>(null);
  const [chapterName, setChapterName] = useState("");
  const [chapterAnimationKey, setChapterAnimationKey] = useState("");
  const [chapterOrder, setChapterOrder] = useState(0);

  const [showVideoForm, setShowVideoForm] = useState(false);
  const [editingVideo, setEditingVideo] = useState<VideoItem | null>(null);
  const [videoTitle, setVideoTitle] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [videoType, setVideoType] = useState("ANIMATED_VIDEO");
  const [videoLang, setVideoLang] = useState("HINDI");
  const [videoFree, setVideoFree] = useState(false);
  const [videoOrder, setVideoOrder] = useState(0);

  const [showNoteForm, setShowNoteForm] = useState(false);
  const [editingNote, setEditingNote] = useState<NoteItem | null>(null);
  const [noteTitle, setNoteTitle] = useState("");
  const [noteUrl, setNoteUrl] = useState("");
  const [noteFree, setNoteFree] = useState(false);
  const [noteOrder, setNoteOrder] = useState(0);

  const [showQuestionForm, setShowQuestionForm] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<QuestionItem | null>(null);
  const [questionText, setQuestionText] = useState("");
  const [optionA, setOptionA] = useState("");
  const [optionB, setOptionB] = useState("");
  const [optionC, setOptionC] = useState("");
  const [optionD, setOptionD] = useState("");
  const [correctAnswer, setCorrectAnswer] = useState("A");
  const [solution, setSolution] = useState("");
  const [questionOrder, setQuestionOrder] = useState(0);

  useEffect(() => { fetchChapters(); }, []);
  useEffect(() => { if (selectedChapter) fetchChapterContent(selectedChapter); }, [selectedChapter]);

  async function fetchChapters() {
    try {
      const res = await api.get("/admin/chapters-list");
      setChapters(res.data);
    } catch {
      toast.error("Failed to load chapters");
    } finally {
      setLoading(false);
    }
  }

  async function fetchChapterContent(chapterId: string) {
    try {
      const [vRes, nRes] = await Promise.all([
        api.get(`/chapters/${chapterId}/videos`),
        api.get(`/chapters/${chapterId}/notes`),
      ]);
      const qRes = await api.get(`/admin/questions/chapter/${chapterId}`);
      setVideos(vRes.data);
      setNotes(nRes.data);
      setQuestions(qRes.data);
    } catch {
      toast.error("Failed to load content");
    }
  }

  async function saveChapter() {
    if (!chapterName.trim()) { toast.error("Chapter name is required"); return; }
    const payload = { name: chapterName.trim(), displayOrder: chapterOrder, animationKey: chapterAnimationKey || null };
    try {
      if (editingChapter) {
        await api.put(`/admin/chapters/${editingChapter.id}`, payload);
        toast.success("Chapter updated");
      } else {
        await api.post("/admin/chapters", payload);
        toast.success("Chapter created");
      }
      resetChapterForm();
      fetchChapters();
    } catch {
      toast.error("Failed to save chapter");
    }
  }

  async function deleteChapter(id: string) {
    if (!confirm("Delete this chapter and all its videos/notes/questions?")) return;
    try {
      await api.delete(`/admin/chapters/${id}`);
      toast.success("Chapter deleted");
      if (selectedChapter === id) setSelectedChapter("");
      fetchChapters();
    } catch {
      toast.error("Failed to delete chapter");
    }
  }

  async function saveVideo() {
    if (!selectedChapter) { toast.error("Choose a chapter first"); return; }
    const payload = { title: videoTitle, youtubeUrl: videoUrl, videoType, language: videoLang, isFree: videoFree, displayOrder: videoOrder, chapterId: selectedChapter };
    try {
      if (editingVideo) {
        await api.put(`/admin/videos/${editingVideo.id}`, payload);
        toast.success("Video updated");
      } else {
        await api.post("/admin/videos", payload);
        toast.success("Video added");
      }
      resetVideoForm();
      fetchChapterContent(selectedChapter);
      fetchChapters();
    } catch {
      toast.error("Failed to save video");
    }
  }

  async function deleteVideo(id: string) {
    if (!confirm("Delete this video?")) return;
    try {
      await api.delete(`/admin/videos/${id}`);
      toast.success("Video deleted");
      fetchChapterContent(selectedChapter);
      fetchChapters();
    } catch {
      toast.error("Failed to delete video");
    }
  }

  async function saveNote() {
    if (!selectedChapter) { toast.error("Choose a chapter first"); return; }
    const payload = { title: noteTitle, fileUrl: noteUrl, isFree: noteFree, displayOrder: noteOrder, chapterId: selectedChapter };
    try {
      if (editingNote) {
        await api.put(`/admin/notes/${editingNote.id}`, payload);
        toast.success("Note updated");
      } else {
        await api.post("/admin/notes", payload);
        toast.success("Note added");
      }
      resetNoteForm();
      fetchChapterContent(selectedChapter);
      fetchChapters();
    } catch {
      toast.error("Failed to save note");
    }
  }

  async function deleteNote(id: string) {
    if (!confirm("Delete this note?")) return;
    try {
      await api.delete(`/admin/notes/${id}`);
      toast.success("Note deleted");
      fetchChapterContent(selectedChapter);
      fetchChapters();
    } catch {
      toast.error("Failed to delete note");
    }
  }

  async function saveQuestion() {
    if (!selectedChapter) { toast.error("Choose a chapter first"); return; }
    const payload = { question: questionText, optionA, optionB, optionC, optionD, correctAnswer, solution, displayOrder: questionOrder, chapterId: selectedChapter };
    try {
      if (editingQuestion) {
        await api.put(`/admin/questions/${editingQuestion.id}`, payload);
        toast.success("Question updated");
      } else {
        await api.post("/admin/questions", payload);
        toast.success("Question added");
      }
      resetQuestionForm();
      fetchChapterContent(selectedChapter);
      fetchChapters();
    } catch {
      toast.error("Failed to save question");
    }
  }

  async function deleteQuestion(id: string) {
    if (!confirm("Delete this question?")) return;
    try {
      await api.delete(`/admin/questions/${id}`);
      toast.success("Question deleted");
      fetchChapterContent(selectedChapter);
      fetchChapters();
    } catch {
      toast.error("Failed to delete question");
    }
  }

  function resetChapterForm() { setShowChapterForm(false); setEditingChapter(null); setChapterName(""); setChapterAnimationKey(""); setChapterOrder(0); }
  function resetVideoForm() { setShowVideoForm(false); setEditingVideo(null); setVideoTitle(""); setVideoUrl(""); setVideoType("ANIMATED_VIDEO"); setVideoLang("HINDI"); setVideoFree(false); setVideoOrder(0); }
  function resetNoteForm() { setShowNoteForm(false); setEditingNote(null); setNoteTitle(""); setNoteUrl(""); setNoteFree(false); setNoteOrder(0); }
  function resetQuestionForm() { setShowQuestionForm(false); setEditingQuestion(null); setQuestionText(""); setOptionA(""); setOptionB(""); setOptionC(""); setOptionD(""); setCorrectAnswer("A"); setSolution(""); setQuestionOrder(0); }

  const filteredChapters = chapters.filter((chapter) => chapter.name.toLowerCase().includes(search.toLowerCase()));
  const activeChapter = chapters.find((chapter) => chapter.id === selectedChapter);

  function actionButton() {
    if (tab === "chapters") return <Button onClick={() => { resetChapterForm(); setShowChapterForm(true); }}><Plus className="w-4 h-4 mr-2" />Add Chapter</Button>;
    if (tab === "videos") return <Button disabled={!selectedChapter} onClick={() => { resetVideoForm(); setVideoOrder(videos.length + 1); setShowVideoForm(true); }}><Plus className="w-4 h-4 mr-2" />Add Video</Button>;
    if (tab === "notes") return <Button disabled={!selectedChapter} onClick={() => { resetNoteForm(); setNoteOrder(notes.length + 1); setShowNoteForm(true); }}><Plus className="w-4 h-4 mr-2" />Add Note</Button>;
    return <Button disabled={!selectedChapter} onClick={() => { resetQuestionForm(); setQuestionOrder(questions.length + 1); setShowQuestionForm(true); }}><Plus className="w-4 h-4 mr-2" />Add Question</Button>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-text-bright">Content Management</h1>
          <p className="text-text-muted text-sm mt-0.5">Create chapters once, then attach them to course plans</p>
        </div>
        {actionButton()}
      </div>

      <div className="border-b border-border mb-6">
        <div className="flex gap-1">
          {(["chapters", "videos", "notes", "questions"] as Tab[]).map((item) => (
            <button key={item} onClick={() => setTab(item)} className={`px-5 py-3 text-sm font-medium border-b-2 transition-all capitalize ${tab === item ? "border-accent text-accent" : "border-transparent text-text-muted hover:text-text-bright"}`}>
              {item}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-3 mb-6">
        {tab === "chapters" ? (
          <div className="relative max-w-md w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search chapters..." className="pl-10" />
          </div>
        ) : (
          <select value={selectedChapter} onChange={(e) => setSelectedChapter(e.target.value)} className="w-full lg:max-w-lg px-4 py-3 rounded-xl bg-surface border border-border text-text focus:border-accent focus:outline-none">
            <option value="">Choose chapter to manage content</option>
            {chapters.map((chapter) => <option key={chapter.id} value={chapter.id}>{chapter.name}</option>)}
          </select>
        )}
      </div>

      {tab === "chapters" && (
        loading ? (
          <div className="space-y-3">{[...Array(4)].map((_, index) => <div key={index} className="h-20 rounded-xl bg-card animate-pulse" />)}</div>
        ) : filteredChapters.length === 0 ? (
          <div className="rounded-xl border border-border bg-card p-8 text-center text-text-muted">No chapters found.</div>
        ) : (
          <div className="space-y-2">
            {filteredChapters.map((chapter) => (
              <div key={chapter.id} className="rounded-xl border border-border bg-card p-4 hover:border-accent/30 transition-all">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h4 className="font-semibold text-text-bright text-sm">{chapter.name}</h4>
                    <div className="flex items-center gap-3 mt-1 text-xs text-text-muted flex-wrap">
                      <span className="flex items-center gap-1"><Video className="w-3 h-3" />{chapter._count.videos}</span>
                      <span className="flex items-center gap-1"><FileText className="w-3 h-3" />{chapter._count.notes}</span>
                      <span className="flex items-center gap-1"><HelpCircle className="w-3 h-3" />{chapter._count.questions}</span>
                      <span className="flex items-center gap-1 text-accent"><Atom className="w-3 h-3" />{chapter._count.courseLinks} courses</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => { setEditingChapter(chapter); setChapterName(chapter.name); setChapterAnimationKey(chapter.animationKey || ""); setChapterOrder(chapter.displayOrder); setShowChapterForm(true); }} className="p-1.5 hover:bg-surface-light rounded-lg"><Edit2 className="w-3.5 h-3.5 text-text-muted" /></button>
                    <button onClick={() => deleteChapter(chapter.id)} className="p-1.5 hover:bg-danger/10 rounded-lg"><Trash2 className="w-3.5 h-3.5 text-danger" /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {tab === "videos" && (
        !selectedChapter ? <EmptyContent text="Choose a chapter to manage videos." /> :
        <ContentList title={activeChapter?.name || "Chapter"} items={videos} type="video" onEdit={(item) => { setEditingVideo(item); setVideoTitle(item.title); setVideoUrl(item.youtubeUrl); setVideoType(item.videoType); setVideoLang(item.language); setVideoFree(item.isFree); setVideoOrder(item.displayOrder); setShowVideoForm(true); }} onDelete={deleteVideo} />
      )}

      {tab === "notes" && (
        !selectedChapter ? <EmptyContent text="Choose a chapter to manage notes." /> :
        <ContentList title={activeChapter?.name || "Chapter"} items={notes} type="note" onEdit={(item) => { setEditingNote(item); setNoteTitle(item.title); setNoteUrl(item.fileUrl); setNoteFree(item.isFree); setNoteOrder(item.displayOrder); setShowNoteForm(true); }} onDelete={deleteNote} />
      )}

      {tab === "questions" && (
        !selectedChapter ? <EmptyContent text="Choose a chapter to manage questions." /> :
        questions.length === 0 ? <EmptyContent text="No questions yet." /> :
        <div className="space-y-2">
          {questions.map((item) => (
            <div key={item.id} className="rounded-xl border border-border bg-card p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <h4 className="font-semibold text-text-bright text-sm">{item.question}</h4>
                  <p className="text-xs text-text-muted mt-1">Correct answer: {item.correctAnswer}</p>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => { setEditingQuestion(item); setQuestionText(item.question); setOptionA(item.optionA); setOptionB(item.optionB); setOptionC(item.optionC); setOptionD(item.optionD); setCorrectAnswer(item.correctAnswer); setSolution(item.solution || ""); setQuestionOrder(item.displayOrder); setShowQuestionForm(true); }} className="p-1.5 hover:bg-surface-light rounded-lg"><Edit2 className="w-3.5 h-3.5 text-text-muted" /></button>
                  <button onClick={() => deleteQuestion(item.id)} className="p-1.5 hover:bg-danger/10 rounded-lg"><Trash2 className="w-3.5 h-3.5 text-danger" /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showChapterForm && (
        <Modal title={editingChapter ? "Edit Chapter" : "New Chapter" } onClose={resetChapterForm}>
          <div className="space-y-4">
            <div><label className="block text-sm text-text-muted mb-1">Chapter Name</label><Input value={chapterName} onChange={(e) => setChapterName(e.target.value)} /></div>
            <div><label className="block text-sm text-text-muted mb-1">Animation Graphic</label>
              <select value={chapterAnimationKey} onChange={(e) => setChapterAnimationKey(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-surface border border-border text-text focus:border-accent focus:outline-none">
                <option value="">Auto by chapter name</option>
                {chapterAnimationOptions.map((option) => <option key={option.key} value={option.key}>{option.label}</option>)}
              </select>
            </div>
            <div><label className="block text-sm text-text-muted mb-1">Display Order</label><Input type="number" value={chapterOrder} onChange={(e) => setChapterOrder(parseInt(e.target.value) || 0)} /></div>
          </div>
          <div className="flex gap-3 mt-6"><Button onClick={saveChapter} className="flex-1">Save</Button><Button variant="ghost" onClick={resetChapterForm} className="flex-1">Cancel</Button></div>
        </Modal>
      )}

      {showVideoForm && (
        <Modal title={editingVideo ? "Edit Video" : "Add Video"} onClose={resetVideoForm}>
          <div className="space-y-4">
            <div><label className="block text-sm text-text-muted mb-1">Title</label><Input value={videoTitle} onChange={(e) => setVideoTitle(e.target.value)} /></div>
            <div><label className="block text-sm text-text-muted mb-1">Video URL</label><Input value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="block text-sm text-text-muted mb-1">Type</label><select value={videoType} onChange={(e) => setVideoType(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-surface border border-border text-text focus:border-accent focus:outline-none"><option value="ANIMATED_VIDEO">3D Animation</option><option value="LECTURE">Lecture</option></select></div>
              <div><label className="block text-sm text-text-muted mb-1">Language</label><select value={videoLang} onChange={(e) => setVideoLang(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-surface border border-border text-text focus:border-accent focus:outline-none"><option value="HINDI">Hindi</option><option value="ENGLISH">English</option></select></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="block text-sm text-text-muted mb-1">Order</label><Input type="number" value={videoOrder} onChange={(e) => setVideoOrder(parseInt(e.target.value) || 0)} /></div>
              <label className="flex items-end gap-2 pb-3 text-sm text-text-muted"><input type="checkbox" checked={videoFree} onChange={(e) => setVideoFree(e.target.checked)} className="w-4 h-4 accent-cyan-400" />Free video</label>
            </div>
          </div>
          <div className="flex gap-3 mt-6"><Button onClick={saveVideo} className="flex-1">Save</Button><Button variant="ghost" onClick={resetVideoForm} className="flex-1">Cancel</Button></div>
        </Modal>
      )}

      {showNoteForm && (
        <Modal title={editingNote ? "Edit Note" : "Add Note"} onClose={resetNoteForm}>
          <div className="space-y-4">
            <div><label className="block text-sm text-text-muted mb-1">Title</label><Input value={noteTitle} onChange={(e) => setNoteTitle(e.target.value)} /></div>
            <div><label className="block text-sm text-text-muted mb-1">PDF URL</label><Input value={noteUrl} onChange={(e) => setNoteUrl(e.target.value)} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="block text-sm text-text-muted mb-1">Order</label><Input type="number" value={noteOrder} onChange={(e) => setNoteOrder(parseInt(e.target.value) || 0)} /></div>
              <label className="flex items-end gap-2 pb-3 text-sm text-text-muted"><input type="checkbox" checked={noteFree} onChange={(e) => setNoteFree(e.target.checked)} className="w-4 h-4 accent-cyan-400" />Free note</label>
            </div>
          </div>
          <div className="flex gap-3 mt-6"><Button onClick={saveNote} className="flex-1">Save</Button><Button variant="ghost" onClick={resetNoteForm} className="flex-1">Cancel</Button></div>
        </Modal>
      )}

      {showQuestionForm && (
        <Modal title={editingQuestion ? "Edit Question" : "Add Question"} onClose={resetQuestionForm}>
          <div className="space-y-4">
            <div><label className="block text-sm text-text-muted mb-1">Question</label><Input value={questionText} onChange={(e) => setQuestionText(e.target.value)} /></div>
            <div className="grid grid-cols-2 gap-3">
              <Input value={optionA} onChange={(e) => setOptionA(e.target.value)} placeholder="Option A" />
              <Input value={optionB} onChange={(e) => setOptionB(e.target.value)} placeholder="Option B" />
              <Input value={optionC} onChange={(e) => setOptionC(e.target.value)} placeholder="Option C" />
              <Input value={optionD} onChange={(e) => setOptionD(e.target.value)} placeholder="Option D" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="block text-sm text-text-muted mb-1">Correct</label><select value={correctAnswer} onChange={(e) => setCorrectAnswer(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-surface border border-border text-text focus:border-accent focus:outline-none"><option value="A">A</option><option value="B">B</option><option value="C">C</option><option value="D">D</option></select></div>
              <div><label className="block text-sm text-text-muted mb-1">Order</label><Input type="number" value={questionOrder} onChange={(e) => setQuestionOrder(parseInt(e.target.value) || 0)} /></div>
            </div>
            <div><label className="block text-sm text-text-muted mb-1">Solution</label><Input value={solution} onChange={(e) => setSolution(e.target.value)} /></div>
          </div>
          <div className="flex gap-3 mt-6"><Button onClick={saveQuestion} className="flex-1">Save</Button><Button variant="ghost" onClick={resetQuestionForm} className="flex-1">Cancel</Button></div>
        </Modal>
      )}
    </div>
  );
}

function EmptyContent({ text }: { text: string }) {
  return <div className="rounded-xl border border-border bg-card p-8 text-center text-text-muted">{text}</div>;
}

function ContentList({ items, type, onEdit, onDelete }: { title: string; items: any[]; type: "video" | "note"; onEdit: (item: any) => void; onDelete: (id: string) => void }) {
  if (items.length === 0) return <EmptyContent text={`No ${type}s yet.`} />;
  return (
    <div className="space-y-2">
      {items.map((item) => (
        <div key={item.id} className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <h4 className="font-semibold text-text-bright text-sm">{item.title}</h4>
              <p className="text-xs text-text-muted truncate mt-1">{type === "video" ? item.youtubeUrl : item.fileUrl}</p>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={() => onEdit(item)} className="p-1.5 hover:bg-surface-light rounded-lg"><Edit2 className="w-3.5 h-3.5 text-text-muted" /></button>
              <button onClick={() => onDelete(item.id)} className="p-1.5 hover:bg-danger/10 rounded-lg"><Trash2 className="w-3.5 h-3.5 text-danger" /></button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function Modal({ title, children, onClose }: { title: string; children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-card border border-border rounded-2xl p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-text-bright">{title}</h2>
          <button onClick={onClose}><X className="w-5 h-5 text-text-muted" /></button>
        </div>
        {children}
      </div>
    </div>
  );
}
