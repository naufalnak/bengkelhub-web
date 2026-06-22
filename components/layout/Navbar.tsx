"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { Wrench, Menu, X, LogOut, User, ChevronDown } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/auth";

const NAV_LINKS = [
  { href: "/workshops", label: "Cari Bengkel" },
  {
    href: "/bookings",
    label: "Booking Saya",
    authOnly: true,
    roles: ["customer"],
  },
];

export function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, user, logout, role } = useAuthStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 flex-shrink-0">
            <div className="w-9 h-9 bg-[var(--navy)] rounded-xl flex items-center justify-center shadow-md">
              <Wrench className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-[#0B1C3D] text-lg tracking-tight">
              Bengkel<span className="text-red-600">Hub</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map((link) => {
              if (link.authOnly && !isAuthenticated) return null;
              if (link.roles && role() && !link.roles.includes(role()!))
                return null;
              const active = pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "px-4 py-2 rounded-xl text-sm font-medium transition",
                    active
                      ? "bg-gray-100 text-[#0B1C3D] font-semibold"
                      : "text-gray-500 hover:text-gray-900 hover:bg-gray-50",
                  )}>
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Desktop right */}
          <div className="hidden md:flex items-center gap-2">
            {!isAuthenticated ? (
              <>
                <Link
                  href="/login"
                  className="px-4 py-2 rounded-xl text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition">
                  Masuk
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2 rounded-xl text-sm font-bold text-white bg-red-600 hover:bg-red-700 transition shadow-sm">
                  Daftar
                </Link>
              </>
            ) : role() === "operator" ? (
              <Link
                href="/operator/dashboard"
                className="px-4 py-2 rounded-xl text-sm font-bold text-white bg-[var(--navy)] hover:bg-[var(--navy-light)] transition shadow-sm">
                Dashboard
              </Link>
            ) : (
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-gray-700 hover:bg-gray-100 transition">
                  <div className="w-7 h-7 rounded-lg bg-[var(--navy)] flex items-center justify-center">
                    <User className="w-3.5 h-3.5 text-white" />
                  </div>
                  <span className="font-medium max-w-[120px] truncate">
                    {user?.name}
                  </span>
                  <ChevronDown
                    className={cn(
                      "w-3.5 h-3.5 text-gray-400 transition-transform",
                      dropdownOpen && "rotate-180",
                    )}
                  />
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl border border-gray-200 shadow-lg py-1.5 z-50">
                    <div className="px-4 py-2.5 border-b border-gray-100">
                      <p className="text-xs text-gray-400">Masuk sebagai</p>
                      <p className="text-sm font-semibold text-gray-900 truncate">
                        {user?.name}
                      </p>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-600 hover:text-red-600 hover:bg-red-50 transition">
                      <LogOut className="w-4 h-4" /> Keluar
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 rounded-xl text-gray-500 hover:bg-gray-100 transition"
            onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-gray-100 px-4 py-3 space-y-1 bg-white">
          {NAV_LINKS.map((link) => {
            if (link.authOnly && !isAuthenticated) return null;
            if (link.roles && role() && !link.roles.includes(role()!))
              return null;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="block px-3 py-2.5 rounded-xl text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition">
                {link.label}
              </Link>
            );
          })}
          <div className="pt-2 border-t border-gray-100 space-y-1">
            {!isAuthenticated ? (
              <>
                <Link
                  href="/login"
                  onClick={() => setMenuOpen(false)}
                  className="block px-3 py-2.5 rounded-xl text-sm text-gray-600 hover:bg-gray-50 transition">
                  Masuk
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMenuOpen(false)}
                  className="block px-3 py-2.5 rounded-xl text-sm font-bold text-white bg-red-600 hover:bg-red-700 transition text-center">
                  Daftar
                </Link>
              </>
            ) : (
              <>
                <div className="px-3 py-2">
                  <p className="text-xs text-gray-400">Masuk sebagai</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {user?.name}
                  </p>
                </div>
                {role() === "operator" && (
                  <Link
                    href="/operator/dashboard"
                    onClick={() => setMenuOpen(false)}
                    className="block px-3 py-2.5 rounded-xl text-sm text-gray-600 hover:bg-gray-50 transition">
                    Dashboard
                  </Link>
                )}
                <button
                  onClick={() => {
                    handleLogout();
                    setMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-2.5 rounded-xl text-sm text-red-600 hover:bg-red-50 transition flex items-center gap-2">
                  <LogOut className="w-4 h-4" /> Keluar
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
