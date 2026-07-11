import { Skeleton } from "@/components/ui/skeleton";

export default function LettersLoading() {
  return (
    <div className="flex flex-col gap-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-3">
          <Skeleton className="h-3 w-32" />
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-5 w-48" />
        </div>
        <div className="flex items-center gap-3">
          <Skeleton className="h-9 w-28 rounded-full" />
          <Skeleton className="h-9 w-36 rounded-full" />
        </div>
      </div>

      {/* List */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <Skeleton className="size-5 rounded" />
          <Skeleton className="h-6 w-44" />
        </div>

        {[...Array(5)].map((_, i) => (
          <div key={i} className="bg-white border border-outline-variant/60 rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2">
                <Skeleton className="h-5 w-64" />
                <Skeleton className="h-5 w-14 rounded-full" />
              </div>
              <Skeleton className="h-3 w-80" />
            </div>
            <Skeleton className="h-6 w-20 rounded-full shrink-0 self-start sm:self-center" />
          </div>
        ))}
      </div>
    </div>
  );
}
