import clsx from "clsx";

type PaginationProps = {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
  className?: string;
};

function buildPageList(page: number, total: number) {
  const pages = new Set<number>();
  pages.add(1);
  pages.add(total);
  pages.add(page);
  pages.add(page - 1);
  pages.add(page + 1);
  pages.add(page - 2);
  pages.add(page + 2);

  const sorted = Array.from(pages)
    .filter((p) => p >= 1 && p <= total)
    .sort((a, b) => a - b);

  const out: Array<number | "ellipsis"> = [];
  for (let i = 0; i < sorted.length; i++) {
    const current = sorted[i];
    const prev = sorted[i - 1];
    if (i > 0 && prev !== undefined && current - prev > 1) {
      out.push("ellipsis");
    }
    out.push(current);
  }
  return out;
}

export default function Pagination({
  page,
  totalPages,
  onChange,
  className,
}: PaginationProps) {
  if (totalPages <= 1) return null;
  const pages = buildPageList(page, totalPages);

  return (
    <div
      className={clsx(
        "flex items-center gap-2 text-sm select-none justify-center",
        className
      )}
    >
      <button
        type="button"
        onClick={() => onChange(Math.max(1, page - 1))}
        disabled={page <= 1}
        className="rounded-full border px-3 py-1.5 bg-white/90 shadow-sm hover:shadow transition text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 cursor-pointer"
      >
        Prev
      </button>
      <div className="flex items-center gap-1">
        {pages.map((p, idx) =>
          p === "ellipsis" ? (
            <span key={`el-${idx}`} className="px-2 text-gray-400">
              …
            </span>
          ) : (
            <button
              type="button"
              key={p}
              onClick={() => onChange(p)}
              className={clsx(
                "min-w-[36px] rounded-full px-3 py-1.5 border cursor-pointer shadow-sm transition",
                p === page
                  ? "bg-black text-white border-black shadow-md"
                  : "bg-white/90 text-gray-900 hover:bg-gray-100"
              )}
            >
              {p}
            </button>
          )
        )}
      </div>
      <button
        type="button"
        onClick={() => onChange(Math.min(totalPages, page + 1))}
        disabled={page >= totalPages}
        className="rounded-full border px-3 py-1.5 bg-white/90 shadow-sm hover:shadow transition text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 cursor-pointer"
      >
        Next
      </button>
    </div>
  );
}
