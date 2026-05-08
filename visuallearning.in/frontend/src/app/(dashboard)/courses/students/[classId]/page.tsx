import { AudienceSubjectsPage } from "../../_components/course-path-pages";

export default function StudentSubjectsPage({ params }: { params: { classId: string } }) {
  return <AudienceSubjectsPage audience="students" classId={params.classId} />;
}
