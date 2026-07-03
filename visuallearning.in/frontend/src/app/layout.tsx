import type { Metadata } from "next";
import Script from "next/script";
import { Toaster } from "react-hot-toast";
import { FeedbackPopup } from "@/components/layout/feedback-popup";
import { FloatingContact } from "@/components/layout/floating-contact";
import { GetAppModal } from "@/components/layout/get-app-modal";
import { WhatsAppChatButton } from "@/components/layout/whatsapp-chat-button";
import { AnalyticsTracker } from "@/components/analytics-tracker";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://visuallearning.in"),
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
        {process.env.NEXT_PUBLIC_GA_ID && (
          <>
            <Script src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`} strategy="afterInteractive" />
            <Script id="google-analytics" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}');
              `}
            </Script>
          </>
        )}
      </head>
      <body className="min-h-screen flex flex-col">
        <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
        {process.env.NEXT_PUBLIC_GA_ID && <AnalyticsTracker gaId={process.env.NEXT_PUBLIC_GA_ID} />}
        {children}
        <GetAppModal />
        <FeedbackPopup />
        <FloatingContact />
        <WhatsAppChatButton />
      </body>
    </html>
  );
}
