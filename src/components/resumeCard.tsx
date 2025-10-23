// src/components/ResumeCard.tsx
export default function ResumeCard({
  resumeUrl,
  resumeFileName,
  onUpload,
}: {
  resumeUrl: string | null;
  resumeFileName: string | null;
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <div className="rounded-2xl border bg-white/80 p-4 sm:p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border bg-white">
            <svg
              viewBox="0 0 24 24"
              className="h-5 w-5 text-gray-700"
              aria-hidden
            >
              <path
                fill="currentColor"
                d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zm0 0v6h6"
              />
            </svg>
          </div>
          <div>
            <div className="text-sm text-gray-500">Resume</div>
            {resumeUrl ? (
              <div className="flex flex-wrap items-center gap-2">
                <a
                  href={resumeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-gray-900 hover:underline"
                >
                  {resumeFileName || "View Resume"}
                </a>
                <span className="text-xs text-gray-400">•</span>
                <span className="text-xs text-emerald-700">Saved</span>
              </div>
            ) : (
              <div className="text-sm text-gray-600">No resume on file</div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {resumeUrl && (
            <a
              href={resumeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg border px-3 py-1.5 text-sm text-gray-800 hover:bg-gray-50"
            >
              View
            </a>
          )}
          <label className="rounded-lg border px-3 py-1.5 text-sm text-emerald-700 hover:bg-emerald-50 cursor-pointer">
            {resumeUrl ? "Replace" : "Upload"}
            <input
              type="file"
              accept=".pdf,.doc,.docx"
              className="hidden"
              onChange={onUpload}
            />
          </label>
        </div>
      </div>
    </div>
  );
}
