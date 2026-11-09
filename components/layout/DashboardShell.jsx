"use client";

import { createContext, useContext, useState } from "react";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

const UserContext = createContext({ profile: null, email: "" });
export const useUser = () => useContext(UserContext);

// Kerangka halaman dalam: Sidebar kiri + Topbar + konten
export default function DashboardShell({ profile, email, children }) {
  const [menuHp, setMenuHp] = useState(false);
  const role = profile?.role ?? "nasabah";

  return (
    <UserContext.Provider value={{ profile, email }}>
      <div className="flex min-h-screen bg-slate-50">
        <Sidebar role={role} terbuka={menuHp} onTutup={() => setMenuHp(false)} />
        <div className="flex min-w-0 flex-1 flex-col">
          <Navbar profile={profile} email={email} onBukaMenu={() => setMenuHp(true)} />
          <main className="print-full min-h-[calc(100vh-4rem)] flex-1 bg-slate-50 p-4 sm:p-6">{children}</main>
        </div>
      </div>
    </UserContext.Provider>
  );
}
