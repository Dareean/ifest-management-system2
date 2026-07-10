"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, Lock, Eye, EyeOff, LogIn } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-surface">
      {/* Brand Panel — Desktop */}
      <div className="hidden md:flex md:w-[45%] bg-primary text-on-primary flex-col justify-between p-xl relative overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute -top-20 -right-20 size-80 rounded-full bg-accent-magenta/10" />
        <div className="absolute -bottom-32 -left-16 size-96 rounded-full bg-block-lilac/8" />
        <div className="absolute top-1/3 right-8 size-24 rounded-full bg-block-mint/10" />

        <div className="relative z-10">
          <p className="eyebrow text-on-primary/60 mb-lg">HMTI UNIVERSITAS TADULAKO</p>
          <h1 className="text-6xl lg:text-7xl xl:text-8xl font-semibold tracking-tight leading-none">
            I-FEST
            <br />
            <span className="text-accent-magenta">Management</span>
            <br />
            System
          </h1>
        </div>

        <div className="relative z-10 flex flex-col gap-lg">
          <p className="text-lg text-on-primary/80 leading-relaxed max-w-md">
            Sistem manajemen terpadu untuk kepanitiaan I-FEST —
            transparan, efisien, dan siap diwariskan.
          </p>
          <div className="flex flex-col gap-sm">
            <div className="flex items-center gap-md">
              <div className="size-1 rounded-full bg-accent-magenta" />
              <span className="text-sm font-mono text-on-primary/60 tracking-wider uppercase">Manajemen KPI</span>
            </div>
            <div className="flex items-center gap-md">
              <div className="size-1 rounded-full bg-block-lilac" />
              <span className="text-sm font-mono text-on-primary/60 tracking-wider uppercase">Notulensi Rapat</span>
            </div>
            <div className="flex items-center gap-md">
              <div className="size-1 rounded-full bg-block-mint" />
              <span className="text-sm font-mono text-on-primary/60 tracking-wider uppercase">Anggaran Divisi</span>
            </div>
          </div>
        </div>

        <p className="relative z-10 caption text-on-primary/40">&copy; 2026 HMTI Universitas Tadulako</p>
      </div>

      {/* Mobile Brand Header */}
      <div className="md:hidden bg-primary text-on-primary px-lg py-xl">
        <p className="eyebrow text-on-primary/60 mb-sm">HMTI UNIVERSITAS TADULAKO</p>
        <h1 className="text-4xl font-bold tracking-tight leading-none">
          I-FEST
          <span className="text-accent-magenta"> Management</span>
          <br />
          System
        </h1>
      </div>

      {/* Form Panel */}
      <div className="flex-1 flex items-center justify-center px-lg md:px-xl py-xl">
        <div className="w-full max-w-sm flex flex-col gap-xl">
          {/* Header */}
          <div className="flex flex-col gap-xs">
            <p className="eyebrow text-on-surface-variant">Akses Terbatas</p>
            <h2 className="text-3xl font-semibold tracking-tight text-on-surface">
              Masuk ke Dashboard
            </h2>
            <p className="text-sm text-on-surface-variant font-sans">
              Gunakan akun panitia yang sudah didaftarkan.
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-start gap-sm text-sm text-error bg-error-container rounded-xl p-md">
              <LogIn className="size-4 mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} className="flex flex-col gap-lg">
            <div className="flex flex-col gap-md">
              <div>
                <label htmlFor="email" className="caption block mb-xs text-on-surface-variant">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-on-surface-variant" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="nama@ifest.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="pl-10"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="caption block mb-xs text-on-surface-variant">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-on-surface-variant" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="pl-10 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              </div>
            </div>

            <Button type="submit" disabled={loading} size="lg" className="w-full">
              {loading ? "Memproses..." : "Masuk"}
            </Button>
          </form>

          {/* Divider for desktop brand features (shown on mobile only) */}
          <div className="md:hidden flex flex-col gap-sm pt-sm border-t border-outline-variant/40">
            <p className="caption text-on-surface-variant">Fitur utama:</p>
            <div className="flex flex-wrap gap-x-lg gap-y-xs">
              <span className="text-xs font-mono text-on-surface-variant tracking-wider uppercase">KPI</span>
              <span className="text-xs font-mono text-on-surface-variant tracking-wider uppercase">Rapat</span>
              <span className="text-xs font-mono text-on-surface-variant tracking-wider uppercase">Anggaran</span>
              <span className="text-xs font-mono text-on-surface-variant tracking-wider uppercase">Surat</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
