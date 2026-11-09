"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function useLogout() {
  const router = useRouter();
  const [keluar, setKeluar] = useState(false);

  async function logout() {
    setKeluar(true);
    await createClient().auth.signOut();
    router.replace("/login");
    router.refresh();
  }

  return { logout, keluar };
}
