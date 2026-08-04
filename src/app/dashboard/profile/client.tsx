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
} from "lucide-react";
import { updateProfile, changePassword } from "@/lib/actions/profile";
import type { ProfileData } from "@/lib/data/profile";

export function ProfileClient({ profile }: { profile: ProfileData }) {
  const [activeTab, setActiveTab] = useState<"INFO" | "STATISTIK" | "KEAMANAN">("INFO");
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
    <div className="w-full flex flex-col gap-6">
      {/* Glassmorphism Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/40 backdrop-blur-md border border-outline-variant/20 rounded-3xl p-6">
        <div>
          <p className="text-primary font-mono text-xs font-bold tracking-widest uppercase mb-1">
            PENGATURAN AKUN
          </p>
          <h1 className="text-3xl font-black tracking-tight text-on-surface font-sans">
            Profil Pengguna
          </h1>
          <p className="mt-1 text-sm text-on-surface-variant font-medium">
            Kelola data pribadi, informasi kepanitiaan, dan keamanan akun Anda
          </p>
        </div>

        <Button
          variant="outline"
          onClick={() => setEditing(!editing)}
          className="cursor-pointer font-sans text-sm font-bold gap-2 px-5 py-6 rounded-2xl border-outline-variant/60 hover:bg-white hover:shadow-md transition-all shrink-0"
        >
          <Pencil className="size-4" />
          {editing ? "Selesai Edit" : "Edit Profil"}
        </Button>
      </div>

      {/* Profile Hero Banner */}
      <div className="bg-white border border-outline-variant/40 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col md:flex-row items-center md:items-start gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-primary/5 via-accent-magenta/5 to-transparent rounded-full blur-2xl -z-10 pointer-events-none" />

        {/* Avatar Container with Upload Hover Overlay */}
        <div className="relative group shrink-0 select-none">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={profile.fullName}
              className="size-24 rounded-3xl object-cover border-2 border-primary/20 shadow-md"
            />
          ) : (
            <div className="size-24 rounded-3xl bg-primary/10 text-primary font-mono font-black text-3xl flex items-center justify-center border-2 border-primary/20 shadow-md">
              {getInitials(profile.fullName)}
            </div>
          )}

          <label className="absolute inset-0 rounded-3xl bg-black/50 flex flex-col items-center justify-center cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity text-white gap-1">
            {uploading ? (
              <Loader2 className="size-6 animate-spin" />
            ) : (
              <>
                <Camera className="size-6" />
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider">Ubah</span>
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

        {/* User Info Header Summary */}
        <div className="flex-1 min-w-0 text-center md:text-left space-y-2">
          <div className="flex flex-col md:flex-row md:items-center gap-3 justify-between">
            <div>
              <h2 className="text-2xl sm:text-3xl font-black text-on-surface tracking-tight">
                {profile.fullName || "Nama Panitia"}
              </h2>
              <p className="text-sm font-mono text-on-surface-variant/80 mt-1 flex items-center justify-center md:justify-start gap-2">
                <Hash className="size-4 text-primary" /> {profile.nim || "NIM belum diisi"}
              </p>
            </div>
          </div>

          {/* Badges */}
          <div className="flex items-center justify-center md:justify-start gap-2 pt-2 flex-wrap">
            {profile.assignment ? (
              <>
                <span className="text-xs font-mono font-bold px-3 py-1 rounded-xl bg-primary/10 text-primary border border-primary/20 uppercase tracking-wider">
                  {profile.assignment.role}
                </span>
                <span className="text-xs font-mono font-bold px-3 py-1 rounded-xl bg-surface-container text-on-surface border border-outline-variant/40 uppercase tracking-wider">
                  {profile.assignment.division}
                </span>
                <span className={`text-xs font-mono font-bold px-3 py-1 rounded-xl border uppercase tracking-wider ${
                  profile.assignment.isActive ? "bg-emerald-50 text-emerald-700 border-emerald-300" : "bg-red-50 text-red-700 border-red-300"
                }`}>
                  {profile.assignment.isActive ? "Panitia Aktif" : "Non-Aktif"}
                </span>
              </>
            ) : (
              <span className="text-xs font-mono font-bold px-3 py-1 rounded-xl bg-surface-container text-on-surface-variant border border-outline-variant/40">
                Belum Terdaftar di Kepanitiaan
              </span>
            )}
          </div>

          {uploadError && (
            <p className="text-xs font-mono font-bold text-red-600 pt-1">{uploadError}</p>
          )}
        </div>
      </div>

      {/* Navigation Tabs Bar */}
      <div className="flex items-center gap-2 bg-white border border-outline-variant/40 rounded-2xl p-2 shadow-sm">
        <button
          onClick={() => setActiveTab("INFO")}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-bold font-mono tracking-wider uppercase transition-all duration-200 cursor-pointer ${
            activeTab === "INFO"
              ? "bg-primary text-white shadow-sm font-black"
              : "text-on-surface-variant hover:bg-surface-container hover:text-on-surface"
          }`}
        >
          <User className="size-4" />
          Data Diri
        </button>

        <button
          onClick={() => setActiveTab("STATISTIK")}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-bold font-mono tracking-wider uppercase transition-all duration-200 cursor-pointer ${
            activeTab === "STATISTIK"
              ? "bg-primary text-white shadow-sm font-black"
              : "text-on-surface-variant hover:bg-surface-container hover:text-on-surface"
          }`}
        >
          <TrendingUp className="size-4" />
          Kepanitiaan & Statistik
        </button>

        <button
          onClick={() => setActiveTab("KEAMANAN")}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-bold font-mono tracking-wider uppercase transition-all duration-200 cursor-pointer ${
            activeTab === "KEAMANAN"
              ? "bg-primary text-white shadow-sm font-black"
              : "text-on-surface-variant hover:bg-surface-container hover:text-on-surface"
          }`}
        >
          <KeyRound className="size-4" />
          Keamanan Akun
        </button>
      </div>

      {/* Tab 1: INFO PROFIL */}
      {activeTab === "INFO" && (
        <div className="bg-white border border-outline-variant/40 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col gap-6">
          <div className="flex items-center justify-between border-b border-outline-variant/30 pb-4">
            <div>
              <h3 className="text-xl font-black text-on-surface">Informasi Data Diri</h3>
              <p className="text-xs text-on-surface-variant mt-0.5">
                Perubahan data diri dapat dilihat oleh seluruh panitia IFEST
              </p>
            </div>
            {editing && (
              <span className="text-xs font-mono font-bold text-amber-700 bg-amber-50 px-3 py-1 rounded-xl border border-amber-300">
                Mode Edit Aktif
              </span>
            )}
          </div>

          {state?.error && (
            <div className="text-xs font-mono text-red-700 bg-red-50 border border-red-300 rounded-2xl p-4">
              {state.error}
            </div>
          )}
          {state?.success && (
            <div className="text-xs font-mono text-emerald-800 bg-emerald-50 border border-emerald-300 rounded-2xl p-4">
              Profil berhasil diperbarui dan disinkronkan ke seluruh sistem!
            </div>
          )}

          <form action={formAction} className="flex flex-col gap-6">
            <input type="hidden" name="userId" value={profile.userId ?? ""} />
            <input type="hidden" name="avatarUrl" value={avatarUrl} />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Full Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-mono font-bold uppercase tracking-wider text-on-surface-variant flex items-center gap-1.5">
                  <User className="size-3.5" /> Nama Lengkap
                </label>
                <Input
                  name="fullName"
                  defaultValue={profile.fullName}
                  disabled={!editing}
                  className={`h-11 rounded-2xl text-sm font-medium ${!editing ? "opacity-70 bg-surface-container/30 border-outline-variant/40 cursor-not-allowed" : "border-primary/80"}`}
                  required
                />
              </div>

              {/* NIM */}
              <div className="space-y-1.5">
                <label className="text-xs font-mono font-bold uppercase tracking-wider text-on-surface-variant flex items-center gap-1.5">
                  <Hash className="size-3.5" /> NIM (Nomor Induk Mahasiswa)
                </label>
                <Input
                  name="nim"
                  defaultValue={profile.nim}
                  disabled={!editing}
                  className={`h-11 rounded-2xl text-sm font-mono font-medium ${!editing ? "opacity-70 bg-surface-container/30 border-outline-variant/40 cursor-not-allowed" : "border-primary/80"}`}
                  required
                />
              </div>

              {/* Email (Readonly) */}
              <div className="space-y-1.5">
                <label className="text-xs font-mono font-bold uppercase tracking-wider text-on-surface-variant flex items-center gap-1.5">
                  <Mail className="size-3.5" /> Email Terdaftar
                </label>
                <Input
                  value={profile.email ?? ""}
                  disabled
                  className="h-11 rounded-2xl text-sm font-mono opacity-60 bg-surface-container/20 border-outline-variant/30 cursor-not-allowed"
                />
              </div>

              {/* Phone / WhatsApp */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-mono font-bold uppercase tracking-wider text-on-surface-variant flex items-center gap-1.5">
                    <Phone className="size-3.5" /> No. WhatsApp / HP
                  </label>
                  {waUrl && (
                    <a
                      href={waUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] font-mono font-bold text-emerald-600 hover:underline inline-flex items-center gap-1"
                    >
                      Uji WhatsApp ↗
                    </a>
                  )}
                </div>
                <Input
                  name="phone"
                  defaultValue={profile.phone ?? ""}
                  disabled={!editing}
                  className={`h-11 rounded-2xl text-sm font-mono font-medium ${!editing ? "opacity-70 bg-surface-container/30 border-outline-variant/40 cursor-not-allowed" : "border-primary/80"}`}
                  placeholder="Contoh: 081234567890"
                />
              </div>
            </div>

            {editing && (
              <div className="flex justify-end pt-2">
                <Button
                  type="submit"
                  disabled={pending}
                  className="cursor-pointer font-bold px-6 py-5 rounded-2xl shadow-md shadow-primary/10"
                >
                  {pending ? "Menyimpan..." : "Simpan Perubahan Data Diri"}
                </Button>
              </div>
            )}
          </form>
        </div>
      )}

      {/* Tab 2: STATISTIK & KEPANITIAAN */}
      {activeTab === "STATISTIK" && (
        <div className="flex flex-col gap-6">
          {/* Kepanitiaan Status */}
          {profile.assignment ? (
            <div className="bg-white border border-outline-variant/40 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-outline-variant/30 pb-4">
                <div>
                  <h3 className="text-xl font-black text-on-surface">Status Penugasan Kepanitiaan</h3>
                  <p className="text-xs text-on-surface-variant mt-0.5">
                    Struktur divisi & hak jabatan dalam kepanitiaan I-FEST 2026
                  </p>
                </div>
                <span className="text-xs font-mono font-bold px-3.5 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-300">
                  Terverifikasi
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div className="p-4 rounded-2xl bg-surface-container/30 border border-outline-variant/40 space-y-1">
                  <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-on-surface-variant">Divisi</p>
                  <p className="text-base font-extrabold text-on-surface">{profile.assignment.division}</p>
                </div>
                <div className="p-4 rounded-2xl bg-surface-container/30 border border-outline-variant/40 space-y-1">
                  <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-on-surface-variant">Jabatan / Role</p>
                  <p className="text-base font-extrabold text-primary">{profile.assignment.role}</p>
                </div>
                <div className="p-4 rounded-2xl bg-surface-container/30 border border-outline-variant/40 space-y-1">
                  <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-on-surface-variant">Tanggal Ditugaskan</p>
                  <p className="text-sm font-mono font-bold text-on-surface">
                    {new Date(profile.assignment.assignedAt).toLocaleDateString("id-ID", {
                      day: "numeric", month: "long", year: "numeric",
                    })}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white border border-outline-variant/40 rounded-3xl p-8 shadow-sm text-center">
              <Shield className="size-12 text-on-surface-variant/40 mx-auto mb-3" />
              <h3 className="text-base font-bold text-on-surface">Belum Memiliki Penugasan</h3>
              <p className="text-xs text-on-surface-variant mt-1">
                Silakan hubungi BPH Admin untuk melakukan penugasan divisi dan role.
              </p>
            </div>
          )}

          {/* Stats Grid Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white border border-outline-variant/60 rounded-3xl p-6 flex flex-col gap-2 shadow-sm text-center">
              <p className="text-[10px] font-mono font-bold tracking-widest text-on-surface-variant uppercase flex items-center justify-center gap-1.5">
                <FileText className="size-3.5 text-primary" /> SURAT
              </p>
              <p className="text-4xl font-black text-on-surface my-1 leading-none">{profile.stats.totalLetters}</p>
              <p className="text-[10px] text-on-surface-variant font-mono">Permohonan diajukan</p>
            </div>

            <div className="bg-white border border-outline-variant/60 rounded-3xl p-6 flex flex-col gap-2 shadow-sm text-center">
              <p className="text-[10px] font-mono font-bold tracking-widest text-on-surface-variant uppercase flex items-center justify-center gap-1.5">
                <CalendarDays className="size-3.5 text-block-blue" /> RAPAT
              </p>
              <p className="text-4xl font-black text-on-surface my-1 leading-none">{profile.stats.totalMeetings}</p>
              <p className="text-[10px] text-on-surface-variant font-mono">Undangan diterima</p>
            </div>

            <div className="bg-white border border-outline-variant/60 rounded-3xl p-6 flex flex-col gap-2 shadow-sm text-center">
              <p className="text-[10px] font-mono font-bold tracking-widest text-on-surface-variant uppercase flex items-center justify-center gap-1.5">
                <CheckSquare className="size-3.5 text-amber-600" /> TOTAL TASK
              </p>
              <p className="text-4xl font-black text-on-surface my-1 leading-none">{profile.stats.totalTasks}</p>
              <p className="text-[10px] text-on-surface-variant font-mono">Tugas diberikan</p>
            </div>

            <div className="bg-white border border-outline-variant/60 rounded-3xl p-6 flex flex-col gap-2 shadow-sm text-center">
              <p className="text-[10px] font-mono font-bold tracking-widest text-on-surface-variant uppercase flex items-center justify-center gap-1.5">
                <CheckCircle2 className="size-3.5 text-emerald-600" /> SELESAI
              </p>
              <p className="text-4xl font-black text-on-surface my-1 leading-none">{profile.stats.doneTasks}</p>
              <p className="text-[10px] text-on-surface-variant font-mono">Tugas rampung</p>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: KEAMANAN & PASSWORD */}
      {activeTab === "KEAMANAN" && (
        <div className="bg-white border border-outline-variant/40 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col gap-6">
          <div className="border-b border-outline-variant/30 pb-4">
            <h3 className="text-xl font-black text-on-surface">Keamanan & Password Akun</h3>
            <p className="text-xs text-on-surface-variant mt-0.5">
              Ganti kata sandi akun Anda secara berkala untuk menjaga keamanan data
            </p>
          </div>

          {pwState?.error && (
            <div className="text-xs font-mono text-red-700 bg-red-50 border border-red-300 rounded-2xl p-4">
              {pwState.error}
            </div>
          )}
          {pwState?.success && (
            <div className="text-xs font-mono text-emerald-800 bg-emerald-50 border border-emerald-300 rounded-2xl p-4">
              Password berhasil diperbarui! Silakan gunakan password baru Anda untuk login berikutnya.
            </div>
          )}

          <form action={pwAction} className="flex flex-col gap-6 max-w-xl">
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-mono font-bold uppercase tracking-wider text-on-surface-variant flex items-center gap-1.5">
                  <KeyRound className="size-3.5" /> Password Baru
                </label>
                <Input
                  type="password"
                  name="password"
                  required
                  placeholder="Minimal 6 karakter"
                  className="h-11 rounded-2xl text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono font-bold uppercase tracking-wider text-on-surface-variant flex items-center gap-1.5">
                  <KeyRound className="size-3.5" /> Konfirmasi Password Baru
                </label>
                <Input
                  type="password"
                  name="confirmPassword"
                  required
                  placeholder="Ketik ulang password baru"
                  className="h-11 rounded-2xl text-sm"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button
                type="submit"
                disabled={pwPending}
                className="cursor-pointer font-bold px-6 py-5 rounded-2xl shadow-md shadow-primary/10"
              >
                {pwPending ? "Memproses..." : "Perbarui Password Akun"}
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
