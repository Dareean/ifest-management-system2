"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createLetter } from "@/lib/actions/letters";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function NewLetterPage() {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(createLetter, null);

  useEffect(() => {
    if (state?.success) router.push("/dashboard/letters");
  }, [state, router]);

  return (
    <div className="max-w-2xl flex flex-col gap-8">
      {/* Header */}
      <div>
        <p className="text-[#FF3D8B] font-mono text-xs font-bold tracking-widest uppercase mb-1">
          Sistem Surat
        </p>
        <h1 className="text-4xl font-extrabold tracking-tight text-on-surface">
          Ajukan Permohonan Surat
        </h1>
        <p className="mt-2 text-base text-on-surface-variant">
          Isi formulir di bawah ini untuk mengajukan permohonan surat keluar baru.
        </p>
      </div>

      {state?.error && (
        <div className="text-sm text-error bg-error-container rounded-lg p-4 font-mono">
          {state.error}
        </div>
      )}

      {/* Form Container Card */}
      <div className="bg-white border border-outline-variant/60 rounded-2xl p-6 sm:p-8">
        <form action={formAction} className="flex flex-col gap-6">
          <div>
            <label className="caption block mb-1.5 text-on-surface-variant font-semibold">
              Jenis Surat
            </label>
            <select
              name="letterType"
              className="flex h-11 w-full rounded-md border border-primary bg-surface-bright px-4 py-2 text-base font-sans text-on-surface focus:border-accent-magenta focus:outline-none cursor-pointer appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2020%2020%22%20fill%3D%22none%22%3E%3Cpath%20d%3D%22M7%209l3%203%203-3%22%20stroke%3D%22%231d1b1d%22%20stroke-width%3D%221.5%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%3C%2Fsvg%3E')] bg-[length:1.25rem] bg-[right_1rem_center] bg-no-repeat pr-10"
              required
            >
              <option value="">Pilih jenis surat</option>
              <option value="permohonan">Permohonan</option>
              <option value="undangan">Undangan</option>
              <option value="proposal">Proposal</option>
              <option value="lainnya">Lainnya</option>
            </select>
          </div>

          <div>
            <label className="caption block mb-1.5 text-on-surface-variant font-semibold">
              Perihal
            </label>
            <Input
              name="subject"
              placeholder="Contoh: Permohonan Sponsor Bank Indonesia"
              required
            />
          </div>

          <div>
            <label className="caption block mb-1.5 text-on-surface-variant font-semibold">
              Isi Surat
            </label>
            <textarea
              name="body"
              className="flex min-h-[220px] w-full rounded-md border border-primary bg-surface-bright px-4 py-2 text-base font-sans text-on-surface placeholder:text-on-surface-variant focus:border-accent-magenta focus:outline-none resize-y"
              placeholder="Tulis isi surat di sini..."
              required
            />
          </div>

          <div className="flex gap-2 justify-end mt-2">
            <Button type="button" variant="ghost" onClick={() => router.back()} className="cursor-pointer">
              Batal
            </Button>
            <Button type="submit" disabled={pending} className="cursor-pointer">
              {pending ? "Mengirim..." : "Ajukan Surat"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
