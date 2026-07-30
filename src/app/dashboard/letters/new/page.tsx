"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createLetter } from "@/lib/actions/letters";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Send, Loader2, FileText, Calendar, Building2, Tag, AlertCircle } from "lucide-react";

export default function NewLetterPage() {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(createLetter, null);

  useEffect(() => {
    if (state?.success) router.push("/dashboard/letters");
  }, [state, router]);

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-8 pb-10">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-6">
        <div>
          <p className="text-pink-500 font-mono text-[11px] font-extrabold tracking-widest uppercase mb-1">
            SISTEM SURAT
          </p>
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 font-sans">
            Ajukan Permohonan Surat
          </h1>
          <p className="mt-1 text-sm text-slate-400 font-sans">
            Isi formulir di bawah ini untuk mengajukan permohonan surat kepanitiaan baru.
          </p>
        </div>

        <Link href="/dashboard/letters">
          <Button variant="outline" size="sm" className="h-9 rounded-2xl font-mono text-xs font-bold text-slate-600 border-slate-200 hover:bg-slate-50 gap-1.5 cursor-pointer">
            <ArrowLeft className="size-4" /> Kembali
          </Button>
        </Link>
      </div>

      {state?.error && (
        <div className="flex items-center gap-3 text-sm text-pink-700 bg-pink-50 border border-pink-200 rounded-2xl p-4 font-mono font-bold">
          <AlertCircle className="size-5 text-pink-500 shrink-0" />
          <span>{state.error}</span>
        </div>
      )}

      {/* Form Container Card */}
      <div className="bg-white border border-slate-100 rounded-3xl p-6 sm:p-10 shadow-xs">
        <form action={formAction} className="flex flex-col gap-7">
          {/* Nama Surat */}
          <div>
            <label className="block mb-2 text-xs font-mono font-extrabold uppercase text-slate-800 tracking-wider">
              Nama / Judul Surat <span className="text-pink-500">*</span>
            </label>
            <Input
              name="subject"
              placeholder="Contoh: Permohonan Sponsor Bank Indonesia"
              required
              className="h-11 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-sans font-medium text-slate-900 focus:border-slate-900 transition-all placeholder:text-slate-400"
            />
          </div>

          {/* Deadline + Instansi */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block mb-2 text-xs font-mono font-extrabold uppercase text-slate-800 tracking-wider">
                Deadline Dibutuhkan
              </label>
              <input
                type="datetime-local"
                name="deadlineAt"
                className="flex h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-sans font-medium text-slate-900 focus:border-slate-900 focus:outline-none cursor-pointer transition-all"
              />
            </div>

            <div>
              <label className="block mb-2 text-xs font-mono font-extrabold uppercase text-slate-800 tracking-wider">
                Instansi / Pihak Tujuan
              </label>
              <Input
                name="targetInstitution"
                placeholder="Contoh: Bank Indonesia, Dekanat FT UNTAD"
                className="h-11 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-sans font-medium text-slate-900 focus:border-slate-900 transition-all placeholder:text-slate-400"
              />
            </div>
          </div>

          {/* Jenis Surat + Kategori */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block mb-2 text-xs font-mono font-extrabold uppercase text-slate-800 tracking-wider">
                Jenis Surat <span className="text-pink-500">*</span>
              </label>
              <select
                name="letterType"
                className="flex h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-sans font-bold text-slate-900 focus:border-slate-900 focus:outline-none cursor-pointer appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2020%2020%22%20fill%3D%22none%22%3E%3Cpath%20d%3D%22M7%209l3%203%203-3%22%20stroke%3D%22%231e293b%22%20stroke-width%3D%221.5%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%3C%2Fsvg%3E')] bg-[length:1.25rem] bg-[right_1rem_center] bg-no-repeat pr-10 shadow-xs"
                required
              >
                <option value="">Pilih jenis surat</option>
                <option value="eksternal">Eksternal</option>
                <option value="internal">Internal</option>
              </select>
            </div>

            <div>
              <label className="block mb-2 text-xs font-mono font-extrabold uppercase text-slate-800 tracking-wider">
                Kategori Surat
              </label>
              <select
                name="category"
                className="flex h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-sans font-bold text-slate-900 focus:border-slate-900 focus:outline-none cursor-pointer appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2020%2020%22%20fill%3D%22none%22%3E%3Cpath%20d%3D%22M7%209l3%203%203-3%22%20stroke%3D%22%231e293b%22%20stroke-width%3D%221.5%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%3C%2Fsvg%3E')] bg-[length:1.25rem] bg-[right_1rem_center] bg-no-repeat pr-10 shadow-xs"
              >
                <option value="">Pilih kategori surat</option>
                <option value="pengantar">Pengantar</option>
                <option value="rekomendasi">Rekomendasi</option>
                <option value="peminjaman">Peminjaman</option>
                <option value="undangan">Undangan</option>
                <option value="permohonan">Permohonan</option>
                <option value="legalitas">Legalitas</option>
              </select>
            </div>
          </div>

          {/* Prioritas Surat */}
          <div>
            <label className="block mb-2 text-xs font-mono font-extrabold uppercase text-slate-800 tracking-wider">
              Tingkat Prioritas
            </label>
            <div className="flex flex-wrap gap-3">
              {[
                { value: "tinggi", label: "🔴 Tinggi", color: "has-[:checked]:border-pink-500 has-[:checked]:bg-pink-50 has-[:checked]:text-pink-700" },
                { value: "sedang", label: "🟡 Sedang", color: "has-[:checked]:border-amber-500 has-[:checked]:bg-amber-50 has-[:checked]:text-amber-700" },
                { value: "rendah", label: "🟢 Rendah", color: "has-[:checked]:border-emerald-500 has-[:checked]:bg-emerald-50 has-[:checked]:text-emerald-700" },
              ].map((item) => (
                <label
                  key={item.value}
                  className={`flex items-center gap-2.5 px-5 py-2.5 rounded-2xl border border-slate-200 bg-white cursor-pointer transition-all font-mono text-xs font-bold text-slate-700 ${item.color} shadow-xs`}
                >
                  <input
                    type="radio"
                    name="priority"
                    value={item.value}
                    defaultChecked={item.value === "sedang"}
                    className="accent-slate-900"
                  />
                  <span>{item.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Maksud & Tujuan Surat */}
          <div>
            <label className="block mb-2 text-xs font-mono font-extrabold uppercase text-slate-800 tracking-wider">
              Maksud & Tujuan Surat <span className="text-pink-500">*</span>
            </label>
            <textarea
              name="body"
              className="flex min-h-[180px] w-full rounded-2xl border border-slate-200 bg-white p-4 text-sm font-sans font-medium text-slate-900 placeholder:text-slate-400 focus:border-slate-900 focus:outline-none resize-y transition-all"
              placeholder="Tulis maksud dan tujuan surat secara jelas di sini..."
              required
            />
          </div>

          {/* Permintaan Opsi Tambahan */}
          <div>
            <label className="block mb-2 text-xs font-mono font-extrabold uppercase text-slate-800 tracking-wider">
              Permintaan Opsi Tambahan <span className="text-slate-400 font-normal lowercase">(opsional)</span>
            </label>
            <textarea
              name="requestOptions"
              className="flex min-h-[90px] w-full rounded-2xl border border-slate-200 bg-white p-4 text-sm font-sans font-medium text-slate-900 placeholder:text-slate-400 focus:border-slate-900 focus:outline-none resize-y transition-all"
              placeholder="Contoh: Surat mohon dilengkapi kop HMTI, 2 rangkap, lampiran proposal sponsorship"
            />
          </div>

          {/* Form Actions Footer */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <Button
              type="button"
              variant="ghost"
              onClick={() => router.back()}
              className="h-11 px-5 rounded-2xl font-mono text-xs font-bold text-slate-500 hover:text-slate-900 cursor-pointer"
            >
              Batal
            </Button>

            <Button
              type="submit"
              disabled={pending}
              className="h-11 px-7 rounded-2xl bg-slate-900 text-white hover:bg-black font-mono text-xs font-bold uppercase tracking-wider cursor-pointer gap-2 shadow-xs"
            >
              {pending ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Mengirim...
                </>
              ) : (
                <>
                  <Send className="size-4 text-pink-400" />
                  Kirim Permohonan Surat
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
