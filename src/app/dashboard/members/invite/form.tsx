"use client";

import { useActionState } from "react";
import { inviteMember } from "@/lib/actions/invite-member";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface RoleOption {
  id: string;
  name: string;
  slug: string;
  level: number;
}

export function InviteForm({ roles }: { roles: RoleOption[] }) {
  const [state, formAction, pending] = useActionState(inviteMember, null);

  return (
    <form action={formAction} className="flex flex-col gap-6">
      {state?.error && (
        <div className="bg-error-container text-error text-sm font-medium px-4 py-3 rounded-xl border border-error/20">
          {state.error}
        </div>
      )}
      {state?.success && (
        <div className="bg-accent-green/10 text-accent-green text-sm font-medium px-4 py-3 rounded-xl border border-accent-green/20">
          Anggota berhasil diundang! Email sambutan telah dikirim.
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="full_name" className="text-sm font-bold text-on-surface font-sans">
            Nama Lengkap
          </label>
          <input
            id="full_name"
            name="full_name"
            type="text"
            required
            placeholder="contoh: Jane Doe"
            className="px-4 py-3 rounded-xl border border-outline-variant/60 bg-white text-on-surface text-sm font-sans outline-none focus:border-primary transition-colors"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="nim" className="text-sm font-bold text-on-surface font-sans">
            NIM
          </label>
          <input
            id="nim"
            name="nim"
            type="text"
            required
            placeholder="contoh: F55124001"
            className="px-4 py-3 rounded-xl border border-outline-variant/60 bg-white text-on-surface text-sm font-sans outline-none focus:border-primary transition-colors"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="email" className="text-sm font-bold text-on-surface font-sans">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            placeholder="contoh: jane@gmail.com"
            className="px-4 py-3 rounded-xl border border-outline-variant/60 bg-white text-on-surface text-sm font-sans outline-none focus:border-primary transition-colors"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="role_id" className="text-sm font-bold text-on-surface font-sans">
            Role
          </label>
          <select
            id="role_id"
            name="role_id"
            required
            className="px-4 py-3 rounded-xl border border-outline-variant/60 bg-white text-on-surface text-sm font-sans outline-none focus:border-primary transition-colors"
          >
            <option value="">Pilih role...</option>
            {roles.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex items-center gap-3 pt-2">
        <Button type="submit" variant="primary" disabled={pending} className="cursor-pointer font-sans text-sm font-semibold">
          {pending ? "Mengundang..." : "Undang Anggota"}
        </Button>
        <Link href="/dashboard/members" className="text-sm font-medium text-on-surface-variant hover:text-on-surface transition-colors font-sans">
          Batal
        </Link>
      </div>
    </form>
  );
}
