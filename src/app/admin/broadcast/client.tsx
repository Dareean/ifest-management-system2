"use client";

import { useActionState, startTransition } from "react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { sendBroadcastEmailAction } from "@/lib/actions/broadcast";
import { Mail, CheckCircle2, AlertCircle, Type, FileText, Send } from "lucide-react";

export function BroadcastClient() {
  const [state, formAction, pending] = useActionState(sendBroadcastEmailAction, null);

  return (
    <div className="flex flex-col gap-6 max-w-3xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/40 backdrop-blur-md border border-outline-variant/20 rounded-3xl p-6">
        <div>
          <p className="text-accent-magenta font-mono text-xs font-bold tracking-widest uppercase mb-1">
            PENGUMUMAN MASAL
          </p>
          <h1 className="text-3xl font-black tracking-tight text-on-surface font-sans">Broadcast Email</h1>
          <p className="mt-1 text-sm text-on-surface-variant font-medium">
            Kirimkan email pengumuman khusus secara langsung kepada seluruh panitia aktif.
          </p>
        </div>
        <div className="p-3.5 bg-primary/10 rounded-2xl text-primary border border-primary/20 shrink-0 self-start sm:self-auto">
          <Mail className="size-6" />
        </div>
      </div>

      {/* Form Container */}
      <div className="bg-white border border-outline-variant/60 rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-sm">
        {pending && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/85 backdrop-blur-sm gap-3">
            <Spinner size="lg" />
            <p className="text-sm font-mono text-primary font-bold animate-pulse">
              Mengirimkan email broadcast ke seluruh panitia...
            </p>
          </div>
        )}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            const fd = new FormData(e.currentTarget);
            startTransition(() => formAction(fd));
          }}
          className={`flex flex-col gap-6 ${pending ? "pointer-events-none select-none" : ""}`}
        >
          {state?.error && (
            <div className="flex items-start gap-3 text-sm text-error bg-error-container/20 border border-error/20 rounded-2xl p-4">
              <AlertCircle className="size-5 shrink-0 text-error mt-0.5" />
              <div className="font-sans leading-relaxed font-semibold">{state.error}</div>
            </div>
          )}

          {state?.success && (
            <div className="flex items-start gap-3 text-sm text-accent-green bg-accent-green/10 border border-accent-green/20 rounded-2xl p-4">
              <CheckCircle2 className="size-5 shrink-0 text-accent-green mt-0.5" />
              <div className="font-sans leading-relaxed">
                <span className="font-extrabold">Email Berhasil Dikirim!</span> Broadcast pengumuman telah sukses terkirim ke{" "}
                <strong>{state.count}</strong> anggota panitia aktif.
              </div>
            </div>
          )}

          <div className="flex flex-col gap-2">
            <label htmlFor="subject" className="text-sm font-bold text-on-surface font-sans flex items-center gap-1.5">
              <Type className="size-4 text-on-surface-variant/60" />
              Subjek Email (Subject)
            </label>
            <input
              id="subject"
              name="subject"
              type="text"
              required
              placeholder="Contoh: [PENGUMUMAN] Perubahan Jadwal Rapat Pleno I-FEST 2026"
              className="w-full px-4 py-3 rounded-2xl border border-outline-variant/60 bg-surface-container-lowest text-on-surface text-sm font-sans outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-200"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="boxTitle" className="text-sm font-bold text-on-surface font-sans flex items-center gap-1.5">
              <FileText className="size-4 text-on-surface-variant/60" />
              Judul Header Pesan (Box Title - opsional)
            </label>
            <input
              id="boxTitle"
              name="boxTitle"
              type="text"
              placeholder="Contoh: PENGUMUMAN PENTING (Default: PENGUMUMAN PANITIA)"
              className="w-full px-4 py-3 rounded-2xl border border-outline-variant/60 bg-surface-container-lowest text-on-surface text-sm font-sans outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-200"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="body" className="text-sm font-bold text-on-surface font-sans flex items-center gap-1.5">
              <Mail className="size-4 text-on-surface-variant/60" />
              Isi Pesan Email (Format Teks / Markdown)
            </label>
            <textarea
              id="body"
              name="body"
              required
              rows={8}
              placeholder="Tuliskan isi pengumuman lengkap di sini..."
              className="w-full px-4 py-3 rounded-2xl border border-outline-variant/60 bg-surface-container-lowest text-on-surface text-sm font-sans outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-200 resize-y leading-relaxed"
            />
            <span className="text-xs text-on-surface-variant/60 font-medium ml-1">
              Baris baru (enter) dan format markdown dasar didukung secara otomatis pada tampilan email penerima.
            </span>
          </div>

          <div className="flex justify-end pt-4 border-t border-outline-variant/30 mt-2">
            <Button
              type="submit"
              variant="primary"
              className="w-full sm:w-auto cursor-pointer font-sans text-sm font-bold gap-2 px-6 py-5 rounded-xl shadow-md transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
            >
              <Send className="size-4" />
              Kirim Broadcast Email
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
