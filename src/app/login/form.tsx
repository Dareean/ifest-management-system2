"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ColorBlock } from "@/components/blocks/color-block";
import { createClient } from "@/lib/supabase/client";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
    <div className="min-h-screen flex items-center justify-center px-md">
      <ColorBlock color="lilac" className="w-full max-w-md">
        <p className="eyebrow text-on-surface-variant mb-xs">Akses Terbatas</p>
        <h2 className="text-3xl font-semibold tracking-tight mb-md">
          Masuk ke IMS
        </h2>

        <form onSubmit={handleLogin} className="flex flex-col gap-sm">
          <div>
            <label htmlFor="email" className="caption block mb-xs text-on-surface-variant">
              Email
            </label>
            <Input
              id="email"
              type="email"
              placeholder="nama@hmti-untad.ac.id"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="caption block mb-xs text-on-surface-variant">
              Password
            </label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && (
            <p className="text-sm text-error bg-error-container rounded-md p-sm">
              {error}
            </p>
          )}

          <Button type="submit" disabled={loading} className="mt-sm">
            {loading ? "Memproses..." : "Masuk"}
          </Button>
        </form>
      </ColorBlock>
    </div>
  );
}
