import Image from "next/image";

export default function BrandLoader({
  label = "Loading…",
}: {
  label?: string;
}) {
  return (
    <div className="fixed inset-0 z-[9999] grid place-items-center bg-white/80 backdrop-blur-sm dark:bg-black/60">
      <div className="flex flex-col items-center gap-3">
        <Image
          src="/euman-logo.png"
          alt="Euman AI"
          width={160}
          height={36}
          priority
          className="h-9 w-auto animate-pulse"
        />
        <div className="h-1 w-36 overflow-hidden rounded-full bg-gray-200/70 dark:bg-white/10">
          <div className="h-full w-1/3 rounded-full bg-emerald-500/80 animate-pulse" />
        </div>
        <div className="text-sm font-medium text-gray-700 dark:text-gray-200">{label}</div>
      </div>
    </div>
  );
}
