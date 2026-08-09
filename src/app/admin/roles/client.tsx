"use client";

import { useState } from "react";
import { Plus, Pencil, Shield, Search, Filter, CheckCircle, Video, FileText } from "lucide-react";
import { RoleFormModal } from "@/components/admin/forms";
import type { RoleData } from "@/lib/data/admin-data";

export function RolesClient({ roles }: { roles: RoleData[] }) {
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<RoleData | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTier, setSelectedTier] = useState<string>("ALL");

  // Filtering roles logic
  const filteredRoles = roles.filter((role) => {
    const matchSearch =
      role.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      role.slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
      role.level.toString().includes(searchQuery);

    if (!matchSearch) return false;

    if (selectedTier === "BPH" && role.level < 75) return false;
    if (selectedTier === "KOORD" && (role.level < 50 || role.level >= 75)) return false;
    if (selectedTier === "STAFF" && role.level >= 50) return false;

    return true;
  });

  const getLevelBadgeStyle = (level: number) => {
    if (level >= 90) return "bg-[#04000D] text-[#DCEEB1] border-[#04000D]";
    if (level >= 75) return "bg-purple-50 text-purple-700 border-purple-200/60";
    if (level >= 55) return "bg-indigo-50 text-indigo-700 border-indigo-200/60";
    if (level >= 50) return "bg-blue-50 text-blue-700 border-blue-200/60";
    return "bg-[#FDF8FA] text-on-surface-variant border-[#04000D]/10";
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-[#04000D]/5 shadow-[0_8px_30px_rgb(0,0,0,0.015)] rounded-2xl p-6 md:p-8">
        <div>
          <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-accent-magenta block mb-1">
            WEWENANG & AKSES
          </span>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-on-surface">
            Role & Jabatan
          </h1>
          <p className="mt-1 text-sm text-on-surface-variant/80 font-normal">
            Atur hierarki level jabatan dan hak akses khusus (Approver, Meeting, & Laporan Creator).
          </p>
        </div>

        <button
          onClick={() => {
            setEditing(null);
            setShowForm(true);
          }}
          className="cursor-pointer bg-[#04000D] hover:bg-[#1D1B1D] text-white font-mono text-xs font-bold uppercase tracking-wider px-5 py-3 rounded-xl shadow-sm border border-[#04000D] flex items-center gap-2 transition-all hover:scale-[1.01] active:scale-[0.99] shrink-0"
        >
          <Plus className="size-4 text-[#DCEEB1]" />
          Tambah Role
        </button>
      </div>

      {/* Control Bar: Search & Filter Tiers */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-[#04000D]/5 shadow-[0_8px_30px_rgb(0,0,0,0.015)] rounded-2xl p-6">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-on-surface-variant/50" />
          <input
            type="text"
            placeholder="Cari nama role, slug, atau level..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#04000D]/10 bg-[#FDF8FA] text-sm text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none focus:border-[#04000D]/30 focus:bg-white transition-all font-medium"
          />
        </div>

        {/* Filter Tier Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto">
          {[
            { id: "ALL", label: "Semua Level" },
            { id: "BPH", label: "BPH (75+)" },
            { id: "KOORD", label: "Koordinator (50-74)" },
            { id: "STAFF", label: "Anggota (<50)" },
          ].map((tier) => (
            <button
              key={tier.id}
              onClick={() => setSelectedTier(tier.id)}
              className={`px-3.5 py-1.5 rounded-xl text-[11px] font-bold font-mono tracking-wider uppercase border transition-all duration-200 cursor-pointer whitespace-nowrap ${
                selectedTier === tier.id
                  ? "bg-[#04000D] text-[#DCEEB1] border-[#04000D] shadow-sm"
                  : "bg-[#FDF8FA] text-on-surface-variant border-[#04000D]/5 hover:bg-slate-100 hover:text-on-surface"
              }`}
            >
              {tier.label}
            </button>
          ))}
        </div>
      </div>

      {/* Role Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredRoles.length === 0 ? (
          <div className="bg-white border border-[#04000D]/5 shadow-[0_8px_30px_rgb(0,0,0,0.015)] rounded-2xl p-12 text-center col-span-full">
            <Shield className="size-12 text-on-surface-variant/30 mx-auto mb-4" />
            <h3 className="text-base font-bold text-on-surface">Role Tidak Ditemukan</h3>
            <p className="text-sm text-on-surface-variant/80 mt-1 max-w-sm mx-auto">
              Coba sesuaikan kata kunci pencarian atau filter tier Anda.
            </p>
          </div>
        ) : (
          filteredRoles.map((role) => (
            <div
              key={role.id}
              className="group bg-white border border-[#04000D]/5 shadow-[0_8px_30px_rgb(0,0,0,0.015)] rounded-2xl p-5 flex flex-col justify-between gap-4 transition-all duration-200 hover:shadow-[0_12px_40px_rgba(0,0,0,0.03)] hover:border-[#04000D]/15 hover:-translate-y-0.5"
            >
              <div>
                {/* Header Card: Name & Level */}
                <div className="flex items-start justify-between gap-3 pb-3 border-b border-[#04000D]/5 mb-3">
                  <div className="min-w-0">
                    <h3 className="text-sm font-bold text-on-surface group-hover:text-accent-magenta transition-colors truncate">
                      {role.name}
                    </h3>
                    <p className="text-xs font-mono text-on-surface-variant/70 mt-0.5">{role.slug}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg border font-mono uppercase tracking-wider ${getLevelBadgeStyle(role.level)}`}>
                      Lvl {role.level}
                    </span>
                    <button
                      onClick={() => {
                        setEditing(role);
                        setShowForm(true);
                      }}
                      className="p-2 rounded-xl text-on-surface-variant/40 hover:text-accent-magenta hover:bg-accent-magenta/10 transition-colors duration-200 cursor-pointer shrink-0"
                      title="Edit Role"
                    >
                      <Pencil className="size-3.5" />
                    </button>
                  </div>
                </div>

                {/* Permissions Badges */}
                <div className="flex items-center gap-2 flex-wrap">
                  {role.is_approver && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200/60 font-mono uppercase tracking-wider">
                      <CheckCircle className="size-3" /> Approver
                    </span>
                  )}
                  {role.is_meeting_creator && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 border border-blue-200/60 font-mono uppercase tracking-wider">
                      <Video className="size-3" /> Meeting Creator
                    </span>
                  )}
                  {role.is_report_creator && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-lg bg-amber-50 text-amber-700 border border-amber-200/60 font-mono uppercase tracking-wider">
                      <FileText className="size-3" /> Laporan Creator
                    </span>
                  )}
                  {!role.is_approver && !role.is_meeting_creator && !role.is_report_creator && (
                    <span className="text-xs text-on-surface-variant/60 font-medium italic">
                      Anggota reguler (tanpa izin khusus)
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Role Form Modal */}
      <RoleFormModal
        open={showForm}
        onClose={() => {
          setShowForm(false);
          setEditing(null);
        }}
        initial={
          editing
            ? {
                id: editing.id,
                name: editing.name,
                slug: editing.slug,
                level: editing.level,
                is_approver: editing.is_approver,
                is_meeting_creator: editing.is_meeting_creator,
                is_report_creator: editing.is_report_creator,
              }
            : null
        }
      />
    </div>
  );
}
