import clsx from "clsx";

export default function CallHeader({
  timer,
  isSharing,
  onShareStart,
  onShareStop,
  onEnd,
  sttError,
}: {
  timer: number;
  isSharing: boolean;
  onShareStart: () => void;
  onShareStop: () => void;
  onEnd: () => void;
  sttError?: boolean;
}) {
  const mm = String(Math.floor(timer / 60)).padStart(2, "0");
  const ss = String(timer % 60).padStart(2, "0");

  return (
    <div className="absolute right-4 top-4 flex items-center gap-2 z-20">
      <button
        onClick={onEnd}
        className="px-3 py-1 rounded bg-slate-800 text-xs hover:bg-slate-700 border border-slate-700"
      >
        End
      </button>
      <button
        onClick={isSharing ? onShareStop : onShareStart}
        className={clsx(
          "px-3 py-1 rounded text-xs border",
          isSharing
            ? "bg-rose-800 hover:bg-rose-700 border-rose-700"
            : "bg-slate-800 hover:bg-slate-700 border-slate-700"
        )}
      >
        {isSharing ? "Stop Share" : "Share Screen"}
      </button>
      <div className="rounded-full bg-slate-800 px-2 py-0.5 text-xs text-slate-200">
        {mm}:{ss}
      </div>
      {sttError && (
        <span className="text-xs text-rose-400 ml-2">
          (caption service unavailable)
        </span>
      )}
    </div>
  );
}
