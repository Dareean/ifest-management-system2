"use client";

import { useActionState, useState } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import {
  ArrowLeft, Check, Send, RotateCcw, FileText,
  Clock, Building2, Tag, AlertTriangle, ExternalLink,
} from "lucide-react";
import { approveLetter, sendLetterFinal, requestRevision } from "@/lib/actions/letter-workflow";
import { getStatusDisplay } from "@/lib/data/letters";
import type { LetterDetail } from "@/lib/data/letter-detail";

const statusColor: Record<string, string> = {
  requested: "bg-accent-lilac/10 text-accent-lilac",
  in_revision: "bg-accent-coral/10 text-accent-coral",
  approved: "bg-accent-green/10 text-accent-green",
  sent: "bg-surface-container text-on-surface-variant",
};

const categoryLabel: Record<string, string> = {
  pengantar: "Pengantar",
  rekomendasi: "Rekomendasi",
  peminjaman: "Peminjaman",
  undangan: "Undangan",
  permohonan: "Permohonan",
  legalitas: "Legalitas",
};

export function LetterDetailClient({ letter, isApprover }: { letter: LetterDetail; isApprover: boolean }) {
  const router = useRouter();
  const status = getStatusDisplay(letter.status);
  const [showRevisionModal, setShowRevisionModal] = useState(false);
  const [actionMsg, setActionMsg] = useState<string | null>(null);
  const [revisionState, revisionAction, revisionPending] = useActionState(requestRevision, null);

  async function handleApprove() {
    const result = await approveLetter(letter.id);
    if (result.error) setActionMsg(result.error);
    else router.refresh();
  }

  async function handleSend() {
    const result = await sendLetterFinal(letter.id);
    if (result.error) setActionMsg(result.error);
    else router.refresh();
  }

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-10">
      {/* Header */}
      <div className="flex items-start gap-4">
        <button
          onClick={() => router.back()}
          className="p-2 rounded-full hover:bg-surface-container transition-colors shrink-0 cursor-pointer mt-1"
        >
          <ArrowLeft className="size-5 text-on-surface" />
        </button>
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-3xl font-extrabold tracking-tight text-on-surface break-words leading-tight">
              {letter.subject}
            </h1>
            <Badge variant={status.variant} className="text-xs font-mono shrink-0">
              {status.label}
            </Badge>
          </div>
          <p className="text-on-surface-variant text-sm mt-1">
            {letter.letterType.toUpperCase()} &middot; {letter.division} &middot; Pengaju: {letter.requester}
          </p>
        </div>
      </div>

      {actionMsg && (
        <div className="text-sm text-error bg-error-container rounded-lg p-4 font-mono">
          {actionMsg}
        </div>
      )}

      {/* Metadata Card */}
      <div className="bg-white border border-outline-variant/60 rounded-2xl p-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
          {letter.deadlineAt && (
            <div>
              <p className="text-xs font-mono text-on-surface-variant mb-1">Deadline</p>
              <p className="text-sm font-semibold text-on-surface flex items-center gap-1.5">
                <Clock className="size-4 text-accent-coral" />
                {new Date(letter.deadlineAt).toLocaleDateString("id-ID", {
                  day: "numeric", month: "long", year: "numeric"
                })}
              </p>
            </div>
          )}
          {letter.targetInstitution && (
            <div>
              <p className="text-xs font-mono text-on-surface-variant mb-1">Instansi Tujuan</p>
              <p className="text-sm font-semibold text-on-surface flex items-center gap-1.5">
                <Building2 className="size-4 text-accent-lilac" />
                {letter.targetInstitution}
              </p>
            </div>
          )}
          <div>
            <p className="text-xs font-mono text-on-surface-variant mb-1">Kategori</p>
            <p className="text-sm font-semibold text-on-surface flex items-center gap-1.5">
              <Tag className="size-4 text-accent-magenta" />
              {letter.category ? categoryLabel[letter.category] ?? letter.category : "-"}
            </p>
          </div>
          <div>
            <p className="text-xs font-mono text-on-surface-variant mb-1">Prioritas</p>
            <p className="text-sm font-semibold text-on-surface flex items-center gap-1.5">
              <AlertTriangle className="size-4 text-accent-coral" />
              {letter.priority.charAt(0).toUpperCase() + letter.priority.slice(1)}
            </p>
          </div>
        </div>
      </div>

      {/* Main Letter Content */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <FileText className="size-5 text-error" />
          <h2 className="text-xl font-bold tracking-tight text-on-surface">Maksud Surat</h2>
        </div>
        <div className="bg-white border border-outline-variant/60 rounded-2xl p-6 sm:p-8">
          <p className="whitespace-pre-wrap text-on-surface leading-relaxed text-base font-sans">
            {letter.body}
          </p>
        </div>
      </div>

      {/* Request Options */}
      {letter.requestOptions && (
        <div className="flex flex-col gap-3">
          <h2 className="text-xl font-bold tracking-tight text-on-surface">Permintaan Opsi Surat</h2>
          <div className="bg-white border border-outline-variant/60 rounded-2xl p-6">
            <p className="whitespace-pre-wrap text-on-surface text-sm font-sans leading-relaxed">
              {letter.requestOptions}
            </p>
          </div>
        </div>
      )}

      {/* Final Document Link */}
      {letter.finalDocumentUrl && (
        <div className="flex flex-col gap-3">
          <h2 className="text-xl font-bold tracking-tight text-on-surface">Dokumen Final</h2>
          <div className="bg-white border border-outline-variant/60 rounded-2xl p-6">
            <a
              href={letter.finalDocumentUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-accent-magenta hover:underline font-semibold"
            >
              <ExternalLink className="size-4" />
              Akses Dokumen (Google Drive)
            </a>
          </div>
        </div>
      )}

      {/* Workflow Actions — only for Sekretaris */}
      {isApprover && (
        <div className="flex flex-col gap-4">
          <h2 className="text-xl font-bold tracking-tight text-on-surface">Aksi Workflow</h2>
          <div className="bg-white border border-outline-variant/60 rounded-2xl p-6">
            <div className="flex flex-wrap gap-3">
              {letter.status === "requested" && (
                <>
                  <Button onClick={handleApprove} className="cursor-pointer">
                    <Check className="size-4" />
                    Setujui Surat
                  </Button>
                  <Button variant="outline" onClick={() => setShowRevisionModal(true)} className="cursor-pointer">
                    <RotateCcw className="size-4" />
                    Minta Revisi
                  </Button>
                </>
              )}
              {letter.status === "approved" && (
                <Button onClick={handleSend} className="cursor-pointer">
                  <Send className="size-4" />
                  Tandai Terkirim
                </Button>
              )}
              {letter.status === "in_revision" && (
                <div className="text-sm text-on-surface-variant font-mono flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse" />
                  Menunggu perbaikan/revisi dari pengaju.
                </div>
              )}
              {letter.status === "sent" && (
                <div className="text-sm text-accent-green font-bold flex items-center gap-2">
                  <Check className="size-4" /> Dokumen resmi telah terkirim
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Status Timeline for non-approver */}
      {!isApprover && (
        <div className="flex flex-col gap-4">
          <h2 className="text-xl font-bold tracking-tight text-on-surface">Status Surat</h2>
          <div className="bg-white border border-outline-variant/60 rounded-2xl p-6">
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${statusColor[letter.status]?.split(" ")[0] ?? "bg-surface-container"}`} />
              <span className="text-sm font-semibold text-on-surface">
                Status: {status.label}
              </span>
            </div>
            {letter.finalDocumentUrl && (
              <div className="mt-4 pt-4 border-t border-outline-variant/20">
                <a
                  href={letter.finalDocumentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-accent-magenta hover:underline font-semibold text-sm"
                >
                  <ExternalLink className="size-4" />
                  Akses Dokumen Final (Google Drive)
                </a>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Revision History */}
      <div className="flex flex-col gap-4">
        <h2 className="text-xl font-bold tracking-tight text-on-surface">
          Riwayat Revisi ({letter.revisions.length})
        </h2>

        {letter.revisions.length === 0 ? (
          <div className="bg-white border border-outline-variant/60 rounded-2xl p-6 text-center">
            <p className="text-sm font-mono text-on-surface-variant">Belum ada riwayat revisi.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {letter.revisions.map((rev) => (
              <div key={rev.id} className="bg-white border border-outline-variant/60 rounded-xl p-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-outline-variant/20 pb-3 mb-3">
                  <div className="flex items-center gap-2">
                    <RotateCcw className="size-4 text-blue-500" />
                    <span className="text-sm font-bold text-on-surface">Revisi dari {rev.reviewer}</span>
                  </div>
                  <span className="text-xs font-mono text-on-surface-variant">
                    {new Date(rev.createdAt).toLocaleDateString("id-ID", {
                      day: "numeric", month: "short", year: "numeric",
                      hour: "2-digit", minute: "2-digit",
                    })}
                  </span>
                </div>
                <p className="text-sm text-on-surface font-sans leading-relaxed">{rev.note}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Revision Modal */}
      <Modal open={showRevisionModal} onClose={() => setShowRevisionModal(false)} title="Minta Revisi">
        {revisionState?.error && <p className="text-red-500 caption mb-4">{revisionState.error}</p>}
        <form action={revisionAction} className="flex flex-col gap-4">
          <input type="hidden" name="id" value={letter.id} />
          <div>
            <label className="caption block mb-1 text-on-surface-variant">Catatan Revisi</label>
            <textarea
              name="note"
              className="flex min-h-[120px] w-full rounded-md border border-primary bg-surface-bright px-4 py-2 text-base font-sans text-on-surface placeholder:text-on-surface-variant focus:border-accent-magenta focus:outline-none resize-y"
              placeholder="Jelaskan detail perbaikan yang diperlukan..."
              required
            />
          </div>
          <div className="flex gap-2 justify-end mt-2">
            <Button type="button" variant="ghost" onClick={() => setShowRevisionModal(false)} className="cursor-pointer">
              Batal
            </Button>
            <Button type="submit" className="cursor-pointer" disabled={revisionPending}>
              {revisionPending ? "Mengirim..." : "Kirim Permintaan"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
