import { Skeleton } from "@/components/ui/skeleton";

export default function AdminDivisionsLoading() {
  return (
    <div className="flex flex-col gap-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/40 backdrop-blur-md border border-outline-variant/20 rounded-3xl p-6">
        <div className="space-y-2">
          <Skeleton className="h-3 w-32" />
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-40" />
        </div>
        <Skeleton className="h-11 w-36 rounded-2xl" />
      </div>

      {/* Division Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-white border border-outline-variant/60 rounded-2xl p-6 flex flex-col justify-between gap-4 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-2 flex-1">
                <Skeleton className="h-5 w-36" />
                <Skeleton className="h-3.5 w-24" />
              </div>
              <Skeleton className="size-8 rounded-xl shrink-0" />
            </div>

            <Skeleton className="h-3.5 w-4/5" />

            <div className="flex items-center justify-between pt-3 border-t border-outline-variant/20">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-6 w-16 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
