// /src/app/layout.tsx
import "./globals.css";
import type { Metadata } from "next";
import { Suspense } from "react";
import HashScroll from "../components/hash-scroll";
import RouteProgress from "@/components/route-progress";
import Watermark from "@/components/Watermark";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Euman AI — Human-in-the-loop AI data & evaluations",
  description:
    "Consent-based data sourcing, meticulous labeling, safety evaluations, and secure handover — built in Africa, serving the world.",
  openGraph: {
    title: "Euman AI",
    description:
      "Enterprise-grade data, evaluations, and secure handover for AI labs and regulated industries.",
    url: siteUrl,
    siteName: "Euman AI",
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Euman AI",
    description:
      "Enterprise-grade data, evaluations, and secure handover for AI.",
    images: ["/og-image.png"],
  },
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-64.png", sizes: "64x64", type: "image/png" },
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth" suppressHydrationWarning>
      {/* Extension-injected attributes (e.g., Grammarly) can differ on the client */}
      <body
        className="min-h-screen bg-white text-gray-900 antialiased"
        suppressHydrationWarning
      >
        <RouteProgress />
        <main>
          <Suspense fallback={null}>
            <HashScroll />
          </Suspense>
          {children}
        </main>
        <Watermark />
      </body>
    </html>
  );
}
