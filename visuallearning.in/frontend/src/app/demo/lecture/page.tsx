import { redirect } from "next/navigation";

// Lecture videos are not offered; the 3D video demo takes their place.
export default function LectureDemoPage() {
  redirect("/demo/video");
}
