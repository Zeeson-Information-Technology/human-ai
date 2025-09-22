export default function BrandLoader({
  label = "Loading…",
}: {
  label?: string;
}) {
  return (
    <div className="fixed inset-0 z-[9999] grid place-items-center bg-white/80 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-3">
        <div className="relative h-10 w-10">
          <div className="absolute inset-0 rounded-full bg-emerald-400/30 animate-ping" />
          <div className="relative h-10 w-10 rounded-full bg-gradient-to-tr from-emerald-500 via-cyan-500 to-emerald-400 shadow-lg" />
        </div>
        <div className="text-sm font-medium text-gray-700">{label}</div>
      </div>
    </div>
  );
}
