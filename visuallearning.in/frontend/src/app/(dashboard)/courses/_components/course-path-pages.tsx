"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Atom,
  Beaker,
  BookOpen,
  Brain,
  CheckCircle2,
  ChevronRight,
  Clock3,
  ClipboardList,
  Dna,
  FileCheck,
  FileQuestion,
  FileText,
  FlaskConical,
  GraduationCap,
  Lock,
  MonitorPlay,
  Presentation,
  Sparkles,
  UsersRound,
} from "lucide-react";
import api from "@/lib/api";
import { cn } from "@/lib/utils";
import { PageLoader } from "@/components/ui/loading";

type Audience = "students" | "teachers";
type ContentSlug = "animated-videos" | "notes" | "quiz" | "question-bank" | "pyq" | "ppts" | "virtual-lab" | "test-series";
type SubjectKey = "physics" | "chemistry" | "biology";
type ContentCard = {
  slug: ContentSlug;
  title: string;
  subtitle: string;
  icon: any;
  accent: string;
  href?: string;
  actionLabel?: string;
  comingSoon?: boolean;
};

type ClassRow = {
  id: string;
  name: string;
  order: number;
  _count?: { subjects: number };
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

const audienceMeta = {
  students: {
    title: "Students",
    label: "Student Path",
    description: "Choose your class, subject, content type, and chapter.",
    icon: GraduationCap,
    accent: "from-sky-500 to-cyan-400",
  },
  teachers: {
    title: "Teachers",
    label: "Teacher Path",
    description: "Choose class-wise visual resources for teaching and revision.",
    icon: UsersRound,
    accent: "from-emerald-500 to-lime-400",
  },
};

const professionalSubjects = [
  {
    key: "physics" as SubjectKey,
    title: "Physics",
    subtitle: "Basic to Advanced",
    icon: Atom,
    accent: "from-blue-500 to-cyan-400",
    features: ["Animated videos", "PPTs", "Virtual labs", "Test series"],
  },
  {
    key: "chemistry" as SubjectKey,
    title: "Chemistry",
    subtitle: "Basic to Advanced",
    icon: Beaker,
    accent: "from-emerald-500 to-teal-400",
    features: ["Animated videos", "PPTs", "Virtual labs", "Test series"],
  },
  {
    key: "biology" as SubjectKey,
    title: "Biology",
    subtitle: "Basic",
    icon: Dna,
    accent: "from-rose-500 to-pink-400",
    features: ["Animated videos", "PPTs", "Virtual labs", "Test series"],
  },
];

const pyqCard: ContentCard = {
  slug: "pyq",
  title: "PYQ Solutions",
  subtitle: "Previous year board exam questions with solutions.",
  icon: FileCheck,
  accent: "from-rose-500 to-orange-400",
};

const quizCard: ContentCard = {
  slug: "quiz",
  title: "Quiz",
  subtitle: "Practice MCQs to check understanding.",
  icon: Brain,
  accent: "from-violet-500 to-fuchsia-400",
};

const baseContentCards: ContentCard[] = [
  {
    slug: "animated-videos",
    title: "Animated Videos",
    subtitle: "3D visual lessons arranged chapter-wise.",
    icon: MonitorPlay,
    accent: "from-sky-500 to-cyan-400",
  },
  {
    slug: "notes",
    title: "Notes",
    subtitle: "Chapter PDF notes for study and revision.",
    icon: FileText,
    accent: "from-emerald-500 to-lime-400",
  },
  {
    slug: "question-bank",
    title: "NCERT Questions & Solutions",
    subtitle: "Chapter questions for deeper practice.",
    icon: FileQuestion,
    accent: "from-amber-500 to-orange-400",
  },
  quizCard,
];

const pptsCard: ContentCard = {
  slug: "ppts",
  title: "PPTs",
  subtitle: "Presentation slides for teaching and concept delivery.",
  icon: Presentation,
  accent: "from-indigo-500 to-blue-400",
};

const testSeriesCard: ContentCard = {
  slug: "test-series",
  title: "Test Series",
  subtitle: "Structured tests and assessments for revision.",
  icon: ClipboardList,
  accent: "from-rose-500 to-orange-400",
  comingSoon: true,
};

const virtualLabCard: ContentCard = {
  slug: "virtual-lab",
  title: "Virtual Lab",
  subtitle: "Interactive experiments and simulations.",
  icon: FlaskConical,
  accent: "from-teal-500 to-cyan-400",
  href: "/courses/virtual-lab",
  actionLabel: "Open labs",
};

const teacherContentCards = [baseContentCards[0], pptsCard, baseContentCards[1], baseContentCards[2], pyqCard, testSeriesCard, quizCard];
const professionalContentCards = [baseContentCards[0], pptsCard, baseContentCards[1], baseContentCards[2], pyqCard, virtualLabCard, testSeriesCard, quizCard];
const allContentCards = [...baseContentCards, pyqCard, pptsCard, virtualLabCard, testSeriesCard];
const chapterContentSlugs: ContentSlug[] = ["animated-videos", "notes", "quiz", "question-bank", "pyq", "ppts", "test-series"];

function isTargetClass(name: string) {
  const normalized = name.toLowerCase();
  return targetClassNames.some((item) => normalized.includes(item));
}

function isTargetSubject(name: string) {
  const normalized = name.toLowerCase();
  return targetSubjects.some((item) => normalized.includes(item));
}

function subjectKeyFromName(name: string): SubjectKey {
  const lower = name.toLowerCase();
  if (lower.includes("chemistry")) return "chemistry";
  if (lower.includes("biology")) return "biology";
  return "physics";
}

function subjectVisual(name: string) {
  const key = subjectKeyFromName(name);
  const match = professionalSubjects.find((subject) => subject.key === key) || professionalSubjects[0];
  return match;
}

function contentQuery(slug: ContentSlug) {
  if (slug === "animated-videos") return "animated_videos";
  if (slug === "question-bank") return "question_bank";
  if (slug === "pyq") return "notes";
  return slug;
}

function isChapterContent(slug: ContentSlug) {
  return chapterContentSlugs.includes(slug);
}

function chapterContentCount(chapter: ChapterRow, slug: ContentSlug) {
  if (typeof chapter.contentCount === "number") return chapter.contentCount;
  if (slug === "notes" || slug === "pyq") return chapter._count?.notes || 0;
  if (slug === "quiz" || slug === "question-bank") return chapter._count?.questions || 0;
  if (slug === "ppts") return chapter._count?.notes || 0;
  if (slug === "test-series") return 0;
  return chapter._count?.videos || 0;
}

function useContent(slug: string) {
  return useMemo(
    () => allContentCards.find((card) => card.slug === slug) || baseContentCards[0],
    [slug]
  );
}

async function fetchTargetClasses() {
  const { data } = await api.get("/courses/classes");
  return ((data.data || []) as ClassRow[])
    .filter((classItem) => isTargetClass(classItem.name))
    .sort((a, b) => (a.order || 0) - (b.order || 0));
}

async function fetchClassSubjects(classId: string) {
  const { data } = await api.get(`/courses/classes/${classId}/subjects`);
  const subjects = ((data.data?.subjects || []) as SubjectRow[])
    .filter((subject) => subject.enabled !== false && isTargetSubject(subject.name));

  return {
    className: data.data?.class?.name || "Class",
    subjects,
  };
}

async function fetchSubjectChapters(subjectId: string, slug: ContentSlug) {
  const { data } = await api.get(`/courses/subjects/${subjectId}/chapters?contentType=${contentQuery(slug)}`);
  const subject = data.data?.subject;
  return ((data.data?.chapters || []) as any[]).map((chapter) => ({
    ...chapter,
    classId: subject?.class?.id || chapter.classId,
    className: subject?.class?.name || "",
    subjectId: subject?.id || subjectId,
    subjectName: subject?.name || "",
  })) as ChapterRow[];
}

function PageFrame({
  eyebrow,
  title,
  description,
  backHref,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  backHref: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <Link href={backHref} className="mb-6 inline-flex items-center gap-2 text-sm font-bold text-text-muted hover:text-primary">
        <ArrowLeft className="h-4 w-4" />
        Back
      </Link>
      <div className="mb-8">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary/10 bg-white px-3 py-1 text-xs font-black uppercase tracking-wider text-primary shadow-sm">
          <Sparkles className="h-4 w-4" />
          {eyebrow}
        </div>
        <h1 className="text-3xl font-black tracking-tight text-heading sm:text-4xl">{title}</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-text-muted sm:text-base">{description}</p>
      </div>
      {children}
    </div>
  );
}

function EmptyState({ title, message }: { title: string; message: string }) {
  return (
    <div className="rounded-lg border border-dashed border-gray-200 bg-white p-10 text-center shadow-sm">
      <BookOpen className="mx-auto mb-4 h-10 w-10 text-primary/40" />
      <h2 className="text-lg font-black text-heading">{title}</h2>
      <p className="mt-2 text-sm text-text-muted">{message}</p>
    </div>
  );
}

function ResourcePlaceholder({
  content,
  actionHref,
}: {
  content: ContentCard;
  actionHref?: string;
}) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-8 shadow-sm">
      <div className={`mb-5 flex h-14 w-14 items-center justify-center rounded-lg bg-gradient-to-br ${content.accent} text-white shadow-lg shadow-gray-200`}>
        <content.icon className="h-7 w-7" />
      </div>
      <h2 className="text-2xl font-black text-heading">{content.title}</h2>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-text-muted">
        {content.slug === "virtual-lab"
          ? "Virtual Lab is already available as a separate interactive section."
          : `${content.title} is now included in this course path. Upload fields and backend storage can be connected in the next backend pass.`}
      </p>
      {actionHref && (
        <Link
          href={actionHref}
          className="mt-6 inline-flex items-center gap-2 rounded-lg bg-heading px-5 py-3 text-sm font-black text-white transition-transform hover:-translate-y-0.5"
        >
          {content.actionLabel || "Open"}
          <ArrowRight className="h-4 w-4" />
        </Link>
      )}
    </div>
  );
}

function ComingSoonPanel({ content }: { content: ContentCard }) {
  return (
    <div className="rounded-lg border border-amber-200 bg-amber-50/70 p-8 shadow-sm">
      <div className={`mb-5 flex h-14 w-14 items-center justify-center rounded-lg bg-gradient-to-br ${content.accent} text-white shadow-lg shadow-amber-200`}>
        <content.icon className="h-7 w-7" />
      </div>
      <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-amber-200 bg-white px-3 py-1 text-xs font-black uppercase tracking-wider text-amber-700">
        <Clock3 className="h-4 w-4" />
        Coming soon
      </div>
      <h2 className="text-2xl font-black text-heading">{content.title}</h2>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-text-muted">
        {content.title} is marked as coming soon across VisualLearning courses. This section will open once the content is ready.
      </p>
    </div>
  );
}

export function AudienceClassesPage({ audience }: { audience: Audience }) {
  const [classes, setClasses] = useState<ClassRow[]>([]);
  const [loading, setLoading] = useState(true);
  const meta = audienceMeta[audience];

  useEffect(() => {
    fetchTargetClasses()
      .then(setClasses)
      .catch(() => setClasses([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <PageLoader />;

  return (
    <PageFrame eyebrow={meta.label} title={`${meta.title} Classes`} description={meta.description} backHref="/courses">
      {classes.length === 0 ? (
        <EmptyState title="No classes found" message="Class 9 to 12 cards will appear here after they are added in admin." />
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {classes.map((classItem) => (
            <Link
              key={classItem.id}
              href={`/courses/${audience}/${classItem.id}`}
              className="group rounded-lg border border-gray-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/10"
            >
              <div className={`mb-6 flex h-14 w-14 items-center justify-center rounded-lg bg-gradient-to-br ${meta.accent} text-white shadow-lg shadow-gray-200 transition-transform group-hover:scale-105`}>
                <meta.icon className="h-7 w-7" />
              </div>
              <h2 className="text-2xl font-black text-heading">{classItem.name}</h2>
              <p className="mt-2 text-sm text-text-muted">Physics, Chemistry, and Biology resources.</p>
              <div className="mt-6 flex items-center justify-between border-t border-gray-100 pt-4">
                <span className="text-xs font-black uppercase tracking-wider text-text-light">
                  {classItem._count?.subjects || 3} subjects
                </span>
                <ArrowRight className="h-5 w-5 text-primary transition-transform group-hover:translate-x-1" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </PageFrame>
  );
}

export function AudienceSubjectsPage({ audience, classId }: { audience: Audience; classId: string }) {
  const [subjects, setSubjects] = useState<SubjectRow[]>([]);
  const [className, setClassName] = useState("");
  const [loading, setLoading] = useState(true);
  const meta = audienceMeta[audience];

  useEffect(() => {
    fetchClassSubjects(classId)
      .then((result) => {
        setClassName(result.className);
        setSubjects(result.subjects);
      })
      .catch(() => {
        setClassName("Class");
        setSubjects([]);
      })
      .finally(() => setLoading(false));
  }, [classId]);

  if (loading) return <PageLoader />;

  return (
    <PageFrame
      eyebrow={meta.label}
      title={`${className} Subjects`}
      description="Choose a subject. The next page will show Animated Videos, Notes, Quiz, and NCERT Questions & Solutions."
      backHref={`/courses/${audience}`}
    >
      {subjects.length === 0 ? (
        <EmptyState title="No subjects found" message="Physics, Chemistry, and Biology will appear here after they are enabled in admin." />
      ) : (
        <div className="grid gap-5 md:grid-cols-3">
          {subjects.map((subject) => {
            const visual = subjectVisual(subject.name);
            return (
              <Link
                key={subject.id}
                href={`/courses/${audience}/${classId}/${subject.id}`}
                className="group rounded-lg border border-gray-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/10"
              >
                <div className={`mb-6 flex h-14 w-14 items-center justify-center rounded-lg bg-gradient-to-br ${visual.accent} text-white shadow-lg shadow-gray-200 transition-transform group-hover:scale-105`}>
                  <visual.icon className="h-7 w-7" />
                </div>
                <h2 className="text-2xl font-black text-heading">{subject.name}</h2>
                <p className="mt-2 text-sm text-text-muted">{subject._count?.chapters || 0} chapters with visual resources.</p>
                <div className="mt-6 flex items-center justify-between border-t border-gray-100 pt-4">
                  <span className="text-xs font-black uppercase tracking-wider text-text-light">Open content</span>
                  <ArrowRight className="h-5 w-5 text-primary transition-transform group-hover:translate-x-1" />
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </PageFrame>
  );
}

export function AudienceContentPage({
  audience,
  classId,
  subjectId,
}: {
  audience: Audience;
  classId: string;
  subjectId: string;
}) {
  const [subjectName, setSubjectName] = useState("");
  const [className, setClassName] = useState("");
  const [loading, setLoading] = useState(true);
  const meta = audienceMeta[audience];

  useEffect(() => {
    fetchClassSubjects(classId)
      .then((result) => {
        const subject = result.subjects.find((item) => item.id === subjectId);
        setClassName(result.className);
        setSubjectName(subject?.name || "Subject");
      })
      .catch(() => {
        setClassName("Class");
        setSubjectName("Subject");
      })
      .finally(() => setLoading(false));
  }, [classId, subjectId]);

  if (loading) return <PageLoader />;

  const isPyqClass = className.toLowerCase().includes("10") || className.toLowerCase().includes("12");
  let cards: ContentCard[];
  if (audience === "teachers") {
    cards = teacherContentCards;
  } else {
    // For students: add PYQ before quiz (last item) for class 10 & 12
    cards = isPyqClass
      ? [...baseContentCards.slice(0, -1), pyqCard, quizCard]
      : baseContentCards;
  }

  return (
    <PageFrame
      eyebrow={meta.label}
      title={`${subjectName} Content`}
      description={`${className} resources are separated into focused content pages.`}
      backHref={`/courses/${audience}/${classId}`}
    >
      <ContentTypeGrid
        baseHref={`/courses/${audience}/${classId}/${subjectId}`}
        cards={cards}
      />
    </PageFrame>
  );
}

export function AudienceChaptersPage({
  audience,
  classId,
  subjectId,
  contentSlug,
}: {
  audience: Audience;
  classId: string;
  subjectId: string;
  contentSlug: string;
}) {
  const content = useContent(contentSlug);
  const [chapters, setChapters] = useState<ChapterRow[]>([]);
  const [subjectName, setSubjectName] = useState("");
  const [className, setClassName] = useState("");
  const [loading, setLoading] = useState(true);
  const meta = audienceMeta[audience];

  useEffect(() => {
    async function load() {
      try {
        const subjectResult = await fetchClassSubjects(classId);
        const chapterResult = isChapterContent(content.slug) && !content.comingSoon
          ? await fetchSubjectChapters(subjectId, content.slug)
          : [];
        const subject = subjectResult.subjects.find((item) => item.id === subjectId);
        setClassName(subjectResult.className);
        setSubjectName(subject?.name || chapterResult[0]?.subjectName || "Subject");
        setChapters(chapterResult);
      } catch {
        setChapters([]);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [classId, subjectId, content.slug]);

  if (loading) return <PageLoader />;

  return (
    <PageFrame
      eyebrow={meta.label}
      title={`${content.title} - ${subjectName}`}
      description={`${className} chapter cards. First chapter is open for preview; remaining chapters need subscription access.`}
      backHref={`/courses/${audience}/${classId}/${subjectId}`}
    >
      {content.comingSoon ? (
        <ComingSoonPanel content={content} />
      ) : isChapterContent(content.slug) ? (
        <ChapterGrid chapters={chapters} contentSlug={content.slug} returnTo={`/courses/${audience}/${classId}/${subjectId}/${content.slug}`} />
      ) : (
        <ResourcePlaceholder content={content} />
      )}
    </PageFrame>
  );
}

export function ProfessionalSubjectsPage() {
  return (
    <PageFrame
      eyebrow="Professional Path"
      title="Professional Subjects"
      description="Choose a subject track. Each track opens into Animated Videos, Notes, Quiz, and NCERT Questions & Solutions."
      backHref="/courses"
    >
      <div className="grid gap-5 md:grid-cols-3">
        {professionalSubjects.map((subject) => (
          <Link
            key={subject.key}
            href={`/courses/professional/${subject.key}`}
            className="group rounded-lg border border-gray-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/10"
          >
            <div className={`mb-6 flex h-16 w-16 items-center justify-center rounded-lg bg-gradient-to-br ${subject.accent} text-white shadow-lg shadow-gray-200 transition-transform group-hover:scale-105`}>
              <subject.icon className="h-8 w-8" />
            </div>
            <h2 className="text-2xl font-black text-heading">{subject.title}</h2>
            <p className="mt-2 text-sm font-bold text-primary">{subject.subtitle}</p>
            <div className="mt-6 grid gap-2">
              {subject.features.map((feature) => {
                const comingSoon = feature.toLowerCase().includes("test series");
                return (
                  <div key={feature} className="flex flex-wrap items-center gap-2 text-sm font-bold text-heading">
                    {comingSoon ? <Clock3 className="h-4 w-4 text-amber-600" /> : <CheckCircle2 className="h-4 w-4 text-emerald-500" />}
                    <span>{feature}</span>
                    {comingSoon && (
                      <span className="rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-amber-700">
                        Coming soon
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
            <div className="mt-6 flex items-center justify-between border-t border-gray-100 pt-4">
              <span className="text-xs font-black uppercase tracking-wider text-text-light">Open track</span>
              <ArrowRight className="h-5 w-5 text-primary transition-transform group-hover:translate-x-1" />
            </div>
          </Link>
        ))}
      </div>
    </PageFrame>
  );
}

export function ProfessionalContentPage({ subjectKey }: { subjectKey: string }) {
  const subject = professionalSubjects.find((item) => item.key === subjectKey) || professionalSubjects[0];

  return (
    <PageFrame
      eyebrow="Professional Path"
      title={`${subject.title} Content`}
      description={`${subject.subtitle} resources are separated into focused content pages.`}
      backHref="/courses/professional"
    >
      <ContentTypeGrid baseHref={`/courses/professional/${subject.key}`} cards={professionalContentCards} />
    </PageFrame>
  );
}

export function ProfessionalChaptersPage({ subjectKey, contentSlug }: { subjectKey: string; contentSlug: string }) {
  const content = useContent(contentSlug);
  const subject = professionalSubjects.find((item) => item.key === subjectKey) || professionalSubjects[0];
  const [chapters, setChapters] = useState<ChapterRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        if (!isChapterContent(content.slug) || content.comingSoon) {
          setChapters([]);
          return;
        }

        const classes = await fetchTargetClasses();
        const subjectGroups = await Promise.all(
          classes.map(async (classItem) => {
            const { subjects, className } = await fetchClassSubjects(classItem.id);
            return subjects
              .filter((item) => subjectKeyFromName(item.name) === subject.key)
              .map((item) => ({ ...item, className }));
          })
        );
        const subjects = subjectGroups.flat();
        const chapterGroups = await Promise.all(
          subjects.map(async (item) => {
            const subjectChapters = await fetchSubjectChapters(item.id, content.slug);
            return subjectChapters.map((chapter) => ({
              ...chapter,
              className: chapter.className || item.className,
              subjectName: chapter.subjectName || item.name,
            }));
          })
        );
        setChapters(chapterGroups.flat());
      } catch {
        setChapters([]);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [content.slug, subject.key]);

  if (loading) return <PageLoader />;

  return (
    <PageFrame
      eyebrow="Professional Path"
      title={`${content.title} - ${subject.title}`}
      description={isChapterContent(content.slug)
        ? "Chapter cards are collected from the matching subject content across available classes."
        : `${content.title} is now included in this professional subject path.`}
      backHref={`/courses/professional/${subject.key}`}
    >
      {content.comingSoon ? (
        <ComingSoonPanel content={content} />
      ) : isChapterContent(content.slug) ? (
        <ChapterGrid chapters={chapters} contentSlug={content.slug} returnTo={`/courses/professional/${subject.key}/${content.slug}`} />
      ) : (
        <ResourcePlaceholder content={content} actionHref={content.slug === "virtual-lab" ? "/courses/virtual-lab" : undefined} />
      )}
    </PageFrame>
  );
}

function ContentTypeGrid({ baseHref, cards }: { baseHref: string; cards: ContentCard[] }) {
  return (
    <div className="flex flex-col gap-3">
      {cards.map((card) => {
        const CardIcon = card.icon;
        const inner = (
          <div className="flex items-center gap-4">
            <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${card.accent} text-white shadow-md transition-transform ${card.comingSoon ? "" : "group-hover:scale-105"}`}>
              <CardIcon className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-black text-heading">{card.title}</h2>
                {card.comingSoon && (
                  <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-amber-700">
                    <Clock3 className="h-2.5 w-2.5" />
                    Soon
                  </span>
                )}
              </div>
              <p className="mt-0.5 text-xs leading-relaxed text-text-muted">{card.subtitle}</p>
            </div>
            {card.comingSoon ? (
              <Clock3 className="h-4 w-4 shrink-0 text-amber-500" />
            ) : (
              <ChevronRight className="h-4 w-4 shrink-0 text-primary transition-transform group-hover:translate-x-1" />
            )}
          </div>
        );

        if (card.comingSoon) {
          return (
            <div key={card.slug} className="rounded-xl border border-amber-200 bg-amber-50/50 px-4 py-3.5">
              {inner}
            </div>
          );
        }

        return (
          <Link
            key={card.slug}
            href={card.href || `${baseHref}/${card.slug}`}
            className="group rounded-xl border border-gray-200 bg-white px-4 py-3.5 shadow-sm transition-all duration-200 hover:border-primary/30 hover:shadow-md"
          >
            {inner}
          </Link>
        );
      })}
    </div>
  );
}

function ChapterGrid({
  chapters,
  contentSlug,
  returnTo,
}: {
  chapters: ChapterRow[];
  contentSlug: ContentSlug;
  returnTo: string;
}) {
  if (chapters.length === 0) {
    return <EmptyState title="No chapters found" message="Content for this section will appear after chapters are added in admin." />;
  }

  return (
    <div className="flex flex-col gap-2.5">
      {chapters.map((chapter, index) => {
        const visual = subjectVisual(chapter.subjectName);
        const unlocked = index === 0;
        const href = contentSlug === "animated-videos"
          ? `/courses/${chapter.classId}/${chapter.subjectId}/${chapter.id}?tab=videos&returnTo=${encodeURIComponent(returnTo)}`
          : `/courses/resource-viewer/${chapter.classId}/${chapter.subjectId}/${chapter.id}?type=${contentSlug}&returnTo=${encodeURIComponent(returnTo)}`;
        const resourceCount = chapterContentCount(chapter, contentSlug);
        const resourceLabel = contentSlug === "ppts" || contentSlug === "test-series"
          ? "Open viewer"
          : `${resourceCount} resources`;

        return (
          <Link
            key={`${chapter.subjectId}-${chapter.id}`}
            href={href}
            className="group flex items-center gap-4 rounded-xl border border-gray-200 bg-white px-4 py-3.5 shadow-sm transition-all duration-200 hover:border-primary/30 hover:shadow-md"
          >
            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ${visual.accent} text-white shadow-sm transition-transform group-hover:scale-105`}>
              <BookOpen className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="truncate text-sm font-black text-heading group-hover:text-primary">
                {chapter.order || index + 1}. {chapter.name}
              </h2>
              <div className="mt-0.5 flex items-center gap-3 text-xs text-text-muted">
                <span>{chapter.className} - {chapter.subjectName}</span>
                <span className="text-gray-300">|</span>
                <span>{resourceLabel}</span>
              </div>
            </div>
            <span className={cn(
              "inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider",
              unlocked ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-700"
            )}>
              {unlocked ? "Preview" : <><Lock className="h-3 w-3" /> Locked</>}
            </span>
            <ChevronRight className="h-4 w-4 shrink-0 text-primary/40 transition-transform group-hover:translate-x-1 group-hover:text-primary" />
          </Link>
        );
      })}
    </div>
  );
}
