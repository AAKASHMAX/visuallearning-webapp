"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowUpRight, Lock } from "lucide-react";
import { PageLoader } from "@/components/ui/loading";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import api from "@/lib/api";
import type { Subject } from "@/types";
import { ClassEmblem, SUBJECT_THEME, SubjectEmblem, subjectKind } from "@/components/courses/course-art";
import "@/components/courses/course-cards.css";

export default function ClassSubjectsPage() {
  const { classId } = useParams();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [className, setClassName] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/courses/classes/${classId}/subjects`).then(({ data }) => {
      setSubjects(data.data.subjects);
      setClassName(data.data.class.name);
    }).finally(() => setLoading(false));
  }, [classId]);

  if (loading) return <PageLoader />;

  const open = subjects.filter((s) => s.enabled !== false);
  const chapters = open.reduce((n, s) => n + (s._count?.chapters || 0), 0);

  return (
    <div className="cx-page" style={{ ["--cx-accent" as string]: "#a78bfa" }}>
      <Breadcrumb items={[{ label: className }]} />

      <header className="cx-hero">
        <div>
          <p className="cx-eyebrow">
            <i />
            {open.length} {open.length === 1 ? "subject" : "subjects"} · {chapters} chapters
          </p>
          <h1 className="cx-title">{className}</h1>
          <p className="cx-tagline">Pick a science and step inside it.</p>
        </div>
        <div className="cx-hero-art">
          <ClassEmblem />
        </div>
      </header>

      <p className="cx-label">01 / <b>Choose a subject</b></p>
      <div className="cx-subjects">
        {subjects.map((s) => {
          const kind = subjectKind(s.name);
          const theme = SUBJECT_THEME[kind];
          const locked = s.enabled === false;
          const style = { ["--cx-accent" as string]: theme.accent };
          const face = (
            <>
              <div className="cx-subject-art">
                <SubjectEmblem kind={kind} />
              </div>
              <div className="cx-subject-body">
                <span className="cx-chip">
                  {locked ? (
                    <>
                      <Lock size={11} /> Coming soon
                    </>
                  ) : (
                    `${s._count?.chapters || 0} chapters`
                  )}
                </span>
                <h3>{s.name}</h3>
                <p>{theme.tagline}</p>
              </div>
              {!locked && (
                <span className="cx-go" aria-hidden="true">
                  <ArrowUpRight size={18} />
                </span>
              )}
            </>
          );
          return locked ? (
            <div key={s.id} className="cx-subject is-locked" style={style} aria-disabled="true">
              {face}
            </div>
          ) : (
            <Link key={s.id} href={`/courses/${classId}/${s.id}`} className="cx-subject" style={style}>
              {face}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
