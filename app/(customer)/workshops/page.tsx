"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import {
  Search,
  MapPin,
  Phone,
  Store,
  ChevronRight,
  X,
  LocateFixed,
  Navigation,
} from "lucide-react";
import { workshopApi } from "@/lib/api";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { SkeletonCard } from "@/components/ui/PageLoader";
import { cn, formatDistance } from "@/lib/utils";
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
          <div className="mt-1 flex items-center gap-1.5 flex-wrap">
            <Badge variant={workshop.is_active ? "success" : "default"}>
              {workshop.is_active ? "Buka" : "Tutup"}
            </Badge>
            {workshop.distance_km != null && (
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--navy)] bg-blue-50 px-2 py-0.5 rounded-full">
                <Navigation className="w-3 h-3" />
                {formatDistance(workshop.distance_km)}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-1.5">
        <div className="flex items-start gap-2 text-gray-500 text-sm">
          <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
          <span className="line-clamp-2">{workshop.address}</span>
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
  const [onlyActive, setOnlyActive] = useState(false);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(
    null,
  );
  // State awal HARUS sama persis di server & client, makanya nggak boleh
  // dicek dari `navigator` di sini (server nggak punya `navigator` sama
  // sekali, jadi hasilnya bakal beda dari client → hydration mismatch).
  // "loading" dipakai sebagai nilai netral "lagi ngecek" sebelum effect di
  // bawah selesai jalan di client.
  const [locationStatus, setLocationStatus] = useState<
    "loading" | "granted" | "denied" | "unsupported"
  >("loading");

  // requestLocation dipakai buat tombol "coba lagi" manual (dipanggil dari
  // event handler onClick, BUKAN dari effect) — setState sinkron di sini
  // aman karena bukan di dalam body useEffect.
  const requestLocation = () => {
    if (typeof navigator === "undefined" || !("geolocation" in navigator)) {
      setLocationStatus("unsupported");
      return;
    }
    setLocationStatus("loading");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocationStatus("granted");
      },
      () => setLocationStatus("denied"),
      { enableHighAccuracy: true, timeout: 8000 },
    );
  };

  // Coba deteksi otomatis begitu halaman dibuka. Pengecekan `navigator` &
  // pemanggilan geolocation SENGAJA ditaruh di effect (bukan lazy initializer
  // useState) — effect cuma jalan di client SETELAH hydration selesai, jadi
  // aman dari mismatch server/client. setState("unsupported") di sini juga
  // aman meski "sinkron", karena statusnya emang baru bisa diketahui di
  // client, bukan sesuatu yang bisa dihitung duluan di render pertama.
  useEffect(() => {
    if (typeof navigator === "undefined" || !("geolocation" in navigator)) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLocationStatus("unsupported");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocationStatus("granted");
      },
      () => setLocationStatus("denied"),
      { enableHighAccuracy: true, timeout: 8000 },
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const { data, isLoading } = useQuery({
    queryKey: ["workshops-public", coords],
    queryFn: () => workshopApi.list(1, 50, coords ?? undefined),
  });

  const workshops = data?.data ?? [];
  const hasFilter = search || onlyActive;

  const filtered = workshops.filter((w) => {
    const q = search.toLowerCase();
    return (
      (!search ||
        w.name.toLowerCase().includes(q) ||
        w.address.toLowerCase().includes(q)) &&
      (!onlyActive || w.is_active)
    );
  });

  return (
    <div className="space-y-6">
      {/* Hero */}
      <div className="bg-[var(--navy)] rounded-2xl px-6 py-10 sm:py-12 text-center relative overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none opacity-20"
          style={{
            backgroundImage: "radial-gradient(white 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />
        <h1 className="relative text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Temukan Bengkel <span className="text-red-400">Terpercaya</span>
        </h1>
        <p className="relative text-blue-200 mt-2 text-sm max-w-md mx-auto">
          Booking servis kendaraan Anda dengan mudah dan cepat
        </p>
      </div>

      {/* Filter bar */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama bengkel atau kota..."
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0B1C3D] focus:border-transparent transition"
          />
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

      {/* Location status banner */}
      {locationStatus === "loading" && (
        <div className="flex items-center gap-2 text-xs text-gray-500 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5">
          <LocateFixed className="w-3.5 h-3.5 animate-pulse" />
          Mendeteksi lokasi Anda...
        </div>
      )}
      {locationStatus === "granted" && coords && (
        <div className="flex items-center gap-2 text-xs text-[var(--navy)] bg-blue-50 border border-blue-100 rounded-xl px-4 py-2.5">
          <Navigation className="w-3.5 h-3.5" />
          Menampilkan bengkel dari yang paling dekat dengan lokasi Anda
        </div>
      )}
      {locationStatus === "denied" && (
        <button
          onClick={requestLocation}
          className="flex items-center gap-2 text-xs text-gray-500 hover:text-gray-700 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl px-4 py-2.5 transition w-full sm:w-auto">
          <LocateFixed className="w-3.5 h-3.5" />
          Aktifkan lokasi biar lihat bengkel terdekat
        </button>
      )}

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
