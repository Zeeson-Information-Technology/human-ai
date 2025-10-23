"use client";
import { SectionCard, PrimaryButton } from "@/components/interview/atoms";

export default function ConsentStep({
  dark = false,
  agree,
  onAgree,
  onContinue,
}: {
  dark?: boolean;
  agree: boolean;
  onAgree: (v: boolean) => void;
  onContinue: () => void;
}) {
  return (
    <>
      <h1 className="text-3xl font-semibold mt-8 mb-4">
        Before starting the interview
      </h1>
      <SectionCard dark={dark}>
        <ol className="list-decimal pl-6 space-y-2 text-slate-300">
          <li>
            Your AI interview will be recorded for review and decision by the
            recruiting company review.
          </li>
          <li>
            This interview is proctored. Stay on this tab; avoid external tools.
          </li>
          <li>You can ask clarifying questions anytime.</li>
        </ol>
        <label className="flex items-center gap-3 mt-6">
          <input
            type="checkbox"
            checked={agree}
            onChange={(e) => onAgree(e.target.checked)}
          />
          <span className="text-slate-300 cursor-pointer">
            I agree to the <a className="underline">terms</a> &{" "}
            <a className="underline">privacy policy</a>.
          </span>
        </label>
        <div className="mt-6 flex gap-3 cursor-pointer">
          <PrimaryButton dark={dark} disabled={!agree} onClick={onContinue}>
            Continue
          </PrimaryButton>
        </div>
      </SectionCard>
    </>
  );
}
