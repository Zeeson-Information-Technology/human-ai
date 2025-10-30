// src/app/candidate-reviews/page.tsx
import type { Metadata } from "next";
import Nav from "@/components/nav";
import Footer from "@/components/footer";
import Hero from "./sections/hero";
import ClientsCarousel from "./sections/clientCarousel";
import ReviewsGrid from "./sections/reviewGrid";
import FinalCTA from "./sections/finalCTA";
import Highlights from "./sections/highlights";

export const metadata: Metadata = {
  title: "Candidate Reviews — Euman AI",
  description:
    "World-class talent loves Euman AI. Hear reviews from professionals who’ve applied, interviewed with Zuri, and joined roles through our network.",
};

export default function CandidateReviewsPage() {
  return (
    <div className="pb-12">
      <Nav />
      <Hero />
      <ClientsCarousel />
      <Highlights />
      <ReviewsGrid />
      <FinalCTA />
      <Footer />
    </div>
  );
}
