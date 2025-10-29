"use client";

type Props = {
  speaking?: boolean;
  size?: number; // px, default 80
  className?: string;
  label?: string;
};

export default function AvatarSpeaking({
  speaking = false,
  size = 80,
  className = "",
  label = "AI interviewer avatar",
}: Props) {
  const bars = new Array(5).fill(0);
  const outer = Math.max(64, size);
  const inner = Math.floor(outer * 0.7);
  return (
    <div className={className} aria-label={label}>
      {/* Pulsing rings */}
      <div
        className="relative grid place-items-center"
        style={{ width: outer, height: outer }}
      >
        <span
          className={`absolute rounded-full border border-indigo-400/30 ${
            speaking ? "animate-ping" : ""
          }`}
          style={{ width: outer, height: outer }}
        />
        <span
          className={`absolute rounded-full border border-indigo-400/60 ${
            speaking ? "animate-pulse" : ""
          }`}
          style={{ width: inner, height: inner }}
        />
        {/* Core orb */}
        <div
          className="relative rounded-full bg-gradient-to-br from-indigo-500/70 to-violet-500/70 shadow-inner grid place-items-center"
          style={{ width: inner, height: inner }}
        >
          {/* Equalizer bars */}
          <div className="flex items-end gap-1" style={{ height: Math.floor(inner / 2.5) }}>
            {bars.map((_, i) => (
              <span
                key={i}
                style={{ animationDelay: `${i * 120}ms` }}
                className={`block w-1.5 rounded-sm bg-white/90 ${
                  speaking ? "h-6 animate-bounce" : "h-3 opacity-70"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
