"use client";

import { useActionState, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import {
  addTransaction,
  updateTransaction,
  deleteTransaction,
  syncAllToAppsScript,
  uploadReceiptToDriveAction,
  addRabItem,
  updateRabItem,
  deleteRabItem,
} from "@/lib/actions/finance";
import {
  BookOpen,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Plus,
  Receipt,
  FileText,
  Upload,
  ExternalLink,
  Eye,
  Loader2,
  Share2,
  RefreshCw,
  Pencil,
  Trash2,
  Search,
  CheckCircle,
  AlertCircle,
  ArrowUpRight,
  Calculator,
  PieChart,
  ListFilter,
  Zap,
  Sparkles,
  Check,
  X,
  Percent,
  ChevronRight,
  ArrowRight,
  HandCoins,
  Utensils,
  Printer,
  Car,
  Mic,
  Ticket,
} from "lucide-react";
import type {
  BudgetWithDivision,
  BudgetRequestData,
  FinanceOverview,
  AllTransactionData,
  RabItemData,
} from "@/lib/data/finance";

const CATEGORY_OPTIONS = [
  { value: "", label: "Pilih kategori..." },
  { value: "kas_awal", label: "Kas Awal Kepanitiaan" },
  { value: "sponsorship", label: "Sponsorship & Mitra" },
  { value: "registrasi_peserta", label: "Biaya Registrasi Lomba" },
  { value: "dana_usaha", label: "Hasil Dana Usaha (Danus)" },
  { value: "ATK", label: "ATK (Alat Tulis Kantor)" },
  { value: "konsumsi", label: "Konsumsi & Rapat" },
  { value: "transport", label: "Transportasi & Operasional" },
  { value: "dokumentasi", label: "Dokumentasi & Media" },
  { value: "dekorasi", label: "Dekorasi & Panggung" },
  { value: "cetak", label: "Cetak, Banner & Spanduk" },
  { value: "sewa", label: "Sewa Tempat & Peralatan" },
  { value: "honor", label: "Honorarium Pemateri/Juri" },
  { value: "publikasi", label: "Publikasi & Promosi" },
  { value: "logistik", label: "Logistik & Perlengkapan" },
  { value: "lainnya", label: "Lain-Lain" },
];

const EXPRESS_PRESETS = [
  { label: "Sponsorship", iconName: "HandCoins", type: "income", category: "sponsorship", defaultDesc: "Pemasukan dana sponsor " },
  { label: "Konsumsi Rapat", iconName: "Utensils", type: "expense", category: "konsumsi", defaultDesc: "Konsumsi panitia & rapat " },
  { label: "Cetak & Banner", iconName: "Printer", type: "expense", category: "cetak", defaultDesc: "Cetak banner & spanduk " },
  { label: "Transportasi", iconName: "Car", type: "expense", category: "transport", defaultDesc: "Operasional transportasi " },
  { label: "Sewa Sound/Alat", iconName: "Mic", type: "expense", category: "sewa", defaultDesc: "Sewa perlengkapan & panggung " },
  { label: "Hasil Danus", iconName: "Ticket", type: "income", category: "dana_usaha", defaultDesc: "Hasil jualan Danus " },
];

function ExpressPresetIcon({ name, className }: { name: string; className?: string }) {
  switch (name) {
    case "HandCoins":
      return <HandCoins className={className} />;
    case "Utensils":
      return <Utensils className={className} />;
    case "Printer":
      return <Printer className={className} />;
    case "Car":
      return <Car className={className} />;
    case "Mic":
      return <Mic className={className} />;
    case "Ticket":
      return <Ticket className={className} />;
    default:
      return <Zap className={className} />;
  }
}

function formatRp(n: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(n);
}

export function TreasurerBookClient({
  overview,
  budgets,
  requests,
  allTransactions = [],
  rabItems = [],
  userAssignmentId = "",
  userDivisionId = "",
}: {
  overview: FinanceOverview;
  budgets: BudgetWithDivision[];
  requests: BudgetRequestData[];
  allTransactions?: AllTransactionData[];
  rabItems?: RabItemData[];
  userAssignmentId?: string;
  userDivisionId?: string;
}) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"kas" | "rab">("kas");

  const [showAddTxModal, setShowAddTxModal] = useState(false);
  const [showEditTxModal, setShowEditTxModal] = useState<AllTransactionData | null>(null);
  const [showPreviewUrl, setShowPreviewUrl] = useState<string | null>(null);
  const [showAppsScriptModal, setShowAppsScriptModal] = useState(false);

  const [showAddRabModal, setShowAddRabModal] = useState(false);
  const [showEditRabModal, setShowEditRabModal] = useState<RabItemData | null>(null);

  const [txSearch, setTxSearch] = useState("");
  const [txTypeFilter, setTxTypeFilter] = useState("all");
  const [txDivFilter, setTxDivFilter] = useState("all");

  const [rabSearch, setRabSearch] = useState("");
  const [rabDivFilter, setRabDivFilter] = useState("all");

  const [uploading, setUploading] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState<string>("");
  const [actionMsg, setActionMsg] = useState<string | null>(null);

  const [appsScriptUrlInput, setAppsScriptUrlInput] = useState("");
  const [syncingAppsScript, setSyncingAppsScript] = useState(false);
  const [syncStatusMsg, setSyncStatusMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Inline Cell Editing State
  const [editingTxCell, setEditingTxCell] = useState<{ id: string; field: string } | null>(null);
  const [cellValue, setCellValue] = useState<string>("");

  // Express Quick Entry State
  const [expressPreset, setExpressPreset] = useState<typeof EXPRESS_PRESETS[0] | null>(null);
  const [expressAmount, setExpressAmount] = useState("");
  const [expressDesc, setExpressDesc] = useState("");
  const [expressDivId, setExpressDivId] = useState(userDivisionId || (budgets[0]?.division_id ?? ""));
  const [expressSubmitting, setExpressSubmitting] = useState(false);

  // Mini Calculator State
  const [calcDisplay, setCalcDisplay] = useState("0");
  const [calcMemory, setCalcMemory] = useState<number | null>(null);
  const [calcOp, setCalcOp] = useState<string | null>(null);

  const [, addTxAction, addTxPending] = useActionState(addTransaction, null);
  const [, updateTxAction, updateTxPending] = useActionState(updateTransaction, null);
  const [, addRabAction, addRabPending] = useActionState(addRabItem, null);
  const [, updateRabAction, updateRabPending] = useActionState(updateRabItem, null);

  const totalIncome = allTransactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = allTransactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  const currentBalance = totalIncome - totalExpense;
  const incomePercent = totalIncome + totalExpense > 0 ? Math.round((totalIncome / (totalIncome + totalExpense)) * 100) : 50;

  const totalRabEstimated = rabItems.reduce((sum, r) => sum + r.total_estimated, 0);
  const rabVsExpenseDiff = totalRabEstimated - totalExpense;

  async function handleDeleteRab(id: string) {
    if (!confirm("Hapus rincian item RAB ini?")) return;
    const result = await deleteRabItem(id);
    if (result?.error) {
      setActionMsg(result.error);
    } else {
      router.refresh();
    }
  }

  async function handleDeleteTx(id: string) {
    if (!confirm("Hapus catatan transaksi ini dari pembukuan Bendahara?")) return;
    const result = await deleteTransaction(id);
    if (result?.error) {
      setActionMsg(result.error);
    } else {
      router.refresh();
    }
  }

  async function handleFileUpload(file: File, divName?: string) {
    if (file.size > 90 * 1024 * 1024) {
      setActionMsg("Ukuran file maksimal 90MB.");
      return;
    }
    setUploading(true);
    setActionMsg(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("division_name", divName || "UMUM");

      const driveRes = await uploadReceiptToDriveAction(fd);
      if (driveRes.success && driveRes.fileUrl) {
        setUploadedUrl(driveRes.fileUrl);
      } else {
        const res = await fetch("/api/upload", { method: "POST", body: fd });
        const json = (await res.json()) as any;
        if (!res.ok || json.error) throw new Error(json.error || "Gagal mengunggah");
        setUploadedUrl(json.url);
      }
    } catch (e: any) {
      setActionMsg(e.message || "Gagal mengunggah file");
    } finally {
      setUploading(false);
    }
  }

  async function handleSyncToSpreadsheet() {
    setSyncingAppsScript(true);
    setActionMsg(null);
    try {
      const res = await syncAllToAppsScript();
      if (res.error) {
        setActionMsg("Gagal sinkronisasi: " + res.error);
      } else {
        setActionMsg("✓ Seluruh data kas & transaksi berhasil disinkronkan ke Google Sheets!");
      }
    } catch (err: any) {
      setActionMsg("Gagal terhubung ke Google Sheets: " + (err.message || "Error"));
    } finally {
      setSyncingAppsScript(false);
    }
  }

  // Quick Express Submission Handler
  async function handleExpressSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!expressPreset || !expressAmount || !expressDesc) return;
    setExpressSubmitting(true);
    setActionMsg(null);
    try {
      const fd = new FormData();
      fd.append("division_id", expressDivId || budgets[0]?.division_id || "");
      fd.append("type", expressPreset.type);
      fd.append("amount", expressAmount);
      fd.append("category", expressPreset.category);
      fd.append("description", expressDesc);
      fd.append("transaction_date", new Date().toISOString().slice(0, 10));

      const res = await addTransaction(null, fd);
      if (res?.error) throw new Error(res.error);
      setExpressPreset(null);
      setExpressAmount("");
      setExpressDesc("");
      router.refresh();
    } catch (err: any) {
      setActionMsg(err.message || "Gagal menambah transaksi ekspres");
    } finally {
      setExpressSubmitting(false);
    }
  }

  // Live Inline Cell Editing Handler
  async function handleSaveInlineTx(tx: AllTransactionData, field: string, newValue: string) {
    setEditingTxCell(null);
    if (String((tx as any)[field]) === newValue) return;

    const fd = new FormData();
    fd.append("id", tx.id);
    fd.append("type", field === "type" ? newValue : tx.type);
    fd.append("amount", field === "amount" ? newValue : String(tx.amount));
    fd.append("category", field === "category" ? newValue : tx.category || "");
    fd.append("description", field === "description" ? newValue : tx.description);
    fd.append("transaction_date", tx.transaction_date.slice(0, 10));
    fd.append("receipt_number", field === "receipt_number" ? newValue : tx.receipt_number || "");
    fd.append("attachment_url", tx.attachment_url || "");

    const res = await updateTransaction(null, fd);
    if (res?.error) {
      setActionMsg(res.error);
    } else {
      router.refresh();
    }
  }

  // Mini Calculator Handlers
  function handleCalcNum(digit: string) {
    if (calcDisplay === "0" || calcOp === "=") {
      setCalcDisplay(digit);
      if (calcOp === "=") setCalcOp(null);
    } else {
      setCalcDisplay(calcDisplay + digit);
    }
  }

  function handleCalcOp(op: string) {
    const num = parseFloat(calcDisplay);
    if (calcMemory === null) {
      setCalcMemory(num);
    } else if (calcOp) {
      let res = calcMemory;
      if (calcOp === "+") res += num;
      if (calcOp === "-") res -= num;
      if (calcOp === "*") res *= num;
      if (calcOp === "/") res = num !== 0 ? res / num : 0;
      setCalcMemory(res);
      setCalcDisplay(String(res));
    }
    setCalcOp(op);
  }

  function handleCalcEquals() {
    if (calcMemory !== null && calcOp) {
      const num = parseFloat(calcDisplay);
      let res = calcMemory;
      if (calcOp === "+") res += num;
      if (calcOp === "-") res -= num;
      if (calcOp === "*") res *= num;
      if (calcOp === "/") res = num !== 0 ? res / num : 0;
      setCalcDisplay(String(res));
      setCalcMemory(null);
      setCalcOp("=");
    }
  }

  function handleCalcClear() {
    setCalcDisplay("0");
    setCalcMemory(null);
    setCalcOp(null);
  }

  const filteredTransactions = allTransactions.filter((tx) => {
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

  return (
    <div className="w-full flex flex-col gap-6 md:gap-8">
      {/* Header — Section 3 DESIGN.md Eyebrow + H1 Pattern */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-accent-magenta flex items-center gap-1.5">
            <BookOpen className="size-3.5" /> PEMBUKUAN BENDAHARA PRIBADI & KAS PANITIA
          </span>
          <h1 className="font-extrabold text-3xl md:text-4xl tracking-tight text-on-surface">
            Interactive Financial Grid & Workspace
          </h1>
        </div>

        <div className="flex items-center gap-3 shrink-0 flex-wrap">
          <Button
            onClick={() => setShowAddTxModal(true)}
            className="cursor-pointer font-bold bg-[#04000D] text-white hover:bg-black text-xs px-4 py-2.5 rounded-xl shadow-sm transition-all flex items-center gap-2"
          >
            <Plus className="size-4" /> Catat Transaksi Kas
          </Button>

          <Button
            variant="outline"
            disabled={syncingAppsScript}
            onClick={handleSyncToSpreadsheet}
            className="cursor-pointer text-xs font-bold rounded-xl border-emerald-300 bg-emerald-50 text-emerald-900 hover:bg-emerald-700 hover:text-white transition-all flex items-center gap-2 group disabled:opacity-60"
          >
            {syncingAppsScript ? (
              <>
                <Loader2 className="size-4 text-emerald-600 animate-spin" />
                Menyinkronkan...
              </>
            ) : (
              <>
                <RefreshCw className="size-4 text-emerald-600 group-hover:text-emerald-200 transition-colors" />
                Sinkron ke Google sheets
              </>
            )}
          </Button>
        </div>
      </div>

      {actionMsg && (
        <div
          className={`text-xs font-sans rounded-2xl p-4 border shadow-sm flex items-center justify-between gap-3 transition-all ${
            actionMsg.startsWith("✓") || actionMsg.toLowerCase().includes("berhasil")
              ? "bg-emerald-50 text-emerald-950 border-emerald-300"
              : "bg-rose-50 text-rose-950 border-rose-300"
          }`}
        >
          <div className="flex items-center gap-2.5">
            {actionMsg.startsWith("✓") || actionMsg.toLowerCase().includes("berhasil") ? (
              <CheckCircle className="size-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="size-4 text-rose-600 shrink-0" />
            )}
            <span className="font-semibold text-xs md:text-sm">{actionMsg.replace(/^✓\s*/, "")}</span>
          </div>
          <button
            onClick={() => setActionMsg(null)}
            className={`p-1 rounded-lg transition-colors cursor-pointer ${
              actionMsg.startsWith("✓") || actionMsg.toLowerCase().includes("berhasil")
                ? "text-emerald-700 hover:bg-emerald-200/60"
                : "text-rose-700 hover:bg-rose-200/60"
            }`}
          >
            <X className="size-4" />
          </button>
        </div>
      )}

      {/* Express Category Preset Chips */}
      <div className="bg-white border border-[#04000D]/5 shadow-[0_8px_30px_rgb(0,0,0,0.015)] rounded-2xl p-4 md:p-5">
        <div className="flex items-center justify-between gap-2 mb-3">
          <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-on-surface-variant flex items-center gap-1.5">
            <Zap className="size-3.5 text-accent-magenta" /> POS KAS EXPRESS (1-KLIK INPUT CEPAT)
          </p>
          <span className="text-[11px] font-mono text-on-surface-variant/60">Pilih preset untuk entri instan</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          {EXPRESS_PRESETS.map((preset, idx) => {
            const isSelected = expressPreset?.label === preset.label;
            return (
              <button
                key={idx}
                onClick={() => {
                  setExpressPreset(preset);
                  setExpressDesc(preset.defaultDesc);
                  setExpressAmount("");
                }}
                className={`flex items-center gap-2.5 p-3 rounded-xl border text-left cursor-pointer transition-all ${
                  isSelected
                    ? "border-[#04000D] bg-[#04000D] text-white shadow-md scale-[1.02]"
                    : "border-[#04000D]/10 bg-slate-50/70 hover:bg-white hover:border-[#04000D]/30 text-on-surface"
                }`}
              >
                <div className={`p-2 rounded-lg shrink-0 flex items-center justify-center ${isSelected ? "bg-white/15 text-white" : "bg-slate-200/60 text-slate-700"}`}>
                  <ExpressPresetIcon name={preset.iconName} className="size-4" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="font-bold text-xs truncate">{preset.label}</span>
                  <span
                    className={`text-[9px] font-mono font-semibold ${
                      isSelected
                        ? "text-slate-300"
                        : preset.type === "income"
                        ? "text-emerald-700"
                        : "text-accent-magenta"
                    }`}
                  >
                    {preset.type === "income" ? "+ Pemasukan" : "- Pengeluaran"}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Express Quick Input Bar Dropdown */}
        {expressPreset && (
          <form
            onSubmit={handleExpressSubmit}
            className="mt-4 p-4 rounded-xl border border-accent-magenta/30 bg-accent-magenta/5 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 animate-in fade-in slide-in-from-top-2"
          >
            <div className="flex items-center gap-2 shrink-0">
              <ExpressPresetIcon name={expressPreset.iconName} className="size-5 text-accent-magenta shrink-0" />
              <Badge variant={expressPreset.type === "income" ? "success" : "danger"} className="font-mono text-[9px] uppercase">
                {expressPreset.label} ({expressPreset.type === "income" ? "+" : "-"})
              </Badge>
            </div>

            <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-2">
              <select
                value={expressDivId}
                onChange={(e) => setExpressDivId(e.target.value)}
                className="h-10 text-xs rounded-lg border border-[#04000D]/15 bg-white px-3 font-medium cursor-pointer"
                required
              >
                {budgets.map((b) => (
                  <option key={b.division_id} value={b.division_id}>
                    {b.division_name}
                  </option>
                ))}
              </select>

              <Input
                value={expressDesc}
                onChange={(e) => setExpressDesc(e.target.value)}
                placeholder="Deskripsi transaksi ekspres..."
                className="h-10 text-xs bg-white"
                required
              />

              <Input
                type="number"
                min="1"
                value={expressAmount}
                onChange={(e) => setExpressAmount(e.target.value)}
                placeholder="Nominal (Rp)..."
                className="h-10 text-xs font-mono font-bold bg-white"
                required
              />
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Button
                type="submit"
                disabled={expressSubmitting}
                className="cursor-pointer font-bold bg-[#04000D] text-white hover:bg-black text-xs px-4 h-10 rounded-xl"
              >
                {expressSubmitting ? <Loader2 className="size-3.5 animate-spin" /> : "Simpan Instan"}
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => setExpressPreset(null)}
                className="cursor-pointer text-xs h-10 px-3"
              >
                Batal
              </Button>
            </div>
          </form>
        )}
      </div>

      {/* Main Workspace Layout: Full Width Interactive Grid */}
      <div className="w-full flex flex-col gap-6">
        <div className="w-full flex flex-col gap-6">
          {/* Workspace Tab Switcher */}
          <div className="flex items-center gap-2 border-b border-[#04000D]/5 pb-1">
            <button
              onClick={() => setActiveTab("kas")}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-mono text-xs font-bold transition-all cursor-pointer ${
                activeTab === "kas"
                  ? "bg-[#04000D] text-white shadow-sm"
                  : "text-on-surface-variant hover:bg-slate-100 bg-white border border-[#04000D]/5"
              }`}
            >
              <Receipt className="size-4" /> Live Kas Spreadsheet Grid ({allTransactions.length})
            </button>
            <button
              onClick={() => setActiveTab("rab")}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-mono text-xs font-bold transition-all cursor-pointer ${
                activeTab === "rab"
                  ? "bg-[#04000D] text-white shadow-sm"
                  : "text-on-surface-variant hover:bg-slate-100 bg-white border border-[#04000D]/5"
              }`}
            >
              <Calculator className="size-4" /> Live RAB Grid ({rabItems.length})
            </button>
          </div>

          {/* View 1: Live Kas Spreadsheet Grid */}
          {activeTab === "kas" && (
            <div className="bg-white border border-[#04000D]/5 shadow-[0_8px_30px_rgb(0,0,0,0.015)] rounded-2xl p-5 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#04000D]/5 pb-4 mb-5">
                <div>
                  <h2 className="font-extrabold text-xl text-on-surface flex items-center gap-2">
                    <Receipt className="size-5 text-accent-magenta" /> Interactive Kas Spreadsheet Grid
                  </h2>
                  <p className="text-xs font-medium text-on-surface-variant/70 mt-1">
                    Klik sel manapun pada tabel di bawah untuk langsung mengedit nilai tanpa modal!
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    onClick={() => setShowAddTxModal(true)}
                    className="cursor-pointer font-bold bg-[#04000D] text-white hover:bg-black text-xs px-3.5 py-2 rounded-xl"
                  >
                    <Plus className="size-3.5" /> Baris Baru
                  </Button>
                </div>
              </div>

              {/* Filters & Search */}
              <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="size-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/50" />
                  <input
                    type="text"
                    value={txSearch}
                    onChange={(e) => setTxSearch(e.target.value)}
                    placeholder="Filter sel deskripsi, nota, divisi..."
                    className="w-full h-9 pl-9 pr-3 text-xs rounded-lg border border-[#04000D]/10 bg-slate-50/60 focus:bg-white focus:outline-none focus:border-[#04000D]/30 transition-all"
                  />
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <select
                    value={txTypeFilter}
                    onChange={(e) => setTxTypeFilter(e.target.value)}
                    className="h-9 text-xs rounded-lg border border-[#04000D]/10 bg-white px-3 font-mono cursor-pointer"
                  >
                    <option value="all">Semua Arus Kas</option>
                    <option value="income">Pemasukan (+)</option>
                    <option value="expense">Pengeluaran (-)</option>
                  </select>

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
                </div>
              </div>

              {/* Live Interactive Grid Table */}
              <div className="border border-[#04000D]/10 rounded-xl overflow-hidden shadow-inner">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm border-collapse">
                    <thead>
                      <tr className="bg-slate-100/90 border-b border-[#04000D]/10 font-mono text-[10px] uppercase font-bold text-on-surface-variant/70">
                        <th className="text-left px-3 py-2.5 border-r border-[#04000D]/5">Tgl</th>
                        <th className="text-left px-3 py-2.5 border-r border-[#04000D]/5">Divisi</th>
                        <th className="text-left px-3 py-2.5 border-r border-[#04000D]/5">Tipe</th>
                        <th className="text-left px-3 py-2.5 border-r border-[#04000D]/5">Kategori</th>
                        <th className="text-left px-3 py-2.5 border-r border-[#04000D]/5 min-w-[180px]">Deskripsi (Live Edit)</th>
                        <th className="text-right px-3 py-2.5 border-r border-[#04000D]/5 min-w-[120px]">Nominal (Live Edit)</th>
                        <th className="text-left px-3 py-2.5 border-r border-[#04000D]/5">No. Nota</th>
                        <th className="text-center px-3 py-2.5">Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredTransactions.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="text-center py-12 font-mono text-xs text-on-surface-variant/60">
                            Belum ada baris transaksi. Klik + Baris Baru untuk entri pertama.
                          </td>
                        </tr>
                      ) : (
                        filteredTransactions.map((tx) => (
                          <tr key={tx.id} className="border-b border-[#04000D]/5 hover:bg-slate-50 transition-colors group">
                            {/* Date Cell */}
                            <td className="px-3 py-2 border-r border-[#04000D]/5 font-mono text-xs text-on-surface-variant shrink-0">
                              {new Date(tx.transaction_date).toLocaleDateString("id-ID", {
                                day: "numeric",
                                month: "short",
                              })}
                            </td>

                            {/* Division Cell */}
                            <td className="px-3 py-2 border-r border-[#04000D]/5 font-mono text-xs font-bold text-on-surface">
                              {tx.division_name}
                            </td>

                            {/* Type Cell (Interactive Select) */}
                            <td className="px-3 py-2 border-r border-[#04000D]/5">
                              <select
                                value={tx.type}
                                onChange={(e) => handleSaveInlineTx(tx, "type", e.target.value)}
                                className="text-[10px] font-mono font-bold uppercase rounded px-1.5 py-0.5 bg-transparent cursor-pointer hover:bg-slate-100 focus:outline-none"
                              >
                                <option value="expense">Pengeluaran (-)</option>
                                <option value="income">Pemasukan (+)</option>
                              </select>
                            </td>

                            {/* Category Cell */}
                            <td className="px-3 py-2 border-r border-[#04000D]/5 font-mono text-xs text-on-surface-variant">
                              {tx.category || "-"}
                            </td>

                            {/* Live Editable Description Cell */}
                            <td
                              onClick={() => {
                                setEditingTxCell({ id: tx.id, field: "description" });
                                setCellValue(tx.description);
                              }}
                              className="px-3 py-2 border-r border-[#04000D]/5 text-xs font-medium cursor-pointer hover:bg-amber-50/70 transition-colors"
                              title="Klik untuk mengedit deskripsi"
                            >
                              {editingTxCell?.id === tx.id && editingTxCell.field === "description" ? (
                                <input
                                  type="text"
                                  autoFocus
                                  value={cellValue}
                                  onChange={(e) => setCellValue(e.target.value)}
                                  onBlur={() => handleSaveInlineTx(tx, "description", cellValue)}
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter") handleSaveInlineTx(tx, "description", cellValue);
                                    if (e.key === "Escape") setEditingTxCell(null);
                                  }}
                                  className="w-full h-7 text-xs px-1.5 border border-accent-magenta rounded bg-white font-medium focus:outline-none"
                                />
                              ) : (
                                <span className="flex items-center justify-between gap-1">
                                  <span className="truncate max-w-[200px]">{tx.description}</span>
                                  <Pencil className="size-3 opacity-0 group-hover:opacity-40 text-on-surface-variant" />
                                </span>
                              )}
                            </td>

                            {/* Live Editable Amount Cell */}
                            <td
                              onClick={() => {
                                setEditingTxCell({ id: tx.id, field: "amount" });
                                setCellValue(String(tx.amount));
                              }}
                              className="px-3 py-2 border-r border-[#04000D]/5 text-right font-mono text-xs font-extrabold cursor-pointer hover:bg-amber-50/70 transition-colors"
                              title="Klik untuk mengedit nominal"
                            >
                              {editingTxCell?.id === tx.id && editingTxCell.field === "amount" ? (
                                <input
                                  type="number"
                                  autoFocus
                                  value={cellValue}
                                  onChange={(e) => setCellValue(e.target.value)}
                                  onBlur={() => handleSaveInlineTx(tx, "amount", cellValue)}
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter") handleSaveInlineTx(tx, "amount", cellValue);
                                    if (e.key === "Escape") setEditingTxCell(null);
                                  }}
                                  className="w-full h-7 text-xs px-1.5 border border-accent-magenta rounded bg-white font-mono font-bold text-right focus:outline-none"
                                />
                              ) : (
                                <span className={`flex items-center justify-end gap-1 ${tx.type === "expense" ? "text-error" : "text-emerald-700"}`}>
                                  <span>{tx.type === "expense" ? "-" : "+"}{formatRp(tx.amount)}</span>
                                  <Pencil className="size-3 opacity-0 group-hover:opacity-40" />
                                </span>
                              )}
                            </td>

                            {/* Receipt Cell */}
                            <td className="px-3 py-2 border-r border-[#04000D]/5 font-mono text-xs text-on-surface-variant">
                              {tx.receipt_number || "-"}
                            </td>

                            {/* Actions Cell */}
                            <td className="px-3 py-2 text-center">
                              <div className="flex items-center justify-center gap-1">
                                {tx.attachment_url && (
                                  <button
                                    onClick={() => setShowPreviewUrl(tx.attachment_url!)}
                                    className="p-1 text-accent-magenta hover:bg-accent-magenta/10 rounded cursor-pointer"
                                    title="Pratinjau Struk"
                                  >
                                    <Eye className="size-3.5" />
                                  </button>
                                )}
                                <button
                                  onClick={() => handleDeleteTx(tx.id)}
                                  className="p-1 text-error hover:bg-error/10 rounded cursor-pointer"
                                  title="Hapus Baris"
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

                {/* Direct Inline Add Row Button at Bottom of Spreadsheet Table */}
                <button
                  onClick={() => setShowAddTxModal(true)}
                  className="w-full py-3 bg-slate-50 hover:bg-slate-100 border-t border-[#04000D]/10 font-mono text-xs font-bold text-on-surface-variant hover:text-on-surface flex items-center justify-center gap-2 cursor-pointer transition-colors"
                >
                  <Plus className="size-4 text-accent-magenta" /> + Tambah Baris Transaksi Kas Baru
                </button>
              </div>
            </div>
          )}

          {/* View 2: Live RAB Grid */}
          {activeTab === "rab" && (
            <div className="bg-white border border-[#04000D]/5 shadow-[0_8px_30px_rgb(0,0,0,0.015)] rounded-2xl p-5 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#04000D]/5 pb-4 mb-5">
                <div>
                  <h2 className="font-extrabold text-xl text-on-surface flex items-center gap-2">
                    <Calculator className="size-5 text-accent-magenta" /> Interactive RAB Grid Table
                  </h2>
                  <p className="text-xs font-medium text-on-surface-variant/70 mt-1">
                    Kelola alokasi perencanaan biaya (RAB) per divisi secara langsung di spreadsheet grid
                  </p>
                </div>

                <Button
                  onClick={() => setShowAddRabModal(true)}
                  className="cursor-pointer font-bold bg-[#04000D] text-white hover:bg-black text-xs px-3.5 py-2 rounded-xl"
                >
                  <Plus className="size-3.5" /> Tambah Item RAB
                </Button>
              </div>

              {/* RAB Grid Table */}
              <div className="border border-[#04000D]/10 rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm border-collapse">
                    <thead>
                      <tr className="bg-slate-100/90 border-b border-[#04000D]/10 font-mono text-[10px] uppercase font-bold text-on-surface-variant/70">
                        <th className="text-left px-3 py-2.5 border-r border-[#04000D]/5">Item RAB</th>
                        <th className="text-left px-3 py-2.5 border-r border-[#04000D]/5">Divisi</th>
                        <th className="text-center px-3 py-2.5 border-r border-[#04000D]/5">Vol x Satuan</th>
                        <th className="text-right px-3 py-2.5 border-r border-[#04000D]/5">Harga Satuan</th>
                        <th className="text-right px-3 py-2.5 border-r border-[#04000D]/5">Total RAB</th>
                        <th className="text-left px-3 py-2.5 border-r border-[#04000D]/5">Status</th>
                        <th className="text-center px-3 py-2.5">Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rabItems.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="text-center py-12 font-mono text-xs text-on-surface-variant/60">
                            Belum ada baris RAB terdaftar.
                          </td>
                        </tr>
                      ) : (
                        rabItems.map((r) => (
                          <tr key={r.id} className="border-b border-[#04000D]/5 hover:bg-slate-50 transition-colors">
                            <td className="px-3 py-2 border-r border-[#04000D]/5 font-extrabold text-xs text-on-surface">
                              {r.item_name}
                            </td>
                            <td className="px-3 py-2 border-r border-[#04000D]/5 font-mono text-xs font-bold text-on-surface">
                              {r.division_name}
                            </td>
                            <td className="px-3 py-2 border-r border-[#04000D]/5 text-center font-mono text-xs font-bold">
                              {r.quantity} {r.unit}
                            </td>
                            <td className="px-3 py-2 border-r border-[#04000D]/5 text-right font-mono text-xs text-on-surface">
                              {formatRp(r.unit_price)}
                            </td>
                            <td className="px-3 py-2 border-r border-[#04000D]/5 text-right font-mono text-xs font-extrabold text-on-surface">
                              {formatRp(r.total_estimated)}
                            </td>
                            <td className="px-3 py-2 border-r border-[#04000D]/5">
                              <Badge
                                variant={r.status === "realized" ? "success" : r.status === "approved" ? "default" : "warning"}
                                className="font-mono text-[9px] px-2 py-0.5 uppercase"
                              >
                                {r.status === "realized" ? "Terrealisasi" : r.status === "approved" ? "Disetujui" : "Draft"}
                              </Badge>
                            </td>
                            <td className="px-3 py-2 text-center">
                              <div className="flex items-center justify-center gap-1">
                                <button
                                  onClick={() => setShowEditRabModal(r)}
                                  className="p-1 text-on-surface-variant hover:text-on-surface rounded cursor-pointer"
                                >
                                  <Pencil className="size-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDeleteRab(r.id)}
                                  className="p-1 text-error hover:bg-error/10 rounded cursor-pointer"
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

                <button
                  onClick={() => setShowAddRabModal(true)}
                  className="w-full py-3 bg-slate-50 hover:bg-slate-100 border-t border-[#04000D]/10 font-mono text-xs font-bold text-on-surface-variant flex items-center justify-center gap-2 cursor-pointer transition-colors"
                >
                  <Plus className="size-4 text-accent-magenta" /> + Tambah Baris RAB Cepat
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add Transaksi Modal */}
      <Modal open={showAddTxModal} onClose={() => setShowAddTxModal(false)} title="Catat Transaksi Keuangan Kas Bendahara">
        <form action={addTxAction} className="flex flex-col gap-4">
          <div>
            <label className="caption block mb-1 text-on-surface-variant font-bold">Divisi Kepanitiaan <span className="text-error">*</span></label>
            <select
              name="division_id"
              defaultValue={userDivisionId || (budgets[0]?.division_id ?? "")}
              className="flex h-11 w-full rounded-md border border-primary bg-surface-bright px-4 py-2 text-base font-sans text-on-surface focus:outline-none cursor-pointer"
              required
            >
              {budgets.map((b) => (
                <option key={b.division_id} value={b.division_id}>
                  {b.division_name}
                </option>
              ))}
            </select>
          </div>

          <input type="hidden" name="attachment_url" value={uploadedUrl} />

          <div>
            <label className="caption block mb-1 text-on-surface-variant font-bold">Tipe Arus Kas <span className="text-error">*</span></label>
            <select
              name="type"
              className="flex h-11 w-full rounded-md border border-primary bg-surface-bright px-4 py-2 text-base font-sans text-on-surface focus:outline-none cursor-pointer font-bold"
              required
            >
              <option value="expense">Pengeluaran (-) (Klaim Nota / Pembelian)</option>
              <option value="income">Pemasukan (+) (Sponsor / Danus / Kas Awal)</option>
            </select>
          </div>

          <div>
            <label className="caption block mb-1 text-on-surface-variant font-bold">Nominal (Rp) <span className="text-error">*</span></label>
            <Input name="amount" type="number" min="1" required placeholder="Contoh: 250000" />
          </div>

          <div>
            <label className="caption block mb-1 text-on-surface-variant font-bold">Kategori Transaksi</label>
            <select
              name="category"
              className="flex h-11 w-full rounded-md border border-primary bg-surface-bright px-4 py-2 text-base font-sans text-on-surface focus:outline-none cursor-pointer"
            >
              {CATEGORY_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="caption block mb-1 text-on-surface-variant font-bold">Deskripsi / Keterangan Transaksi <span className="text-error">*</span></label>
            <Input name="description" placeholder="Contoh: Pembelian perlengkapan sound system rapat" required />
          </div>

          <div>
            <label className="caption block mb-1 text-on-surface-variant font-bold">Tanggal Transaksi</label>
            <Input name="transaction_date" type="date" defaultValue={new Date().toISOString().slice(0, 10)} />
          </div>

          <div>
            <label className="caption block mb-1 text-on-surface-variant font-bold">Nomor Kwitansi / Struk Nota</label>
            <Input name="receipt_number" placeholder="Opsional: No. kwitansi / struk" />
          </div>

          <div>
            <label className="caption block mb-1 text-on-surface-variant font-bold">Upload Bukti Struk (Gambar/PDF)</label>
            <div className="border-2 border-dashed border-primary/30 rounded-xl p-4 flex flex-col items-center justify-center gap-2 bg-slate-50/50">
              {uploading ? (
                <div className="flex flex-col items-center gap-2">
                  <Loader2 className="size-6 text-primary animate-spin" />
                  <p className="text-xs font-semibold text-on-surface">Mengunggah bukti...</p>
                </div>
              ) : uploadedUrl ? (
                <div className="flex items-center gap-2 w-full">
                  <Eye className="size-5 text-emerald-600 shrink-0" />
                  <span className="text-xs text-on-surface font-bold truncate flex-1">Bukti Terunggah</span>
                  <button type="button" onClick={() => setShowPreviewUrl(uploadedUrl)} className="text-xs text-accent-magenta font-bold hover:underline cursor-pointer">Pratinjau</button>
                  <button type="button" onClick={() => setUploadedUrl("")} className="text-xs text-error font-bold hover:underline cursor-pointer">Hapus</button>
                </div>
              ) : (
                <>
                  <Upload className="size-6 text-accent-magenta" />
                  <p className="text-xs text-on-surface-variant text-center font-medium">Klik untuk memilih file nota/kwitansi</p>
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png,.webp"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileUpload(file);
                    }}
                    className="text-xs text-on-surface-variant cursor-pointer"
                  />
                </>
              )}
            </div>
          </div>

          <div className="flex gap-2 justify-end mt-2">
            <Button type="button" variant="ghost" onClick={() => setShowAddTxModal(false)} className="cursor-pointer text-xs">
              Batal
            </Button>
            <Button type="submit" disabled={addTxPending} className="cursor-pointer font-bold bg-[#04000D] text-white hover:bg-black text-xs">
              {addTxPending ? "Menyimpan..." : "Simpan Ke Pembukuan Bendahara"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Transaksi Modal */}
      <Modal open={!!showEditTxModal} onClose={() => setShowEditTxModal(null)} title="Edit Data Pembukuan Transaksi">
        {showEditTxModal && (
          <form action={updateTxAction} className="flex flex-col gap-4">
            <input type="hidden" name="id" value={showEditTxModal.id} />
            <input type="hidden" name="attachment_url" value={showEditTxModal.attachment_url || ""} />

            <div>
              <label className="caption block mb-1 text-on-surface-variant font-bold">Tipe Arus Kas</label>
              <select
                name="type"
                defaultValue={showEditTxModal.type}
                className="flex h-11 w-full rounded-md border border-primary bg-surface-bright px-4 py-2 text-base font-sans text-on-surface focus:outline-none cursor-pointer font-bold"
                required
              >
                <option value="expense">Pengeluaran (-) (Expense)</option>
                <option value="income">Pemasukan (+) (Income)</option>
              </select>
            </div>

            <div>
              <label className="caption block mb-1 text-on-surface-variant font-bold">Nominal (Rp) <span className="text-error">*</span></label>
              <Input name="amount" type="number" min="1" defaultValue={showEditTxModal.amount} required />
            </div>

            <div>
              <label className="caption block mb-1 text-on-surface-variant font-bold">Kategori</label>
              <select
                name="category"
                defaultValue={showEditTxModal.category || ""}
                className="flex h-11 w-full rounded-md border border-primary bg-surface-bright px-4 py-2 text-base font-sans text-on-surface focus:outline-none cursor-pointer"
              >
                <option value="">Tanpa Kategori</option>
                {CATEGORY_OPTIONS.filter((c) => c.value).map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="caption block mb-1 text-on-surface-variant font-bold">Deskripsi <span className="text-error">*</span></label>
              <Input name="description" defaultValue={showEditTxModal.description} required />
            </div>

            <div>
              <label className="caption block mb-1 text-on-surface-variant font-bold">Tanggal Transaksi</label>
              <Input name="transaction_date" type="date" defaultValue={showEditTxModal.transaction_date.slice(0, 10)} />
            </div>

            <div>
              <label className="caption block mb-1 text-on-surface-variant font-bold">Nomor Kwitansi / Struk</label>
              <Input name="receipt_number" defaultValue={showEditTxModal.receipt_number || ""} />
            </div>

            <div className="flex gap-2 justify-end mt-2">
              <Button type="button" variant="ghost" onClick={() => setShowEditTxModal(null)} className="cursor-pointer text-xs">
                Batal
              </Button>
              <Button type="submit" disabled={updateTxPending} className="cursor-pointer font-bold bg-[#04000D] text-white hover:bg-black text-xs">
                {updateTxPending ? "Menyimpan..." : "Simpan Perubahan Transaksi"}
              </Button>
            </div>
          </form>
        )}
      </Modal>

      {/* Add RAB Item Modal */}
      <Modal open={showAddRabModal} onClose={() => setShowAddRabModal(false)} title="Tambah Item Rencana Anggaran Biaya (RAB)">
        <form action={addRabAction} className="flex flex-col gap-4">
          <div>
            <label className="caption block mb-1 text-on-surface-variant font-bold">Divisi Kepanitiaan <span className="text-error">*</span></label>
            <select
              name="division_id"
              defaultValue={userDivisionId || (budgets[0]?.division_id ?? "")}
              className="flex h-11 w-full rounded-md border border-primary bg-surface-bright px-4 py-2 text-base font-sans text-on-surface focus:outline-none cursor-pointer"
              required
            >
              {budgets.map((b) => (
                <option key={b.division_id} value={b.division_id}>
                  {b.division_name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="caption block mb-1 text-on-surface-variant font-bold">Nama Item Belanja / RAB <span className="text-error">*</span></label>
            <Input name="item_name" placeholder="Contoh: Sewa Sound System & Lighting 10.000 Watt" required />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="caption block mb-1 text-on-surface-variant font-bold">Kuantitas / Jumlah <span className="text-error">*</span></label>
              <Input name="quantity" type="number" step="any" min="0.1" defaultValue="1" required />
            </div>
            <div>
              <label className="caption block mb-1 text-on-surface-variant font-bold">Satuan <span className="text-error">*</span></label>
              <Input name="unit" placeholder="unit / pax / paket / hari / pcs" defaultValue="unit" required />
            </div>
          </div>

          <div>
            <label className="caption block mb-1 text-on-surface-variant font-bold">Harga Satuan (Rp) <span className="text-error">*</span></label>
            <Input name="unit_price" type="number" min="0" required placeholder="Contoh: 1500000" />
          </div>

          <div>
            <label className="caption block mb-1 text-on-surface-variant font-bold">Kategori Anggaran</label>
            <select
              name="category"
              className="flex h-11 w-full rounded-md border border-primary bg-surface-bright px-4 py-2 text-base font-sans text-on-surface focus:outline-none cursor-pointer"
            >
              {CATEGORY_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="caption block mb-1 text-on-surface-variant font-bold">Status Perencanaan</label>
            <select
              name="status"
              className="flex h-11 w-full rounded-md border border-primary bg-surface-bright px-4 py-2 text-base font-sans text-on-surface focus:outline-none cursor-pointer"
            >
              <option value="draft">Draft (Rencana)</option>
              <option value="approved">Disetujui Bendahara</option>
              <option value="realized">Terrealisasi (Sudah Belanja)</option>
            </select>
          </div>

          <div>
            <label className="caption block mb-1 text-on-surface-variant font-bold">Catatan / Keterangan</label>
            <Input name="notes" placeholder="Opsional: Catatan kebutuhan spesifik" />
          </div>

          <div className="flex gap-2 justify-end mt-2">
            <Button type="button" variant="ghost" onClick={() => setShowAddRabModal(false)} className="cursor-pointer text-xs">
              Batal
            </Button>
            <Button type="submit" disabled={addRabPending} className="cursor-pointer font-bold bg-[#04000D] text-white hover:bg-black text-xs">
              {addRabPending ? "Menyimpan..." : "Simpan Item RAB"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit RAB Item Modal */}
      <Modal open={!!showEditRabModal} onClose={() => setShowEditRabModal(null)} title="Edit Item Rencana Anggaran Biaya (RAB)">
        {showEditRabModal && (
          <form action={updateRabAction} className="flex flex-col gap-4">
            <input type="hidden" name="id" value={showEditRabModal.id} />

            <div>
              <label className="caption block mb-1 text-on-surface-variant font-bold">Divisi Kepanitiaan <span className="text-error">*</span></label>
              <select
                name="division_id"
                defaultValue={showEditRabModal.division_id}
                className="flex h-11 w-full rounded-md border border-primary bg-surface-bright px-4 py-2 text-base font-sans text-on-surface focus:outline-none cursor-pointer"
                required
              >
                {budgets.map((b) => (
                  <option key={b.division_id} value={b.division_id}>
                    {b.division_name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="caption block mb-1 text-on-surface-variant font-bold">Nama Item Belanja / RAB <span className="text-error">*</span></label>
              <Input name="item_name" defaultValue={showEditRabModal.item_name} required />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="caption block mb-1 text-on-surface-variant font-bold">Kuantitas / Jumlah <span className="text-error">*</span></label>
                <Input name="quantity" type="number" step="any" min="0.1" defaultValue={showEditRabModal.quantity} required />
              </div>
              <div>
                <label className="caption block mb-1 text-on-surface-variant font-bold">Satuan <span className="text-error">*</span></label>
                <Input name="unit" defaultValue={showEditRabModal.unit} required />
              </div>
            </div>

            <div>
              <label className="caption block mb-1 text-on-surface-variant font-bold">Harga Satuan (Rp) <span className="text-error">*</span></label>
              <Input name="unit_price" type="number" min="0" defaultValue={showEditRabModal.unit_price} required />
            </div>

            <div>
              <label className="caption block mb-1 text-on-surface-variant font-bold">Kategori Anggaran</label>
              <select
                name="category"
                defaultValue={showEditRabModal.category || ""}
                className="flex h-11 w-full rounded-md border border-primary bg-surface-bright px-4 py-2 text-base font-sans text-on-surface focus:outline-none cursor-pointer"
              >
                <option value="">Tanpa Kategori</option>
                {CATEGORY_OPTIONS.filter((c) => c.value).map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="caption block mb-1 text-on-surface-variant font-bold">Status Perencanaan</label>
              <select
                name="status"
                defaultValue={showEditRabModal.status}
                className="flex h-11 w-full rounded-md border border-primary bg-surface-bright px-4 py-2 text-base font-sans text-on-surface focus:outline-none cursor-pointer"
              >
                <option value="draft">Draft (Rencana)</option>
                <option value="approved">Disetujui Bendahara</option>
                <option value="realized">Terrealisasi (Sudah Belanja)</option>
              </select>
            </div>

            <div>
              <label className="caption block mb-1 text-on-surface-variant font-bold">Catatan / Keterangan</label>
              <Input name="notes" defaultValue={showEditRabModal.notes || ""} />
            </div>

            <div className="flex gap-2 justify-end mt-2">
              <Button type="button" variant="ghost" onClick={() => setShowEditRabModal(null)} className="cursor-pointer text-xs">
                Batal
              </Button>
              <Button type="submit" disabled={updateRabPending} className="cursor-pointer font-bold bg-[#04000D] text-white hover:bg-black text-xs">
                {updateRabPending ? "Menyimpan..." : "Simpan Perubahan RAB"}
              </Button>
            </div>
          </form>
        )}
      </Modal>

      {/* Google Apps Script Modal */}
      <Modal open={showAppsScriptModal} onClose={() => setShowAppsScriptModal(false)} title="Integrasi Apps Script & Google Spreadsheet Bendahara">
        <div className="flex flex-col gap-4">
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-950 font-sans space-y-2">
            <p className="font-extrabold flex items-center gap-1.5 text-sm text-emerald-900">
              <Share2 className="size-4" /> Spreadsheet Auto-Sync Google Apps Script
            </p>
            <p>
              Seluruh arus keluar-masuk uang kas panitia di pembukuan ini akan dikirimkan secara otomatis atau manual langsung ke Google Spreadsheet pribadi milik Bendahara.
            </p>
            <p className="font-mono text-[11px] bg-white p-2 rounded border border-emerald-200/80">
              File Kode Apps Script: <span className="font-bold">scripts/google-apps-script-finance.gs</span>
            </p>
          </div>

          <div>
            <label className="caption block mb-1 text-on-surface-variant font-bold">
              URL Webhook Apps Script Web App
            </label>
            <Input
              value={appsScriptUrlInput}
              onChange={(e) => setAppsScriptUrlInput(e.target.value)}
              placeholder="https://script.google.com/macros/s/.../exec"
              className="font-mono text-xs"
            />
            <p className="text-[11px] text-on-surface-variant/70 mt-1">
              Dapatkan URL ini setelah mem-deploy skrip <code className="bg-slate-100 px-1 py-0.5 rounded text-accent-magenta">google-apps-script-finance.gs</code> di Google Sheets sebagai Web App.
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

      {/* Preview Modal */}
      <Modal open={!!showPreviewUrl} onClose={() => setShowPreviewUrl(null)} title="Pratinjau Bukti Struk / Kwitansi">
        {showPreviewUrl && (
          <div className="flex flex-col gap-4">
            {showPreviewUrl.includes("drive.google.com") ? (
              <div className="w-full h-[500px] border border-outline-variant rounded-xl overflow-hidden">
                <iframe src={showPreviewUrl.replace(/\/view(\?.*)?$/, "/preview")} className="w-full h-full border-0" allow="autoplay" />
              </div>
            ) : showPreviewUrl.match(/\.(jpg|jpeg|png|webp)(\?.*)?$/i) ? (
              <img src={showPreviewUrl} alt="Bukti Transaksi" className="w-full max-h-[500px] object-contain rounded-xl border border-outline-variant" />
            ) : (
              <div className="w-full h-[500px] border border-outline-variant rounded-xl overflow-hidden bg-surface-container-low">
                <iframe src={`${showPreviewUrl}#toolbar=0`} className="w-full h-full border-0" />
              </div>
            )}
            <a href={showPreviewUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 w-full h-11 bg-primary text-white hover:bg-primary/95 rounded-full font-semibold transition-colors text-sm cursor-pointer">
              <ExternalLink className="size-4" /> Buka Bukti Struk di Tab Baru
            </a>
          </div>
        )}
      </Modal>
    </div>
  );
}
