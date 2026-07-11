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
    <div className="max-w-4xl mx-auto flex flex-col gap-8">
      {/* Header */}
      <div>
        <p className="text-accent-magenta font-mono text-xs font-bold tracking-widest uppercase mb-1">
          Sistem Surat
        </p>
        <h1 className="text-4xl font-extrabold tracking-tight text-on-surface">
          Ajukan Permohonan Surat
        </h1>
        <p className="mt-2 text-base text-on-surface-variant">
          Isi formulir di bawah ini untuk mengajukan permohonan surat baru.
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
          {/* Nama Surat */}
          <div>
            <label className="caption block mb-1.5 text-on-surface-variant font-semibold">
              Nama Surat <span className="text-error">*</span>
            </label>
            <Input
              name="subject"
              placeholder="Contoh: Permohonan Sponsor Bank Indonesia"
              required
            />
          </div>

          {/* Deadline + Instansi */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="caption block mb-1.5 text-on-surface-variant font-semibold">
                Deadline Dibutuhkan
              </label>
              <input
                type="date"
                name="deadlineAt"
                className="flex h-11 w-full rounded-md border border-primary bg-surface-bright px-4 py-2 text-base font-sans text-on-surface focus:border-accent-magenta focus:outline-none"
              />
            </div>
            <div>
              <label className="caption block mb-1.5 text-on-surface-variant font-semibold">
                Instansi Tujuan
              </label>
              <Input
                name="targetInstitution"
                placeholder="Contoh: Bank Indonesia, Dekanat FT"
              />
            </div>
          </div>

          {/* Jenis Surat + Kategori */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="caption block mb-1.5 text-on-surface-variant font-semibold">
                Jenis Surat <span className="text-error">*</span>
              </label>
              <select
                name="letterType"
                className="flex h-11 w-full rounded-md border border-primary bg-surface-bright px-4 py-2 text-base font-sans text-on-surface focus:border-accent-magenta focus:outline-none cursor-pointer appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2020%2020%22%20fill%3D%22none%22%3E%3Cpath%20d%3D%22M7%209l3%203%203-3%22%20stroke%3D%22%231d1b1d%22%20stroke-width%3D%221.5%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%3C%2Fsvg%3E')] bg-[length:1.25rem] bg-[right_1rem_center] bg-no-repeat pr-10"
                required
              >
                <option value="">Pilih jenis surat</option>
                <option value="eksternal">Eksternal</option>
                <option value="internal">Internal</option>
              </select>
            </div>
            <div>
              <label className="caption block mb-1.5 text-on-surface-variant font-semibold">
                Kategori Surat
              </label>
              <select
                name="category"
                className="flex h-11 w-full rounded-md border border-primary bg-surface-bright px-4 py-2 text-base font-sans text-on-surface focus:border-accent-magenta focus:outline-none cursor-pointer appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2020%2020%22%20fill%3D%22none%22%3E%3Cpath%20d%3D%22M7%209l3%203%203-3%22%20stroke%3D%22%231d1b1d%22%20stroke-width%3D%221.5%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%3C%2Fsvg%3E')] bg-[length:1.25rem] bg-[right_1rem_center] bg-no-repeat pr-10"
              >
                <option value="">Pilih kategori</option>
                <option value="pengantar">Pengantar</option>
                <option value="rekomendasi">Rekomendasi</option>
                <option value="peminjaman">Peminjaman</option>
                <option value="undangan">Undangan</option>
                <option value="permohonan">Permohonan</option>
                <option value="legalitas">Legalitas</option>
              </select>
            </div>
          </div>

          {/* Prioritas */}
          <div>
            <label className="caption block mb-1.5 text-on-surface-variant font-semibold">
              Prioritas
            </label>
            <div className="flex gap-3">
              {["tinggi", "sedang", "rendah"].map((value) => (
                <label
                  key={value}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-outline-variant/60 bg-surface-bright cursor-pointer has-[:checked]:border-accent-magenta has-[:checked]:bg-accent-magenta/5 transition-all"
                >
                  <input
                    type="radio"
                    name="priority"
                    value={value}
                    defaultChecked={value === "sedang"}
                    className="accent-accent-magenta"
                  />
                  <span className="text-sm font-medium text-on-surface capitalize">{value}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Maksud Surat */}
          <div>
            <label className="caption block mb-1.5 text-on-surface-variant font-semibold">
              Maksud Surat <span className="text-error">*</span>
            </label>
            <textarea
              name="body"
              className="flex min-h-[220px] w-full rounded-md border border-primary bg-surface-bright px-4 py-2 text-base font-sans text-on-surface placeholder:text-on-surface-variant focus:border-accent-magenta focus:outline-none resize-y"
              placeholder="Tulis maksud dan tujuan surat di sini..."
              required
            />
          </div>

          {/* Permintaan Opsi Surat */}
          <div>
            <label className="caption block mb-1.5 text-on-surface-variant font-semibold">
              Permintaan Opsi Surat <span className="text-on-surface-variant/60">(opsional)</span>
            </label>
            <textarea
              name="requestOptions"
              className="flex min-h-[100px] w-full rounded-md border border-primary bg-surface-bright px-4 py-2 text-base font-sans text-on-surface placeholder:text-on-surface-variant focus:border-accent-magenta focus:outline-none resize-y"
              placeholder="Contoh: Surat mohon dilengkapi kop HMTI, 2 rangkap, lampiran proposal"
            />
          </div>

          {/* Actions */}
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
