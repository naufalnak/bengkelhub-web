"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Menu } from "lucide-react";
import { Sidebar } from "@/components/layout/Sidebar";
import { useAuthStore } from "@/store/auth";
import { useHydrated } from "@/hooks/useHydrated";

export default function OperatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { isAuthenticated, role } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const hydrated = useHydrated();

  useEffect(() => {
    if (!hydrated) return;
    if (!isAuthenticated) {
      router.replace("/login?redirect=/operator/dashboard");
      return;
    }
    if (role() !== "operator") {
      router.replace("/");
    }
  }, [hydrated, isAuthenticated, role, router]);

  if (!hydrated || !isAuthenticated || role() !== "operator") {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "#060f20" }}>
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-500 text-sm">Memuat...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen" style={{ background: "#060f20" }}>
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0">
        <header
          className="md:hidden flex items-center gap-3 px-4 h-14 flex-shrink-0"
          style={{
            background: "#080f20",
            borderBottom: "1px solid rgba(255,255,255,0.07)",
          }}>
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/08 transition">
            <Menu className="w-5 h-5" />
          </button>
          <span className="text-white font-semibold text-sm">
            Bengkel<span className="text-red-500">Hub</span>
          </span>
        </header>
        <main className="flex-1 p-4 md:p-8 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
