export default function Loading() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="h-8 w-48 rounded bg-gray-100 animate-pulse" />
      <div className="mt-2 h-4 w-72 rounded bg-gray-100 animate-pulse" />

      <div className="mt-6 space-y-3 rounded-2xl border p-6 shadow-sm">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="h-10 w-full rounded-xl bg-gray-100 animate-pulse"
          />
        ))}
        <div className="h-24 w-full rounded-xl bg-gray-100 animate-pulse" />
        <div className="h-10 w-40 rounded-xl bg-gray-100 animate-pulse" />
      </div>
    </div>
  );
}
