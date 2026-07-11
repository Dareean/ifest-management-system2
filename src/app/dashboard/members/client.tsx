"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, UserPlus, Trash2 } from "lucide-react";
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
  const [state, formAction] = useActionState(removeMember, null);

  useEffect(() => {
    if (state?.success) router.refresh();
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

  return (
    <div className="bg-white border border-outline-variant/60 rounded-xl p-4 flex items-center justify-between gap-4">
      <div className="flex items-center gap-3 min-w-0">
        <div className="size-10 rounded-full bg-block-lilac/30 flex items-center justify-center font-bold text-primary shrink-0 text-sm">
          {initials || "?"}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-bold text-on-surface truncate">{member.name}</p>
          <p className="text-xs text-on-surface-variant font-mono mt-0.5">{member.nim}</p>
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <Badge variant="outline" className="text-[10px] font-mono">
          {member.roleName}
        </Badge>
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
              className="p-1.5 rounded-lg hover:bg-error-container text-on-surface-variant hover:text-error transition-colors cursor-pointer"
              title="Hapus anggota"
            >
              <Trash2 className="size-4" />
            </button>
          </form>
        )}
      </div>
      {state?.error && (
        <p className="text-xs text-error font-mono mt-2">{state.error}</p>
      )}
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
  const title = isBPH ? "SEMUA DIVISI" : `DIVISI ${callerDivisionName.toUpperCase()}`;

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-accent-magenta font-mono text-xs font-bold tracking-widest uppercase mb-1">
            {title}
          </p>
          <h1 className="text-3xl font-extrabold tracking-tight text-on-surface">Anggota</h1>
          <p className="mt-1 text-base text-on-surface-variant">
            {isBPH
              ? `${allDivisions?.reduce((s, d) => s + d.members.length, 0) ?? 0} orang terdaftar`
              : `${ownMembers?.length ?? 0} orang terdaftar`}
          </p>
        </div>
        {canInvite && (
          <Link href="/dashboard/members/invite">
            <Button variant="primary" className="cursor-pointer font-sans text-sm font-semibold gap-2">
              <UserPlus className="size-4" />
              Undang Anggota
            </Button>
          </Link>
        )}
      </div>

      {isBPH && allDivisions ? (
        // BPH view: grouped by division
        <div className="flex flex-col gap-8">
          {allDivisions.length === 0 && (
            <div className="bg-white border border-outline-variant/60 rounded-2xl p-8 text-center">
              <Users className="size-8 text-on-surface-variant/40 mx-auto mb-3" />
              <p className="text-sm font-mono text-on-surface-variant">Belum ada anggota terdaftar.</p>
            </div>
          )}
          {allDivisions.map((div) => (
            <div key={div.divisionId} className="flex flex-col gap-3">
              <h2 className="text-sm font-bold text-on-surface tracking-wider font-mono">
                {div.divisionName} <span className="text-on-surface-variant font-normal">({div.members.length})</span>
              </h2>
              <div className="flex flex-col gap-2">
                {div.members.map((member) => (
                  <MemberCard
                    key={member.assignmentId}
                    member={member}
                    callerLevel={callerLevel}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        // Koordinator/Wakord view: own division
        <div className="flex flex-col gap-2">
          {(ownMembers ?? []).length === 0 && (
            <div className="bg-white border border-outline-variant/60 rounded-2xl p-8 text-center">
              <Users className="size-8 text-on-surface-variant/40 mx-auto mb-3" />
              <p className="text-sm font-mono text-on-surface-variant">Belum ada anggota di divisi ini.</p>
            </div>
          )}
            {(ownMembers ?? []).map((member) => (
            <MemberCard
              key={member.assignmentId}
              member={member}
              callerLevel={callerLevel}
            />
          ))}
        </div>
      )}
    </div>
  );
}
