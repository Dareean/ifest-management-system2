import { DollarSign, TrendingUp, TrendingDown } from "lucide-react";
import { getBudgets } from "@/lib/data/finance";

function formatRp(n: number) {
  if (n >= 1_000_000) return `Rp ${(n / 1_000_000).toFixed(1)}jt`;
  if (n >= 1_000) return `Rp ${(n / 1_000).toFixed(0)}rb`;
  return `Rp ${n}`;
}

interface BudgetStat {
  code: string;
  name: string;
  countText: string;
  usedPercent: number; // 0..100
  totalBudget: number;
  usedAmount: number;
}

export async function RegistrationStatsChart({ stats }: { stats?: BudgetStat[] }) {
  let budgetStats = stats;

  if (!budgetStats) {
    const rawBudgets = await getBudgets();
    budgetStats = rawBudgets.map((b, idx) => {
      const total = b.total_budget > 0 ? b.total_budget : 1;
      const usedPct = Math.min(100, Math.round((b.used_amount / total) * 100));
      return {
        code: `DIV-0${idx + 1}`,
        name: b.division_name,
        countText: `${formatRp(b.used_amount)} / ${formatRp(b.total_budget)}`,
        usedPercent: usedPct,
        totalBudget: b.total_budget,
        usedAmount: b.used_amount,
      };
    });
  }

  return (
    <div className="bg-white border border-[#04000D]/5 rounded-2xl p-6 md:p-7 shadow-[0_8px_30px_rgb(0,0,0,0.015)] flex flex-col gap-6">
      {/* Header Title */}
      <div>
        <div className="flex items-center gap-2">
          <DollarSign className="size-5 text-accent-magenta" />
          <h3 className="text-lg font-extrabold text-on-surface tracking-tight font-sans">
            Realisasi Anggaran Per Divisi
          </h3>
        </div>
        <p className="text-xs text-on-surface-variant font-sans mt-1">
          Monitoring rasio alokasi dana kas vs realisasi pengeluaran per divisi panitia
        </p>
      </div>

      {/* Progress Bars List */}
      <div className="flex flex-col gap-5">
        {budgetStats.map((item, idx) => {
          const isHighBurn = item.usedPercent >= 80;
          const barColor = isHighBurn ? "bg-rose-500" : item.usedPercent >= 50 ? "bg-amber-500" : "bg-emerald-500";

          return (
            <div key={idx} className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-on-surface font-sans truncate">
                  <span className="font-mono text-on-surface-variant/70 mr-1.5">{item.code} -</span>
                  {item.name}
                </span>
                <span className="font-mono text-on-surface-variant font-bold text-[11px] shrink-0">
                  {item.countText} ({item.usedPercent}%)
                </span>
              </div>

              {/* Segmented Progress Bar */}
              <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden flex">
                <div
                  style={{ width: `${Math.max(4, item.usedPercent)}%` }}
                  className={`h-full ${barColor} transition-all duration-500`}
                  title={`Terpakai: ${item.usedPercent}%`}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend Footer */}
      <div className="flex items-center gap-6 pt-3 border-t border-slate-100 text-xs font-sans text-on-surface-variant">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
          <span>Aman (&lt; 50%)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
          <span>Waspada (50-80%)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
          <span>Tinggi (&gt; 80%)</span>
        </div>
      </div>
    </div>
  );
}
