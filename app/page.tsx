"use client";

import Link from "next/link";
import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  Search,
  Shield,
  Clock,
  CheckCircle,
  Wrench,
  Car,
  CalendarDays,
  FileText,
  MapPin,
  ChevronRight,
  Phone,
  Mail,
  Users,
  BarChart3,
  CreditCard,
  Menu,
  X,
} from "lucide-react";
import { workshopApi } from "@/lib/api";
import { useAuthStore } from "@/store/auth";
import { useState, useEffect } from "react";
import { LandingNavbar } from "@/components/layout/LandingNavbar";

// ─── Animation variants ───────────────────────────────────────────────────────

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0 },
};

const fadeIn = {
  hidden: { opacity: 0 },
  show: { opacity: 1 },
};

const slideLeft = {
  hidden: { opacity: 0, x: -30 },
  show: { opacity: 1, x: 0 },
};

const slideRight = {
  hidden: { opacity: 0, x: 40 },
  show: { opacity: 1, x: 0 },
};

// ─── Hero ─────────────────────────────────────────────────────────────────────

function Hero({ totalWorkshops }: { totalWorkshops: number }) {
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

// ─── How it works ─────────────────────────────────────────────────────────────

function HowItWorks() {
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

// ─── Featured workshops ───────────────────────────────────────────────────────

type Workshop = {
  id: string;
  name: string;
  city: string;
  description: string;
  is_active: boolean;
};

function FeaturedWorkshops({ workshops }: { workshops: Workshop[] }) {
  if (workshops.length === 0) return null;

  return (
    <section className="py-24 bg-white border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="flex items-end justify-between mb-12">
          <div>
            <span className="inline-block bg-red-100 text-red-600 text-xs font-bold px-4 py-2 rounded-full uppercase tracking-wider mb-4">
              Bengkel Terdaftar
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-[#0B1C3D]">
              Bengkel pilihan kami
            </h2>
            <p className="text-gray-500 mt-2 text-sm">
              Bengkel terpercaya yang sudah bergabung di platform BengkelHub
            </p>
          </div>
          <Link
            href="/workshops"
            className="hidden md:flex items-center gap-2 text-sm font-semibold text-red-600 hover:text-red-700 transition">
            Lihat semua <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {workshops.slice(0, 3).map((w, i) => (
            <motion.div
              key={w.id}
              variants={fadeUp}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              whileHover={{ y: -6, transition: { duration: 0.2 } }}>
              <Link
                href={`/workshops/${w.id}`}
                className="group block bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-xl hover:border-[#0B1C3D]/20 transition-all">
                <div className="bg-[var(--navy)] px-5 py-6 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-red-600/10 rounded-full -translate-y-1/2 translate-x-1/2" />
                  <div className="w-12 h-12 bg-red-600 rounded-xl flex items-center justify-center mb-3 shadow-lg shadow-red-900/30">
                    <Wrench className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-bold text-white text-base group-hover:text-red-300 transition">
                    {w.name}
                  </h3>
                  <div className="flex items-center gap-1.5 text-blue-300 text-xs mt-1">
                    <MapPin className="w-3 h-3" />
                    {w.city}
                  </div>
                </div>
                <div className="p-5">
                  <p className="text-xs text-gray-500 leading-relaxed mb-4 line-clamp-2">
                    {w.description}
                  </p>
                  <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                    <span className="inline-flex items-center gap-1.5 text-xs text-green-600 font-semibold">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                      Buka
                    </span>
                    <span className="flex items-center gap-1 text-xs font-bold text-red-600">
                      Lihat Detail <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Features ─────────────────────────────────────────────────────────────────

function Features() {
  const features = [
    {
      icon: Users,
      title: "Manajemen Pelanggan",
      desc: "Simpan data pelanggan lengkap dengan riwayat servis terstruktur.",
    },
    {
      icon: Car,
      title: "Data Kendaraan",
      desc: "Catat semua kendaraan dengan detail teknis dan nomor plat.",
    },
    {
      icon: Wrench,
      title: "Service Order",
      desc: "Kelola order servis dari pending hingga selesai secara realtime.",
    },
    {
      icon: FileText,
      title: "Invoice Digital",
      desc: "Generate invoice otomatis lengkap dengan detail item pekerjaan.",
    },
    {
      icon: CreditCard,
      title: "Catat Pembayaran",
      desc: "Tunai, Transfer, QRIS. Lacak status lunas dan sisa tagihan.",
    },
    {
      icon: BarChart3,
      title: "Laporan Keuangan",
      desc: "Dashboard pendapatan, grafik tren, dan breakdown layanan terlaris.",
    },
  ];

  return (
    <section
      id="layanan"
      className="py-24 bg-[var(--navy)] relative overflow-hidden">
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
          backgroundSize: "40px 40px",
        }}
      />
      <div className="absolute top-0 right-0 w-96 h-96 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div
            variants={slideLeft}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative">
            <div className="relative rounded-3xl overflow-hidden border border-white/10">
              <Image
                src="https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=800&q=80"
                alt="Layanan bengkel"
                width={600}
                height={500}
                className="object-cover w-full h-96 lg:h-[500px]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0B1C3D]/80 via-transparent to-transparent" />
              <div className="absolute bottom-6 left-6 right-6 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4">
                <p className="text-white font-bold text-sm mb-2">
                  Fitur Lengkap untuk Bengkel Modern
                </p>
                <div className="flex flex-wrap gap-2">
                  {[
                    "Booking Online",
                    "Invoice Digital",
                    "Notif WA",
                    "Laporan",
                  ].map((tag) => (
                    <span
                      key={tag}
                      className="text-xs bg-white/20 text-white px-2.5 py-1 rounded-full">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <div className="absolute -right-6 top-8 bg-red-600 rounded-2xl px-5 py-4 shadow-2xl shadow-red-900/40">
              <p className="text-white/80 text-xs">Total Fitur</p>
              <p className="text-white font-extrabold text-3xl">10+</p>
              <p className="text-red-200 text-xs mt-0.5">Fitur lengkap</p>
            </div>
          </motion.div>

          <div>
            <motion.div
              variants={fadeUp}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="mb-8">
              <span className="inline-block bg-red-600/20 border border-red-500/30 text-red-400 text-xs font-bold px-4 py-2 rounded-full uppercase tracking-wider mb-4">
                Fitur Platform
              </span>
              <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4">
                Semua yang dibutuhkan bengkel modern
              </h2>
              <p className="text-blue-300 leading-relaxed text-sm">
                Dari pencatatan pelanggan hingga laporan keuangan — dirancang
                khusus untuk alur kerja bengkel nyata.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {features.map(({ icon: Icon, title, desc }, i) => (
                <motion.div
                  key={title}
                  variants={fadeUp}
                  initial="hidden"
                  whileInView="show"
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.08 }}
                  className="flex items-start gap-3 bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 transition">
                  <div className="w-9 h-9 bg-red-600/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Icon className="w-4 h-4 text-red-400" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white mb-0.5">
                      {title}
                    </p>
                    <p className="text-xs text-blue-300 leading-relaxed">
                      {desc}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── CTA ──────────────────────────────────────────────────────────────────────

function CTA() {
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

// ─── Footer ───────────────────────────────────────────────────────────────────

function Footer() {
  return (
    <footer className="bg-[var(--navy)] text-gray-400 border-t border-white/10">
      <div className="max-w-7xl mx-auto px-6 pt-16 pb-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center">
                <Wrench className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="font-bold text-white block">BengkelHub</span>
                <span className="text-xs text-blue-400">
                  Platform Bengkel Indonesia
                </span>
              </div>
            </div>
            <p className="text-xs leading-relaxed mb-4">
              Platform bengkel kendaraan yang menghubungkan pelanggan dengan
              bengkel terpercaya di seluruh Indonesia.
            </p>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs">
                <Phone className="w-3.5 h-3.5 text-red-400" />
                <span>+62 812-3456-7890</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <Mail className="w-3.5 h-3.5 text-red-400" />
                <span>hello@bengkelhub.id</span>
              </div>
            </div>
          </div>

          {[
            {
              title: "Pelanggan",
              links: [
                { label: "Cari Bengkel", href: "/workshops" },
                { label: "Daftar Akun", href: "/register" },
                { label: "Masuk", href: "/login" },
                { label: "Booking Saya", href: "/bookings" },
              ],
            },
            {
              title: "Operator",
              links: [
                { label: "Daftarkan Bengkel", href: "/register" },
                { label: "Login Operator", href: "/login" },
                { label: "Dashboard", href: "/operator/dashboard" },
                { label: "Kelola Pesanan", href: "/operator/orders" },
              ],
            },
            {
              title: "Platform",
              links: [
                { label: "Cara Kerja", href: "#cara-kerja" },
                { label: "Fitur", href: "#layanan" },
                { label: "Tentang Kami", href: "#" },
                { label: "Kontak", href: "#" },
              ],
            },
          ].map(({ title, links }) => (
            <div key={title}>
              <h4 className="text-sm font-bold text-white mb-4 uppercase tracking-wider">
                {title}
              </h4>
              <div className="space-y-2.5">
                {links.map((l) => (
                  <Link
                    key={l.label}
                    href={l.href}
                    className="block text-xs hover:text-red-400 transition">
                    {l.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="text-xs">
            © {new Date().getFullYear()} BengkelHub. All rights reserved.
          </p>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span className="text-xs text-green-400">
              Semua sistem berjalan normal
            </span>
          </div>
          <p className="text-xs">Bangga Buatan Anak IT Lokal 🇮🇩</p>
        </div>
      </div>
    </footer>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function LandingPage() {
  const { data: workshops = [] } = useQuery({
    queryKey: ["workshops-public"],
    queryFn: workshopApi.list,
    staleTime: 1000 * 60 * 5,
  });

  const activeWorkshops = workshops.filter((w) => w.is_active);

  return (
    <main className="min-h-screen">
      <LandingNavbar />
      <Hero totalWorkshops={workshops.length} />
      <HowItWorks />
      <FeaturedWorkshops workshops={activeWorkshops} />
      <Features />
      <CTA />
      <Footer />
    </main>
  );
}
