"use client";

import { useActionState, useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Pencil, Mail, Hash, Phone, Calendar, Shield, FileText, CalendarDays, CheckCircle, Circle, User, TrendingUp } from "lucide-react";
import { updateProfile } from "@/lib/actions/profile";
import type { ProfileData } from "@/lib/data/profile";

export function ProfileClient({ profile }: { profile: ProfileData }) {
  const [editing, setEditing] = useState(false);
  const [state, formAction, pending] = useActionState(updateProfile, null);

  const getInitials = (name: string) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  return (
    <div className="max-w-3xl flex flex-col gap-10">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-accent-magenta font-mono text-xs font-bold tracking-widest uppercase mb-1">
            Akun
          </p>
          <h1 className="text-4xl font-extrabold tracking-tight text-on-surface">
            Profil Pengguna
          </h1>
        </div>
        <Button variant="outline" size="sm" onClick={() => setEditing(!editing)} className="cursor-pointer shrink-0">
          <Pencil className="size-4" />
          {editing ? "Batal" : "Edit Profil"}
        </Button>
      </div>

      {/* Profile Card */}
      <div className="bg-white border border-outline-variant/60 rounded-2xl p-6">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
          {profile.avatarUrl ? (
            <img
              src={profile.avatarUrl}
              alt={profile.fullName}
              className="w-16 h-16 rounded-full object-cover shrink-0 border border-outline-variant"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-block-lilac flex items-center justify-center font-bold text-primary text-2xl shrink-0">
              {getInitials(profile.fullName)}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-bold text-on-surface truncate">{profile.fullName || "Nama Panitia"}</h2>
            <p className="text-sm text-on-surface-variant font-mono mt-1">
              {profile.assignment
                ? `${profile.assignment.role} — ${profile.assignment.division}`
                : "Belum terdaftar di kepanitiaan"}
            </p>
          </div>
        </div>
      </div>

      {/* Account Details Form Section */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <User className="size-5 text-error" />
          <h2 className="text-xl font-bold tracking-tight text-on-surface">Detail Akun</h2>
        </div>

        <div className="bg-white border border-outline-variant/60 rounded-2xl p-6 sm:p-8">
          {state?.error && <div className="text-sm text-error bg-error-container rounded-lg p-4 font-mono mb-6">{state.error}</div>}
          {state?.success && <div className="text-sm text-accent-green bg-accent-green/10 border border-accent-green/30 rounded-lg p-4 font-mono mb-6">Profil berhasil diperbarui!</div>}

          <form action={formAction} className="flex flex-col gap-6">
            <input type="hidden" name="userId" value={profile.userId ?? ""} />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Email (readonly) */}
              <div>
                <label className="caption block mb-1.5 text-on-surface-variant font-semibold flex items-center gap-1.5">
                  <Mail className="size-3.5" /> Email
                </label>
                <Input value={profile.email ?? ""} disabled className="opacity-60 bg-surface-container/20 cursor-not-allowed" />
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

              {/* Full Name */}
              <div>
                <label className="caption block mb-1.5 text-on-surface-variant font-semibold">Nama Lengkap</label>
                <Input
                  name="fullName"
                  defaultValue={profile.fullName}
                  disabled={!editing}
                  className={!editing ? "opacity-60 bg-surface-container/20 cursor-not-allowed" : ""}
                  required
                />
              </div>

              {/* Phone */}
              <div>
                <label className="caption block mb-1.5 text-on-surface-variant font-semibold flex items-center gap-1.5">
                  <Phone className="size-3.5" /> No. HP
                </label>
                <Input
                  name="phone"
                  defaultValue={profile.phone ?? ""}
                  disabled={!editing}
                  className={!editing ? "opacity-60 bg-surface-container/20 cursor-not-allowed" : ""}
                  placeholder="Belum diisi"
                />
              </div>
            </div>

            {editing && (
              <div className="flex justify-end mt-2">
                <Button type="submit" disabled={pending} className="cursor-pointer">
                  {pending ? "Menyimpan..." : "Simpan Perubahan"}
                </Button>
              </div>
            )}
          </form>
        </div>
      </div>

      {/* Committee Assignment Info */}
      {profile.assignment && (
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <Shield className="size-5 text-error" />
            <h2 className="text-xl font-bold tracking-tight text-on-surface">Kepanitiaan</h2>
          </div>
          <Card className="bg-white border border-outline-variant/60 rounded-2xl p-6">
            <div className="flex items-center justify-between border-b border-outline-variant/10 pb-4 mb-4">
              <div className="min-w-0">
                <p className="text-base font-bold text-on-surface">{profile.assignment.role}</p>
                <p className="text-xs text-on-surface-variant font-mono mt-0.5">{profile.assignment.division}</p>
              </div>
              <Badge variant={profile.assignment.isActive ? "success" : "secondary"} className="text-xs font-mono px-3 py-1">
                {profile.assignment.isActive ? "Aktif" : "Tidak Aktif"}
              </Badge>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-mono text-on-surface-variant">
              <Calendar className="size-4 text-on-surface-variant" />
              <span>
                Bergabung sejak: {new Date(profile.assignment.assignedAt).toLocaleDateString("id-ID", {
                  day: "numeric", month: "long", year: "numeric",
                })}
              </span>
            </div>
          </Card>
        </div>
      )}

      {/* Stats Cards Section */}
      {profile.assignment && (
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="size-5 text-error" />
            <h2 className="text-xl font-bold tracking-tight text-on-surface">Statistik Personal</h2>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {/* Letters */}
            <div className="bg-surface-container-low border border-outline-variant/60 rounded-2xl p-5 hover:border-outline-variant transition-all text-center">
              <p className="text-xs font-mono font-bold tracking-wider text-on-surface-variant uppercase flex items-center justify-center gap-1">
                <FileText className="size-3.5" /> SURAT
              </p>
              <p className="text-3xl font-black text-on-surface my-2 leading-none">{profile.stats.totalLetters}</p>
              <p className="text-[10px] text-on-surface-variant font-mono">Permohonan diajukan</p>
            </div>
            
            {/* Meetings */}
            <div className="bg-surface-container-low border border-outline-variant/60 rounded-2xl p-5 hover:border-outline-variant transition-all text-center">
              <p className="text-xs font-mono font-bold tracking-wider text-on-surface-variant uppercase flex items-center justify-center gap-1">
                <CalendarDays className="size-3.5" /> RAPAT
              </p>
              <p className="text-3xl font-black text-on-surface my-2 leading-none">{profile.stats.totalMeetings}</p>
              <p className="text-[10px] text-on-surface-variant font-mono">Undangan diterima</p>
            </div>

            {/* Total Tasks */}
            <div className="bg-surface-container-low border border-outline-variant/60 rounded-2xl p-5 hover:border-outline-variant transition-all text-center">
              <p className="text-xs font-mono font-bold tracking-wider text-on-surface-variant uppercase flex items-center justify gap-1">
                <Circle className="size-3.5" /> TOTAL TASK
              </p>
              <p className="text-3xl font-black text-on-surface my-2 leading-none">{profile.stats.totalTasks}</p>
              <p className="text-[10px] text-on-surface-variant font-mono">Tugas diberikan</p>
            </div>

            {/* Done Tasks */}
            <div className="bg-surface-container-low border border-outline-variant/60 rounded-2xl p-5 hover:border-outline-variant transition-all text-center">
              <p className="text-xs font-mono font-bold tracking-wider text-on-surface-variant uppercase flex items-center justify gap-1">
                <CheckCircle className="size-3.5 text-accent-green" /> SELESAI
              </p>
              <p className="text-3xl font-black text-on-surface my-2 leading-none">{profile.stats.doneTasks}</p>
              <p className="text-[10px] text-on-surface-variant font-mono">Tugas rampung</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
