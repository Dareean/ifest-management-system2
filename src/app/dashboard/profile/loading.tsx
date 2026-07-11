import { Skeleton } from "@/components/ui/skeleton";

export default function ProfileLoading() {
  return (
    <div className="max-w-3xl mx-auto flex flex-col gap-10">
      {/* Header */}
      <div className="space-y-3">
        <Skeleton className="h-3 w-32" />
        <Skeleton className="h-10 w-36" />
      </div>

      {/* Profile Card */}
      <div className="bg-white border border-outline-variant/60 rounded-2xl p-8">
        <div className="flex flex-col sm:flex-row sm:items-center gap-6 mb-8 pb-8 border-b border-outline-variant/20">
          <Skeleton className="size-24 rounded-full shrink-0" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-7 w-48" />
            <Skeleton className="h-4 w-36" />
            <Skeleton className="h-4 w-56" />
          </div>
        </div>

        {/* Info Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="space-y-1.5">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-5 w-40" />
            </div>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="space-y-4">
        <Skeleton className="h-6 w-32" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white border border-outline-variant/60 rounded-2xl p-6 space-y-2">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-8 w-12" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
