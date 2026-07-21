"use client";

import { useActionState, useState, useEffect } from "react";
import { inviteMember } from "@/lib/actions/invite-member";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Mail, User, ShieldAlert, Award, Network } from "lucide-react";

interface RoleOption {
  id: string;
  name: string;
  slug: string;
  level: number;
}

const divisionRoleSlugs: Record<string, string[]> = {
  acara: [
    "pic-modul-edukasi-roadshow",
    "pic-tim-kecil-roadshow",
    "pic-draft-rulebook-5-lomba",
    "pic-buku-saku-modul-visitasi",
    "pic-audiensi-mitra-travel",
    "pic-blueprint-expo",
    "pic-kurasi-5-karya-inovasi"
  ],
  humas: [
    "pic-response-time-medsos",
    "pic-eksekusi-surat-lintas-divisi",
    "pic-mou-media-partner",
    "pic-distribusi-surat",
    "pic-survei-venue"
  ],
  sponsorship: [
    "pic-closing-deal-sponsor",
    "pic-database-leads",
    "pic-proposal-kustom",
    "pic-distribusi-proposal-fisik",
    "pic-qc-visual-sponsor",
    "pic-lpj-plakat-sponsor"
  ],
  kreativitas: [
    "pic-konsistensi-brand",
    "pic-zero-bottleneck-buta-warna",
    "pic-content-calendar-bulanan",
    "pic-final-video-h-2",
    "pic-desain-turunan-100",
    "pic-cetak-biru-dekorasi",
    "pic-backup-dokumentasi"
  ],
  "ekonomi-kreatif": [
    "pic-target-dana-usaha",
    "pic-zero-loss-keuangan",
    "pic-target-penjualan-rutin",
    "pic-produksi-merchandise",
    "pic-dp-tenant-umkm"
  ],
  konsumsi: [
    "pic-fiksasi-vendor-catering",
    "pic-riders-vip",
    "pic-distribusi-ransum",
    "pic-loading-konsumsi"
  ],
  logistik: [
    "pic-kesiapan-properti-roadshow",
    "pic-pengembalian-barang-pinjaman",
    "pic-verifikasi-anggaran-barang",
    "pic-pengecekan-alat-h-2"
  ],
  lapangan: [
    "pic-area-venue-siap-h-1",
    "pic-cetak-biru-keamanan-ring-1",
    "pic-navigasi-vip",
    "pic-delay-taktis-maksimal-3-menit",
    "pic-0-penumpukan-massa",
    "pic-backup-genset",
    "pic-changeover-panggung"
  ],
  keamanan: [
    "pic-personel-keamanan-eksternal",
    "pic-sterilisasi-backstage",
    "pic-0-kebocoran-tiket",
    "pic-keamanan-roadshow",
    "pic-posko-p3k"
  ]
};

export function InviteForm({ 
  roles, 
  divisions 
}: { 
  roles: RoleOption[]; 
  divisions?: { id: string; name: string; slug: string }[] 
}) {
  const [state, formAction, pending] = useActionState(inviteMember, null);
  const [selectedDivisionId, setSelectedDivisionId] = useState("");
  const [selectedRoleId, setSelectedRoleId] = useState("");

  const isBPHInviter = !!divisions;
  
  // Find selected division's slug
  const selectedDiv = divisions?.find((d) => d.id === selectedDivisionId);
  const selectedSlug = isBPHInviter 
    ? (selectedDivisionId === "" ? "bph" : selectedDiv?.slug || "")
    : "";

  // Dynamic role filtering based on selected division
  const filteredRoles = roles.filter((r) => {
    if (selectedSlug === "bph") {
      return ["sekretaris-1", "sekretaris-2", "bendahara", "wakil-ketua", "ketua-panitia"].includes(r.slug);
    } else {
      const standardSlugs = ["wakil-koordinator", "anggota"];
      if (isBPHInviter) {
        standardSlugs.push("koordinator");
      }

      // Load specific PIC roles corresponding to this division
      const divisionSpecificPics = divisionRoleSlugs[selectedSlug] || [];
      
      const allowedSlugs = [...standardSlugs, ...divisionSpecificPics];
      
      // Only fallback to generic pic-sub if no division-specific roles are defined
      if (divisionSpecificPics.length === 0) {
        allowedSlugs.push("pic-sub");
      }
      
      return allowedSlugs.includes(r.slug);
    }
  });

  // Reset selected role if it is no longer valid under the newly selected division
  useEffect(() => {
    if (selectedRoleId && !filteredRoles.some((r) => r.id === selectedRoleId)) {
      setSelectedRoleId("");
    }
  }, [selectedDivisionId, filteredRoles, selectedRoleId]);

  return (
    <form action={formAction} className="bg-white border border-outline-variant/40 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col gap-6">
      {state?.error && (
        <div className="bg-error-container/20 text-error text-sm font-semibold px-4 py-3.5 rounded-2xl border border-error/20 flex items-start gap-2.5">
          <ShieldAlert className="size-5 shrink-0 mt-0.5" />
          <span>{state.error}</span>
        </div>
      )}
      {state?.success && (
        <div className="bg-accent-green/10 text-accent-green text-sm font-semibold px-4 py-3.5 rounded-2xl border border-accent-green/20">
          Anggota berhasil diundang! Email sambutan telah dikirim ke alamat email tujuan.
        </div>
      )}

      {/* Row 1: Nama Lengkap & NIM */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="flex flex-col gap-2">
          <label htmlFor="full_name" className="text-sm font-bold text-on-surface font-sans flex items-center gap-1.5">
            <User className="size-4 text-on-surface-variant/60" />
            Nama Lengkap
          </label>
          <input
            id="full_name"
            name="full_name"
            type="text"
            required
            placeholder="contoh: Jane Doe"
            className="px-4 py-3 rounded-2xl border border-outline-variant/60 bg-surface-container-lowest text-on-surface text-sm font-sans outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-200"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="nim" className="text-sm font-bold text-on-surface font-sans flex items-center gap-1.5">
            <span className="font-mono text-xs text-on-surface-variant/60 font-bold">#</span>
            NIM (Nomor Induk Mahasiswa)
          </label>
          <input
            id="nim"
            name="nim"
            type="text"
            required
            placeholder="contoh: F55124001"
            className="px-4 py-3 rounded-2xl border border-outline-variant/60 bg-surface-container-lowest text-on-surface text-sm font-sans outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-200"
          />
        </div>
      </div>

      {/* Row 2: Email */}
      <div className="flex flex-col gap-2">
        <label htmlFor="email" className="text-sm font-bold text-on-surface font-sans flex items-center gap-1.5">
          <Mail className="size-4 text-on-surface-variant/60" />
          Alamat Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          placeholder="contoh: jane@gmail.com"
          className="w-full px-4 py-3 rounded-2xl border border-outline-variant/60 bg-surface-container-lowest text-on-surface text-sm font-sans outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-200"
        />
        <span className="text-xs text-on-surface-variant/60 font-medium ml-1">Kredensial login default akan dikirimkan langsung ke email ini.</span>
      </div>

      {/* Row 3: Role & Divisi */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="flex flex-col gap-2">
          <label htmlFor="role_id" className="text-sm font-bold text-on-surface font-sans flex items-center gap-1.5">
            <Award className="size-4 text-on-surface-variant/60" />
            Peran (Role / Tanggung Jawab)
          </label>
          <div className="relative">
            <select
              id="role_id"
              name="role_id"
              required
              value={selectedRoleId}
              onChange={(e) => setSelectedRoleId(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl border border-outline-variant/60 bg-surface-container-lowest text-on-surface text-sm font-sans outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-200 appearance-none cursor-pointer"
            >
              <option value="">Pilih peran...</option>
              {filteredRoles.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-on-surface-variant/60">
              <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
              </svg>
            </div>
          </div>
        </div>

        {divisions ? (
          <div className="flex flex-col gap-2">
            <label htmlFor="division_id" className="text-sm font-bold text-on-surface font-sans flex items-center gap-1.5">
              <Network className="size-4 text-on-surface-variant/60" />
              Divisi Penugasan
            </label>
            <div className="relative">
              <select
                id="division_id"
                name="division_id"
                value={selectedDivisionId}
                onChange={(e) => setSelectedDivisionId(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl border border-outline-variant/60 bg-surface-container-lowest text-on-surface text-sm font-sans outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-200 appearance-none cursor-pointer"
              >
                <option value="">Divisi sendiri (default)</option>
                {divisions.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-on-surface-variant/60">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                  <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                </svg>
              </div>
            </div>
          </div>
        ) : (
          <div className="hidden sm:block" />
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-3 pt-4 border-t border-outline-variant/40 mt-2">
        <Button
          type="submit"
          disabled={pending}
          variant="primary"
          className="cursor-pointer font-sans text-sm font-bold px-6 py-5 rounded-xl shadow-md transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
        >
          {pending ? "Mengundang..." : "Undang Anggota"}
        </Button>
        <Link
          href="/dashboard/members"
          className="px-5 py-2.5 rounded-xl border border-outline-variant/60 bg-white hover:bg-surface-container text-sm font-bold text-on-surface-variant hover:text-on-surface transition-all font-sans"
        >
          Batal
        </Link>
      </div>
    </form>
  );
}
