import { redirect } from "next/navigation";

// The spark journey started here and is now the homepage.
export default function ExplorePage() {
  redirect("/");
}
