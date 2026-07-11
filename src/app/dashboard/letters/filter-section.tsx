"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { Filter } from "lucide-react";

const priorities = [
  { value: "", label: "Semua Prioritas" },
  { value: "tinggi", label: "Tinggi" },
  { value: "sedang", label: "Sedang" },
  { value: "rendah", label: "Rendah" },
];

const statuses = [
  { value: "", label: "Semua Status" },
  { value: "requested", label: "Diajukan" },
  { value: "in_revision", label: "Revisi" },
  { value: "approved", label: "Disetujui" },
  { value: "sent", label: "Terkirim" },
];

export function FilterSection() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const currentPriority = searchParams.get("priority") ?? "";
  const currentStatus = searchParams.get("status") ?? "";

  function updateFilter(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="bg-white border border-outline-variant/60 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center gap-4">
      <div className="flex items-center gap-2 shrink-0">
        <Filter className="size-4 text-on-surface-variant" />
        <span className="text-sm font-semibold text-on-surface">Filter</span>
      </div>
      <div className="flex flex-wrap gap-3">
        <select
          value={currentPriority}
          onChange={(e) => updateFilter("priority", e.target.value)}
          className="h-9 rounded-lg border border-outline-variant/60 bg-surface-bright px-3 text-sm font-sans text-on-surface focus:border-accent-magenta focus:outline-none cursor-pointer"
        >
          {priorities.map((p) => (
            <option key={p.value} value={p.value}>{p.label}</option>
          ))}
        </select>
        <select
          value={currentStatus}
          onChange={(e) => updateFilter("status", e.target.value)}
          className="h-9 rounded-lg border border-outline-variant/60 bg-surface-bright px-3 text-sm font-sans text-on-surface focus:border-accent-magenta focus:outline-none cursor-pointer"
        >
          {statuses.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
      </div>
    </div>
  );
}
