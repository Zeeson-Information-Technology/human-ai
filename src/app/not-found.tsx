// /src/app/not-found.tsx
import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-20 text-center">
      <h1 className="text-4xl font-semibold tracking-tight">Page not found</h1>
      <p className="mt-3 text-neutral-600">
        The page you’re looking for doesn’t exist or has moved.
      </p>
      <div className="mt-6 flex items-center justify-center gap-3">
        <Link
          href="/"
          className="rounded-xl bg-black px-5 py-3 font-medium text-white hover:bg-neutral-900"
        >
          Go home
        </Link>
        <Link
          href="/data-engine"
          className="rounded-xl border px-5 py-3 font-medium hover:bg-neutral-50"
        >
          Data Engine
        </Link>
      </div>
    </main>
  );
}
