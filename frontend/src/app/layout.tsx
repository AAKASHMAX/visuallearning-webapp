import type { Metadata } from "next";
import { Toaster } from "react-hot-toast";
import "./globals.css";

export const metadata: Metadata = {
  title: "VisualLearning - Animated Education for Class 9-12",
  description: "Learn Physics, Chemistry, Biology & Mathematics through animated video lectures for Class 9 to 12.",
  icons: {
    icon: "/images/logo2.png",
    apple: "/images/logo2.png",
  },
  openGraph: {
    title: "VisualLearning - Animated Education for Class 9-12",
    description: "Learn Physics, Chemistry, Biology & Mathematics through animated video lectures for Class 9 to 12.",
    images: [{ url: "/images/logo2.png" }],
    siteName: "VisualLearning",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col">
        <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
        {children}
      </body>
    </html>
  );
}
