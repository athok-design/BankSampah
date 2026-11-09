import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Link verifikasi email dari Supabase mengarah ke sini.
// Mendukung dua format: ?code=... (PKCE, bawaan) dan ?token_hash=...&type=signup
export async function GET(request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type");
  const errorDesc = searchParams.get("error_description");

  const supabase = await createClient();

  if (errorDesc) {
    return NextResponse.redirect(`${origin}/login?verified=gagal`);
  }

  if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type });
    if (error) return NextResponse.redirect(`${origin}/login?verified=gagal`);
  } else if (code) {
    // Jika link dibuka di browser lain, penukaran kode bisa gagal,
    // tetapi email-nya sudah terverifikasi oleh Supabase sebelum diarahkan ke sini.
    await supabase.auth.exchangeCodeForSession(code);
  } else {
    return NextResponse.redirect(`${origin}/login`);
  }

  // Sesuai alur: setelah verifikasi, pengguna diminta login sendiri
  await supabase.auth.signOut();
  return NextResponse.redirect(`${origin}/login?verified=true`);
}
