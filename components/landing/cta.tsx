"use client";

// components/landing/cta.tsx

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Search, Wrench } from "lucide-react";
import { fadeUp } from "./animations";

export function CTA() {
  return (
    <section className="py-24 bg-[var(--navy)] relative overflow-hidden border-t border-white/10">
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="relative max-w-7xl mx-auto px-6">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-14">
          <span className="inline-block bg-red-600/20 border border-red-500/30 text-red-400 text-xs font-bold px-4 py-2 rounded-full uppercase tracking-wider mb-4">
            Bergabung Sekarang
          </span>
          <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-4">
            Mulai Kelola Bengkel
            <br />
            <span className="text-red-500">Lebih Efisien</span>
          </h2>
          <p className="text-blue-300 text-lg max-w-xl mx-auto">
            Bergabung dengan bengkel yang sudah menggunakan BengkelHub untuk
            operasional sehari-hari.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          <motion.div
            variants={{
              hidden: { opacity: 0, x: -20 },
              show: { opacity: 1, x: 0 },
            }}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-white rounded-3xl p-8">
            <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center mb-5">
              <Search className="w-7 h-7 text-[#0B1C3D]" />
            </div>
            <h3 className="text-xl font-extrabold text-[#0B1C3D] mb-2">
              Saya Pemilik Kendaraan
            </h3>
            <p className="text-gray-500 text-sm mb-6 leading-relaxed">
              Cari bengkel terpercaya, booking jadwal servis online, dan pantau
              kendaraan kamu secara realtime.
            </p>
            <div className="space-y-3">
              <Link
                href="/register"
                className="flex items-center justify-center gap-2 bg-[var(--navy)] text-white font-bold py-3 rounded-xl text-sm hover:bg-[var(--navy-light)] transition">
                Daftar Gratis <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/workshops"
                className="flex items-center justify-center gap-2 border-2 border-gray-200 text-gray-700 font-semibold py-3 rounded-xl text-sm hover:border-[#0B1C3D] transition">
                Lihat Bengkel
              </Link>
            </div>
          </motion.div>

          <motion.div
            variants={{
              hidden: { opacity: 0, x: 20 },
              show: { opacity: 1, x: 0 },
            }}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-red-600 rounded-3xl p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/50 rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
            <div className="relative">
              <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center mb-5">
                <Wrench className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-extrabold text-white mb-2">
                Saya Pemilik Bengkel
              </h3>
              <p className="text-red-100 text-sm mb-6 leading-relaxed">
                Tampilkan bengkel kamu, terima booking online, dan kelola servis
                lebih profesional.
              </p>
              <div className="space-y-3">
                <Link
                  href="/register"
                  className="flex items-center justify-center gap-2 bg-white text-red-600 font-bold py-3 rounded-xl text-sm hover:bg-red-50 transition">
                  Daftarkan Bengkel <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/login"
                  className="flex items-center justify-center gap-2 border-2 border-white/30 text-white font-semibold py-3 rounded-xl text-sm hover:bg-white/10 transition">
                  Login Operator
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
