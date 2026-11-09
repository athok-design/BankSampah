import { redirect } from "next/navigation";
import { getUserProfile } from "@/lib/supabase/server";
import DashboardShell from "@/components/layout/DashboardShell";

// Dashboard Layout (Sidebar + Topbar) untuk semua halaman setelah login.
// Pembatasan role per halaman diatur di middleware.js
export default async function AppLayout({ children }) {
  const { user, profile } = await getUserProfile();
  if (!user) redirect("/login");

  return (
    <DashboardShell profile={profile} email={user.email}>
      {children}
    </DashboardShell>
  );
}
