import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

// Halaman yang boleh dibuka tanpa login
const HALAMAN_PUBLIK = ["/login", "/daftar"];

// Halaman khusus nasabah
function halamanNasabah(path) {
  return path.startsWith("/nasabah/dashboard") || path.startsWith("/nasabah/riwayat");
}

// Halaman khusus petugas
function halamanPetugas(path) {
  if (halamanNasabah(path)) return false;
  return ["/dashboard", "/nasabah", "/jenis-sampah", "/setoran", "/penarikan", "/laporan"].some(
    (p) => path === p || path.startsWith(p + "/")
  );
}

function berandaRole(role) {
  return role === "petugas" ? "/dashboard" : "/nasabah/dashboard";
}

export async function middleware(request) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;

  // Route verifikasi email selalu boleh
  if (path.startsWith("/auth")) return response;

  const redirect = (tujuan) => {
    const url = request.nextUrl.clone();
    url.pathname = tujuan;
    url.search = "";
    const res = NextResponse.redirect(url);
    // bawa cookie sesi yang mungkin baru disegarkan
    response.cookies.getAll().forEach((c) => res.cookies.set(c));
    return res;
  };

  // Belum login
  if (!user) {
    if (HALAMAN_PUBLIK.includes(path)) return response;
    return redirect("/login");
  }

  // Sudah login: cek role
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  const role = profile?.role ?? "nasabah";

  if (path === "/" || HALAMAN_PUBLIK.includes(path)) return redirect(berandaRole(role));
  if (halamanPetugas(path) && role !== "petugas") return redirect(berandaRole(role));
  if (halamanNasabah(path) && role !== "nasabah") return redirect(berandaRole(role));

  return response;
}

export const config = {
  matcher: [
    // semua halaman kecuali file statis & gambar
    "/((?!_next/static|_next/image|favicon.ico|icon.png|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
