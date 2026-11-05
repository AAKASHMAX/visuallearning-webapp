import { PublicDocPage } from "../../_components/public-doc-page";
import { publicDocMetadata } from "../../_components/metadata";

export function generateMetadata({ params }: { params: { slug: string } }) {
  return publicDocMetadata("notes", params.slug);
}

export default function PublicNotesPage({ params }: { params: { slug: string } }) {
  return <PublicDocPage kind="notes" slug={params.slug} />;
}
