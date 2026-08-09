"use client";

import { useActionState, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  User,
  Shield,
  KeyRound,
  TrendingUp,
  Camera,
  Loader2,
  Mail,
  Hash,
  Phone,
  Calendar,
  FileText,
  CheckCircle2,
  CalendarDays,
  CheckSquare,
  ExternalLink,
  Pencil,
  Lock,
  Save,
} from "lucide-react";
import { updateProfile, changePassword } from "@/lib/actions/profile";
import type { ProfileData } from "@/lib/data/profile";

export function ProfileClient({ profile }: { profile: ProfileData }) {
  const [editing, setEditing] = useState(false);
  const [state, formAction, pending] = useActionState(updateProfile, null);
  const [pwState, pwAction, pwPending] = useActionState(changePassword, null);

  const [avatarUrl, setAvatarUrl] = useState(profile.avatarUrl || "");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const getInitials = (name: string) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setUploadError("Ukuran gambar maksimal 2MB.");
      return;
    }

    setUploading(true);
    setUploadError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "avatars");

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = (await response.json()) as { url?: string; error?: string };
      if (response.ok && data.url) {
        setAvatarUrl(data.url);
      } else {
        setUploadError(data.error || "Gagal mengunggah foto.");
      }
    } catch (err) {
      console.error("Avatar upload error:", err);
      setUploadError("Terjadi kesalahan saat mengunggah foto.");
    } finally {
      setUploading(false);
    }
  };

  const formattedPhone = profile.phone ? profile.phone.replace(/[^0-9]/g, "") : null;
  const waUrl = formattedPhone ? `https://wa.me/${formattedPhone.startsWith("0") ? "62" + formattedPhone.slice(1) : formattedPhone}` : null;

  return (
    <div className="w-full flex flex-col gap-6 md:gap-8">
      {/* Header — DESIGN.md Section 3 Eyebrow + H1 Pattern */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-accent-magenta">
            Akun Panitia
          </span>
          <h1 className="font-extrabold text-3xl md:text-4xl tracking-tight text-on-surface">
            Profil Pengguna
          </h1>
        </div>
        <Button
          onClick={() => setEditing(!editing)}
          className={`cursor-pointer shrink-0 font-bold text-xs px-4 py-2.5 rounded-xl transition-all shadow-sm ${
            editing
              ? "border border-[#04000D]/10 bg-white text-on-surface hover:bg-slate-50"
              : "bg-[#04000D] text-white hover:bg-black"
          }`}
        >
          <Pencil className="size-4" />
          {editing ? "Batal Edit" : "Edit Profil"}
        </Button>
      </div>

      {/* Main Grid Layout (DESIGN.md Grid Pattern: lg:col-span-2 left, 1 column right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 md:gap-6 items-start">
        {/* Left Column (2/3 Width): Data Diri & Password Form */}
        <div className="lg:col-span-2 flex flex-col gap-5 md:gap-6">
          {/* Card 1: Informasi Data Diri (DESIGN.md Standard Card Recipe) */}
          <div className="bg-white border border-[#04000D]/5 shadow-[0_8px_30px_rgb(0,0,0,0.015)] rounded-2xl p-5 sm:p-6">
            <div className="flex items-center justify-between border-b border-[#04000D]/5 pb-4 mb-5">
              <div>
                <h2 className="font-extrabold text-xl text-on-surface flex items-center gap-2">
                  <User className="size-5 text-accent-magenta" /> Informasi Data Diri
                </h2>
                <p className="text-xs font-medium text-on-surface-variant/70 mt-1">
                  Kelola data identitas dan kontak WhatsApp yang dapat dilihat oleh panitia lain
                </p>
              </div>
              {editing && (
                <span className="font-mono text-[9px] font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200/50 uppercase shrink-0">
                  MODE EDIT AKTIF
                </span>
              )}
            </div>

            {state?.error && (
              <div className="font-mono text-xs text-error bg-error-container/20 border border-error/20 rounded-xl p-4 mb-5">
                {state.error}
              </div>
            )}
            {state?.success && (
              <div className="font-mono text-xs text-green-800 bg-[#DCEEB1]/20 border border-[#DCEEB1]/50 rounded-xl p-4 mb-5">
                Profil berhasil diperbarui dan disinkronkan ke seluruh sistem!
              </div>
            )}

            <form action={formAction} className="flex flex-col gap-5">
              <input type="hidden" name="userId" value={profile.userId ?? ""} />
              <input type="hidden" name="avatarUrl" value={avatarUrl} />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* Full Name */}
                <div>
                  <label className="caption block mb-1.5 text-on-surface-variant font-bold">
                    Nama Lengkap
                  </label>
                  <Input
                    name="fullName"
                    defaultValue={profile.fullName}
                    disabled={!editing}
                    className={!editing ? "opacity-60 bg-slate-50 cursor-not-allowed" : ""}
                    required
                  />
                </div>

                {/* NIM */}
                <div>
                  <label className="caption block mb-1.5 text-on-surface-variant font-bold flex items-center gap-1.5">
                    <Hash className="size-3.5" /> NIM
                  </label>
                  <Input
                    name="nim"
                    defaultValue={profile.nim}
                    disabled={!editing}
                    className={!editing ? "opacity-60 bg-slate-50 cursor-not-allowed" : ""}
                    required
                  />
                </div>

                {/* Email (Readonly) */}
                <div>
                  <label className="caption block mb-1.5 text-on-surface-variant font-bold flex items-center gap-1.5">
                    <Mail className="size-3.5" /> Email
                  </label>
                  <Input
                    value={profile.email ?? ""}
                    disabled
                    className="opacity-60 bg-slate-50 cursor-not-allowed"
                  />
                </div>

                {/* Phone */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="caption block text-on-surface-variant font-bold flex items-center gap-1.5">
                      <Phone className="size-3.5" /> No. HP / WhatsApp
                    </label>
                    {waUrl && (
                      <a
                        href={waUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-mono text-xs font-bold text-green-700 hover:underline flex items-center gap-1"
                      >
                        Uji WA ↗
                      </a>
                    )}
                  </div>
                  <Input
                    name="phone"
                    defaultValue={profile.phone ?? ""}
                    disabled={!editing}
                    className={!editing ? "opacity-60 bg-slate-50 cursor-not-allowed" : ""}
                    placeholder="Contoh: 081234567890"
                  />
                </div>
              </div>

              {editing && (
                <div className="flex justify-end mt-2">
                  <Button type="submit" disabled={pending} className="cursor-pointer font-bold bg-[#04000D] text-white hover:bg-black">
                    <Save className="size-4" />
                    {pending ? "Menyimpan..." : "Simpan Perubahan"}
                  </Button>
                </div>
              )}
            </form>
          </div>

          {/* Card 2: Keamanan & Password */}
          <div className="bg-white border border-[#04000D]/5 shadow-[0_8px_30px_rgb(0,0,0,0.015)] rounded-2xl p-5 sm:p-6">
            <div className="border-b border-[#04000D]/5 pb-4 mb-5">
              <h2 className="font-extrabold text-xl text-on-surface flex items-center gap-2">
                <Lock className="size-5 text-accent-magenta" /> Keamanan & Password
              </h2>
              <p className="text-xs font-medium text-on-surface-variant/70 mt-1">
                Ganti kata sandi akun Anda secara berkala untuk menjaga keamanan data
              </p>
            </div>

            {pwState?.error && (
              <div className="font-mono text-xs text-error bg-error-container/20 border border-error/20 rounded-xl p-4 mb-5">
                {pwState.error}
              </div>
            )}
            {pwState?.success && (
              <div className="font-mono text-xs text-green-800 bg-[#DCEEB1]/20 border border-[#DCEEB1]/50 rounded-xl p-4 mb-5">
                Password berhasil diperbarui!
              </div>
            )}

            <form action={pwAction} className="flex flex-col gap-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="caption block mb-1.5 text-on-surface-variant font-bold">
                    Password Baru
                  </label>
                  <Input
                    type="password"
                    name="password"
                    required
                    placeholder="Minimal 6 karakter"
                  />
                </div>

                <div>
                  <label className="caption block mb-1.5 text-on-surface-variant font-bold">
                    Konfirmasi Password
                  </label>
                  <Input
                    type="password"
                    name="confirmPassword"
                    required
                    placeholder="Ulangi password baru"
                  />
                </div>
              </div>

              <div className="flex justify-end mt-2">
                <Button type="submit" disabled={pwPending} className="cursor-pointer font-bold bg-[#04000D] text-white hover:bg-black">
                  {pwPending ? "Memproses..." : "Perbarui Password"}
                </Button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Column (1/3 Width): DESIGN.md Identitas Card & Stat Counters */}
        <div className="flex flex-col gap-5 md:gap-6">
          {/* Card 1: Identitas & Foto Panitia (DESIGN.md Profile Card Recipe) */}
          <div className="bg-white border border-[#04000D]/5 shadow-[0_8px_30px_rgb(0,0,0,0.015)] rounded-2xl p-5 sm:p-6 flex flex-col items-center text-center space-y-4">
            <div className="flex items-center justify-between w-full border-b border-[#04000D]/5 pb-3 mb-1">
              <h3 className="font-extrabold text-base text-on-surface flex items-center gap-2">
                <Shield className="size-4 text-accent-magenta" /> Identitas Panitia
              </h3>
              {profile.assignment?.isActive && (
                <span className="font-mono text-[9px] font-bold px-2 py-0.5 rounded bg-[#DCEEB1]/30 text-green-800 border border-[#DCEEB1]/50 uppercase">
                  AKTIF
                </span>
              )}
            </div>

            {/* Avatar Box (DESIGN.md Line 208 Avatar Kotak Inisial) */}
            <div className="relative group shrink-0 select-none my-2">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={profile.fullName}
                  className="size-24 rounded-2xl object-cover border border-[#04000D]/10 shadow-sm"
                />
              ) : (
                <div className="size-24 rounded-2xl bg-[#04000D] text-[#DCEEB1] font-mono font-bold text-3xl flex items-center justify-center border border-[#04000D]/10">
                  {getInitials(profile.fullName)}
                </div>
              )}

              <label className="absolute inset-0 rounded-2xl bg-black/60 flex flex-col items-center justify-center cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity text-white gap-1">
                {uploading ? (
                  <Loader2 className="size-5 animate-spin" />
                ) : (
                  <>
                    <Camera className="size-5 text-[#DCEEB1]" />
                    <span className="font-mono text-[9px] font-bold uppercase tracking-wider text-[#DCEEB1]">Ubah Foto</span>
                  </>
                )}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarChange}
                  disabled={uploading}
                />
              </label>
            </div>

            {/* User Detail Summary */}
            <div className="space-y-1 w-full">
              <h3 className="font-extrabold text-lg text-on-surface truncate">{profile.fullName || "Nama Panitia"}</h3>
              <p className="font-mono text-xs text-on-surface-variant/80">NIM: {profile.nim || "-"}</p>
              <p className="font-mono text-xs text-on-surface-variant/60 truncate">{profile.email ?? "-"}</p>
            </div>

            {profile.assignment && (
              <div className="w-full pt-3 border-t border-[#04000D]/5 flex flex-col gap-2 text-left">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-on-surface-variant/70 font-medium">Divisi</span>
                  <span className="font-bold text-on-surface font-mono">{profile.assignment.division}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-on-surface-variant/70 font-medium">Jabatan</span>
                  <span className="font-bold text-accent-magenta font-mono">{profile.assignment.role}</span>
                </div>
              </div>
            )}
          </div>

          {/* Card 2: Ringkasan Aktivitas (DESIGN.md Stat Cards) */}
          {profile.assignment && (
            <div className="bg-white border border-[#04000D]/5 shadow-[0_8px_30px_rgb(0,0,0,0.015)] rounded-2xl p-5 sm:p-6 space-y-4">
              <div className="border-b border-[#04000D]/5 pb-3">
                <h3 className="font-extrabold text-base text-on-surface flex items-center gap-2">
                  <TrendingUp className="size-4 text-accent-magenta" /> Ringkasan Aktivitas
                </h3>
                <p className="text-[11px] font-medium text-on-surface-variant/70 mt-0.5">
                  Partisipasi & pencapaian tugas panitia
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3.5 rounded-xl bg-slate-50 border border-[#04000D]/5 text-center">
                  <p className="font-mono text-[9px] font-bold uppercase text-on-surface-variant/50 tracking-wider">SURAT</p>
                  <p className="font-extrabold text-2xl text-on-surface mt-1">{profile.stats.totalLetters}</p>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-50 border border-[#04000D]/5 text-center">
                  <p className="font-mono text-[9px] font-bold uppercase text-on-surface-variant/50 tracking-wider">RAPAT</p>
                  <p className="font-extrabold text-2xl text-on-surface mt-1">{profile.stats.totalMeetings}</p>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-50 border border-[#04000D]/5 text-center">
                  <p className="font-mono text-[9px] font-bold uppercase text-on-surface-variant/50 tracking-wider">TOTAL TASK</p>
                  <p className="font-extrabold text-2xl text-on-surface mt-1">{profile.stats.totalTasks}</p>
                </div>
                <div className="p-3.5 rounded-xl bg-[#DCEEB1]/20 border border-[#DCEEB1]/50 text-center">
                  <p className="font-mono text-[9px] font-bold uppercase text-green-800 tracking-wider">SELESAI</p>
                  <p className="font-extrabold text-2xl text-green-800 mt-1">{profile.stats.doneTasks}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
