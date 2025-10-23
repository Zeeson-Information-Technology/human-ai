"use client";
import { SectionCard, PrimaryButton } from "@/components/interview/atoms";

export default function IntroStep({
  dark = false,
  companyName = "",
  onContinue,
}: {
  dark?: boolean;
  companyName?: string;
  onContinue: () => void;
}) {
  return (
    <SectionCard dark={dark}>
      <div className="flex items-start gap-4">
        <div className="h-10 w-10 rounded-xl bg-indigo-500 text-white grid place-content-center font-bold">
          {(companyName?.[0] || "Z").toUpperCase()}
        </div>
        <div>
          <div className="text-xl font-semibold mb-2">
            {companyName || "Company"}
          </div>
          <p className="text-slate-300">
            This interview takes about{" "}
            <span className="font-semibold">~7.5 minutes</span>. Ensure a quiet
            spot and stable internet. The interview will be recorded for review
            and decision by {companyName || "the hiring team"}.
          </p>
        </div>
      </div>
      <div className="mt-6">
        <PrimaryButton dark={dark} onClick={onContinue}>
          Continue
        </PrimaryButton>
      </div>
    </SectionCard>
  );
}
