export default function Highlight() {
  const items = [
    "Proposal writing support",
    "RFP response coordination",
    "Compliance matrix reviews",
    "Canada, US, UK and EU markets",
  ];

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
