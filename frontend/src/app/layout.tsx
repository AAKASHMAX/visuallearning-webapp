import type { Metadata } from "next";
import Script from "next/script";
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
      <head>
        <Script src="https://www.googletagmanager.com/gtag/js?id=G-D30152WFX9" strategy="afterInteractive" />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-D30152WFX9');
          `}
        </Script>
      </head>
      <body className="min-h-screen flex flex-col">
        <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
        {children}
      </body>
    </html>
  );
}
