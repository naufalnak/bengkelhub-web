"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ClipboardList,
  Wrench,
  ChevronDown,
  Filter,
  Search,
} from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { workshopApi, orderApi } from "@/lib/api";
import type { Order, OrderStatus } from "@/lib/types";

// ─── Config ───────────────────────────────────────────────────────────────────

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

// Status transitions yang valid dari operator
const NEXT_STATUSES: Partial<Record<OrderStatus, OrderStatus[]>> = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["in_progress", "cancelled"],
  in_progress: ["done"],
};

const ALL_FILTER_STATUSES: (OrderStatus | "all")[] = [
  "all",
  "pending",
  "confirmed",
  "in_progress",
  "done",
  "cancelled",
];

// ─── Status Badge ─────────────────────────────────────────────────────────────

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

// ─── Status Dropdown ──────────────────────────────────────────────────────────

function StatusDropdown({
  order,
  onUpdate,
  updating,
}: {
  order: Order;
  onUpdate: (status: OrderStatus) => void;
  updating: boolean;
}) {
  const [open, setOpen] = useState(false);
  const nextStatuses = NEXT_STATUSES[order.status];

  if (!nextStatuses || nextStatuses.length === 0) {
    return <StatusBadge status={order.status} />;
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        disabled={updating}
        className="flex items-center gap-1.5 transition">
        <StatusBadge status={order.status} />
        <ChevronDown
          className={`w-3.5 h-3.5 text-slate-500 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div
            className="absolute right-0 mt-2 w-44 rounded-xl overflow-hidden z-20 py-1"
            style={{
              background: "#0f2040",
              border: "1px solid rgba(255,255,255,0.10)",
              boxShadow: "0 16px 40px rgba(0,0,0,0.40)",
            }}>
            <p className="text-xs text-slate-600 px-3 py-2 border-b border-white/06">
              Ubah status ke:
            </p>
            {nextStatuses.map((s) => {
              const cfg = STATUS_CONFIG[s];
              return (
                <button
                  key={s}
                  onClick={() => {
                    onUpdate(s);
                    setOpen(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm hover:bg-white/05 transition"
                  style={{ color: cfg.color }}>
                  <span
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ background: cfg.color }}
                  />
                  {cfg.label}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

// ─── Order Row ────────────────────────────────────────────────────────────────

function OrderRow({
  order,
  workshopName,
  onUpdateStatus,
  updating,
}: {
  order: Order;
  workshopName: string;
  onUpdateStatus: (orderId: string, status: OrderStatus) => void;
  updating: boolean;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      className="rounded-xl overflow-hidden transition"
      style={{
        background: "rgba(255,255,255,0.02)",
        border: "1px solid rgba(255,255,255,0.06)",
      }}>
      {/* Main row */}
      <div
        className="flex items-center gap-4 px-4 py-4 cursor-pointer hover:bg-white/02 transition"
        onClick={() => setExpanded(!expanded)}>
        {/* Icon */}
        <div className="w-9 h-9 rounded-xl bg-white/05 flex items-center justify-center flex-shrink-0">
          <Wrench className="w-4 h-4 text-slate-500" />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-white text-sm font-semibold truncate">
              {order.vehicle_type}
            </p>
            <span className="text-slate-600 text-xs">·</span>
            <p className="text-slate-400 text-xs truncate">{workshopName}</p>
          </div>
          <p className="text-slate-500 text-xs mt-0.5 truncate">
            {order.complaint}
          </p>
        </div>

        {/* Date */}
        <div className="hidden sm:block text-right flex-shrink-0">
          <p className="text-slate-300 text-xs font-medium">
            {format(new Date(order.booking_date), "dd MMM yyyy", {
              locale: id,
            })}
          </p>
          <p className="text-slate-600 text-xs mt-0.5">
            {format(new Date(order.created_at), "HH:mm", { locale: id })}
          </p>
        </div>

        {/* Status dropdown */}
        <div className="flex-shrink-0" onClick={(e) => e.stopPropagation()}>
          <StatusDropdown
            order={order}
            onUpdate={(status) => onUpdateStatus(order.id, status)}
            updating={updating}
          />
        </div>

        <ChevronDown
          className={`w-4 h-4 text-slate-600 flex-shrink-0 transition-transform ${expanded ? "rotate-180" : ""}`}
        />
      </div>

      {/* Expanded detail */}
      {expanded && (
        <div
          className="px-4 pb-4 pt-0 grid grid-cols-2 sm:grid-cols-4 gap-3"
          style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
          {[
            { label: "ID Order", value: `#${order.id.slice(0, 8)}` },
            {
              label: "Tanggal Booking",
              value: format(new Date(order.booking_date), "dd MMM yyyy", {
                locale: id,
              }),
            },
            { label: "Kendaraan", value: order.vehicle_type },
            { label: "Workshop", value: workshopName },
          ].map(({ label, value }) => (
            <div
              key={label}
              className="rounded-xl px-3 py-2.5"
              style={{ background: "rgba(255,255,255,0.03)" }}>
              <p className="text-slate-500 text-xs">{label}</p>
              <p className="text-white text-sm font-medium mt-0.5 truncate">
                {value}
              </p>
            </div>
          ))}

          <div
            className="col-span-2 sm:col-span-4 rounded-xl px-3 py-2.5"
            style={{ background: "rgba(255,255,255,0.03)" }}>
            <p className="text-slate-500 text-xs">Keluhan</p>
            <p className="text-white text-sm mt-0.5 leading-relaxed">
              {order.complaint}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function OrdersPage() {
  const queryClient = useQueryClient();
  const [filterStatus, setFilterStatus] = useState<OrderStatus | "all">("all");
  const [search, setSearch] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const { data: workshops = [], isLoading: loadingWorkshops } = useQuery({
    queryKey: ["operator-workshops"],
    queryFn: workshopApi.list,
  });

  const { data: orders = [], isLoading: loadingOrders } = useQuery({
    queryKey: ["operator-orders", workshops.map((w) => w.id)],
    queryFn: async () => {
      if (workshops.length === 0) return [];
      const results = await Promise.all(
        workshops.map((w) => orderApi.workshopOrders(w.id)),
      );
      return results.flat();
    },
    enabled: workshops.length > 0,
  });

  const updateMutation = useMutation({
    mutationFn: async ({
      orderId,
      status,
    }: {
      orderId: string;
      status: OrderStatus;
    }) => {
      setUpdatingId(orderId);
      return orderApi.updateStatus(orderId, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["operator-orders"] });
      setUpdatingId(null);
    },
    onError: () => setUpdatingId(null),
  });

  const isLoading = loadingWorkshops || loadingOrders;

  // Workshop name lookup
  const workshopMap = Object.fromEntries(workshops.map((w) => [w.id, w.name]));

  // Filter + search
  const filtered = orders
    .filter((o) => filterStatus === "all" || o.status === filterStatus)
    .filter((o) => {
      if (!search) return true;
      const q = search.toLowerCase();
      return (
        o.vehicle_type.toLowerCase().includes(q) ||
        o.complaint.toLowerCase().includes(q) ||
        workshopMap[o.workshop_id]?.toLowerCase().includes(q)
      );
    })
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    );

  // Count per status
  const counts = orders.reduce(
    (acc, o) => {
      acc[o.status] = (acc[o.status] ?? 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">
          Pesanan
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Kelola dan update status pesanan dari customer
        </p>
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-2 flex-wrap">
        {ALL_FILTER_STATUSES.map((s) => {
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
                  className="ml-0.5 px-1.5 py-0.5 rounded-md text-xs"
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

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari kendaraan, keluhan, atau bengkel..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm text-white placeholder-slate-600 bg-white/04 border border-white/08 focus:outline-none focus:border-red-500/50 focus:ring-2 focus:ring-red-500/10 transition"
        />
      </div>

      {/* List */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="h-20 rounded-xl animate-pulse"
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
          <p className="text-slate-400 font-medium">
            {search || filterStatus !== "all"
              ? "Tidak ada pesanan yang cocok"
              : "Belum ada pesanan"}
          </p>
          {(search || filterStatus !== "all") && (
            <button
              onClick={() => {
                setSearch("");
                setFilterStatus("all");
              }}
              className="text-xs text-red-400 hover:text-red-300 font-semibold transition">
              Reset filter
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((order) => (
            <OrderRow
              key={order.id}
              order={order}
              workshopName={workshopMap[order.workshop_id] ?? "—"}
              onUpdateStatus={(orderId, status) =>
                updateMutation.mutate({ orderId, status })
              }
              updating={updatingId === order.id}
            />
          ))}
        </div>
      )}

      {/* Footer count */}
      {filtered.length > 0 && (
        <p className="text-slate-600 text-xs text-center">
          Menampilkan {filtered.length} dari {orders.length} pesanan
        </p>
      )}
    </div>
  );
}
