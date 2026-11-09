import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// Klien Supabase untuk Server Component & Route Handler
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Dipanggil dari Server Component: aman diabaikan, middleware yang menyegarkan sesi
          }
        },
      },
    }
  );
}

// Ambil user yang login beserta profilnya (nama & role)
export async function getUserProfile() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { user: null, profile: null };

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, nama, role")
    .eq("id", user.id)
    .single();

  return { user, profile };
}
