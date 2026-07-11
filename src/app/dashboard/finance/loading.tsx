import { Skeleton } from "@/components/ui/skeleton";

export default function FinanceLoading() {
  return (
    <div className="flex flex-col gap-10">
      {/* Header */}
      <div className="space-y-3">
        <Skeleton className="h-3 w-32" />
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-5 w-56" />
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white border border-outline-variant/60 rounded-2xl p-6 space-y-3">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-3 w-32" />
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="space-y-4">
        <Skeleton className="h-6 w-36" />
        <div className="bg-white border border-outline-variant/60 rounded-2xl overflow-hidden">
          {/* Table Header */}
          <div className="grid grid-cols-4 gap-4 p-4 border-b border-outline-variant/20 bg-surface-container-low">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-4 w-20" />
            ))}
          </div>
          {/* Table Rows */}
          {[...Array(6)].map((_, i) => (
            <div key={i} className="grid grid-cols-4 gap-4 p-4 border-b border-outline-variant/10">
              {[...Array(4)].map((_, j) => (
                <Skeleton key={j} className="h-4 w-24" />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
