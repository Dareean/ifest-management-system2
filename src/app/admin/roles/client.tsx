"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Shield, Search, Filter, CheckCircle, Video } from "lucide-react";
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

    if (selectedTier === "BPH") return role.level >= 75;
    if (selectedTier === "KOORDINATOR") return role.level >= 55 && role.level <= 60;
    if (selectedTier === "PIC_SUB") return role.level === 53;
    if (selectedTier === "ANGGOTA") return role.level === 50;

    return true;
  });

  const getLevelBadgeStyle = (level: number) => {
    if (level >= 90) return "bg-primary text-white border-transparent shadow-sm";
    if (level >= 75) return "bg-accent-magenta text-white border-transparent shadow-sm";
    if (level >= 55) return "bg-block-blue/10 text-block-blue border-block-blue/30";
    if (level === 53) return "bg-block-lilac/30 text-primary border-primary/20";
    return "bg-surface-container text-on-surface-variant border-outline-variant/50";
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/40 backdrop-blur-md border border-outline-variant/20 rounded-3xl p-6">
        <div>
          <p className="text-accent-magenta font-mono text-xs font-bold tracking-widest uppercase mb-1">
            STRUKTUR WEWENANG
          </p>
          <h1 className="text-3xl font-black tracking-tight text-on-surface font-sans">Role & Jabatan</h1>
          <p className="mt-1 text-sm text-on-surface-variant font-medium">
            {roles.length} peran terdaftar secara keseluruhan
          </p>
        </div>
        <Button
          variant="primary"
          onClick={() => {
            setEditing(null);
            setShowForm(true);
          }}
          className="cursor-pointer font-sans text-sm font-bold gap-2 px-5 py-6 rounded-2xl shadow-lg shadow-primary/10 hover:shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
        >
          <Plus className="size-4.5" />
          Tambah Role
        </Button>
      </div>

      {/* Control Panel (Search & Tier Filter Tabs) */}
      <div className="flex flex-col gap-4 bg-white border border-outline-variant/40 rounded-3xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Search bar */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4.5 text-on-surface-variant/60" />
            <input
              type="text"
              placeholder="Cari role berdasarkan nama atau level..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 rounded-2xl border border-outline-variant/60 bg-surface-container-lowest text-sm font-medium text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:border-primary/80 focus:ring-1 focus:ring-primary/80 transition-all"
            />
          </div>

          {/* Info Badge */}
          <div className="flex items-center gap-2 self-start md:self-auto text-xs font-mono text-on-surface-variant bg-surface-container px-3.5 py-2 rounded-xl border border-outline-variant/30">
            <Filter className="size-3.5" />
            <span>Menampilkan {filteredRoles.length} role</span>
          </div>
        </div>

        {/* Level Tier Filter Buttons */}
        <div className="border-t border-outline-variant/40 pt-4 flex flex-wrap gap-2">
          {[
            { id: "ALL", label: "Semua Role" },
            { id: "BPH", label: "Pimpinan BPH (75+)" },
            { id: "KOORDINATOR", label: "Koordinator (55-60)" },
            { id: "PIC_SUB", label: "PIC Subdivisi / KPI (53)" },
            { id: "ANGGOTA", label: "Anggota (50)" },
          ].map((tier) => (
            <button
              key={tier.id}
              onClick={() => setSelectedTier(tier.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold font-mono tracking-wider uppercase border transition-all duration-200 cursor-pointer ${
                selectedTier === tier.id
                  ? "bg-primary text-white border-transparent shadow-sm"
                  : "bg-white text-on-surface-variant border-outline-variant/50 hover:bg-surface-container"
              }`}
            >
              {tier.label}
            </button>
          ))}
        </div>
      </div>

      {/* Roles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredRoles.length === 0 ? (
          <div className="bg-white border border-outline-variant/60 rounded-3xl p-12 text-center col-span-full shadow-sm">
            <Shield className="size-12 text-on-surface-variant/30 mx-auto mb-4" />
            <h3 className="text-base font-bold text-on-surface">Role Tidak Ditemukan</h3>
            <p className="text-sm text-on-surface-variant mt-1 max-w-sm mx-auto">
              Tidak ada role yang cocok dengan pencarian "{searchQuery}"
            </p>
            {(searchQuery || selectedTier !== "ALL") && (
              <Button
                variant="outline"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedTier("ALL");
                }}
                className="mt-4 text-xs font-bold cursor-pointer rounded-xl"
              >
                Reset Filter
              </Button>
            )}
          </div>
        ) : (
          filteredRoles.map((role) => (
            <div
              key={role.id}
              className="group bg-white border border-outline-variant/60 rounded-2xl p-5 flex flex-col justify-between gap-4 transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:border-primary/20 hover:-translate-y-0.5"
            >
              <div className="flex flex-col gap-3">
                <div className="flex items-start justify-between gap-3 pb-3 border-b border-outline-variant/20">
                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-extrabold text-on-surface group-hover:text-primary transition-colors duration-200 truncate" title={role.name}>
                      {role.name}
                    </h3>
                    <p className="text-[11px] font-mono text-on-surface-variant/70 mt-0.5 truncate">{role.slug}</p>
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
                      className="p-1.5 rounded-xl hover:bg-surface-container text-on-surface-variant hover:text-primary transition-all duration-200 cursor-pointer border border-transparent hover:border-outline-variant/40"
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
                  {!role.is_approver && !role.is_meeting_creator && (
                    <span className="text-xs text-on-surface-variant/70 font-medium italic">
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
              }
            : null
        }
      />
    </div>
  );
}
