import { redirect } from "next/navigation";
import { getUserProfile } from "@/lib/supabase/server";

// Halaman utama: arahkan sesuai role
export default async function Home() {
  const { user, profile } = await getUserProfile();
  if (!user) redirect("/login");
  redirect(profile?.role === "petugas" ? "/dashboard" : "/nasabah/dashboard");
}
