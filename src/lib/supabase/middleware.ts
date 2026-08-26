import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import {
  DEFAULT_SUPABASE_URL,
  DEFAULT_SUPABASE_ANON_KEY,
} from "./config";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const url =
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_URL !== "https://placeholder.supabase.co"
      ? process.env.NEXT_PUBLIC_SUPABASE_URL
      : DEFAULT_SUPABASE_URL;

  const key =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY !== "placeholder-anon-key"
      ? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      : DEFAULT_SUPABASE_ANON_KEY;

  const supabase = createServerClient(
    url,
    key,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // Jangan pernah blokir halaman hanya karena Supabase Auth sedang
  // tidak bisa dijangkau (network glitch / cold start). Tanpa ini,
  // user yang sudah login bisa terlempar ke /login secara acak.
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Redirect root path to dashboard or login
    if (request.nextUrl.pathname === "/") {
      const url = request.nextUrl.clone();
      url.pathname = user ? "/dashboard" : "/login";
      return NextResponse.redirect(url);
    }

    // Protect dashboard and admin routes
    const protectedPaths = ["/dashboard", "/admin"];
    const isProtected = protectedPaths.some((path) =>
      request.nextUrl.pathname.startsWith(path),
    );

    if (isProtected && !user) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      return NextResponse.redirect(url);
    }

    // Redirect logged-in users away from login page
    if (user && request.nextUrl.pathname === "/login") {
      const url = request.nextUrl.clone();
      url.pathname = "/dashboard";
      return NextResponse.redirect(url);
    }
  } catch (error) {
    console.error(
      "[middleware] Gagal memvalidasi sesi (Supabase Auth tidak terjangkau):",
      error,
    );
    // Biarkan request lewat — halaman server punya guard sendiri
    // (requireRole/redirect login) sebagai lapisan kedua.
  }

  return supabaseResponse;
}
