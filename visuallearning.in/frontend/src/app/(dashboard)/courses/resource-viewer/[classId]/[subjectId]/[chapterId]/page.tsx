import { ResourceViewerPage } from "../../../../_components/resource-viewer-page";

export default function CourseResourceViewerRoute({
  params,
  searchParams,
}: {
  params: { classId: string; subjectId: string; chapterId: string };
  searchParams: { type?: string | string[]; returnTo?: string | string[] };
}) {
  return (
    <ResourceViewerPage
      classId={params.classId}
      subjectId={params.subjectId}
      chapterId={params.chapterId}
      type={searchParams.type}
      returnTo={searchParams.returnTo}
    />
  );
}
