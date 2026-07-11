import { getLetterStats } from "@/lib/data/personal-dashboard";
import { FileText, CheckCircle, Send, RefreshCw } from "lucide-react";

export async function SekretarisStats() {
  const stats = await getLetterStats();

  const cards = [
    {
      icon: FileText,
      label: "PERLU DISETUJUI",
      value: stats.pending,
      sub: stats.inRevision > 0 ? `${stats.inRevision} revisi menunggu` : "Menunggu persetujuan",
      iconBg: "bg-accent-lilac/10",
      iconColor: "text-accent-lilac",
    },
    {
      icon: CheckCircle,
      label: "DISETUJUI",
      value: stats.approved,
      sub: "Siap dikirimkan",
      iconBg: "bg-accent-green/10",
      iconColor: "text-accent-green",
    },
    {
      icon: Send,
      label: "TERKIRIM",
      value: stats.sent,
      sub: "Surat sudah dikirim",
      iconBg: "bg-surface-container",
      iconColor: "text-on-surface-variant",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
      {cards.map((card) => (
        <div key={card.label} className="bg-surface-container-low border border-outline-variant/60 rounded-2xl p-6 flex items-start gap-4">
          <div className={`size-10 rounded-xl flex items-center justify-center shrink-0 ${card.iconBg}`}>
            <card.icon className={`size-5 ${card.iconColor}`} />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-mono font-bold tracking-wider text-on-surface-variant uppercase">{card.label}</p>
            <p className="text-3xl font-black text-on-surface my-1 leading-none">{card.value}</p>
            <p className="text-xs text-on-surface-variant font-mono truncate">{card.sub}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
