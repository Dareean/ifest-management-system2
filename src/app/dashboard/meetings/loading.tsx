import { Spinner } from "@/components/ui/spinner";

export default function MeetingsLoading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <Spinner size="lg" />
      <p className="text-sm font-mono text-on-surface-variant animate-pulse">
        Memuat...
      </p>
    </div>
  );
}
