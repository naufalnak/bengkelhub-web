"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Plus,
  Car,
  Search,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  User,
} from "lucide-react";
import { vehicleApi, ApiRequestError } from "@/lib/api";
import { VehicleModal } from "@/components/operator/VehicleModal";
import { WorkshopSwitcher } from "@/components/operator/WorkshopSwitcher";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { EmptyState } from "@/components/ui/EmptyState";
import { SkeletonRow } from "@/components/ui/PageLoader";
import { Header } from "@/components/layout/Header";
import { useActiveWorkshopStore } from "@/store/workshop";
import { cn, btnPrimary, btnOutline, inputClass } from "@/lib/utils";
import { toast } from "@/components/ui/Toast";
import type { Vehicle } from "@/lib/types";

const PAGE_SIZE = 10;

export default function VehiclesPage() {
  const queryClient = useQueryClient();
  const activeWorkshopId = useActiveWorkshopStore((s) => s.activeWorkshopId);

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selected, setSelected] = useState<Vehicle | null>(null);
  const [toDelete, setToDelete] = useState<Vehicle | null>(null);

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["vehicles", activeWorkshopId, search, page],
    queryFn: () => vehicleApi.list(activeWorkshopId!, search, page, PAGE_SIZE),
    enabled: !!activeWorkshopId,
  });

  const vehicles = data?.data ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const deleteMutation = useMutation({
    mutationFn: (id: string) => vehicleApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vehicles", activeWorkshopId] });
      toast.success("Kendaraan berhasil dihapus");
      setConfirmOpen(false);
      setToDelete(null);
    },
    onError: (err: unknown) => {
      const message =
        err instanceof ApiRequestError ? err.message : "Gagal menghapus kendaraan";
      toast.error(message);
    },
  });

  return (
    <>
      <Header
        title="Kendaraan"
        subtitle="Kelola data kendaraan milik pelanggan bengkel Anda"
      />

      <div className="p-6 space-y-6">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
          <WorkshopSwitcher />

          <div className="flex gap-3 flex-1 sm:flex-none sm:justify-end">
            <div className="relative flex-1 sm:w-64">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder="Cari plat, merek, model..."
                className={cn(inputClass, "pl-10")}
              />
            </div>
            <button
              disabled={!activeWorkshopId}
              onClick={() => {
                setSelected(null);
                setModalOpen(true);
              }}
              className={cn(btnPrimary, "px-4 py-2.5 text-sm whitespace-nowrap")}>
              <Plus className="w-4 h-4" /> Tambah
            </button>
          </div>
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
          ) : vehicles.length === 0 ? (
            <EmptyState
              icon={Car}
              title={search ? "Kendaraan tidak ditemukan" : "Belum ada kendaraan"}
              description={
                search
                  ? "Coba ubah kata kunci pencarian"
                  : "Tambahkan kendaraan pelanggan pertama Anda"
              }
              action={
                !search && (
                  <button
                    onClick={() => {
                      setSelected(null);
                      setModalOpen(true);
                    }}
                    className={cn(btnPrimary, "px-5 py-2.5 text-sm")}>
                    <Plus className="w-4 h-4" /> Tambah Kendaraan
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
                        Kendaraan
                      </th>
                      <th className="text-left font-semibold text-gray-500 px-4 py-3">
                        Plat Nomor
                      </th>
                      <th className="text-left font-semibold text-gray-500 px-4 py-3">
                        Pemilik
                      </th>
                      <th className="text-left font-semibold text-gray-500 px-4 py-3">
                        Detail
                      </th>
                      <th className="text-right font-semibold text-gray-500 px-4 py-3">
                        Aksi
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {vehicles.map((v) => (
                      <tr
                        key={v.id}
                        className="border-b border-gray-100 last:border-0 hover:bg-gray-50 transition">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 flex-shrink-0">
                              <Car className="w-4 h-4" />
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900">
                                {v.brand} {v.model}
                              </p>
                              {v.year ? (
                                <p className="text-xs text-gray-400">{v.year}</p>
                              ) : null}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="font-mono font-semibold text-gray-700 bg-gray-100 px-2 py-1 rounded-md text-xs">
                            {v.plate_number}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-600">
                          <div className="flex items-center gap-1.5">
                            <User className="w-3.5 h-3.5 text-gray-400" />
                            {v.customer?.name ?? "—"}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-gray-500">
                          {[v.color, v.engine_cc ? `${v.engine_cc}cc` : null]
                            .filter(Boolean)
                            .join(" · ") || "—"}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => {
                                setSelected(v);
                                setModalOpen(true);
                              }}
                              className="p-1.5 rounded-lg text-gray-400 hover:text-[#0B1C3D] hover:bg-gray-100 transition">
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                setToDelete(v);
                                setConfirmOpen(true);
                              }}
                              className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 bg-gray-50">
                <p className="text-xs text-gray-500">
                  Menampilkan {vehicles.length} dari {total} kendaraan
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
        <VehicleModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          workshopId={activeWorkshopId}
          vehicle={selected}
        />
      )}

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={() => toDelete && deleteMutation.mutate(toDelete.id)}
        title="Hapus Kendaraan"
        description={`Yakin ingin menghapus kendaraan "${toDelete?.plate_number}"? Riwayat servis terkait bisa ikut terdampak.`}
        confirmLabel="Ya, Hapus"
        loading={deleteMutation.isPending}
      />
    </>
  );
}
