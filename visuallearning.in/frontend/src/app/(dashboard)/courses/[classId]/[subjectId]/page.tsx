"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { PageLoader } from "@/components/ui/loading";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import api from "@/lib/api";
import { ContentArt, SUBJECT_THEME, SubjectEmblem, subjectKind } from "@/components/courses/course-art";
import "@/components/courses/course-cards.css";

interface ContentType {
  slug: string;
  title: string;
  text: string;
}

export default function SubjectContentTypesPage() {
  const params = useParams();
  const classId = Array.isArray(params.classId) ? params.classId[0] : (params.classId as string);
  const subjectId = Array.isArray(params.subjectId) ? params.subjectId[0] : (params.subjectId as string);

  const [subjectName, setSubjectName] = useState("");
  const [className, setClassName] = useState("");
  const [chapterCount, setChapterCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/courses/subjects/${subjectId}/chapters`).then(({ data }) => {
      const d = data.data;
      setSubjectName(d.subject.name);
      setClassName(d.subject.class?.name || "");
      setChapterCount((d.chapters || []).length);
    }).catch(() => {}).finally(() => setLoading(false));
  }, [subjectId]);

  if (loading) return <PageLoader />;

  // Classes 10 & 12 = board papers; 9 & 11 = important questions.
  const hasBoardPapers = className.includes("10") || className.includes("12");
  const kind = subjectKind(subjectName);
  const theme = SUBJECT_THEME[kind];
  const chapters = `${chapterCount} ${chapterCount === 1 ? "chapter" : "chapters"}`;

  // Lecture videos are not offered as a content type; 3D videos lead.
  const contentTypes: ContentType[] = [
    { slug: "animation", title: "3D Animated Videos", text: "Watch every concept come alive in 3D, the way a textbook never could." },
    { slug: "notes", title: "Notes", text: "Illustrated, chapter-wise notes for quick revision." },
    { slug: "ncert", title: "NCERT Solutions", text: "Every textbook question, solved step by step." },
    hasBoardPapers
      ? { slug: "pyq", title: "PYQs", text: "Previous years' board questions, chapter by chapter." }
      : { slug: "important", title: "Important Questions", text: "The questions that matter most, ready to practise." },
    { slug: "quiz", title: "Quiz", text: "Test yourself and find your gaps before the exam." },
  ];

  return (
    <div className="cx-page" style={{ ["--cx-accent" as string]: theme.accent }}>
      <Breadcrumb items={[
        { label: className, href: `/courses/${classId}` },
        { label: subjectName },
      ]} />

      <header className="cx-hero">
        <div>
          <p className="cx-eyebrow"><i />{className} · {chapters}</p>
          <h1 className="cx-title">{subjectName}</h1>
          <p className="cx-tagline">{theme.tagline}</p>
          {theme.formula && <p className="cx-formula" dangerouslySetInnerHTML={{ __html: theme.formula }} />}
        </div>
        <div className="cx-hero-art">
          <SubjectEmblem kind={kind} />
        </div>
      </header>

      <p className="cx-label">01 / <b>Choose how to learn</b></p>
      <div className="cx-grid">
        {contentTypes.map((ct, i) => (
          <Link
            key={ct.slug}
            href={`/courses/${classId}/${subjectId}/type/${ct.slug}`}
            className={`cx-card${i === 0 ? " cx-card-feature" : ""}`}
          >
            <div className="cx-card-art">
              <ContentArt slug={ct.slug} />
            </div>
            <div className="cx-card-body">
              <span className="cx-chip">{chapters}</span>
              <h3>{ct.title}</h3>
              <p>{ct.text}</p>
              {i === 0 && (
                <div className="cx-tags">
                  <span>Chapter-wise</span>
                  <span>Watch anytime</span>
                </div>
              )}
            </div>
            <span className="cx-go" aria-hidden="true">
              <ArrowUpRight size={18} />
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
