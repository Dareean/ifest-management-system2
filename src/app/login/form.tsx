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
    <div className="min-h-dvh flex flex-col md:flex-row bg-surface">
      {/* Brand Panel — 40% width */}
      <div
        className="hidden md:flex md:w-[40%] flex-col justify-between p-md lg:p-xl relative overflow-hidden shrink-0"
        style={{ backgroundColor: '#C5B0F4' }}
      >
        {/* ── Visual Assets — 14 stickers, spread naturally across the whole panel ── */}

        {/* Zone: TOP-LEFT — cat walking, medium */}
        <img src="/assets/visual_assets/cat3 1.webp" alt="" aria-hidden="true"
          className="absolute pointer-events-none select-none"
          style={{ width: 95, top: '3%', left: '5%', transform: 'rotate(-8deg)', mixBlendMode: 'multiply' }} />

        {/* Zone: TOP-CENTER — yellow constellation network */}
        <img src="/assets/visual_assets/sy4 1.webp" alt="" aria-hidden="true"
          className="absolute pointer-events-none select-none"
          style={{ width: 80, top: '5%', left: '42%', transform: 'rotate(12deg)', mixBlendMode: 'multiply', opacity: 0.85 }} />

        {/* Zone: TOP-RIGHT — pink wave arrows */}
        <img src="/assets/visual_assets/rp2 1.webp" alt="" aria-hidden="true"
          className="absolute pointer-events-none select-none"
          style={{ width: 68, top: '2%', right: '6%', transform: 'rotate(-18deg)', mixBlendMode: 'multiply', opacity: 0.82 }} />

        {/* Zone: UPPER-MID LEFT — green scatter dashes */}
        <img src="/assets/visual_assets/sg2 1.webp" alt="" aria-hidden="true"
          className="absolute pointer-events-none select-none"
          style={{ width: 100, top: '22%', left: '-2%', transform: 'rotate(5deg)', mixBlendMode: 'multiply', opacity: 0.75 }} />

        {/* Zone: UPPER-MID RIGHT — blue burst sparks */}
        <img src="/assets/visual_assets/sb1 1.webp" alt="" aria-hidden="true"
          className="absolute pointer-events-none select-none"
          style={{ width: 82, top: '18%', right: '4%', transform: 'rotate(-10deg)', mixBlendMode: 'multiply', opacity: 0.78 }} />

        {/* Zone: MID-LEFT — blue robot snake (tall, vertical) */}
        <img src="/assets/visual_assets/rb5 1.webp" alt="" aria-hidden="true"
          className="absolute pointer-events-none select-none"
          style={{ width: 55, top: '36%', left: '8%', transform: 'rotate(-5deg)', mixBlendMode: 'multiply', opacity: 0.88 }} />

        {/* Zone: CENTER — colorful plant pot (hero mid element) */}
        <img src="/assets/visual_assets/rr4 1.webp" alt="" aria-hidden="true"
          className="absolute pointer-events-none select-none"
          style={{ width: 120, top: '38%', left: '32%', transform: 'rotate(6deg)', mixBlendMode: 'multiply', opacity: 0.90 }} />

        {/* Zone: MID-RIGHT — megaphone (large, bleeds off right edge) */}
        <img src="/assets/visual_assets/Component 1.webp" alt="" aria-hidden="true"
          className="absolute pointer-events-none select-none"
          style={{ width: 185, top: '44%', right: '-18px', transform: 'rotate(-7deg)', mixBlendMode: 'multiply', opacity: 0.88 }} />

        {/* Zone: MID-CENTER — yellow dots scatter */}
        <img src="/assets/visual_assets/sy3 1.webp" alt="" aria-hidden="true"
          className="absolute pointer-events-none select-none"
          style={{ width: 72, top: '56%', left: '48%', transform: 'rotate(-12deg)', mixBlendMode: 'multiply', opacity: 0.70 }} />

        {/* Zone: LOWER-LEFT — red sparkle stars */}
        <img src="/assets/visual_assets/sr1 1.webp" alt="" aria-hidden="true"
          className="absolute pointer-events-none select-none"
          style={{ width: 130, bottom: '16%', left: '0%', transform: 'rotate(-4deg)', mixBlendMode: 'multiply', opacity: 0.85 }} />

        {/* Zone: LOWER-MID — cat sitting (different pose) */}
        <img src="/assets/visual_assets/cat2 1.webp" alt="" aria-hidden="true"
          className="absolute pointer-events-none select-none"
          style={{ width: 70, bottom: '20%', left: '36%', transform: 'rotate(10deg)', mixBlendMode: 'multiply' }} />

        {/* Zone: LOWER-RIGHT — green triangles cluster */}
        <img src="/assets/visual_assets/sg1 1.webp" alt="" aria-hidden="true"
          className="absolute pointer-events-none select-none"
          style={{ width: 78, bottom: '22%', right: '10%', transform: 'rotate(20deg)', mixBlendMode: 'multiply' }} />

        {/* Zone: BOTTOM-LEFT — green vine arrows */}
        <img src="/assets/visual_assets/rg1 1.webp" alt="" aria-hidden="true"
          className="absolute pointer-events-none select-none"
          style={{ width: 54, bottom: '5%', left: '18%', transform: 'rotate(-15deg)', mixBlendMode: 'multiply', opacity: 0.80 }} />

        {/* Zone: BOTTOM-RIGHT — yellow petals */}
        <img src="/assets/visual_assets/sy1 1.webp" alt="" aria-hidden="true"
          className="absolute pointer-events-none select-none"
          style={{ width: 75, bottom: '3%', right: '14%', transform: 'rotate(-22deg)', mixBlendMode: 'multiply', opacity: 0.72 }} />

        {/* ── TOP: Institution logos ── */}
        <div className="relative z-10 flex flex-col gap-sm">
          <div
            className="flex items-center gap-sm px-sm py-xs rounded-2xl self-start"
            style={{ backgroundColor: 'rgba(255,255,255,0.6)', backdropFilter: 'blur(8px)' }}
          >
            <img src="/assets/logo_utama/logo_utama_png/logo_untad.png" alt="Logo Universitas Tadulako"
              className="object-contain flex-shrink-0" style={{ height: 44, width: 44 }} />
            <div className="w-px self-stretch" style={{ backgroundColor: 'rgba(0,0,0,0.1)' }} />
            <img src="/assets/logo_utama/logo_utama_png/HMTI LOGO.png" alt="Logo HMTI"
              className="object-contain flex-shrink-0" style={{ height: 44, width: 44 }} />
            <div className="w-px self-stretch" style={{ backgroundColor: 'rgba(0,0,0,0.1)' }} />
            <img src="/assets/logo_utama/logo_utama_png/Logo-IFEST-2026.png" alt="Logo I-FEST 2026"
              className="object-contain flex-shrink-0" style={{ height: 38 }} />
          </div>
          <p className="eyebrow" style={{ color: 'rgba(255,255,255,0.65)' }}>HMTI UNIVERSITAS TADULAKO</p>
        </div>

        {/* ── MASCOT: centered vertically ── */}
        <div className="relative z-10 flex items-center justify-center py-lg">
          <div
            className="rounded-full"
            style={{
              width: 220,
              maxWidth: '90%',
              aspectRatio: '1 / 1',
              background: 'radial-gradient(circle, rgba(255,255,255,0.5) 30%, rgba(255,255,255,0) 80%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <img
              src="/assets/Maskot/18 1.png"
              alt="Maskot I-FEST"
              className="pointer-events-none select-none"
              style={{
                width: 200,
                maxWidth: '90%',
                position: 'relative',
                zIndex: 1,
                filter: 'drop-shadow(0 8px 20px rgba(0,0,0,0.15))',
              }}
            />
          </div>
        </div>

        {/* ── BOTTOM: Heading + copyright ── */}
        <div className="relative z-10 flex flex-col gap-xs">
          {/* Glassmorphism card behind the heading */}
          <div
            style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.28) 0%, rgba(197,176,244,0.18) 60%, rgba(255,61,139,0.12) 100%)',
              backdropFilter: 'blur(18px)',
              WebkitBackdropFilter: 'blur(18px)',
              border: '1px solid rgba(255,255,255,0.35)',
              borderRadius: '20px',
              padding: '14px 24px',
              position: 'relative',
              zIndex: 0,
            }}
          >
            <h1
              className="font-display font-extrabold tracking-tight leading-[0.95] text-center"
              style={{ fontSize: 'clamp(2.5rem, 3.5vw, 3.8rem)', color: '#fdf8fa' }}
            >
              Sint<span style={{ color: '#FF3D8B' }}>uwu</span>
            </h1>
          </div>

          <p className="caption mt-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
            &copy; 2026 HMTI Universitas Tadulako
          </p>
        </div>
      </div>

      {/* Mobile Brand Header — lilac to match */}
      <div className="md:hidden px-md py-sm relative overflow-hidden" style={{ backgroundColor: '#C5B0F4' }}>
        {/* Mobile logos row */}
        <div className="flex items-center gap-xs mb-xs">
          <img
            src="/assets/logo_utama/logo_utama_png/logo_untad.png"
            alt="Logo Universitas Tadulako"
            className="object-contain"
            style={{ height: 32, width: 32, mixBlendMode: 'multiply' }}
          />
          <img
            src="/assets/logo_utama/logo_utama_png/HMTI LOGO.png"
            alt="Logo HMTI"
            className="object-contain"
            style={{ height: 32, width: 32, mixBlendMode: 'multiply' }}
          />
          <img
            src="/assets/logo_utama/logo_utama_png/Logo-IFEST-2026.png"
            alt="Logo I-FEST 2026"
            className="object-contain"
            style={{ height: 26, mixBlendMode: 'multiply' }}
          />
        </div>
        <h1 className="font-display font-extrabold tracking-tight leading-snug text-2xl" style={{ color: '#1d1b1d' }}>
          Sint<span style={{ color: '#FF3D8B' }}>uwu</span>
        </h1>
      </div>

      {/* Form Panel */}
      <div className="flex-1 flex items-center justify-center px-md md:px-lg lg:px-xl py-lg md:py-xl min-h-0">
        <div className="w-full max-w-sm flex flex-col gap-lg md:gap-xl">
          {/* Header */}
          <div className="flex flex-col gap-xs">
            <p className="eyebrow text-on-surface-variant">Akses Terbatas</p>
            <h2 className="text-2xl md:text-3xl font-semibold tracking-tight text-on-surface">
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
          <form onSubmit={handleLogin} className="flex flex-col gap-lg md:gap-xl">
            <div className="flex flex-col gap-md">
              <div>
                <label htmlFor="email" className="caption block mb-xs text-on-surface-variant">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-on-surface-variant pointer-events-none" />
                  <Input
                    id="email"
                    name="email"
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
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-on-surface-variant pointer-events-none" />
                  <Input
                    id="password"
                    name="password"
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
                    aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
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

          {/* Mobile feature list */}
          <div className="md:hidden flex flex-col gap-sm pt-sm border-t border-outline-variant/40">
            <p className="caption text-on-surface-variant">Fitur utama:</p>
            <div className="flex flex-wrap gap-x-lg gap-y-xs">
              <span className="text-xs font-mono text-on-surface-variant/70 tracking-wider uppercase">KPI</span>
              <span className="text-xs font-mono text-on-surface-variant/70 tracking-wider uppercase">Rapat</span>
              <span className="text-xs font-mono text-on-surface-variant/70 tracking-wider uppercase">Anggaran</span>
              <span className="text-xs font-mono text-on-surface-variant/70 tracking-wider uppercase">Surat</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
