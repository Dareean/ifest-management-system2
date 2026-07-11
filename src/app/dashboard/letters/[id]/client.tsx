"use client";

import { useActionState, useState } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import {
  ArrowLeft, Check, Send, RotateCcw, FileText,
  Clock, Building2, Tag, AlertTriangle, ExternalLink,
  User, CheckCircle2, AlertCircle, Calendar, Layers, ClipboardList,
  Edit2
} from "lucide-react";
import { startProcessingLetter, completeLetter, requestRevision } from "@/lib/actions/letter-workflow";
import { getStatusDisplay, getPriorityDisplay } from "@/lib/data/letters";
import type { LetterDetail } from "@/lib/data/letter-detail";

const categoryLabel: Record<string, string> = {
  pengantar: "Pengantar",
  rekomendasi: "Rekomendasi",
  peminjaman: "Peminjaman",
  undangan: "Undangan",
  permohonan: "Permohonan",
  legalitas: "Legalitas",
};

function getDaysRemaining(dateStr: string | null) {
  if (!dateStr) return null;
  const targetDate = new Date(dateStr);
  targetDate.setHours(0, 0, 0, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const diffTime = targetDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays < 0) return { text: "Terlewat", variant: "danger" as const };
  if (diffDays === 0) return { text: "Hari ini", variant: "warning" as const };
  if (diffDays === 1) return { text: "Besok", variant: "warning" as const };
  return { text: `${diffDays} hari lagi`, variant: "info" as const };
}

export function LetterDetailClient({ letter, isApprover }: { letter: LetterDetail; isApprover: boolean }) {
  const router = useRouter();
  const status = getStatusDisplay(letter.status);
  const priority = getPriorityDisplay(letter.priority);
  const [showRevisionModal, setShowRevisionModal] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [driveLink, setDriveLink] = useState(letter.finalDocumentUrl || "");
  const [actionMsg, setActionMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [revisionState, revisionAction, revisionPending] = useActionState(requestRevision, null);

  async function handleStartProcessing() {
    setIsSubmitting(true);
    setActionMsg(null);
    const result = await startProcessingLetter(letter.id);
    setIsSubmitting(false);
    if (result.error) setActionMsg(result.error);
    else router.refresh();
  }

  async function handleCompleteSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!driveLink.trim()) {
      setActionMsg("Link Google Drive harus diisi.");
      return;
    }
    setIsSubmitting(true);
    setActionMsg(null);
    const result = await completeLetter(letter.id, driveLink);
    setIsSubmitting(false);
    if (result.error) {
      setActionMsg(result.error);
    } else {
      setShowCompleteModal(false);
      router.refresh();
    }
  }

  const daysRemaining = getDaysRemaining(letter.deadlineAt);

  return (
    <div className="max-w-6xl mx-auto flex flex-col gap-6 px-4">
      {/* Top Navigation & Breadcrumbs */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 text-sm font-medium text-on-surface-variant hover:text-primary transition-colors cursor-pointer"
        >
          <ArrowLeft className="size-4" />
          Kembali ke Daftar Surat
        </button>
      </div>

      {/* Header Title Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-6 border-b border-outline-variant/30">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-3xl font-extrabold tracking-tight text-on-surface break-words leading-tight">
              {letter.subject}
            </h1>
            <Badge variant={status.variant} className="text-xs font-mono shrink-0 uppercase tracking-wider px-2.5 py-0.5">
              {status.label}
            </Badge>
          </div>
          <p className="text-on-surface-variant text-sm mt-2 flex items-center flex-wrap gap-x-2 gap-y-1">
            <span className="font-semibold text-primary">{letter.letterType.toUpperCase()}</span>
            <span className="text-outline-variant">•</span>
            <span>{letter.division}</span>
            <span className="text-outline-variant">•</span>
            <span>Diajukan oleh: <strong className="text-on-surface font-medium">{letter.requester}</strong></span>
          </p>
        </div>
      </div>

      {actionMsg && (
        <div className="text-sm text-error bg-error-container rounded-xl p-4 font-mono border border-error/20 shadow-sm">
          {actionMsg}
        </div>
      )}

      {/* Main Responsive Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Left Column: Letter Body Content & Revision History */}
        <div className="lg:col-span-2 flex flex-col gap-8">
          
          {/* Document Preview Card (Paper Style) */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2 text-on-surface-variant font-semibold">
              <FileText className="size-5 text-primary" />
              <h2>Maksud Surat</h2>
            </div>
            
            <div className="bg-white border border-outline-variant/40 rounded-2xl shadow-sm relative overflow-hidden">
              {/* Premium Top accent bar */}
              <div className="h-1.5 w-full bg-gradient-to-r from-primary to-accent-magenta" />
              
              <div className="p-6 sm:p-10 min-h-[300px] flex flex-col justify-between font-sans">
                {/* Simulated Paper Header */}
                <div className="border-b border-outline-variant/20 pb-4 mb-6">
                  <span className="text-[10px] font-mono tracking-widest text-on-surface-variant/50 uppercase">ISIAN PERMOHONAN</span>
                </div>
                
                {/* Body Content */}
                <div className="flex-1">
                  <p className="whitespace-pre-wrap text-on-surface leading-relaxed text-base">
                    {letter.body}
                  </p>
                </div>
                
                {/* Simulated Paper Footer */}
                <div className="border-t border-outline-variant/10 pt-4 mt-8 flex justify-between items-center text-xs text-on-surface-variant/40 font-mono">
                  <span>IFEST 2026</span>
                  <span>ID: {letter.id.slice(0, 8)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Request Options Card */}
          {letter.requestOptions && (
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2 text-on-surface-variant font-semibold">
                <ClipboardList className="size-5 text-accent-lilac" />
                <h2>Permintaan Opsi Surat</h2>
              </div>
              <div className="bg-surface-container-low border border-outline-variant/40 rounded-2xl p-6 shadow-xs">
                <p className="whitespace-pre-wrap text-on-surface text-sm font-sans leading-relaxed">
                  {letter.requestOptions}
                </p>
              </div>
            </div>
          )}

          {/* Revision History Section (Timeline Style) */}
          <div className="flex flex-col gap-4">
            <h2 className="text-xl font-bold tracking-tight text-on-surface flex items-center gap-2">
              <RotateCcw className="size-5 text-accent-coral" />
              Riwayat Revisi ({letter.revisions.length})
            </h2>

            {letter.revisions.length === 0 ? (
              <div className="bg-white border border-outline-variant/40 rounded-2xl p-8 text-center shadow-xs">
                <AlertCircle className="size-8 text-on-surface-variant/30 mx-auto mb-2" />
                <p className="text-sm font-medium text-on-surface-variant">Belum ada riwayat revisi untuk surat ini.</p>
              </div>
            ) : (
              <div className="relative pl-6 flex flex-col gap-6 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-outline-variant/30">
                {letter.revisions.map((rev) => (
                  <div key={rev.id} className="relative flex gap-4">
                    {/* Timeline Node Icon */}
                    <div className="absolute -left-[27px] top-1.5 w-3.5 h-3.5 rounded-full bg-accent-coral border-4 border-white shadow-xs z-10" />
                    
                    {/* Timeline Content */}
                    <div className="flex-1 bg-white border border-outline-variant/40 rounded-2xl p-5 shadow-xs transition-shadow hover:shadow-sm">
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-outline-variant/20 pb-3 mb-3">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-accent-coral/10 text-accent-coral text-xs font-bold flex items-center justify-center">
                            {rev.reviewer.charAt(0)}
                          </div>
                          <span className="text-sm font-bold text-on-surface">Revisi dari {rev.reviewer}</span>
                        </div>
                        <span className="text-xs font-mono text-on-surface-variant/80">
                          {new Date(rev.createdAt).toLocaleDateString("id-ID", {
                            day: "numeric", month: "short", year: "numeric",
                            hour: "2-digit", minute: "2-digit",
                          })}
                        </span>
                      </div>
                      <p className="text-sm text-on-surface font-sans leading-relaxed">{rev.note}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Right Column: Actions Sidebar & Letter Details */}
        <div className="flex flex-col gap-6">
          
          {/* Action / Workflow Card (Sekretaris) */}
          {isApprover && (
            <div className="bg-white border border-outline-variant/50 rounded-2xl p-6 shadow-sm flex flex-col gap-4">
              <h3 className="text-sm font-bold font-mono tracking-wider text-on-surface-variant uppercase">Aksi Workflow</h3>
              
              <div className="flex flex-col gap-3">
                {/* Diajukan or Di Revisi */}
                {(letter.status === "requested" || letter.status === "in_revision") && (
                  <>
                    <Button onClick={handleStartProcessing} disabled={isSubmitting} className="w-full justify-center cursor-pointer h-12 gap-2" variant="primary">
                      <Send className="size-5" />
                      Proses Surat
                    </Button>
                    <Button variant="outline" onClick={() => setShowCompleteModal(true)} disabled={isSubmitting} className="w-full justify-center cursor-pointer h-12 gap-2">
                      <Check className="size-5 text-primary" />
                      Selesaikan Surat
                    </Button>
                  </>
                )}
                {/* Diproses */}
                {letter.status === "processing" && (
                  <Button onClick={() => setShowCompleteModal(true)} disabled={isSubmitting} className="w-full justify-center cursor-pointer h-12 gap-2" variant="primary">
                    <Check className="size-5" />
                    Selesaikan Surat
                  </Button>
                )}
                {/* Selesai */}
                {letter.status === "sent" && (
                  <div className="flex flex-col gap-3">
                    <div className="p-4 bg-block-mint text-on-surface rounded-xl flex items-start gap-2.5 border border-primary/10">
                      <CheckCircle2 className="size-5 text-primary shrink-0 mt-0.5" />
                      <p className="text-xs leading-relaxed font-semibold">
                        Surat selesai. Link dokumen final sudah dilampirkan.
                      </p>
                    </div>
                    <Button variant="outline" onClick={() => setShowCompleteModal(true)} className="w-full justify-center cursor-pointer h-10 text-sm gap-2">
                      <Edit2 className="size-4" />
                      Edit Link Google Drive
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Action / Workflow Card (Pengaju) */}
          {!isApprover && letter.status === "sent" && (
            <div className="bg-white border border-outline-variant/50 rounded-2xl p-6 shadow-sm flex flex-col gap-4">
              <h3 className="text-sm font-bold font-mono tracking-wider text-on-surface-variant uppercase">Aksi Penerima</h3>
              <div className="flex flex-col gap-3">
                <Button variant="outline" onClick={() => setShowRevisionModal(true)} className="w-full justify-center cursor-pointer h-12 gap-2 border-accent-coral text-accent-coral hover:bg-accent-coral/5">
                  <RotateCcw className="size-5" />
                  Ajukan Revisi
                </Button>
              </div>
            </div>
          )}

          {/* Stepper Status for Requesters / All */}
          <div className="bg-white border border-outline-variant/50 rounded-2xl p-6 shadow-sm flex flex-col gap-4">
            <h3 className="text-sm font-bold font-mono tracking-wider text-on-surface-variant uppercase">Status Pengajuan</h3>
            
            <div className="flex flex-col gap-4 relative pl-5 before:absolute before:left-1.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-outline-variant/30">
              {/* Step 1: Diajukan */}
              <div className="relative flex items-start gap-3">
                <div className={`absolute -left-[22px] top-1 w-2.5 h-2.5 rounded-full ${['requested', 'processing', 'in_revision', 'sent'].includes(letter.status) ? 'bg-primary ring-4 ring-primary/15' : 'bg-outline-variant'} z-10`} />
                <div>
                  <p className="text-sm font-bold text-on-surface">Diajukan</p>
                  <p className="text-xs text-on-surface-variant text-[11px]">Surat berhasil dikirim ke sekretaris</p>
                </div>
              </div>

              {/* Step 2: Diproses / Revisi */}
              <div className="relative flex items-start gap-3">
                <div className={`absolute -left-[22px] top-1 w-2.5 h-2.5 rounded-full ${['processing', 'sent'].includes(letter.status) ? 'bg-primary ring-4 ring-primary/15' : letter.status === 'in_revision' ? 'bg-accent-coral ring-4 ring-accent-coral/15' : 'bg-outline-variant'} z-10`} />
                <div>
                  <p className="text-sm font-bold text-on-surface">
                    {letter.status === 'in_revision' ? 'Revisi' : 'Diproses'}
                  </p>
                  <p className="text-xs text-on-surface-variant text-[11px]">
                    {letter.status === 'in_revision' ? 'Terdapat perbaikan draf surat' : ['processing', 'sent'].includes(letter.status) ? 'Sedang dikerjakan oleh sekretaris' : 'Menunggu ditinjau'}
                  </p>
                </div>
              </div>

              {/* Step 3: Selesai */}
              <div className="relative flex items-start gap-3">
                <div className={`absolute -left-[22px] top-1 w-2.5 h-2.5 rounded-full ${letter.status === 'sent' ? 'bg-primary ring-4 ring-primary/15' : 'bg-outline-variant'} z-10`} />
                <div>
                  <p className="text-sm font-bold text-on-surface">Selesai</p>
                  <p className="text-xs text-on-surface-variant text-[11px]">Dokumen final siap diunduh</p>
                </div>
              </div>
            </div>
          </div>

          {/* Letter Details Card (Metadata list) */}
          <div className="bg-white border border-outline-variant/50 rounded-2xl p-6 shadow-sm flex flex-col gap-4">
            <h3 className="text-sm font-bold font-mono tracking-wider text-on-surface-variant uppercase">Detail Informasi</h3>
            
            <div className="flex flex-col gap-4.5">
              {/* Deadline */}
              <div className="flex items-start gap-3">
                <Calendar className="size-5 text-accent-coral shrink-0 mt-0.5" />
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-bold font-mono tracking-wider uppercase text-on-surface-variant/60">DEADLINE DIBUTUHKAN</p>
                  {letter.deadlineAt ? (
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-sm font-semibold text-on-surface">
                        {new Date(letter.deadlineAt).toLocaleDateString("id-ID", {
                          day: "numeric", month: "short", year: "numeric"
                        })}
                      </span>
                      {daysRemaining && (
                        <Badge variant={daysRemaining.variant} className="text-[10px] px-2 py-0">
                          {daysRemaining.text}
                        </Badge>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-on-surface-variant">-</p>
                  )}
                </div>
              </div>

              {/* Instansi Tujuan */}
              <div className="flex items-start gap-3">
                <Building2 className="size-5 text-accent-lilac shrink-0 mt-0.5" />
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-bold font-mono tracking-wider uppercase text-on-surface-variant/60">INSTANSI TUJUAN</p>
                  <p className="text-sm font-semibold text-on-surface break-words">
                    {letter.targetInstitution || "-"}
                  </p>
                </div>
              </div>

              {/* Kategori */}
              <div className="flex items-start gap-3">
                <Tag className="size-5 text-accent-magenta shrink-0 mt-0.5" />
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-bold font-mono tracking-wider uppercase text-on-surface-variant/60">KATEGORI SURAT</p>
                  <p className="text-sm font-semibold text-on-surface">
                    {letter.category ? categoryLabel[letter.category] ?? letter.category : "-"}
                  </p>
                </div>
              </div>

              {/* Prioritas */}
              <div className="flex items-start gap-3">
                <AlertTriangle className="size-5 text-accent-coral shrink-0 mt-0.5" />
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-bold font-mono tracking-wider uppercase text-on-surface-variant/60">PRIORITAS</p>
                  <div className="mt-0.5">
                    <Badge
                      variant={priority.variant === 'danger' ? 'danger' : priority.variant === 'secondary' ? 'secondary' : 'default'}
                      className="text-xs font-mono capitalize px-2 py-0"
                    >
                      {priority.label}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Divisi & Pengaju */}
              <div className="flex items-start gap-3 pt-3 border-t border-outline-variant/20">
                <Layers className="size-5 text-on-surface-variant shrink-0 mt-0.5" />
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-bold font-mono tracking-wider uppercase text-on-surface-variant/60">UNIT / DIVISI</p>
                  <p className="text-sm font-semibold text-on-surface">
                    {letter.division}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Final Document Link Card */}
          {letter.finalDocumentUrl && (
            <div className="bg-white border border-outline-variant/50 rounded-2xl p-6 shadow-sm flex flex-col gap-4">
              <h3 className="text-sm font-bold font-mono tracking-wider text-on-surface-variant uppercase">Dokumen Resmi</h3>
              
              <a
                href={letter.finalDocumentUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 w-full h-12 bg-primary/10 text-primary hover:bg-primary/20 rounded-full font-semibold transition-colors text-sm"
              >
                <ExternalLink className="size-4" />
                Buka di Google Drive
              </a>
            </div>
          )}

        </div>

      </div>

      {/* Selesaikan Surat Modal */}
      <Modal open={showCompleteModal} onClose={() => setShowCompleteModal(false)} title="Selesaikan Surat & Lampirkan File">
        <form onSubmit={handleCompleteSubmit} className="flex flex-col gap-4 font-sans">
          <div>
            <p className="text-sm text-on-surface-variant mb-4 leading-relaxed">
              Masukkan link Google Drive dokumen final yang sudah ditandatangani. Link ini akan langsung terlihat oleh pengaju.
            </p>
            <label className="caption block mb-1.5 text-on-surface-variant font-semibold">Link Dokumen Google Drive <span className="text-error">*</span></label>
            <input
              type="text"
              value={driveLink}
              onChange={(e) => setDriveLink(e.target.value)}
              className="flex h-11 w-full rounded-md border border-primary bg-surface-bright px-4 py-2 text-base font-sans text-on-surface focus:border-accent-magenta focus:outline-none"
              placeholder="https://drive.google.com/..."
              required
            />
            {driveLink && driveLink.startsWith("http") && (
              <a
                href={driveLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 mt-2 text-xs text-primary underline hover:opacity-70 transition-opacity"
              >
                <ExternalLink className="size-3" />
                Cek link (buka di tab baru)
              </a>
            )}
          </div>
          {actionMsg && (
            <p className="text-sm text-error bg-error-container font-mono p-3 rounded-lg border border-error/20">{actionMsg}</p>
          )}
          <div className="flex gap-2 justify-end mt-2">
            <Button type="button" variant="ghost" onClick={() => { setShowCompleteModal(false); setActionMsg(null); }} className="cursor-pointer">
              Batal
            </Button>
            <Button type="submit" className="cursor-pointer" disabled={isSubmitting}>
              {isSubmitting ? "Menyimpan..." : "Tandai Selesai & Kirim Link"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Revision Modal */}
      <Modal open={showRevisionModal} onClose={() => setShowRevisionModal(false)} title="Ajukan Revisi Surat">
        {revisionState?.error && (
          <p className="text-error bg-error-container text-sm font-mono p-3 rounded-lg border border-error/20 mb-4">
            {revisionState.error}
          </p>
        )}
        <form action={revisionAction} className="flex flex-col gap-4 font-sans">
          <input type="hidden" name="id" value={letter.id} />
          <div>
            <p className="text-sm text-on-surface-variant mb-4 leading-relaxed">
              Jelaskan secara detail bagian surat mana saja yang perlu diperbaiki oleh sekretaris. Catatan ini akan memindahkan status surat kembali ke <strong>Revisi</strong>.
            </p>
            <label className="caption block mb-1.5 text-on-surface-variant font-semibold">Catatan Perbaikan <span className="text-error">*</span></label>
            <textarea
              name="note"
              className="flex min-h-[140px] w-full rounded-md border border-primary bg-surface-bright px-4 py-2 text-base font-sans text-on-surface placeholder:text-on-surface-variant focus:border-accent-magenta focus:outline-none resize-y"
              placeholder="Contoh: Lampiran proposal halaman 3 terdapat salah ketik tanggal kegiatan. Mohon diganti menjadi 18 Juli."
              required
            />
          </div>
          <div className="flex gap-2 justify-end mt-2">
            <Button type="button" variant="ghost" onClick={() => setShowRevisionModal(false)} className="cursor-pointer">
              Batal
            </Button>
            <Button type="submit" className="cursor-pointer" disabled={revisionPending}>
              {revisionPending ? "Mengirim..." : "Kirim Pengajuan Revisi"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
