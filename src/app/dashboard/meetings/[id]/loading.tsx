import { Skeleton } from "@/components/ui/skeleton";

export default function MeetingDetailLoading() {
  return (
    <div className="max-w-6xl mx-auto flex flex-col gap-8 px-4 py-6">
      {/* Header */}
      <div className="flex flex-col gap-3 pb-6 border-b border-outline-variant/30">
        <Skeleton className="h-6 w-96 mb-1" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-5 w-24 rounded-full" />
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-8">
          <div className="space-y-3">
            <Skeleton className="h-5 w-32" />
            <div className="bg-white border border-outline-variant/60 rounded-[24px] p-6 sm:p-8 space-y-3">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className={`h-4 w-${i % 2 === 0 ? "full" : "5/6"}`} />
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <Skeleton className="h-5 w-32" />
            <div className="bg-white border border-outline-variant/60 rounded-[24px] p-6 sm:p-8 space-y-3">
              {[...Array(8)].map((_, i) => (
                <Skeleton key={i} className={`h-3 w-${i === 0 ? "1/3" : i === 1 ? "full" : "4/5"}`} />
              ))}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          <div className="bg-white border border-outline-variant/60 rounded-[24px] p-6 space-y-4">
            <Skeleton className="h-4 w-24" />
            {[...Array(3)].map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-4 w-40" />
              </div>
            ))}
            <Skeleton className="h-10 w-full rounded-full" />
          </div>

          <div className="bg-white border border-outline-variant/60 rounded-[24px] p-6 space-y-4">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-11 w-full rounded-full" />
            <Skeleton className="h-11 w-full rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
}
