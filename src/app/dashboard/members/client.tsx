"use client";

import { useActionState, useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, UserPlus, Trash2, Search, Filter } from "lucide-react";
import { removeMember } from "@/lib/actions/remove-member";
import type { MemberRow, DivisionGroup } from "./page";

interface Props {
  callerLevel: number;
  callerDivisionName: string;
  canInvite: boolean;
  isBPH: boolean;
  ownMembers?: MemberRow[];
  allDivisions?: DivisionGroup[];
}

function MemberCard({
  member,
  callerLevel,
}: {
  member: MemberRow;
  callerLevel: number;
}) {
  const router = useRouter();
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

  const initials = member.name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  // Color scheme based on role level to make it visually clear
  const getAvatarBg = (level: number) => {
    if (level >= 90) return "bg-primary/10 text-primary border-primary/20";
    if (level >= 75) return "bg-accent-magenta/10 text-accent-magenta border-accent-magenta/20";
    if (level >= 60) return "bg-block-blue/10 text-block-blue border-block-blue/20";
    return "bg-block-lilac/10 text-on-surface-variant border-outline-variant/30";
  };

  const getRoleBadgeColor = (level: number) => {
    if (level >= 90) return "bg-primary text-white border-transparent";
    if (level >= 75) return "bg-accent-magenta text-white border-transparent";
    if (level >= 60) return "bg-block-blue/10 text-block-blue border-block-blue/30";
    return "bg-surface-container text-on-surface-variant border-outline-variant/40";
  };

  return (
    <div className={`group bg-white border border-outline-variant/60 rounded-2xl p-4 flex items-center justify-between gap-3 transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:border-primary/20 hover:-translate-y-0.5 ${isPending ? "opacity-60 cursor-not-allowed" : ""}`}>
      <div className="flex items-center gap-3.5 min-w-0 flex-1">
        <div className={`size-11 rounded-2xl border flex items-center justify-center font-bold shrink-0 text-sm tracking-wider ${getAvatarBg(member.roleLevel)}`}>
          {initials || "?"}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-on-surface truncate group-hover:text-primary transition-colors duration-200" title={member.name}>
            {member.name}
          </p>
          <div className="flex items-center gap-2 mt-1 flex-wrap min-w-0">
            <span className="text-xs text-on-surface-variant font-mono shrink-0">{member.nim}</span>
            <span className="size-1 rounded-full bg-outline-variant/60 shrink-0" />
            <span className={`text-[9px] font-bold px-2 py-0.5 rounded border font-mono uppercase tracking-wider shrink-0 ${getRoleBadgeColor(member.roleLevel)}`}>
              {member.roleName}
            </span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-1 shrink-0">
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
              className="p-2 rounded-xl hover:bg-error-container/20 text-on-surface-variant hover:text-error transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              title="Hapus anggota"
            >
              <Trash2 className="size-4" />
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export function MembersClient({
  callerLevel,
  callerDivisionName,
  canInvite,
  isBPH,
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
    <div className="flex flex-col gap-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/40 backdrop-blur-md border border-outline-variant/20 rounded-3xl p-6">
        <div>
          <p className="text-accent-magenta font-mono text-xs font-bold tracking-widest uppercase mb-1">
            {isBPH ? "BPH KEPANITIAAN" : `DIVISI ${callerDivisionName.toUpperCase()}`}
          </p>
          <h1 className="text-3xl font-black tracking-tight text-on-surface font-sans">Anggota</h1>
          <p className="mt-1 text-sm text-on-surface-variant font-medium">
            {totalCount} orang terdaftar secara keseluruhan
          </p>
        </div>
        {canInvite && (
          <Link href="/dashboard/members/invite">
            <Button variant="primary" className="cursor-pointer font-sans text-sm font-bold gap-2 px-5 py-6 rounded-2xl shadow-lg shadow-primary/10 hover:shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200">
              <UserPlus className="size-4.5" />
              Undang Anggota
            </Button>
          </Link>
        )}
      </div>

      {/* Control Panel (Search & Division Tabs) */}
      <div className="flex flex-col gap-4 bg-white border border-outline-variant/40 rounded-3xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Search bar */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4.5 text-on-surface-variant/60" />
            <input
              type="text"
              placeholder="Cari anggota berdasarkan nama atau NIM..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 rounded-2xl border border-outline-variant/60 bg-surface-container-lowest text-sm font-medium text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:border-primary/80 focus:ring-1 focus:ring-primary/80 transition-all"
            />
          </div>

          {/* Info Badge */}
          <div className="flex items-center gap-2 self-start md:self-auto text-xs font-mono text-on-surface-variant bg-surface-container px-3 py-1.5 rounded-xl border border-outline-variant/30">
            <Filter className="size-3.5" />
            <span>Menampilkan {isBPH ? filteredDivisions.reduce((s, d) => s + d.members.length, 0) : filteredOwnMembers.length} hasil</span>
          </div>
        </div>

        {/* Division Tabs (BPH Only) */}
        {isBPH && divisions.length > 0 && (
          <div className="border-t border-outline-variant/40 pt-4 flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedDivision("ALL")}
              className={`px-4 py-2 rounded-xl text-xs font-bold font-mono tracking-wider uppercase border transition-all duration-200 cursor-pointer ${
                selectedDivision === "ALL"
                  ? "bg-primary text-white border-transparent shadow-sm"
                  : "bg-white text-on-surface-variant border-outline-variant/50 hover:bg-surface-container"
              }`}
            >
              Semua Divisi
            </button>
            {divisions.map((div) => (
              <button
                key={div.divisionId}
                onClick={() => setSelectedDivision(div.divisionId)}
                className={`px-4 py-2 rounded-xl text-xs font-bold font-mono tracking-wider uppercase border transition-all duration-200 cursor-pointer ${
                  selectedDivision === div.divisionId
                    ? "bg-primary text-white border-transparent shadow-sm"
                    : "bg-white text-on-surface-variant border-outline-variant/50 hover:bg-surface-container"
                }`}
              >
                {div.divisionName}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Members Grid / List */}
      <div className="flex flex-col gap-6">
        {!hasResults ? (
          <div className="bg-white border border-outline-variant/60 rounded-3xl p-12 text-center shadow-sm">
            <Users className="size-12 text-on-surface-variant/30 mx-auto mb-4" />
            <h3 className="text-base font-bold text-on-surface">Anggota Tidak Ditemukan</h3>
            <p className="text-sm text-on-surface-variant mt-1 max-w-sm mx-auto">
              Tidak ada anggota yang cocok dengan pencarian "{searchQuery}"{selectedDivision !== "ALL" ? " di divisi terpilih." : "."}
            </p>
            {(searchQuery || selectedDivision !== "ALL") && (
              <Button
                variant="outline"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedDivision("ALL");
                }}
                className="mt-4 text-xs font-bold cursor-pointer rounded-xl"
              >
                Reset Filter
              </Button>
            )}
          </div>
        ) : isBPH ? (
          // BPH View (Grouped or filtered division view)
          <div className="flex flex-col gap-8">
            {filteredDivisions.map((div) => {
              if (div.members.length === 0) return null;
              return (
                <div key={div.divisionId} className="flex flex-col gap-4">
                  <div className="flex items-center gap-3">
                    <h2 className="text-xs font-black tracking-widest text-on-surface font-mono uppercase bg-block-lilac/30 text-primary px-3.5 py-1.5 rounded-xl border border-primary/10">
                      {div.divisionName}
                    </h2>
                    <span className="text-xs font-bold font-mono text-on-surface-variant">
                      ({div.members.length} anggota)
                    </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {div.members.map((member) => (
                      <MemberCard
                        key={member.assignmentId}
                        member={member}
                        callerLevel={callerLevel}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          // Coordinator View (Own division grid)
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredOwnMembers.map((member) => (
              <MemberCard
                key={member.assignmentId}
                member={member}
                callerLevel={callerLevel}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
