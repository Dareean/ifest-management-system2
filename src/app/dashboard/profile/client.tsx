"use client";

import { useActionState, useState } from "react";
import { ColorBlock } from "@/components/blocks/color-block";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Pencil, Mail, Hash, Phone, Calendar, Shield, FileText, CalendarDays, CheckCircle, Circle } from "lucide-react";
import { updateProfile } from "@/lib/actions/profile";
import type { ProfileData } from "@/lib/data/profile";

export function ProfileClient({ profile }: { profile: ProfileData }) {
  const [editing, setEditing] = useState(false);
  const [state, formAction, pending] = useActionState(updateProfile, null);

  return (
    <div className="max-w-3xl flex flex-col gap-section-gap">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="eyebrow text-on-surface-variant">Akun</p>
          <h1 className="text-4xl font-semibold tracking-tight leading-none">Profil</h1>
        </div>
        <Button variant="outline" size="sm" onClick={() => setEditing(!editing)}>
          <Pencil className="size-4" />
          {editing ? "Batal" : "Edit Profil"}
        </Button>
      </div>

      {/* Profile Card */}
      <ColorBlock color="lilac">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-lg">
              <div className="size-16 rounded-full bg-primary flex items-center justify-center text-on-primary text-2xl font-semibold">
                {profile.fullName.charAt(0).toUpperCase()}
              </div>
              <div>
                <CardTitle className="text-2xl">{profile.fullName || "Belum diisi"}</CardTitle>
                <CardDescription>
                  {profile.assignment
                    ? `${profile.assignment.role} — ${profile.assignment.division}`
                    : "Belum terdaftar di kepanitiaan"}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>
      </ColorBlock>

      {/* Detail */}
      <ColorBlock color="mint">
        <p className="eyebrow text-on-surface-variant mb-md">Detail Akun</p>

        {state?.error && <p className="text-red-500 caption mb-md">{state.error}</p>}
        {state?.success && <p className="text-green-600 caption mb-md">Profil berhasil diperbarui!</p>}

        <form action={formAction} className="flex flex-col gap-md">
          <input type="hidden" name="userId" value={profile.userId ?? ""} />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
            {/* Email (readonly) */}
            <div>
              <label className="caption block mb-xs text-on-surface-variant flex items-center gap-1">
                <Mail className="size-3" /> Email
              </label>
              <Input value={profile.email ?? ""} disabled className="opacity-60" />
            </div>

            {/* NIM */}
            <div>
              <label className="caption block mb-xs text-on-surface-variant flex items-center gap-1">
                <Hash className="size-3" /> NIM
              </label>
              <Input
                name="nim"
                defaultValue={profile.nim}
                disabled={!editing}
                className={!editing ? "opacity-60" : ""}
                required
              />
            </div>

            {/* Full Name */}
            <div>
              <label className="caption block mb-xs text-on-surface-variant">Nama Lengkap</label>
              <Input
                name="fullName"
                defaultValue={profile.fullName}
                disabled={!editing}
                className={!editing ? "opacity-60" : ""}
                required
              />
            </div>

            {/* Phone */}
            <div>
              <label className="caption block mb-xs text-on-surface-variant flex items-center gap-1">
                <Phone className="size-3" /> No. HP
              </label>
              <Input
                name="phone"
                defaultValue={profile.phone ?? ""}
                disabled={!editing}
                className={!editing ? "opacity-60" : ""}
                placeholder="Belum diisi"
              />
            </div>
          </div>

          {editing && (
            <div className="flex justify-end">
              <Button type="submit" disabled={pending}>
                {pending ? "Menyimpan..." : "Simpan Perubahan"}
              </Button>
            </div>
          )}
        </form>
      </ColorBlock>

      {/* Committee Info */}
      {profile.assignment && (
        <ColorBlock color="coral">
          <p className="eyebrow text-on-surface-variant mb-md">Kepanitiaan</p>
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-sm">
                  <Shield className="size-4 text-accent-magenta" />
                  <CardTitle className="text-base">{profile.assignment.role}</CardTitle>
                </div>
                <Badge variant={profile.assignment.isActive ? "success" : "secondary"}>
                  {profile.assignment.isActive ? "Aktif" : "Tidak Aktif"}
                </Badge>
              </div>
              <CardDescription>
                <span className="flex items-center gap-1 mt-1">
                  <Calendar className="size-3" />
                  Bergabung {new Date(profile.assignment.assignedAt).toLocaleDateString("id-ID", {
                    day: "numeric", month: "long", year: "numeric",
                  })}
                </span>
              </CardDescription>
            </CardHeader>
          </Card>
        </ColorBlock>
      )}

      {/* Stats */}
      {profile.assignment && (
        <ColorBlock color="pink">
          <p className="eyebrow text-on-surface-variant mb-md">Statistik</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-md">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl font-semibold flex items-center gap-2">
                  <FileText className="size-4 text-accent-magenta" />
                  {profile.stats.totalLetters}
                </CardTitle>
                <CardDescription>Surat</CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl font-semibold flex items-center gap-2">
                  <CalendarDays className="size-4 text-accent-coral" />
                  {profile.stats.totalMeetings}
                </CardTitle>
                <CardDescription>Rapat</CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl font-semibold flex items-center gap-2">
                  <Circle className="size-4 text-on-surface-variant" />
                  {profile.stats.totalTasks}
                </CardTitle>
                <CardDescription>Total Task</CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl font-semibold flex items-center gap-2">
                  <CheckCircle className="size-4 text-emerald-500" />
                  {profile.stats.doneTasks}
                </CardTitle>
                <CardDescription>Selesai</CardDescription>
              </CardHeader>
            </Card>
          </div>
        </ColorBlock>
      )}
    </div>
  );
}
