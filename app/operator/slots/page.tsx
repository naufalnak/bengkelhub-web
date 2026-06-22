"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Plus,
  CalendarClock,
  Clock,
  Users,
  Trash2,
  ChevronDown,
} from "lucide-react";
import { workshopApi, slotApi } from "@/lib/api";
import { SlotModal } from "@/components/operator/SlotModal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { EmptyState } from "@/components/ui/EmptyState";
import { SectionLoader } from "@/components/ui/PageLoader";
import { Badge } from "@/components/ui/Badge";
import { Header } from "@/components/layout/Header";
import { cn } from "@/lib/utils";
import { toast } from "@/components/ui/Toast";
import type { Workshop, Slot } from "@/lib/types";

const DAYS = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];

function SlotRow({ slot, onDelete }: { slot: Slot; onDelete: () => void }) {
  return (
    <div className="flex items-center gap-4 px-4 py-3 border-b border-gray-100 last:border-0 hover:bg-gray-50 transition">
      <span className="w-20 text-center text-xs font-bold text-[#0B1C3D] bg-gray-100 py-1.5 rounded-lg flex-shrink-0">
        {DAYS[slot.day_of_week]}
      </span>
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <Clock className="w-4 h-4 text-gray-400 flex-shrink-0" />
        <span className="text-sm font-medium text-gray-900">
          {slot.open_time} – {slot.close_time}
        </span>
      </div>
      <div className="flex items-center gap-1.5 text-gray-500 text-sm">
        <Users className="w-4 h-4 text-gray-400" />
        <span>
          <span className="font-semibold text-gray-900">{slot.quota}</span>{" "}
          kuota
        </span>
      </div>
      <Badge variant={slot.is_active ? "success" : "default"}>
        {slot.is_active ? "Aktif" : "Nonaktif"}
      </Badge>
      <button
        onClick={onDelete}
        className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition">
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
}

function WorkshopSection({ workshop }: { workshop: Workshop }) {
  const queryClient = useQueryClient();
  const [expanded, setExpanded] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [toDelete, setToDelete] = useState<Slot | null>(null);

  const { data: slots = [], isLoading } = useQuery({
    queryKey: ["slots", workshop.id],
    queryFn: () => slotApi.listByWorkshop(workshop.id),
  });

  const deleteMutation = useMutation({
    mutationFn: (slotId: string) => slotApi.delete(workshop.id, slotId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["slots", workshop.id] });
      toast.success("Slot berhasil dihapus");
      setConfirmOpen(false);
      setToDelete(null);
    },
    onError: (err: Error) => {
      toast.error(err.message ?? "Gagal menghapus slot");
    },
  });

  const sorted = [...slots].sort((a, b) => a.day_of_week - b.day_of_week);

  return (
    <>
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        {/* Workshop header */}
        <div
          className="flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-gray-50 transition border-b border-gray-100"
          onClick={() => setExpanded(!expanded)}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-red-50 flex items-center justify-center">
              <CalendarClock className="w-4 h-4 text-red-600" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900">
                {workshop.name}
              </h3>
              <p className="text-xs text-gray-400">
                {workshop.city} · {slots.length} slot
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-red-600 hover:bg-red-700 transition">
              <Plus className="w-3.5 h-3.5" /> Tambah Slot
            </button>
            <ChevronDown
              className={cn(
                "w-4 h-4 text-gray-400 transition-transform",
                expanded && "rotate-180",
              )}
            />
          </div>
        </div>

        {/* Slot list */}
        {expanded &&
          (isLoading ? (
            <SectionLoader />
          ) : sorted.length === 0 ? (
            <EmptyState
              icon={CalendarClock}
              title="Belum ada slot"
              description="Tambahkan slot jadwal untuk workshop ini"
              action={
                <button
                  onClick={() => setModalOpen(true)}
                  className="text-sm text-red-600 hover:text-red-700 font-semibold transition">
                  + Tambah slot pertama
                </button>
              }
            />
          ) : (
            <div>
              {sorted.map((slot) => (
                <SlotRow
                  key={slot.id}
                  slot={slot}
                  onDelete={() => {
                    setToDelete(slot);
                    setConfirmOpen(true);
                  }}
                />
              ))}
            </div>
          ))}
      </div>

      <SlotModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        workshopId={workshop.id}
      />

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={() => toDelete && deleteMutation.mutate(toDelete.id)}
        title="Hapus Slot"
        description={`Hapus slot ${DAYS[toDelete?.day_of_week ?? 0]} ${toDelete?.open_time}–${toDelete?.close_time}?`}
        confirmLabel="Ya, Hapus"
        loading={deleteMutation.isPending}
      />
    </>
  );
}

export default function SlotsPage() {
  const { data: workshops = [], isLoading } = useQuery({
    queryKey: ["operator-workshops"],
    queryFn: workshopApi.list,
  });

  return (
    <>
      <Header
        title="Jadwal & Slot"
        subtitle="Atur jam operasional dan kuota per hari"
      />

      <div className="p-6 space-y-4">
        {isLoading ? (
          <SectionLoader />
        ) : workshops.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200">
            <EmptyState
              icon={CalendarClock}
              title="Belum ada workshop"
              description="Tambahkan workshop terlebih dahulu sebelum mengatur slot"
              action={
                <a
                  href="/operator/workshops"
                  className="px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-red-600 hover:bg-red-700 transition inline-flex items-center">
                  Ke Halaman Workshop
                </a>
              }
            />
          </div>
        ) : (
          workshops.map((w) => <WorkshopSection key={w.id} workshop={w} />)
        )}
      </div>
    </>
  );
}
