"use client";

// components/landing/hero.tsx

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight, Search, Shield, Clock, CheckCircle, Wrench, Car } from "lucide-react";
import { useAuthStore } from "@/store/auth";
import { fadeUp, fadeIn, slideRight } from "./animations";

export function Hero({ totalWorkshops }: { totalWorkshops: number }) {
  const { isAuthenticated, role } = useAuthStore();

  return (
    <section
      id="hero"
      className="relative min-h-screen flex items-center overflow-hidden bg-[var(--navy)]">
      <div className="absolute inset-0">
        <Image
          src="https://images.unsplash.com/photo-1625047509248-ec889cbff17f?w=1920&q=80"
          alt="Bengkel profesional"
          fill
          className="object-cover opacity-20"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0B1C3D] via-[#0B1C3D]/90 to-[#0B1C3D]/60" />
      </div>
      <div className="absolute top-20 right-0 w-96 h-96 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-72 h-72 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-6 pt-24 pb-16 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left */}
          <div>
            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="show"
              transition={{ duration: 0.4 }}
              className="inline-flex items-center gap-2 bg-red-600/20 border border-red-500/30 text-red-400 text-xs font-semibold px-4 py-2 rounded-full mb-6 uppercase tracking-wider">
              <span className="w-1.5 h-1.5 bg-red-400 rounded-full animate-pulse" />
              Platform Bengkel #1 Indonesia
            </motion.div>

            <motion.h1
              variants={fadeUp}
              initial="hidden"
              animate="show"
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white leading-tight mb-5">
              Servis Kendaraan <span className="text-red-500">Profesional</span>
              <br />& Terpercaya
            </motion.h1>

            <motion.p
              variants={fadeUp}
              initial="hidden"
              animate="show"
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-blue-200 text-lg mb-8 leading-relaxed max-w-xl">
              Temukan bengkel terpercaya di sekitarmu. Booking jadwal servis,
              pantau progress kendaraan secara realtime — semua dalam satu
              platform.
            </motion.p>

            {/* Search bar */}
            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="show"
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex items-center gap-0 mb-8 max-w-lg">
              <div className="flex items-center gap-3 bg-white flex-1 px-5 py-4 rounded-l-2xl">
                <Search className="w-5 h-5 text-gray-400 flex-shrink-0" />
                <Link
                  href="/workshops"
                  className="text-gray-400 text-sm flex-1 hover:text-gray-600 transition">
                  Cari bengkel di kotamu...
                </Link>
              </div>
              <Link
                href="/workshops"
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-4 rounded-r-2xl font-semibold text-sm transition whitespace-nowrap shadow-lg shadow-red-900/40">
                Cari Sekarang
              </Link>
            </motion.div>

            {/* CTA buttons */}
            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="show"
              transition={{ duration: 0.5, delay: 0.4 }}
              className="flex flex-wrap gap-3 mb-10">
              {!isAuthenticated ? (
                <>
                  <Link
                    href="/register"
                    className="inline-flex items-center gap-2 bg-white text-[#0B1C3D] font-bold px-6 py-3 rounded-xl hover:bg-blue-50 transition shadow-xl text-sm">
                    Daftar Gratis Sekarang <ArrowRight className="w-4 h-4" />
                  </Link>
                  <Link
                    href="/workshops"
                    className="inline-flex items-center gap-2 border-2 border-white/30 text-white font-semibold px-6 py-3 rounded-xl hover:bg-white/10 transition text-sm">
                    <Wrench className="w-4 h-4" /> Lihat Bengkel
                  </Link>
                </>
              ) : role() === "operator" ? (
                <Link
                  href="/operator/dashboard"
                  className="inline-flex items-center gap-2 bg-white text-[#0B1C3D] font-bold px-6 py-3 rounded-xl hover:bg-blue-50 transition text-sm">
                  Ke Dashboard <ArrowRight className="w-4 h-4" />
                </Link>
              ) : (
                <Link
                  href="/workshops"
                  className="inline-flex items-center gap-2 bg-white text-[#0B1C3D] font-bold px-6 py-3 rounded-xl hover:bg-blue-50 transition text-sm">
                  Cari Bengkel <ArrowRight className="w-4 h-4" />
                </Link>
              )}
            </motion.div>

            {/* Trust indicators */}
            <motion.div
              variants={fadeIn}
              initial="hidden"
              animate="show"
              transition={{ duration: 0.5, delay: 0.6 }}
              className="flex flex-wrap items-center gap-5">
              {[
                { icon: Shield, text: "Bengkel Terverifikasi" },
                { icon: Clock, text: "Booking 24/7" },
                { icon: CheckCircle, text: "Konfirmasi Instan" },
              ].map(({ icon: Icon, text }) => (
                <div
                  key={text}
                  className="flex items-center gap-2 text-blue-300 text-xs">
                  <Icon className="w-4 h-4 text-red-400" />
                  {text}
                </div>
              ))}
            </motion.div>
          </div>

          {/* Right — floating cards */}
          <motion.div
            variants={slideRight}
            initial="hidden"
            animate="show"
            transition={{ duration: 0.7, delay: 0.3 }}
            className="hidden lg:block relative">
            <div className="relative rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
              <Image
                src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80"
                alt="Mekanik profesional"
                width={600}
                height={450}
                className="object-cover w-full h-80"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0B1C3D]/60 to-transparent" />
            </div>

            {/* Floating card 1 */}
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
              className="absolute -left-8 top-8 bg-white rounded-2xl p-4 shadow-2xl min-w-52">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Status Servis</p>
                  <p className="text-sm font-bold text-gray-900">
                    Selesai Dikerjakan
                  </p>
                </div>
              </div>
              <div className="mt-2 bg-green-50 rounded-lg px-3 py-1.5">
                <p className="text-xs text-green-700 font-medium">
                  Honda Vario — B 1234 XY
                </p>
              </div>
            </motion.div>

            {/* Floating card 2 */}
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{
                repeat: Infinity,
                duration: 3.5,
                ease: "easeInOut",
                delay: 0.5,
              }}
              className="absolute -right-6 bottom-8 bg-[var(--navy)] border border-white/10 rounded-2xl p-4 shadow-2xl min-w-48">
              <div className="flex items-center gap-2 mb-2">
                <Car className="w-4 h-4 text-red-400" />
                <p className="text-xs text-blue-300 font-medium">
                  Booking Baru
                </p>
              </div>
              <p className="text-white font-bold text-sm">Tune Up Motor</p>
              <p className="text-blue-400 text-xs mt-0.5">Besok, 09:00 WIB</p>
              <div className="mt-2 flex items-center gap-1">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <p className="text-green-400 text-xs">Dikonfirmasi</p>
              </div>
            </motion.div>

            {/* Floating card 3 */}
            <motion.div
              animate={{ y: [0, -6, 0] }}
              transition={{
                repeat: Infinity,
                duration: 4,
                ease: "easeInOut",
                delay: 1,
              }}
              className="absolute right-8 top-4 bg-red-600 rounded-2xl px-4 py-3 shadow-xl shadow-red-900/40">
              <p className="text-white/80 text-xs">Bengkel Terdaftar</p>
              <p className="text-white font-extrabold text-2xl">
                {totalWorkshops}+
              </p>
            </motion.div>
          </motion.div>
        </div>

        {/* Bottom stats */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="show"
          transition={{ duration: 0.6, delay: 0.8 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-16 pt-10 border-t border-white/10">
          {[
            { value: `${totalWorkshops}+`, label: "Bengkel Terdaftar" },
            { value: "1.000+", label: "Servis Selesai" },
            { value: "4.8/5", label: "Rating Rata-rata" },
            { value: "24/7", label: "Booking Online" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-2xl md:text-3xl font-extrabold text-white">
                {stat.value}
              </div>
              <div className="text-blue-300 text-xs mt-1">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
