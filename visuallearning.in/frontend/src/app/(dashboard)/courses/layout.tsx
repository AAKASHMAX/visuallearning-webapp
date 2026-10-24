import { sparkDisplay, sparkMono } from "@/lib/spark-fonts";

// The course pages use the homepage's display and label fonts.
export default function CoursesLayout({ children }: { children: React.ReactNode }) {
  return <div className={`${sparkDisplay.variable} ${sparkMono.variable}`}>{children}</div>;
}
