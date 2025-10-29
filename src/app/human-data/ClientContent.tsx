// src/app/human-data/ClientContent.tsx
"use client";

import { useMemo, useState, ReactNode } from "react";
import Link from "next/link";
import { brand } from "@/lib/brand";

import Introduction from "./sections/Introduction";
import TalentSourcing from "./sections/TalentSourcing";
import TalentPayment from "./sections/TalentPayment";
import TalentClassification from "./sections/TalentClassification";
import TalentPods from "./sections/TalentPods";
import WorkflowInstructions from "./sections/WorkflowInstructions";
import WorkflowPipeline from "./sections/WorkflowPipeline";
import WorkflowTypes from "./sections/WorkflowTypes";
import TipsStats from "./sections/TipsStats";
import TipsTransparency from "./sections/TipsTransparency";

type TocGroup = {
  label: string;
  items: { key: string; label: string }[];
};

type Toc = {
  singles: { key: string; label: string }[];
  groups: TocGroup[];
};

const PAGES: Record<string, ReactNode> = {
  introduction: <Introduction />,
  "talent-sourcing": <TalentSourcing />,
  "talent-payment": <TalentPayment />,
  "talent-classification": <TalentClassification />,
  "talent-pods": <TalentPods />,
  "wf-instructions": <WorkflowInstructions />,
  "wf-pipeline": <WorkflowPipeline />,
  "wf-types": <WorkflowTypes />,
  "tips-stats": <TipsStats />,
  "tips-transparency": <TipsTransparency />,
};

export default function ClientContent() {
  const toc: Toc = useMemo(
    () => ({
      singles: [{ key: "introduction", label: "Introduction" }],
      groups: [
        {
          label: "Talent",
          items: [
            { key: "talent-sourcing", label: "Sourcing, vetting & training" },
            { key: "talent-payment", label: "Staff payment structure" },
            {
              key: "talent-classification",
              label: "Contractor classification",
            },
            { key: "talent-pods", label: "Team pod structure" },
          ],
        },
        {
          label: "Workflows",
          items: [
            { key: "wf-instructions", label: "Project instructions" },
            { key: "wf-pipeline", label: "Task pipeline" },
            { key: "wf-types", label: "Types of pipelines" },
          ],
        },
        {
          label: "Tips for hiring",
          items: [
            { key: "tips-stats", label: "Statistics & fraud" },
            { key: "tips-transparency", label: "Transparency with clients" },
          ],
        },
      ],
    }),
    []
  );

  const flatItems = useMemo(
    () => [...toc.singles, ...toc.groups.flatMap((g) => g.items)],
    [toc]
  );

  const [activeKey, setActiveKey] = useState<string>(flatItems[0].key);
  const activeIdx = flatItems.findIndex((i) => i.key === activeKey);
  const prevItem = activeIdx > 0 ? flatItems[activeIdx - 1] : null;
  const nextItem =
    activeIdx < flatItems.length - 1 ? flatItems[activeIdx + 1] : null;
  const getLabel = (key: string) =>
    flatItems.find((i) => i.key === key)?.label || "";

  const NavButton = ({
    dir,
    target,
    onClick,
  }: {
    dir: "prev" | "next";
    target: { key: string; label: string } | null;
    onClick: () => void;
  }) => {
    if (!target) return null;
    const base =
      "inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition hover:bg-gray-50 dark:hover:bg-white/10";
    return (
      <button
        type="button"
        onClick={onClick}
        className={base}
        aria-label={
          dir === "prev" ? `Previous: ${target.label}` : `Next: ${target.label}`
        }
      >
        {dir === "prev" ? (
          <>
            <span aria-hidden="true">←</span>
            <span className="text-gray-800 dark:text-white/90">
              {target.label}
            </span>
          </>
        ) : (
          <>
            <span className="text-gray-800 dark:text-white/90">
              {target.label}
            </span>
            <span aria-hidden="true">→</span>
          </>
        )}
      </button>
    );
  };

  return (
    <div className="mx-auto grid max-w-6xl grid-cols-1 gap-10 px-4 py-10 md:grid-cols-[260px_1fr]">
      {/* === Left navigation === */}
      <aside className="md:sticky md:top-6 md:h-[calc(100vh-6rem)] md:overflow-auto">
        <nav className="rounded-2xl border bg-white/70 dark:bg-[#0a0a0a]/60 p-4 backdrop-blur supports-[backdrop-filter]:backdrop-blur">
          <div className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
            Contents
          </div>

          <ul className="mb-3 space-y-2 text-sm">
            {toc.singles.map((item) => (
              <li key={item.key}>
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    setActiveKey(item.key);
                  }}
                  className={`block rounded-md px-1 py-1 hover:text-emerald-600 ${
                    activeKey === item.key
                      ? "text-emerald-600 font-semibold"
                      : "text-gray-800 dark:text-gray-200"
                  }`}
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>

          {/* Grouped sections */}
          <div className="space-y-5">
            {toc.groups.map((group) => (
              <div key={group.label}>
                <div className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  {group.label}
                </div>
                <ul className="space-y-1 text-sm">
                  {group.items.map((item) => (
                    <li key={item.key}>
                      <a
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          setActiveKey(item.key);
                        }}
                        className={`block rounded-md px-1 py-1 hover:text-emerald-600 ${
                          activeKey === item.key
                            ? "text-emerald-600 font-semibold"
                            : "text-gray-700 dark:text-gray-300"
                        }`}
                      >
                        {item.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </nav>
      </aside>

      {/* === Main pane === */}
      <article className="relative flex flex-col rounded-2xl border bg-white/80 dark:bg-[#111]/70 p-6 backdrop-blur supports-[backdrop-filter]:backdrop-blur">
        {/* Title */}
        <header className="border-b border-gray-200/70 dark:border-gray-700 pb-4 mb-6">
          <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white/90">
            {getLabel(activeKey)}
          </h2>
        </header>

        {/* Main text content */}
        <div
          className="
            prose prose-slate max-w-none
            prose-p:my-5 prose-li:my-2 prose-headings:mb-4
            text-gray-900 dark:text-gray-100 leading-relaxed
            flex-1
          "
        >
          {PAGES[activeKey]}
        </div>

        {/* === Sticky footer navigation === */}
        <footer className="sticky bottom-0 left-0 mt-8 border-t border-gray-200/70 dark:border-gray-700 bg-white/90 dark:bg-[#0b0b0b]/90 backdrop-blur supports-[backdrop-filter]:backdrop-blur p-4 rounded-b-2xl flex items-center justify-between">
          <NavButton
            dir="prev"
            target={prevItem}
            onClick={() => prevItem && setActiveKey(prevItem.key)}
          />
          <NavButton
            dir="next"
            target={nextItem}
            onClick={() => nextItem && setActiveKey(nextItem.key)}
          />
        </footer>

        {/* === Persistent bottom note === */}
        <div className="mt-16 mb-2 rounded-lg bg-gray-50 dark:bg-white/5 p-4 text-sm text-gray-700 dark:text-gray-300">
          Parts of the human data platform are available via API. For fully
          managed programs,{" "}
          <Link className="underline" href="/contact">
            book a demo
          </Link>{" "}
          and we’ll tailor a pod to your domain and timeline.
        </div>
      </article>
    </div>
  );
}
