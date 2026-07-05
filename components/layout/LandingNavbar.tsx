"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Wrench, Menu, X } from "lucide-react";
import { useAuthStore } from "@/store/auth";

const NAV_LINKS = [
  { label: "Beranda", href: "#hero" },
  { label: "Layanan", href: "#layanan" },
  { label: "Cara Kerja", href: "#cara-kerja" },
  { label: "Bengkel", href: "/workshops" },
];

export function LandingNavbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { isAuthenticated, role } = useAuthStore();

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-[var(--navy)]/98 backdrop-blur-md shadow-lg shadow-black/20"
          : "bg-transparent"
      }`}>
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center shadow-md">
            <Wrench className="w-4 h-4 text-white" />
          </div>
          <div>
            <span className="font-bold text-white text-base leading-none block">
              Bengkel<span className="text-red-400">Hub</span>
            </span>
            <span className="text-blue-300 text-[10px] leading-none">
              Platform Bengkel Indonesia
            </span>
          </div>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm text-blue-200 hover:text-white transition">
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Desktop right */}
        <div className="hidden md:flex items-center gap-2">
          {!isAuthenticated ? (
            <>
              <Link
                href="/login"
                className="text-sm font-medium text-blue-200 hover:text-white transition px-4 py-2">
                Masuk
              </Link>
              <Link
                href="/register"
                className="text-sm font-semibold bg-red-600 hover:bg-red-700 text-white px-4 py-2.5 rounded-xl transition shadow-lg shadow-red-900/30">
                Daftar Gratis
              </Link>
              <Link
                href="/register?role=operator"
                className="text-sm font-semibold border border-white/30 text-white px-4 py-2.5 rounded-xl hover:bg-white/10 transition">
                Daftar Bengkel
              </Link>
            </>
          ) : role() === "operator" ? (
            <Link
              href="/operator/dashboard"
              className="text-sm font-bold bg-white text-[var(--navy)] px-5 py-2.5 rounded-xl transition shadow-lg">
              Dashboard
            </Link>
          ) : (
            <Link
              href="/workshops"
              className="text-sm font-bold bg-white text-[var(--navy)] px-5 py-2.5 rounded-xl transition shadow-lg">
              Cari Bengkel
            </Link>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden text-white"
          onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-[var(--navy)] border-t border-white/10 px-6 pb-5">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="block py-3 text-sm text-blue-200 border-b border-white/5">
                {link.label}
              </Link>
            ))}
            <div className="flex flex-col gap-2 mt-4">
              {!isAuthenticated ? (
                <>
                  <Link
                    href="/login"
                    onClick={() => setMenuOpen(false)}
                    className="text-sm text-center py-2.5 border border-white/20 text-white rounded-xl">
                    Masuk
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setMenuOpen(false)}
                    className="text-sm text-center py-2.5 bg-red-600 text-white rounded-xl font-semibold">
                    Daftar Gratis
                  </Link>
                  <Link
                    href="/register?role=operator"
                    onClick={() => setMenuOpen(false)}
                    className="text-sm text-center py-2.5 border border-white/30 text-white rounded-xl font-semibold">
                    Daftar Bengkel
                  </Link>
                </>
              ) : role() === "operator" ? (
                <Link
                  href="/operator/dashboard"
                  onClick={() => setMenuOpen(false)}
                  className="text-sm text-center py-2.5 bg-white text-[var(--navy)] rounded-xl font-semibold">
                  Dashboard
                </Link>
              ) : (
                <Link
                  href="/workshops"
                  onClick={() => setMenuOpen(false)}
                  className="text-sm text-center py-2.5 bg-white text-[var(--navy)] rounded-xl font-semibold">
                  Cari Bengkel
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
