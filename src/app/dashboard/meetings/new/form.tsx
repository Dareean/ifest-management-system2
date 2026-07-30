"use client";

import { useActionState, useEffect, useState, useMemo, startTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { createMeeting } from "@/lib/actions/meetings";
import { useRouter } from "next/navigation";
import type { DivisionGroup } from "@/lib/data/members";
import { Calendar, MapPin, Link as LinkIcon, Users, Search, Check, X, AlertCircle, Loader2 } from "lucide-react";

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
  const [format, setFormat] = useState<"offline" | "online" | "hybrid">("offline");

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
    <div className="bg-white border border-slate-100 rounded-3xl p-6 sm:p-10 shadow-xs relative overflow-hidden">
      {pending && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-white/85 backdrop-blur-sm gap-3">
          <Loader2 className="size-8 text-pink-500 animate-spin" />
          <p className="text-sm font-mono text-slate-900 font-extrabold animate-pulse uppercase tracking-wider">
            Membuat rapat & mengunggah undangan...
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
        className={`flex flex-col gap-7 ${pending ? "pointer-events-none select-none" : ""}`}
      >
        {state?.error && (
          <div className="flex items-center gap-3 text-sm text-pink-700 bg-pink-50 border border-pink-200 rounded-2xl p-4 font-mono font-bold">
            <AlertCircle className="size-5 text-pink-500 shrink-0" />
            <span>{state.error}</span>
          </div>
        )}

        {/* Title & Meeting Type */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <label className="block mb-2 text-xs font-mono font-extrabold uppercase text-slate-800 tracking-wider">
              Judul Rapat <span className="text-pink-500">*</span>
            </label>
            <Input
              name="title"
              placeholder="Contoh: Rapat Koordinasi Divisi Acara"
              required
              className="h-11 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-sans font-medium text-slate-900 focus:border-slate-900 transition-all placeholder:text-slate-400"
            />
          </div>

          <div>
            <label className="block mb-2 text-xs font-mono font-extrabold uppercase text-slate-800 tracking-wider">
              Tipe Rapat
            </label>
            <select
              name="meetingType"
              className="flex h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-sans font-bold text-slate-900 focus:border-slate-900 focus:outline-none cursor-pointer appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2020%2020%22%20fill%3D%22none%22%3E%3Cpath%20d%3D%22M7%209l3%203%203-3%22%20stroke%3D%22%231e293b%22%20stroke-width%3D%221.5%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%3C%2Fsvg%3E')] bg-[length:1.25rem] bg-[right_1rem_center] bg-no-repeat pr-10 shadow-xs"
            >
              <option value="scheduled">Terjadwal</option>
              <option value="adhoc">Kondisional / Insidental</option>
            </select>
          </div>
        </div>

        {/* Date/Time & Format */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block mb-2 text-xs font-mono font-extrabold uppercase text-slate-800 tracking-wider">
              Tanggal & Waktu Mulai <span className="text-pink-500">*</span>
            </label>
            <input
              type="datetime-local"
              name="startedAt"
              required
              className="flex h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-sans font-medium text-slate-900 focus:border-slate-900 focus:outline-none cursor-pointer transition-all"
            />
          </div>

          <div>
            <label className="block mb-2 text-xs font-mono font-extrabold uppercase text-slate-800 tracking-wider">
              Format Pertemuan
            </label>
            <select
              value={format}
              onChange={(e) => setFormat(e.target.value as any)}
              className="flex h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-sans font-bold text-slate-900 focus:border-slate-900 focus:outline-none cursor-pointer appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2020%2020%22%20fill%3D%22none%22%3E%3Cpath%20d%3D%22M7%209l3%203%203-3%22%20stroke%3D%22%231e293b%22%20stroke-width%3D%221.5%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%3C%2Fsvg%3E')] bg-[length:1.25rem] bg-[right_1rem_center] bg-no-repeat pr-10 shadow-xs"
            >
              <option value="offline">Offline (Tatap Muka)</option>
              <option value="online">Online (Daring)</option>
              <option value="hybrid">Hybrid (Kombinasi)</option>
            </select>
          </div>
        </div>

        {/* Dynamic Location/Link inputs */}
        {format !== "offline" && (
          <div>
            <label className="block mb-2 text-xs font-mono font-extrabold uppercase text-slate-800 tracking-wider">
              Tautan Pertemuan (Online Zoom / GMeet)
            </label>
            <Input
              name="meetingLink"
              placeholder="https://meet.google.com/... (opsional)"
              className="h-11 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-sans font-medium text-slate-900 focus:border-slate-900 transition-all placeholder:text-slate-400"
            />
          </div>
        )}

        {format !== "online" && (
          <div>
            <label className="block mb-2 text-xs font-mono font-extrabold uppercase text-slate-800 tracking-wider">
              Lokasi / Ruangan (Offline)
            </label>
            <Input
              name="location"
              placeholder="Contoh: Sekretariat HMTI / Ruang Rapat Dekanat FT"
              className="h-11 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-sans font-medium text-slate-900 focus:border-slate-900 transition-all placeholder:text-slate-400"
            />
          </div>
        )}

        {/* Agenda */}
        <div>
          <label className="block mb-2 text-xs font-mono font-extrabold uppercase text-slate-800 tracking-wider">
            Agenda & Poin Bahasan Rapat
          </label>
          <textarea
            name="agenda"
            className="flex min-h-[140px] w-full rounded-2xl border border-slate-200 bg-white p-4 text-sm font-sans font-medium text-slate-900 placeholder:text-slate-400 focus:border-slate-900 focus:outline-none resize-y transition-all"
            placeholder="Tulis poin-poin bahasan rapat secara mendetail di sini..."
          />
        </div>

        {/* Invitee Selection */}
        <div className="border-t border-slate-100 pt-7">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Users className="size-5 text-pink-500" />
              <h2 className="text-base font-extrabold text-slate-900 font-sans">
                Peserta Undangan Rapat
              </h2>
            </div>

            {selectedIds.size > 0 && (
              <button
                type="button"
                onClick={() => setSelectedIds(new Set())}
                className="text-xs font-mono font-bold text-pink-500 hover:underline cursor-pointer"
              >
                Hapus Semua ({selectedIds.size})
              </button>
            )}
          </div>

          {/* Selected Member Badges Pill Container */}
          {selectedIds.size > 0 && (
            <div className="flex flex-wrap gap-2 mb-5 p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <span className="text-xs font-mono font-extrabold text-slate-400 self-center mr-1 uppercase tracking-wider">
                TERPILIH ({selectedIds.size}):
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
                    className="text-xs font-mono font-bold bg-white text-slate-900 border border-slate-200 rounded-full px-3 py-1 gap-1.5 shadow-xs"
                  >
                    {member.name}
                    <button
                      type="button"
                      onClick={() => toggleMember(id)}
                      className="ml-0.5 text-slate-400 hover:text-pink-500 cursor-pointer"
                    >
                      <X className="size-3.5" />
                    </button>
                  </Badge>
                );
              })}
            </div>
          )}

          {/* Search Bar */}
          <div className="relative mb-5">
            <Search className="size-4 text-slate-400 absolute left-4 top-3.5 pointer-events-none" />
            <Input
              placeholder="Cari anggota panitia berdasarkan nama..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-11 pl-11 rounded-2xl border border-slate-200 bg-white text-sm font-sans font-medium text-slate-900 focus:border-slate-900 transition-all placeholder:text-slate-400"
            />
          </div>

          {/* Division Groups Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {filteredDivisions.map((div) => {
              const selectableMembers = div.members.filter((m) => canSelect(m));
              const fullySelected = isDivisionFullySelected(div.divisionId);
              const showSelectAll = isBPH || div.divisionId === creatorDivisionId;

              return (
                <div
                  key={div.divisionId}
                  className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-xs"
                >
                  <div className="bg-slate-50/80 px-4 py-3 flex items-center justify-between border-b border-slate-100">
                    <span className="text-xs font-extrabold text-slate-900 font-sans tracking-wide">
                      {div.divisionName}
                    </span>
                    <div className="flex items-center gap-3">
                      <span className="text-[11px] font-mono font-bold text-slate-400">
                        {selectableMembers.length} Anggota
                      </span>
                      {showSelectAll && selectableMembers.length > 0 && (
                        <label className="flex items-center gap-1.5 text-xs font-mono font-bold text-slate-700 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={fullySelected}
                            onChange={() => toggleDivision(div.divisionId)}
                            className="accent-slate-900 size-3.5 rounded"
                          />
                          Pilih Semua
                        </label>
                      )}
                    </div>
                  </div>

                  <div className="divide-y divide-slate-100">
                    {div.members.map((member) => {
                      const isSelected = selectedIds.has(member.assignmentId);
                      const selectable = canSelect(member);

                      return (
                        <label
                          key={member.assignmentId}
                          className={`flex items-center gap-3 px-4 py-3 transition-colors ${
                            !selectable ? "opacity-40 cursor-not-allowed" : "cursor-pointer hover:bg-slate-50/60"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            disabled={!selectable}
                            onChange={() => selectable && toggleMember(member.assignmentId)}
                            className="accent-slate-900 size-4 shrink-0 rounded"
                          />
                          <div className="min-w-0 flex-1">
                            <span className="text-xs text-slate-900 font-bold font-sans block truncate">
                              {member.name}
                            </span>
                          </div>
                          <span className="text-[10px] font-mono font-bold text-slate-400 shrink-0 bg-slate-100 px-2 py-0.5 rounded-full">
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
            <div className="text-center py-10 text-xs font-mono font-bold text-slate-400">
              Tidak ada anggota ditemukan.
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <Button
            type="button"
            variant="ghost"
            onClick={() => router.back()}
            className="h-11 px-5 rounded-2xl font-mono text-xs font-bold text-slate-500 hover:text-slate-900 cursor-pointer"
          >
            Batal
          </Button>

          <Button
            type="submit"
            disabled={pending || selectedIds.size === 0}
            className="h-11 px-7 rounded-2xl bg-slate-900 text-white hover:bg-black font-mono text-xs font-bold uppercase tracking-wider cursor-pointer gap-2 shadow-xs disabled:opacity-50"
          >
            {pending ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Membuat...
              </>
            ) : (
              <>
                <Calendar className="size-4 text-pink-400" />
                Buat Rapat & Undang {selectedIds.size} Orang
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
