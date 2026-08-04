"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Users, Search, Filter, UserX, FileText, Video } from "lucide-react";
import { AssignmentFormModal } from "@/components/admin/forms";
import { deleteAssignment, togglePersonnelReportCreator, togglePersonnelMeetingCreator } from "@/lib/actions/admin";
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
    if (confirm(`Batalkan penugasan untuk ${name}?`)) {
      await deleteAssignment(id);
    }
  }

  async function handleToggleReportCreator(id: string, current: boolean, name: string) {
    const actionText = current ? "mencabut" : "memberikan";
    if (confirm(`Apakah Anda yakin ingin ${actionText} hak Laporan Creator untuk ${name}?`)) {
      await togglePersonnelReportCreator(id, !current);
    }
  }

  async function handleToggleMeetingCreator(id: string, current: boolean, name: string) {
    const actionText = current ? "mencabut" : "memberikan";
    if (confirm(`Apakah Anda yakin ingin ${actionText} hak Meeting Creator untuk ${name}?`)) {
      await togglePersonnelMeetingCreator(id, !current);
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/40 backdrop-blur-md border border-outline-variant/20 rounded-3xl p-6">
        <div>
          <p className="text-primary font-mono text-xs font-bold tracking-widest uppercase mb-1">
            PENUGASAN STRUKTURAL
          </p>
          <h1 className="text-3xl font-black tracking-tight text-on-surface font-sans">Assign Personel</h1>
          <p className="mt-1 text-sm text-on-surface-variant font-medium">
            {assignments.length} personel panitia terdaftar dan aktif
          </p>
        </div>
        <Button
          variant="primary"
          onClick={() => setShowForm(true)}
          className="cursor-pointer font-sans text-sm font-bold gap-2 px-5 py-6 rounded-2xl shadow-lg shadow-primary/10 hover:shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
        >
          <Plus className="size-4.5" />
          Assign Personel
        </Button>
      </div>

      {/* Control Panel (Search & Division Filter Tabs) */}
      <div className="flex flex-col gap-4 bg-white border border-outline-variant/40 rounded-3xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Search bar */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4.5 text-on-surface-variant/60" />
            <input
              type="text"
              placeholder="Cari berdasarkan nama, NIM, divisi, atau role..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 rounded-2xl border border-outline-variant/60 bg-surface-container-lowest text-sm font-medium text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:border-primary/80 focus:ring-1 focus:ring-primary/80 transition-all"
            />
          </div>

          {/* Info Badge */}
          <div className="flex items-center gap-2 self-start md:self-auto text-xs font-mono text-on-surface-variant bg-surface-container px-3.5 py-2 rounded-xl border border-outline-variant/30">
            <Filter className="size-3.5" />
            <span>Menampilkan {filteredAssignments.length} personel</span>
          </div>
        </div>

        {/* Division Filter Buttons */}
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
              key={div.id}
              onClick={() => setSelectedDivision(div.name)}
              className={`px-4 py-2 rounded-xl text-xs font-bold font-mono tracking-wider uppercase border transition-all duration-200 cursor-pointer ${
                selectedDivision === div.name
                  ? "bg-primary text-white border-transparent shadow-sm"
                  : "bg-white text-on-surface-variant border-outline-variant/50 hover:bg-surface-container"
              }`}
            >
              {div.name}
            </button>
          ))}
        </div>
      </div>

      {/* Personnel Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredAssignments.length === 0 ? (
          <div className="bg-white border border-outline-variant/60 rounded-3xl p-12 text-center col-span-full shadow-sm">
            <UserX className="size-12 text-on-surface-variant/30 mx-auto mb-4" />
            <h3 className="text-base font-bold text-on-surface">Personel Tidak Ditemukan</h3>
            <p className="text-sm text-on-surface-variant mt-1 max-w-sm mx-auto">
              Tidak ada personel yang cocok dengan kriteria pencarian Anda.
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
        ) : (
          filteredAssignments.map((a) => (
            <div
              key={a.id}
              className="group bg-white border border-outline-variant/60 rounded-2xl p-5 flex flex-col justify-between gap-4 transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:border-primary/20 hover:-translate-y-0.5"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  {a.avatarUrl ? (
                    <img
                      src={a.avatarUrl}
                      alt={a.name}
                      className="size-11 rounded-2xl object-cover shrink-0 border border-outline-variant/40"
                    />
                  ) : (
                    <div className="size-11 rounded-2xl bg-surface-container text-primary font-mono font-bold text-sm flex items-center justify-center shrink-0 border border-outline-variant/40 group-hover:bg-primary group-hover:text-white transition-colors duration-200">
                      {getInitials(a.name)}
                    </div>
                  )}
                  <div className="min-w-0">
                    <h3 className="text-sm font-extrabold text-on-surface group-hover:text-primary transition-colors duration-200 truncate" title={a.name}>
                      {a.name}
                    </h3>
                    <p className="text-xs font-mono text-on-surface-variant/70 mt-0.5">{a.nim}</p>
                  </div>
                </div>

                <button
                  onClick={() => handleDelete(a.id, a.name)}
                  className="p-2 rounded-xl text-on-surface-variant/50 hover:text-red-600 hover:bg-red-50 transition-all duration-200 cursor-pointer shrink-0 border border-transparent hover:border-red-200"
                  title="Batalkan Penugasan"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>

              <div className="flex items-center gap-2 pt-3 border-t border-outline-variant/20 flex-wrap">
                <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-lg bg-surface-container text-on-surface border border-outline-variant/40">
                  {a.division}
                </span>
                <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-lg bg-primary/10 text-primary border border-primary/20">
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
