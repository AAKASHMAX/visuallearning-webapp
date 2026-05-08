import { ProfessionalChaptersPage } from "../../../_components/course-path-pages";

export default function ProfessionalChaptersRoute({
  params,
}: {
  params: { subjectKey: string; contentSlug: string };
}) {
  return <ProfessionalChaptersPage subjectKey={params.subjectKey} contentSlug={params.contentSlug} />;
}
