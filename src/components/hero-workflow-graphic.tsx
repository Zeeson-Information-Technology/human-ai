export default function HeroWorkflowGraphic() {
  const nodes = [
    { label: "Capture", x: 90, y: 105, accent: "#60a5fa" },
    { label: "Response", x: 250, y: 70, accent: "#34d399" },
    { label: "Talent", x: 420, y: 105, accent: "#fbbf24" },
    { label: "Delivery", x: 585, y: 72, accent: "#a78bfa" },
  ];

  return (
    <div className="relative overflow-hidden rounded-[28px] border border-slate-200/80 bg-white/90 p-4 shadow-[0_20px_70px_rgba(15,23,42,0.16)] backdrop-blur-sm">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-80"
        style={{
          background:
            "radial-gradient(120% 80% at 50% 0%, rgba(96,165,250,0.16), transparent 50%), radial-gradient(120% 80% at 100% 100%, rgba(52,211,153,0.12), transparent 42%)",
        }}
      />

      <div className="relative">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-500">
              Tender workflow
            </div>
            <div className="mt-1 text-sm font-medium text-slate-700">
              Capture, respond, source support, deliver
            </div>
          </div>
          <div className="rounded-full border border-slate-200 bg-white/80 px-3 py-1 text-[11px] font-medium text-slate-600 shadow-sm">
            Human + AI
          </div>
        </div>

        <svg
          viewBox="0 0 680 360"
          className="mt-4 h-auto w-full"
          role="img"
          aria-label="Workflow from capture to response, talent sourcing, and delivery support"
        >
          <defs>
            <linearGradient id="workflow-line" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#60a5fa" stopOpacity="0.45" />
              <stop offset="50%" stopColor="#34d399" stopOpacity="0.7" />
              <stop offset="100%" stopColor="#a78bfa" stopOpacity="0.5" />
            </linearGradient>
            <filter id="workflow-shadow" x="-30%" y="-30%" width="160%" height="160%">
              <feDropShadow dx="0" dy="12" stdDeviation="18" floodColor="#0f172a" floodOpacity="0.14" />
            </filter>
          </defs>

          <path
            d="M76 196 C 145 112, 196 88, 252 128 S 371 220, 428 164 S 531 72, 602 116"
            fill="none"
            stroke="url(#workflow-line)"
            strokeWidth="10"
            strokeLinecap="round"
          />

          <path
            d="M76 196 C 145 112, 196 88, 252 128 S 371 220, 428 164 S 531 72, 602 116"
            fill="none"
            stroke="#ffffff"
            strokeOpacity="0.75"
            strokeWidth="2"
            strokeDasharray="1 18"
            strokeLinecap="round"
          />

          {nodes.map((node, index) => (
            <g key={node.label} filter="url(#workflow-shadow)">
              <circle
                cx={node.x}
                cy={node.y}
                r="38"
                fill="white"
                stroke={node.accent}
                strokeWidth="2"
              />
              <circle cx={node.x} cy={node.y} r="18" fill={node.accent} fillOpacity="0.18" />
              <text
                x={node.x}
                y={node.y - 2}
                textAnchor="middle"
                className="fill-slate-900"
                style={{ fontSize: "15px", fontWeight: 700 }}
              >
                {node.label}
              </text>
              <text
                x={node.x}
                y={node.y + 16}
                textAnchor="middle"
                className="fill-slate-500"
                style={{ fontSize: "9px", fontWeight: 600, letterSpacing: "0.14em" }}
              >
                {index === 0 ? "INTAKE" : index === 1 ? "RESPONSE" : index === 2 ? "SME" : "SUPPORT"}
              </text>
            </g>
          ))}

          <g filter="url(#workflow-shadow)">
            <rect x="44" y="244" width="172" height="72" rx="20" fill="white" stroke="#cbd5e1" />
            <rect x="250" y="244" width="172" height="72" rx="20" fill="white" stroke="#cbd5e1" />
            <rect x="456" y="244" width="172" height="72" rx="20" fill="white" stroke="#cbd5e1" />

            <text x="60" y="272" className="fill-slate-900" style={{ fontSize: "14px", fontWeight: 700 }}>
              Capture
            </text>
            <text x="60" y="292" className="fill-slate-500" style={{ fontSize: "10px" }}>
              Inquiries, RFP text, docs
            </text>

            <text x="266" y="272" className="fill-slate-900" style={{ fontSize: "14px", fontWeight: 700 }}>
              Response
            </text>
            <text x="266" y="292" className="fill-slate-500" style={{ fontSize: "10px" }}>
              Draft, review, align
            </text>

            <text x="472" y="272" className="fill-slate-900" style={{ fontSize: "14px", fontWeight: 700 }}>
              Delivery
            </text>
            <text x="472" y="292" className="fill-slate-500" style={{ fontSize: "10px" }}>
              Tasks, SME, execution
            </text>
          </g>
        </svg>
      </div>
    </div>
  );
}
