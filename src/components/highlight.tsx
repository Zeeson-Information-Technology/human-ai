export default function Highlight() {
  const items = ["Capture", "Response", "Talent sourcing", "Delivery support"];

  return (
    <div className="overflow-hidden rounded-2xl border">
      <div className="whitespace-nowrap p-3 text-sm animate-[marquee_25s_linear_infinite]">
        {items.concat(items).map((text, idx) => (
          <span key={idx} className="mx-4">
            • {text}
          </span>
        ))}
      </div>
    </div>
  );
}
