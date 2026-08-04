import { Skeleton } from "@/components/ui/skeleton";

export default function WeeklyReportLoading() {
  return (
    <div className="flex flex-col gap-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/40 backdrop-blur-md border border-outline-variant/20 rounded-3xl p-6">
        <div className="space-y-2">
          <Skeleton className="h-3 w-32" />
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-48" />
        </div>
        <Skeleton className="h-11 w-44 rounded-2xl" />
      </div>

      {/* Week Selector Bar */}
      <div className="bg-white border border-outline-variant/40 rounded-3xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-8 w-32 rounded-xl" />
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {[...Array(8)].map((_, i) => (
            <Skeleton key={i} className="h-9 w-28 rounded-xl shrink-0" />
          ))}
        </div>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white border border-outline-variant/60 rounded-2xl p-5 flex flex-col gap-2 shadow-sm">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-7 w-12" />
            <Skeleton className="h-3 w-24" />
          </div>
        ))}
      </div>

      {/* Weekly Report Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-white border border-outline-variant/60 rounded-3xl p-6 flex flex-col justify-between gap-4 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-2 flex-1">
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-3.5 w-28" />
              </div>
              <Skeleton className="h-6 w-20 rounded-full shrink-0" />
            </div>

            <div className="space-y-2 border-t border-outline-variant/20 pt-4">
              <Skeleton className="h-3.5 w-full" />
              <Skeleton className="h-3.5 w-4/5" />
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-outline-variant/20">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-24 rounded-xl" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
