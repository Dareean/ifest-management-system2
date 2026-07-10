"use client";

import { useActionState, useState } from "react";
import { useRouter } from "next/navigation";
import { ColorBlock } from "@/components/blocks/color-block";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { ArrowLeft, Check, Send, RotateCcw, FileText } from "lucide-react";
import { approveLetter, sendLetterFinal, requestRevision } from "@/lib/actions/letter-workflow";
import { getStatusDisplay } from "@/lib/data/letters";
import type { LetterDetail } from "@/lib/data/letter-detail";

const statusColor: Record<string, string> = {
  requested: "bg-amber-100 text-amber-800",
  in_revision: "bg-blue-100 text-blue-800",
  approved: "bg-emerald-100 text-emerald-800",
  sent: "bg-gray-100 text-gray-800",
};

export function LetterDetailClient({ letter }: { letter: LetterDetail }) {
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
    <div className="max-w-3xl flex flex-col gap-section-gap">
      <div className="flex items-center gap-md">
        <button onClick={() => router.back()} className="p-2 rounded-full hover:bg-surface-container transition-colors">
          <ArrowLeft className="size-5" />
        </button>
        <div>
          <div className="flex items-center gap-sm">
            <h1 className="text-3xl font-semibold tracking-tight">{letter.subject}</h1>
            <Badge variant={status.variant}>{status.label}</Badge>
          </div>
          <p className="text-on-surface-variant caption">
            {letter.letterType} &middot; {letter.division} &middot; {letter.requester}
          </p>
        </div>
      </div>

      {actionMsg && (
        <p className="text-red-500 caption">{actionMsg}</p>
      )}

      <ColorBlock color="mint">
        <Card>
          <CardHeader>
            <CardTitle>Isi Surat</CardTitle>
          </CardHeader>
          <div className="px-lg pb-lg">
            <p className="whitespace-pre-wrap text-on-surface leading-relaxed">{letter.body}</p>
          </div>
        </Card>
      </ColorBlock>

      {/* Workflow Actions */}
      <ColorBlock color="lilac">
        <p className="eyebrow text-on-surface-variant mb-md">Aksi</p>
        <div className="flex flex-wrap gap-sm">
          {letter.status === "requested" && (
            <>
              <Button onClick={handleApprove}>
                <Check className="size-4" />
                Setujui
              </Button>
              <Button variant="outline" onClick={() => setShowRevisionModal(true)}>
                <RotateCcw className="size-4" />
                Minta Revisi
              </Button>
            </>
          )}
          {letter.status === "approved" && (
            <Button onClick={handleSend}>
              <Send className="size-4" />
              Tandai Terkirim
            </Button>
          )}
          {letter.status === "in_revision" && (
            <p className="text-sm text-on-surface-variant">
              Menunggu revisi dari pengaju.
            </p>
          )}
          {letter.status === "sent" && (
            <Badge variant="default">Dokumen telah dikirim</Badge>
          )}
        </div>
      </ColorBlock>

      {/* Revision History */}
      <ColorBlock color="coral">
        <p className="eyebrow text-on-surface-variant mb-md">
          Riwayat Revisi ({letter.revisions.length})
        </p>
        {letter.revisions.length === 0 && (
          <p className="text-on-surface-variant text-sm">Belum ada revisi.</p>
        )}
        <div className="flex flex-col gap-sm">
          {letter.revisions.map((rev) => (
            <Card key={rev.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-xs">
                    <FileText className="size-4 text-on-surface-variant" />
                    <CardTitle className="text-sm font-medium">Revisi oleh {rev.reviewer}</CardTitle>
                  </div>
                  <CardDescription>
                    {new Date(rev.createdAt).toLocaleDateString("id-ID", {
                      day: "numeric", month: "short", year: "numeric",
                      hour: "2-digit", minute: "2-digit",
                    })}
                  </CardDescription>
                </div>
                <p className="text-sm mt-xs">{rev.note}</p>
              </CardHeader>
            </Card>
          ))}
        </div>
      </ColorBlock>

      {/* Revision Modal */}
      <Modal open={showRevisionModal} onClose={() => setShowRevisionModal(false)} title="Minta Revisi">
        {revisionState?.error && <p className="text-red-500 caption mb-md">{revisionState.error}</p>}
        <form action={revisionAction} className="flex flex-col gap-md">
          <input type="hidden" name="id" value={letter.id} />
          <div>
            <label className="caption block mb-xs text-on-surface-variant">Catatan Revisi</label>
            <textarea
              name="note"
              className="flex min-h-[120px] w-full rounded-md border border-primary bg-surface-bright px-4 py-2 text-base font-sans text-on-surface placeholder:text-on-surface-variant focus:border-accent-magenta focus:outline-none resize-y"
              placeholder="Jelaskan apa yang perlu diperbaiki..."
              required
            />
          </div>
          <div className="flex gap-sm justify-end">
            <Button type="button" variant="ghost" onClick={() => setShowRevisionModal(false)}>Batal</Button>
            <Button type="submit" variant="outline" disabled={revisionPending}>
              {revisionPending ? "Menyimpan..." : "Kirim Permintaan Revisi"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
