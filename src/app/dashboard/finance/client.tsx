"use client";

import { useActionState, useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { ColorBlock } from "@/components/blocks/color-block";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { setBudget, addTransaction, deleteTransaction, createBudgetRequest, handleBudgetRequest, exportFinanceCSV } from "@/lib/actions/finance";
import { DollarSign, TrendingUp, TrendingDown, FileDown, Plus, Trash2, CheckCircle, XCircle } from "lucide-react";
import type { BudgetWithDivision, BudgetRequestData, FinanceOverview } from "@/lib/data/finance";

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
  const [exporting, setExporting] = useState(false);

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

  const statusColors: Record<string, "warning" | "success" | "danger" | "info"> = {
    pending: "warning",
    approved: "success",
    rejected: "danger",
    disbursed: "info",
  };

  return (
    <div className="flex flex-col gap-section-gap">
      {/* Overview */}
      <ColorBlock color="mint">
        <div className="flex items-center justify-between mb-md">
          <div>
            <p className="eyebrow text-on-surface-variant mb-xs">Keuangan</p>
            <h2 className="text-3xl font-semibold tracking-tight">Overview Anggaran</h2>
          </div>
          <div className="flex gap-sm">
            <Button variant="secondary" onClick={() => setShowRequest(true)}>
              <Plus className="size-4" /> Ajukan Dana
            </Button>
            <Button variant="ghost" onClick={handleExport} disabled={exporting}>
              <FileDown className="size-4" /> {exporting ? "..." : "Export CSV"}
            </Button>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-md">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><DollarSign className="size-4" /> Total Anggaran</CardTitle>
              <CardDescription className="text-2xl font-semibold">{formatRp(overview.total_budget)}</CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><TrendingDown className="size-4 text-error" /> Terpakai</CardTitle>
              <CardDescription className="text-2xl font-semibold">{formatRp(overview.total_used)}</CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><TrendingUp className="size-4 text-emerald-500" /> Sisa</CardTitle>
              <CardDescription className="text-2xl font-semibold">{formatRp(overview.total_remaining)}</CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><FileDown className="size-4" /> Pengajuan</CardTitle>
              <CardDescription className="text-2xl font-semibold">
                {overview.pending_requests}
                <span className="text-sm font-normal text-on-surface-variant ml-1">pending</span>
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </ColorBlock>

      {/* Budget per Division */}
      <ColorBlock color="surface">
        <p className="eyebrow text-on-surface-variant mb-xs">Anggaran per Divisi</p>
        <h3 className="text-2xl font-semibold tracking-tight mb-md">Detail Budget</h3>

        <div className="flex flex-col gap-sm">
          {budgets.map((b) => {
            const pct = b.total_budget > 0 ? Math.round((b.used_amount / b.total_budget) * 100) : 0;
            return (
              <Card key={b.division_id}>
                <CardContent className="flex flex-col gap-sm pt-md">
                  <div className="flex items-center justify-between">
                    <div className="font-semibold text-lg">{b.division_name}</div>
                    <div className="flex items-center gap-sm">
                      <Badge variant={b.remaining > 0 ? "success" : "danger"}>
                        {b.transaction_count} transaksi
                      </Badge>
                      <Button size="sm" variant="secondary" onClick={() => setShowAddTx(b.id)}>
                        <Plus className="size-3" /> Transaksi
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => setShowSetBudget(b.division_id)}>
                        Atur Budget
                      </Button>
                    </div>
                  </div>
                  <div className="flex items-center gap-md text-sm text-on-surface-variant">
                    <span>Budget: {formatRp(b.total_budget)}</span>
                    <span>Terpakai: {formatRp(b.used_amount)}</span>
                    <span>Sisa: <span className={b.remaining >= 0 ? "text-block-mint" : "text-error"}>{formatRp(b.remaining)}</span></span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-surface-container-highest overflow-hidden">
                    <div
                      className="h-full rounded-full bg-primary transition-all"
                      style={{ width: `${Math.min(pct, 100)}%` }}
                    />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </ColorBlock>

      {/* Budget Requests */}
      <ColorBlock color="lilac">
        <p className="eyebrow text-on-surface-variant mb-xs">Pengajuan Dana</p>
        <h3 className="text-2xl font-semibold tracking-tight mb-md">Daftar Pengajuan</h3>

        <div className="flex flex-col gap-sm">
          {requests.length === 0 && (
            <p className="text-on-surface-variant">Belum ada pengajuan dana.</p>
          )}
          {requests.map((r) => (
            <Card key={r.id}>
              <CardContent className="flex items-center justify-between pt-md">
                <div>
                  <div className="flex items-center gap-sm">
                    <span className="font-semibold">{formatRp(r.amount)}</span>
                    <Badge variant={statusColors[r.status] ?? "info"}>{r.status}</Badge>
                  </div>
                  <p className="text-sm text-on-surface-variant mt-1">{r.purpose}</p>
                  <p className="caption text-on-surface-variant mt-1">
                    {r.division_name} — {r.requester_name}
                    {r.handler_name && ` → ${r.handler_name}`}
                  </p>
                </div>
                {r.status === "pending" && (
                  <div className="flex gap-xs">
                    <form
                      action={async () => {
                        await handleBudgetRequest(r.id, "approved", "");
                      }}
                    >
                      <Button size="sm" variant="secondary" type="submit">
                        <CheckCircle className="size-3" /> Setujui
                      </Button>
                    </form>
                    <form
                      action={async () => {
                        const notes = prompt("Alasan penolakan (opsional):");
                        await handleBudgetRequest(r.id, "rejected", notes ?? undefined);
                      }}
                    >
                      <Button size="sm" variant="ghost" type="submit" className="text-red-500">
                        <XCircle className="size-3" /> Tolak
                      </Button>
                    </form>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </ColorBlock>

      {/* Set Budget Modal */}
      <Modal open={!!showSetBudget} onClose={() => setShowSetBudget(null)} title="Atur Anggaran Divisi">
        <form action={setBudgetAction} className="flex flex-col gap-md">
          <input type="hidden" name="division_id" value={showSetBudget ?? ""} />
          <div>
            <label className="caption block mb-xs text-on-surface-variant">Total Anggaran (Rp)</label>
            <Input name="amount" type="number" min="0" required placeholder="1000000" />
          </div>
          <div className="flex gap-sm justify-end">
            <Button type="button" variant="ghost" onClick={() => setShowSetBudget(null)}>Batal</Button>
            <Button type="submit" disabled={setBudgetPending}>
              {setBudgetPending ? "Menyimpan..." : "Simpan"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Add Transaction Modal */}
      <Modal open={!!showAddTx} onClose={() => setShowAddTx(null)} title="Tambah Transaksi">
        <form action={addTxAction} className="flex flex-col gap-md">
          <input type="hidden" name="budget_id" value={showAddTx ?? ""} />
          <div>
            <label className="caption block mb-xs text-on-surface-variant">Tipe</label>
            <select name="type" className="flex h-11 w-full rounded-md border border-primary bg-surface-bright px-4 py-2 text-base font-sans text-on-surface focus:border-accent-magenta focus:outline-none" required>
              <option value="income">Pemasukan</option>
              <option value="expense">Pengeluaran</option>
            </select>
          </div>
          <div>
            <label className="caption block mb-xs text-on-surface-variant">Jumlah (Rp)</label>
            <Input name="amount" type="number" min="1" required />
          </div>
          <div>
            <label className="caption block mb-xs text-on-surface-variant">Deskripsi</label>
            <Input name="description" required />
          </div>
          <div>
            <label className="caption block mb-xs text-on-surface-variant">Kategori (opsional)</label>
            <Input name="category" placeholder="contoh: ATK, Konsumsi, Transport" />
          </div>
          <div className="flex gap-sm justify-end">
            <Button type="button" variant="ghost" onClick={() => setShowAddTx(null)}>Batal</Button>
            <Button type="submit" disabled={addTxPending}>
              {addTxPending ? "Menyimpan..." : "Tambah Transaksi"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Budget Request Modal */}
      <Modal open={showRequest} onClose={() => setShowRequest(false)} title="Ajukan Dana">
        <form action={createReqAction} className="flex flex-col gap-md">
          <div>
            <label className="caption block mb-xs text-on-surface-variant">Divisi</label>
            <select name="division_id" className="flex h-11 w-full rounded-md border border-primary bg-surface-bright px-4 py-2 text-base font-sans text-on-surface focus:border-accent-magenta focus:outline-none" required>
              <option value="">Pilih divisi</option>
              {[...new Set(budgets.map((b) => b.division_id))].map((id) => {
                const div = budgets.find((b) => b.division_id === id);
                return <option key={id} value={id}>{div?.division_name}</option>;
              })}
            </select>
          </div>
          <div>
            <label className="caption block mb-xs text-on-surface-variant">Jumlah (Rp)</label>
            <Input name="amount" type="number" min="1" required />
          </div>
          <div>
            <label className="caption block mb-xs text-on-surface-variant">Keperluan</label>
            <textarea
              name="purpose"
              className="flex min-h-[100px] w-full rounded-md border border-primary bg-surface-bright px-4 py-2 text-base font-sans text-on-surface focus:border-accent-magenta focus:outline-none"
              required
            />
          </div>
          <div className="flex gap-sm justify-end">
            <Button type="button" variant="ghost" onClick={() => setShowRequest(false)}>Batal</Button>
            <Button type="submit" disabled={createReqPending}>
              {createReqPending ? "Mengajukan..." : "Ajukan"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
