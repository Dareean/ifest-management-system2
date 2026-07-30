import Link from "next/link";
import { getLatestPublishedNotulensi } from "@/lib/data/meetings";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, Calendar, CheckSquare, ArrowRight, UserCheck, Sparkles } from "lucide-react";

export async function LatestNotulensiPRSection() {
  const notula = await getLatestPublishedNotulensi();

  if (!notula) return null;

  const meetingDateStr = new Date(notula.meetingDate).toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const publishedDateStr = new Date(notula.publishedAt).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="bg-gradient-to-br from-surface-bright via-white to-primary/5 border border-primary/20 rounded-2xl p-6 shadow-xs flex flex-col gap-5 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl pointer-events-none" />
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-outline-variant/30 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-primary/10 text-primary rounded-xl shrink-0">
            <FileText className="size-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold tracking-widest text-primary uppercase">
                INFORMASI & REMINDER SEKRETARIS
              </span>
              <Badge variant="info" className="text-[9px] font-mono px-1.5 py-0 flex items-center gap-1">
                <Sparkles className="size-3" /> Notulensi Terbaru
              </Badge>
            </div>
            <h3 className="text-lg font-extrabold text-on-surface tracking-tight mt-0.5">
              {notula.meetingTitle}
            </h3>
          </div>
        </div>

        <Link href={`/dashboard/meetings/${notula.meetingId}`}>
          <Button variant="outline" size="sm" className="h-8 text-xs font-semibold gap-1.5 cursor-pointer border-primary/30 text-primary hover:bg-primary/5 shrink-0">
            Detail Rapat <ArrowRight className="size-3.5" />
          </Button>
        </Link>
      </div>

      {/* Meta Info */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-mono text-on-surface-variant">
        <span className="flex items-center gap-1.5">
          <Calendar className="size-3.5 text-primary" />
          {meetingDateStr}
        </span>
        <span className="text-outline-variant">•</span>
        <span className="flex items-center gap-1.5">
          <UserCheck className="size-3.5 text-primary" />
          Notulis: <strong className="text-on-surface font-semibold">{notula.writerName}</strong>
        </span>
        <span className="text-outline-variant">•</span>
        <span>Diterbitkan: {publishedDateStr} WITA</span>
      </div>

      {/* Grid Content: Decision Points & Action Items (PR Divisi) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-1">
        {/* Decision Points */}
        {notula.decisionPoints.length > 0 && (
          <div className="bg-white/80 border border-outline-variant/40 rounded-xl p-4 flex flex-col gap-2">
            <h4 className="text-xs font-mono font-bold text-on-surface uppercase tracking-wider flex items-center gap-1.5 text-emerald-700">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              Poin Keputusan Rapat
            </h4>
            <ul className="flex flex-col gap-1.5 text-xs text-on-surface font-sans">
              {notula.decisionPoints.map((dp, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-emerald-600 font-bold font-mono text-[10px] shrink-0 mt-0.5">•</span>
                  <span>{dp}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Action Items / PR Divisi */}
        {notula.actionItems.length > 0 && (
          <div className="bg-white/80 border border-outline-variant/40 rounded-xl p-4 flex flex-col gap-2">
            <h4 className="text-xs font-mono font-bold text-on-surface uppercase tracking-wider flex items-center gap-1.5 text-amber-700">
              <CheckSquare className="size-3.5 text-amber-600" />
              PR & Action Items Divisi
            </h4>
            <ul className="flex flex-col gap-1.5 text-xs text-on-surface font-sans">
              {notula.actionItems.map((ai, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-amber-600 font-bold font-mono text-[10px] shrink-0 mt-0.5">📌</span>
                  <span className="font-medium">{ai}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
