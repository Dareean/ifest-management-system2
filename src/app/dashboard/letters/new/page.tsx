"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ColorBlock } from "@/components/blocks/color-block";
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
    <div className="max-w-2xl">
      <p className="eyebrow text-on-surface-variant mb-xs">Sistem Surat</p>
      <h1 className="text-3xl font-semibold tracking-tight leading-none mb-xl">
        Ajukan Permohonan Surat
      </h1>

      {state?.error && (
        <p className="text-red-500 caption mb-md">{state.error}</p>
      )}

      <ColorBlock color="mint">
        <form action={formAction} className="flex flex-col gap-md">
          <div>
            <label className="caption block mb-xs text-on-surface-variant">
              Jenis Surat
            </label>
            <select
              name="letterType"
              className="flex h-11 w-full rounded-md border border-primary bg-surface-bright px-4 py-2 text-base font-sans text-on-surface focus:border-accent-magenta focus:outline-none"
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
            <label className="caption block mb-xs text-on-surface-variant">
              Perihal
            </label>
            <Input
              name="subject"
              placeholder="Contoh: Permohonan Sponsor Bank Indonesia"
              required
            />
          </div>

          <div>
            <label className="caption block mb-xs text-on-surface-variant">
              Isi Surat
            </label>
            <textarea
              name="body"
              className="flex min-h-[200px] w-full rounded-md border border-primary bg-surface-bright px-4 py-2 text-base font-sans text-on-surface placeholder:text-on-surface-variant focus:border-accent-magenta focus:outline-none resize-y"
              placeholder="Tulis isi surat di sini..."
              required
            />
          </div>

          <Button type="submit" disabled={pending}>
            {pending ? "Mengirim..." : "Ajukan Surat"}
          </Button>
        </form>
      </ColorBlock>
    </div>
  );
}
