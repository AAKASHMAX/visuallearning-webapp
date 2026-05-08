"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Atom,
  Beaker,
  BookOpen,
  Brain,
  BriefcaseBusiness,
  ChevronRight,
  ClipboardList,
  Dna,
  FileQuestion,
  FileText,
  GraduationCap,
  Layers3,
  Lock,
  MonitorPlay,
  Presentation,
  Sparkles,
  UsersRound,
} from "lucide-react";
import api from "@/lib/api";
import { cn } from "@/lib/utils";
import { PageLoader } from "@/components/ui/loading";

type Audience = "students" | "teachers" | "professional";
type ContentKey = "animated_videos" | "notes" | "quiz" | "question_bank" | "ppts" | "test_series";

type ClassRow = {
  id: string;
  name: string;
  order: number;
  subjects: SubjectRow[];
};

type SubjectRow = {
  id: string;
  classId: string;
  name: string;
  icon?: string | null;
  enabled?: boolean;
  _count?: { chapters: number };
};

type ChapterRow = {
  id: string;
  subjectId: string;
  classId: string;
  className: string;
  subjectName: string;
  name: string;
  order: number;
  contentCount?: number;
  _count?: { videos: number; notes: number; questions: number };
};

const targetClassNames = ["9", "10", "11", "12"];
const targetSubjects = ["physics", "chemistry", "biology"];

const audienceCards = [
  {
    key: "students" as Audience,
    title: "Students",
    subtitle: "Class 9 to 12 science learning",
    icon: GraduationCap,
    tint: "from-sky-500 to-blue-600",
  },
  {
    key: "teachers" as Audience,
    title: "Teachers",
    subtitle: "Class content plus PPTs and tests",
    icon: UsersRound,
    tint: "from-emerald-500 to-teal-600",
  },
  {
    key: "professional" as Audience,
    title: "Professional",
    subtitle: "Subject tracks from basics to advanced",
    icon: BriefcaseBusiness,
    tint: "from-violet-500 to-purple-600",
  },
];

const professionalSubjects = [
  { key: "physics", title: "Physics", subtitle: "Basic to Advanced", icon: Atom, tint: "from-blue-500 to-indigo-600" },
  { key: "chemistry", title: "Chemistry", subtitle: "Basic to Advanced", icon: Beaker, tint: "from-emerald-500 to-teal-600" },
  { key: "biology", title: "Biology", subtitle: "Basic", icon: Dna, tint: "from-rose-500 to-pink-600" },
];

const baseContentCards = [
  { key: "animated_videos" as ContentKey, title: "Animated Videos", subtitle: "3D chapter videos", icon: MonitorPlay },
  { key: "notes" as ContentKey, title: "Notes", subtitle: "Chapter PDF notes", icon: FileText },
  { key: "quiz" as ContentKey, title: "Quiz", subtitle: "Practice MCQs", icon: Brain },
  { key: "question_bank" as ContentKey, title: "Question Bank", subtitle: "Chapter questions", icon: FileQuestion },
];

const teacherExtraCards = [
  { key: "ppts" as ContentKey, title: "PPTs", subtitle: "Teaching slide decks", icon: Presentation },
  { key: "test_series" as ContentKey, title: "Test Series", subtitle: "Assessments and tests", icon: ClipboardList },
];

const professionalExtraCards = [
  { key: "ppts" as ContentKey, title: "PPTs", subtitle: "Professional slide decks", icon: Presentation },
];

function subjectIcon(name: string) {
  const lower = name.toLowerCase();
  if (lower.includes("chemistry")) return Beaker;
  if (lower.includes("biology")) return Dna;
  return Atom;
}

function subjectTint(name: string) {
  const lower = name.toLowerCase();
  if (lower.includes("chemistry")) return "from-emerald-500 to-teal-600";
  if (lower.includes("biology")) return "from-rose-500 to-pink-600";
  return "from-blue-500 to-indigo-600";
}

function chapterContentCount(chapter: ChapterRow, contentKey: ContentKey) {
  if (typeof chapter.contentCount === "number") return chapter.contentCount;
  if (contentKey === "notes") return chapter._count?.notes || 0;
  if (contentKey === "quiz" || contentKey === "question_bank") return chapter._count?.questions || 0;
  return chapter._count?.videos || 0;
}

function contentQuery(contentKey: ContentKey) {
  if (contentKey === "animated_videos") return "animated_videos";
  if (contentKey === "notes") return "notes";
  if (contentKey === "quiz" || contentKey === "question_bank") return "quiz";
  return "";
}

function chapterTab(contentKey: ContentKey) {
  if (contentKey === "notes") return "notes";
  if (contentKey === "quiz" || contentKey === "question_bank") return "quiz";
  return "videos";
}

function isTargetClass(name: string) {
  const normalized = name.toLowerCase();
  return targetClassNames.some((item) => normalized.includes(item));
}

function isTargetSubject(name: string) {
  const normalized = name.toLowerCase();
  return targetSubjects.some((item) => normalized.includes(item));
}

export default function CoursesPage() {
  const [loading, setLoading] = useState(true);
  const [classes, setClasses] = useState<ClassRow[]>([]);
  const [audience, setAudience] = useState<Audience>("students");
  const [selectedClassId, setSelectedClassId] = useState("");
  const [selectedSubjectId, setSelectedSubjectId] = useState("");
  const [selectedProfessional, setSelectedProfessional] = useState("");
  const [selectedContent, setSelectedContent] = useState<ContentKey | "">("");
  const [chapters, setChapters] = useState<ChapterRow[]>([]);
  const [chaptersLoading, setChaptersLoading] = useState(false);

  useEffect(() => {
    async function loadStructure() {
      setLoading(true);
      try {
        const { data } = await api.get("/courses/classes");
        const classList = data.data || [];
        const hydrated = await Promise.all(
          classList.map(async (classItem: ClassRow) => {
            try {
              const subjectsRes = await api.get(`/courses/classes/${classItem.id}/subjects`);
              return {
                ...classItem,
                subjects: (subjectsRes.data.data?.subjects || []).filter((subject: SubjectRow) => isTargetSubject(subject.name)),
              };
            } catch {
              return { ...classItem, subjects: [] };
            }
          })
        );

        const nextClasses = hydrated
          .filter((classItem) => isTargetClass(classItem.name))
          .sort((a, b) => (a.order || 0) - (b.order || 0));
        setClasses(nextClasses);
        setSelectedClassId(nextClasses[0]?.id || "");
      } catch {
        setClasses([]);
      } finally {
        setLoading(false);
      }
    }

    loadStructure();
  }, []);

  const activeClass = classes.find((item) => item.id === selectedClassId) || classes[0];
  const studentSubjects = (activeClass?.subjects || []).filter((subject) => subject.enabled !== false);
  const activeSubject = studentSubjects.find((item) => item.id === selectedSubjectId);

  const contentCards = useMemo(() => {
    if (audience === "teachers") return [...baseContentCards, ...teacherExtraCards];
    if (audience === "professional") return [...baseContentCards, ...professionalExtraCards];
    return baseContentCards;
  }, [audience]);

  useEffect(() => {
    setSelectedClassId(classes[0]?.id || "");
    setSelectedSubjectId("");
    setSelectedProfessional("");
    setSelectedContent("");
    setChapters([]);
  }, [audience, classes]);

  useEffect(() => {
    setSelectedSubjectId("");
    setSelectedContent("");
    setChapters([]);
  }, [selectedClassId]);

  useEffect(() => {
    setSelectedContent("");
    setChapters([]);
  }, [selectedSubjectId, selectedProfessional]);

  useEffect(() => {
    async function loadChapters() {
      if (!selectedContent) {
        setChapters([]);
        return;
      }

      if (selectedContent === "ppts" || selectedContent === "test_series") {
        setChapters([]);
        return;
      }

      const subjectsToLoad = audience === "professional"
        ? classes.flatMap((classItem) =>
            classItem.subjects
              .filter((subject) => subject.enabled !== false && subject.name.toLowerCase().includes(selectedProfessional))
              .map((subject) => ({ ...subject, className: classItem.name }))
          )
        : activeSubject
          ? [{ ...activeSubject, className: activeClass?.name || "" }]
          : [];

      if (subjectsToLoad.length === 0) {
        setChapters([]);
        return;
      }

      setChaptersLoading(true);
      try {
        const query = contentQuery(selectedContent);
        const results = await Promise.all(
          subjectsToLoad.map(async (subject) => {
            const suffix = query ? `?contentType=${query}` : "";
            const { data } = await api.get(`/courses/subjects/${subject.id}/chapters${suffix}`);
            const subjectData = data.data?.subject;
            return (data.data?.chapters || []).map((chapter: any) => ({
              ...chapter,
              classId: subjectData?.class?.id || subject.classId,
              className: subjectData?.class?.name || subject.className,
              subjectId: subject.id,
              subjectName: subject.name,
            }));
          })
        );
        setChapters(results.flat());
      } catch {
        setChapters([]);
      } finally {
        setChaptersLoading(false);
      }
    }

    loadChapters();
  }, [activeClass?.name, activeSubject, audience, classes, selectedContent, selectedProfessional]);

  if (loading) return <PageLoader />;

  const selectionReady = audience === "professional" ? selectedProfessional : selectedSubjectId;
  const selectedTitle = audience === "professional"
    ? professionalSubjects.find((subject) => subject.key === selectedProfessional)?.title
    : activeSubject?.name;

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-8 rounded-2xl border border-gray-200 bg-white px-6 py-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary/10 bg-primary-light px-3 py-1 text-xs font-black uppercase tracking-wider text-primary">
              <Layers3 className="h-4 w-4" />
              VisualLearning Library
            </div>
            <h1 className="text-3xl font-black tracking-tight text-heading sm:text-4xl">Choose Your Learning Path</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-text-muted">
              Browse student, teacher, and professional science content through class, subject, and resource type.
            </p>
          </div>
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-bold text-amber-700">
            First chapter is open. Remaining content unlocks with subscription.
          </div>
        </div>
      </div>

      <section className="mb-8">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-black text-heading">Audience</h2>
          <span className="text-xs font-bold uppercase tracking-wider text-text-light">Step 1</span>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {audienceCards.map((card) => (
            <button
              key={card.key}
              type="button"
              onClick={() => setAudience(card.key)}
              className={cn(
                "group rounded-2xl border bg-white p-5 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md",
                audience === card.key ? "border-primary ring-2 ring-primary/10" : "border-gray-200"
              )}
            >
              <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${card.tint} text-white shadow-sm transition-transform group-hover:scale-105`}>
                <card.icon className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-black text-heading">{card.title}</h3>
              <p className="mt-1 text-sm text-text-muted">{card.subtitle}</p>
            </button>
          ))}
        </div>
      </section>

      {audience !== "professional" ? (
        <>
          <section className="mb-8">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-lg font-black text-heading">Classes</h2>
              <span className="text-xs font-bold uppercase tracking-wider text-text-light">Step 2</span>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {classes.map((classItem) => (
                <button
                  key={classItem.id}
                  type="button"
                  onClick={() => setSelectedClassId(classItem.id)}
                  className={cn(
                    "rounded-2xl border bg-white p-5 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md",
                    selectedClassId === classItem.id ? "border-accent ring-2 ring-accent/10" : "border-gray-200"
                  )}
                >
                  <BookOpen className="mb-5 h-7 w-7 text-accent" />
                  <h3 className="text-xl font-black text-heading">{classItem.name}</h3>
                  <p className="mt-1 text-sm text-text-muted">{classItem.subjects.length} science subjects</p>
                </button>
              ))}
            </div>
          </section>

          <section className="mb-8">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-lg font-black text-heading">Subjects</h2>
              <span className="text-xs font-bold uppercase tracking-wider text-text-light">Step 3</span>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              {studentSubjects.map((subject) => {
                const Icon = subjectIcon(subject.name);
                return (
                  <button
                    key={subject.id}
                    type="button"
                    onClick={() => setSelectedSubjectId(subject.id)}
                    className={cn(
                      "group rounded-2xl border bg-white p-5 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md",
                      selectedSubjectId === subject.id ? "border-primary ring-2 ring-primary/10" : "border-gray-200"
                    )}
                  >
                    <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${subjectTint(subject.name)} text-white transition-transform group-hover:scale-105`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <h3 className="text-lg font-black text-heading">{subject.name}</h3>
                    <p className="mt-1 text-sm text-text-muted">{subject._count?.chapters || 0} chapters</p>
                  </button>
                );
              })}
            </div>
          </section>
        </>
      ) : (
        <section className="mb-8">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-black text-heading">Professional Tracks</h2>
            <span className="text-xs font-bold uppercase tracking-wider text-text-light">Step 2</span>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {professionalSubjects.map((subject) => (
              <button
                key={subject.key}
                type="button"
                onClick={() => setSelectedProfessional(subject.key)}
                className={cn(
                  "group min-h-44 rounded-2xl border bg-white p-6 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md",
                  selectedProfessional === subject.key ? "border-primary ring-2 ring-primary/10" : "border-gray-200"
                )}
              >
                <div className={`mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${subject.tint} text-white transition-transform group-hover:scale-105`}>
                  <subject.icon className="h-7 w-7" />
                </div>
                <h3 className="text-xl font-black text-heading">{subject.title}</h3>
                <p className="mt-2 text-sm text-text-muted">{subject.subtitle}</p>
              </button>
            ))}
          </div>
        </section>
      )}

      {selectionReady && (
        <section className="mb-8">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-black text-heading">Content Type</h2>
            <span className="text-xs font-bold uppercase tracking-wider text-text-light">Step 4</span>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {contentCards.map((content) => (
              <button
                key={content.key}
                type="button"
                onClick={() => setSelectedContent(content.key)}
                className={cn(
                  "rounded-2xl border bg-white p-5 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md",
                  selectedContent === content.key ? "border-accent ring-2 ring-accent/10" : "border-gray-200"
                )}
              >
                <content.icon className="mb-5 h-7 w-7 text-primary" />
                <h3 className="text-base font-black text-heading">{content.title}</h3>
                <p className="mt-1 text-sm text-text-muted">{content.subtitle}</p>
              </button>
            ))}
          </div>
        </section>
      )}

      {selectedContent && (
        <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-black text-heading">
                {contentCards.find((item) => item.key === selectedContent)?.title} {selectedTitle ? `- ${selectedTitle}` : ""}
              </h2>
              <p className="mt-1 text-sm text-text-muted">
                Chapter cards are pulled from existing class and subject content.
              </p>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full bg-primary-light px-3 py-1 text-xs font-black text-primary">
              <Sparkles className="h-3.5 w-3.5" />
              Preview first chapter
            </div>
          </div>

          {selectedContent === "ppts" || selectedContent === "test_series" ? (
            <div className="rounded-2xl border border-dashed border-gray-200 bg-surface p-10 text-center">
              <Presentation className="mx-auto mb-4 h-10 w-10 text-primary/50" />
              <h3 className="text-lg font-black text-heading">Content section ready</h3>
              <p className="mx-auto mt-2 max-w-lg text-sm text-text-muted">
                This {selectedContent === "ppts" ? "PPTs" : "Test Series"} section is added to the learning flow. Upload and database fields can be added in the next pass.
              </p>
            </div>
          ) : chaptersLoading ? (
            <PageLoader />
          ) : chapters.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-gray-200 bg-surface p-10 text-center">
              <BookOpen className="mx-auto mb-4 h-10 w-10 text-primary/50" />
              <h3 className="text-lg font-black text-heading">No chapters found</h3>
              <p className="mt-2 text-sm text-text-muted">Content for this section will appear after chapters are added in admin.</p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {chapters.map((chapter, index) => {
                const unlocked = (chapter.order || index + 1) === 1;
                const tab = chapterTab(selectedContent);
                const returnTo = encodeURIComponent("/courses");
                const href = `/courses/${chapter.classId}/${chapter.subjectId}/${chapter.id}?tab=${tab}&returnTo=${returnTo}`;
                return (
                  <Link
                    key={`${chapter.subjectId}-${chapter.id}`}
                    href={href}
                    className="group rounded-2xl border border-gray-200 bg-surface p-5 transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:bg-white hover:shadow-md"
                  >
                    <div className="mb-5 flex items-start justify-between gap-4">
                      <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${subjectTint(chapter.subjectName)} text-white`}>
                        <BookOpen className="h-6 w-6" />
                      </div>
                      <span className={cn(
                        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-black",
                        unlocked ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-700"
                      )}>
                        {unlocked ? "Preview" : <><Lock className="h-3 w-3" /> Locked</>}
                      </span>
                    </div>
                    <p className="mb-1 text-xs font-black uppercase tracking-wider text-text-light">{chapter.className} - {chapter.subjectName}</p>
                    <h3 className="line-clamp-2 text-base font-black text-heading group-hover:text-primary">
                      {chapter.order || index + 1}. {chapter.name}
                    </h3>
                    <div className="mt-4 flex items-center justify-between text-sm text-text-muted">
                      <span>{chapterContentCount(chapter, selectedContent)} resources</span>
                      <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </section>
      )}
    </div>
  );
}
