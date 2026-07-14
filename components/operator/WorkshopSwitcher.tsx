"use client";

import { useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Store, ChevronDown } from "lucide-react";
import { workshopApi } from "@/lib/api";
import { useActiveWorkshopStore } from "@/store/workshop";
import { SectionLoader } from "@/components/ui/PageLoader";
import { EmptyState } from "@/components/ui/EmptyState";

interface WorkshopSwitcherProps {
  /** Dipanggil tiap kali workshop aktif berubah (termasuk auto-select pertama kali) */
  onReady?: (workshopId: string) => void;
}

export function WorkshopSwitcher({ onReady }: WorkshopSwitcherProps) {
  const { activeWorkshopId, setActiveWorkshopId } = useActiveWorkshopStore();

  const { data, isLoading } = useQuery({
    queryKey: ["operator-my-workshops-picker"],
    queryFn: () => workshopApi.myWorkshops(1, 50),
  });

  const workshops = useMemo(() => data?.data ?? [], [data]);

  // Auto-select workshop pertama kalau belum ada yang dipilih,
  // atau kalau workshop yang sebelumnya dipilih udah gak ada (misal kehapus).
  useEffect(() => {
    if (isLoading) return;
    if (workshops.length === 0) return;

    const stillExists = workshops.some((w) => w.id === activeWorkshopId);
    if (!activeWorkshopId || !stillExists) {
      setActiveWorkshopId(workshops[0].id);
    }
  }, [isLoading, workshops, activeWorkshopId, setActiveWorkshopId]);

  useEffect(() => {
    if (activeWorkshopId) onReady?.(activeWorkshopId);
  }, [activeWorkshopId, onReady]);

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 p-4">
        <SectionLoader />
      </div>
    );
  }

  if (workshops.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200">
        <EmptyState
          icon={Store}
          title="Belum ada workshop"
          description="Tambahkan workshop dulu di menu Workshop sebelum bisa mengelola pelanggan, kendaraan, servis, dan invoice."
        />
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2.5 bg-white border border-gray-200 rounded-xl px-3.5 py-2.5 w-full sm:w-auto sm:min-w-[260px]">
      <Store className="w-4 h-4 text-gray-400 flex-shrink-0" />
      <select
        value={activeWorkshopId ?? ""}
        onChange={(e) => setActiveWorkshopId(e.target.value)}
        className="flex-1 bg-transparent text-sm font-semibold text-gray-900 focus:outline-none cursor-pointer">
        {workshops.map((w) => (
          <option key={w.id} value={w.id}>
            {w.name}
          </option>
        ))}
      </select>
      <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />
    </div>
  );
}
