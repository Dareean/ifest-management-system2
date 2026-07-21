"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, Calendar, CheckCircle2, Archive, Building2, Users } from "lucide-react";
import { YearFormModal } from "@/components/admin/forms";
import type { YearData } from "@/lib/data/admin-data";

export function YearsClient({ years }: { years: YearData[] }) {
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="flex flex-col gap-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/40 backdrop-blur-md border border-outline-variant/20 rounded-3xl p-6">
        <div>
          <p className="text-accent-magenta font-mono text-xs font-bold tracking-widest uppercase mb-1">
            PERIODE ORGANISASI
          </p>
          <h1 className="text-3xl font-black tracking-tight text-on-surface font-sans">Tahun Kepanitiaan</h1>
          <p className="mt-1 text-sm text-on-surface-variant font-medium">
            {years.length} periode kepanitiaan tersimpan dalam histori sistem
          </p>
        </div>
        <Button
          variant="primary"
          onClick={() => setShowForm(true)}
          className="cursor-pointer font-sans text-sm font-bold gap-2 px-5 py-6 rounded-2xl shadow-lg shadow-primary/10 hover:shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
        >
          <Plus className="size-4.5" />
          Buat Tahun Baru
        </Button>
      </div>

      {/* Years Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {years.length === 0 ? (
          <div className="bg-white border border-outline-variant/60 rounded-3xl p-12 text-center col-span-full shadow-sm">
            <Calendar className="size-12 text-on-surface-variant/30 mx-auto mb-4" />
            <h3 className="text-base font-bold text-on-surface">Belum Ada Tahun Kepanitiaan</h3>
            <p className="text-sm text-on-surface-variant mt-1 max-w-sm mx-auto">
              Silakan buat tahun kepanitiaan baru untuk memulai konfigurasi divisi dan personel.
            </p>
          </div>
        ) : (
          years.map((year) => (
            <div
              key={year.id}
              className={`group bg-white border rounded-3xl p-6 flex flex-col justify-between gap-6 transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] ${
                year.is_active
                  ? "border-primary/40 ring-1 ring-primary/20"
                  : "border-outline-variant/60 hover:border-primary/20"
              }`}
            >
              <div className="flex flex-col gap-4">
                <div className="flex items-start justify-between gap-4 pb-4 border-b border-outline-variant/20">
                  <div className="flex items-center gap-3">
                    <div className={`p-3 rounded-2xl border flex items-center justify-center ${
                      year.is_active
                        ? "bg-primary text-white border-transparent"
                        : "bg-surface-container text-on-surface-variant border-outline-variant/30"
                    }`}>
                      <Calendar className="size-5" />
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-on-surface group-hover:text-primary transition-colors">
                        {year.label}
                      </h3>
                      <p className="text-xs font-mono text-on-surface-variant/70 mt-0.5">
                        Mulai: {year.started_at}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`inline-flex items-center gap-1.5 text-xs font-mono font-bold px-3 py-1 rounded-xl border ${
                      year.is_active
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : "bg-surface-container text-on-surface-variant border-outline-variant/40"
                    }`}
                  >
                    {year.is_active ? (
                      <>
                        <CheckCircle2 className="size-3.5" /> Periode Aktif
                      </>
                    ) : (
                      <>
                        <Archive className="size-3.5" /> Arsip
                      </>
                    )}
                  </span>
                </div>
              </div>

              {/* Metrics */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-surface-container-lowest border border-outline-variant/40">
                  <Building2 className="size-4 text-primary" />
                  <div>
                    <p className="text-[10px] font-mono text-on-surface-variant uppercase font-bold">Divisi</p>
                    <p className="text-sm font-extrabold text-on-surface">{year.divisions} Divisi</p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-surface-container-lowest border border-outline-variant/40">
                  <Users className="size-4 text-accent-magenta" />
                  <div>
                    <p className="text-[10px] font-mono text-on-surface-variant uppercase font-bold">Personel</p>
                    <p className="text-sm font-extrabold text-on-surface">{year.members} Personel</p>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Year Form Modal */}
      <YearFormModal
        open={showForm}
        onClose={() => setShowForm(false)}
        years={years.map((y) => ({ id: y.id, label: y.label }))}
      />
    </div>
  );
}
