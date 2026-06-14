"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Plus,
  CalendarClock,
  Clock,
  Users,
  Trash2,
  Loader2,
  ChevronDown,
} from "lucide-react";
import { workshopApi, slotApi } from "@/lib/api";
import { SlotModal } from "@/components/operator/SlotModal";
import type { Workshop, Slot } from "@/lib/types";

const DAYS = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];

const DAY_COLOR: Record<number, { bg: string; border: string; text: string }> =
  {
    0: {
      bg: "rgba(239,68,68,0.10)",
      border: "rgba(239,68,68,0.25)",
      text: "#f87171",
    }, // Minggu
    1: {
      bg: "rgba(59,130,246,0.10)",
      border: "rgba(59,130,246,0.25)",
      text: "#60a5fa",
    }, // Senin
    2: {
      bg: "rgba(16,185,129,0.10)",
      border: "rgba(16,185,129,0.25)",
      text: "#34d399",
    }, // Selasa
    3: {
      bg: "rgba(245,158,11,0.10)",
      border: "rgba(245,158,11,0.25)",
      text: "#fbbf24",
    }, // Rabu
    4: {
      bg: "rgba(168,85,247,0.10)",
      border: "rgba(168,85,247,0.25)",
      text: "#c084fc",
    }, // Kamis
    5: {
      bg: "rgba(20,184,166,0.10)",
      border: "rgba(20,184,166,0.25)",
      text: "#2dd4bf",
    }, // Jumat
    6: {
      bg: "rgba(249,115,22,0.10)",
      border: "rgba(249,115,22,0.25)",
      text: "#fb923c",
    }, // Sabtu
  };

// ─── Slot row ─────────────────────────────────────────────────────────────────

function SlotRow({
  slot,
  onDelete,
  deleting,
}: {
  slot: Slot;
  onDelete: () => void;
  deleting: boolean;
}) {
  const dayColor = DAY_COLOR[slot.day_of_week];

  return (
    <div
      className="flex items-center gap-4 px-4 py-3.5 rounded-xl transition hover:bg-white/03"
      style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
      {/* Hari badge */}
      <div
        className="w-20 flex-shrink-0 text-center py-1.5 rounded-lg text-xs font-bold"
        style={{
          background: dayColor.bg,
          border: `1px solid ${dayColor.border}`,
          color: dayColor.text,
        }}>
        {DAYS[slot.day_of_week]}
      </div>

      {/* Jam */}
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <Clock className="w-4 h-4 text-slate-600 flex-shrink-0" />
        <span className="text-white text-sm font-medium">
          {slot.open_time} – {slot.close_time}
        </span>
      </div>

      {/* Kuota */}
      <div className="flex items-center gap-2">
        <Users className="w-4 h-4 text-slate-600" />
        <span className="text-slate-300 text-sm">
          <span className="text-white font-semibold">{slot.quota}</span> kuota
        </span>
      </div>

      {/* Status */}
      <span
        className="text-xs font-semibold px-2.5 py-1 rounded-lg"
        style={{
          color: slot.is_active ? "#22c55e" : "#6b7280",
          background: slot.is_active
            ? "rgba(34,197,94,0.10)"
            : "rgba(107,114,128,0.10)",
          border: `1px solid ${slot.is_active ? "rgba(34,197,94,0.25)" : "rgba(107,114,128,0.20)"}`,
        }}>
        {slot.is_active ? "Aktif" : "Nonaktif"}
      </span>

      {/* Delete */}
      <button
        onClick={onDelete}
        disabled={deleting}
        className="p-2 rounded-lg text-slate-600 hover:text-red-400 hover:bg-red-500/10 transition disabled:opacity-40">
        {deleting ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Trash2 className="w-4 h-4" />
        )}
      </button>
    </div>
  );
}

// ─── Workshop section ─────────────────────────────────────────────────────────

function WorkshopSection({ workshop }: { workshop: Workshop }) {
  const queryClient = useQueryClient();
  const [expanded, setExpanded] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const { data: slots = [], isLoading } = useQuery({
    queryKey: ["slots", workshop.id],
    queryFn: () => slotApi.listByWorkshop(workshop.id),
  });

  const deleteMutation = useMutation({
    mutationFn: async (slotId: string) => {
      setDeletingId(slotId);
      await slotApi.delete(workshop.id, slotId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["slots", workshop.id] });
      setDeletingId(null);
    },
    onError: () => setDeletingId(null),
  });

  const handleDelete = (slotId: string) => {
    if (!confirm("Hapus slot ini?")) return;
    deleteMutation.mutate(slotId);
  };

  // Sort slots by day_of_week
  const sorted = [...slots].sort((a, b) => a.day_of_week - b.day_of_week);

  return (
    <>
      <div
        className="rounded-2xl overflow-hidden"
        style={{
          background: "#0b1628",
          border: "1px solid rgba(255,255,255,0.07)",
        }}>
        {/* Workshop header */}
        <div
          className="flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-white/02 transition"
          style={{
            borderBottom: expanded
              ? "1px solid rgba(255,255,255,0.07)"
              : "none",
          }}
          onClick={() => setExpanded(!expanded)}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-red-600/15 border border-red-600/25 flex items-center justify-center">
              <CalendarClock className="w-4 h-4 text-red-400" />
            </div>
            <div>
              <h3 className="text-white font-semibold text-sm">
                {workshop.name}
              </h3>
              <p className="text-slate-500 text-xs mt-0.5">
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
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-red-600 hover:bg-red-700 transition">
              <Plus className="w-3.5 h-3.5" />
              Tambah Slot
            </button>
            <ChevronDown
              className={`w-4 h-4 text-slate-500 transition-transform ${expanded ? "rotate-180" : ""}`}
            />
          </div>
        </div>

        {/* Slots list */}
        {expanded && (
          <div>
            {isLoading ? (
              <div className="p-4 space-y-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-14 rounded-xl animate-pulse"
                    style={{ background: "rgba(255,255,255,0.03)" }}
                  />
                ))}
              </div>
            ) : sorted.length === 0 ? (
              <div className="flex flex-col items-center py-10 gap-2">
                <CalendarClock className="w-8 h-8 text-slate-700" />
                <p className="text-slate-500 text-sm">Belum ada slot jadwal</p>
                <button
                  onClick={() => setModalOpen(true)}
                  className="text-xs text-red-400 hover:text-red-300 font-semibold transition mt-1">
                  + Tambah slot pertama
                </button>
              </div>
            ) : (
              <div className="p-2">
                {sorted.map((slot) => (
                  <SlotRow
                    key={slot.id}
                    slot={slot}
                    onDelete={() => handleDelete(slot.id)}
                    deleting={deletingId === slot.id}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <SlotModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        workshopId={workshop.id}
      />
    </>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function SlotsPage() {
  const { data: workshops = [], isLoading } = useQuery({
    queryKey: ["operator-workshops"],
    queryFn: workshopApi.list,
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">
          Jadwal & Slot
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Atur jam operasional dan kuota per hari untuk setiap workshop
        </p>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 2 }).map((_, i) => (
            <div
              key={i}
              className="h-48 rounded-2xl animate-pulse"
              style={{ background: "#0b1628" }}
            />
          ))}
        </div>
      ) : workshops.length === 0 ? (
        <div
          className="rounded-2xl p-12 flex flex-col items-center gap-3 text-center"
          style={{
            background: "rgba(220,38,38,0.05)",
            border: "1px dashed rgba(220,38,38,0.20)",
          }}>
          <CalendarClock className="w-12 h-12 text-red-600/40" />
          <div>
            <p className="text-white font-semibold">Belum ada workshop</p>
            <p className="text-slate-500 text-sm mt-1">
              Tambahkan workshop terlebih dahulu sebelum mengatur slot
            </p>
          </div>
          <a
            href="/operator/workshops"
            className="px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-red-600 hover:bg-red-700 transition">
            Ke Halaman Workshop
          </a>
        </div>
      ) : (
        <div className="space-y-4">
          {workshops.map((workshop) => (
            <WorkshopSection key={workshop.id} workshop={workshop} />
          ))}
        </div>
      )}
    </div>
  );
}
