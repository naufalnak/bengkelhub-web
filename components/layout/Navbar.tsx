"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { Wrench, Menu, X, LogOut, User, ChevronDown } from "lucide-react";
import { useState } from "react";
import { useAuthStore } from "@/store/auth";

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

  const navLinks = [
    { href: "/workshops", label: "Cari Bengkel" },
    {
      href: "/bookings",
      label: "Booking Saya",
      auth: true,
      roles: ["customer"],
    },
  ];

  return (
    <header
      className="sticky top-0 z-50 w-full"
      style={{
        background: "rgba(9, 20, 45, 0.92)",
        backdropFilter: "blur(12px)",
        borderBottom: "1px solid rgba(255,255,255,0.07)",
        boxShadow: "0 4px 24px rgba(0,0,0,0.25)",
      }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 flex-shrink-0">
            <div className="w-9 h-9 bg-red-600 rounded-xl flex items-center justify-center shadow-md shadow-red-900/40">
              <Wrench className="w-4 h-4 text-white" />
            </div>
            <span className="text-white font-bold text-lg tracking-tight">
              Bengkel<span className="text-red-500">Hub</span>
            </span>
          </Link>

          {/* Desktop nav links */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              if (link.auth && !isAuthenticated) return null;
              if (link.roles && role() && !link.roles.includes(role()!))
                return null;
              const active = pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    active
                      ? "text-white bg-white/10"
                      : "text-slate-400 hover:text-white hover:bg-white/05"
                  }`}>
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Desktop right */}
          <div className="hidden md:flex items-center gap-3">
            {!isAuthenticated ? (
              <>
                <Link
                  href="/login"
                  className="text-sm text-slate-400 hover:text-white font-medium transition px-3 py-2">
                  Masuk
                </Link>
                <Link
                  href="/register"
                  className="text-sm font-semibold text-white bg-red-600 hover:bg-red-700 px-4 py-2 rounded-xl transition"
                  style={{ boxShadow: "0 2px 8px rgba(220,38,38,0.30)" }}>
                  Daftar Bengkel
                </Link>
              </>
            ) : role() === "operator" ? (
              <Link
                href="/operator/dashboard"
                className="text-sm font-semibold text-white bg-red-600 hover:bg-red-700 px-4 py-2 rounded-xl transition">
                Dashboard
              </Link>
            ) : (
              /* Customer dropdown */
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-slate-300 hover:text-white hover:bg-white/08 transition">
                  <div className="w-7 h-7 rounded-full bg-red-600/20 border border-red-600/40 flex items-center justify-center">
                    <User className="w-3.5 h-3.5 text-red-400" />
                  </div>
                  <span className="font-medium max-w-[120px] truncate">
                    {user?.name}
                  </span>
                  <ChevronDown
                    className={`w-3.5 h-3.5 transition-transform ${dropdownOpen ? "rotate-180" : ""}`}
                  />
                </button>

                {dropdownOpen && (
                  <div
                    className="absolute right-0 mt-2 w-48 rounded-2xl overflow-hidden py-1.5"
                    style={{
                      background: "#0f2040",
                      border: "1px solid rgba(255,255,255,0.10)",
                      boxShadow: "0 16px 40px rgba(0,0,0,0.40)",
                    }}>
                    <div className="px-4 py-2.5 border-b border-white/08">
                      <p className="text-xs text-slate-500">Masuk sebagai</p>
                      <p className="text-sm text-white font-semibold truncate">
                        {user?.name}
                      </p>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-400 hover:text-red-400 hover:bg-red-500/08 transition">
                      <LogOut className="w-4 h-4" />
                      Keluar
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 text-slate-400 hover:text-white transition"
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
        <div
          className="md:hidden border-t border-white/07 px-4 py-3 space-y-1"
          style={{ background: "#09142d" }}>
          {navLinks.map((link) => {
            if (link.auth && !isAuthenticated) return null;
            if (link.roles && role() && !link.roles.includes(role()!))
              return null;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="block px-3 py-2.5 rounded-lg text-sm text-slate-300 hover:text-white hover:bg-white/08 transition">
                {link.label}
              </Link>
            );
          })}

          <div className="pt-2 border-t border-white/07 mt-2">
            {!isAuthenticated ? (
              <div className="space-y-1">
                <Link
                  href="/login"
                  onClick={() => setMenuOpen(false)}
                  className="block px-3 py-2.5 rounded-lg text-sm text-slate-300 hover:text-white hover:bg-white/08 transition">
                  Masuk
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMenuOpen(false)}
                  className="block px-3 py-2.5 rounded-lg text-sm font-semibold text-white bg-red-600 hover:bg-red-700 transition text-center">
                  Daftar Bengkel
                </Link>
              </div>
            ) : (
              <div className="space-y-1">
                <div className="px-3 py-2">
                  <p className="text-xs text-slate-500">Masuk sebagai</p>
                  <p className="text-sm text-white font-semibold">
                    {user?.name}
                  </p>
                </div>
                {role() === "operator" && (
                  <Link
                    href="/operator/dashboard"
                    onClick={() => setMenuOpen(false)}
                    className="block px-3 py-2.5 rounded-lg text-sm text-slate-300 hover:text-white hover:bg-white/08 transition">
                    Dashboard
                  </Link>
                )}
                <button
                  onClick={() => {
                    handleLogout();
                    setMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-2.5 rounded-lg text-sm text-red-400 hover:bg-red-500/10 transition flex items-center gap-2">
                  <LogOut className="w-4 h-4" /> Keluar
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
