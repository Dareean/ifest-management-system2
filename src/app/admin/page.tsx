import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ColorBlock } from "@/components/blocks/color-block";
import { Badge } from "@/components/ui/badge";

export default function AdminOverviewPage() {
  return (
    <ColorBlock color="pink">
      <p className="eyebrow text-on-surface-variant mb-md">Selamat Datang di Admin Panel</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
        <Card>
          <CardHeader>
            <CardTitle>Dynamic Structure</CardTitle>
            <CardDescription>
              Divisi dan role disimpan di database — bukan hardcode. Tahun depan, cukup buat
              tahun kepanitiaan baru dan assign personel baru.
            </CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Reset Tahunan</CardTitle>
            <CardDescription>
              Buka menu <Badge variant="info">Tahun Kepanitiaan</Badge> → buat tahun baru →
              copy struktur dari tahun sebelumnya. Zero perubahan kode.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    </ColorBlock>
  );
}
