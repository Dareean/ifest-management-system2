"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { setBudget, addTransaction, createBudgetRequest, handleBudgetRequest, exportFinanceCSV, exportFinanceCSVDetail } from "@/lib/actions/finance";
import { DollarSign, TrendingUp, TrendingDown, FileDown, Plus, CheckCircle, XCircle, FileText, Upload, ExternalLink, Eye, Loader2 } from "lucide-react";
import type { BudgetWithDivision, BudgetRequestData, FinanceOverview } from "@/lib/data/finance";

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

export function FinanceClient({ overview, budgets, requests }: {
  overview: FinanceOverview;
  budgets: BudgetWithDivision[];
  requests: BudgetRequestData[];
}) {
  const [showSetBudget, setShowSetBudget] = useState<string | null>(null);
  const [showAddTx, setShowAddTx] = useState<string | null>(null);
  const [showRequest, setShowRequest] = useState(false);
  const [showPreview, setShowPreview] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState<string>("");
  const [actionMsg, setActionMsg] = useState<string | null>(null);

  const [, setBudgetAction, setBudgetPending] = useActionState(setBudget, null);
  const [, addTxAction, addTxPending] = useActionState(addTransaction, null);
  const [, createReqAction, createReqPending] = useActionState(createBudgetRequest, null);

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
      const data = await response.json() as { url?: string; error?: string };

      if (response.ok && data.url) {
        setUploadedUrl(data.url);
        setActionMsg(null);
      } else {
        setActionMsg(data.error || "Gagal mengunggah bukti.");
      }
    } catch {
      setActionMsg("Gagal mengunggah file.");
    } finally {
      setUploading(false);
    }
  }

  function resetTxModal() {
    setShowAddTx(null);
    setUploadedUrl("");
    setActionMsg(null);
  }

  const statusColors: Record<string, "warning" | "success" | "danger" | "info"> = {
    pending: "warning",
    approved: "success",
    rejected: "danger",
    disbursed: "info",
  };

  return (
    <div className="flex flex-col gap-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-accent-magenta font-mono text-xs font-bold tracking-widest uppercase mb-1">
            Keuangan
          </p>
          <h1 className="text-4xl font-extrabold tracking-tight text-on-surface">
            Overview Anggaran
          </h1>
          <p className="mt-2 text-base text-on-surface-variant">
            Kelola dan catat transaksi keuangan kepanitiaan secara transparan.
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0 sm:self-end">
          <Link href="/dashboard/finance/report">
            <Button variant="outline" className="cursor-pointer text-xs">
              <FileText className="size-4" /> LPJ
            </Button>
          </Link>
          <div className="relative">
            <Button variant="ghost" onClick={handleExport} disabled={exporting} className="cursor-pointer text-xs">
              <FileDown className="size-4" /> {exporting ? "..." : "CSV"}
            </Button>
            <div className="absolute right-0 top-full mt-1 z-10 bg-white border border-outline-variant rounded-xl shadow-lg overflow-hidden hidden group-hover:block">
              <button onClick={handleExport} className="block w-full text-left px-4 py-2 text-xs font-mono hover:bg-surface-container cursor-pointer">
                Export Ringkasan
              </button>
              <button onClick={handleExportDetail} className="block w-full text-left px-4 py-2 text-xs font-mono hover:bg-surface-container cursor-pointer">
                Export Detail
              </button>
            </div>
          </div>
          <Button variant="primary" onClick={() => setShowRequest(true)} className="cursor-pointer">
            <Plus className="size-4" /> Ajukan Dana
          </Button>
        </div>
      </div>

      {actionMsg && (
        <div className="text-sm text-error bg-error-container rounded-xl p-4 font-mono border border-error/20 shadow-sm">
          {actionMsg}
        </div>
      )}

      {/* Finance Overview Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        {/* Card 1: Total Anggaran */}
        <div className="bg-surface-container-low border border-outline-variant/60 rounded-2xl p-6 transition-all hover:border-outline-variant">
          <p className="text-xs font-mono font-bold tracking-wider text-on-surface-variant uppercase flex items-center gap-1.5">
            <DollarSign className="size-3.5" /> TOTAL ANGGARAN
          </p>
          <p className="text-2xl font-black text-on-surface my-2 leading-none">{formatRp(overview.total_budget)}</p>
          <p className="text-xs text-on-surface-variant font-mono">Anggaran teralokasi</p>
        </div>

        {/* Card 2: Terpakai */}
        <div className="bg-surface-container-low border border-outline-variant/60 rounded-2xl p-6 transition-all hover:border-outline-variant">
          <p className="text-xs font-mono font-bold tracking-wider text-on-surface-variant uppercase flex items-center gap-1.5">
            <TrendingDown className="size-3.5 text-error" /> TERPAKAI
          </p>
          <p className="text-2xl font-black text-on-surface my-2 leading-none">{formatRp(overview.total_used)}</p>
          <p className="text-xs text-on-surface-variant font-mono">Pengeluaran divisi</p>
        </div>

        {/* Card 3: Sisa */}
        <div className="bg-surface-container-low border border-outline-variant/60 rounded-2xl p-6 transition-all hover:border-outline-variant">
          <p className="text-xs font-mono font-bold tracking-wider text-on-surface-variant uppercase flex items-center gap-1.5">
            <TrendingUp className="size-3.5 text-accent-green" /> SISA ANGGARAN
          </p>
          <p className="text-2xl font-black text-on-surface my-2 leading-none">{formatRp(overview.total_remaining)}</p>
          <p className="text-xs text-on-surface-variant font-mono">Sisa dana tersedia</p>
        </div>

        {/* Card 4: Pengajuan */}
        <div className="bg-surface-container-low border border-outline-variant/60 rounded-2xl p-6 transition-all hover:border-outline-variant">
          <p className="text-xs font-mono font-bold tracking-wider text-on-surface-variant uppercase flex items-center gap-1.5">
            <FileText className="size-3.5" /> PENGAJUAN
          </p>
          <p className="text-2xl font-black text-on-surface my-2 leading-none">
            {overview.pending_requests}
            <span className="text-xs font-normal text-on-surface-variant ml-1.5">pending</span>
          </p>
          <p className="text-xs text-on-surface-variant font-mono">Menunggu persetujuan</p>
        </div>
      </div>

      {/* Budget per Division Section */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <DollarSign className="size-5 text-error" />
          <h2 className="text-xl font-bold tracking-tight text-on-surface">Anggaran per Divisi</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {budgets.map((b) => {
            const pct = b.total_budget > 0 ? Math.round((b.used_amount / b.total_budget) * 100) : 0;
            return (
              <Link key={b.division_id} href={`/dashboard/finance/${b.division_id}`} className="block group">
                <Card className="bg-white border border-outline-variant/60 rounded-2xl p-5 hover:border-primary/20 hover:shadow-sm transition-all flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between gap-4 mb-3 border-b border-outline-variant/10 pb-3">
                      <span className="font-bold text-on-surface text-base group-hover:text-primary transition-colors">{b.division_name}</span>
                      <Badge variant={b.remaining > 0 ? "success" : "danger"} className="text-[10px] font-mono px-2 py-0.5">
                        {b.transaction_count} transaksi
                      </Badge>
                    </div>
                    
                    <div className="flex flex-col gap-1 text-sm font-mono text-on-surface-variant mb-4">
                      <div className="flex justify-between">
                        <span>Total Budget</span>
                        <span className="font-bold text-on-surface">{formatRp(b.total_budget)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Terpakai</span>
                        <span className="font-bold text-error">{formatRp(b.used_amount)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Sisa</span>
                        <span className={`font-bold ${b.remaining >= 0 ? "text-accent-green" : "text-error"}`}>
                          {formatRp(b.remaining)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-auto">
                    <div className="flex items-center justify-between text-xs font-mono text-on-surface-variant mb-1">
                      <span>Penggunaan Anggaran</span>
                      <span>{pct}%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-surface-container overflow-hidden mb-4">
                      <div
                        className="h-full rounded-full bg-primary transition-all duration-300"
                        style={{ width: `${Math.min(pct, 100)}%` }}
                      />
                    </div>

                    <div className="flex gap-2 justify-end" onClick={(e) => e.preventDefault()}>
                      <Button size="sm" variant="outline" onClick={() => { setShowAddTx(b.id); resetTxModal(); }} className="cursor-pointer text-xs">
                        <Plus className="size-3" /> Transaksi
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => setShowSetBudget(b.division_id)} className="cursor-pointer text-xs">
                        Atur Budget
                      </Button>
                    </div>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Budget Requests Section */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <FileText className="size-5 text-error" />
          <h2 className="text-xl font-bold tracking-tight text-on-surface">Daftar Pengajuan Dana</h2>
        </div>

        <div className="flex flex-col gap-3">
          {requests.length === 0 ? (
            <div className="bg-white border border-outline-variant/60 rounded-2xl p-6 text-center">
              <p className="text-sm font-mono text-on-surface-variant">Belum ada pengajuan dana.</p>
            </div>
          ) : (
            requests.map((r) => (
              <Card key={r.id} className="bg-white border border-outline-variant/60 rounded-xl p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2.5">
                    <span className="font-bold text-lg text-on-surface">{formatRp(r.amount)}</span>
                    <Badge variant={statusColors[r.status] ?? "info"} className="text-[10px] font-mono uppercase px-2 py-0.5">
                      {r.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-on-surface-variant font-sans mt-1.5">{r.purpose}</p>
                  <p className="text-xs text-on-surface-variant font-mono mt-1">
                    {r.division_name} &middot; Pengaju: {r.requester_name}
                    {r.handler_name && ` &middot; Reviewer: ${r.handler_name}`}
                  </p>
                </div>
                {r.status === "pending" && (
                  <div className="flex gap-2 shrink-0 self-start sm:self-center">
                    <form
                      action={async () => {
                        await handleBudgetRequest(r.id, "approved", "");
                      }}
                    >
                      <Button size="sm" variant="primary" type="submit" className="cursor-pointer text-xs">
                        <CheckCircle className="size-3.5" /> Setujui
                      </Button>
                    </form>
                    <form
                      action={async () => {
                        const notes = prompt("Alasan penolakan (opsional):");
                        await handleBudgetRequest(r.id, "rejected", notes ?? undefined);
                      }}
                    >
                      <Button size="sm" variant="outline" type="submit" className="cursor-pointer text-xs text-red-500 border-red-200 hover:bg-red-50">
                        <XCircle className="size-3.5" /> Tolak
                      </Button>
                    </form>
                  </div>
                )}
              </Card>
            ))
          )}
        </div>
      </div>

      {/* Set Budget Modal */}
      <Modal open={!!showSetBudget} onClose={() => setShowSetBudget(null)} title="Atur Anggaran Divisi">
        <form action={setBudgetAction} className="flex flex-col gap-4">
          <input type="hidden" name="division_id" value={showSetBudget ?? ""} />
          <div>
            <label className="caption block mb-1 text-on-surface-variant">Total Anggaran (Rp)</label>
            <Input name="amount" type="number" min="0" required placeholder="1000000" />
          </div>
          <div className="flex gap-2 justify-end mt-2">
            <Button type="button" variant="ghost" onClick={() => setShowSetBudget(null)} className="cursor-pointer">
              Batal
            </Button>
            <Button type="submit" disabled={setBudgetPending} className="cursor-pointer">
              {setBudgetPending ? "Menyimpan..." : "Simpan"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Add Transaction Modal */}
      <Modal open={!!showAddTx} onClose={resetTxModal} title="Tambah Transaksi">
        <form action={addTxAction} className="flex flex-col gap-4">
          <input type="hidden" name="budget_id" value={showAddTx ?? ""} />
          <input type="hidden" name="attachment_url" value={uploadedUrl} />
          
          <div>
            <label className="caption block mb-1 text-on-surface-variant">Tipe Transaksi</label>
            <select
              name="type"
              className="flex h-11 w-full rounded-md border border-primary bg-surface-bright px-4 py-2 text-base font-sans text-on-surface focus:border-accent-magenta focus:outline-none cursor-pointer appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2020%2020%22%20fill%3D%22none%22%3E%3Cpath%20d%3D%22M7%209l3%203%203-3%22%20stroke%3D%22%231d1b1d%22%20stroke-width%3D%221.5%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%3C%2Fsvg%3E')] bg-[length:1.25rem] bg-[right_1rem_center] bg-no-repeat pr-10"
              required
            >
              <option value="income">Pemasukan (Income)</option>
              <option value="expense">Pengeluaran (Expense)</option>
            </select>
          </div>

          <div>
            <label className="caption block mb-1 text-on-surface-variant">Kategori</label>
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
            <label className="caption block mb-1 text-on-surface-variant">Jumlah (Rp) <span className="text-error">*</span></label>
            <Input name="amount" type="number" min="1" required placeholder="100000" />
          </div>

          <div>
            <label className="caption block mb-1 text-on-surface-variant">Deskripsi Transaksi <span className="text-error">*</span></label>
            <Input name="description" placeholder="Contoh: Konsumsi rapat, Cetak banner" required />
          </div>

          <div>
            <label className="caption block mb-1 text-on-surface-variant">Tanggal Transaksi</label>
            <Input name="transaction_date" type="date" defaultValue={new Date().toISOString().slice(0, 10)} />
          </div>

          <div>
            <label className="caption block mb-1 text-on-surface-variant">Nomor Kwitansi/Nota</label>
            <Input name="receipt_number" placeholder="Opsional: No. kwitansi atau referensi" />
          </div>

          <div>
            <label className="caption block mb-1 text-on-surface-variant">Upload Bukti Transaksi</label>
            <div className="border-2 border-dashed border-primary/30 rounded-xl p-4 flex flex-col items-center justify-center gap-2 hover:border-primary/60 transition-colors bg-surface-container/10">
              {uploading ? (
                <div className="flex flex-col items-center gap-2">
                  <Loader2 className="size-6 text-primary animate-spin" />
                  <p className="text-xs font-semibold text-on-surface">Mengunggah...</p>
                </div>
              ) : uploadedUrl ? (
                <div className="flex items-center gap-2 w-full">
                  <Eye className="size-5 text-accent-green shrink-0" />
                  <span className="text-xs text-on-surface-variant truncate flex-1">Bukti terunggah</span>
                  <button
                    type="button"
                    onClick={() => window.open(uploadedUrl, "_blank")}
                    className="text-xs text-primary font-bold hover:underline cursor-pointer shrink-0"
                  >
                    Lihat
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
                  <Upload className="size-6 text-on-surface-variant/60" />
                  <p className="text-xs text-on-surface-variant text-center">Klik untuk upload bukti (PDF/Gambar)</p>
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
            <Button type="submit" disabled={addTxPending || uploading} className="cursor-pointer">
              {addTxPending ? "Menyimpan..." : "Tambah Transaksi"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Request Budget Modal */}
      <Modal open={showRequest} onClose={() => setShowRequest(false)} title="Ajukan Anggaran/Dana">
        <form action={createReqAction} className="flex flex-col gap-4">
          <div>
            <label className="caption block mb-1 text-on-surface-variant">Jumlah Pengajuan (Rp)</label>
            <Input name="amount" type="number" min="1" required placeholder="500000" />
          </div>
          <div>
            <label className="caption block mb-1 text-on-surface-variant">Tujuan Penggunaan Dana</label>
            <textarea
              name="purpose"
              className="flex min-h-[100px] w-full rounded-md border border-primary bg-surface-bright px-4 py-2 text-base font-sans text-on-surface placeholder:text-on-surface-variant focus:border-accent-magenta focus:outline-none resize-y"
              placeholder="Jelaskan secara rinci penggunaan dana..."
              required
            />
          </div>
          <div className="flex gap-2 justify-end mt-2">
            <Button type="button" variant="ghost" onClick={() => setShowRequest(false)} className="cursor-pointer">
              Batal
            </Button>
            <Button type="submit" disabled={createReqPending} className="cursor-pointer">
              {createReqPending ? "Mengirim..." : "Kirim Pengajuan"}
            </Button>
          </div>
        </form>
      </Modal>
      {/* Preview Bukti Transaksi Modal */}
      <Modal open={!!showPreview} onClose={() => setShowPreview(null)} title="Bukti Transaksi">
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
              <ExternalLink className="size-4" /> Buka di Tab Baru
            </a>
          </div>
        )}
      </Modal>
    </div>
  );
}
