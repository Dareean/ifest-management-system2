"use client";

import { useActionState, useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Users, UserPlus, Trash2, Search, Filter, FileText, Video, X, ExternalLink,
  MessageCircle, Info, ShieldCheck, Shield, ChevronRight
} from "lucide-react";
import { removeMember } from "@/lib/actions/remove-member";
import { togglePersonnelReportCreator, togglePersonnelMeetingCreator } from "@/lib/actions/admin";
import type { MemberRow, DivisionGroup } from "./page";

interface Props {
  callerLevel: number;
  callerDivisionName: string;
  canInvite: boolean;
  isBPH: boolean;
  isAuthorityUser?: boolean;
  ownMembers?: MemberRow[];
  allDivisions?: DivisionGroup[];
}

function MemberDetailModal({
  open,
  onClose,
  member,
}: {
  open: boolean;
  onClose: () => void;
  member: MemberRow;
}) {
  if (!open) return null;

  const initials = member.name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const formattedPhone = member.phone ? member.phone.replace(/[^0-9]/g, "") : null;
  const waUrl = formattedPhone ? `https://wa.me/${formattedPhone.startsWith("0") ? "62" + formattedPhone.slice(1) : formattedPhone}` : null;

  const isTreasurerRole = member.roleSlug === "bendahara" || member.roleLevel === 70 || member.roleName.toLowerCase().includes("bendahara");
  const isAdminRole = member.roleLevel >= 80;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white border border-[#04000D]/10 rounded-2xl w-full max-w-lg shadow-2xl relative flex flex-col max-h-[90vh] overflow-hidden">
        
        {/* Header Close Icon */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-10 p-2 text-on-surface-variant hover:text-on-surface hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
        >
          <X className="size-5" />
        </button>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* 1. Header Profile */}
          <div className="flex flex-col items-center text-center space-y-3 pt-2">
            <span className="font-mono text-[9px] font-bold uppercase tracking-widest text-[#FF3D8B]">
              PROFIL ANGGOTA PANITIA
            </span>

            {member.avatarUrl ? (
              <img
                src={member.avatarUrl}
                alt={member.name}
                className="size-20 rounded-2xl object-cover border-2 border-slate-200 shadow-sm"
              />
            ) : (
              <div className="size-20 rounded-2xl bg-[#04000D] text-[#DCEEB1] font-mono font-black text-2xl flex items-center justify-center border border-slate-800 shadow-sm">
                {initials || "?"}
              </div>
            )}

            <div>
              <h3 className="text-xl font-extrabold text-on-surface tracking-tight">{member.name}</h3>
              <p className="text-xs font-mono text-on-surface-variant/80 mt-0.5">NIM: {member.nim || "—"}</p>
            </div>

            <div className="flex items-center gap-2 flex-wrap justify-center">
              {member.divisionName && (
                <span className="text-xs font-mono font-bold px-3 py-1 rounded-xl bg-slate-100 text-on-surface border border-slate-200">
                  Divisi {member.divisionName}
                </span>
              )}
              <span className="text-xs font-mono font-bold px-3 py-1 rounded-xl bg-[#04000D] text-[#DCEEB1]">
                {member.roleName} (Level {member.roleLevel})
              </span>
            </div>
          </div>

          {/* 2. Contribution Stats Grid */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-slate-50 border border-slate-200/70 rounded-xl p-3 text-center flex flex-col items-center justify-center">
              <span className="text-xs font-mono text-slate-400 font-bold uppercase tracking-wider block mb-1">TUGAS</span>
              <span className="text-base font-extrabold text-on-surface font-mono">
                {member.stats?.doneTasks ?? 0}<span className="text-xs text-slate-400 font-normal">/{member.stats?.totalTasks ?? 0}</span>
              </span>
              <span className="text-[9px] font-mono text-slate-500 mt-0.5">Diselesaikan</span>
            </div>

            <div className="bg-blue-50/60 border border-blue-200/60 rounded-xl p-3 text-center flex flex-col items-center justify-center">
              <span className="text-xs font-mono text-blue-500 font-bold uppercase tracking-wider block mb-1">RAPAT</span>
              <span className="text-base font-extrabold text-blue-700 font-mono">
                {member.stats?.totalMeetings ?? 0}
              </span>
              <span className="text-[9px] font-mono text-blue-600/80 mt-0.5">Pertemuan</span>
            </div>

            <div className="bg-amber-50/60 border border-amber-200/60 rounded-xl p-3 text-center flex flex-col items-center justify-center">
              <span className="text-xs font-mono text-amber-500 font-bold uppercase tracking-wider block mb-1">SURAT</span>
              <span className="text-base font-extrabold text-amber-700 font-mono">
                {member.stats?.totalLetters ?? 0}
              </span>
              <span className="text-[9px] font-mono text-amber-600/80 mt-0.5">Diajukan</span>
            </div>
          </div>

          {/* 3. Detailed Contact & Status */}
          <div className="bg-slate-50/70 border border-[#04000D]/5 rounded-xl p-4 space-y-3 font-mono text-xs">
            <div className="flex items-center justify-between">
              <span className="text-on-surface-variant font-medium">WhatsApp / HP</span>
              {member.phone ? (
                <a
                  href={waUrl || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-bold text-emerald-700 hover:underline flex items-center gap-1 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200/60"
                >
                  <MessageCircle className="size-3 text-emerald-600" />
                  {member.phone} <ExternalLink className="size-3 ml-0.5" />
                </a>
              ) : (
                <span className="text-slate-400">Belum diisi</span>
              )}
            </div>

            <div className="flex items-center justify-between">
              <span className="text-on-surface-variant font-medium">Status Kepanitiaan</span>
              <span className="font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-2 py-0.5 rounded-md">
                Panitia Aktif IFEST 2026
              </span>
            </div>
          </div>

          {/* 4. Authority & Access Matrix */}
          <div className="border border-[#04000D]/10 rounded-xl p-4 space-y-2.5 bg-white">
            <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-1">
              MATRIKS OTORITAS & IZIN AKSES
            </span>

            <div className="flex items-center justify-between font-mono text-xs">
              <span className="text-slate-600">Hak Setor Laporan</span>
              <span className={`font-bold ${member.roleIsReportCreator ? "text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded" : member.canSubmitReport ? "text-amber-700 bg-amber-50/60 border border-amber-200 px-2 py-0.5 rounded" : "text-slate-400"}`}>
                {member.roleIsReportCreator ? "Role (Otomatis)" : member.canSubmitReport ? "Aktif (Delegasi)" : "Tidak Aktif"}
              </span>
            </div>

            <div className="flex items-center justify-between font-mono text-xs">
              <span className="text-slate-600">Hak Membuat Rapat</span>
              <span className={`font-bold ${member.roleIsMeetingCreator ? "text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded" : member.canCreateMeeting ? "text-blue-700 bg-blue-50/60 border border-blue-200 px-2 py-0.5 rounded" : "text-slate-400"}`}>
                {member.roleIsMeetingCreator ? "Role (Otomatis)" : member.canCreateMeeting ? "Aktif (Delegasi)" : "Tidak Aktif"}
              </span>
            </div>

            <div className="flex items-center justify-between font-mono text-xs">
              <span className="text-slate-600">Hak Approval Surat/LPJ</span>
              <span className={`font-bold ${member.isApprover ? "text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded" : "text-slate-400"}`}>
                {member.isApprover ? "Aktif (BPH Approver)" : "Tidak"}
              </span>
            </div>

            <div className="flex items-center justify-between font-mono text-xs">
              <span className="text-slate-600">Pembukuan Bendahara</span>
              <span className={`font-bold ${isTreasurerRole ? "text-pink-700 bg-pink-50 border border-pink-200 px-2 py-0.5 rounded" : "text-slate-400"}`}>
                {isTreasurerRole ? "Aktif (Bendahara)" : "Tidak"}
              </span>
            </div>

            <div className="flex items-center justify-between font-mono text-xs">
              <span className="text-slate-600">Panel Admin System</span>
              <span className={`font-bold ${isAdminRole ? "text-[#04000D] bg-[#DCEEB1] px-2 py-0.5 rounded" : "text-slate-400"}`}>
                {isAdminRole ? "Aktif (Admin)" : "Tidak"}
              </span>
            </div>
          </div>
        </div>

        {/* Fixed Footer with Sticky Tutup Button */}
        <div className="p-4 bg-white border-t border-[#04000D]/10 shrink-0">
          <Button
            variant="outline"
            onClick={onClose}
            className="w-full rounded-xl font-mono text-xs font-bold uppercase tracking-wider cursor-pointer h-11 bg-slate-50 hover:bg-slate-100 text-slate-800 border-slate-200 shadow-2xs"
          >
            Tutup
          </Button>
        </div>

      </div>
    </div>
  );
}

function MemberCard({
  member,
  callerLevel,
  isAuthorityUser = false,
}: {
  member: MemberRow;
  callerLevel: number;
  isAuthorityUser?: boolean;
}) {
  const router = useRouter();
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [state, formAction] = useActionState(removeMember, null);

  useEffect(() => {
    if (state?.success) {
      startTransition(() => {
        router.refresh();
      });
    }
  }, [state, router]);

  const canDelete =
    callerLevel >= 75 ||
    (callerLevel >= 55 && member.roleLevel < callerLevel);

  const isInherentlyReportCreator = member.roleIsReportCreator;
  const isInherentlyMeetingCreator = member.roleIsMeetingCreator;

  async function handleToggleReportCreator() {
    if (!isAuthorityUser) {
      alert("Akses Ditolak: HANYA Gabriel, Nakita, dan Dareean yang berhak memberikan otoritas izin ini.");
      return;
    }
    if (isInherentlyReportCreator) {
      alert(`Personel ini sudah memiliki hak Setor Laporan otomatis dari jabatannya (${member.roleName}).`);
      return;
    }
    const actionText = member.canSubmitReport ? "mencabut" : "memberikan";
    if (confirm(`Apakah Anda yakin ingin ${actionText} hak Laporan Creator untuk ${member.name}?`)) {
      startTransition(async () => {
        const res = await togglePersonnelReportCreator(member.assignmentId, !member.canSubmitReport);
        if (res?.error) {
          alert(res.error);
        } else {
          router.refresh();
        }
      });
    }
  }

  async function handleToggleMeetingCreator() {
    if (!isAuthorityUser) {
      alert("Akses Ditolak: HANYA Gabriel, Nakita, dan Dareean yang berhak memberikan otoritas izin ini.");
      return;
    }
    if (isInherentlyMeetingCreator) {
      alert(`Personel ini sudah memiliki hak Membuat Rapat otomatis dari jabatannya (${member.roleName}).`);
      return;
    }
    const actionText = member.canCreateMeeting ? "mencabut" : "memberikan";
    if (confirm(`Apakah Anda yakin ingin ${actionText} hak Meeting Creator untuk ${member.name}?`)) {
      startTransition(async () => {
        const res = await togglePersonnelMeetingCreator(member.assignmentId, !member.canCreateMeeting);
        if (res?.error) {
          alert(res.error);
        } else {
          router.refresh();
        }
      });
    }
  }

  const initials = member.name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const formattedPhone = member.phone ? member.phone.replace(/[^0-9]/g, "") : null;
  const waUrl = formattedPhone ? `https://wa.me/${formattedPhone.startsWith("0") ? "62" + formattedPhone.slice(1) : formattedPhone}` : null;

  // Role Badge Color according to DESIGN.md tokens
  const getRoleBadgeStyle = (level: number) => {
    if (level >= 90) return "bg-[#04000D] text-[#DCEEB1] border-[#04000D]";
    if (level >= 75) return "bg-[#FF3D8B]/10 text-[#FF3D8B] border-[#FF3D8B]/20";
    if (level >= 60) return "bg-blue-50 text-blue-700 border-blue-200";
    return "bg-slate-100 text-slate-700 border-slate-200";
  };

  return (
    <>
      <div className={`group bg-white border border-[#04000D]/5 shadow-[0_8px_30px_rgb(0,0,0,0.015)] rounded-2xl p-5 flex flex-col justify-between gap-4 transition-all duration-300 hover:border-[#04000D]/15 hover:shadow-[0_12px_40px_rgb(0,0,0,0.03)] ${isPending ? "opacity-50 cursor-not-allowed" : ""}`}>
        
        {/* Top Header Card */}
        <div className="flex items-start justify-between gap-3">
          <div
            onClick={() => setShowDetailModal(true)}
            className="flex items-center gap-3 min-w-0 flex-1 cursor-pointer group/profile"
            title="Klik untuk detail profil"
          >
            {member.avatarUrl ? (
              <img
                src={member.avatarUrl}
                alt={member.name}
                className="size-12 rounded-xl object-cover shrink-0 border border-slate-200 group-hover/profile:border-slate-400 transition-colors"
              />
            ) : (
              <div className="size-12 rounded-xl bg-[#04000D] text-[#DCEEB1] font-mono font-black text-sm flex items-center justify-center shrink-0 border border-slate-800 shadow-xs">
                {initials || "?"}
              </div>
            )}
            
            <div className="min-w-0 flex-1">
              <h4 className="text-base font-extrabold text-on-surface leading-snug truncate group-hover/profile:text-[#FF3D8B] transition-colors" title={member.name}>
                {member.name}
              </h4>
              <div className="flex items-center gap-2 mt-1 flex-wrap min-w-0">
                <span className="text-xs text-on-surface-variant/70 font-mono shrink-0">{member.nim || "—"}</span>
                <span className={`text-[9px] font-mono font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md border shrink-0 ${getRoleBadgeStyle(member.roleLevel)}`}>
                  {member.roleName}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            {waUrl && (
              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-xl bg-emerald-50 text-emerald-600 hover:bg-emerald-100 hover:text-emerald-700 border border-emerald-200/50 transition-all cursor-pointer"
                title="Hubungi via WhatsApp"
              >
                <MessageCircle className="size-4" />
              </a>
            )}

            <button
              onClick={() => setShowDetailModal(true)}
              className="p-2 rounded-xl bg-slate-50 text-slate-500 hover:bg-slate-100 hover:text-slate-900 border border-slate-200/60 transition-all cursor-pointer"
              title="Lihat Detail Profil"
            >
              <Info className="size-4" />
            </button>

            {canDelete && (
              <form
                action={formAction}
                onSubmit={(e) => {
                  if (!confirm(`Yakin ingin menghapus ${member.name} dari kepanitiaan?`)) {
                    e.preventDefault();
                  }
                }}
              >
                <input type="hidden" name="target_id" value={member.assignmentId} />
                <button
                  type="submit"
                  disabled={isPending}
                  className="p-2 rounded-xl bg-rose-50 text-rose-500 hover:bg-rose-100 hover:text-rose-700 border border-rose-200/50 transition-all cursor-pointer disabled:opacity-50"
                  title="Hapus Anggota"
                >
                  <Trash2 className="size-4" />
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Permission Delegation Badges / Active Access Indicator */}
        {isAuthorityUser ? (
          <div className="flex items-center gap-2 pt-3 border-t border-[#04000D]/5 flex-wrap">
            <button
              onClick={handleToggleReportCreator}
              disabled={isPending}
              title={
                isInherentlyReportCreator
                  ? `Akses otomatis dari jabatan ${member.roleName}`
                  : member.canSubmitReport
                  ? "Klik untuk mencabut hak setor laporan"
                  : "Klik untuk mendelegasikan hak setor laporan"
              }
              className={`inline-flex items-center gap-1.5 font-mono text-[10px] font-extrabold uppercase tracking-wider px-3 py-1.5 rounded-xl border transition-all cursor-pointer ${
                isInherentlyReportCreator
                  ? "bg-amber-100/80 text-amber-900 border-amber-300 shadow-2xs"
                  : member.canSubmitReport
                  ? "bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100"
                  : "bg-slate-50 text-slate-400 border-slate-200/70 hover:border-amber-300 hover:text-amber-800 hover:bg-amber-50/50"
              }`}
            >
              <FileText className="size-3.5" />
              {isInherentlyReportCreator ? "Laporan Creator (Role)" : member.canSubmitReport ? "Laporan Creator" : "+ Laporan Creator"}
            </button>

            <button
              onClick={handleToggleMeetingCreator}
              disabled={isPending}
              title={
                isInherentlyMeetingCreator
                  ? `Akses otomatis dari jabatan ${member.roleName}`
                  : member.canCreateMeeting
                  ? "Klik untuk mencabut hak membuat rapat"
                  : "Klik untuk mendelegasikan hak membuat rapat"
              }
              className={`inline-flex items-center gap-1.5 font-mono text-[10px] font-extrabold uppercase tracking-wider px-3 py-1.5 rounded-xl border transition-all cursor-pointer ${
                isInherentlyMeetingCreator
                  ? "bg-blue-100/80 text-blue-900 border-blue-300 shadow-2xs"
                  : member.canCreateMeeting
                  ? "bg-blue-50 text-blue-800 border-blue-300 hover:bg-blue-100"
                  : "bg-slate-50 text-slate-400 border-slate-200/70 hover:border-blue-300 hover:text-blue-800 hover:bg-blue-50/50"
              }`}
            >
              <Video className="size-3.5" />
              {isInherentlyMeetingCreator ? "Meeting Creator (Role)" : member.canCreateMeeting ? "Meeting Creator" : "+ Meeting Creator"}
            </button>
          </div>
        ) : (
          (isInherentlyReportCreator || member.canSubmitReport || isInherentlyMeetingCreator || member.canCreateMeeting) && (
            <div className="flex items-center gap-2 pt-3 border-t border-[#04000D]/5 flex-wrap">
              {(isInherentlyReportCreator || member.canSubmitReport) && (
                <span
                  title={isInherentlyReportCreator ? `Hak akses dari jabatan ${member.roleName}` : "Hak akses disetujui pimpinan"}
                  className={`inline-flex items-center gap-1.5 font-mono text-[10px] font-extrabold uppercase tracking-wider px-3 py-1.5 rounded-xl border select-none ${
                    isInherentlyReportCreator
                      ? "bg-amber-100/80 text-amber-900 border-amber-300"
                      : "bg-amber-50 text-amber-800 border-amber-200"
                  }`}
                >
                  <FileText className="size-3.5" />
                  {isInherentlyReportCreator ? "Laporan Creator (Role)" : "Laporan Creator"}
                </span>
              )}
              {(isInherentlyMeetingCreator || member.canCreateMeeting) && (
                <span
                  title={isInherentlyMeetingCreator ? `Hak akses dari jabatan ${member.roleName}` : "Hak akses disetujui pimpinan"}
                  className={`inline-flex items-center gap-1.5 font-mono text-[10px] font-extrabold uppercase tracking-wider px-3 py-1.5 rounded-xl border select-none ${
                    isInherentlyMeetingCreator
                      ? "bg-blue-100/80 text-blue-900 border-blue-300"
                      : "bg-blue-50 text-blue-800 border-blue-200"
                  }`}
                >
                  <Video className="size-3.5" />
                  {isInherentlyMeetingCreator ? "Meeting Creator (Role)" : "Meeting Creator"}
                </span>
              )}
            </div>
          )
        )}
      </div>

      <MemberDetailModal
        open={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        member={member}
      />
    </>
  );
}

export function MembersClient({
  callerLevel,
  callerDivisionName,
  canInvite,
  isBPH,
  isAuthorityUser = false,
  ownMembers,
  allDivisions,
}: Props) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDivision, setSelectedDivision] = useState<string>("ALL");

  // Filter logic
  const divisions = allDivisions || [];

  // Total overall count
  const totalCount = isBPH
    ? divisions.reduce((s, d) => s + d.members.length, 0)
    : ownMembers?.length ?? 0;

  // Filter BPH divisions and their members
  const filteredDivisions = divisions
    .map((div) => {
      const matchingMembers = div.members.filter((m) => {
        const matchSearch =
          m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          m.nim.toLowerCase().includes(searchQuery.toLowerCase());
        return matchSearch;
      });
      return { ...div, members: matchingMembers };
    })
    .filter((div) => {
      if (selectedDivision !== "ALL" && div.divisionId !== selectedDivision) {
        return false;
      }
      return div.members.length > 0 || selectedDivision === div.divisionId;
    });

  // Filter non-BPH (coordinators) members
  const filteredOwnMembers = (ownMembers ?? []).filter((m) => {
    return (
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.nim.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const hasResults = isBPH
    ? filteredDivisions.some((d) => d.members.length > 0)
    : filteredOwnMembers.length > 0;

  return (
    <div className="flex flex-col gap-8 pb-10">
      
      {/* 1. Header Section following DESIGN.md standard */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#04000D]/5 pb-6">
        <div>
          <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-[#FF3D8B] block mb-1">
            {isBPH ? "BPH KEPANITIAAN" : `DIVISI ${callerDivisionName.toUpperCase()}`}
          </span>
          <h1 className="font-extrabold text-3xl md:text-4xl tracking-tight text-on-surface">
            Anggota Panitia
          </h1>
          <p className="mt-1 text-sm text-on-surface-variant font-medium">
            {totalCount} orang terdaftar dalam struktur kepanitiaan I-FEST 2026.
          </p>
        </div>
        {canInvite && (
          <Link href="/dashboard/members/invite">
            <Button className="bg-[#04000D] text-[#DCEEB1] hover:bg-black font-mono text-xs font-bold uppercase tracking-wider px-5 py-2.5 rounded-xl shadow-xs cursor-pointer gap-2">
              <UserPlus className="size-4" />
              Undang Anggota
            </Button>
          </Link>
        )}
      </div>

      {/* 2. Filter & Control Panel following DESIGN.md Card pattern */}
      <div className="bg-white border border-[#04000D]/5 shadow-[0_8px_30px_rgb(0,0,0,0.015)] rounded-2xl p-5 flex flex-col gap-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
            <input
              type="text"
              placeholder="Cari anggota berdasarkan nama atau NIM..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-xs font-mono text-on-surface placeholder:text-slate-400 focus:outline-none focus:border-slate-800 focus:bg-white transition-all"
            />
          </div>

          {/* Results Badge */}
          <div className="flex items-center gap-2 self-start md:self-auto text-xs font-mono font-bold text-slate-500 bg-slate-50 px-3 py-2 rounded-xl border border-slate-200/70">
            <Filter className="size-3.5 text-slate-400" />
            <span>Menampilkan {isBPH ? filteredDivisions.reduce((s, d) => s + d.members.length, 0) : filteredOwnMembers.length} hasil</span>
          </div>
        </div>

        {/* Division Filter Tabs (BPH Only) */}
        {isBPH && divisions.length > 0 && (
          <div className="border-t border-[#04000D]/5 pt-4 flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedDivision("ALL")}
              className={`px-4 py-2 rounded-xl font-mono text-[11px] font-extrabold uppercase tracking-wider transition-all cursor-pointer ${
                selectedDivision === "ALL"
                  ? "bg-[#04000D] text-[#DCEEB1] shadow-xs"
                  : "bg-slate-50 text-slate-600 border border-slate-200/60 hover:bg-slate-100"
              }`}
            >
              Semua Divisi
            </button>
            {divisions.map((div) => (
              <button
                key={div.divisionId}
                onClick={() => setSelectedDivision(div.divisionId)}
                className={`px-4 py-2 rounded-xl font-mono text-[11px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                  selectedDivision === div.divisionId
                    ? "bg-[#04000D] text-[#DCEEB1] shadow-xs"
                    : "bg-slate-50 text-slate-600 border border-slate-200/60 hover:bg-slate-100"
                }`}
              >
                {div.divisionName}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 3. Members Grid Layout */}
      <div className="flex flex-col gap-8">
        {!hasResults ? (
          <div className="bg-white border border-[#04000D]/5 shadow-[0_8px_30px_rgb(0,0,0,0.015)] rounded-2xl p-12 text-center">
            <Users className="size-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-extrabold text-on-surface">Anggota Tidak Ditemukan</h3>
            <p className="text-xs text-on-surface-variant/80 mt-1 max-w-sm mx-auto font-mono">
              Tidak ada anggota yang cocok dengan pencarian "{searchQuery}"{selectedDivision !== "ALL" ? " di divisi ini." : "."}
            </p>
            {(searchQuery || selectedDivision !== "ALL") && (
              <Button
                variant="outline"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedDivision("ALL");
                }}
                className="mt-4 font-mono text-xs font-bold uppercase tracking-wider cursor-pointer rounded-xl"
              >
                Reset Filter
              </Button>
            )}
          </div>
        ) : isBPH ? (
          // BPH Grouped Division Grid
          <div className="flex flex-col gap-10">
            {filteredDivisions.map((div) => {
              if (div.members.length === 0) return null;
              return (
                <div key={div.divisionId} className="flex flex-col gap-4">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs font-black uppercase tracking-widest bg-[#04000D] text-[#DCEEB1] px-3 py-1.5 rounded-xl shadow-xs">
                      {div.divisionName}
                    </span>
                    <span className="font-mono text-xs font-bold text-slate-400">
                      ({div.members.length} anggota)
                    </span>
                    <div className="flex-1 h-px bg-[#04000D]/5" />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {div.members.map((member) => (
                      <MemberCard
                        key={member.assignmentId}
                        member={member}
                        callerLevel={callerLevel}
                        isAuthorityUser={isAuthorityUser}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          // Coordinator View Grid
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredOwnMembers.map((member) => (
              <MemberCard
                key={member.assignmentId}
                member={member}
                callerLevel={callerLevel}
                isAuthorityUser={isAuthorityUser}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
