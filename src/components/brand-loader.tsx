import Image from "next/image";

export default function BrandLoader({
  label = "Loading...",
}: {
  label?: string;
}) {
  return (
    <div className="fixed inset-0 z-[9999] bg-[#05070bcf] backdrop-blur-md">
      <div className="grid min-h-screen place-items-center px-4">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="relative flex h-16 w-16 items-center justify-center">
            <div className="absolute inset-0 rounded-2xl border border-white/10 bg-white/[0.05] shadow-[0_16px_40px_rgba(0,0,0,0.28)]" />
            <div className="absolute inset-0 animate-[spin_1.2s_linear_infinite] rounded-2xl border-2 border-transparent border-t-emerald-300/85 border-r-cyan-200/45" />
            <div className="relative flex h-12 w-12 items-center justify-center rounded-xl bg-[#081018]">
              <Image
                src="/favicon.ico"
                alt="Euman Intelligence"
                width={24}
                height={24}
                priority
                className="h-6 w-6 rounded"
              />
            </div>
          </div>

          <div className="space-y-1">
            <div className="text-sm font-medium text-white">{label}</div>
            <div className="text-xs text-white/55">Euman Intelligence</div>
          </div>
        </div>
      </div>
    </div>
  );
}
