"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Plus,
  Store,
  MapPin,
  Phone,
  Pencil,
  Trash2,
  Loader2,
  Wrench,
} from "lucide-react";
import { workshopApi } from "@/lib/api";
import { WorkshopModal } from "@/components/operator/WorkshopModal";
import { ServiceOfferingModal } from "@/components/operator/ServiceOfferingModal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { EmptyState } from "@/components/ui/EmptyState";
import { SkeletonCard } from "@/components/ui/PageLoader";
import { Badge } from "@/components/ui/Badge";
import { Header } from "@/components/layout/Header";
import { cn, btnPrimary, btnOutline } from "@/lib/utils";
import { toast } from "@/components/ui/Toast";
import type { Workshop } from "@/lib/types";

function WorkshopCard({
  workshop,
  onEdit,
  onDelete,
  onManageServices,
}: {
  workshop: Workshop;
  onEdit: () => void;
  onDelete: () => void;
  onManageServices: () => void;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5 flex flex-col gap-4 hover:shadow-md transition">
      <div className="flex items-start gap-3">
        <div className="w-11 h-11 rounded-xl bg-red-50 flex items-center justify-center flex-shrink-0">
          <Store className="w-5 h-5 text-red-600" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-bold text-gray-900 truncate">
            {workshop.name}
          </h3>
          <div className="mt-1">
            <Badge variant={workshop.is_active ? "success" : "default"}>
              {workshop.is_active ? "Aktif" : "Nonaktif"}
            </Badge>
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

      <p className="text-gray-400 text-xs line-clamp-2 leading-relaxed">
        {workshop.description}
      </p>

      <div className="flex gap-2 pt-1 border-t border-gray-100">
        <button
          onClick={onManageServices}
          className={cn(btnOutline, "flex-1 py-2 text-xs")}>
          <Wrench className="w-3.5 h-3.5" /> Layanan
        </button>
        <button
          onClick={onEdit}
          className={cn(btnOutline, "flex-1 py-2 text-xs")}>
          <Pencil className="w-3.5 h-3.5" /> Edit
        </button>
        <button
          onClick={onDelete}
          className="flex-1 py-2 text-xs rounded-xl font-semibold text-red-600 bg-red-50 hover:bg-red-100 transition flex items-center justify-center gap-1.5">
          <Trash2 className="w-3.5 h-3.5" /> Hapus
        </button>
      </div>
    </div>
  );
}

export default function WorkshopsPage() {
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selected, setSelected] = useState<Workshop | null>(null);
  const [toDelete, setToDelete] = useState<Workshop | null>(null);
  const [servicesFor, setServicesFor] = useState<Workshop | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["operator-workshops"],
    queryFn: () => workshopApi.myWorkshops(),
  });

  const workshops = data?.data ?? [];

  const deleteMutation = useMutation({
    mutationFn: (id: string) => workshopApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["operator-workshops"] });
      toast.success("Workshop berhasil dihapus");
      setConfirmOpen(false);
      setToDelete(null);
    },
    onError: (err: Error) => {
      toast.error(err.message ?? "Gagal menghapus workshop");
    },
  });

  return (
    <>
      <Header title="Workshop" subtitle="Kelola bengkel yang Anda daftarkan" />

      <div className="p-6 space-y-6">
        {/* Toolbar */}
        <div className="flex justify-end">
          <button
            onClick={() => {
              setSelected(null);
              setModalOpen(true);
            }}
            className={cn(btnPrimary, "px-4 py-2.5 text-sm")}>
            <Plus className="w-4 h-4" /> Tambah Workshop
          </button>
        </div>

        {/* Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : workshops.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200">
            <EmptyState
              icon={Store}
              title="Belum ada workshop"
              description="Tambahkan workshop pertama Anda untuk mulai menerima pesanan"
              action={
                <button
                  onClick={() => {
                    setSelected(null);
                    setModalOpen(true);
                  }}
                  className={cn(btnPrimary, "px-5 py-2.5 text-sm")}>
                  <Plus className="w-4 h-4" /> Tambah Workshop
                </button>
              }
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {workshops.map((w) => (
              <WorkshopCard
                key={w.id}
                workshop={w}
                onEdit={() => {
                  setSelected(w);
                  setModalOpen(true);
                }}
                onDelete={() => {
                  setToDelete(w);
                  setConfirmOpen(true);
                }}
                onManageServices={() => setServicesFor(w)}
              />
            ))}
          </div>
        )}
      </div>

      <WorkshopModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        workshop={selected}
      />

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={() => toDelete && deleteMutation.mutate(toDelete.id)}
        title="Hapus Workshop"
        description={`Yakin ingin menghapus "${toDelete?.name}"? Tindakan ini tidak bisa dibatalkan.`}
        confirmLabel="Ya, Hapus"
        loading={deleteMutation.isPending}
      />

      {servicesFor && (
        <ServiceOfferingModal
          open={!!servicesFor}
          onClose={() => setServicesFor(null)}
          workshopId={servicesFor.id}
          workshopName={servicesFor.name}
        />
      )}
    </>
  );
}
