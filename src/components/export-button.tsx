"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FileDown } from "lucide-react";

export function ExportButton({
  label,
  filename,
  fetchCsv,
}: {
  label: string;
  filename: string;
  fetchCsv: () => Promise<string>;
}) {
  const [loading, setLoading] = useState(false);

  async function handleExport() {
    setLoading(true);
    try {
      const csv = await fetchCsv();
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${filename}-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error("Export failed:", e);
    }
    setLoading(false);
  }

  return (
    <Button variant="ghost" size="sm" onClick={handleExport} disabled={loading}>
      <FileDown className="size-4" />
      {loading ? "..." : label}
    </Button>
  );
}
