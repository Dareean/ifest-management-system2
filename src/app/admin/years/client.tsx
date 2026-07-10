"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, Calendar } from "lucide-react";
import { YearFormModal } from "@/components/admin/forms";
import type { YearData } from "@/lib/data/admin-data";

export function YearsClient({ years }: { years: YearData[] }) {
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-on-surface">Tahun Kepanitiaan</h2>
        </div>
        <Button variant="primary" size="sm" onClick={() => setShowForm(true)} className="cursor-pointer">
          <Plus className="size-4" />
          Buat Tahun Baru
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {years.length === 0 && (
          <div className="bg-white border border-outline-variant/60 rounded-2xl p-6 text-center col-span-full">
            <p className="text-sm font-mono text-on-surface-variant">Belum ada tahun kepanitiaan ditambahkan.</p>
          </div>
        )}
        {years.map((year) => (
          <Card key={year.id} className="bg-white border border-outline-variant/60 rounded-2xl p-6 flex flex-col justify-between hover:border-primary/20 transition-all">
            <CardHeader className="p-0">
              <div className="flex items-center justify-between mb-3">
                <CardTitle className="text-lg font-bold text-on-surface">{year.label}</CardTitle>
                <Badge variant={year.is_active ? "success" : "secondary"} className="text-xs font-mono px-2 py-0.5">
                  {year.is_active ? "Aktif" : "Arsip"}
                </Badge>
              </div>
              <CardDescription className="text-sm text-on-surface-variant font-mono">
                Mulai: {year.started_at} &middot; {year.divisions} divisi &middot; {year.members} personel
              </CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>

      <YearFormModal
        open={showForm}
        onClose={() => setShowForm(false)}
        years={years.map((y) => ({ id: y.id, label: y.label }))}
      />
    </div>
  );
}
