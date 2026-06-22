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
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { SkeletonCard } from "@/components/ui/PageLoader";
import { cn } from "@/lib/utils";
import type { Workshop } from "@/lib/types";

function WorkshopCard({ workshop }: { workshop: Workshop }) {
  const router = useRouter();
  return (
    <div
      onClick={() => router.push(`/workshops/${workshop.id}`)}
      className="bg-white rounded-2xl border border-gray-200 p-5 flex flex-col gap-4 cursor-pointer hover:shadow-md hover:border-gray-300 transition group">
      <div className="flex items-start gap-3">
        <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center flex-shrink-0 group-hover:bg-red-100 transition">
          <Store className="w-5 h-5 text-red-600" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-bold text-gray-900 truncate group-hover:text-red-600 transition">
            {workshop.name}
          </h3>
          <div className="mt-1">
            <Badge variant={workshop.is_active ? "success" : "default"}>
              {workshop.is_active ? "Buka" : "Tutup"}
            </Badge>
          </div>
        </div>
      </div>

      <div className="space-y-1.5">
        <div className="flex items-start gap-2 text-gray-500 text-sm">
          <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
          <span className="line-clamp-2">
            {workshop.address}, {workshop.city}
          </span>
        </div>
        <div className="flex items-center gap-2 text-gray-500 text-sm">
          <Phone className="w-4 h-4 text-gray-400 flex-shrink-0" />
          <span>{workshop.phone}</span>
        </div>
      </div>

      <p className="text-gray-400 text-xs line-clamp-2 leading-relaxed flex-1">
        {workshop.description}
      </p>

      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
        <span className="text-xs text-gray-400">Klik untuk booking</span>
        <span className="flex items-center gap-1 text-red-600 text-xs font-semibold group-hover:gap-2 transition-all">
          Lihat Detail <ChevronRight className="w-3.5 h-3.5" />
        </span>
      </div>
    </div>
  );
}

export default function WorkshopsPage() {
  const [search, setSearch] = useState("");
  const [cityFilter, setCityFilter] = useState("");
  const [onlyActive, setOnlyActive] = useState(false);

  const { data: workshops = [], isLoading } = useQuery({
    queryKey: ["workshops-public"],
    queryFn: workshopApi.list,
  });

  const cities = [...new Set(workshops.map((w) => w.city))].sort();
  const hasFilter = search || cityFilter || onlyActive;

  const filtered = workshops.filter((w) => {
    const q = search.toLowerCase();
    return (
      (!search ||
        w.name.toLowerCase().includes(q) ||
        w.city.toLowerCase().includes(q) ||
        w.address.toLowerCase().includes(q)) &&
      (!cityFilter || w.city === cityFilter) &&
      (!onlyActive || w.is_active)
    );
  });

  return (
    <div className="space-y-6">
      {/* Hero */}
      <div className="bg-[var(--navy)] rounded-2xl p-8 text-center">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Temukan Bengkel <span className="text-red-400">Terpercaya</span>
        </h1>
        <p className="text-blue-200 mt-2 text-sm max-w-md mx-auto">
          Booking servis kendaraan Anda dengan mudah dan cepat
        </p>
      </div>

      {/* Filter bar */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama bengkel atau kota..."
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0B1C3D] focus:border-transparent transition"
          />
        </div>

        <div className="relative">
          <SlidersHorizontal className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <select
            value={cityFilter}
            onChange={(e) => setCityFilter(e.target.value)}
            className="pl-10 pr-8 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0B1C3D] transition appearance-none cursor-pointer min-w-[140px] bg-white text-gray-900">
            <option value="">Semua Kota</option>
            {cities.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={() => setOnlyActive(!onlyActive)}
          className={cn(
            "flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border transition whitespace-nowrap",
            onlyActive
              ? "bg-green-50 border-green-200 text-green-700"
              : "bg-white border-gray-200 text-gray-500 hover:border-gray-300",
          )}>
          <span
            className={cn(
              "w-2 h-2 rounded-full",
              onlyActive ? "bg-green-500" : "bg-gray-300",
            )}
          />
          Buka Sekarang
        </button>
      </div>

      {/* Result info */}
      {hasFilter && (
        <div className="flex items-center gap-3">
          <p className="text-gray-500 text-sm">
            Menampilkan{" "}
            <span className="text-gray-900 font-semibold">
              {filtered.length}
            </span>{" "}
            bengkel
          </p>
          <button
            onClick={() => {
              setSearch("");
              setCityFilter("");
              setOnlyActive(false);
            }}
            className="flex items-center gap-1 text-xs text-red-600 hover:text-red-700 font-semibold transition">
            <X className="w-3.5 h-3.5" /> Reset
          </button>
        </div>
      )}

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200">
          <EmptyState
            icon={Store}
            title="Bengkel tidak ditemukan"
            description="Coba kata kunci atau filter yang berbeda"
            action={
              hasFilter ? (
                <button
                  onClick={() => {
                    setSearch("");
                    setCityFilter("");
                    setOnlyActive(false);
                  }}
                  className="text-sm text-red-600 hover:text-red-700 font-semibold transition">
                  Reset filter
                </button>
              ) : undefined
            }
          />
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
