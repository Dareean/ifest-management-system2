"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { setBudget, addTransaction, createBudgetRequest, handleBudgetRequest, exportFinanceCSV, exportFinanceCSVDetail } from "@/lib/actions/finance";
import { DollarSign, TrendingUp, TrendingDown, FileDown, Plus, CheckCircle, XCircle, FileText, Upload, ExternalLink, Eye, Loader2, Receipt } from "lucide-react";
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

export function FinanceClient({
  overview,
  budgets,
  requests,
  userAssignmentId = "",
  userDivisionId = "",
  isTreasurerOrBPH = true,
}: {
  overview: FinanceOverview;
  budgets: BudgetWithDivision[];
  requests: BudgetRequestData[];
  userAssignmentId?: string;
  userDivisionId?: string;
  isTreasurerOrBPH?: boolean;
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
    <div className="flex flex-col gap-10">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-accent-magenta font-mono text-xs font-bold tracking-widest uppercase mb-1">
            Keuangan Panitia
          </p>
          <h1 className="text-4xl font-extrabold tracking-tight text-on-surface">
            Overview & Pelaporan Keuangan
          </h1>
          <p className="mt-2 text-base text-on-surface-variant">
            Setor laporan pengeluaran, upload nota kwitansi, dan pantau penggunaan anggaran.
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0 sm:self-end flex-wrap">
          <Button
            variant="primary"
            onClick={() => setShowAddTx("SETOR")}
            className="cursor-pointer font-bold gap-2 px-5 py-2.5 rounded-xl shadow-md"
          >
            <Upload className="size-4" /> Setor Laporan & Nota
          </Button>

          <Button variant="outline" onClick={() => setShowRequest(true)} className="cursor-pointer text-xs font-bold gap-1.5">
            <Plus className="size-4" /> Ajukan Dana
          </Button>

          <Link href="/dashboard/finance/report">
            <Button variant="outline" className="cursor-pointer text-xs font-bold gap-1.5">
              <FileText className="size-4" /> LPJ
            </Button>
          </Link>

          {isTreasurerOrBPH && (
            <Button variant="ghost" onClick={handleExport} disabled={exporting} className="cursor-pointer text-xs font-mono">
              <FileDown className="size-4" /> {exporting ? "..." : "CSV"}
            </Button>
          )}
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
          <p className="text-2xl font-black text-error my-2 leading-none">{formatRp(overview.total_used)}</p>
          <p className="text-xs text-on-surface-variant font-mono">Total pengeluaran</p>
        </div>

        {/* Card 3: Sisa */}
        <div className="bg-surface-container-low border border-outline-variant/60 rounded-2xl p-6 transition-all hover:border-outline-variant">
          <p className="text-xs font-mono font-bold tracking-wider text-on-surface-variant uppercase flex items-center gap-1.5">
            <TrendingUp className="size-3.5 text-accent-green" /> SISA ANGGARAN
          </p>
          <p className="text-2xl font-black text-accent-green my-2 leading-none">{formatRp(overview.total_remaining)}</p>
          <p className="text-xs text-on-surface-variant font-mono">Sisa dana tersedia</p>
        </div>

        {/* Card 4: Pending Requests */}
        <div className="bg-surface-container-low border border-outline-variant/60 rounded-2xl p-6 transition-all hover:border-outline-variant">
          <p className="text-xs font-mono font-bold tracking-wider text-on-surface-variant uppercase flex items-center gap-1.5">
            <FileText className="size-3.5" /> PENGAJUAN PENDING
          </p>
          <p className="text-2xl font-black text-on-surface my-2 leading-none">{overview.pending_requests}</p>
          <p className="text-xs text-on-surface-variant font-mono">Menunggu persetujuan</p>
        </div>
      </div>

      {/* Budget Allocation by Division */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold tracking-tight text-on-surface">Anggaran Per Divisi</h2>
          <span className="text-xs font-mono text-on-surface-variant">{budgets.length} divisi</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {budgets.map((b) => {
            const pct = b.total_budget > 0 ? Math.round((b.used_amount / b.total_budget) * 100) : 0;
            return (
              <Card key={b.division_id} className="bg-white border border-outline-variant/60 rounded-2xl p-6 flex flex-col justify-between gap-4">
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="text-base font-bold text-on-surface">{b.division_name}</h3>
                      <p className="text-xs text-on-surface-variant font-mono">{b.transaction_count} transaksi</p>
                    </div>
                    {isTreasurerOrBPH && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setShowSetBudget(b.division_id)}
                        className="cursor-pointer text-xs font-mono font-bold text-primary hover:underline p-1 h-auto"
                      >
                        Atur
                      </Button>
                    )}
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-mono">
                      <span className="text-on-surface-variant">Terpakai: {formatRp(b.used_amount)}</span>
                      <span className="font-bold">{pct}%</span>
                    </div>
                    <div className="w-full h-2 bg-surface-container rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          pct > 90 ? "bg-error" : pct > 75 ? "bg-amber-500" : "bg-primary"
                        }`}
                        style={{ width: `${Math.min(100, pct)}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-xs font-mono pt-1">
                      <span className="text-on-surface-variant">Total: {formatRp(b.total_budget)}</span>
                      <span className="text-accent-green font-bold">Sisa: {formatRp(b.remaining)}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-outline-variant/10">
                  <Link href={`/dashboard/finance/${b.division_id}`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full text-xs font-bold cursor-pointer">
                      Detail & Transaksi
                    </Button>
                  </Link>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setShowAddTx(b.id || b.division_id)}
                    className="text-xs font-bold cursor-pointer text-primary hover:bg-primary/10"
                    title="Tambah transaksi / nota divisi ini"
                  >
                    + Nota
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Budget Requests Table */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold tracking-tight text-on-surface">Pengajuan Dana Kas</h2>
          <span className="text-xs font-mono text-on-surface-variant">{requests.length} pengajuan</span>
        </div>

        <div className="bg-white border border-outline-variant/60 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-surface-container-low border-b border-outline-variant/20">
                  <th className="text-left px-4 py-3 text-xs font-mono font-bold text-on-surface-variant tracking-wider">Tanggal</th>
                  <th className="text-left px-4 py-3 text-xs font-mono font-bold text-on-surface-variant tracking-wider">Divisi</th>
                  <th className="text-left px-4 py-3 text-xs font-mono font-bold text-on-surface-variant tracking-wider">Pengaju</th>
                  <th className="text-left px-4 py-3 text-xs font-mono font-bold text-on-surface-variant tracking-wider">Tujuan</th>
                  <th className="text-right px-4 py-3 text-xs font-mono font-bold text-on-surface-variant tracking-wider">Nominal</th>
                  <th className="text-center px-4 py-3 text-xs font-mono font-bold text-on-surface-variant tracking-wider">Status</th>
                  {isTreasurerOrBPH && (
                    <th className="text-center px-4 py-3 text-xs font-mono font-bold text-on-surface-variant tracking-wider">Aksi</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {requests.length === 0 ? (
                  <tr>
                    <td colSpan={isTreasurerOrBPH ? 7 : 6} className="text-center py-10 text-sm text-on-surface-variant font-mono">
                      Belum ada pengajuan dana.
                    </td>
                  </tr>
                ) : (
                  requests.map((r) => (
                    <tr key={r.id} className="border-b border-outline-variant/10 hover:bg-surface-container/40 transition-colors">
                      <td className="px-4 py-3 text-xs font-mono">
                        {new Date(r.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "short" })}
                      </td>
                      <td className="px-4 py-3 text-xs font-bold font-mono">{r.division_name}</td>
                      <td className="px-4 py-3 text-xs font-mono">{r.requester_name}</td>
                      <td className="px-4 py-3 text-xs font-medium max-w-xs truncate" title={r.purpose}>
                        {r.purpose}
                      </td>
                      <td className="px-4 py-3 text-right text-xs font-bold font-mono text-primary">
                        {formatRp(r.amount)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <Badge
                          variant={r.status === "approved" ? "success" : r.status === "rejected" ? "danger" : "warning"}
                          className="text-[10px] font-mono px-2 py-0.5 uppercase"
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
                                className="p-1 rounded text-accent-green hover:bg-accent-green/10 cursor-pointer"
                                title="Setujui"
                              >
                                <CheckCircle className="size-4" />
                              </button>
                              <button
                                onClick={async () => {
                                  const reason = prompt("Catatan penolakan (opsional):");
                                  await handleBudgetRequest(r.id, "rejected", reason || undefined);
                                }}
                                className="p-1 rounded text-error hover:bg-error/10 cursor-pointer"
                                title="Tolak"
                              >
                                <XCircle className="size-4" />
                              </button>
                            </div>
                          ) : (
                            <span className="text-[10px] font-mono text-on-surface-variant/60">
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
            <Button type="submit" disabled={setBudgetPending} className="cursor-pointer font-bold">
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
              <label className="caption block mb-1 text-on-surface-variant font-bold">Pilih Divisi <span className="text-error">*</span></label>
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
                    className="text-xs text-primary font-bold hover:underline cursor-pointer shrink-0"
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
                  <Upload className="size-6 text-primary" />
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
            <Button type="submit" disabled={addTxPending} className="cursor-pointer font-bold">
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
            <Button type="submit" disabled={createReqPending} className="cursor-pointer font-bold">
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
    </div>
  );
}
