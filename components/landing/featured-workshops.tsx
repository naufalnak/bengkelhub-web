"use client";

// components/landing/featured-workshops.tsx

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Wrench, MapPin, ChevronRight } from "lucide-react";
import { fadeUp } from "./animations";

type Workshop = {
  id: string;
  name: string;
  address: string;
  description: string;
  is_active: boolean;
};

export function FeaturedWorkshops({ workshops }: { workshops: Workshop[] }) {
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
                    <span className="truncate">{w.address}</span>
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
