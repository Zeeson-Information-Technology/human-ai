export default function Loading() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-3xl">
        <div className="flex items-baseline justify-between">
          <div className="h-6 w-20 rounded bg-gray-100 animate-pulse" />
          <div className="h-4 w-24 rounded bg-gray-100 animate-pulse" />
        </div>

        <div className="mt-4 overflow-hidden rounded-2xl border shadow-sm">
          <div className="h-1 w-1/3 bg-emerald-200" />
          <div className="p-6">
            <div className="h-6 w-56 rounded bg-gray-100 animate-pulse" />
            <div className="mt-4 h-7 w-64 rounded bg-gray-100 animate-pulse" />
            <div className="mt-2 h-14 w-full rounded bg-gray-50 animate-pulse" />

            <div className="mt-5 flex flex-wrap gap-2">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="h-8 w-24 rounded-lg bg-gray-100 animate-pulse"
                />
              ))}
            </div>

            <div className="mt-6 flex justify-between">
              <div className="h-9 w-24 rounded-xl bg-gray-100 animate-pulse" />
              <div className="h-9 w-32 rounded-xl bg-gray-100 animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
