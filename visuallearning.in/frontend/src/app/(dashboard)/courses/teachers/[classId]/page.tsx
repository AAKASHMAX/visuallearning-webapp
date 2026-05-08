import { AudienceSubjectsPage } from "../../_components/course-path-pages";

export default function TeacherSubjectsPage({ params }: { params: { classId: string } }) {
  return <AudienceSubjectsPage audience="teachers" classId={params.classId} />;
}
