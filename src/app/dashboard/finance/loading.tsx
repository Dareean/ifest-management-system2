import { Skeleton } from "@/components/ui/skeleton";

export default function FinanceLoading() {
  return (
    <div className="w-full flex flex-col gap-8">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-3 w-32" />
          <Skeleton className="h-9 w-52" />
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <Skeleton className="h-10 w-44 rounded-xl" />
          <Skeleton className="h-10 w-32 rounded-xl" />
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Column (2/3) */}
        <div className="lg:col-span-2 flex flex-col gap-8">
          <div className="bg-white border border-outline-variant/60 rounded-2xl p-6 sm:p-8 space-y-6">
            <div className="space-y-2 border-b border-outline-variant/20 pb-4">
              <Skeleton className="h-6 w-56" />
              <Skeleton className="h-4 w-72" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-40 rounded-2xl" />
              ))}
            </div>
          </div>

          <div className="bg-white border border-outline-variant/60 rounded-2xl p-6 sm:p-8 space-y-6">
            <div className="space-y-2 border-b border-outline-variant/20 pb-4">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-64" />
            </div>

            <Skeleton className="h-48 rounded-xl" />
          </div>
        </div>

        {/* Right Column (1/3) */}
        <div className="flex flex-col gap-8">
          <div className="bg-white border border-outline-variant/60 rounded-2xl p-6 sm:p-8 space-y-4">
            <Skeleton className="h-5 w-40" />
            <div className="grid grid-cols-2 gap-3">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-20 rounded-xl" />
              ))}
            </div>
          </div>

          <div className="bg-white border border-outline-variant/60 rounded-2xl p-6 sm:p-8 space-y-4">
            <Skeleton className="h-5 w-44" />
            <div className="flex flex-col gap-3">
              <Skeleton className="h-10 w-full rounded-xl" />
              <Skeleton className="h-10 w-full rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
