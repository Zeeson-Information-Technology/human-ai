// src/components/Stats.tsx
export default function Stats() {
  const items = [
    { k: "Languages", v: "50+" },
    { k: "Annotators", v: "5,000+" },
    { k: "Experts", v: "500+" },
    { k: "SLA", v: "99.9%" },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
      {items.map((i) => (
        <div key={i.k} className="rounded-2xl border p-4 text-center">
          <div className="text-2xl font-bold">{i.v}</div>
          <div className="text-xs text-gray-600">{i.k}</div>
        </div>
      ))}
    </div>
  );
}
