import { Skeleton } from "@/components/ui/skeleton";

export default function ProfileLoading() {
  return (
    <div className="w-full flex flex-col gap-8">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-3 w-32" />
          <Skeleton className="h-9 w-48" />
        </div>
        <Skeleton className="h-9 w-32 rounded-xl shrink-0" />
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Column (2/3) */}
        <div className="lg:col-span-2 flex flex-col gap-8">
          <div className="bg-white border border-outline-variant/60 rounded-2xl p-6 sm:p-8 space-y-6">
            <div className="space-y-2 border-b border-outline-variant/20 pb-4">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-72" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-10 w-full rounded-lg" />
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white border border-outline-variant/60 rounded-2xl p-6 sm:p-8 space-y-6">
            <div className="space-y-2 border-b border-outline-variant/20 pb-4">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-64" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {[...Array(2)].map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-10 w-full rounded-lg" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column (1/3) */}
        <div className="flex flex-col gap-8">
          <div className="bg-white border border-outline-variant/60 rounded-2xl p-6 sm:p-8 flex flex-col items-center text-center space-y-4">
            <Skeleton className="size-24 rounded-2xl" />
            <div className="space-y-2 w-full">
              <Skeleton className="h-6 w-36 mx-auto" />
              <Skeleton className="h-4 w-28 mx-auto" />
              <Skeleton className="h-4 w-32 mx-auto" />
            </div>
          </div>

          <div className="bg-white border border-outline-variant/60 rounded-2xl p-6 sm:p-8 space-y-4">
            <Skeleton className="h-5 w-36" />
            <div className="grid grid-cols-2 gap-3">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-16 rounded-xl" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
