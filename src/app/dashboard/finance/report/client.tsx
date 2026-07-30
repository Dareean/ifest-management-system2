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

  return (
    <div className="flex flex-col gap-8 max-w-5xl mx-auto px-4">
      {/* Header Actions */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 text-xs font-bold text-on-surface-variant hover:text-primary transition-colors cursor-pointer"
        >
          <ArrowLeft className="size-4" /> Kembali
        </button>
        <div className="flex items-center gap-3 print:hidden">
          <Button variant="outline" onClick={handleExportCSV} className="cursor-pointer text-xs">
            <FileDown className="size-4" /> Export CSV
          </Button>
          <Button variant="primary" onClick={handlePrint} className="cursor-pointer text-xs">
            <Printer className="size-4" /> Cetak / PDF
          </Button>
        </div>
      </div>

      {/* LPJ Document */}
      <div ref={printRef} className="bg-white border border-outline-variant/60 rounded-2xl p-8 sm:p-12 shadow-sm">
        {/* Kop Surat */}
        <div className="text-center border-b-2 border-black pb-6 mb-8">
          <h1 className="text-2xl font-black tracking-tight">LAPORAN PERTANGGUNGJAWABAN KEUANGAN</h1>
          <p className="text-lg font-bold mt-1">PANITIA INFORMATICS FESTIVAL (I-FEST) 2026</p>
          <p className="text-sm text-on-surface-variant mt-1 font-mono">
            HMTI — Universitas Tadulako
          </p>
          <p className="text-xs text-on-surface-variant font-mono mt-0.5">
            Periode: {report.divisions.length > 0 ? `${formatDate(report.divisions[0]?.transactions?.[0]?.transaction_date ?? report.generatedAt)}` : ""}
          </p>
        </div>

        {/* Ringkasan Global */}
        <div className="mb-10">
          <h2 className="text-lg font-bold mb-4 border-b border-outline-variant/30 pb-2">A. RINGKASAN ANGGARAN</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-surface-container-low rounded-xl p-4 text-center">
              <p className="text-[10px] font-mono font-bold text-on-surface-variant tracking-wider uppercase">TOTAL ANGGARAN</p>
              <p className="text-xl font-black text-on-surface mt-1">{formatRp(report.overview.total_budget)}</p>
            </div>
            <div className="bg-surface-container-low rounded-xl p-4 text-center">
              <p className="text-[10px] font-mono font-bold text-on-surface-variant tracking-wider uppercase">PEMASUKAN</p>
              <p className="text-xl font-black text-accent-green mt-1">{formatRp(report.divisions.reduce((s, d) => s + d.transactions.filter(t => t.type === 'income').reduce((a, b) => a + b.amount, 0), 0))}</p>
            </div>
            <div className="bg-surface-container-low rounded-xl p-4 text-center">
              <p className="text-[10px] font-mono font-bold text-on-surface-variant tracking-wider uppercase">PENGELUARAN</p>
              <p className="text-xl font-black text-error mt-1">{formatRp(report.overview.total_used)}</p>
            </div>
            <div className="bg-surface-container-low rounded-xl p-4 text-center">
              <p className="text-[10px] font-mono font-bold text-on-surface-variant tracking-wider uppercase">SISA ANGGARAN</p>
              <p className={`text-xl font-black mt-1 ${report.overview.total_remaining >= 0 ? "text-accent-green" : "text-error"}`}>
                {formatRp(report.overview.total_remaining)}
              </p>
            </div>
          </div>
        </div>

        {/* Breakdown per Divisi */}
        <div className="mb-10">
          <h2 className="text-lg font-bold mb-4 border-b border-outline-variant/30 pb-2">B. RINCIAN ANGGARAN PER DIVISI</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-surface-container-low border-b border-outline-variant/20">
                  <th className="text-left px-3 py-2.5 text-[10px] font-mono font-bold tracking-wider">Divisi</th>
                  <th className="text-right px-3 py-2.5 text-[10px] font-mono font-bold tracking-wider">Anggaran</th>
                  <th className="text-right px-3 py-2.5 text-[10px] font-mono font-bold tracking-wider">Terpakai</th>
                  <th className="text-right px-3 py-2.5 text-[10px] font-mono font-bold tracking-wider">Sisa</th>
                  <th className="text-center px-3 py-2.5 text-[10px] font-mono font-bold tracking-wider">Penggunaan</th>
                  <th className="text-right px-3 py-2.5 text-[10px] font-mono font-bold tracking-wider">Transaksi</th>
                </tr>
              </thead>
              <tbody>
                {report.divisions.map((d) => {
                  const pct = d.total_budget > 0 ? Math.round((d.used_amount / d.total_budget) * 100) : 0;
                  return (
                    <tr key={d.division_id} className="border-b border-outline-variant/10">
                      <td className="px-3 py-3 font-bold">{d.division_name}</td>
                      <td className="px-3 py-3 text-right font-mono">{formatRp(d.total_budget)}</td>
                      <td className="px-3 py-3 text-right font-mono text-error">{formatRp(d.used_amount)}</td>
                      <td className={`px-3 py-3 text-right font-mono ${d.remaining >= 0 ? "text-accent-green" : "text-error"}`}>{formatRp(d.remaining)}</td>
                      <td className="px-3 py-3 text-center">
                        <div className="inline-flex items-center gap-2">
                          <div className="w-16 h-1.5 rounded-full bg-surface-container overflow-hidden">
                            <div className="h-full rounded-full bg-primary" style={{ width: `${Math.min(pct, 100)}%` }} />
                          </div>
                          <span className="text-[10px] font-mono">{pct}%</span>
                        </div>
                      </td>
                      <td className="px-3 py-3 text-right font-mono">{d.transaction_count}</td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="bg-surface-container-low font-bold">
                  <td className="px-3 py-3">TOTAL</td>
                  <td className="px-3 py-3 text-right font-mono">{formatRp(report.overview.total_budget)}</td>
                  <td className="px-3 py-3 text-right font-mono text-error">{formatRp(report.overview.total_used)}</td>
                  <td className={`px-3 py-3 text-right font-mono ${report.overview.total_remaining >= 0 ? "text-accent-green" : "text-error"}`}>{formatRp(report.overview.total_remaining)}</td>
                  <td className="px-3 py-3 text-center">
                    {report.overview.total_budget > 0
                      ? `${Math.round((report.overview.total_used / report.overview.total_budget) * 100)}%`
                      : "0%"}
                  </td>
                  <td className="px-3 py-3 text-right font-mono">
                    {report.divisions.reduce((s, d) => s + d.transaction_count, 0)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Detail Transaksi per Divisi */}
        <div>
          <h2 className="text-lg font-bold mb-4 border-b border-outline-variant/30 pb-2">C. DETAIL TRANSAKSI</h2>
          {report.divisions.map((d) => (
            d.transactions.length > 0 && (
              <div key={d.division_id} className="mb-6">
                <h3 className="text-sm font-bold text-primary mb-2">{d.division_name}</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="bg-surface-container-low border-b border-outline-variant/20">
                        <th className="text-left px-2 py-1.5 font-mono font-bold">Tanggal</th>
                        <th className="text-left px-2 py-1.5 font-mono font-bold">Tipe</th>
                        <th className="text-left px-2 py-1.5 font-mono font-bold">Kategori</th>
                        <th className="text-left px-2 py-1.5 font-mono font-bold">Deskripsi</th>
                        <th className="text-right px-2 py-1.5 font-mono font-bold">Jumlah</th>
                        <th className="text-left px-2 py-1.5 font-mono font-bold">No. Bukti</th>
                      </tr>
                    </thead>
                    <tbody>
                      {d.transactions.map((tx) => (
                        <tr key={tx.id} className="border-b border-outline-variant/10">
                          <td className="px-2 py-2 font-mono">{formatDate(tx.transaction_date)}</td>
                          <td className="px-2 py-2">
                            <span className={tx.type === "income" ? "text-accent-green" : "text-error"}>
                              {tx.type === "income" ? "Masuk" : "Keluar"}
                            </span>
                          </td>
                          <td className="px-2 py-2 text-on-surface-variant">{tx.category || "-"}</td>
                          <td className="px-2 py-2">{tx.description}</td>
                          <td className={`px-2 py-2 text-right font-mono ${tx.type === "expense" ? "text-error" : "text-accent-green"}`}>
                            {tx.type === "expense" ? "-" : "+"}{formatRp(tx.amount)}
                          </td>
                          <td className="px-2 py-2 font-mono text-on-surface-variant">{tx.receipt_number || "-"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )
          ))}
        </div>

        {/* Footer */}
        <div className="mt-12 pt-6 border-t border-outline-variant/30">
          <div className="grid grid-cols-2 gap-16">
            <div>
              <p className="text-sm font-bold mb-6">Mengetahui,</p>
              <p className="text-sm font-bold">PIC I-FEST 2026</p>
              <br /><br />
              <p className="text-sm font-bold underline mt-8">( _________________ )</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold mb-6">Palu, {formatDate(report.generatedAt)}</p>
              <p className="text-sm font-bold">Bendahara</p>
              <br /><br />
              <p className="text-sm font-bold underline mt-8">( _________________ )</p>
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @media print {
          body { background: white; }
          header, footer, .print\\:hidden { display: none !important; }
          .max-w-5xl { max-width: 100%; padding: 0; margin: 0; }
        }
      `}</style>
    </div>
  );
}
