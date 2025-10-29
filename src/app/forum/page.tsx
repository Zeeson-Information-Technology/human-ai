import Nav from "@/components/nav";
import Footer from "@/components/footer";

export const metadata = {
  title: "Forum — Eumanai",
  description: "Forum by Eumanai.",
};

export default function ForumPage() {
  return (
    <div className="pb-12">
      <Nav />

      {/* Hero */}
      <section className="pt-10 text-center">
        <div className="mx-auto max-w-3xl px-4">
          <h1 className="mt-4 text-4xl font-extrabold tracking-tight sm:text-6xl">
            Forum
          </h1>

          <p className="mt-4 text-gray-700">
            This is a placeholder page for Forum.
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
}
