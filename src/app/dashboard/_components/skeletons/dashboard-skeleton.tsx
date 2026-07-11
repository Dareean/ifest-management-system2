import { Skeleton } from "@/components/ui/skeleton";

export function DashboardSkeleton() {
  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-col gap-3">
        <Skeleton className="h-3 w-32" />
        <Skeleton className="h-10 w-72" />
        <Skeleton className="h-5 w-56" />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white border border-outline-variant/60 rounded-2xl p-6 flex flex-col gap-3">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-3 w-24" />
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-4">
        <Skeleton className="h-6 w-40" />
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white border border-outline-variant/60 rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex-1 space-y-2">
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
            <Skeleton className="h-6 w-20 shrink-0 self-start sm:self-center" />
          </div>
        ))}
      </div>
    </div>
  );
}
