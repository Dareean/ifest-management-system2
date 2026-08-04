import { Skeleton } from "@/components/ui/skeleton";

export default function LettersLoading() {
  return (
    <div className="flex flex-col gap-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/40 backdrop-blur-md border border-outline-variant/20 rounded-3xl p-6">
        <div className="space-y-2">
          <Skeleton className="h-3 w-32" />
          <Skeleton className="h-8 w-56" />
          <Skeleton className="h-4 w-44" />
        </div>
        <Skeleton className="h-11 w-36 rounded-2xl" />
      </div>

      {/* Control Panel (Search & Filter Tabs) */}
      <div className="flex flex-col gap-4 bg-white border border-outline-variant/40 rounded-3xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <Skeleton className="h-11 w-full max-w-md rounded-2xl" />
          <Skeleton className="h-8 w-32 rounded-xl" />
        </div>
        <div className="border-t border-outline-variant/40 pt-4 flex flex-wrap gap-2">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-8 w-24 rounded-xl" />
          ))}
        </div>
      </div>

      {/* Letters List */}
      <div className="flex flex-col gap-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="bg-white border border-outline-variant/60 rounded-3xl p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 shadow-sm">
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2">
                <Skeleton className="h-5 w-64" />
                <Skeleton className="h-5 w-16 rounded-full" />
              </div>
              <Skeleton className="h-3.5 w-80" />
            </div>
            <Skeleton className="h-8 w-24 rounded-xl shrink-0 self-start sm:self-center" />
          </div>
        ))}
      </div>
    </div>
  );
}
