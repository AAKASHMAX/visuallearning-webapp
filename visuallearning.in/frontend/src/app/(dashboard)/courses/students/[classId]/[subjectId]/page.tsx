import { AudienceContentPage } from "../../../_components/course-path-pages";

export default function StudentContentPage({ params }: { params: { classId: string; subjectId: string } }) {
  return <AudienceContentPage audience="students" classId={params.classId} subjectId={params.subjectId} />;
}
