"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ClipboardList, Wrench, ChevronDown, X } from "lucide-react";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { orderApi } from "@/lib/api";
import type { Order, OrderStatus } from "@/lib/types";

const STATUS_CONFIG: Record<
  OrderStatus,
  { label: string; color: string; bg: string; border: string }
> = {
  pending: {
    label: "Menunggu",
    color: "#f59e0b",
    bg: "rgba(245,158,11,0.10)",
    border: "rgba(245,158,11,0.25)",
  },
  confirmed: {
    label: "Dikonfirmasi",
    color: "#3b82f6",
    bg: "rgba(59,130,246,0.10)",
    border: "rgba(59,130,246,0.25)",
  },
  in_progress: {
    label: "Diproses",
    color: "#a855f7",
    bg: "rgba(168,85,247,0.10)",
    border: "rgba(168,85,247,0.25)",
  },
  done: {
    label: "Selesai",
    color: "#22c55e",
    bg: "rgba(34,197,94,0.10)",
    border: "rgba(34,197,94,0.25)",
  },
  cancelled: {
    label: "Dibatalkan",
    color: "#6b7280",
    bg: "rgba(107,114,128,0.10)",
    border: "rgba(107,114,128,0.25)",
  },
};

const FILTER_STATUSES: (OrderStatus | "all")[] = [
  "all",
  "pending",
  "confirmed",
  "in_progress",
  "done",
  "cancelled",
];

function StatusBadge({ status }: { status: OrderStatus }) {
  const cfg = STATUS_CONFIG[status];
  return (
    <span
      className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap"
      style={{
        color: cfg.color,
        background: cfg.bg,
        border: `1px solid ${cfg.border}`,
      }}>
      {cfg.label}
    </span>
  );
}

function BookingCard({
  order,
  onCancel,
  cancelling,
}: {
  order: Order;
  onCancel: () => void;
  cancelling: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const canCancel = order.status === "pending";

  return (
    <div
      className="rounded-2xl overflow-hidden transition hover:border-white/12"
      style={{
        background: "#0b1628",
        border: "1px solid rgba(255,255,255,0.07)",
      }}>
      {/* Main */}
      <div
        className="flex items-center gap-4 px-5 py-4 cursor-pointer"
        onClick={() => setExpanded(!expanded)}>
        <div className="w-10 h-10 rounded-xl bg-white/05 flex items-center justify-center flex-shrink-0">
          <Wrench className="w-4 h-4 text-slate-500" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-white font-semibold text-sm truncate">
            {order.vehicle_type}
          </p>
          <p className="text-slate-500 text-xs truncate mt-0.5">
            {order.complaint}
          </p>
        </div>
        <div className="hidden sm:block text-right flex-shrink-0">
          <p className="text-slate-300 text-xs font-medium">
            {format(new Date(order.booking_date), "dd MMM yyyy", {
              locale: idLocale,
            })}
          </p>
        </div>
        <div className="flex-shrink-0">
          <StatusBadge status={order.status} />
        </div>
        <ChevronDown
          className={`w-4 h-4 text-slate-600 flex-shrink-0 transition-transform ${expanded ? "rotate-180" : ""}`}
        />
      </div>

      {/* Expanded */}
      {expanded && (
        <div
          className="px-5 pb-5"
          style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-4">
            {[
              { label: "ID Order", value: `#${order.id.slice(0, 8)}` },
              {
                label: "Tanggal Booking",
                value: format(new Date(order.booking_date), "dd MMM yyyy", {
                  locale: idLocale,
                }),
              },
              { label: "Status", value: STATUS_CONFIG[order.status].label },
              {
                label: "Dibuat",
                value: format(new Date(order.created_at), "dd MMM yyyy HH:mm", {
                  locale: idLocale,
                }),
              },
            ].map(({ label, value }) => (
              <div
                key={label}
                className="rounded-xl px-3 py-2.5"
                style={{ background: "rgba(255,255,255,0.03)" }}>
                <p className="text-slate-500 text-xs">{label}</p>
                <p className="text-white text-sm font-medium mt-0.5">{value}</p>
              </div>
            ))}

            <div
              className="col-span-2 sm:col-span-3 rounded-xl px-3 py-2.5"
              style={{ background: "rgba(255,255,255,0.03)" }}>
              <p className="text-slate-500 text-xs">Keluhan</p>
              <p className="text-white text-sm mt-0.5 leading-relaxed">
                {order.complaint}
              </p>
            </div>
          </div>

          {/* Cancel button */}
          {canCancel && (
            <div className="mt-4 flex justify-end">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onCancel();
                }}
                disabled={cancelling}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-red-400 hover:text-red-300 hover:bg-red-500/10 transition disabled:opacity-50"
                style={{ border: "1px solid rgba(220,38,38,0.20)" }}>
                <X className="w-4 h-4" />
                {cancelling ? "Membatalkan..." : "Batalkan Booking"}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function BookingsPage() {
  const queryClient = useQueryClient();
  const [filterStatus, setFilterStatus] = useState<OrderStatus | "all">("all");
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["my-orders"],
    queryFn: orderApi.myOrders,
  });

  const cancelMutation = useMutation({
    mutationFn: async (orderId: string) => {
      setCancellingId(orderId);
      return orderApi.cancel(orderId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-orders"] });
      setCancellingId(null);
    },
    onError: () => setCancellingId(null),
  });

  const counts = orders.reduce(
    (acc, o) => {
      acc[o.status] = (acc[o.status] ?? 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  const filtered = orders
    .filter((o) => filterStatus === "all" || o.status === filterStatus)
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    );

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">
          Riwayat Booking
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Pantau status servis kendaraan Anda
        </p>
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-2 flex-wrap">
        {FILTER_STATUSES.map((s) => {
          const count = s === "all" ? orders.length : (counts[s] ?? 0);
          const active = filterStatus === s;
          const cfg = s !== "all" ? STATUS_CONFIG[s] : null;
          return (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition"
              style={{
                background: active
                  ? cfg
                    ? cfg.bg
                    : "rgba(255,255,255,0.10)"
                  : "rgba(255,255,255,0.04)",
                border: `1px solid ${active ? (cfg ? cfg.border : "rgba(255,255,255,0.20)") : "rgba(255,255,255,0.07)"}`,
                color: active ? (cfg ? cfg.color : "#fff") : "#64748b",
              }}>
              {s === "all" ? "Semua" : STATUS_CONFIG[s].label}
              {count > 0 && (
                <span
                  className="px-1.5 py-0.5 rounded-md text-xs"
                  style={{
                    background: active
                      ? "rgba(255,255,255,0.15)"
                      : "rgba(255,255,255,0.06)",
                    color: active ? "#fff" : "#475569",
                  }}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* List */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="h-20 rounded-2xl animate-pulse"
              style={{ background: "#0b1628" }}
            />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div
          className="rounded-2xl p-12 flex flex-col items-center gap-3 text-center"
          style={{
            background: "rgba(255,255,255,0.02)",
            border: "1px dashed rgba(255,255,255,0.08)",
          }}>
          <ClipboardList className="w-10 h-10 text-slate-700" />
          <div>
            <p className="text-white font-semibold">
              {filterStatus !== "all"
                ? "Tidak ada booking dengan status ini"
                : "Belum ada booking"}
            </p>
            <p className="text-slate-500 text-sm mt-1">
              {filterStatus !== "all"
                ? "Coba filter status yang lain"
                : "Cari bengkel dan buat booking pertama Anda"}
            </p>
          </div>
          {filterStatus === "all" && (
            <a
              href="/workshops"
              className="px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-red-600 hover:bg-red-700 transition"
              style={{ boxShadow: "0 4px 14px rgba(220,38,38,0.25)" }}>
              Cari Bengkel
            </a>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((order) => (
            <BookingCard
              key={order.id}
              order={order}
              onCancel={() => {
                if (!confirm("Yakin ingin membatalkan booking ini?")) return;
                cancelMutation.mutate(order.id);
              }}
              cancelling={cancellingId === order.id}
            />
          ))}
        </div>
      )}
    </div>
  );
}
