"use client";
import { SectionCard, PrimaryButton } from "@/components/interview/atoms";

export default function FocusStep({
  dark = false,
  jobContext,
  resumeSummary,
  onContinue,
}: {
  dark?: boolean;
  jobContext: string;
  resumeSummary?: string;
  onContinue: () => void;
}) {
  return (
    <>
      <h1 className="text-3xl font-semibold mt-8 mb-2">
        I will interview you on:
      </h1>
      <SectionCard dark={dark}>
        <pre className="whitespace-pre-wrap text-slate-200">
          {jobContext || "General role fit"}
        </pre>
        {resumeSummary ? (
          <div className="mt-4 rounded-lg bg-slate-800/70 p-4">
            <div className="font-medium mb-1">From your resume:</div>
            <div className="text-sm text-slate-300 whitespace-pre-wrap">
              {resumeSummary}
            </div>
          </div>
        ) : null}
        <div className="mt-6">
          <PrimaryButton dark={dark} onClick={onContinue}>
            Continue
          </PrimaryButton>
        </div>
      </SectionCard>
    </>
  );
}
