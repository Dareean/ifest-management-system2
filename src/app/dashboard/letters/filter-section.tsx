"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { Filter, X } from "lucide-react";

const priorities = [
  { value: "", label: "Semua Prioritas" },
  { value: "tinggi", label: "🔴 Tinggi" },
  { value: "sedang", label: "🟡 Sedang" },
  { value: "rendah", label: "🟢 Rendah" },
];

interface DivisionItem {
  id: string;
  name: string;
  slug: string;
}

export function FilterSection({ divisions }: { divisions: DivisionItem[] }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const currentPriority = searchParams.get("priority") ?? "";
  const currentDivision = searchParams.get("division") ?? "";
  const hasFilter = currentPriority || currentDivision;

  function updateFilter(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`${pathname}?${params.toString()}`);
  }

  function clearFilters() {
    router.push(pathname);
  }

  return (
    <div className="bg-white border border-outline-variant/60 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center gap-3">
      <div className="flex items-center gap-2 shrink-0">
        <Filter className="size-4 text-on-surface-variant" />
        <span className="text-sm font-semibold text-on-surface">Filter</span>
      </div>
      <div className="flex flex-wrap gap-2 flex-1">
        {/* Division Filter */}
        <select
          value={currentDivision}
          onChange={(e) => updateFilter("division", e.target.value)}
          className="h-9 rounded-lg border border-outline-variant/60 bg-surface-bright px-3 text-sm font-sans text-on-surface focus:border-accent-magenta focus:outline-none cursor-pointer"
        >
          <option value="">Semua Divisi</option>
          {divisions.map((d) => (
            <option key={d.slug} value={d.slug}>
              {d.name}
            </option>
          ))}
        </select>

        {/* Priority Filter */}
        <select
          value={currentPriority}
          onChange={(e) => updateFilter("priority", e.target.value)}
          className="h-9 rounded-lg border border-outline-variant/60 bg-surface-bright px-3 text-sm font-sans text-on-surface focus:border-accent-magenta focus:outline-none cursor-pointer"
        >
          {priorities.map((p) => (
            <option key={p.value} value={p.value}>{p.label}</option>
          ))}
        </select>

        {/* Reset button */}
        {hasFilter && (
          <button
            onClick={clearFilters}
            className="h-9 px-3 flex items-center gap-1.5 text-xs font-semibold text-on-surface-variant hover:text-error hover:bg-error/5 border border-outline-variant/40 rounded-lg transition-colors cursor-pointer"
          >
            <X className="size-3.5" />
            Reset
          </button>
        )}
      </div>
    </div>
  );
}

