"use client";

import { useActionState, useEffect, useState, useMemo, startTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { createMeeting } from "@/lib/actions/meetings";
import { useRouter } from "next/navigation";
import type { DivisionGroup } from "@/lib/data/members";

interface Props {
  divisions: DivisionGroup[];
  creatorAssignmentId: string;
  creatorDivisionId: string;
  creatorRoleLevel: number;
}

export function NewMeetingForm({
  divisions,
  creatorDivisionId,
  creatorRoleLevel,
}: Props) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(createMeeting, null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");

  const isBPH = creatorRoleLevel >= 75;

  useEffect(() => {
    if (state?.success && state.meetingId) {
      router.push(`/dashboard/meetings/${state.meetingId}`);
    }
  }, [state, router]);

  function toggleMember(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleDivision(divisionId: string) {
    const members = divisions
      .find((d) => d.divisionId === divisionId)
      ?.members.filter((m) => canSelect(m)) ?? [];

    const allSelected = members.every((m) => selectedIds.has(m.assignmentId));

    setSelectedIds((prev) => {
      const next = new Set(prev);
      for (const m of members) {
        if (allSelected) next.delete(m.assignmentId);
        else next.add(m.assignmentId);
      }
      return next;
    });
  }

  function canSelect(member: {
    assignmentId: string;
    divisionId: string;
    roleLevel: number;
  }) {
    if (isBPH) return true;
    if (member.divisionId === creatorDivisionId) return true;
    if (member.roleLevel >= 75) return true;
    return false;
  }

  function isDivisionFullySelected(divisionId: string) {
    const members = divisions
      .find((d) => d.divisionId === divisionId)
      ?.members.filter((m) => canSelect(m)) ?? [];
    return members.length > 0 && members.every((m) => selectedIds.has(m.assignmentId));
  }

  const filteredDivisions = useMemo(() => {
    if (!search.trim()) return divisions;
    const q = search.toLowerCase();
    return divisions
      .map((d) => ({
        ...d,
        members: d.members.filter((m) => m.name.toLowerCase().includes(q)),
      }))
      .filter((d) => d.members.length > 0);
  }, [search, divisions]);

  return (
    <div className="bg-white border border-outline-variant/60 rounded-2xl p-6 sm:p-8 relative overflow-hidden">
      {pending && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm gap-3">
          <Spinner size="lg" />
          <p className="text-sm font-mono text-accent-magenta font-bold animate-pulse">
            Membuat rapat...
          </p>
        </div>
      )}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const fd = new FormData(e.currentTarget);
          fd.set("invitee_ids", JSON.stringify(Array.from(selectedIds)));
          startTransition(() => formAction(fd));
        }}
        className={`flex flex-col gap-6 ${pending ? "pointer-events-none select-none" : ""}`}
      >

        {state?.error && (
          <div className="text-sm text-error bg-error-container rounded-lg p-4 font-mono">
            {state.error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <label className="caption block mb-1.5 text-on-surface-variant font-semibold">
              Judul Rapat
            </label>
            <Input name="title" placeholder="Contoh: Rapat Koordinasi Divisi Acara" required />
          </div>
          <div>
            <label className="caption block mb-1.5 text-on-surface-variant font-semibold">
              Tipe Rapat
            </label>
            <select
              name="meetingType"
              className="flex h-11 w-full rounded-md border border-primary bg-surface-bright px-4 py-2 text-base font-sans text-on-surface focus:border-accent-magenta focus:outline-none cursor-pointer appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2020%2020%22%20fill%3D%22none%22%3E%3Cpath%20d%3D%22M7%209l3%203%203-3%22%20stroke%3D%22%231d1b1d%22%20stroke-width%3D%221.5%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%3C%2Fsvg%3E')] bg-[length:1.25rem] bg-[right_1rem_center] bg-no-repeat pr-10"
            >
              <option value="scheduled">Terjadwal</option>
              <option value="adhoc">Kondisional</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="caption block mb-1.5 text-on-surface-variant font-semibold">
              Tanggal & Waktu Mulai
            </label>
            <Input name="startedAt" type="datetime-local" required />
          </div>

          <div>
            <label className="caption block mb-1.5 text-on-surface-variant font-semibold">
              Tautan Pertemuan (Online - Zoom/GMeet)
            </label>
            <Input name="meetingLink" placeholder="https://meet.google.com/..." />
          </div>
        </div>

        <div>
          <label className="caption block mb-1.5 text-on-surface-variant font-semibold">
            Lokasi / Ruangan (Offline - opsional)
          </label>
          <Input name="location" placeholder="Contoh: Sekretariat HMTI / Ruang Rapat Teknik" />
        </div>

        <div>
          <label className="caption block mb-1.5 text-on-surface-variant font-semibold">
            Agenda Rapat
          </label>
          <textarea
            name="agenda"
            className="flex min-h-[140px] w-full rounded-md border border-primary bg-surface-bright px-4 py-2 text-base font-sans text-on-surface placeholder:text-on-surface-variant focus:border-accent-magenta focus:outline-none resize-y"
            placeholder="Tulis poin-poin bahasan rapat di sini..."
          />
        </div>

        {/* Invitee Selection */}
        <div className="border-t border-outline-variant/20 pt-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-on-surface">
              Peserta Undangan
            </h2>
            {selectedIds.size > 0 && (
              <button
                type="button"
                onClick={() => setSelectedIds(new Set())}
                className="text-xs font-mono text-accent-magenta hover:underline cursor-pointer"
              >
                Hapus semua ({selectedIds.size})
              </button>
            )}
          </div>

          {/* Selected badges */}
          {selectedIds.size > 0 && (
            <div className="flex flex-wrap gap-2 mb-4 p-3 bg-surface-container rounded-xl">
              <span className="text-xs font-mono text-on-surface-variant self-center mr-1">
                Terpilih:
              </span>
              {Array.from(selectedIds).map((id) => {
                const member = divisions
                  .flatMap((d) => d.members)
                  .find((m) => m.assignmentId === id);
                if (!member) return null;
                return (
                  <Badge
                    key={id}
                    variant="secondary"
                    className="text-xs font-mono gap-1 pr-1"
                  >
                    {member.name}
                    <button
                      type="button"
                      onClick={() => toggleMember(id)}
                      className="ml-0.5 hover:text-error cursor-pointer"
                    >
                      ×
                    </button>
                  </Badge>
                );
              })}
            </div>
          )}

          {/* Search */}
          <Input
            placeholder="Cari anggota berdasarkan nama..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="mb-4"
          />

          {/* Division groups */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredDivisions.map((div) => {
              const selectableMembers = div.members.filter((m) => canSelect(m));
              const fullySelected = isDivisionFullySelected(div.divisionId);
              const showSelectAll = isBPH || div.divisionId === creatorDivisionId;

              return (
                <div
                  key={div.divisionId}
                  className="border border-outline-variant/30 rounded-xl overflow-hidden"
                >
                  <div className="bg-surface-container/50 px-4 py-2.5 flex items-center justify-between border-b border-outline-variant/20">
                    <span className="text-sm font-bold text-on-surface">
                      {div.divisionName}
                    </span>
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-mono text-on-surface-variant">
                        {selectableMembers.length} anggota
                      </span>
                      {showSelectAll && selectableMembers.length > 0 && (
                        <label className="flex items-center gap-1.5 text-xs font-mono cursor-pointer">
                          <input
                            type="checkbox"
                            checked={fullySelected}
                            onChange={() => toggleDivision(div.divisionId)}
                            className="accent-accent-magenta size-3.5"
                          />
                          Pilih Semua
                        </label>
                      )}
                    </div>
                  </div>

                  <div className="divide-y divide-outline-variant/10">
                    {div.members.map((member) => {
                      const isSelected = selectedIds.has(member.assignmentId);
                      const selectable = canSelect(member);

                      return (
                        <label
                          key={member.assignmentId}
                          className={`flex items-center gap-3 px-4 py-2.5 transition-colors ${
                            !selectable ? "opacity-40 cursor-not-allowed" : "cursor-pointer hover:bg-surface-container/50"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            disabled={!selectable}
                            onChange={() => selectable && toggleMember(member.assignmentId)}
                            className="accent-accent-magenta size-4 shrink-0"
                          />
                          <div className="min-w-0 flex-1">
                            <span className="text-sm text-on-surface font-medium">
                              {member.name}
                            </span>
                          </div>
                          <span className="text-xs font-mono text-on-surface-variant shrink-0">
                            {member.roleName}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {filteredDivisions.length === 0 && (
            <div className="text-center py-8 text-sm font-mono text-on-surface-variant">
              Tidak ada anggota ditemukan.
            </div>
          )}
        </div>

        <div className="flex gap-2 justify-end mt-2">
          <Button type="button" variant="ghost" onClick={() => router.back()} className="cursor-pointer">
            Batal
          </Button>
          <Button type="submit" disabled={pending || selectedIds.size === 0} className="cursor-pointer">
            {pending
              ? "Membuat..."
              : `Buat Rapat & Undang ${selectedIds.size} Orang`}
          </Button>
        </div>
      </form>
    </div>
  );
}
