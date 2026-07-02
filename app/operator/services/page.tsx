"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { Plus, Wrench, ChevronLeft, ChevronRight, User } from "lucide-react";
import { serviceApi } from "@/lib/api";
import { ServiceModal } from "@/components/operator/ServiceModal";
import { WorkshopSwitcher } from "@/components/operator/WorkshopSwitcher";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { SkeletonRow } from "@/components/ui/PageLoader";
import { Header } from "@/components/layout/Header";
import { useActiveWorkshopStore } from "@/store/workshop";
import { cn, btnPrimary, btnOutline, formatDateShort } from "@/lib/utils";
import { serviceStatusVariant, serviceStatusLabel } from "@/lib/variants";
import type { ServiceStatus } from "@/lib/types";

const PAGE_SIZE = 10;
const FILTER_STATUSES: (ServiceStatus | "all")[] = [
  "all",
  "pending",
  "in_progress",
  "done",
  "cancelled",
];

export default function ServicesPage() {
  const router = useRouter();
  const activeWorkshopId = useActiveWorkshopStore((s) => s.activeWorkshopId);

  const [filterStatus, setFilterStatus] = useState<ServiceStatus | "all">("all");
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["services", activeWorkshopId, filterStatus, page],
    queryFn: () =>
      serviceApi.list(
        activeWorkshopId!,
        filterStatus === "all" ? "" : filterStatus,
        page,
        PAGE_SIZE,
      ),
    enabled: !!activeWorkshopId,
  });

  const services = data?.data ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <>
      <Header
        title="Servis"
        subtitle="Kelola pekerjaan servis kendaraan pelanggan"
      />

      <div className="p-6 space-y-6">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
          <WorkshopSwitcher />
          <button
            disabled={!activeWorkshopId}
            onClick={() => setModalOpen(true)}
            className={cn(btnPrimary, "px-4 py-2.5 text-sm whitespace-nowrap")}>
            <Plus className="w-4 h-4" /> Servis Baru
          </button>
        </div>

        {/* Filter tabs */}
        <div className="flex items-center gap-2 flex-wrap">
          {FILTER_STATUSES.map((s) => {
            const active = filterStatus === s;
            return (
              <button
                key={s}
                onClick={() => {
                  setFilterStatus(s);
                  setPage(1);
                }}
                className={cn(
                  "px-3 py-1.5 rounded-xl text-xs font-semibold border transition",
                  active
                    ? "bg-[var(--navy)] text-white border-[var(--navy)]"
                    : "bg-white text-gray-500 border-gray-200 hover:border-gray-300 hover:text-gray-700",
                )}>
                {s === "all" ? "Semua" : serviceStatusLabel[s]}
              </button>
            );
          })}
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          {!activeWorkshopId ? null : isLoading ? (
            <table className="w-full">
              <tbody>
                {Array.from({ length: 5 }).map((_, i) => (
                  <SkeletonRow key={i} />
                ))}
              </tbody>
            </table>
          ) : services.length === 0 ? (
            <EmptyState
              icon={Wrench}
              title={
                filterStatus !== "all"
                  ? "Tidak ada servis dengan status ini"
                  : "Belum ada servis"
              }
              description={
                filterStatus !== "all"
                  ? "Coba pilih filter status lain"
                  : "Buat catatan servis pertama untuk kendaraan pelanggan"
              }
              action={
                filterStatus === "all" && (
                  <button
                    onClick={() => setModalOpen(true)}
                    className={cn(btnPrimary, "px-5 py-2.5 text-sm")}>
                    <Plus className="w-4 h-4" /> Servis Baru
                  </button>
                )
              }
            />
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="text-left font-semibold text-gray-500 px-4 py-3">
                        No. Servis
                      </th>
                      <th className="text-left font-semibold text-gray-500 px-4 py-3">
                        Kendaraan
                      </th>
                      <th className="text-left font-semibold text-gray-500 px-4 py-3">
                        Pelanggan
                      </th>
                      <th className="text-left font-semibold text-gray-500 px-4 py-3">
                        Keluhan
                      </th>
                      <th className="text-left font-semibold text-gray-500 px-4 py-3">
                        Tanggal
                      </th>
                      <th className="text-left font-semibold text-gray-500 px-4 py-3">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {services.map((s) => (
                      <tr
                        key={s.id}
                        onClick={() => router.push(`/operator/services/${s.id}`)}
                        className="border-b border-gray-100 last:border-0 hover:bg-gray-50 transition cursor-pointer">
                        <td className="px-4 py-3 font-mono text-xs font-semibold text-gray-700">
                          {s.service_no}
                        </td>
                        <td className="px-4 py-3">
                          {s.vehicle ? (
                            <div>
                              <p className="font-semibold text-gray-900">
                                {s.vehicle.plate_number}
                              </p>
                              <p className="text-xs text-gray-400">
                                {s.vehicle.brand} {s.vehicle.model}
                              </p>
                            </div>
                          ) : (
                            "—"
                          )}
                        </td>
                        <td className="px-4 py-3 text-gray-600">
                          <div className="flex items-center gap-1.5">
                            <User className="w-3.5 h-3.5 text-gray-400" />
                            {s.vehicle?.customer?.name ?? "—"}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-gray-500 max-w-xs truncate">
                          {s.complaint}
                        </td>
                        <td className="px-4 py-3 text-gray-500">
                          {formatDateShort(s.start_date)}
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant={serviceStatusVariant[s.status]}>
                            {serviceStatusLabel[s.status]}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 bg-gray-50">
                <p className="text-xs text-gray-500">
                  Menampilkan {services.length} dari {total} servis
                  {isFetching && " · memuat..."}
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page <= 1}
                    className={cn(
                      btnOutline,
                      "w-8 h-8 p-0 text-xs disabled:opacity-40",
                    )}>
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-xs font-medium text-gray-600">
                    {page} / {totalPages}
                  </span>
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page >= totalPages}
                    className={cn(
                      btnOutline,
                      "w-8 h-8 p-0 text-xs disabled:opacity-40",
                    )}>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {activeWorkshopId && (
        <ServiceModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          workshopId={activeWorkshopId}
        />
      )}
    </>
  );
}
