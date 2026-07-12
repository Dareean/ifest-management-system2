"use client";

import { useActionState, useEffect, startTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { sendBroadcastEmailAction } from "@/lib/actions/broadcast";
import { Mail, CheckCircle2, AlertCircle } from "lucide-react";

export function BroadcastClient() {
  const [state, formAction, pending] = useActionState(sendBroadcastEmailAction, null);

  return (
    <div className="flex flex-col gap-6 max-w-2xl mx-auto mt-6">
      <div className="flex items-center gap-3">
        <div className="p-2.5 bg-primary/10 rounded-xl text-primary">
          <Mail className="size-6" />
        </div>
        <div>
          <h2 className="text-xl font-bold tracking-tight text-on-surface">Broadcast Email</h2>
          <p className="text-sm text-on-surface-variant">
            Kirimkan email pengumuman khusus kepada seluruh anggota panitia aktif.
          </p>
        </div>
      </div>

      <div className="bg-white border border-outline-variant/60 rounded-2xl p-6 sm:p-8 relative overflow-hidden shadow-sm">
        {pending && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm gap-3">
            <Spinner size="lg" />
            <p className="text-sm font-mono text-primary font-bold animate-pulse">
              Mengirimkan email broadcast...
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
            <div className="flex items-start gap-3 text-sm text-error bg-error-container/50 border border-error-container rounded-xl p-4">
              <AlertCircle className="size-5 shrink-0 text-error mt-0.5" />
              <div className="font-sans leading-relaxed">{state.error}</div>
            </div>
          )}

          {state?.success && (
            <div className="flex items-start gap-3 text-sm text-success bg-success-container/50 border border-success-container rounded-xl p-4">
              <CheckCircle2 className="size-5 shrink-0 text-success mt-0.5" />
              <div className="font-sans leading-relaxed">
                <span className="font-bold">Email berhasil dikirim!</span> Broadcast telah dikirim ke{" "}
                <strong>{state.count}</strong> panitia aktif.
              </div>
            </div>
          )}

          <div>
            <label className="caption block mb-1.5 text-on-surface-variant font-semibold">
              Subjek Email (Subject)
            </label>
            <Input
              name="subject"
              placeholder="Contoh: [PENGUMUMAN] Perubahan Jadwal Rapat Pleno I-FEST"
              required
            />
          </div>

          <div>
            <label className="caption block mb-1.5 text-on-surface-variant font-semibold">
              Judul Pengumuman (Box Title - opsional)
            </label>
            <Input
              name="boxTitle"
              placeholder="Contoh: PENGUMUMAN PENTING (Default: PENGUMUMAN PANITIA)"
            />
          </div>

          <div>
            <label className="caption block mb-1.5 text-on-surface-variant font-semibold">
              Isi Pesan Email (Plain text / markdown - line breaks didukung)
            </label>
            <textarea
              name="body"
              className="flex min-h-[200px] w-full rounded-md border border-primary bg-surface-bright px-4 py-2 text-base font-sans text-on-surface placeholder:text-on-surface-variant focus:border-accent-magenta focus:outline-none resize-y"
              placeholder="Tulis pesan pengumuman Anda di sini..."
              required
            />
          </div>

          <div className="flex justify-end pt-2">
            <Button type="submit" variant="primary" className="w-full sm:w-auto cursor-pointer">
              <Mail className="size-4 mr-2" />
              Kirim Broadcast
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
