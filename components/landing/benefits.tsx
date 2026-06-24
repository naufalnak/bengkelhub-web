"use client";

// components/landing/benefits.tsx

import Image from "next/image";
import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import { fadeUp, slideRight } from "./animations";

const benefits = [
  "Hemat waktu administrasi — invoice otomatis dari servis",
  "Data tersimpan aman di cloud — tidak takut hilang",
  "Akses dari mana saja — web-based, tanpa install aplikasi",
  "Notifikasi WhatsApp otomatis ke pelanggan",
  "Laporan keuangan realtime — pantau pendapatan kapan saja",
  "Booking online 24/7 — pelanggan bisa pesan kapan saja",
];

export function Benefits() {
  return (
    <section className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}>
            <span className="inline-block bg-red-100 text-red-600 text-xs font-bold px-4 py-2 rounded-full uppercase tracking-wider mb-4">
              Kenapa BengkelHub?
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-[#0B1C3D] mb-4 leading-tight">
              Dirancang untuk{" "}
              <span className="text-red-600">bengkel nyata</span>
            </h2>
            <p className="text-gray-500 leading-relaxed mb-8">
              Bukan sekadar software — BengkelHub dibuat berdasarkan alur kerja
              bengkel kendaraan yang sesungguhnya.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {benefits.map((benefit) => (
                <div
                  key={benefit}
                  className="flex items-start gap-3 bg-white rounded-xl p-3 border border-gray-200 shadow-sm">
                  <CheckCircle2 className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                  <span className="text-xs text-gray-700 leading-relaxed">
                    {benefit}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right — Image collage */}
          <motion.div
            variants={slideRight}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="grid grid-cols-2 gap-4">
            <div className="space-y-4">
              <div className="rounded-2xl overflow-hidden h-52 shadow-xl">
                <Image
                  src="https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=400&q=80"
                  alt="Mekanik bekerja"
                  width={400}
                  height={300}
                  className="object-cover w-full h-full hover:scale-105 transition duration-500"
                />
              </div>
              <div className="rounded-2xl overflow-hidden h-36 shadow-xl">
                <Image
                  src="https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=400&q=80"
                  alt="Dashboard bengkel"
                  width={400}
                  height={200}
                  className="object-cover w-full h-full hover:scale-105 transition duration-500"
                />
              </div>
            </div>
            <div className="space-y-4 mt-8">
              <div className="rounded-2xl overflow-hidden h-36 shadow-xl">
                <Image
                  src="https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=400&q=80"
                  alt="Kendaraan di bengkel"
                  width={400}
                  height={200}
                  className="object-cover w-full h-full hover:scale-105 transition duration-500"
                />
              </div>
              <div className="rounded-2xl overflow-hidden h-52 shadow-xl">
                <Image
                  src="https://images.unsplash.com/photo-1504222490345-c075b626d1c8?w=400&q=80"
                  alt="Servis profesional"
                  width={400}
                  height={300}
                  className="object-cover w-full h-full hover:scale-105 transition duration-500"
                />
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
