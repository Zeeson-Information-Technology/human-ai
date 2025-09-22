export default function Loading() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-3xl">
        <div className="flex items-baseline justify-between">
          <div className="h-6 w-20 rounded bg-gray-100 animate-pulse" />
          <div className="h-4 w-24 rounded bg-gray-100 animate-pulse" />
        </div>

        <div className="mt-4 overflow-hidden rounded-2xl border shadow-sm">
          <div className="h-1 w-1/4 bg-emerald-200" />
          <div className="p-6">
            <div className="h-6 w-56 rounded bg-gray-100 animate-pulse" />
            <div className="mt-4 h-20 w-full rounded-xl bg-gradient-to-r from-emerald-50 to-cyan-50 animate-pulse" />

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="h-10 w-full rounded-xl bg-gray-100 animate-pulse" />
              <div className="h-10 w-full rounded-xl bg-gray-100 animate-pulse" />
            </div>

            <div className="mt-4 h-24 w-full rounded-xl bg-gray-100 animate-pulse" />

            <div className="mt-5 rounded-xl border p-4">
              <div className="flex items-center justify-between">
                <div className="h-5 w-16 rounded bg-gray-100 animate-pulse" />
                <div className="h-4 w-10 rounded bg-gray-100 animate-pulse" />
              </div>
              <div className="mt-3 h-10 w-40 rounded-2xl bg-gray-100 animate-pulse" />
              <div className="mt-3 h-8 w-full rounded bg-gray-50 animate-pulse" />
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
