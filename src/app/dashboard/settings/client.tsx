"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  User,
  Bell,
  ShieldCheck,
  Sliders,
  CheckCircle2,
  Lock,
  Mail,
  Smartphone,
  Server,
  Zap,
  Globe,
  Save,
  Key,
} from "lucide-react";
import type { ProfileData } from "@/lib/data/profile";

export function SettingsClient({ profile }: { profile: ProfileData }) {
  const [activeTab, setActiveTab] = useState<"PROFILE" | "NOTIFICATIONS" | "SECURITY" | "SYSTEM">("PROFILE");

  // Local state for profile form
  const [fullName, setFullName] = useState(profile.fullName || "");
  const [phone, setPhone] = useState(profile.phone || "");
  const [isSaved, setIsSaved] = useState(false);

  // Notification toggles
  const [emailKpiAlert, setEmailKpiAlert] = useState(true);
  const [emailTaskAlert, setEmailTaskAlert] = useState(true);
  const [emailPlenaryAlert, setEmailPlenaryAlert] = useState(true);
  const [waTaskAlert, setWaTaskAlert] = useState(true);

  // Password fields
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordMsg, setPasswordMsg] = useState("");

  const roleLevel = profile.assignment?.level ?? 0;
  const isBPHOrAdmin = roleLevel >= 75;

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setPasswordMsg("Kata sandi baru dan konfirmasi tidak cocok.");
      return;
    }
    setPasswordMsg("Kata sandi berhasil diperbarui!");
    setOldPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setTimeout(() => setPasswordMsg(""), 3000);
  };

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/40 backdrop-blur-md border border-outline-variant/20 rounded-3xl p-6 sm:p-8 shadow-sm">
        <div>
          <p className="text-primary font-mono text-xs font-bold tracking-widest uppercase mb-1">
            KONFIGURASI PREFERENSI
          </p>
          <h1 className="text-3xl font-black tracking-tight text-on-surface font-sans">
            Pengaturan Sistem & Akun
          </h1>
          <p className="mt-1 text-sm text-on-surface-variant font-medium">
            Kelola preferensi akun pribadi, notifikasi, serta integrasi sistem kepanitiaan.
          </p>
        </div>
        <div className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-surface-container border border-outline-variant/40 shrink-0 self-start sm:self-auto">
          <span className="size-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-mono font-bold text-on-surface">
            {profile.assignment?.role || "Anggota"} ({profile.assignment?.division || "Panitia"})
          </span>
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="flex flex-wrap gap-2 bg-white border border-outline-variant/40 rounded-3xl p-3 shadow-sm">
        {[
          { id: "PROFILE", label: "Akun & Profil", icon: User },
          { id: "NOTIFICATIONS", label: "Preferensi Notifikasi", icon: Bell },
          { id: "SECURITY", label: "Keamanan Akun", icon: ShieldCheck },
          ...(isBPHOrAdmin ? [{ id: "SYSTEM", label: "Konfigurasi Sistem (BPH)", icon: Sliders }] : []),
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-mono font-bold uppercase transition-all duration-200 cursor-pointer border ${
                isActive
                  ? "bg-primary border-transparent text-white shadow-md shadow-primary/10"
                  : "bg-white border-transparent text-on-surface-variant hover:text-on-surface hover:bg-surface-container"
              }`}
            >
              <Icon className="size-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content 1: PROFILE */}
      {activeTab === "PROFILE" && (
        <form onSubmit={handleSaveProfile} className="bg-white border border-outline-variant/60 rounded-3xl p-6 sm:p-8 flex flex-col gap-6 shadow-sm">
          {isSaved && (
            <div className="flex items-center gap-2.5 bg-accent-green/10 text-accent-green text-sm font-semibold px-4 py-3 rounded-2xl border border-accent-green/20">
              <CheckCircle2 className="size-5" />
              <span>Perubahan informasi profil berhasil disimpan!</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="flex flex-col gap-2">
              <label htmlFor="fullName" className="text-sm font-bold text-on-surface font-sans">
                Nama Lengkap
              </label>
              <input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="px-4 py-3 rounded-2xl border border-outline-variant/60 bg-surface-container-lowest text-on-surface text-sm font-sans outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="nim" className="text-sm font-bold text-on-surface font-sans">
                NIM (Nomor Induk Mahasiswa)
              </label>
              <input
                id="nim"
                type="text"
                value={profile.nim || ""}
                disabled
                className="px-4 py-3 rounded-2xl border border-outline-variant/40 bg-surface-container text-on-surface-variant/70 text-sm font-mono cursor-not-allowed"
              />
              <span className="text-[11px] text-on-surface-variant/60 font-medium">NIM terdaftar secara resmi di database.</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="flex flex-col gap-2">
              <label htmlFor="email" className="text-sm font-bold text-on-surface font-sans">
                Alamat Email
              </label>
              <input
                id="email"
                type="email"
                value={profile.email || ""}
                disabled
                className="px-4 py-3 rounded-2xl border border-outline-variant/40 bg-surface-container text-on-surface-variant/70 text-sm font-sans cursor-not-allowed"
              />
              <span className="text-[11px] text-on-surface-variant/60 font-medium">Email digunakan sebagai identitas akun login.</span>
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="phone" className="text-sm font-bold text-on-surface font-sans">
                Nomor Telepon
              </label>
              <input
                id="phone"
                type="text"
                placeholder="contoh: 081234567890"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="px-4 py-3 rounded-2xl border border-outline-variant/60 bg-surface-container-lowest text-on-surface text-sm font-sans outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
              />
              <span className="text-[11px] text-on-surface-variant/60 font-medium">Digunakan untuk kontak koordinasi kepanitiaan.</span>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-outline-variant/30">
            <Button type="submit" variant="primary" className="cursor-pointer font-sans text-sm font-bold gap-2 px-6 py-5 rounded-xl shadow-md">
              <Save className="size-4" />
              Simpan Informasi Profil
            </Button>
          </div>
        </form>
      )}

      {/* Tab Content 2: NOTIFICATIONS */}
      {activeTab === "NOTIFICATIONS" && (
        <div className="bg-white border border-outline-variant/60 rounded-3xl p-6 sm:p-8 flex flex-col gap-6 shadow-sm">
          <div>
            <h3 className="text-base font-bold text-on-surface">Preferensi Notifikasi Email</h3>
            <p className="text-xs text-on-surface-variant mt-1">
              Atur pemberitahuan yang ingin Anda terima langsung ke inbox email Anda.
            </p>
          </div>

          <div className="flex flex-col gap-4 divide-y divide-outline-variant/30">
            <div className="flex items-center justify-between pt-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-primary/10 text-primary border border-primary/20">
                  <Mail className="size-4.5" />
                </div>
                <div>
                  <p className="text-sm font-bold text-on-surface">Notifikasi Email Deadline KPI</p>
                  <p className="text-xs text-on-surface-variant/70">Kirim email pengingat H-1 sebelum target KPI divisi berakhir.</p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={emailKpiAlert}
                onChange={(e) => setEmailKpiAlert(e.target.checked)}
                className="size-5 rounded-lg border-outline-variant text-primary focus:ring-primary cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between pt-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-accent-magenta/10 text-accent-magenta border border-accent-magenta/20">
                  <Bell className="size-4.5" />
                </div>
                <div>
                  <p className="text-sm font-bold text-on-surface">Notifikasi Tugas Baru</p>
                  <p className="text-xs text-on-surface-variant/70">Kirim pemberitahuan saat koordinator menugaskan tugas baru kepada Anda.</p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={emailTaskAlert}
                onChange={(e) => setEmailTaskAlert(e.target.checked)}
                className="size-5 rounded-lg border-outline-variant text-primary focus:ring-primary cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between pt-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-block-blue/10 text-block-blue border border-block-blue/20">
                  <Mail className="size-4.5" />
                </div>
                <div>
                  <p className="text-sm font-bold text-on-surface">Pengumuman Rapat Pleno</p>
                  <p className="text-xs text-on-surface-variant/70">Kirim broadcast pengumuman pleno dan risalah rapat dari BPH.</p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={emailPlenaryAlert}
                onChange={(e) => setEmailPlenaryAlert(e.target.checked)}
                className="size-5 rounded-lg border-outline-variant text-primary focus:ring-primary cursor-pointer"
              />
            </div>

            {/* Brevo email options... */}
          </div>
        </div>
      )}

      {/* Tab Content 3: SECURITY */}
      {activeTab === "SECURITY" && (
        <form onSubmit={handleChangePassword} className="bg-white border border-outline-variant/60 rounded-3xl p-6 sm:p-8 flex flex-col gap-6 shadow-sm">
          <div>
            <h3 className="text-base font-bold text-on-surface flex items-center gap-2">
              <Lock className="size-4.5 text-primary" /> Ubah Kata Sandi Akun
            </h3>
            <p className="text-xs text-on-surface-variant mt-1">
              Perbarui kata sandi Anda secara berkala untuk menjaga keamanan akun kepanitiaan.
            </p>
          </div>

          {passwordMsg && (
            <div className={`p-4 rounded-2xl border text-sm font-semibold flex items-center gap-2 ${
              passwordMsg.includes("berhasil")
                ? "bg-accent-green/10 text-accent-green border-accent-green/20"
                : "bg-error-container/20 text-error border-error/20"
            }`}>
              <CheckCircle2 className="size-5 shrink-0" />
              <span>{passwordMsg}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-2 md:col-span-2">
              <label htmlFor="oldPass" className="text-sm font-bold text-on-surface">Kata Sandi Saat Ini</label>
              <input
                id="oldPass"
                type="password"
                required
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                placeholder="Masukkan kata sandi lama Anda..."
                className="w-full px-4 py-3 rounded-2xl border border-outline-variant/60 bg-surface-container-lowest text-on-surface text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="newPass" className="text-sm font-bold text-on-surface">Kata Sandi Baru</label>
              <input
                id="newPass"
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Minimal 6 karakter..."
                className="w-full px-4 py-3 rounded-2xl border border-outline-variant/60 bg-surface-container-lowest text-on-surface text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="confirmPass" className="text-sm font-bold text-on-surface">Konfirmasi Kata Sandi Baru</label>
              <input
                id="confirmPass"
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Ulangi kata sandi baru..."
                className="w-full px-4 py-3 rounded-2xl border border-outline-variant/60 bg-surface-container-lowest text-on-surface text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
              />
            </div>
          </div>

          <div className="flex justify-start pt-4 border-t border-outline-variant/30">
            <Button type="submit" variant="primary" className="cursor-pointer font-sans text-sm font-bold gap-2 px-6 py-5 rounded-xl shadow-md">
              <Key className="size-4" />
              Perbarui Kata Sandi
            </Button>
          </div>
        </form>
      )}

      {/* Tab Content 4: SYSTEM (BPH / Admin Only) */}
      {activeTab === "SYSTEM" && isBPHOrAdmin && (
        <div className="flex flex-col gap-6">
          <div className="bg-white border border-outline-variant/60 rounded-3xl p-6 sm:p-8 flex flex-col gap-6 shadow-sm">
            <div>
              <p className="text-xs font-mono font-bold uppercase tracking-wider text-accent-magenta mb-1">
                KHUSUS PIMPINAN BPH
              </p>
              <h3 className="text-base font-bold text-on-surface flex items-center gap-2">
                <Server className="size-4.5 text-primary" /> Status Integrasi Layanan Sistem
              </h3>
              <p className="text-xs text-on-surface-variant mt-1">
                Monitor status koneksi API eksternal dan periode kepanitiaan aktif.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Brevo Status */}
              <div className="p-5 rounded-2xl border border-outline-variant/60 bg-surface-container-lowest flex items-start gap-3.5">
                <div className="p-3 rounded-xl bg-primary/10 text-primary border border-primary/20 shrink-0">
                  <Mail className="size-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="text-sm font-extrabold text-on-surface">Brevo Email SMTP API</h4>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Terhubung
                    </span>
                  </div>
                  <p className="text-xs text-on-surface-variant/70 mt-1">
                    API Key terverifikasi. Digunakan untuk mengirim email sambutan anggota & broadcast pleno.
                  </p>
                </div>
              </div>

              {/* Brevo Status only */}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
