"use client";

import { useActionState, useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  createDivision, updateDivision,
  createRole, updateRole,
  createYear,
  createAssignment,
} from "@/lib/actions/admin";

// ============================================================
// Division Form
// ============================================================

export function DivisionFormModal({ open, onClose, initial }: {
  open: boolean;
  onClose: () => void;
  initial?: { id: string; name: string; slug: string; description: string | null; sort_order: number } | null;
}) {
  const action = initial ? updateDivision : createDivision;
  const [state, formAction, pending] = useActionState(action, null);

  return (
    <Modal open={open} onClose={onClose} title={initial ? "Edit Divisi" : "Tambah Divisi"}>
      {state?.error && <p className="text-red-500 caption mb-md">{state.error}</p>}
      {state?.success && !initial && <p className="text-green-600 caption mb-md">Divisi berhasil dibuat!</p>}
      <form action={formAction} className="flex flex-col gap-md">
        {initial && <input type="hidden" name="id" value={initial.id} />}
        <div>
          <label className="caption block mb-xs text-on-surface-variant">Nama Divisi</label>
          <Input name="name" defaultValue={initial?.name} required />
        </div>
        <div>
          <label className="caption block mb-xs text-on-surface-variant">Slug</label>
          <Input name="slug" defaultValue={initial?.slug} required placeholder="contoh: divisi-baru" />
        </div>
        <div>
          <label className="caption block mb-xs text-on-surface-variant">Deskripsi</label>
          <Input name="description" defaultValue={initial?.description ?? ""} />
        </div>
        <div>
          <label className="caption block mb-xs text-on-surface-variant">Urutan</label>
          <Input name="sort_order" type="number" defaultValue={initial?.sort_order ?? 0} />
        </div>
        <div className="flex gap-sm justify-end">
          <Button type="button" variant="ghost" onClick={onClose}>Batal</Button>
          <Button type="submit" disabled={pending}>
            {pending ? "Menyimpan..." : initial ? "Simpan" : "Buat Divisi"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

// ============================================================
// Role Form
// ============================================================

export function RoleFormModal({ open, onClose, initial }: {
  open: boolean;
  onClose: () => void;
  initial?: { id: string; name: string; slug: string; level: number; is_approver: boolean; is_meeting_creator: boolean } | null;
}) {
  const action = initial ? updateRole : createRole;
  const [state, formAction, pending] = useActionState(action, null);

  return (
    <Modal open={open} onClose={onClose} title={initial ? "Edit Role" : "Tambah Role"}>
      {state?.error && <p className="text-red-500 caption mb-md">{state.error}</p>}
      <form action={formAction} className="flex flex-col gap-md">
        {initial && <input type="hidden" name="id" value={initial.id} />}
        <div>
          <label className="caption block mb-xs text-on-surface-variant">Nama Role</label>
          <Input name="name" defaultValue={initial?.name} required />
        </div>
        <div>
          <label className="caption block mb-xs text-on-surface-variant">Slug</label>
          <Input name="slug" defaultValue={initial?.slug} required />
        </div>
        <div>
          <label className="caption block mb-xs text-on-surface-variant">Level (semakin tinggi semakin berwenang)</label>
          <Input name="level" type="number" defaultValue={initial?.level ?? 50} />
        </div>
        <div className="flex gap-xl">
          <label className="flex items-center gap-xs cursor-pointer">
            <input type="checkbox" name="is_approver" defaultChecked={initial?.is_approver} className="size-4" />
            <span className="caption">Approver</span>
          </label>
          <label className="flex items-center gap-xs cursor-pointer">
            <input type="checkbox" name="is_meeting_creator" defaultChecked={initial?.is_meeting_creator} className="size-4" />
            <span className="caption">Meeting Creator</span>
          </label>
        </div>
        <div className="flex gap-sm justify-end">
          <Button type="button" variant="ghost" onClick={onClose}>Batal</Button>
          <Button type="submit" disabled={pending}>
            {pending ? "Menyimpan..." : initial ? "Simpan" : "Buat Role"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

// ============================================================
// Year Form
// ============================================================

export function YearFormModal({ open, onClose, years }: {
  open: boolean;
  onClose: () => void;
  years: { id: string; label: string }[];
}) {
  const [state, formAction, pending] = useActionState(createYear, null);

  return (
    <Modal open={open} onClose={onClose} title="Buat Tahun Baru">
      {state?.error && <p className="text-red-500 caption mb-md">{state.error}</p>}
      <form action={formAction} className="flex flex-col gap-md">
        <div>
          <label className="caption block mb-xs text-on-surface-variant">Label</label>
          <Input name="label" placeholder="Contoh: I-FEST 2027" required />
        </div>
        <div>
          <label className="caption block mb-xs text-on-surface-variant">Tanggal Mulai</label>
          <Input name="started_at" type="date" required />
        </div>
        <div>
          <label className="caption block mb-xs text-on-surface-variant">Tanggal Selesai (opsional)</label>
          <Input name="ended_at" type="date" />
        </div>
        {years.length > 0 && (
          <div>
            <label className="caption block mb-xs text-on-surface-variant">Copy struktur dari tahun sebelumnya</label>
            <select
              name="copy_from"
              className="flex h-11 w-full rounded-md border border-primary bg-surface-bright px-4 py-2 text-base font-sans text-on-surface focus:border-accent-magenta focus:outline-none"
            >
              <option value="">Jangan copy</option>
              {years.map((y) => (
                <option key={y.id} value={y.id}>{y.label}</option>
              ))}
            </select>
          </div>
        )}
        <div className="flex gap-sm justify-end">
          <Button type="button" variant="ghost" onClick={onClose}>Batal</Button>
          <Button type="submit" disabled={pending}>
            {pending ? "Membuat..." : "Buat Tahun Baru"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

// ============================================================
// Assignment Form
// ============================================================

export function AssignmentFormModal({ open, onClose, divisions, roles }: {
  open: boolean;
  onClose: () => void;
  divisions: { id: string; name: string }[];
  roles: { id: string; name: string }[];
}) {
  const [state, formAction, pending] = useActionState(createAssignment, null);

  return (
    <Modal open={open} onClose={onClose} title="Assign Personel">
      {state?.error && <p className="text-red-500 caption mb-md">{state.error}</p>}
      <form action={formAction} className="flex flex-col gap-md">
        <div>
          <label className="caption block mb-xs text-on-surface-variant">Nama Lengkap</label>
          <Input name="full_name" required placeholder="Nama sesuai SK" />
        </div>
        <div>
          <label className="caption block mb-xs text-on-surface-variant">NIM</label>
          <Input name="nim" required placeholder="F52124001" />
        </div>
        <div>
          <label className="caption block mb-xs text-on-surface-variant">Email</label>
          <Input name="email" type="email" required placeholder="nama@example.com" />
        </div>
        <div>
          <label className="caption block mb-xs text-on-surface-variant">Divisi</label>
          <select
            name="division_id"
            className="flex h-11 w-full rounded-md border border-primary bg-surface-bright px-4 py-2 text-base font-sans text-on-surface focus:border-accent-magenta focus:outline-none"
            required
          >
            <option value="">Pilih divisi</option>
            {divisions.map((d) => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="caption block mb-xs text-on-surface-variant">Role</label>
          <select
            name="role_id"
            className="flex h-11 w-full rounded-md border border-primary bg-surface-bright px-4 py-2 text-base font-sans text-on-surface focus:border-accent-magenta focus:outline-none"
            required
          >
            <option value="">Pilih role</option>
            {roles.map((r) => (
              <option key={r.id} value={r.id}>{r.name}</option>
            ))}
          </select>
        </div>
        <div className="flex gap-sm justify-end">
          <Button type="button" variant="ghost" onClick={onClose}>Batal</Button>
          <Button type="submit" disabled={pending}>
            {pending ? "Menyimpan..." : "Assign"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
