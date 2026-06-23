"use client";

// components/landing/how-it-works.tsx

import Link from "next/link";
import { motion } from "framer-motion";
import { Search, CalendarDays, Wrench, FileText, ArrowRight } from "lucide-react";
import { fadeUp } from "./animations";

const steps = [
  {
    icon: Search,
    step: "01",
    title: "Cari Bengkel",
    desc: "Temukan bengkel terpercaya di sekitarmu berdasarkan lokasi dan spesialisasi.",
  },
  {
    icon: CalendarDays,
    step: "02",
    title: "Booking Online",
    desc: "Pilih jadwal booking sesuai waktu yang paling convenient buat kamu.",
  },
  {
    icon: Wrench,
    step: "03",
    title: "Kendaraan Diservis",
    desc: "Bengkel mengerjakan kendaraan kamu. Pantau status realtime via aplikasi.",
  },
  {
    icon: FileText,
    step: "04",
    title: "Selesai",
    desc: "Kendaraan beres, dapat konfirmasi WhatsApp. Mudah dan transparan.",
  },
];

export function HowItWorks() {
  return (
    <section id="cara-kerja" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16">
          <span className="inline-block bg-red-100 text-red-600 text-xs font-bold px-4 py-2 rounded-full uppercase tracking-wider mb-4">
            Cara Kerja
          </span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-[#0B1C3D] mb-4">
            Servis kendaraan dalam 4 langkah
          </h2>
          <p className="text-gray-500 max-w-xl mx-auto text-sm">
            Dari pencarian bengkel hingga selesai servis — semua bisa dilakukan
            dari smartphone kamu.
          </p>
        </motion.div>

        <div className="relative">
          <div className="hidden lg:block absolute top-12 left-[12.5%] right-[12.5%] h-0.5 bg-gradient-to-r from-red-200 via-blue-200 to-red-200" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map(({ icon: Icon, step, title, desc }, i) => (
              <motion.div
                key={step}
                variants={fadeUp}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="relative text-center">
                <div className="relative z-10 w-24 h-24 mx-auto mb-5">
                  <div className="w-24 h-24 bg-[var(--navy)] rounded-2xl flex items-center justify-center shadow-xl">
                    <Icon className="w-10 h-10 text-white" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center text-white text-xs font-extrabold shadow-lg">
                    {step}
                  </div>
                </div>
                <h3 className="text-base font-bold text-[#0B1C3D] mb-2">
                  {title}
                </h3>
                <p className="text-sm text-gray-500 leading-relaxed px-2">
                  {desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>

        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="text-center mt-12">
          <Link
            href="/workshops"
            className="inline-flex items-center gap-2 bg-[var(--navy)] text-white font-bold px-8 py-3.5 rounded-xl transition shadow-xl text-sm hover:bg-[var(--navy-light)]">
            <Search className="w-4 h-4" /> Cari Bengkel Sekarang{" "}
            <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
