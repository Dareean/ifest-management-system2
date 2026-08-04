import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <div className="flex flex-col gap-6">
      {/* Header Glassmorphism Card */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/40 backdrop-blur-md border border-outline-variant/20 rounded-3xl p-6">
        <div className="space-y-2">
          <Skeleton className="h-3 w-32" />
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-48" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-10 w-28 rounded-2xl" />
          <Skeleton className="h-10 w-28 rounded-2xl" />
        </div>
      </div>

      {/* Stat Cards Grid (4 columns) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white border border-outline-variant/60 rounded-3xl p-6 flex flex-col gap-3 shadow-sm">
            <div className="flex items-center justify-between">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="size-8 rounded-xl" />
            </div>
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-3 w-28" />
          </div>
        ))}
      </div>

      {/* Main Content Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Activity & Meetings */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="bg-white border border-outline-variant/60 rounded-3xl p-6 space-y-4 shadow-sm">
            <div className="flex items-center justify-between">
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-4 w-20" />
            </div>
            {[...Array(3)].map((_, i) => (
              <div key={i} className="p-4 rounded-2xl border border-outline-variant/30 flex items-center justify-between gap-4">
                <div className="space-y-2 min-w-0 flex-1">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
                <Skeleton className="h-7 w-20 rounded-xl shrink-0" />
              </div>
            ))}
          </div>
        </div>

        {/* Right 1 Col: Quick Links & Notifications */}
        <div className="flex flex-col gap-6">
          <div className="bg-white border border-outline-variant/60 rounded-3xl p-6 space-y-4 shadow-sm">
            <Skeleton className="h-6 w-32" />
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-2xl border border-outline-variant/20">
                <Skeleton className="size-9 rounded-xl shrink-0" />
                <div className="space-y-1.5 flex-1">
                  <Skeleton className="h-3.5 w-28" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
