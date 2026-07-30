import { FileText } from "lucide-react";
import { getLetterStats } from "@/lib/data/personal-dashboard";

export async function SecretaryLetterChart() {
  const stats = await getLetterStats();
  const total = stats.total || 1;

  const requestedPercent = Math.round((stats.pending / total) * 100);
  const inRevisionPercent = Math.round((stats.inRevision / total) * 100);
  const approvedPercent = Math.round((stats.approved / total) * 100);
  const sentPercent = Math.max(0, 100 - requestedPercent - inRevisionPercent - approvedPercent);

  return (
    <div className="bg-white border border-slate-100 rounded-3xl p-7 shadow-xs flex flex-col justify-between gap-6 h-full">
      <div>
        <div className="flex items-center gap-2">
          <FileText className="size-5 text-pink-500" />
          <h3 className="text-lg font-extrabold text-slate-900 tracking-tight font-sans">
            Statistik Permohonan Surat Menyurat
          </h3>
        </div>
        <p className="text-xs text-slate-400 font-sans mt-1">
          Komposisi dan progress status pengajuan surat panitia I-FEST 2026
        </p>
      </div>

      {/* Main Overall Progress Bar */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between text-xs font-sans">
          <span className="font-bold text-slate-800">Total Berkas Pengajuan</span>
          <span className="font-mono text-slate-900 font-black">{stats.total} Surat</span>
        </div>
        
        <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden flex">
          {stats.pending > 0 && (
            <div
              style={{ width: `${requestedPercent}%` }}
              className="h-full bg-amber-500 transition-all duration-500"
              title={`Permohonan Baru: ${stats.pending}`}
            />
          )}
          {stats.inRevision > 0 && (
            <div
              style={{ width: `${inRevisionPercent}%` }}
              className="h-full bg-pink-500 transition-all duration-500"
              title={`Dalam Revisi: ${stats.inRevision}`}
            />
          )}
          {stats.approved > 0 && (
            <div
              style={{ width: `${approvedPercent}%` }}
              className="h-full bg-indigo-500 transition-all duration-500"
              title={`Disetujui: ${stats.approved}`}
            />
          )}
          {stats.sent > 0 && (
            <div
              style={{ width: `${sentPercent}%` }}
              className="h-full bg-emerald-500 transition-all duration-500"
              title={`Selesai/TTD: ${stats.sent}`}
            />
          )}
        </div>
      </div>

      {/* Legend Footer Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-slate-100 text-xs font-sans">
        <div className="flex flex-col gap-1 p-3 bg-amber-50/60 rounded-2xl border border-amber-100">
          <div className="flex items-center gap-1.5 text-amber-700 font-bold">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            <span className="text-[11px]">Butuh Diproses</span>
          </div>
          <span className="text-xl font-black text-amber-900 font-mono mt-0.5">{stats.pending}</span>
        </div>

        <div className="flex flex-col gap-1 p-3 bg-pink-50/60 rounded-2xl border border-pink-100">
          <div className="flex items-center gap-1.5 text-pink-700 font-bold">
            <span className="w-2 h-2 rounded-full bg-pink-500" />
            <span className="text-[11px]">Dalam Revisi</span>
          </div>
          <span className="text-xl font-black text-pink-900 font-mono mt-0.5">{stats.inRevision}</span>
        </div>

        <div className="flex flex-col gap-1 p-3 bg-indigo-50/60 rounded-2xl border border-indigo-100">
          <div className="flex items-center gap-1.5 text-indigo-700 font-bold">
            <span className="w-2 h-2 rounded-full bg-indigo-500" />
            <span className="text-[11px]">Disetujui</span>
          </div>
          <span className="text-xl font-black text-indigo-900 font-mono mt-0.5">{stats.approved}</span>
        </div>

        <div className="flex flex-col gap-1 p-3 bg-emerald-50/60 rounded-2xl border border-emerald-100">
          <div className="flex items-center gap-1.5 text-emerald-700 font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-[11px]">Selesai / TTD</span>
          </div>
          <span className="text-xl font-black text-emerald-900 font-mono mt-0.5">{stats.sent}</span>
        </div>
      </div>
    </div>
  );
}
