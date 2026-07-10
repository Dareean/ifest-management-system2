"use client";

import { useActionState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createMeeting } from "@/lib/actions/meetings";
import { useRouter } from "next/navigation";

export default function NewMeetingPage() {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(createMeeting, null);

  useEffect(() => {
    if (state?.success) router.push("/dashboard/meetings");
  }, [state, router]);

  return (
    <div className="max-w-2xl flex flex-col gap-8">
      {/* Header */}
      <div>
        <p className="text-[#FF3D8B] font-mono text-xs font-bold tracking-widest uppercase mb-1">
          Meeting Planner
        </p>
        <h1 className="text-4xl font-extrabold tracking-tight text-on-surface">
          Buat Rapat Baru
        </h1>
        <p className="mt-2 text-base text-on-surface-variant">
          Jadwalkan rapat panitia baru, atur agenda, lokasi, dan undang peserta secara terintegrasi.
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
          <div className="flex flex-col sm:flex-row gap-6">
            <div className="flex-1">
              <label className="caption block mb-1.5 text-on-surface-variant font-semibold">
                Judul Rapat
              </label>
              <Input
                name="title"
                placeholder="Contoh: Rapat Koordinasi Divisi Acara"
                required
              />
            </div>
            <div className="sm:w-48">
              <label className="caption block mb-1.5 text-on-surface-variant font-semibold">
                Tipe Rapat
              </label>
              <select
                name="meetingType"
                className="flex h-11 w-full rounded-md border border-primary bg-surface-bright px-4 py-2 text-base font-sans text-on-surface focus:border-accent-magenta focus:outline-none cursor-pointer appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2020%2020%22%20fill%3D%22none%22%3E%3Cpath%20d%3D%22M7%209l3%203%203-3%22%20stroke%3D%22%231d1b1d%22%20stroke-width%3D%221.5%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%3C%2Fsvg%3E')] bg-[length:1.25rem] bg-[right_1rem_center] bg-no-repeat pr-10"
              >
                <option value="scheduled">Terjadwal</option>
                <option value="adhoc">Ad-hoc</option>
              </select>
            </div>
          </div>

          <div>
            <label className="caption block mb-1.5 text-on-surface-variant font-semibold">
              Tanggal & Waktu Mulai
            </label>
            <Input
              name="startedAt"
              type="datetime-local"
              required
            />
          </div>

          <div>
            <label className="caption block mb-1.5 text-on-surface-variant font-semibold">
              Agenda Rapat
            </label>
            <textarea
              name="agenda"
              className="flex min-h-[140px] w-full rounded-md border border-primary bg-surface-bright px-4 py-2 text-base font-sans text-on-surface placeholder:text-on-surface-variant focus:border-accent-magenta focus:outline-none resize-y"
              placeholder="Tulis poin-poin bahasan rapat di sini..."
            />
          </div>

          <div>
            <label className="caption block mb-1.5 text-on-surface-variant font-semibold">
              Tautan Pertemuan (Online - Zoom/GMeet)
            </label>
            <Input
              name="meetingLink"
              placeholder="https://meet.google.com/..."
            />
          </div>

          <div>
            <label className="caption block mb-1.5 text-on-surface-variant font-semibold">
              Lokasi / Ruangan (Offline - opsional)
            </label>
            <Input
              name="location"
              placeholder="Contoh: Sekretariat HMTI / Ruang Rapat Teknik"
            />
          </div>

          <div className="flex gap-2 justify-end mt-2">
            <Button type="button" variant="ghost" onClick={() => router.back()} className="cursor-pointer">
              Batal
            </Button>
            <Button type="submit" disabled={pending} className="cursor-pointer">
              {pending ? "Membuat..." : "Buat Rapat & Kirim Undangan"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
