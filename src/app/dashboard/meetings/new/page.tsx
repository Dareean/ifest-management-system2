"use client";

import { useActionState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ColorBlock } from "@/components/blocks/color-block";
import { createMeeting } from "@/lib/actions/meetings";
import { useRouter } from "next/navigation";

export default function NewMeetingPage() {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(createMeeting, null);

  useEffect(() => {
    if (state?.success) router.push("/dashboard/meetings");
  }, [state, router]);

  return (
    <div className="max-w-2xl">
      <p className="eyebrow text-on-surface-variant mb-xs">Meeting Planner</p>
      <h1 className="text-3xl font-semibold tracking-tight leading-none mb-xl">
        Buat Rapat Baru
      </h1>

      {state?.error && (
        <p className="text-red-500 caption mb-md">{state.error}</p>
      )}

      <ColorBlock color="coral">
        <form action={formAction} className="flex flex-col gap-md">
          <div className="flex gap-md">
            <div className="flex-1">
              <label className="caption block mb-xs text-on-surface-variant">
                Judul Rapat
              </label>
              <Input
                name="title"
                placeholder="Contoh: Rapat Koordinasi Divisi Acara"
                required
              />
            </div>
            <div>
              <label className="caption block mb-xs text-on-surface-variant">
                Tipe
              </label>
              <select
                name="meetingType"
                className="flex h-11 w-40 rounded-md border border-primary bg-surface-bright px-4 py-2 text-base font-sans text-on-surface focus:border-accent-magenta focus:outline-none"
              >
                <option value="scheduled">Terjadwal</option>
                <option value="adhoc">Ad-hoc</option>
              </select>
            </div>
          </div>

          <div>
            <label className="caption block mb-xs text-on-surface-variant">
              Tanggal & Waktu
            </label>
            <Input
              name="startedAt"
              type="datetime-local"
              required
            />
          </div>

          <div>
            <label className="caption block mb-xs text-on-surface-variant">
              Agenda
            </label>
            <textarea
              name="agenda"
              className="flex min-h-[120px] w-full rounded-md border border-primary bg-surface-bright px-4 py-2 text-base font-sans text-on-surface placeholder:text-on-surface-variant focus:border-accent-magenta focus:outline-none resize-y"
              placeholder="Tulis agenda rapat..."
            />
          </div>

          <div>
            <label className="caption block mb-xs text-on-surface-variant">
              Link Meeting (Zoom/GMeet)
            </label>
            <Input
              name="meetingLink"
              placeholder="https://meet.google.com/..."
            />
          </div>

          <div>
            <label className="caption block mb-xs text-on-surface-variant">
              Lokasi (opsional)
            </label>
            <Input
              name="location"
              placeholder="Contoh: Ruang Rapat HMTI"
            />
          </div>

          <Button type="submit" disabled={pending}>
            {pending ? "Membuat..." : "Buat Rapat & Kirim Undangan"}
          </Button>
        </form>
      </ColorBlock>
    </div>
  );
}
