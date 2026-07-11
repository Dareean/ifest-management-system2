import { Skeleton } from "@/components/ui/skeleton";

export function StatCardsSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
      {[...Array(count)].map((_, i) => (
        <div key={i} className="bg-surface-container-low border border-outline-variant/60 rounded-2xl p-6 space-y-3">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-9 w-16" />
          <Skeleton className="h-3 w-24" />
        </div>
      ))}
    </div>
  );
}
