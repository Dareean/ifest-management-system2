import { Skeleton } from "@/components/ui/skeleton";

export default function MembersLoading() {
  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-3">
          <Skeleton className="h-3 w-32" />
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-5 w-36" />
        </div>
        <Skeleton className="h-11 w-40 rounded-full" />
      </div>

      {/* Member Rows */}
      <div className="flex flex-col gap-2">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="bg-white border border-outline-variant/60 rounded-xl p-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <Skeleton className="size-10 rounded-full shrink-0" />
              <div className="space-y-1.5 min-w-0">
                <Skeleton className="h-4 w-44" />
                <Skeleton className="h-3 w-28" />
              </div>
            </div>
            <Skeleton className="h-5 w-20 rounded-full shrink-0" />
          </div>
        ))}
      </div>
    </div>
  );
}
