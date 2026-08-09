"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { useActionState } from "react";
import { Input } from "@/components/ui/input";
import { deleteTransaction, updateTransaction } from "@/lib/actions/finance";
import { ArrowLeft, TrendingUp, TrendingDown, Trash2, Eye, ExternalLink, Download, Pencil } from "lucide-react";
import type { BudgetWithDivision, TransactionData } from "@/lib/data/finance";

function formatRp(n: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(n);
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("id-ID", {
    day: "numeric", month: "long", year: "numeric",
  });
}

const categoryLabel: Record<string, string> = {
  ATK: "ATK",
  konsumsi: "Konsumsi",
  transport: "Transportasi",
  dokumentasi: "Dokumentasi",
  dekorasi: "Dekorasi",
  cetak: "Cetak & Print",
  sewa: "Sewa",
  honor: "Honorarium",
  publikasi: "Publikasi",
  logistik: "Logistik",
  lainnya: "Lainnya",
};

export function DivisionDetailClient({ budget, transactions }: {
  budget: BudgetWithDivision;
  transactions: TransactionData[];
}) {
  const router = useRouter();
  const [showPreview, setShowPreview] = useState<string | null>(null);
  const [showEditTx, setShowEditTx] = useState<TransactionData | null>(null);
  const [filterType, setFilterType] = useState<string>("all");
  const [filterCategory, setFilterCategory] = useState<string>("all");

  const [, updateTxAction, updateTxPending] = useActionState(updateTransaction, null);

  const filteredTx = transactions.filter((tx) => {
    if (filterType !== "all" && tx.type !== filterType) return false;
    if (filterCategory !== "all" && tx.category !== filterCategory) return false;
    return true;
  });

  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((s, t) => s + t.amount, 0);
  const totalExpense = transactions
    .filter((t) => t.type === "expense")
    .reduce((s, t) => s + t.amount, 0);

  const pct = budget.total_budget > 0 ? Math.round((budget.used_amount / budget.total_budget) * 100) : 0;

  const categories = [...new Set(transactions.map((t) => t.category).filter(Boolean))] as string[];

  async function handleDelete(id: string) {
    if (!confirm("Hapus transaksi ini?")) return;
    const result = await deleteTransaction(id);
    if (result.success) router.refresh();
  }

  return (
    <div className="flex flex-col gap-8 max-w-6xl mx-auto px-4">
      {/* Navigation */}
      <button
        onClick={() => router.back()}
        className="inline-flex items-center gap-2 text-xs font-bold text-on-surface-variant hover:text-primary transition-colors cursor-pointer w-fit"
      >
        <ArrowLeft className="size-4" /> Kembali
      </button>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <p className="text-accent-magenta font-mono text-xs font-bold tracking-widest uppercase mb-1">
            Detail Anggaran
          </p>
          <h1 className="text-3xl font-extrabold tracking-tight text-on-surface">{budget.division_name}</h1>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="default" className="text-xs font-mono px-3 py-1">
            {budget.transaction_count} transaksi
          </Badge>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-surface-container-low border border-outline-variant/60 rounded-2xl p-6">
          <p className="text-xs font-mono font-bold tracking-wider text-on-surface-variant uppercase">TOTAL ANGGARAN</p>
          <p className="text-3xl font-black text-on-surface my-2 leading-none">{formatRp(budget.total_budget)}</p>
        </div>
        <div className="bg-surface-container-low border border-outline-variant/60 rounded-2xl p-6">
          <p className="text-xs font-mono font-bold tracking-wider text-on-surface-variant uppercase flex items-center gap-1.5">
            <TrendingDown className="size-3.5 text-error" /> TERPAKAI
          </p>
          <p className="text-3xl font-black text-on-surface my-2 leading-none">{formatRp(budget.used_amount)}</p>
          <div className="w-full h-2 rounded-full bg-surface-container overflow-hidden mt-2">
            <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${Math.min(pct, 100)}%` }} />
          </div>
          <p className="text-xs text-on-surface-variant font-mono mt-1">{pct}% dari total anggaran</p>
        </div>
        <div className="bg-surface-container-low border border-outline-variant/60 rounded-2xl p-6">
          <p className="text-xs font-mono font-bold tracking-wider text-on-surface-variant uppercase flex items-center gap-1.5">
            <TrendingUp className="size-3.5 text-accent-green" /> SISA
          </p>
          <p className={`text-3xl font-black my-2 leading-none ${budget.remaining >= 0 ? "text-accent-green" : "text-error"}`}>
            {formatRp(budget.remaining)}
          </p>
        </div>
      </div>

      {/* Income vs Expense Summary */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-accent-green/5 border border-accent-green/20 rounded-2xl p-4">
          <p className="text-xs font-mono font-bold text-accent-green tracking-wider uppercase">Total Pemasukan</p>
          <p className="text-xl font-black text-accent-green mt-1">{formatRp(totalIncome)}</p>
        </div>
        <div className="bg-error/5 border border-error/20 rounded-2xl p-4">
          <p className="text-xs font-mono font-bold text-error tracking-wider uppercase">Total Pengeluaran</p>
          <p className="text-xl font-black text-error mt-1">{formatRp(totalExpense)}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="h-9 text-xs rounded-lg border border-outline-variant bg-surface-bright px-3 font-mono cursor-pointer"
        >
          <option value="all">Semua Tipe</option>
          <option value="income">Pemasukan</option>
          <option value="expense">Pengeluaran</option>
        </select>
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="h-9 text-xs rounded-lg border border-outline-variant bg-surface-bright px-3 font-mono cursor-pointer"
        >
          <option value="all">Semua Kategori</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>{categoryLabel[cat] ?? cat}</option>
          ))}
        </select>
      </div>

      {/* Transactions Table */}
      <div className="bg-white border border-outline-variant/60 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-surface-container-low border-b border-outline-variant/20">
                <th className="text-left px-4 py-3 text-xs font-mono font-bold text-on-surface-variant tracking-wider">Tanggal</th>
                <th className="text-left px-4 py-3 text-xs font-mono font-bold text-on-surface-variant tracking-wider">Tipe</th>
                <th className="text-left px-4 py-3 text-xs font-mono font-bold text-on-surface-variant tracking-wider">Kategori</th>
                <th className="text-left px-4 py-3 text-xs font-mono font-bold text-on-surface-variant tracking-wider">Deskripsi</th>
                <th className="text-right px-4 py-3 text-xs font-mono font-bold text-on-surface-variant tracking-wider">Jumlah</th>
                <th className="text-left px-4 py-3 text-xs font-mono font-bold text-on-surface-variant tracking-wider">No. Bukti</th>
                <th className="text-center px-4 py-3 text-xs font-mono font-bold text-on-surface-variant tracking-wider">Bukti</th>
                <th className="text-left px-4 py-3 text-xs font-mono font-bold text-on-surface-variant tracking-wider">Pencatat</th>
                <th className="text-center px-4 py-3 text-xs font-mono font-bold text-on-surface-variant tracking-wider">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredTx.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-10 text-sm text-on-surface-variant font-mono">
                    Belum ada transaksi.
                  </td>
                </tr>
              ) : (
                filteredTx.map((tx) => (
                  <tr key={tx.id} className="border-b border-outline-variant/10 hover:bg-surface-container/40 transition-colors">
                    <td className="px-4 py-3 text-xs font-mono">{formatDate(tx.transaction_date)}</td>
                    <td className="px-4 py-3">
                      <Badge variant={tx.type === "income" ? "success" : "danger"} className="text-[10px] font-mono px-2 py-0">
                        {tx.type === "income" ? "Masuk" : "Keluar"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-xs font-mono text-on-surface-variant">
                      {tx.category ? (categoryLabel[tx.category] ?? tx.category) : "-"}
                    </td>
                    <td className="px-4 py-3 text-sm font-medium">{tx.description}</td>
                    <td className={`px-4 py-3 text-right text-sm font-bold font-mono ${tx.type === "expense" ? "text-error" : "text-accent-green"}`}>
                      {tx.type === "expense" ? "-" : "+"}{formatRp(tx.amount)}
                    </td>
                    <td className="px-4 py-3 text-xs font-mono text-on-surface-variant">{tx.receipt_number || "-"}</td>
                    <td className="px-4 py-3 text-center">
                      {tx.attachment_url ? (
                        <button
                          onClick={() => setShowPreview(tx.attachment_url!)}
                          className="inline-flex items-center gap-1 text-xs text-primary font-bold hover:underline cursor-pointer"
                        >
                          <Eye className="size-3.5" /> Lihat
                        </button>
                      ) : (
                        <span className="text-xs text-on-surface-variant/50">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs font-mono text-on-surface-variant">{tx.created_by_name}</td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => setShowEditTx(tx)}
                          className="inline-flex items-center gap-1 text-xs text-on-surface-variant hover:text-primary font-bold cursor-pointer"
                          title="Edit Transaksi"
                        >
                          <Pencil className="size-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(tx.id)}
                          className="inline-flex items-center gap-1 text-xs text-error hover:text-error/70 font-bold cursor-pointer"
                          title="Hapus Transaksi"
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Preview Bukti Modal */}
      <Modal open={!!showPreview} onClose={() => setShowPreview(null)} title="Bukti Transaksi">
        {showPreview && (
          <div className="flex flex-col gap-4">
            {showPreview.includes("drive.google.com") ? (
              <div className="w-full h-[500px] border border-outline-variant rounded-xl overflow-hidden">
                <iframe src={showPreview.replace(/\/view(\?.*)?$/, "/preview")} className="w-full h-full border-0" allow="autoplay" />
              </div>
            ) : showPreview.match(/\.(jpg|jpeg|png|webp)(\?.*)?$/i) ? (
              <img src={showPreview} alt="Bukti Transaksi" className="w-full max-h-[500px] object-contain rounded-xl border border-outline-variant" />
            ) : (
              <div className="w-full h-[500px] border border-outline-variant rounded-xl overflow-hidden bg-surface-container-low">
                <iframe src={`${showPreview}#toolbar=0`} className="w-full h-full border-0" />
              </div>
            )}
            <a href={showPreview} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 w-full h-11 bg-primary text-white hover:bg-primary/95 rounded-full font-semibold transition-colors text-sm cursor-pointer">
              <ExternalLink className="size-4" /> Buka di Tab Baru
            </a>
          </div>
        )}
      </Modal>

      {/* Edit Transaksi Modal */}
      <Modal open={!!showEditTx} onClose={() => setShowEditTx(null)} title="Edit Data Transaksi Keuangan">
        {showEditTx && (
          <form action={updateTxAction} className="flex flex-col gap-4">
            <input type="hidden" name="id" value={showEditTx.id} />
            <input type="hidden" name="attachment_url" value={showEditTx.attachment_url || ""} />

            <div>
              <label className="caption block mb-1 text-on-surface-variant font-bold">Tipe Transaksi</label>
              <select
                name="type"
                defaultValue={showEditTx.type}
                className="flex h-11 w-full rounded-md border border-primary bg-surface-bright px-4 py-2 text-base font-sans text-on-surface focus:outline-none cursor-pointer"
                required
              >
                <option value="expense">Pengeluaran (Expense)</option>
                <option value="income">Pemasukan (Income)</option>
              </select>
            </div>

            <div>
              <label className="caption block mb-1 text-on-surface-variant font-bold">Nominal / Jumlah (Rp) <span className="text-error">*</span></label>
              <Input name="amount" type="number" min="1" defaultValue={showEditTx.amount} required />
            </div>

            <div>
              <label className="caption block mb-1 text-on-surface-variant font-bold">Kategori</label>
              <select
                name="category"
                defaultValue={showEditTx.category || ""}
                className="flex h-11 w-full rounded-md border border-primary bg-surface-bright px-4 py-2 text-base font-sans text-on-surface focus:outline-none cursor-pointer"
              >
                <option value="">Tanpa Kategori</option>
                {Object.entries(categoryLabel).map(([val, label]) => (
                  <option key={val} value={val}>{label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="caption block mb-1 text-on-surface-variant font-bold">Deskripsi / Keterangan <span className="text-error">*</span></label>
              <Input name="description" defaultValue={showEditTx.description} required />
            </div>

            <div>
              <label className="caption block mb-1 text-on-surface-variant font-bold">Tanggal Transaksi</label>
              <Input name="transaction_date" type="date" defaultValue={showEditTx.transaction_date.slice(0, 10)} />
            </div>

            <div>
              <label className="caption block mb-1 text-on-surface-variant font-bold">Nomor Kwitansi / Nota</label>
              <Input name="receipt_number" defaultValue={showEditTx.receipt_number || ""} />
            </div>

            <div className="flex gap-2 justify-end mt-2">
              <Button type="button" variant="ghost" onClick={() => setShowEditTx(null)} className="cursor-pointer">
                Batal
              </Button>
              <Button type="submit" disabled={updateTxPending} className="cursor-pointer font-bold bg-[#04000D] text-white hover:bg-black">
                {updateTxPending ? "Menyimpan..." : "Simpan Perubahan Transaksi"}
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
