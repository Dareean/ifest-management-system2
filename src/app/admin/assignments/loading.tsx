import { Skeleton } from "@/components/ui/skeleton";

export default function AdminAssignmentsLoading() {
  return (
    <div className="flex flex-col gap-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/40 backdrop-blur-md border border-outline-variant/20 rounded-3xl p-6">
        <div className="space-y-2">
          <Skeleton className="h-3 w-32" />
          <Skeleton className="h-8 w-56" />
          <Skeleton className="h-4 w-44" />
        </div>
        <Skeleton className="h-11 w-40 rounded-2xl" />
      </div>

      {/* Control Panel (Search & Division Filter Tabs) */}
      <div className="flex flex-col gap-4 bg-white border border-outline-variant/40 rounded-3xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <Skeleton className="h-11 w-full max-w-md rounded-2xl" />
          <Skeleton className="h-8 w-36 rounded-xl" />
        </div>
        <div className="border-t border-outline-variant/40 pt-4 flex flex-wrap gap-2">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-8 w-28 rounded-xl" />
          ))}
        </div>
      </div>

      {/* Personnel Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="bg-white border border-outline-variant/60 rounded-2xl p-5 flex flex-col justify-between gap-4 shadow-sm"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <Skeleton className="size-11 rounded-2xl shrink-0" />
                <div className="space-y-2 min-w-0 flex-1">
                  <Skeleton className="h-4 w-36" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
              <Skeleton className="size-8 rounded-xl shrink-0" />
            </div>

            <div className="flex items-center gap-2 pt-3 border-t border-outline-variant/20 flex-wrap">
              <Skeleton className="h-6 w-20 rounded-lg" />
              <Skeleton className="h-6 w-24 rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
