import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function AdminOverviewPage() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-2">
      <Card className="bg-white border border-outline-variant/60 rounded-2xl p-6 hover:border-primary/20 transition-all">
        <CardHeader className="p-0">
          <CardTitle className="text-base font-bold text-on-surface mb-2">Dynamic Structure</CardTitle>
          <CardDescription className="text-sm text-on-surface-variant font-sans leading-relaxed">
            Divisi dan role disimpan di database — bukan hardcode. Tahun depan, cukup buat
            tahun kepanitiaan baru dan assign personel baru.
          </CardDescription>
        </CardHeader>
      </Card>
      
      <Card className="bg-white border border-outline-variant/60 rounded-2xl p-6 hover:border-primary/20 transition-all">
        <CardHeader className="p-0">
          <CardTitle className="text-base font-bold text-on-surface mb-2">Reset Tahunan</CardTitle>
          <CardDescription className="text-sm text-on-surface-variant font-sans leading-relaxed">
            Buka menu <Badge variant="info" className="text-[10px] font-mono px-2 py-0.5">Tahun Kepanitiaan</Badge> &rarr; buat tahun baru &rarr;
            copy struktur dari tahun sebelumnya. Zero perubahan kode.
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}
