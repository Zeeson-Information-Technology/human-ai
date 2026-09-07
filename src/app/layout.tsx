import RouteProgress from "@/components/route-progress";
import type { Metadata } from "next";
import { Suspense } from "react";
import HashScroll from "../components/hash-scroll";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Euman Intelligence - Human and AI intelligence for proposals",
  description:
    "Euman Intelligence helps businesses navigate proposals, bids, and RFPs through a model that blends human judgment with AI-enabled execution.",
  openGraph: {
    title: "Euman Intelligence",
    description:
      "Human judgment and AI-enabled execution for proposals, bids, and RFP responses.",
    url: siteUrl,
    siteName: "Euman Intelligence",
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Euman Intelligence",
    description:
      "Human judgment and AI-enabled execution for proposals, bids, and RFP responses.",
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
      </body>
    </html>
  );
}
