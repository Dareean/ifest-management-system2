import { Skeleton } from "@/components/ui/skeleton";

export default function KpiLoading() {
  return (
    <div className="flex flex-col gap-10">
      {/* Header */}
      <div className="space-y-3">
        <Skeleton className="h-3 w-32" />
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-5 w-64" />
      </div>

      {/* Divisi Cards */}
      {[...Array(4)].map((_, i) => (
        <div key={i} className="flex flex-col gap-4">
          <Skeleton className="h-6 w-40" />
          <div className="grid grid-cols-1 gap-3">
            {[...Array(3)].map((_, j) => (
              <div key={j} className="bg-white border border-outline-variant/60 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <Skeleton className="h-2 w-24 rounded-full" />
                  <Skeleton className="h-6 w-12 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
