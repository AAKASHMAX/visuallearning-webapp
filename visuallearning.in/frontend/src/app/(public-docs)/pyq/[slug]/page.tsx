import { PublicDocPage } from "../../_components/public-doc-page";
import { publicDocMetadata } from "../../_components/metadata";

export function generateMetadata({ params }: { params: { slug: string } }) {
  return publicDocMetadata("pyq", params.slug);
}

export default function PublicPyqPage({ params }: { params: { slug: string } }) {
  return <PublicDocPage kind="pyq" slug={params.slug} />;
}
