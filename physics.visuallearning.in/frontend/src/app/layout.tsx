import type { Metadata } from "next";
import Script from "next/script";
import { Toaster } from "react-hot-toast";
import { Sidebar } from "@/components/layout/sidebar";
import { SiteMain, SiteWidgets } from "@/components/layout/site-shell";
import { AnalyticsTracker } from "@/components/analytics-tracker";
import "./globals.css";

export const metadata: Metadata = {
  title: "PhysicsLab - Visual Learning | Master Physics with 3D Animations",
  description:
    "Learn physics through stunning 3D animations, interactive simulations, and expert lectures. Free, Basic, and Advanced courses for classes 9-12.",
  keywords: "physics, learning, 3D animations, CBSE, ICSE, simulations, visual learning",
};

const apiOrigin = process.env.NEXT_PUBLIC_API_URL
  ? new URL(process.env.NEXT_PUBLIC_API_URL).origin
  : "";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {apiOrigin && (
          <>
            <link rel="preconnect" href={apiOrigin} crossOrigin="" />
            <link rel="dns-prefetch" href={apiOrigin} />
          </>
        )}
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
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
      <body className="antialiased">
        {process.env.NEXT_PUBLIC_GA_ID && <AnalyticsTracker gaId={process.env.NEXT_PUBLIC_GA_ID} />}
        <Sidebar />
        <SiteMain>{children}</SiteMain>
        <SiteWidgets />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: "#151a3d",
              color: "#e2e8f0",
              border: "1px solid #2a3060",
            },
          }}
        />
      </body>
    </html>
  );
}
