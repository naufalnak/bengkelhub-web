"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Wrench,
  LayoutDashboard,
  Store,
  CalendarClock,
  ClipboardList,
  LogOut,
  ChevronRight,
  X,
} from "lucide-react";
import { useAuthStore } from "@/store/auth";

const NAV_ITEMS = [
  {
    href: "/operator/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    href: "/operator/workshops",
    label: "Workshop",
    icon: Store,
  },
  {
    href: "/operator/slots",
    label: "Jadwal & Slot",
    icon: CalendarClock,
  },
  {
    href: "/operator/orders",
    label: "Pesanan",
    icon: ClipboardList,
  },
];

interface SidebarProps {
  /** Mobile: controlled open state */
  open?: boolean;
  onClose?: () => void;
}

export function Sidebar({ open, onClose }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const content = (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div
        className="flex items-center justify-between px-5 h-16 flex-shrink-0"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
        <Link href="/operator/dashboard" className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center shadow shadow-red-900/40">
            <Wrench className="w-4 h-4 text-white" />
          </div>
          <span className="text-white font-bold text-base tracking-tight">
            Bengkel<span className="text-red-500">Hub</span>
          </span>
        </Link>

        {/* Mobile close button */}
        {onClose && (
          <button
            onClick={onClose}
            className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/08 transition">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* User info */}
      <div
        className="mx-3 mt-4 mb-2 px-3 py-3 rounded-xl"
        style={{
          background: "rgba(255,255,255,0.05)",
          border: "1px solid rgba(255,255,255,0.08)",
        }}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-red-600/20 border border-red-600/30 flex items-center justify-center flex-shrink-0">
            <span className="text-red-400 font-bold text-sm">
              {user?.name?.charAt(0).toUpperCase() ?? "O"}
            </span>
          </div>
          <div className="min-w-0">
            <p className="text-white text-sm font-semibold truncate">
              {user?.name ?? "Operator"}
            </p>
            <p className="text-slate-500 text-xs truncate">{user?.email}</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-2 space-y-0.5 overflow-y-auto">
        <p className="text-xs font-semibold text-slate-600 uppercase tracking-wider px-3 py-2">
          Menu
        </p>
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              onClick={onClose}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                active
                  ? "text-white"
                  : "text-slate-400 hover:text-white hover:bg-white/05"
              }`}
              style={
                active
                  ? {
                      background:
                        "linear-gradient(135deg, rgba(220,38,38,0.20) 0%, rgba(220,38,38,0.08) 100%)",
                      border: "1px solid rgba(220,38,38,0.25)",
                    }
                  : {}
              }>
              <Icon
                className={`w-4 h-4 flex-shrink-0 transition-colors ${
                  active
                    ? "text-red-400"
                    : "text-slate-500 group-hover:text-slate-300"
                }`}
              />
              <span className="flex-1">{label}</span>
              {active && (
                <ChevronRight className="w-3.5 h-3.5 text-red-500 flex-shrink-0" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer: logout */}
      <div
        className="p-3 flex-shrink-0"
        style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-red-400 hover:bg-red-500/08 transition group">
          <LogOut className="w-4 h-4 flex-shrink-0 group-hover:text-red-400 transition-colors" />
          Keluar
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar — always visible */}
      <aside
        className="hidden md:flex flex-col w-60 flex-shrink-0 h-screen sticky top-0"
        style={{
          background: "#080f20",
          borderRight: "1px solid rgba(255,255,255,0.07)",
        }}>
        {content}
      </aside>

      {/* Mobile sidebar — drawer overlay */}
      {open !== undefined && (
        <>
          {/* Backdrop */}
          <div
            className={`md:hidden fixed inset-0 z-40 transition-opacity duration-300 ${
              open
                ? "opacity-100 pointer-events-auto"
                : "opacity-0 pointer-events-none"
            }`}
            style={{ background: "rgba(0,0,0,0.60)" }}
            onClick={onClose}
          />

          {/* Drawer */}
          <aside
            className={`md:hidden fixed inset-y-0 left-0 z-50 w-64 flex flex-col transition-transform duration-300 ${
              open ? "translate-x-0" : "-translate-x-full"
            }`}
            style={{
              background: "#080f20",
              borderRight: "1px solid rgba(255,255,255,0.07)",
            }}>
            {content}
          </aside>
        </>
      )}
    </>
  );
}
