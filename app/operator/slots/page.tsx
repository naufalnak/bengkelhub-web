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
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { workshopApi, slotApi, ApiRequestError } from "@/lib/api";
import { SlotModal } from "@/components/operator/SlotModal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { EmptyState } from "@/components/ui/EmptyState";
import { SectionLoader } from "@/components/ui/PageLoader";
import { Badge } from "@/components/ui/Badge";
import { Header } from "@/components/layout/Header";
import { cn } from "@/lib/utils";
import { toast } from "@/components/ui/Toast";
import type { Workshop, SlotWithAvailability } from "@/lib/types";

function SlotRow({
  slot,
  onDelete,
}: {
  slot: SlotWithAvailability;
  onDelete: () => void;
}) {
  const isPast = new Date(slot.date) < new Date();

  return (
    <div className="flex items-center gap-4 px-4 py-3 border-b border-gray-100 last:border-0 hover:bg-gray-50 transition">
      <span className="w-28 text-center text-xs font-bold text-[#0B1C3D] bg-gray-100 py-1.5 rounded-lg flex-shrink-0">
        {format(new Date(slot.date), "dd MMM yyyy", { locale: idLocale })}
      </span>
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <Clock className="w-4 h-4 text-gray-400 flex-shrink-0" />
        <span className="text-sm font-medium text-gray-900">
          {format(new Date(slot.date), "HH:mm")}
        </span>
      </div>
      <div className="flex items-center gap-1.5 text-gray-500 text-sm">
        <Users className="w-4 h-4 text-gray-400" />
        <span>
          <span className="font-semibold text-gray-900">
            {slot.booked}/{slot.max_booking}
          </span>{" "}
          terisi
        </span>
      </div>
      <Badge variant={isPast ? "default" : slot.available ? "success" : "warning"}>
        {isPast ? "Lewat" : slot.available ? "Tersedia" : "Penuh"}
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
  const [toDelete, setToDelete] = useState<SlotWithAvailability | null>(null);

  const { data: slots = [], isLoading } = useQuery({
    queryKey: ["slots", workshop.id],
    queryFn: () => slotApi.listByWorkshop(workshop.id),
  });

  const deleteMutation = useMutation({
    mutationFn: (slotId: string) => slotApi.delete(slotId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["slots", workshop.id] });
      toast.success("Slot berhasil dihapus");
      setConfirmOpen(false);
      setToDelete(null);
    },
    onError: (err: unknown) => {
      const message =
        err instanceof ApiRequestError ? err.message : "Gagal menghapus slot";
      toast.error(message);
    },
  });

  const sorted = [...slots].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  );

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
              <p className="text-xs text-gray-400">{slots.length} slot</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-red-600 hover:bg-red-700 transition">
              <Plus className="w-3.5 h-3.5" /> Generate Slot
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
              description="Generate slot booking untuk workshop ini"
              action={
                <button
                  onClick={() => setModalOpen(true)}
                  className="text-sm text-red-600 hover:text-red-700 font-semibold transition">
                  + Generate slot pertama
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
        description={
          toDelete
            ? `Hapus slot tanggal ${format(new Date(toDelete.date), "dd MMM yyyy, HH:mm", { locale: idLocale })}?`
            : ""
        }
        confirmLabel="Ya, Hapus"
        loading={deleteMutation.isPending}
      />
    </>
  );
}

export default function SlotsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["operator-workshops"],
    queryFn: () => workshopApi.myWorkshops(1, 50),
  });
  const workshops = data?.data ?? [];

  return (
    <>
      <Header
        title="Jadwal & Slot"
        subtitle="Atur slot booking per tanggal untuk workshop Anda"
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
