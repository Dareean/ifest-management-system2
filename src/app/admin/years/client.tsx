"use client";

import { useState } from "react";
import { ColorBlock } from "@/components/blocks/color-block";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { YearFormModal } from "@/components/admin/forms";
import type { YearData } from "@/lib/data/admin-data";

export function YearsClient({ years }: { years: YearData[] }) {
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="flex flex-col gap-md">
      <div className="flex items-center justify-between">
        <p className="eyebrow text-on-surface-variant">Entity</p>
        <Button variant="outline" size="sm" onClick={() => setShowForm(true)}>
          <Plus className="size-4" />
          Buat Tahun Baru
        </Button>
      </div>

      <ColorBlock color="pink">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
          {years.map((year) => (
            <Card key={year.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{year.label}</CardTitle>
                  {year.is_active && <Badge variant="success">Active</Badge>}
                  {!year.is_active && <Badge variant="secondary">Arsip</Badge>}
                </div>
                <CardDescription>
                  {year.started_at} &middot; {year.divisions} divisi &middot; {year.members} personel
                </CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </ColorBlock>

      <YearFormModal
        open={showForm}
        onClose={() => setShowForm(false)}
        years={years.map((y) => ({ id: y.id, label: y.label }))}
      />
    </div>
  );
}
