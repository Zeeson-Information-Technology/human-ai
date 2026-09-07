export default function Stats() {
  const items = [
    { k: "Core markets", v: "3" },
    { k: "Support model", v: "Human + AI" },
    { k: "Coverage", v: "Global" },
    { k: "Focus", v: "RFPs" },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
      {items.map((item) => (
        <div key={item.k} className="rounded-2xl border p-4 text-center">
          <div className="text-2xl font-bold">{item.v}</div>
          <div className="text-xs text-gray-600">{item.k}</div>
        </div>
      ))}
    </div>
  );
}
