"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { setBudget, addTransaction, updateTransaction, deleteTransaction, createBudgetRequest, handleBudgetRequest, exportFinanceCSV, exportFinanceCSVDetail, syncAllToAppsScript } from "@/lib/actions/finance";
import { useRouter } from "next/navigation";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Plus,
  CheckCircle,
  XCircle,
  FileText,
  Upload,
  ExternalLink,
  Eye,
  Loader2,
  Download,
  ArrowUpRight,
  Receipt,
  User,
  Share2,
  RefreshCw,
  Pencil,
  Trash2,
  Search,
  PieChart,
} from "lucide-react";
import type { BudgetWithDivision, BudgetRequestData, FinanceOverview, AllTransactionData } from "@/lib/data/finance";

const CATEGORY_OPTIONS = [
  { value: "", label: "Pilih kategori..." },
  { value: "ATK", label: "ATK (Alat Tulis Kantor)" },
  { value: "konsumsi", label: "Konsumsi" },
  { value: "transport", label: "Transportasi" },
  { value: "dokumentasi", label: "Dokumentasi" },
  { value: "dekorasi", label: "Dekorasi" },
  { value: "cetak", label: "Cetak & Print" },
  { value: "sewa", label: "Sewa Tempat/Alat" },
  { value: "honor", label: "Honorarium" },
  { value: "publikasi", label: "Publikasi & Promosi" },
  { value: "logistik", label: "Logistik" },
  { value: "lainnya", label: "Lainnya" },
];

function formatRp(n: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(n);
}

export function FinanceClient({
  overview,
  budgets,
  requests,
  allTransactions = [],
  userAssignmentId = "",
  userDivisionId = "",
  isTreasurerOrBPH = true,
}: {
  overview: FinanceOverview;
  budgets: BudgetWithDivision[];
  requests: BudgetRequestData[];
  allTransactions?: AllTransactionData[];
  userAssignmentId?: string;
  userDivisionId?: string;
  isTreasurerOrBPH?: boolean;
}) {
  const router = useRouter();
  const [showSetBudget, setShowSetBudget] = useState<string | null>(null);
  const [showAddTx, setShowAddTx] = useState<string | null>(null);
  const [showEditTx, setShowEditTx] = useState<AllTransactionData | null>(null);
  const [showRequest, setShowRequest] = useState(false);
  const [showPreview, setShowPreview] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState<string>("");
  const [actionMsg, setActionMsg] = useState<string | null>(null);

  const [txSearch, setTxSearch] = useState("");
  const [txTypeFilter, setTxTypeFilter] = useState("all");
  const [txDivFilter, setTxDivFilter] = useState("all");

  const totalIncome = allTransactions.filter((t) => t.type === "income").reduce((s, t) => s + Number(t.amount), 0);
  const totalExpense = allTransactions.filter((t) => t.type === "expense").reduce((s, t) => s + Number(t.amount), 0);
  const currentBalance = totalIncome - totalExpense;
  const totalVolume = totalIncome + totalExpense;
  const incomePercent = totalVolume > 0 ? Math.round((totalIncome / totalVolume) * 100) : 0;
  const expensePercent = totalVolume > 0 ? Math.round((totalExpense / totalVolume) * 100) : 0;

  const [, setBudgetAction, setBudgetPending] = useActionState(setBudget, null);
  const [, addTxAction, addTxPending] = useActionState(addTransaction, null);
  const [, updateTxAction, updateTxPending] = useActionState(updateTransaction, null);
  const [, createReqAction, createReqPending] = useActionState(createBudgetRequest, null);

  async function handleDeleteTx(id: string) {
    if (!confirm("Hapus transaksi ini?")) return;
    const result = await deleteTransaction(id);
    if (result?.error) {
      setActionMsg(result.error);
    } else {
      router.refresh();
    }
  }

  // Non-treasurer users focus ONLY on their own division & submitted notes
  const userDivisionBudget = budgets.find((b) => b.division_id === userDivisionId) || budgets[0];
  const displayedBudgets = isTreasurerOrBPH
    ? budgets
    : userDivisionBudget
    ? [userDivisionBudget]
    : budgets;

  const displayedRequests = isTreasurerOrBPH
    ? requests
    : requests.filter((r) => r.division_name === userDivisionBudget?.division_name);

  async function handleExport() {
    setExporting(true);
    const csv = await exportFinanceCSV();
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `keuangan-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    setExporting(false);
  }

  async function handleExportDetail() {
    setExporting(true);
    const csv = await exportFinanceCSVDetail();
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `keuangan-detail-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    setExporting(false);
  }

  const [showAppsScriptModal, setShowAppsScriptModal] = useState(false);
  const [appsScriptUrlInput, setAppsScriptUrlInput] = useState("");
  const [syncingAppsScript, setSyncingAppsScript] = useState(false);
  const [syncStatusMsg, setSyncStatusMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  async function handleSyncToSpreadsheet() {
    setSyncingAppsScript(true);
    setSyncStatusMsg(null);
    const res = await syncAllToAppsScript(appsScriptUrlInput || undefined);
    if (res.error) {
      setSyncStatusMsg({ type: "error", text: res.error });
    } else {
      setSyncStatusMsg({ type: "success", text: res.message || "Seluruh data keuangan berhasil disinkronkan ke Google Sheets!" });
    }
    setSyncingAppsScript(false);
  }

  async function handleFileUpload(file: File) {
    if (file.size > 90 * 1024 * 1024) {
      setActionMsg("Ukuran file maksimal 90MB.");
      return;
    }

    setUploading(true);
    setActionMsg("Mengunggah bukti...");

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "general");
      formData.append("subfolder", "bukti-transaksi");

      const response = await fetch("/api/upload", { method: "POST", body: formData });
      const data = (await response.json()) as { url?: string; error?: string };

      if (response.ok && data.url) {
        setUploadedUrl(data.url);
        setActionMsg(null);
      } else {
        setActionMsg(data.error || "Gagal mengunggah bukti.");
      }
    } catch (err) {
      console.error("File upload error:", err);
      setActionMsg("Terjadi kesalahan saat mengunggah bukti.");
    } finally {
      setUploading(false);
    }
  }

  const resetTxModal = () => {
    setShowAddTx(null);
    setUploadedUrl("");
  };

  return (
    <div className="w-full flex flex-col gap-6 md:gap-8">
      {/* Header — Section 3 DESIGN.md Eyebrow + H1 Pattern */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-accent-magenta">
            {isTreasurerOrBPH ? "MANAJEMEN KEUANGAN KEPANITIAAN" : `KEUANGAN DIVISI ${userDivisionBudget?.division_name || ""}`}
          </span>
          <h1 className="font-extrabold text-3xl md:text-4xl tracking-tight text-on-surface">
            {isTreasurerOrBPH ? "Overview Anggaran & Transaksi" : "Setor Laporan & Nota Keuangan"}
          </h1>
        </div>
        <div className="flex items-center gap-3 shrink-0 flex-wrap">
          <Button
            onClick={() => setShowAddTx("SETOR")}
            className="cursor-pointer font-bold bg-[#04000D] text-white hover:bg-black text-xs px-4 py-2.5 rounded-xl shadow-sm transition-all"
          >
            <Upload className="size-4" /> Setor Laporan & Nota
          </Button>

          <Button
            variant="outline"
            onClick={() => setShowRequest(true)}
            className="cursor-pointer text-xs font-bold rounded-xl border-[#04000D]/10 text-on-surface bg-white hover:bg-[#04000D] hover:text-white transition-all group"
          >
            <Plus className="size-4 text-on-surface group-hover:text-white transition-colors" /> Ajukan Dana Kas
          </Button>
        </div>
      </div>

      {actionMsg && (
        <div className="text-xs font-mono text-error bg-error-container/20 rounded-xl p-4 border border-error/20">
          {actionMsg}
        </div>
      )}

      {/* Visual Cash-Flow Gauge Banner Card — ONLY visible for Bendahara & BPH */}
      {isTreasurerOrBPH && (
        <div className="bg-white border border-[#04000D]/5 shadow-[0_8px_30px_rgb(0,0,0,0.015)] rounded-2xl p-5 sm:p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#04000D]/5 pb-3">
            <div>
              <h3 className="font-extrabold text-lg text-on-surface flex items-center gap-2">
                <PieChart className="size-5 text-accent-magenta" /> Visual Cash-Flow Gauge Panitia
              </h3>
              <p className="text-xs font-medium text-on-surface-variant/70 mt-0.5">
                Rasio perbandingan arus kas masuk (pemasukan) vs arus kas keluar (pengeluaran realisasi)
              </p>
            </div>
            <div className="font-mono text-xs text-right">
              <span className="text-on-surface-variant/60 font-bold block text-[10px] uppercase">Saldo Kas Net</span>
              <span className={`font-extrabold text-base ${currentBalance >= 0 ? "text-emerald-700" : "text-error"}`}>
                {formatRp(currentBalance)}
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-emerald-700 font-bold">Pemasukan ({incomePercent}%)</span>
              <span className="text-accent-magenta font-bold">Pengeluaran ({expensePercent}%)</span>
            </div>
            <div className="w-full h-3.5 bg-slate-100 rounded-full overflow-hidden flex shadow-inner">
              <div className="h-full bg-emerald-500 transition-all duration-500" style={{ width: `${incomePercent}%` }} />
              <div className="h-full bg-accent-magenta transition-all duration-500" style={{ width: `${expensePercent}%` }} />
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 font-mono text-xs">
            <div className="p-3 rounded-xl bg-emerald-50/60 border border-emerald-200/50">
              <span className="text-[10px] text-emerald-800 uppercase font-bold block">Total Kas Masuk</span>
              <span className="font-extrabold text-emerald-700 text-sm">{formatRp(totalIncome)}</span>
            </div>
            <div className="p-3 rounded-xl bg-red-50/60 border border-red-200/50">
              <span className="text-[10px] text-accent-magenta uppercase font-bold block">Total Kas Keluar</span>
              <span className="font-extrabold text-accent-magenta text-sm">{formatRp(totalExpense)}</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-[#04000D]/5 col-span-2 sm:col-span-1">
              <span className="text-[10px] text-on-surface-variant uppercase font-bold block">Saldo Kas Net</span>
              <span className={`font-extrabold text-sm ${currentBalance >= 0 ? "text-emerald-800" : "text-error"}`}>
                {formatRp(currentBalance)}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Main Grid Layout (DESIGN.md Grid Pattern: lg:col-span-2 left, 1 column right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 md:gap-6 items-start">
        {/* Left Column (2/3 Width): Division Budgets & Requests */}
        <div className="lg:col-span-2 flex flex-col gap-5 md:gap-6">
          {/* Card 1: Anggaran Divisi (DESIGN.md Standard Card Recipe) */}
          <div className="bg-white border border-[#04000D]/5 shadow-[0_8px_30px_rgb(0,0,0,0.015)] rounded-2xl p-5 sm:p-6">
            <div className="flex items-center justify-between border-b border-[#04000D]/5 pb-4 mb-5">
              <div>
                <h2 className="font-extrabold text-xl text-on-surface flex items-center gap-2">
                  <DollarSign className="size-5 text-accent-magenta" />{" "}
                  {isTreasurerOrBPH ? "Realisasi Anggaran Per Divisi" : `Anggaran Divisi ${userDivisionBudget?.division_name || ""}`}
                </h2>
                <p className="text-xs font-medium text-on-surface-variant/70 mt-1">
                  {isTreasurerOrBPH
                    ? "Monitoring alokasi dana kas vs realisasi pengeluaran per divisi panitia"
                    : "Pencatatan realisasi dan sisa dana kas untuk divisi Anda"}
                </p>
              </div>
              <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-on-surface-variant/50 shrink-0">
                {displayedBudgets.length} {isTreasurerOrBPH ? "Divisi" : "Divisi Saya"}
              </span>
            </div>

            <div className={`grid grid-cols-1 ${isTreasurerOrBPH ? "md:grid-cols-2" : "grid-cols-1"} gap-4`}>
              {displayedBudgets.map((b) => {
                const pct = b.total_budget > 0 ? Math.round((b.used_amount / b.total_budget) * 100) : 0;
                return (
                  <div
                    key={b.division_id}
                    className="group bg-white border border-[#04000D]/5 rounded-2xl p-5 flex flex-col justify-between gap-4 transition-all hover:border-[#04000D]/20 hover:shadow-[0_8px_30px_rgb(0,0,0,0.03)]"
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="font-extrabold text-lg text-on-surface group-hover:text-accent-magenta transition-colors">
                            {b.division_name}
                          </h3>
                          <p className="font-mono text-xs text-on-surface-variant/60 mt-0.5">
                            {b.transaction_count} transaksi pengeluaran/nota terdaftar
                          </p>
                        </div>
                        {isTreasurerOrBPH && (
                          <button
                            onClick={() => setShowSetBudget(b.division_id)}
                            className="font-mono text-[10px] font-bold text-accent-magenta hover:underline cursor-pointer"
                          >
                            Atur
                          </button>
                        )}
                      </div>

                      <div className="space-y-1.5">
                        <div className="flex justify-between font-mono text-xs">
                          <span className="text-on-surface-variant/70">Terpakai: {formatRp(b.used_amount)}</span>
                          <span className="font-bold text-on-surface">{pct}%</span>
                        </div>
                        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${
                              pct > 90 ? "bg-accent-magenta" : pct > 75 ? "bg-amber-500" : "bg-[#04000D]"
                            }`}
                            style={{ width: `${Math.min(100, pct)}%` }}
                          />
                        </div>
                        <div className="flex justify-between font-mono text-xs pt-0.5">
                          <span className="text-on-surface-variant/60">Total Pagu: {formatRp(b.total_budget)}</span>
                          <span className="text-green-700 font-bold">Sisa Kas: {formatRp(b.remaining)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-3 border-t border-[#04000D]/5">
                      <Link href={`/dashboard/finance/${b.division_id}`} className="flex-1">
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full text-xs font-bold cursor-pointer rounded-xl border-[#04000D]/10 text-on-surface bg-white hover:bg-[#04000D] hover:text-white transition-all group/btn"
                        >
                          <span className="text-on-surface group-hover/btn:text-white transition-colors">
                            Lihat Riwayat & Nota ↗
                          </span>
                        </Button>
                      </Link>
                      <Button
                        size="sm"
                        onClick={() => setShowAddTx(b.id || b.division_id)}
                        className="text-xs font-bold cursor-pointer bg-[#04000D] text-white hover:bg-black rounded-xl px-4 py-2"
                        title="Setor nota pengeluaran baru"
                      >
                        <Upload className="size-3.5" /> Setor Nota
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Card: Jurnal Transaksi Keuangan (Direct Data Input & Manipulation Table) */}
          <div className="bg-white border border-[#04000D]/5 shadow-[0_8px_30px_rgb(0,0,0,0.015)] rounded-2xl p-5 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#04000D]/5 pb-4 mb-5">
              <div>
                <h2 className="font-extrabold text-xl text-on-surface flex items-center gap-2">
                  <Receipt className="size-5 text-accent-magenta" /> Jurnal Transaksi Keuangan Panitia
                </h2>
                <p className="text-xs font-medium text-on-surface-variant/70 mt-1">
                  Kelola, edit, dan manipulasi pencatatan pengeluaran & pemasukan secara langsung
                </p>
              </div>
              <Button
                onClick={() => setShowAddTx("SETOR")}
                className="cursor-pointer font-bold bg-[#04000D] text-white hover:bg-black text-xs px-3.5 py-2 rounded-xl shadow-sm transition-all shrink-0 self-start sm:self-auto"
              >
                <Plus className="size-3.5" /> Catat Transaksi Baru
              </Button>
            </div>

            {/* Filters & Search */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="size-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/50" />
                <input
                  type="text"
                  value={txSearch}
                  onChange={(e) => setTxSearch(e.target.value)}
                  placeholder="Cari deskripsi, no. nota, divisi..."
                  className="w-full h-9 pl-9 pr-3 text-xs rounded-lg border border-[#04000D]/10 bg-slate-50/60 focus:bg-white focus:outline-none focus:border-[#04000D]/30 transition-all"
                />
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <select
                  value={txTypeFilter}
                  onChange={(e) => setTxTypeFilter(e.target.value)}
                  className="h-9 text-xs rounded-lg border border-[#04000D]/10 bg-white px-3 font-mono cursor-pointer"
                >
                  <option value="all">Semua Tipe</option>
                  <option value="expense">Pengeluaran</option>
                  <option value="income">Pemasukan</option>
                </select>
                {isTreasurerOrBPH && (
                  <select
                    value={txDivFilter}
                    onChange={(e) => setTxDivFilter(e.target.value)}
                    className="h-9 text-xs rounded-lg border border-[#04000D]/10 bg-white px-3 font-mono cursor-pointer"
                  >
                    <option value="all">Semua Divisi</option>
                    {budgets.map((b) => (
                      <option key={b.division_id} value={b.division_id}>
                        {b.division_name}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </div>

            {/* Transactions Table */}
            <div className="border border-[#04000D]/5 rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50/80 border-b border-[#04000D]/5">
                      <th className="text-left px-4 py-3 font-mono text-[10px] font-bold uppercase tracking-wider text-on-surface-variant/50">Tanggal</th>
                      <th className="text-left px-4 py-3 font-mono text-[10px] font-bold uppercase tracking-wider text-on-surface-variant/50">Divisi</th>
                      <th className="text-left px-4 py-3 font-mono text-[10px] font-bold uppercase tracking-wider text-on-surface-variant/50">Tipe</th>
                      <th className="text-left px-4 py-3 font-mono text-[10px] font-bold uppercase tracking-wider text-on-surface-variant/50">Kategori</th>
                      <th className="text-left px-4 py-3 font-mono text-[10px] font-bold uppercase tracking-wider text-on-surface-variant/50">Deskripsi</th>
                      <th className="text-right px-4 py-3 font-mono text-[10px] font-bold uppercase tracking-wider text-on-surface-variant/50">Jumlah</th>
                      <th className="text-left px-4 py-3 font-mono text-[10px] font-bold uppercase tracking-wider text-on-surface-variant/50">No. Nota</th>
                      <th className="text-center px-4 py-3 font-mono text-[10px] font-bold uppercase tracking-wider text-on-surface-variant/50">Bukti</th>
                      {isTreasurerOrBPH && (
                        <th className="text-center px-4 py-3 font-mono text-[10px] font-bold uppercase tracking-wider text-on-surface-variant/50">Aksi</th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {(() => {
                      const list = allTransactions.filter((tx) => {
                        if (txTypeFilter !== "all" && tx.type !== txTypeFilter) return false;
                        if (txDivFilter !== "all" && tx.division_id !== txDivFilter) return false;
                        if (txSearch) {
                          const q = txSearch.toLowerCase();
                          const matchDesc = tx.description.toLowerCase().includes(q);
                          const matchDiv = tx.division_name.toLowerCase().includes(q);
                          const matchNo = (tx.receipt_number || "").toLowerCase().includes(q);
                          const matchCat = (tx.category || "").toLowerCase().includes(q);
                          if (!matchDesc && !matchDiv && !matchNo && !matchCat) return false;
                        }
                        return true;
                      });

                      if (list.length === 0) {
                        return (
                          <tr>
                            <td colSpan={isTreasurerOrBPH ? 9 : 8} className="text-center py-10 font-mono text-xs text-on-surface-variant/60">
                              Belum ada catatan transaksi keuangan.
                            </td>
                          </tr>
                        );
                      }

                      return list.map((tx) => (
                        <tr key={tx.id} className="border-b border-[#04000D]/5 hover:bg-slate-50/60 transition-colors">
                          <td className="px-4 py-3 font-mono text-xs">
                            {new Date(tx.transaction_date).toLocaleDateString("id-ID", { day: "numeric", month: "short" })}
                          </td>
                          <td className="px-4 py-3 font-mono text-xs font-bold text-on-surface">{tx.division_name}</td>
                          <td className="px-4 py-3">
                            <Badge
                              variant={tx.type === "income" ? "success" : "danger"}
                              className="font-mono text-[9px] px-2 py-0.5 uppercase"
                            >
                              {tx.type === "income" ? "Masuk" : "Keluar"}
                            </Badge>
                          </td>
                          <td className="px-4 py-3 font-mono text-xs text-on-surface-variant">
                            {tx.category || "-"}
                          </td>
                          <td className="px-4 py-3 text-xs font-medium max-w-xs truncate" title={tx.description}>
                            {tx.description}
                          </td>
                          <td className={`px-4 py-3 text-right font-mono text-xs font-bold ${tx.type === "expense" ? "text-error" : "text-green-700"}`}>
                            {tx.type === "expense" ? "-" : "+"}{formatRp(tx.amount)}
                          </td>
                          <td className="px-4 py-3 font-mono text-xs text-on-surface-variant">{tx.receipt_number || "-"}</td>
                          <td className="px-4 py-3 text-center">
                            {tx.attachment_url ? (
                              <button
                                onClick={() => setShowPreview(tx.attachment_url!)}
                                className="inline-flex items-center gap-1 text-xs text-accent-magenta font-bold hover:underline cursor-pointer"
                              >
                                <Eye className="size-3.5" /> Lihat
                              </button>
                            ) : (
                              <span className="text-xs text-on-surface-variant/50">-</span>
                            )}
                          </td>
                          {isTreasurerOrBPH && (
                            <td className="px-4 py-3 text-center">
                              <div className="flex items-center justify-center gap-1.5">
                                <button
                                  onClick={() => setShowEditTx(tx)}
                                  className="p-1 rounded text-on-surface-variant hover:text-on-surface hover:bg-slate-100 cursor-pointer transition-colors"
                                  title="Edit Transaksi"
                                >
                                  <Pencil className="size-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDeleteTx(tx.id)}
                                  className="p-1 rounded text-error hover:bg-error/10 cursor-pointer transition-colors"
                                  title="Hapus Transaksi"
                                >
                                  <Trash2 className="size-3.5" />
                                </button>
                              </div>
                            </td>
                          )}
                        </tr>
                      ));
                    })()}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Card 2: Pengajuan Dana Kas / Riwayat Permohonan */}
          <div className="bg-white border border-[#04000D]/5 shadow-[0_8px_30px_rgb(0,0,0,0.015)] rounded-2xl p-5 sm:p-6">
            <div className="flex items-center justify-between border-b border-[#04000D]/5 pb-4 mb-5">
              <div>
                <h2 className="font-extrabold text-xl text-on-surface flex items-center gap-2">
                  <FileText className="size-5 text-accent-magenta" />{" "}
                  {isTreasurerOrBPH ? "Daftar Pengajuan Dana Kas" : "Pengajuan Dana Kas Divisi Saya"}
                </h2>
                <p className="text-xs font-medium text-on-surface-variant/70 mt-1">
                  {isTreasurerOrBPH
                    ? "Daftar pengajuan permohonan pencairan dana kas divisi panitia"
                    : "Status pengajuan pencairan dana kas yang diajukan ke Bendahara"}
                </p>
              </div>
              <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-on-surface-variant/50 shrink-0">
                {displayedRequests.length} Pengajuan
              </span>
            </div>

            <div className="border border-[#04000D]/5 rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50/80 border-b border-[#04000D]/5">
                      <th className="text-left px-4 py-3 font-mono text-[10px] font-bold uppercase tracking-wider text-on-surface-variant/50">Tanggal</th>
                      <th className="text-left px-4 py-3 font-mono text-[10px] font-bold uppercase tracking-wider text-on-surface-variant/50">Divisi</th>
                      <th className="text-left px-4 py-3 font-mono text-[10px] font-bold uppercase tracking-wider text-on-surface-variant/50">Pengaju</th>
                      <th className="text-left px-4 py-3 font-mono text-[10px] font-bold uppercase tracking-wider text-on-surface-variant/50">Keperluan</th>
                      <th className="text-right px-4 py-3 font-mono text-[10px] font-bold uppercase tracking-wider text-on-surface-variant/50">Nominal</th>
                      <th className="text-center px-4 py-3 font-mono text-[10px] font-bold uppercase tracking-wider text-on-surface-variant/50">Status</th>
                      {isTreasurerOrBPH && (
                        <th className="text-center px-4 py-3 font-mono text-[10px] font-bold uppercase tracking-wider text-on-surface-variant/50">Aksi</th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {displayedRequests.length === 0 ? (
                      <tr>
                        <td colSpan={isTreasurerOrBPH ? 7 : 6} className="text-center py-10 font-mono text-xs text-on-surface-variant/60">
                          Belum ada pengajuan dana.
                        </td>
                      </tr>
                    ) : (
                      displayedRequests.map((r) => (
                        <tr key={r.id} className="border-b border-[#04000D]/5 hover:bg-slate-50/60 transition-colors">
                          <td className="px-4 py-3 font-mono text-xs">
                            {new Date(r.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "short" })}
                          </td>
                          <td className="px-4 py-3 font-mono text-xs font-bold text-on-surface">{r.division_name}</td>
                          <td className="px-4 py-3 font-mono text-xs">{r.requester_name}</td>
                          <td className="px-4 py-3 text-xs font-medium max-w-xs truncate" title={r.purpose}>
                            {r.purpose}
                          </td>
                          <td className="px-4 py-3 text-right font-mono text-xs font-bold text-on-surface">
                            {formatRp(r.amount)}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <Badge
                              variant={r.status === "approved" ? "success" : r.status === "rejected" ? "danger" : "warning"}
                              className="font-mono text-[9px] px-2 py-0.5 uppercase"
                            >
                              {r.status === "approved" ? "Disetujui" : r.status === "rejected" ? "Ditolak" : "Pending"}
                            </Badge>
                          </td>
                          {isTreasurerOrBPH && (
                            <td className="px-4 py-3 text-center">
                              {r.status === "pending" ? (
                                <div className="flex items-center justify-center gap-1">
                                  <button
                                    onClick={async () => {
                                      if (confirm(`Setujui pengajuan dana ${formatRp(r.amount)}?`)) {
                                        await handleBudgetRequest(r.id, "approved");
                                      }
                                    }}
                                    className="p-1 rounded text-green-700 hover:bg-green-50 cursor-pointer"
                                    title="Setujui"
                                  >
                                    <CheckCircle className="size-4" />
                                  </button>
                                  <button
                                    onClick={async () => {
                                      const reason = prompt("Catatan penolakan (opsional):");
                                      await handleBudgetRequest(r.id, "rejected", reason || undefined);
                                    }}
                                    className="p-1 rounded text-accent-magenta hover:bg-accent-magenta/10 cursor-pointer"
                                    title="Tolak"
                                  >
                                    <XCircle className="size-4" />
                                  </button>
                                </div>
                              ) : (
                                <span className="font-mono text-[9px] text-on-surface-variant/50">
                                  {r.handler_name ? `Oleh ${r.handler_name}` : "Selesai"}
                                </span>
                              )}
                            </td>
                          )}
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (1/3 Width): DESIGN.md Stat Cards & Quick Links */}
        <div className="flex flex-col gap-5 md:gap-6">
          {/* Card 1: Ringkasan Anggaran (DESIGN.md Stat Card Pattern) */}
          <div className="bg-white border border-[#04000D]/5 shadow-[0_8px_30px_rgb(0,0,0,0.015)] rounded-2xl p-5 sm:p-6 space-y-4">
            <div className="border-b border-[#04000D]/5 pb-3">
              <h3 className="font-extrabold text-base text-on-surface flex items-center gap-2">
                <TrendingUp className="size-4 text-accent-magenta" />{" "}
                {isTreasurerOrBPH ? "Ringkasan Anggaran" : "Ringkasan Divisi Saya"}
              </h3>
              <p className="text-[11px] font-medium text-on-surface-variant/70 mt-0.5">
                {isTreasurerOrBPH ? "Total alokasi & realisasi kas panitia" : "Penggunaan anggaran divisi Anda"}
              </p>
            </div>

            {isTreasurerOrBPH ? (
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3.5 rounded-xl bg-slate-50 border border-[#04000D]/5 text-center">
                  <p className="font-mono text-[9px] font-bold uppercase text-on-surface-variant/50 tracking-wider">TOTAL ALOKASI</p>
                  <p className="font-extrabold text-xl text-on-surface mt-1 leading-tight">{formatRp(overview.total_budget)}</p>
                </div>
                <div className="p-3.5 rounded-xl bg-red-50/50 border border-red-200/40 text-center">
                  <p className="font-mono text-[9px] font-bold uppercase text-accent-magenta tracking-wider">TERPAKAI</p>
                  <p className="font-extrabold text-xl text-accent-magenta mt-1 leading-tight">{formatRp(overview.total_used)}</p>
                </div>
                <div className="p-3.5 rounded-xl bg-[#DCEEB1]/20 border border-[#DCEEB1]/50 text-center">
                  <p className="font-mono text-[9px] font-bold uppercase text-green-800 tracking-wider">SISA KAS</p>
                  <p className="font-extrabold text-xl text-green-800 mt-1 leading-tight">{formatRp(overview.total_remaining)}</p>
                </div>
                <div className="p-3.5 rounded-xl bg-amber-50/50 border border-amber-200/50 text-center">
                  <p className="font-mono text-[9px] font-bold uppercase text-amber-700 tracking-wider">PENDING</p>
                  <p className="font-extrabold text-xl text-amber-700 mt-1 leading-tight">{overview.pending_requests}</p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3.5 rounded-xl bg-slate-50 border border-[#04000D]/5 text-center">
                  <p className="font-mono text-[9px] font-bold uppercase text-on-surface-variant/50 tracking-wider">TOTAL PAGU</p>
                  <p className="font-extrabold text-xl text-on-surface mt-1 leading-tight">{formatRp(userDivisionBudget?.total_budget ?? 0)}</p>
                </div>
                <div className="p-3.5 rounded-xl bg-red-50/50 border border-red-200/40 text-center">
                  <p className="font-mono text-[9px] font-bold uppercase text-accent-magenta tracking-wider">TERPAKAI</p>
                  <p className="font-extrabold text-xl text-accent-magenta mt-1 leading-tight">{formatRp(userDivisionBudget?.used_amount ?? 0)}</p>
                </div>
                <div className="p-3.5 rounded-xl bg-[#DCEEB1]/20 border border-[#DCEEB1]/50 text-center">
                  <p className="font-mono text-[9px] font-bold uppercase text-green-800 tracking-wider">SISA KAS</p>
                  <p className="font-extrabold text-xl text-green-800 mt-1 leading-tight">{formatRp(userDivisionBudget?.remaining ?? 0)}</p>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-50 border border-[#04000D]/5 text-center">
                  <p className="font-mono text-[9px] font-bold uppercase text-on-surface-variant/50 tracking-wider">TRANSAKSI</p>
                  <p className="font-extrabold text-xl text-on-surface mt-1 leading-tight">{userDivisionBudget?.transaction_count ?? 0}</p>
                </div>
              </div>
            )}
          </div>



          {/* Card 2: Panduan & Akses LPJ */}
          <div className="bg-white border border-[#04000D]/5 shadow-[0_8px_30px_rgb(0,0,0,0.015)] rounded-2xl p-5 sm:p-6 space-y-4">
            <div className="border-b border-[#04000D]/5 pb-3">
              <h3 className="font-extrabold text-base text-on-surface flex items-center gap-2">
                <FileText className="size-4 text-accent-magenta" />{" "}
                {isTreasurerOrBPH ? "Laporan LPJ & Ekspor" : "Setor Nota Ke Bendahara"}
              </h3>
              <p className="text-[11px] font-medium text-on-surface-variant/70 mt-0.5">
                {isTreasurerOrBPH
                  ? "Cetak LPJ & unduh rekapitulasi data keuangan"
                  : "Lampirkan bukti struk/kwitansi fisik atau digital"}
              </p>
            </div>

            <div className="flex flex-col gap-2.5">
              <Button
                onClick={() => setShowAddTx("SETOR")}
                className="w-full justify-between cursor-pointer font-bold text-xs rounded-xl bg-[#04000D] text-white hover:bg-black"
              >
                <span className="flex items-center gap-2">
                  <Upload className="size-4" /> Upload Nota Pengeluaran
                </span>
                <ArrowUpRight className="size-4" />
              </Button>

              {isTreasurerOrBPH && (
                <>
                  <Link href="/dashboard/finance/report" className="w-full">
                    <Button
                      variant="outline"
                      className="w-full justify-between cursor-pointer font-bold text-xs rounded-xl border-[#04000D]/10 bg-white text-on-surface hover:bg-[#04000D] hover:text-white transition-all group"
                    >
                      <span className="flex items-center gap-2 text-on-surface group-hover:text-white transition-colors">
                        <FileText className="size-4 text-accent-magenta group-hover:text-[#FF3D8B] transition-colors" /> Halaman LPJ Keuangan
                      </span>
                      <ArrowUpRight className="size-4 text-on-surface-variant/60 group-hover:text-white transition-colors" />
                    </Button>
                  </Link>

                  <Button
                    variant="outline"
                    onClick={handleExport}
                    disabled={exporting}
                    className="w-full justify-between cursor-pointer font-bold text-xs rounded-xl border-[#04000D]/10 bg-white text-on-surface hover:bg-[#04000D] hover:text-white transition-all group"
                  >
                    <span className="flex items-center gap-2 text-on-surface group-hover:text-white transition-colors">
                      <Download className="size-4 text-green-700 group-hover:text-emerald-400 transition-colors" /> Unduh Ringkasan (CSV)
                    </span>
                  </Button>

                  <Button
                    variant="outline"
                    onClick={handleExportDetail}
                    disabled={exporting}
                    className="w-full justify-between cursor-pointer font-bold text-xs rounded-xl border-[#04000D]/10 bg-white text-on-surface hover:bg-[#04000D] hover:text-white transition-all group"
                  >
                    <span className="flex items-center gap-2 text-on-surface group-hover:text-white transition-colors">
                      <Download className="size-4 text-accent-magenta group-hover:text-[#FF3D8B] transition-colors" /> Unduh Detail Transaksi (CSV)
                    </span>
                  </Button>

                  <Button
                    variant="outline"
                    onClick={() => setShowAppsScriptModal(true)}
                    className="w-full justify-between cursor-pointer font-bold text-xs rounded-xl border-[#04000D]/10 bg-emerald-50 text-emerald-900 border-emerald-200 hover:bg-emerald-700 hover:text-white transition-all group"
                  >
                    <span className="flex items-center gap-2 font-extrabold text-emerald-800 group-hover:text-white transition-colors">
                      <Share2 className="size-4 text-emerald-600 group-hover:text-emerald-200 transition-colors" /> Sinkron ke Google Sheets
                    </span>
                    <ArrowUpRight className="size-4 text-emerald-600 group-hover:text-white transition-colors" />
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Set Budget Modal */}
      <Modal open={!!showSetBudget} onClose={() => setShowSetBudget(null)} title="Atur Anggaran Divisi">
        <form action={setBudgetAction} className="flex flex-col gap-4">
          <input type="hidden" name="division_id" value={showSetBudget ?? ""} />
          <div>
            <label className="caption block mb-1 text-on-surface-variant font-bold">Total Anggaran (Rp)</label>
            <Input name="amount" type="number" min="0" required placeholder="1000000" />
          </div>
          <div className="flex gap-2 justify-end mt-2">
            <Button type="button" variant="ghost" onClick={() => setShowSetBudget(null)} className="cursor-pointer">
              Batal
            </Button>
            <Button type="submit" disabled={setBudgetPending} className="cursor-pointer font-bold bg-[#04000D] text-white hover:bg-black">
              {setBudgetPending ? "Menyimpan..." : "Simpan Anggaran"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Add / Setor Transaksi & Upload Nota Modal */}
      <Modal
        open={!!showAddTx}
        onClose={resetTxModal}
        title={showAddTx === "SETOR" ? "Setor Laporan Keuangan & Upload Nota" : "Catat Transaksi Financial"}
      >
        <form action={addTxAction} className="flex flex-col gap-4">
          {showAddTx === "SETOR" ? (
            <div>
              <label className="caption block mb-1 text-on-surface-variant font-bold">Divisi Disetor <span className="text-error">*</span></label>
              {isTreasurerOrBPH ? (
                <select
                  name="division_id"
                  defaultValue={userDivisionId || (budgets[0]?.division_id ?? "")}
                  className="flex h-11 w-full rounded-md border border-primary bg-surface-bright px-4 py-2 text-base font-sans text-on-surface focus:border-accent-magenta focus:outline-none cursor-pointer appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2020%2020%22%20fill%3D%22none%22%3E%3Cpath%20d%3D%22M7%209l3%203%203-3%22%20stroke%3D%22%231d1b1d%22%20stroke-width%3D%221.5%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%3C%2Fsvg%3E')] bg-[length:1.25rem] bg-[right_1rem_center] bg-no-repeat pr-10"
                  required
                >
                  {budgets.map((b) => (
                    <option key={b.division_id} value={b.division_id}>
                      {b.division_name}
                    </option>
                  ))}
                </select>
              ) : (
                <>
                  <input type="hidden" name="division_id" value={userDivisionBudget?.division_id || userDivisionId} />
                  <Input value={userDivisionBudget?.division_name || "Divisi Saya"} disabled className="bg-slate-50 font-bold" />
                </>
              )}
            </div>
          ) : (
            <input type="hidden" name="budget_id" value={showAddTx ?? ""} />
          )}

          <input type="hidden" name="attachment_url" value={uploadedUrl} />

          {showAddTx === "SETOR" ? (
            <input type="hidden" name="type" value="expense" />
          ) : (
            <div>
              <label className="caption block mb-1 text-on-surface-variant font-bold">Tipe Transaksi</label>
              <select
                name="type"
                className="flex h-11 w-full rounded-md border border-primary bg-surface-bright px-4 py-2 text-base font-sans text-on-surface focus:border-accent-magenta focus:outline-none cursor-pointer appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2020%2020%22%20fill%3D%22none%22%3E%3Cpath%20d%3D%22M7%209l3%203%203-3%22%20stroke%3D%22%231d1b1d%22%20stroke-width%3D%221.5%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%3C%2Fsvg%3E')] bg-[length:1.25rem] bg-[right_1rem_center] bg-no-repeat pr-10"
                required
              >
                <option value="expense">Pengeluaran (Expense / Setor Nota)</option>
                <option value="income">Pemasukan (Income)</option>
              </select>
            </div>
          )}

          <div>
            <label className="caption block mb-1 text-on-surface-variant font-bold">Jumlah / Nominal (Rp) <span className="text-error">*</span></label>
            <Input name="amount" type="number" min="1" required placeholder="Contoh: 150000" />
          </div>

          <div>
            <label className="caption block mb-1 text-on-surface-variant font-bold">Kategori Transaksi</label>
            <select
              name="category"
              className="flex h-11 w-full rounded-md border border-primary bg-surface-bright px-4 py-2 text-base font-sans text-on-surface focus:border-accent-magenta focus:outline-none cursor-pointer appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2020%2020%22%20fill%3D%22none%22%3E%3Cpath%20d%3D%22M7%209l3%203%203-3%22%20stroke%3D%22%231d1b1d%22%20stroke-width%3D%221.5%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%3C%2Fsvg%3E')] bg-[length:1.25rem] bg-[right_1rem_center] bg-no-repeat pr-10"
            >
              {CATEGORY_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="caption block mb-1 text-on-surface-variant font-bold">Deskripsi / Keterangan Transaksi <span className="text-error">*</span></label>
            <Input name="description" placeholder="Contoh: Pembelian konsumsi rapat, Cetak Spanduk, dll" required />
          </div>

          <div>
            <label className="caption block mb-1 text-on-surface-variant font-bold">Tanggal Transaksi</label>
            <Input name="transaction_date" type="date" defaultValue={new Date().toISOString().slice(0, 10)} />
          </div>

          <div>
            <label className="caption block mb-1 text-on-surface-variant font-bold">Nomor Kwitansi / Nota</label>
            <Input name="receipt_number" placeholder="Opsional: No. nota / kwitansi / referensi" />
          </div>

          <div>
            <label className="caption block mb-1 text-on-surface-variant font-bold">Upload Bukti Nota / Kwitansi / Struk (Gambar atau PDF)</label>
            <div className="border-2 border-dashed border-primary/30 rounded-xl p-4 flex flex-col items-center justify-center gap-2 hover:border-primary/60 transition-colors bg-surface-container/10">
              {uploading ? (
                <div className="flex flex-col items-center gap-2">
                  <Loader2 className="size-6 text-primary animate-spin" />
                  <p className="text-xs font-semibold text-on-surface">Mengunggah bukti...</p>
                </div>
              ) : uploadedUrl ? (
                <div className="flex items-center gap-2 w-full">
                  <Eye className="size-5 text-accent-green shrink-0" />
                  <span className="text-xs text-on-surface font-bold truncate flex-1">Bukti Nota Terunggah</span>
                  <button
                    type="button"
                    onClick={() => setShowPreview(uploadedUrl)}
                    className="text-xs text-accent-magenta font-bold hover:underline cursor-pointer shrink-0"
                  >
                    Pratinjau
                  </button>
                  <button
                    type="button"
                    onClick={() => setUploadedUrl("")}
                    className="text-xs text-error font-bold hover:underline cursor-pointer shrink-0"
                  >
                    Hapus
                  </button>
                </div>
              ) : (
                <>
                  <Upload className="size-6 text-accent-magenta" />
                  <p className="text-xs text-on-surface-variant text-center font-medium">Klik atau seret file nota/kwitansi (PDF/Gambar)</p>
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png,.webp"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileUpload(file);
                    }}
                    className="text-xs text-on-surface-variant file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 cursor-pointer"
                  />
                </>
              )}
            </div>
          </div>

          <div className="flex gap-2 justify-end mt-2">
            <Button type="button" variant="ghost" onClick={resetTxModal} className="cursor-pointer">
              Batal
            </Button>
            <Button type="submit" disabled={addTxPending} className="cursor-pointer font-bold bg-[#04000D] text-white hover:bg-black">
              {addTxPending ? "Menyetor..." : showAddTx === "SETOR" ? "Setor Laporan Keuangan" : "Simpan Transaksi"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Create Budget Request Modal */}
      <Modal open={showRequest} onClose={() => setShowRequest(false)} title="Pengajuan Dana Kas Panitia">
        <form action={createReqAction} className="flex flex-col gap-4">
          <div>
            <label className="caption block mb-1 text-on-surface-variant font-bold">Divisi <span className="text-error">*</span></label>
            {isTreasurerOrBPH ? (
              <select
                name="division_id"
                defaultValue={userDivisionId || (budgets[0]?.division_id ?? "")}
                className="flex h-11 w-full rounded-md border border-primary bg-surface-bright px-4 py-2 text-base font-sans text-on-surface focus:border-accent-magenta focus:outline-none cursor-pointer appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2020%2020%22%20fill%3D%22none%22%3E%3Cpath%20d%3D%22M7%209l3%203%203-3%22%20stroke%3D%22%231d1b1d%22%20stroke-width%3D%221.5%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%3C%2Fsvg%3E')] bg-[length:1.25rem] bg-[right_1rem_center] bg-no-repeat pr-10"
                required
              >
                {budgets.map((b) => (
                  <option key={b.division_id} value={b.division_id}>{b.division_name}</option>
                ))}
              </select>
            ) : (
              <>
                <input type="hidden" name="division_id" value={userDivisionBudget?.division_id || userDivisionId} />
                <Input value={userDivisionBudget?.division_name || "Divisi Saya"} disabled className="bg-slate-50 font-bold" />
              </>
            )}
          </div>
          <div>
            <label className="caption block mb-1 text-on-surface-variant font-bold">Nominal Pengajuan (Rp) <span className="text-error">*</span></label>
            <Input name="amount" type="number" min="1" required placeholder="500000" />
          </div>
          <div>
            <label className="caption block mb-1 text-on-surface-variant font-bold">Tujuan / Keperluan <span className="text-error">*</span></label>
            <Input name="purpose" placeholder="Contoh: DP tempat acara, Pembelian souvenir" required />
          </div>
          <div className="flex gap-2 justify-end mt-2">
            <Button type="button" variant="ghost" onClick={() => setShowRequest(false)} className="cursor-pointer">
              Batal
            </Button>
            <Button type="submit" disabled={createReqPending} className="cursor-pointer font-bold bg-[#04000D] text-white hover:bg-black">
              {createReqPending ? "Mengajukan..." : "Kirim Pengajuan"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Preview Bukti Transaksi Modal */}
      <Modal open={!!showPreview} onClose={() => setShowPreview(null)} title="Bukti Nota / Kwitansi Transaksi">
        {showPreview && (
          <div className="flex flex-col gap-4">
            {showPreview.includes("drive.google.com") ? (
              <div className="w-full h-[500px] border border-outline-variant rounded-xl overflow-hidden">
                <iframe
                  src={showPreview.replace(/\/view(\?.*)?$/, "/preview")}
                  className="w-full h-full border-0"
                  allow="autoplay"
                />
              </div>
            ) : showPreview.match(/\.(jpg|jpeg|png|webp)(\?.*)?$/i) ? (
              <img
                src={showPreview}
                alt="Bukti Transaksi"
                className="w-full max-h-[500px] object-contain rounded-xl border border-outline-variant"
              />
            ) : (
              <div className="w-full h-[500px] border border-outline-variant rounded-xl overflow-hidden bg-surface-container-low">
                <iframe
                  src={`${showPreview}#toolbar=0`}
                  className="w-full h-full border-0"
                />
              </div>
            )}
            <a
              href={showPreview}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 w-full h-11 bg-primary text-white hover:bg-primary/95 rounded-full font-semibold transition-colors text-sm cursor-pointer"
            >
              <ExternalLink className="size-4" /> Buka Bukti Nota di Tab Baru
            </a>
          </div>
        )}
      </Modal>

      {/* Google Apps Script / Spreadsheet Sync Modal */}
      <Modal open={showAppsScriptModal} onClose={() => setShowAppsScriptModal(false)} title="Sinkronkan Ke Google Sheets (Apps Script)">
        <div className="flex flex-col gap-4">
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-950 font-sans space-y-2">
            <p className="font-extrabold flex items-center gap-1.5 text-sm text-emerald-900">
              <Share2 className="size-4" /> Sinkronisasi Spreadsheet Otomatis & Direct Manipulation
            </p>
            <p>
              Seluruh data jurnal transaksi pengeluaran/pemasukan dan pagu anggaran divisi panitia akan dikirimkan secara otomatis atau manual langsung ke Google Spreadsheet milik Bendahara.
            </p>
            <p className="font-mono text-[11px] bg-white p-2 rounded border border-emerald-200/80">
              Skrip Apps Script: <span className="font-bold">scripts/google-apps-script-finance.gs</span>
            </p>
          </div>

          <div>
            <label className="caption block mb-1 text-on-surface-variant font-bold">
              URL Webhook Apps Script (Opsional / Override)
            </label>
            <Input
              value={appsScriptUrlInput}
              onChange={(e) => setAppsScriptUrlInput(e.target.value)}
              placeholder="https://script.google.com/macros/s/.../exec"
              className="font-mono text-xs"
            />
            <p className="text-[11px] text-on-surface-variant/70 mt-1">
              Kosongkan jika sudah mengatur <code className="bg-slate-100 px-1 py-0.5 rounded text-accent-magenta">APPSCRIPT_WEBHOOK_URL</code> di environment server.
            </p>
          </div>

          {syncStatusMsg && (
            <div
              className={`p-3 rounded-xl text-xs font-mono border ${
                syncStatusMsg.type === "success"
                  ? "bg-emerald-100 text-emerald-900 border-emerald-300"
                  : "bg-rose-100 text-rose-900 border-rose-300"
              }`}
            >
              {syncStatusMsg.text}
            </div>
          )}

          <div className="flex gap-2 justify-end mt-2">
            <Button variant="ghost" onClick={() => setShowAppsScriptModal(false)} className="cursor-pointer text-xs">
              Tutup
            </Button>
            <Button
              onClick={handleSyncToSpreadsheet}
              disabled={syncingAppsScript}
              className="cursor-pointer font-bold bg-[#04000D] text-white hover:bg-black text-xs gap-2"
            >
              {syncingAppsScript ? (
                <>
                  <Loader2 className="size-3.5 animate-spin" /> Menyinkronkan...
                </>
              ) : (
                <>
                  <RefreshCw className="size-3.5" /> Kirim & Sinkronkan Sekarang
                </>
              )}
            </Button>
          </div>
        </div>
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
                {CATEGORY_OPTIONS.filter((c) => c.value).map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
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
