import { AudienceChaptersPage } from "../../../../_components/course-path-pages";

export default function TeacherChaptersPage({
  params,
}: {
  params: { classId: string; subjectId: string; contentSlug: string };
}) {
  return (
    <AudienceChaptersPage
      audience="teachers"
      classId={params.classId}
      subjectId={params.subjectId}
      contentSlug={params.contentSlug}
    />
  );
}
