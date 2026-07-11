import { Skeleton } from "@/components/ui/skeleton";

export default function LetterDetailLoading() {
  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-10">
      {/* Header */}
      <div className="flex items-start gap-4">
        <Skeleton className="size-10 rounded-full shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-96" />
            <Skeleton className="h-6 w-24 rounded-full" />
          </div>
          <Skeleton className="h-4 w-64" />
        </div>
      </div>

      {/* Metadata Grid */}
      <div className="bg-white border border-outline-variant/60 rounded-2xl p-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-4 w-28" />
            </div>
          ))}
        </div>
      </div>

      {/* Body */}
      <div className="space-y-4">
        <Skeleton className="h-6 w-40" />
        <div className="bg-white border border-outline-variant/60 rounded-2xl p-6 sm:p-8 space-y-3">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className={`h-4 w-${i % 3 === 0 ? "3/4" : i % 3 === 1 ? "full" : "5/6"}`} />
          ))}
        </div>
      </div>

      {/* Workflow */}
      <div className="space-y-4">
        <Skeleton className="h-6 w-40" />
        <div className="bg-white border border-outline-variant/60 rounded-2xl p-6 flex gap-3">
          <Skeleton className="h-11 w-36 rounded-full" />
          <Skeleton className="h-11 w-36 rounded-full" />
        </div>
      </div>
    </div>
  );
}
