"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
    if (level >= 90) return "bg-amber-50 text-amber-700 border-amber-200/60";
    if (level >= 75) return "bg-purple-50 text-purple-700 border-purple-200/60";
    if (level >= 55) return "bg-indigo-50 text-indigo-700 border-indigo-200/60";
    if (level >= 50) return "bg-blue-50 text-blue-700 border-blue-200/60";
    return "bg-slate-100 text-slate-600 border-slate-200/60";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-on-surface flex items-center gap-2">
            <Shield className="size-6 text-primary" /> Management Role & Permissions
          </h1>
          <p className="text-xs text-on-surface-variant mt-1">
            Atur hierarki level jabatan dan hak akses khusus (Approver, Meeting Creator, Laporan Creator).
          </p>
        </div>

        <Button
          onClick={() => {
            setEditing(null);
            setShowForm(true);
          }}
          className="gap-2 shrink-0 self-start sm:self-auto cursor-pointer"
        >
          <Plus className="size-4" /> Tambah Role Baru
        </Button>
      </div>

      {/* Control Bar: Search & Filter Tiers */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-2 bg-surface-container-lowest border border-outline-variant/30 rounded-2xl shadow-sm">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-on-surface-variant/50" />
          <input
            type="text"
            placeholder="Cari nama role, slug, atau level..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs bg-transparent border-none outline-none text-on-surface placeholder:text-on-surface-variant/40"
          />
        </div>

        {/* Filter Tier Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto p-1 bg-surface-container-low rounded-xl border border-outline-variant/20">
          <Filter className="size-3.5 text-on-surface-variant/60 ml-2 mr-1 shrink-0" />
          {[
            { id: "ALL", label: "Semua" },
            { id: "BPH", label: "BPH (75+)" },
            { id: "KOORD", label: "Koord (50-74)" },
            { id: "STAFF", label: "Staf (<50)" },
          ].map((tier) => (
            <button
              key={tier.id}
              onClick={() => setSelectedTier(tier.id)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all duration-200 cursor-pointer whitespace-nowrap ${
                selectedTier === tier.id
                  ? "bg-surface text-primary shadow-xs font-bold"
                  : "text-on-surface-variant/70 hover:text-on-surface hover:bg-surface-container/50"
              }`}
            >
              {tier.label}
            </button>
          ))}
        </div>
      </div>

      {/* Role Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredRoles.length === 0 ? (
          <div className="col-span-full p-12 text-center bg-surface-container-lowest border border-dashed border-outline-variant/40 rounded-3xl">
            <Shield className="size-10 text-on-surface-variant/30 mx-auto mb-3" />
            <p className="text-sm font-semibold text-on-surface-variant">Tidak ada role yang ditemukan</p>
            <p className="text-xs text-on-surface-variant/60 mt-1">Coba sesuaikan kata kunci pencarian atau filter tier Anda.</p>
          </div>
        ) : (
          filteredRoles.map((role) => (
            <div
              key={role.id}
              className="group relative bg-surface-container-lowest border border-outline-variant/30 hover:border-primary/40 rounded-2xl p-5 transition-all duration-200 shadow-xs hover:shadow-md flex flex-col justify-between"
            >
              <div>
                {/* Header Card: Name & Level */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <h3 className="font-bold text-on-surface text-base group-hover:text-primary transition-colors">
                      {role.name}
                    </h3>
                    <code className="text-[11px] text-on-surface-variant/70 font-mono bg-surface-container-low px-2 py-0.5 rounded-md mt-1 inline-block">
                      {role.slug}
                    </code>
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
                  {role.is_report_creator && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-lg bg-amber-50 text-amber-700 border border-amber-200/60 font-mono uppercase tracking-wider">
                      <FileText className="size-3" /> Laporan Creator
                    </span>
                  )}
                  {!role.is_approver && !role.is_meeting_creator && !role.is_report_creator && (
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
                is_report_creator: editing.is_report_creator,
              }
            : null
        }
      />
    </div>
  );
}
