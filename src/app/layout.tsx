// /src/app/layout.tsx
import "./globals.css";
import type { ReactNode } from "react";
import type { Metadata } from "next";
import { Suspense } from "react";
import HashScroll from "../components/hash-scroll";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Equatoria — Human-in-the-loop AI data & evaluations",
  description:
    "Consent-based data sourcing, meticulous labeling, safety evaluations, and secure handover — built in Africa, serving the world.",
  openGraph: {
    title: "Equatoria",
    description:
      "Enterprise-grade data, evaluations, and secure handover for AI labs and regulated industries.",
    url: siteUrl,
    siteName: "Equatoria",
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Equatoria",
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
    <html lang="en" className="scroll-smooth">
      <body className="min-h-screen bg-white text-gray-900 antialiased">
        <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Wrap client hooks (useSearchParams/usePathname) in Suspense */}
          <Suspense fallback={null}>
            <HashScroll />
          </Suspense>
          {children}
        </main>
      </body>
    </html>
  );
}
