"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import {
  Search,
  MapPin,
  Phone,
  Store,
  ChevronRight,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { workshopApi } from "@/lib/api";
import type { Workshop } from "@/lib/types";

// ─── Workshop card ─────────────────────────────────────────────────────────────

function WorkshopCard({ workshop }: { workshop: Workshop }) {
  const router = useRouter();

  return (
    <div
      className="rounded-2xl p-5 flex flex-col gap-4 cursor-pointer transition group hover:border-red-600/30"
      style={{
        background: "#0b1628",
        border: "1px solid rgba(255,255,255,0.07)",
        boxShadow: "0 4px 24px rgba(0,0,0,0.15)",
      }}
      onClick={() => router.push(`/workshops/${workshop.id}`)}>
      {/* Top */}
      <div className="flex items-start gap-3">
        <div className="w-12 h-12 rounded-xl bg-red-600/15 border border-red-600/25 flex items-center justify-center flex-shrink-0 group-hover:bg-red-600/25 transition">
          <Store className="w-5 h-5 text-red-400" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-white font-bold text-base leading-tight group-hover:text-red-300 transition truncate">
            {workshop.name}
          </h3>
          <span
            className="inline-flex items-center mt-1 px-2 py-0.5 rounded-md text-xs font-semibold"
            style={{
              color: workshop.is_active ? "#22c55e" : "#6b7280",
              background: workshop.is_active
                ? "rgba(34,197,94,0.10)"
                : "rgba(107,114,128,0.10)",
              border: `1px solid ${workshop.is_active ? "rgba(34,197,94,0.25)" : "rgba(107,114,128,0.20)"}`,
            }}>
            {workshop.is_active ? "Buka" : "Tutup"}
          </span>
        </div>
      </div>

      {/* Info */}
      <div className="space-y-2">
        <div className="flex items-start gap-2">
          <MapPin className="w-4 h-4 text-slate-600 flex-shrink-0 mt-0.5" />
          <span className="text-slate-400 text-sm line-clamp-2">
            {workshop.address}, {workshop.city}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Phone className="w-4 h-4 text-slate-600 flex-shrink-0" />
          <span className="text-slate-400 text-sm">{workshop.phone}</span>
        </div>
      </div>

      {/* Description */}
      <p className="text-slate-500 text-xs line-clamp-2 leading-relaxed flex-1">
        {workshop.description}
      </p>

      {/* CTA */}
      <div
        className="flex items-center justify-between pt-3"
        style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <span className="text-xs text-slate-600">Klik untuk booking</span>
        <div className="flex items-center gap-1 text-red-400 text-xs font-semibold group-hover:gap-2 transition-all">
          Lihat Detail <ChevronRight className="w-3.5 h-3.5" />
        </div>
      </div>
    </div>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function WorkshopSkeleton() {
  return (
    <div
      className="rounded-2xl p-5 space-y-4 animate-pulse"
      style={{
        background: "#0b1628",
        border: "1px solid rgba(255,255,255,0.07)",
      }}>
      <div className="flex gap-3">
        <div className="w-12 h-12 rounded-xl bg-white/05" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-white/05 rounded-lg w-3/4" />
          <div className="h-3 bg-white/05 rounded-lg w-1/4" />
        </div>
      </div>
      <div className="space-y-2">
        <div className="h-3 bg-white/05 rounded-lg w-full" />
        <div className="h-3 bg-white/05 rounded-lg w-2/3" />
      </div>
      <div className="h-3 bg-white/05 rounded-lg w-full" />
      <div className="h-3 bg-white/05 rounded-lg w-4/5" />
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function WorkshopsPage() {
  const [search, setSearch] = useState("");
  const [cityFilter, setCityFilter] = useState("");
  const [onlyActive, setOnlyActive] = useState(false);

  const { data: workshops = [], isLoading } = useQuery({
    queryKey: ["workshops-public"],
    queryFn: workshopApi.list,
  });

  // Unique cities for filter
  const cities = [...new Set(workshops.map((w) => w.city))].sort();

  // Filter
  const filtered = workshops.filter((w) => {
    const q = search.toLowerCase();
    const matchSearch =
      !search ||
      w.name.toLowerCase().includes(q) ||
      w.city.toLowerCase().includes(q) ||
      w.address.toLowerCase().includes(q);
    const matchCity = !cityFilter || w.city === cityFilter;
    const matchActive = !onlyActive || w.is_active;
    return matchSearch && matchCity && matchActive;
  });

  const hasFilter = search || cityFilter || onlyActive;

  return (
    <div className="space-y-8">
      {/* Hero */}
      <div className="text-center py-6">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Temukan Bengkel <span className="text-red-500">Terpercaya</span>
        </h1>
        <p className="text-slate-400 mt-3 text-base max-w-xl mx-auto">
          Booking servis kendaraan Anda dengan mudah dan cepat
        </p>
      </div>

      {/* Search + filter bar */}
      <div
        className="rounded-2xl p-4 flex flex-col sm:flex-row gap-3"
        style={{
          background: "#0b1628",
          border: "1px solid rgba(255,255,255,0.07)",
        }}>
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama bengkel atau kota..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm text-white placeholder-slate-600 bg-white/04 border border-white/08 focus:outline-none focus:border-red-500/50 focus:ring-2 focus:ring-red-500/10 transition"
          />
        </div>

        {/* City filter */}
        <div className="relative">
          <SlidersHorizontal className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 pointer-events-none" />
          <select
            value={cityFilter}
            onChange={(e) => setCityFilter(e.target.value)}
            className="pl-10 pr-8 py-2.5 rounded-xl text-sm text-white bg-white/04 border border-white/08 focus:outline-none focus:border-red-500/50 transition appearance-none cursor-pointer min-w-[140px]">
            <option value="" className="bg-slate-900">
              Semua Kota
            </option>
            {cities.map((city) => (
              <option key={city} value={city} className="bg-slate-900">
                {city}
              </option>
            ))}
          </select>
        </div>

        {/* Active toggle */}
        <button
          onClick={() => setOnlyActive(!onlyActive)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition whitespace-nowrap"
          style={{
            background: onlyActive
              ? "rgba(34,197,94,0.12)"
              : "rgba(255,255,255,0.04)",
            border: `1px solid ${onlyActive ? "rgba(34,197,94,0.30)" : "rgba(255,255,255,0.08)"}`,
            color: onlyActive ? "#22c55e" : "#64748b",
          }}>
          <span
            className="w-2 h-2 rounded-full"
            style={{ background: onlyActive ? "#22c55e" : "#475569" }}
          />
          Buka Sekarang
        </button>
      </div>

      {/* Active filters info */}
      {hasFilter && (
        <div className="flex items-center gap-3">
          <p className="text-slate-500 text-sm">
            Menampilkan{" "}
            <span className="text-white font-semibold">{filtered.length}</span>{" "}
            bengkel
          </p>
          <button
            onClick={() => {
              setSearch("");
              setCityFilter("");
              setOnlyActive(false);
            }}
            className="flex items-center gap-1.5 text-xs text-red-400 hover:text-red-300 font-semibold transition">
            <X className="w-3.5 h-3.5" /> Reset filter
          </button>
        </div>
      )}

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <WorkshopSkeleton key={i} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div
          className="rounded-2xl p-12 flex flex-col items-center gap-3 text-center"
          style={{
            background: "rgba(255,255,255,0.02)",
            border: "1px dashed rgba(255,255,255,0.08)",
          }}>
          <Store className="w-12 h-12 text-slate-700" />
          <div>
            <p className="text-white font-semibold">Bengkel tidak ditemukan</p>
            <p className="text-slate-500 text-sm mt-1">
              Coba kata kunci atau filter yang berbeda
            </p>
          </div>
          <button
            onClick={() => {
              setSearch("");
              setCityFilter("");
              setOnlyActive(false);
            }}
            className="text-sm text-red-400 hover:text-red-300 font-semibold transition">
            Reset filter
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((w) => (
            <WorkshopCard key={w.id} workshop={w} />
          ))}
        </div>
      )}
    </div>
  );
}
