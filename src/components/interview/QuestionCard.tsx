import { BRAND_FULL } from "@/lib/brand";

export default function QuestionCard({
  text,
  brand,
}: {
  text: string;
  brand?: string;
}) {
  return (
    <div className="mt-2">
      <div className="text-sm text-slate-400 mb-2">
        {brand || BRAND_FULL} • AI Interviewer
      </div>
      <div className="rounded-xl bg-slate-800/60 border border-slate-700 p-4 text-lg whitespace-pre-wrap">
        {text}
      </div>
    </div>
  );
}