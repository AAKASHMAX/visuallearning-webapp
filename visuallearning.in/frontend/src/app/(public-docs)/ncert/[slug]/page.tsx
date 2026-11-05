import { PublicDocPage } from "../../_components/public-doc-page";
import { publicDocMetadata } from "../../_components/metadata";

export function generateMetadata({ params }: { params: { slug: string } }) {
  return publicDocMetadata("ncert", params.slug);
}

export default function PublicNcertPage({ params }: { params: { slug: string } }) {
  return <PublicDocPage kind="ncert" slug={params.slug} />;
}
