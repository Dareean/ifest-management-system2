import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="flex-1 flex flex-col items-center justify-center px-4 sm:px-md text-center">
        <p className="eyebrow text-on-surface-variant mb-xs">HMTI UNTAD</p>
        <h1 className="max-w-4xl break-words text-4xl sm:text-6xl lg:text-7xl xl:text-8xl font-semibold tracking-tight leading-none">
          I-FEST
          <br />
          <span className="text-accent-magenta">Management</span>
          <br />
          System
        </h1>
        <p className="mt-md text-xl text-on-surface-variant max-w-lg">
          Sistem manajemen terpadu untuk kepanitiaan I-FEST —
          transparan, efisien, dan siap diwariskan.
        </p>
        <div className="mt-xl flex items-center gap-sm">
          <Link href="/login">
            <Button size="lg">Masuk ke Dashboard</Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-md text-center caption text-on-surface-variant">
        &copy; 2026 HMTI Universitas Tadulako
      </footer>
    </div>
  );
}
