"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Store,
  CalendarClock,
  ClipboardList,
  Users,
  Car,
  Wrench,
  Receipt,
  BarChart2,
  LogOut,
  ChevronRight,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/auth";

const NAV_ITEMS = [
  { href: "/operator/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/operator/workshops", label: "Workshop", icon: Store },
  { href: "/operator/slots", label: "Jadwal & Slot", icon: CalendarClock },
  { href: "/operator/orders", label: "Pesanan", icon: ClipboardList },
  { href: "/operator/customers", label: "Pelanggan", icon: Users },
  { href: "/operator/vehicles", label: "Kendaraan", icon: Car },
  { href: "/operator/services", label: "Servis", icon: Wrench },
  { href: "/operator/invoices", label: "Invoice", icon: Receipt },
  { href: "/operator/laporan", label: "Laporan", icon: BarChart2 },
];

interface SidebarProps {
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
    <div className="flex flex-col h-full bg-[var(--navy)]">
      {/* Logo */}
      <div className="h-16 flex items-center justify-between gap-3 px-5 border-b border-white/10 flex-shrink-0">
        <Link href="/operator/dashboard" className="flex items-center gap-3">
          <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center shadow-lg shadow-red-900/30">
            <Wrench className="w-4 h-4 text-white" />
          </div>
          <div>
            <span className="font-bold text-white text-sm block leading-none">
              BengkelHub
            </span>
            <span className="text-blue-400 text-xs leading-none">Operator</span>
          </div>
        </Link>
        {onClose && (
          <button
            onClick={onClose}
            className="md:hidden p-1.5 rounded-lg text-blue-300 hover:text-white hover:bg-white/10 transition">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* User info */}
      <div className="px-3 pt-4 pb-2">
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white/05">
          <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center flex-shrink-0 text-white text-sm font-bold shadow">
            {user?.name?.charAt(0).toUpperCase() ?? "O"}
          </div>
          <div className="min-w-0">
            <p className="text-white text-sm font-semibold truncate leading-tight">
              {user?.name ?? "Operator"}
            </p>
            <p className="text-blue-400 text-xs truncate leading-tight">
              {user?.email}
            </p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-2 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              onClick={onClose}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group",
                active
                  ? "bg-red-600 text-white shadow-lg shadow-red-900/30"
                  : "text-blue-200 hover:bg-white/10 hover:text-white",
              )}>
              <Icon
                className={cn(
                  "w-4 h-4 flex-shrink-0",
                  active
                    ? "text-white"
                    : "text-blue-300 group-hover:text-white",
                )}
              />
              <span className="flex-1">{label}</span>
              {active && <ChevronRight className="w-3.5 h-3.5 text-red-200" />}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-3 border-t border-white/10 flex-shrink-0">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-blue-200 hover:bg-white/10 hover:text-white transition group">
          <LogOut className="w-4 h-4 text-blue-300 group-hover:text-white transition" />
          Keluar
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop */}
      <aside className="hidden md:flex flex-col w-60 flex-shrink-0 h-screen sticky top-0">
        {content}
      </aside>

      {/* Mobile drawer */}
      {open !== undefined && (
        <>
          <div
            className={cn(
              "md:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity duration-300",
              open
                ? "opacity-100 pointer-events-auto"
                : "opacity-0 pointer-events-none",
            )}
            onClick={onClose}
          />
          <aside
            className={cn(
              "md:hidden fixed inset-y-0 left-0 z-50 w-64 flex flex-col transition-transform duration-300",
              open ? "translate-x-0" : "-translate-x-full",
            )}>
            {content}
          </aside>
        </>
      )}
    </>
  );
}
