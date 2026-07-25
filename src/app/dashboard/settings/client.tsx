"use client";

import { useState } from "react";
import {
  Bell,
  Sliders,
  Mail,
  Server,
  Zap,
  Globe,
} from "lucide-react";
import type { ProfileData } from "@/lib/data/profile";

export function SettingsClient({ profile }: { profile: ProfileData }) {
  const [activeTab, setActiveTab] = useState<"NOTIFICATIONS" | "SYSTEM">("NOTIFICATIONS");

  // Notification toggles
  const [emailKpiAlert, setEmailKpiAlert] = useState(true);
  const [emailTaskAlert, setEmailTaskAlert] = useState(true);
  const [emailPlenaryAlert, setEmailPlenaryAlert] = useState(true);

  const roleLevel = profile.assignment?.level ?? 0;
  const isBPHOrAdmin = roleLevel >= 75;

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
          { id: "NOTIFICATIONS", label: "Preferensi Notifikasi", icon: Bell },
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

      {/* Tab Content 1: NOTIFICATIONS */}
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

      {/* Tab Content 2: SYSTEM CONFIGURATION (BPH ONLY) */}
      {activeTab === "SYSTEM" && isBPHOrAdmin && (
        <div className="bg-white border border-outline-variant/60 rounded-3xl p-6 sm:p-8 flex flex-col gap-6 shadow-sm">
          <div>
            <h3 className="text-base font-bold text-on-surface flex items-center gap-2">
              <Sliders className="size-4.5 text-primary" /> Panel Integrasi Sistem (BPH)
            </h3>
            <p className="text-xs text-on-surface-variant mt-1">
              Kelola kredensial pihak ketiga, database sync, dan otomatisasi administrasi organisasi.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-2">
            {/* Google Drive Card */}
            <div className="p-5 rounded-2xl border border-outline-variant/60 bg-surface-container-lowest flex flex-col justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <div className="p-3 rounded-xl bg-primary/10 text-primary border border-primary/20 shrink-0">
                  <Globe className="size-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="text-sm font-extrabold text-on-surface">Google Drive API Integration</h4>
                  <p className="text-xs text-on-surface-variant/70 mt-1">
                    Hubungkan folder penyimpanan resmi kepanitiaan ke cloud storage.
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between border-t border-outline-variant/30 pt-3 mt-1">
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Aktif
                </span>
                <button className="text-xs font-bold text-primary hover:underline cursor-pointer">
                  Putuskan
                </button>
              </div>
            </div>

            {/* Database Sync Card */}
            <div className="p-5 rounded-2xl border border-outline-variant/60 bg-surface-container-lowest flex flex-col justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <div className="p-3 rounded-xl bg-accent-magenta/10 text-accent-magenta border border-accent-magenta/20 shrink-0">
                  <Server className="size-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="text-sm font-extrabold text-on-surface">Supabase Database Sync</h4>
                  <p className="text-xs text-on-surface-variant/70 mt-1">
                    Sinkronisasi data kepanitiaan lokal dengan penyimpanan cloud utama.
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between border-t border-outline-variant/30 pt-3 mt-1">
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Terhubung
                </span>
                <button className="text-xs font-bold text-primary hover:underline cursor-pointer">
                  Sync Sekarang
                </button>
              </div>
            </div>

            {/* Email Gateway Card */}
            <div className="p-5 rounded-2xl border border-outline-variant/60 bg-surface-container-lowest flex flex-col justify-between gap-4 md:col-span-2">
              <div className="flex items-start gap-3.5">
                <div className="p-3 rounded-xl bg-block-blue/10 text-block-blue border border-block-blue/20 shrink-0">
                  <Zap className="size-5" />
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
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
