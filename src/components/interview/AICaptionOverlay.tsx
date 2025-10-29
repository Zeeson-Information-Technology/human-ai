export default function AICaptionOverlay({ text }: { text: string }) {
  if (!text) return null;
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-24 px-4">
      <div className="mx-auto max-w-3xl rounded-xl bg-black/60 text-slate-100 text-base px-4 py-2">
        {text}
      </div>
    </div>
  );
}
