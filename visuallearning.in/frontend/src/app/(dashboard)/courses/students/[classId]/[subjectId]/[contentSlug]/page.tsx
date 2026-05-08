import { AudienceChaptersPage } from "../../../../_components/course-path-pages";

export default function StudentChaptersPage({
  params,
}: {
  params: { classId: string; subjectId: string; contentSlug: string };
}) {
  return (
    <AudienceChaptersPage
      audience="students"
      classId={params.classId}
      subjectId={params.subjectId}
      contentSlug={params.contentSlug}
    />
  );
}
