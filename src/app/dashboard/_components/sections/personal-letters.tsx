import { getUserLetters, getAllLetters } from "@/lib/data/personal-dashboard";
import { Badge } from "@/components/ui/badge";
import { FileText } from "lucide-react";
import Link from "next/link";
import { getStatusDisplay } from "@/lib/data/letters";

export async function PersonalLetters({ assignmentId, showAll }: { assignmentId?: string; showAll?: boolean }) {
  const letters = showAll
    ? await getAllLetters(5)
    : assignmentId
      ? await getUserLetters(assignmentId)
      : [];

  return (
    <div className="flex flex-col gap-3">
      {letters.length === 0 && (
        <div className="bg-white border border-outline-variant/60 rounded-2xl p-6 text-center">
          <p className="text-sm font-mono text-on-surface-variant">Belum ada surat.</p>
        </div>
      )}
      {letters.map((l: any) => {
        const status = getStatusDisplay(l.status);
        return (
          <Link href={`/dashboard/letters/${l.id}`} key={l.id} className="block group">
            <div className="bg-white border border-outline-variant/60 rounded-xl p-4 flex items-center justify-between gap-4 hover:border-accent-magenta/50 transition-all">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-on-surface truncate group-hover:text-accent-magenta transition-colors">
                  {l.subject}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  <p className="text-xs text-on-surface-variant font-mono">
                    {new Date(l.createdAt).toLocaleDateString("id-ID", {
                      day: "numeric", month: "short", year: "numeric",
                    })}
                  </p>
                  {showAll && l.requester && (
                    <span className="text-[10px] font-mono text-accent-magenta">
                      {l.requester}
                    </span>
                  )}
                </div>
              </div>
              <Badge variant={status.variant} className="text-[10px] font-mono px-2 py-0.5 shrink-0">
                {status.label}
              </Badge>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
