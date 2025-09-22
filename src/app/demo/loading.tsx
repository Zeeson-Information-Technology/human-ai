export default function Loading() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-3xl">
        <div className="text-center">
          <div className="mx-auto mb-6 h-28 w-full max-w-md rounded-2xl bg-gray-100 animate-pulse" />
          <div className="h-8 w-56 mx-auto rounded bg-gray-100 animate-pulse" />
          <div className="mt-2 h-4 w-72 mx-auto rounded bg-gray-100 animate-pulse" />
        </div>

        <div className="mt-8 grid gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="rounded-2xl border p-5 shadow-sm">
              <div className="h-5 w-48 rounded bg-gray-100 animate-pulse" />
              <div className="mt-2 h-4 w-80 rounded bg-gray-100 animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
