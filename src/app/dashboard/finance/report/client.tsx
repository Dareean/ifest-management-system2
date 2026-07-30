"use client";

import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Printer, FileDown } from "lucide-react";
import { useRouter } from "next/navigation";
import type { FinanceReportData } from "@/lib/data/finance";

function formatRp(n: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(n);
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("id-ID", {
    day: "numeric", month: "long", year: "numeric",
  });
}

export function ReportClient({ report }: { report: FinanceReportData }) {
  const router = useRouter();
  const printRef = useRef<HTMLDivElement>(null);

  function handlePrint() {
    window.print();
  }

  function handleExportCSV() {
    const rows = [
      ["Divisi", "Total Anggaran", "Terpakai", "Sisa", "%"],
    ];
    for (const d of report.divisions) {
      const pct = d.total_budget > 0 ? Math.round((d.used_amount / d.total_budget) * 100) : 0;
      rows.push([d.division_name, String(d.total_budget), String(d.used_amount), String(d.remaining), `${pct}%`]);
    }

    const csv = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `lpj-keuangan-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const incomeTotal = report.divisions.reduce((s, d) => s + d.transactions.filter(t => t.type === 'income').reduce((a, b) => a + b.amount, 0), 0);

  return (
    <div className="flex flex-col gap-8 w-full pb-12">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-6">
        <div>
          <p className="text-accent-magenta font-mono text-[10px] font-bold uppercase tracking-widest mb-1">
            LAPORAN PERTANGGUNGJAWABAN
          </p>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-on-surface font-sans">
            LPJ Keuangan Kepanitiaan
          </h1>
          <p className="mt-1 text-sm text-on-surface-variant font-sans">
            Rekapitulasi anggaran, pengeluaran per divisi, dan bukti transaksi I-FEST 2026.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0 print:hidden">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-1.5 h-9 px-4 rounded-xl border border-slate-200 bg-white text-xs font-mono font-bold text-slate-700 hover:bg-slate-50 transition-all cursor-pointer shadow-xs"
          >
            <ArrowLeft className="size-4" /> Kembali
          </button>

          <Button 
            variant="outline" 
            onClick={handleExportCSV} 
            className="h-9 px-4 rounded-xl text-xs font-mono font-bold border-slate-200 hover:bg-slate-50 gap-1.5 cursor-pointer shadow-xs"
          >
            <FileDown className="size-4" /> Export CSV
          </Button>

          <Button 
            onClick={handlePrint} 
            className="h-9 px-5 rounded-xl text-xs font-mono font-bold bg-[#04000D] text-[#DCEEB1] hover:bg-black gap-1.5 cursor-pointer shadow-sm"
          >
            <Printer className="size-4" /> Cetak / PDF
          </Button>
        </div>
      </div>

      {/* LPJ Document Container */}
      <div ref={printRef} className="bg-white border border-[#04000D]/5 rounded-3xl p-6 sm:p-10 md:p-12 shadow-[0_8px_30px_rgb(0,0,0,0.015)] w-full">
        {/* Kop Surat Header */}
        <div className="text-center border-b-2 border-slate-900 pb-8 mb-10">
          <h2 className="text-2xl md:text-3xl font-black tracking-tight text-slate-900 font-sans uppercase">
            LAPORAN PERTANGGUNGJAWABAN KEUANGAN
          </h2>
          <p className="text-base sm:text-lg font-extrabold text-slate-800 mt-1 font-sans">
            PANITIA INFORMATICS FESTIVAL (I-FEST) 2026
          </p>
          <p className="text-xs sm:text-sm text-slate-500 font-mono mt-1">
            HMTI — Universitas Tadulako &middot; Periode: {report.divisions.length > 0 ? `${formatDate(report.divisions[0]?.transactions?.[0]?.transaction_date ?? report.generatedAt)}` : "2026"}
          </p>
        </div>

        {/* Ringkasan Global */}
        <div className="mb-12">
          <h3 className="text-xs font-mono font-extrabold text-accent-magenta tracking-widest uppercase mb-4 flex items-center gap-2">
            <span>A. RINGKASAN ANGGARAN & DANA</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="bg-white border border-[#04000D]/5 rounded-2xl p-5 shadow-[0_8px_30px_rgb(0,0,0,0.015)]">
              <p className="text-[10px] font-mono font-bold text-slate-400 tracking-wider uppercase">TOTAL ANGGARAN</p>
              <p className="text-2xl md:text-3xl font-extrabold text-slate-900 mt-1 font-sans">{formatRp(report.overview.total_budget)}</p>
            </div>

            <div className="bg-white border border-[#04000D]/5 rounded-2xl p-5 shadow-[0_8px_30px_rgb(0,0,0,0.015)]">
              <p className="text-[10px] font-mono font-bold text-slate-400 tracking-wider uppercase">PEMASUKAN DANA</p>
              <p className="text-2xl md:text-3xl font-extrabold text-emerald-600 mt-1 font-sans">{formatRp(incomeTotal)}</p>
            </div>

            <div className="bg-white border border-[#04000D]/5 rounded-2xl p-5 shadow-[0_8px_30px_rgb(0,0,0,0.015)]">
              <p className="text-[10px] font-mono font-bold text-slate-400 tracking-wider uppercase">PENGELUARAN DANA</p>
              <p className="text-2xl md:text-3xl font-extrabold text-rose-600 mt-1 font-sans">{formatRp(report.overview.total_used)}</p>
            </div>

            <div className="bg-white border border-[#04000D]/5 rounded-2xl p-5 shadow-[0_8px_30px_rgb(0,0,0,0.015)]">
              <p className="text-[10px] font-mono font-bold text-slate-400 tracking-wider uppercase">SISA ANGGARAN</p>
              <p className={`text-2xl md:text-3xl font-extrabold mt-1 font-sans ${report.overview.total_remaining >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                {formatRp(report.overview.total_remaining)}
              </p>
            </div>
          </div>
        </div>

        {/* Breakdown per Divisi */}
        <div className="mb-12">
          <h3 className="text-xs font-mono font-extrabold text-accent-magenta tracking-widest uppercase mb-4 flex items-center gap-2">
            <span>B. RINCIAN ANGGARAN PER DIVISI</span>
          </h3>

          <div className="rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-[#04000D] text-[#DCEEB1] font-mono text-xs uppercase tracking-wider">
                    <th className="text-left px-4 py-3.5 font-extrabold">Divisi</th>
                    <th className="text-right px-4 py-3.5 font-extrabold">Anggaran</th>
                    <th className="text-right px-4 py-3.5 font-extrabold">Terpakai</th>
                    <th className="text-right px-4 py-3.5 font-extrabold">Sisa</th>
                    <th className="text-center px-4 py-3.5 font-extrabold">Persentase</th>
                    <th className="text-right px-4 py-3.5 font-extrabold">Transaksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {report.divisions.map((d) => {
                    const pct = d.total_budget > 0 ? Math.round((d.used_amount / d.total_budget) * 100) : 0;
                    return (
                      <tr key={d.division_id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="px-4 py-3.5 font-bold text-slate-900 font-sans">{d.division_name}</td>
                        <td className="px-4 py-3.5 text-right font-mono font-medium text-slate-900">{formatRp(d.total_budget)}</td>
                        <td className="px-4 py-3.5 text-right font-mono font-bold text-rose-600">{formatRp(d.used_amount)}</td>
                        <td className={`px-4 py-3.5 text-right font-mono font-bold ${d.remaining >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                          {formatRp(d.remaining)}
                        </td>
                        <td className="px-4 py-3.5 text-center">
                          <div className="inline-flex items-center justify-center gap-2">
                            <div className="w-20 h-2 rounded-full bg-slate-100 overflow-hidden">
                              <div className="h-full rounded-full bg-slate-900" style={{ width: `${Math.min(pct, 100)}%` }} />
                            </div>
                            <span className="text-xs font-mono font-bold text-slate-700">{pct}%</span>
                          </div>
                        </td>
                        <td className="px-4 py-3.5 text-right font-mono font-bold text-slate-700">{d.transaction_count}</td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr className="bg-slate-900 text-white font-bold font-sans">
                    <td className="px-4 py-3.5 uppercase font-extrabold">TOTAL ANGGARAN</td>
                    <td className="px-4 py-3.5 text-right font-mono text-white font-black">{formatRp(report.overview.total_budget)}</td>
                    <td className="px-4 py-3.5 text-right font-mono text-rose-400 font-black">{formatRp(report.overview.total_used)}</td>
                    <td className={`px-4 py-3.5 text-right font-mono font-black ${report.overview.total_remaining >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                      {formatRp(report.overview.total_remaining)}
                    </td>
                    <td className="px-4 py-3.5 text-center font-mono font-black">
                      {report.overview.total_budget > 0
                        ? `${Math.round((report.overview.total_used / report.overview.total_budget) * 100)}%`
                        : "0%"}
                    </td>
                    <td className="px-4 py-3.5 text-right font-mono font-black">
                      {report.divisions.reduce((s, d) => s + d.transaction_count, 0)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>

        {/* Detail Transaksi per Divisi */}
        <div className="mb-12">
          <h3 className="text-xs font-mono font-extrabold text-accent-magenta tracking-widest uppercase mb-4 flex items-center gap-2">
            <span>C. DETAIL TRANSAKSI KEUANGAN</span>
          </h3>

          {report.divisions.map((d) => (
            d.transactions.length > 0 && (
              <div key={d.division_id} className="mb-8">
                <h4 className="text-sm font-bold text-slate-900 mb-3 font-sans border-l-4 border-pink-500 pl-3">
                  Divisi {d.division_name}
                </h4>
                <div className="rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs">
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs border-collapse">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-mono uppercase">
                          <th className="text-left px-3 py-2.5 font-bold">Tanggal</th>
                          <th className="text-left px-3 py-2.5 font-bold">Tipe</th>
                          <th className="text-left px-3 py-2.5 font-bold">Kategori</th>
                          <th className="text-left px-3 py-2.5 font-bold">Deskripsi</th>
                          <th className="text-right px-3 py-2.5 font-bold">Jumlah</th>
                          <th className="text-left px-3 py-2.5 font-bold">No. Bukti</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 bg-white">
                        {d.transactions.map((tx) => (
                          <tr key={tx.id} className="hover:bg-slate-50/50">
                            <td className="px-3 py-2.5 font-mono text-slate-600">{formatDate(tx.transaction_date)}</td>
                            <td className="px-3 py-2.5 font-bold">
                              <span className={tx.type === "income" ? "text-emerald-600" : "text-rose-600"}>
                                {tx.type === "income" ? "MASUK" : "KELUAR"}
                              </span>
                            </td>
                            <td className="px-3 py-2.5 font-mono text-slate-600">{tx.category || "-"}</td>
                            <td className="px-3 py-2.5 font-sans font-medium text-slate-900">{tx.description}</td>
                            <td className={`px-3 py-2.5 text-right font-mono font-bold ${tx.type === "expense" ? "text-rose-600" : "text-emerald-600"}`}>
                              {tx.type === "expense" ? "-" : "+"}{formatRp(tx.amount)}
                            </td>
                            <td className="px-3 py-2.5 font-mono text-slate-500">{tx.receipt_number || "-"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )
          ))}
        </div>

        {/* Footer Tanda Tangan */}
        <div className="mt-14 pt-8 border-t border-slate-200">
          <div className="grid grid-cols-2 gap-16">
            <div>
              <p className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider mb-2">MENGETAHUI,</p>
              <p className="text-sm font-extrabold text-slate-900 font-sans">Ketua Panitia I-FEST 2026</p>
              <div className="h-20" />
              <p className="text-sm font-bold text-slate-900 font-sans underline">( _________________________ )</p>
            </div>
            <div className="text-right">
              <p className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider mb-2">PALU, {formatDate(report.generatedAt).toUpperCase()}</p>
              <p className="text-sm font-extrabold text-slate-900 font-sans">Bendahara Umum</p>
              <div className="h-20" />
              <p className="text-sm font-bold text-slate-900 font-sans underline">( _________________________ )</p>
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @media print {
          body { background: white; }
          header, footer, .print\\:hidden { display: none !important; }
          .w-full { max-width: 100%; padding: 0; margin: 0; }
        }
      `}</style>
    </div>
  );
}
