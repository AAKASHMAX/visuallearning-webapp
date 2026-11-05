import type { Metadata } from "next";
import { PUBLIC_DOC_LABELS, PublicDocKind, describeSlug, publicDocPath } from "@/lib/public-docs";

// Built from the link alone (12-bio-1 -> "Class 12 Biology · Chapter 1"), so the page never waits
// on the API for its title; shared links on WhatsApp / Telegram still get a readable preview.
export function publicDocMetadata(kind: PublicDocKind, slug: string): Metadata {
  const what = PUBLIC_DOC_LABELS[kind].title;
  const chapter = describeSlug(slug);
  const title = chapter ? `${chapter} ${what} (Free) | VisualLearning` : `${what} | VisualLearning`;
  const description = chapter
    ? `Free ${what} for ${chapter}, made by VisualLearning. Read online, no login needed.`
    : `Free ${what} by VisualLearning. Read online, no login needed.`;
  return {
    title,
    description,
    robots: { index: false, follow: false },
    openGraph: {
      title,
      description,
      url: publicDocPath(kind, slug),
      type: "article",
      siteName: "VisualLearning",
      images: [{ url: "/images/logo2.png" }],
    },
  };
}
