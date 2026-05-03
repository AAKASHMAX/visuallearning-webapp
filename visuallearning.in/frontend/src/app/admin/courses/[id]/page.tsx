"use client";
import { useEffect, useState, use } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageLoader } from "@/components/ui/loading";
import api from "@/lib/api";
import toast from "react-hot-toast";
import { Plus, Trash2, Library, ArrowLeft, GripVertical, Search, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function AdminCourseDetailsPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const router = useRouter();
  const [course, setCourse] = useState<any>(null);
  const [allClasses, setAllClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [addingChapter, setAddingChapter] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [courseRes, allChaptersRes] = await Promise.all([
        api.get(`/admin/courses/${id}`),
        api.get("/admin/courses-data/chapters")
      ]);
      setCourse(courseRes.data.data);
      setAllClasses(allChaptersRes.data.data);
    } catch {
      toast.error("Failed to load data");
      router.push("/admin/courses");
    }
    setLoading(false);
  };

  const handleAddChapter = async (chapterId: string) => {
    try {
      await api.post(`/admin/courses/${id}/chapters`, { 
        chapterId, 
        order: (course.chapters?.length || 0) + 1 
      });
      toast.success("Chapter added");
      loadData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to add chapter");
    }
  };

  const handleRemoveChapter = async (chapterId: string) => {
    if (!confirm("Remove this chapter from the course?")) return;
    try {
      await api.delete(`/admin/courses/${id}/chapters/${chapterId}`);
      toast.success("Chapter removed");
      loadData();
    } catch {
      toast.error("Failed to remove chapter");
    }
  };

  const isChapterInCourse = (chapterId: string) => {
    return course?.chapters?.some((c: any) => c.chapterId === chapterId);
  };

  if (loading) return <PageLoader />;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <Link href="/admin/courses" className="inline-flex items-center text-sm text-gray-500 hover:text-primary mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4 mr-1" /> Back to Courses
      </Link>

      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{course.name}</h1>
          <p className="text-gray-500">{course.description || "Manage course chapters and structure."}</p>
        </div>
        <Button onClick={() => setAddingChapter(true)} className="rounded-xl shadow-lg shadow-primary/20">
          <Plus className="w-4 h-4 mr-2" /> Add Chapters
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Current Chapters List */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
            Current Structure
            <span className="bg-primary/10 text-primary text-xs px-2 py-1 rounded-full">{course.chapters?.length || 0} Chapters</span>
          </h2>
          
          {course.chapters?.length === 0 ? (
            <Card className="border-2 border-dashed border-gray-200">
              <CardContent className="p-12 text-center">
                <Library className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 font-medium">No chapters added yet.</p>
                <Button variant="outline" onClick={() => setAddingChapter(true)} className="mt-4">
                  Add your first chapter
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {course.chapters.map(({ chapter, order }: any) => (
                <Card key={chapter.id} className="hover:border-primary/30 transition-all group">
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className="bg-gray-100 p-2 rounded-lg cursor-grab active:cursor-grabbing">
                      <GripVertical className="w-4 h-4 text-gray-400" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-gray-900">{chapter.name}</h4>
                      <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                        <span className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-medium">
                          {chapter.subject.class.name}
                        </span>
                        <span className="bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full font-medium">
                          {chapter.subject.name}
                        </span>
                      </div>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleRemoveChapter(chapter.id)}
                      className="text-red-500 hover:text-red-600 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Info/Stats Card */}
        <div className="space-y-6">
          <Card className="bg-white border shadow-sm">
            <CardContent className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-gray-900">Course Info</h3>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={async () => {
                    try {
                      await api.patch(`/admin/courses/${id}`, {
                        name: course.name,
                        description: course.description,
                        vimeoVideoId: course.vimeoVideoId
                      });
                      toast.success("Course updated");
                    } catch {
                      toast.error("Failed to update course");
                    }
                  }}
                  className="text-xs"
                >
                  Save Changes
                </Button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1 block">Course Name</label>
                  <Input 
                    value={course.name} 
                    onChange={(e) => setCourse({ ...course, name: e.target.value })}
                    className="bg-gray-50 border-gray-100 font-bold"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1 block">Description</label>
                  <textarea 
                    value={course.description || ""} 
                    onChange={(e) => setCourse({ ...course, description: e.target.value })}
                    className="w-full min-h-[100px] p-3 text-sm bg-gray-50 border border-gray-100 rounded-lg focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1 block">Preview Vimeo ID</label>
                  <Input 
                    value={course.vimeoVideoId || ""} 
                    placeholder="Enter Vimeo Video ID (e.g. 123456789)"
                    onChange={(e) => setCourse({ ...course, vimeoVideoId: e.target.value })}
                    className="bg-gray-50 border-gray-100 font-mono text-sm"
                  />
                  <p className="text-[10px] text-gray-400 mt-1">This video will appear on the course details preview card.</p>
                </div>
                <div className="pt-4 border-t space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-400">Slug:</span>
                    <span className="font-mono text-gray-600">{course.slug}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-400">Created:</span>
                    <span className="text-gray-600">{new Date(course.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Chapter Selection Modal */}
      {addingChapter && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-4xl max-h-[80vh] flex flex-col shadow-2xl">
            <div className="p-6 border-b flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold">Add Chapters to Course</h3>
                <p className="text-sm text-gray-500">Select chapters from existing classes to include in {course.name}</p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setAddingChapter(false)}>
                <X className="w-6 h-6" />
              </Button>
            </div>
            
            <div className="p-6 bg-gray-50 border-b">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input 
                  className="pl-10 bg-white" 
                  placeholder="Search chapters or subjects..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-8">
              {allClasses.map((cls: any) => {
                const filteredSubjects = cls.subjects.map((sub: any) => ({
                  ...sub,
                  chapters: sub.chapters.filter((ch: any) => 
                    ch.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                    sub.name.toLowerCase().includes(searchTerm.toLowerCase())
                  )
                })).filter((sub: any) => sub.chapters.length > 0);

                if (filteredSubjects.length === 0) return null;

                return (
                  <div key={cls.id} className="space-y-4">
                    <h4 className="text-lg font-black text-gray-900 border-b pb-2">{cls.name}</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {filteredSubjects.map((subject: any) => (
                        <div key={subject.id} className="space-y-2">
                          <h5 className="text-sm font-bold text-primary uppercase tracking-wider flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                            {subject.name}
                          </h5>
                          <div className="space-y-1">
                            {subject.chapters.map((chapter: any) => {
                              const alreadyIn = isChapterInCourse(chapter.id);
                              return (
                                <div 
                                  key={chapter.id} 
                                  className={`flex items-center justify-between p-2 rounded-lg text-sm transition-colors ${alreadyIn ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'hover:bg-gray-100 text-gray-700'}`}
                                >
                                  <span className="font-medium truncate">{chapter.name}</span>
                                  {alreadyIn ? (
                                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                  ) : (
                                    <Button size="sm" variant="ghost" onClick={() => handleAddChapter(chapter.id)} className="h-7 text-primary hover:text-primary-dark font-bold px-2">
                                      Add +
                                    </Button>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
            
            <div className="p-4 border-t bg-gray-50 flex justify-end">
              <Button onClick={() => setAddingChapter(false)}>Done</Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

function X({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
  )
}
