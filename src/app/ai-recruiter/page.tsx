import Nav from "@/components/nav";
import Footer from "@/components/footer";

export const metadata = {
  title: "AI Recruiter — Euman AI",
  description: "AI Recruiter by Euman AI.",
};

export default function AIRecruiterPage() {
  return (
    <div className="pb-12">
      <Nav />

      {/* Hero */}
      <section className="pt-10 text-center">
        <div className="mx-auto max-w-3xl px-4">
          <h1 className="mt-4 text-4xl font-extrabold tracking-tight sm:text-6xl">
            AI Recruiter
          </h1>

          <p className="mt-4 text-gray-600">
            This is a placeholder page for AI Recruiter.
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
}
