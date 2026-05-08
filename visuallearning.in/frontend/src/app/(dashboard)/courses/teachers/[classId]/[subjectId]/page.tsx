import { AudienceContentPage } from "../../../_components/course-path-pages";

export default function TeacherContentPage({ params }: { params: { classId: string; subjectId: string } }) {
  return <AudienceContentPage audience="teachers" classId={params.classId} subjectId={params.subjectId} />;
}
