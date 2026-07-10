import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ColorBlock } from "@/components/blocks/color-block";
import { Plus } from "lucide-react";
import Link from "next/link";
import { getLetters, getStatusDisplay } from "@/lib/data/letters";

export default async function LettersPage() {
  const letters = await getLetters();

  return (
    <div className="flex flex-col gap-section-gap">
      <div className="flex items-center justify-between">
        <div>
          <p className="eyebrow text-on-surface-variant">Sistem Surat</p>
          <h1 className="text-4xl font-semibold tracking-tight leading-none">Permohonan Surat</h1>
        </div>
        <Link href="/dashboard/letters/new">
          <Button>
            <Plus className="size-4" />
            Ajukan Surat
          </Button>
        </Link>
      </div>

      <ColorBlock color="mint">
        {letters.length === 0 && (
          <p className="text-on-surface-variant py-md text-center">
            Belum ada permohonan surat. Klik "Ajukan Surat" untuk memulai.
          </p>
        )}
        <div className="grid grid-cols-1 gap-md">
          {letters.map((letter) => {
            const status = getStatusDisplay(letter.status);
            return (
              <Link href={`/dashboard/letters/${letter.id}`} key={letter.id}>
                <Card className="hover:border-accent-magenta/50 transition-colors cursor-pointer">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{letter.subject}</CardTitle>
                        <CardDescription>
                          {letter.letterType} &middot; {letter.division} &middot; {letter.requester} &middot;{" "}
                          {new Date(letter.createdAt).toLocaleDateString("id-ID")}
                        </CardDescription>
                      </div>
                      <Badge variant={status.variant}>{status.label}</Badge>
                    </div>
                  </CardHeader>
                </Card>
              </Link>
            );
          })}
        </div>
      </ColorBlock>
    </div>
  );
}
