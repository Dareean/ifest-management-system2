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
    <div className="w-full flex flex-col gap-8">
      {/* Header (Matching main dashboard style) */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-accent-magenta font-mono text-xs font-bold tracking-widest uppercase mb-1">
            AKUN PANITIA
          </p>
          <h1 className="text-4xl font-extrabold tracking-tight text-on-surface">
            Profil Pengguna
          </h1>
        </div>
        <Button
          variant={editing ? "outline" : "primary"}
          size="sm"
          onClick={() => setEditing(!editing)}
          className="cursor-pointer shrink-0 font-bold"
        >
          <Pencil className="size-4" />
          {editing ? "Batal Edit" : "Edit Profil"}
        </Button>
      </div>

      {/* Main Grid Layout (2/3 Left Column, 1/3 Right Column) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Column (2/3 Width): Data Diri & Password Form */}
        <div className="lg:col-span-2 flex flex-col gap-8">
          {/* Card 1: Informasi Data Diri */}
          <div className="bg-white border border-outline-variant/60 rounded-2xl p-6 sm:p-8">
            <div className="flex items-center justify-between border-b border-outline-variant/20 pb-4 mb-6">
              <div>
                <h2 className="text-xl font-extrabold text-on-surface flex items-center gap-2.5">
                  <User className="size-5 text-primary" /> Informasi Data Diri
                </h2>
                <p className="text-xs text-on-surface-variant font-medium mt-1">
                  Kelola data identitas dan kontak WhatsApp yang dapat dilihat oleh panitia lain
                </p>
              </div>
              {editing && (
                <span className="text-[10px] font-mono font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-300 shrink-0">
                  MODE EDIT AKTIF
                </span>
              )}
            </div>

            {state?.error && (
              <div className="text-sm text-error bg-error-container rounded-lg p-4 font-mono mb-6">
                {state.error}
              </div>
            )}
            {state?.success && (
              <div className="text-sm text-accent-green bg-accent-green/10 border border-accent-green/30 rounded-lg p-4 font-mono mb-6">
                Profil berhasil diperbarui dan disinkronkan ke seluruh sistem!
              </div>
            )}

            <form action={formAction} className="flex flex-col gap-6">
              <input type="hidden" name="userId" value={profile.userId ?? ""} />
              <input type="hidden" name="avatarUrl" value={avatarUrl} />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Full Name */}
                <div>
                  <label className="caption block mb-1.5 text-on-surface-variant font-semibold">
                    Nama Lengkap
                  </label>
                  <Input
                    name="fullName"
                    defaultValue={profile.fullName}
                    disabled={!editing}
                    className={!editing ? "opacity-60 bg-surface-container/20 cursor-not-allowed" : ""}
                    required
                  />
                </div>

                {/* NIM */}
                <div>
                  <label className="caption block mb-1.5 text-on-surface-variant font-semibold flex items-center gap-1.5">
                    <Hash className="size-3.5" /> NIM
                  </label>
                  <Input
                    name="nim"
                    defaultValue={profile.nim}
                    disabled={!editing}
                    className={!editing ? "opacity-60 bg-surface-container/20 cursor-not-allowed" : ""}
                    required
                  />
                </div>

                {/* Email (Readonly) */}
                <div>
                  <label className="caption block mb-1.5 text-on-surface-variant font-semibold flex items-center gap-1.5">
                    <Mail className="size-3.5" /> Email
                  </label>
                  <Input
                    value={profile.email ?? ""}
                    disabled
                    className="opacity-60 bg-surface-container/20 cursor-not-allowed"
                  />
                </div>

                {/* Phone */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="caption block text-on-surface-variant font-semibold flex items-center gap-1.5">
                      <Phone className="size-3.5" /> No. HP / WhatsApp
                    </label>
                    {waUrl && (
                      <a
                        href={waUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-mono font-bold text-emerald-600 hover:underline flex items-center gap-1"
                      >
                        Uji WA ↗
                      </a>
                    )}
                  </div>
                  <Input
                    name="phone"
                    defaultValue={profile.phone ?? ""}
                    disabled={!editing}
                    className={!editing ? "opacity-60 bg-surface-container/20 cursor-not-allowed" : ""}
                    placeholder="Contoh: 081234567890"
                  />
                </div>
              </div>

              {editing && (
                <div className="flex justify-end mt-2">
                  <Button type="submit" disabled={pending} className="cursor-pointer font-bold">
                    <Save className="size-4" />
                    {pending ? "Menyimpan..." : "Simpan Perubahan"}
                  </Button>
                </div>
              )}
            </form>
          </div>

          {/* Card 2: Keamanan & Password */}
          <div className="bg-white border border-outline-variant/60 rounded-2xl p-6 sm:p-8">
            <div className="border-b border-outline-variant/20 pb-4 mb-6">
              <h2 className="text-xl font-extrabold text-on-surface flex items-center gap-2.5">
                <Lock className="size-5 text-accent-magenta" /> Keamanan & Password
              </h2>
              <p className="text-xs text-on-surface-variant font-medium mt-1">
                Ganti kata sandi akun Anda secara berkala untuk menjaga keamanan data
              </p>
            </div>

            {pwState?.error && (
              <div className="text-sm text-error bg-error-container rounded-lg p-4 font-mono mb-6">
                {pwState.error}
              </div>
            )}
            {pwState?.success && (
              <div className="text-sm text-accent-green bg-accent-green/10 border border-accent-green/30 rounded-lg p-4 font-mono mb-6">
                Password berhasil diperbarui!
              </div>
            )}

            <form action={pwAction} className="flex flex-col gap-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="caption block mb-1.5 text-on-surface-variant font-semibold">
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
                  <label className="caption block mb-1.5 text-on-surface-variant font-semibold">
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
                <Button type="submit" disabled={pwPending} className="cursor-pointer font-bold">
                  {pwPending ? "Memproses..." : "Perbarui Password"}
                </Button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Column (1/3 Width): Identitas Card & Statistik Personal */}
        <div className="flex flex-col gap-8">
          {/* Card 1: Identitas & Foto Panitia */}
          <div className="bg-white border border-outline-variant/60 rounded-2xl p-6 sm:p-8 flex flex-col items-center text-center space-y-4">
            <div className="flex items-center justify-between w-full border-b border-outline-variant/20 pb-3 mb-1">
              <h3 className="text-sm font-extrabold text-on-surface flex items-center gap-2">
                <Shield className="size-4 text-primary" /> Identitas Panitia
              </h3>
              {profile.assignment?.isActive && (
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-300">
                  AKTIF
                </span>
              )}
            </div>

            {/* Avatar Container with Upload */}
            <div className="relative group shrink-0 select-none my-2">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={profile.fullName}
                  className="size-24 rounded-2xl object-cover border border-outline-variant/60 shadow-sm"
                />
              ) : (
                <div className="size-24 rounded-2xl bg-surface-container text-primary font-mono font-bold text-3xl flex items-center justify-center border border-outline-variant/60">
                  {getInitials(profile.fullName)}
                </div>
              )}

              <label className="absolute inset-0 rounded-2xl bg-black/50 flex flex-col items-center justify-center cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity text-white gap-1">
                {uploading ? (
                  <Loader2 className="size-5 animate-spin" />
                ) : (
                  <>
                    <Camera className="size-5" />
                    <span className="text-[9px] font-mono font-bold uppercase tracking-wider">Ubah Foto</span>
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
              <h3 className="text-lg font-bold text-on-surface truncate">{profile.fullName || "Nama Panitia"}</h3>
              <p className="text-xs font-mono text-on-surface-variant">NIM: {profile.nim || "-"}</p>
              <p className="text-xs font-mono text-on-surface-variant/70 truncate">{profile.email ?? "-"}</p>
            </div>

            {profile.assignment && (
              <div className="w-full pt-3 border-t border-outline-variant/20 flex flex-col gap-2.5 text-left">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-on-surface-variant font-medium">Divisi</span>
                  <span className="font-bold text-on-surface font-mono">{profile.assignment.division}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-on-surface-variant font-medium">Jabatan</span>
                  <span className="font-bold text-primary font-mono">{profile.assignment.role}</span>
                </div>
              </div>
            )}
          </div>

          {/* Card 2: Statistik Personal */}
          {profile.assignment && (
            <div className="bg-white border border-outline-variant/60 rounded-2xl p-6 sm:p-8 space-y-4">
              <div className="border-b border-outline-variant/20 pb-3">
                <h3 className="text-sm font-extrabold text-on-surface flex items-center gap-2">
                  <TrendingUp className="size-4 text-primary" /> Statistik Personal
                </h3>
                <p className="text-[11px] text-on-surface-variant font-medium mt-0.5">
                  Ringkasan aktivitas dan partisipasi panitia
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3.5 rounded-xl bg-surface-container-low border border-outline-variant/40 text-center">
                  <p className="text-[9px] font-mono font-bold text-on-surface-variant uppercase">SURAT</p>
                  <p className="text-2xl font-black text-on-surface mt-1">{profile.stats.totalLetters}</p>
                </div>
                <div className="p-3.5 rounded-xl bg-surface-container-low border border-outline-variant/40 text-center">
                  <p className="text-[9px] font-mono font-bold text-on-surface-variant uppercase">RAPAT</p>
                  <p className="text-2xl font-black text-on-surface mt-1">{profile.stats.totalMeetings}</p>
                </div>
                <div className="p-3.5 rounded-xl bg-surface-container-low border border-outline-variant/40 text-center">
                  <p className="text-[9px] font-mono font-bold text-on-surface-variant uppercase">TOTAL TASK</p>
                  <p className="text-2xl font-black text-on-surface mt-1">{profile.stats.totalTasks}</p>
                </div>
                <div className="p-3.5 rounded-xl bg-surface-container-low border border-outline-variant/40 text-center">
                  <p className="text-[9px] font-mono font-bold text-emerald-700 uppercase">SELESAI</p>
                  <p className="text-2xl font-black text-emerald-700 mt-1">{profile.stats.doneTasks}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
