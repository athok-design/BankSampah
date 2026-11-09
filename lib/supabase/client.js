import { createBrowserClient } from "@supabase/ssr";

// Klien Supabase untuk komponen yang berjalan di browser ("use client")
let client;

export function createClient() {
  if (!client) {
    client = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );
  }
  return client;
}
