import { Skeleton } from "@/components/ui/skeleton";

export default function TasksLoading() {
  return (
    <div className="flex flex-col gap-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/40 backdrop-blur-md border border-outline-variant/20 rounded-3xl p-6">
        <div className="space-y-2">
          <Skeleton className="h-3 w-32" />
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
      </div>

      {/* Division Task Groups */}
      {[...Array(3)].map((_, i) => (
        <div key={i} className="flex flex-col gap-4 bg-white border border-outline-variant/40 rounded-3xl p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-24" />
          </div>
          <div className="grid grid-cols-1 gap-3">
            {[...Array(3)].map((_, j) => (
              <div key={j} className="border border-outline-variant/30 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <Skeleton className="h-2 w-24 rounded-full" />
                  <Skeleton className="h-6 w-16 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
