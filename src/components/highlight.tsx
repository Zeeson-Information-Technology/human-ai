// src/components/highlight.tsx
export default function Highlight() {
  const items = [
    "LLM eval & RLHF-ready workflows",
    "African languages & accents",
    "Expert-led QA (medical, legal, finance)",
    "Secure, compliant handover",
  ];

  return (
    <div className="overflow-hidden rounded-2xl border">
      <div className="whitespace-nowrap p-3 text-sm animate-[marquee_25s_linear_infinite]">
        {items.concat(items).map((t, idx) => (
          <span key={idx} className="mx-4">
            • {t}
          </span>
        ))}
      </div>
    </div>
  );
}
