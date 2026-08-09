"use client";

import { useState } from "react";
import { Plus, Trash2, Search, Filter, UserX } from "lucide-react";
import { AssignmentFormModal } from "@/components/admin/forms";
import { deleteAssignment } from "@/lib/actions/admin";
import type { AssignmentData } from "@/lib/data/admin-data";

export function AssignmentsClient({
  assignments,
  divisions,
  roles,
}: {
  assignments: AssignmentData[];
  divisions: { id: string; name: string }[];
  roles: { id: string; name: string }[];
}) {
  const [showForm, setShowForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDivision, setSelectedDivision] = useState<string>("ALL");

  async function handleDelete(id: string, name: string) {
    if (confirm(`Batalkan penugasan dan hapus akun panitia untuk ${name}?`)) {
      const res = await deleteAssignment(id);
      if (res?.error) {
        alert(`Gagal menghapus penugasan: ${res.error}`);
      }
    }
  }

  // Filter assignments by search query and selected division
  const filteredAssignments = assignments.filter((a) => {
    const matchSearch =
      a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.nim.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.division.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.role.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchSearch) return false;

    if (selectedDivision !== "ALL" && a.division !== selectedDivision) {
      return false;
    }

    return true;
  });

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-[#04000D]/5 shadow-[0_8px_30px_rgb(0,0,0,0.015)] rounded-2xl p-6 md:p-8">
        <div>
          <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-accent-magenta block mb-1">
            PENUGASAN STRUKTURAL
          </span>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-on-surface">
            Assign Personel
          </h1>
          <p className="mt-1 text-sm text-on-surface-variant/80 font-normal">
            {assignments.length} personel panitia terdaftar dan aktif
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="cursor-pointer bg-[#04000D] hover:bg-[#1D1B1D] text-white font-mono text-xs font-bold uppercase tracking-wider px-5 py-3 rounded-xl shadow-sm border border-[#04000D] flex items-center gap-2 transition-all hover:scale-[1.01] active:scale-[0.99] shrink-0"
        >
          <Plus className="size-4 text-[#DCEEB1]" />
          Assign Personel
        </button>
      </div>

      {/* Control Panel (Search & Division Filter Tabs) */}
      <div className="flex flex-col gap-5 bg-white border border-[#04000D]/5 shadow-[0_8px_30px_rgb(0,0,0,0.015)] rounded-2xl p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Search bar */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-on-surface-variant/50" />
            <input
              type="text"
              placeholder="Cari berdasarkan nama, NIM, divisi, atau role..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#04000D]/10 bg-[#FDF8FA] text-sm text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none focus:border-[#04000D]/30 focus:bg-white transition-all font-medium"
            />
          </div>

          {/* Info Badge */}
          <div className="flex items-center gap-2 self-start md:self-auto text-xs font-mono text-on-surface-variant bg-[#FDF8FA] px-3.5 py-2 rounded-xl border border-[#04000D]/5 select-none">
            <Filter className="size-3.5 text-accent-magenta" />
            <span>
              Menampilkan <strong className="text-on-surface font-bold">{filteredAssignments.length}</strong> personel
            </span>
          </div>
        </div>

        {/* Division Filter Buttons */}
        <div className="border-t border-[#04000D]/5 pt-4 flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedDivision("ALL")}
            className={`px-3.5 py-1.5 rounded-xl text-[11px] font-bold font-mono tracking-wider uppercase border transition-all duration-200 cursor-pointer ${
              selectedDivision === "ALL"
                ? "bg-[#04000D] text-[#DCEEB1] border-[#04000D] shadow-sm"
                : "bg-[#FDF8FA] text-on-surface-variant border-[#04000D]/5 hover:bg-slate-100 hover:text-on-surface"
            }`}
          >
            Semua Divisi
          </button>
          {divisions.map((div) => (
            <button
              key={div.id}
              onClick={() => setSelectedDivision(div.name)}
              className={`px-3.5 py-1.5 rounded-xl text-[11px] font-bold font-mono tracking-wider uppercase border transition-all duration-200 cursor-pointer ${
                selectedDivision === div.name
                  ? "bg-[#04000D] text-[#DCEEB1] border-[#04000D] shadow-sm"
                  : "bg-[#FDF8FA] text-on-surface-variant border-[#04000D]/5 hover:bg-slate-100 hover:text-on-surface"
              }`}
            >
              {div.name}
            </button>
          ))}
        </div>
      </div>

      {/* Personnel Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredAssignments.length === 0 ? (
          <div className="bg-white border border-[#04000D]/5 shadow-[0_8px_30px_rgb(0,0,0,0.015)] rounded-2xl p-12 text-center col-span-full">
            <UserX className="size-12 text-on-surface-variant/30 mx-auto mb-4" />
            <h3 className="text-base font-bold text-on-surface">Personel Tidak Ditemukan</h3>
            <p className="text-sm text-on-surface-variant/80 mt-1 max-w-sm mx-auto">
              Tidak ada personel yang cocok dengan kriteria pencarian Anda.
            </p>
            {(searchQuery || selectedDivision !== "ALL") && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedDivision("ALL");
                }}
                className="mt-4 px-4 py-2 rounded-xl text-xs font-mono font-bold uppercase tracking-wider bg-[#FDF8FA] border border-[#04000D]/10 text-on-surface hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Reset Filter
              </button>
            )}
          </div>
        ) : (
          filteredAssignments.map((a) => (
            <div
              key={a.id}
              className="group bg-white border border-[#04000D]/5 shadow-[0_8px_30px_rgb(0,0,0,0.015)] rounded-2xl p-5 flex flex-col justify-between gap-4 transition-all duration-200 hover:shadow-[0_12px_40px_rgba(0,0,0,0.03)] hover:border-[#04000D]/15 hover:-translate-y-0.5"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3.5 min-w-0">
                  {a.avatarUrl ? (
                    <img
                      src={a.avatarUrl}
                      alt={a.name}
                      className="size-11 rounded-xl object-cover shrink-0 border border-[#04000D]/10"
                    />
                  ) : (
                    <div className="size-11 rounded-xl bg-[#04000D] text-[#DCEEB1] font-mono font-bold text-xs flex items-center justify-center shrink-0 border border-[#04000D]/10 group-hover:bg-accent-magenta group-hover:text-white transition-colors duration-200">
                      {getInitials(a.name)}
                    </div>
                  )}
                  <div className="min-w-0">
                    <h3 className="text-sm font-bold text-on-surface group-hover:text-accent-magenta transition-colors duration-200 truncate" title={a.name}>
                      {a.name}
                    </h3>
                    <p className="text-xs font-mono text-on-surface-variant/70 mt-0.5">{a.nim}</p>
                  </div>
                </div>

                <button
                  onClick={() => handleDelete(a.id, a.name)}
                  className="p-2 rounded-xl text-on-surface-variant/30 hover:text-accent-magenta hover:bg-accent-magenta/10 transition-colors duration-200 cursor-pointer shrink-0 border border-transparent"
                  title="Batalkan Penugasan"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>

              <div className="flex items-center justify-between gap-2 pt-3 border-t border-[#04000D]/5 flex-wrap">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg bg-[#FDF8FA] text-on-surface-variant border border-[#04000D]/5">
                  {a.division}
                </span>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg bg-[#DCEEB1]/40 text-[#1D1B1D] border border-[#DCEEB1]/60">
                  {a.role}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Assignment Form Modal */}
      <AssignmentFormModal
        open={showForm}
        onClose={() => setShowForm(false)}
        divisions={divisions}
        roles={roles}
      />
    </div>
  );
}
