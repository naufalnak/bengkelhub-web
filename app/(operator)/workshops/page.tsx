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
} from "lucide-react";
import { workshopApi } from "@/lib/api";
import { WorkshopModal } from "@/components/operator/WorkshopModal";
import type { Workshop } from "@/lib/types";

// ─── Workshop card ────────────────────────────────────────────────────────────

function WorkshopCard({
  workshop,
  onEdit,
  onDelete,
  deleting,
}: {
  workshop: Workshop;
  onEdit: () => void;
  onDelete: () => void;
  deleting: boolean;
}) {
  return (
    <div
      className="rounded-2xl p-5 flex flex-col gap-4 transition hover:border-white/15"
      style={{
        background: "#0b1628",
        border: "1px solid rgba(255,255,255,0.07)",
      }}>
      {/* Top */}
      <div className="flex items-start gap-3">
        <div className="w-11 h-11 rounded-xl bg-red-600/15 border border-red-600/25 flex items-center justify-center flex-shrink-0">
          <Store className="w-5 h-5 text-red-400" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-white font-bold text-base truncate">
            {workshop.name}
          </h3>
          <div className="flex items-center gap-1.5 mt-1">
            <span
              className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold"
              style={{
                color: workshop.is_active ? "#22c55e" : "#6b7280",
                background: workshop.is_active
                  ? "rgba(34,197,94,0.10)"
                  : "rgba(107,114,128,0.10)",
                border: `1px solid ${workshop.is_active ? "rgba(34,197,94,0.25)" : "rgba(107,114,128,0.20)"}`,
              }}>
              {workshop.is_active ? "Aktif" : "Nonaktif"}
            </span>
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="space-y-2">
        <div className="flex items-start gap-2 text-slate-400 text-sm">
          <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5 text-slate-600" />
          <span className="line-clamp-2">
            {workshop.address}, {workshop.city}
          </span>
        </div>
        <div className="flex items-center gap-2 text-slate-400 text-sm">
          <Phone className="w-4 h-4 flex-shrink-0 text-slate-600" />
          <span>{workshop.phone}</span>
        </div>
      </div>

      {/* Description */}
      <p className="text-slate-500 text-xs line-clamp-2 leading-relaxed">
        {workshop.description}
      </p>

      {/* Actions */}
      <div
        className="flex gap-2 pt-3"
        style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <button
          onClick={onEdit}
          className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-sm font-semibold text-slate-300 hover:text-white transition"
          style={{
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.08)",
          }}>
          <Pencil className="w-3.5 h-3.5" />
          Edit
        </button>
        <button
          onClick={onDelete}
          disabled={deleting}
          className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-sm font-semibold text-red-400 hover:text-red-300 hover:bg-red-500/10 transition disabled:opacity-50"
          style={{ border: "1px solid rgba(220,38,38,0.20)" }}>
          {deleting ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Trash2 className="w-3.5 h-3.5" />
          )}
          Hapus
        </button>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function WorkshopsPage() {
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedWorkshop, setSelectedWorkshop] = useState<Workshop | null>(
    null,
  );
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const { data: workshops = [], isLoading } = useQuery({
    queryKey: ["operator-workshops"],
    queryFn: workshopApi.list,
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      setDeletingId(id);
      await workshopApi.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["operator-workshops"] });
      setDeletingId(null);
    },
    onError: () => setDeletingId(null),
  });

  const handleEdit = (workshop: Workshop) => {
    setSelectedWorkshop(workshop);
    setModalOpen(true);
  };

  const handleCreate = () => {
    setSelectedWorkshop(null);
    setModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (!confirm("Yakin ingin menghapus workshop ini?")) return;
    deleteMutation.mutate(id);
  };

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Workshop
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              Kelola bengkel yang Anda daftarkan
            </p>
          </div>
          <button
            onClick={handleCreate}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white bg-red-600 hover:bg-red-700 transition"
            style={{ boxShadow: "0 4px 14px rgba(220,38,38,0.25)" }}>
            <Plus className="w-4 h-4" />
            Tambah Workshop
          </button>
        </div>

        {/* List */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="h-64 rounded-2xl animate-pulse"
                style={{ background: "#0b1628" }}
              />
            ))}
          </div>
        ) : workshops.length === 0 ? (
          <div
            className="rounded-2xl p-12 flex flex-col items-center gap-4 text-center"
            style={{
              background: "rgba(220,38,38,0.05)",
              border: "1px dashed rgba(220,38,38,0.20)",
            }}>
            <Store className="w-12 h-12 text-red-600/40" />
            <div>
              <p className="text-white font-semibold">Belum ada workshop</p>
              <p className="text-slate-500 text-sm mt-1">
                Tambahkan workshop pertama Anda untuk mulai menerima pesanan
              </p>
            </div>
            <button
              onClick={handleCreate}
              className="px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-red-600 hover:bg-red-700 transition"
              style={{ boxShadow: "0 4px 14px rgba(220,38,38,0.25)" }}>
              <Plus className="w-4 h-4 inline mr-2" />
              Tambah Workshop
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {workshops.map((workshop) => (
              <WorkshopCard
                key={workshop.id}
                workshop={workshop}
                onEdit={() => handleEdit(workshop)}
                onDelete={() => handleDelete(workshop.id)}
                deleting={deletingId === workshop.id}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      <WorkshopModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        workshop={selectedWorkshop}
      />
    </>
  );
}
