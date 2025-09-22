export default function Loading() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-5xl">
        <div className="flex items-baseline justify-between">
          <div className="h-6 w-20 rounded bg-gray-100 animate-pulse" />
          <div className="h-4 w-24 rounded bg-gray-100 animate-pulse" />
        </div>

        <div className="mt-4 overflow-hidden rounded-2xl border shadow-sm">
          <div className="h-1 w-2/5 bg-emerald-200" />
          <div className="p-6">
            <div className="h-6 w-56 rounded bg-gray-100 animate-pulse" />
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border p-3">
                <div className="mx-auto h-80 w-full max-w-3xl rounded-xl bg-gray-100 animate-pulse" />
              </div>
              <div className="rounded-xl border p-3">
                <div className="h-5 w-24 rounded bg-gray-100 animate-pulse" />
                <div className="mt-3 flex flex-wrap gap-2">
                  {[...Array(6)].map((_, i) => (
                    <div
                      key={i}
                      className="h-7 w-24 rounded-lg bg-gray-100 animate-pulse"
                    />
                  ))}
                </div>
                <div className="mt-4 h-9 w-28 rounded-xl bg-gray-100 animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
