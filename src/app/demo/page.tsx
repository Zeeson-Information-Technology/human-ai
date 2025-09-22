// src/app/demo/page.tsx
import Link from "next/link";

export const metadata = {
  title: "Equatoria — Demo",
  description: "Quick demos showing the Data Engine in action.",
};

export default function DemoHub() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-3xl">
        {/* Header */}
        <div className="text-center">
          <div className="relative mx-auto mb-6 h-28 w-full max-w-md">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 -z-10 blur-2xl opacity-70"
              style={{
                background:
                  "radial-gradient(60% 50% at 70% 50%, rgba(226,254,255,0.7) 0%, rgba(226,254,255,0.25) 45%, rgba(226,254,255,0) 75%)",
              }}
            />
            <PipelineSVG />
          </div>

          <h1 className="text-3xl font-bold">Interactive demos</h1>
          <p className="mt-2 text-gray-600">
            Lightweight, on-brand demos you can try in the browser. No customer
            data.
          </p>
        </div>

        {/* Cards */}
        <div className="mt-8 grid gap-4">
          {/* Equatoria Voice Lab — Speech & Translation (primary) */}
          <Link
            href="/demo/lang-collect"
            className="block rounded-2xl border p-5 shadow-sm transition hover:-translate-y-0.5 hover:bg-gray-50"
            aria-label="Open Equatoria Voice Lab (Speech & Translation) demo"
          >
            <div className="flex items-center justify-between">
              <div className="font-semibold">
                Equatoria Voice Lab — Speech &amp; Translation
              </div>
              <span className="rounded-full border px-2 py-0.5 text-xs text-gray-600">
                Yoruba • Hausa • Igbo • Pidgin • Ibibio
              </span>
            </div>
            <p className="mt-1 text-sm text-gray-600">
              Read a prompt in your accent and add a written translation.
              Designed for inclusive, Nigeria-first language datasets.
            </p>
          </Link>

          {/* Text Annotation */}
          <Link
            href="/demo/annotate-text"
            className="block rounded-2xl border p-5 shadow-sm transition hover:-translate-y-0.5 hover:bg-gray-50"
            aria-label="Open Text Annotation demo"
          >
            <div className="font-semibold">Text Annotation (QA / Intent)</div>
            <p className="mt-1 text-sm text-gray-600">
              Choose a label for Hausa / Yorùbá / Swahili samples and save—see
              how reviewer decisions become evidence for eval & RLHF.
            </p>
          </Link>

          {/* Image / OCR */}
          <Link
            href="/demo/annotate-image"
            className="block rounded-2xl border p-5 shadow-sm transition hover:-translate-y-0.5 hover:bg-gray-50"
            aria-label="Open Image Annotation demo"
          >
            <div className="font-semibold">Document OCR (Bounding Boxes)</div>
            <p className="mt-1 text-sm text-gray-600">
              Draw boxes (e.g., <em>Total</em>, <em>Date</em>, <em>Tax</em>) on
              receipts and save image-space coordinates for training & QA.
            </p>
          </Link>

          <Link
            href="/demo/exports"
            className="block rounded-2xl border p-5 shadow-sm transition hover:-translate-y-0.5 hover:bg-gray-50"
            aria-label="Open Demo Exports"
          >
            <div className="font-semibold">Demo Exports</div>
            <p className="mt-1 text-sm text-gray-600">
              Download CSVs from Equatoria Voice Lab and other demos.
            </p>
          </Link>
        </div>
      </div>
    </div>
  );
}

/** Minimal inline SVG that suggests a 5-step pipeline with a moving dot */
function PipelineSVG() {
  return (
    <svg
      className="floaty mx-auto block"
      viewBox="0 0 480 120"
      width="100%"
      height="100%"
      role="img"
      aria-label="Demo pipeline visual"
    >
      <rect x="40" y="58" width="400" height="4" fill="#e5e7eb" />
      <rect x="40" y="58" width="180" height="4" fill="#10b981" />
      {[{ x: 40 }, { x: 140 }, { x: 240 }, { x: 340 }, { x: 440 }].map(
        (n, i) => (
          <g key={i} transform={`translate(${n.x}, 0)`}>
            <circle
              cx="0"
              cy="60"
              r="10"
              fill={i < 2 ? "#10b981" : "#111827"}
            />
            <circle
              cx="0"
              cy="60"
              r="12"
              fill="none"
              stroke={i < 2 ? "rgba(16,185,129,0.4)" : "rgba(17,24,39,0.2)"}
              strokeWidth="2"
            />
          </g>
        )
      )}
      <circle cx="220" cy="60" r="5" fill="#06b6d4">
        <animate
          attributeName="cx"
          values="40;140;240;340;440"
          dur="8s"
          repeatCount="indefinite"
        />
      </circle>
      <text x="40" y="30" textAnchor="middle" fontSize="10" fill="#374151">
        Consent
      </text>
      <text x="140" y="30" textAnchor="middle" fontSize="10" fill="#374151">
        Curate
      </text>
      <text x="240" y="30" textAnchor="middle" fontSize="10" fill="#374151">
        Label
      </text>
      <text x="340" y="30" textAnchor="middle" fontSize="10" fill="#374151">
        Evaluate
      </text>
      <text x="440" y="30" textAnchor="middle" fontSize="10" fill="#374151">
        Deliver
      </text>
    </svg>
  );
}
