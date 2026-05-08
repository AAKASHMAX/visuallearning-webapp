import { ProfessionalContentPage } from "../../_components/course-path-pages";

export default function ProfessionalContentRoute({ params }: { params: { subjectKey: string } }) {
  return <ProfessionalContentPage subjectKey={params.subjectKey} />;
}
