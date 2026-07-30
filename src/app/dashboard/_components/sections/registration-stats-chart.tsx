import { BarChart3 } from "lucide-react";

interface CompetitionStat {
  code: string;
  name: string;
  countText: string;
  verifiedPercent: number; // 0..100
  pendingPercent: number;  // 0..100
  rejectedPercent: number; // 0..100
}

const DEFAULT_COMPETITION_STATS: CompetitionStat[] = [
  { code: "REG-01", name: "Creative Video", countText: "2 Peserta", verifiedPercent: 0, pendingPercent: 100, rejectedPercent: 0 },
  { code: "REG-02", name: "Digital Education Poster", countText: "1 Peserta", verifiedPercent: 0, pendingPercent: 100, rejectedPercent: 0 },
  { code: "REG-04", name: "Sulteng Digital Innovation Hub (S-DIH)", countText: "0 Tim", verifiedPercent: 0, pendingPercent: 0, rejectedPercent: 0 },
  { code: "NAT-02", name: "UI/UX Design", countText: "6 Tim", verifiedPercent: 0, pendingPercent: 80, rejectedPercent: 20 },
  { code: "NAT-01", name: "Competitive Programming", countText: "0 Peserta", verifiedPercent: 0, pendingPercent: 0, rejectedPercent: 0 },
  { code: "REG-03", name: "Digital Business Plan", countText: "0 Tim", verifiedPercent: 0, pendingPercent: 0, rejectedPercent: 0 },
];

export function RegistrationStatsChart({ stats = DEFAULT_COMPETITION_STATS }: { stats?: CompetitionStat[] }) {
  return (
    <div className="bg-white border border-slate-100 rounded-3xl p-7 shadow-xs flex flex-col gap-6">
      {/* Header Title */}
      <div>
        <div className="flex items-center gap-2">
          <BarChart3 className="size-5 text-pink-500" />
          <h3 className="text-lg font-extrabold text-slate-900 tracking-tight font-sans">
            Statistik Pendaftaran Lomba
          </h3>
        </div>
        <p className="text-xs text-slate-400 font-sans mt-1">
          Perbandingan jumlah pendaftar dan komposisi status pendaftar per lomba
        </p>
      </div>

      {/* Progress Bars List */}
      <div className="flex flex-col gap-5">
        {stats.map((item, idx) => {
          const totalPercent = item.verifiedPercent + item.pendingPercent + item.rejectedPercent;
          return (
            <div key={idx} className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-800 font-sans truncate">
                  <span className="font-mono text-slate-500 mr-1.5">{item.code} -</span>
                  {item.name}
                </span>
                <span className="font-mono text-slate-400 text-[11px] font-semibold shrink-0">
                  {item.countText}
                </span>
              </div>

              {/* Segmented Progress Bar */}
              <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden flex">
                {totalPercent > 0 ? (
                  <>
                    {item.verifiedPercent > 0 && (
                      <div
                        style={{ width: `${item.verifiedPercent}%` }}
                        className="h-full bg-emerald-500 transition-all duration-500"
                        title={`Terverifikasi: ${item.verifiedPercent}%`}
                      />
                    )}
                    {item.pendingPercent > 0 && (
                      <div
                        style={{ width: `${item.pendingPercent}%` }}
                        className="h-full bg-amber-500 transition-all duration-500"
                        title={`Pending: ${item.pendingPercent}%`}
                      />
                    )}
                    {item.rejectedPercent > 0 && (
                      <div
                        style={{ width: `${item.rejectedPercent}%` }}
                        className="h-full bg-pink-500 transition-all duration-500"
                        title={`Ditolak: ${item.rejectedPercent}%`}
                      />
                    )}
                  </>
                ) : (
                  <div className="h-full w-full bg-slate-100" />
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend Footer */}
      <div className="flex items-center gap-6 pt-3 border-t border-slate-100 text-xs font-sans text-slate-500">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
          <span>Terverifikasi</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
          <span>Pending</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-pink-500" />
          <span>Ditolak</span>
        </div>
      </div>
    </div>
  );
}
