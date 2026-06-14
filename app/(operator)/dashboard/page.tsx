"use client";

import { useQuery } from "@tanstack/react-query";
import {
  ClipboardList,
  Clock,
  CheckCircle,
  Store,
  Wrench,
  RefreshCw,
} from "lucide-react";
import { workshopApi, orderApi } from "@/lib/api";
import { useAuthStore } from "@/store/auth";
import { StatsCard } from "@/components/operator/StatsCard";
import type { Order, OrderStatus } from "@/lib/types";
import { format } from "date-fns";
import { id } from "date-fns/locale";

// ─── Status badge ─────────────────────────────────────────────────────────────

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

function StatusBadge({ status }: { status: OrderStatus }) {
  const cfg = STATUS_CONFIG[status];
  return (
    <span
      className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold"
      style={{
        color: cfg.color,
        background: cfg.bg,
        border: `1px solid ${cfg.border}`,
      }}>
      {cfg.label}
    </span>
  );
}

// ─── Recent order row ─────────────────────────────────────────────────────────

function OrderRow({ order }: { order: Order }) {
  return (
    <div
      className="flex items-center gap-4 px-4 py-3.5 rounded-xl transition hover:bg-white/03"
      style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
      <div className="w-9 h-9 rounded-xl bg-white/05 flex items-center justify-center flex-shrink-0">
        <Wrench className="w-4 h-4 text-slate-500" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-white text-sm font-semibold truncate">
          {order.vehicle_type}
        </p>
        <p className="text-slate-500 text-xs truncate mt-0.5">
          {order.complaint}
        </p>
      </div>
      <div className="text-right flex-shrink-0">
        <StatusBadge status={order.status} />
        <p className="text-slate-600 text-xs mt-1.5">
          {format(new Date(order.created_at), "dd MMM yyyy", { locale: id })}
        </p>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);

  // Fetch workshops milik operator ini
  const { data: workshops = [], isLoading: loadingWorkshops } = useQuery({
    queryKey: ["operator-workshops"],
    queryFn: workshopApi.list,
  });

  // Fetch orders dari semua workshop
  const {
    data: orders = [],
    isLoading: loadingOrders,
    refetch,
    isFetching,
  } = useQuery({
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

  const isLoading = loadingWorkshops || loadingOrders;

  // Stats
  const pending = orders.filter((o) => o.status === "pending").length;
  const confirmed = orders.filter((o) => o.status === "confirmed").length;
  const done = orders.filter((o) => o.status === "done").length;

  // Recent 5 orders
  const recentOrders = [...orders]
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    )
    .slice(0, 5);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Selamat datang,{" "}
            <span className="text-red-400">{user?.name?.split(" ")[0]}</span> 👋
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Berikut ringkasan aktivitas bengkel Anda hari ini
          </p>
        </div>
        <button
          onClick={() => refetch()}
          disabled={isFetching}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm text-slate-400 hover:text-white transition"
          style={{
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.08)",
          }}>
          <RefreshCw
            className={`w-4 h-4 ${isFetching ? "animate-spin" : ""}`}
          />
          Refresh
        </button>
      </div>

      {/* Stats */}
      {isLoading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-24 rounded-2xl animate-pulse"
              style={{ background: "#0b1628" }}
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            label="Total Workshop"
            value={workshops.length}
            icon={Store}
            color="blue"
            sub="bengkel terdaftar"
          />
          <StatsCard
            label="Pesanan Masuk"
            value={pending}
            icon={ClipboardList}
            color="yellow"
            sub="menunggu konfirmasi"
          />
          <StatsCard
            label="Dikonfirmasi"
            value={confirmed}
            icon={Clock}
            color="red"
            sub="sedang berjalan"
          />
          <StatsCard
            label="Selesai"
            value={done}
            icon={CheckCircle}
            color="green"
            sub="total order selesai"
          />
        </div>
      )}

      {/* Recent Orders */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{
          background: "#0b1628",
          border: "1px solid rgba(255,255,255,0.07)",
        }}>
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-4"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
          <div>
            <h2 className="text-white font-semibold text-sm">
              Pesanan Terbaru
            </h2>
            <p className="text-slate-500 text-xs mt-0.5">
              5 pesanan paling baru
            </p>
          </div>
          <a
            href="/operator/orders"
            className="text-xs text-red-400 hover:text-red-300 font-semibold transition">
            Lihat semua →
          </a>
        </div>

        {/* List */}
        {isLoading ? (
          <div className="p-4 space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="h-16 rounded-xl animate-pulse"
                style={{ background: "rgba(255,255,255,0.03)" }}
              />
            ))}
          </div>
        ) : recentOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <ClipboardList className="w-10 h-10 text-slate-700" />
            <p className="text-slate-500 text-sm">Belum ada pesanan masuk</p>
          </div>
        ) : (
          <div className="p-2">
            {recentOrders.map((order) => (
              <OrderRow key={order.id} order={order} />
            ))}
          </div>
        )}
      </div>

      {/* Empty workshops state */}
      {!isLoading && workshops.length === 0 && (
        <div
          className="rounded-2xl p-8 flex flex-col items-center gap-4 text-center"
          style={{
            background: "rgba(220,38,38,0.06)",
            border: "1px dashed rgba(220,38,38,0.25)",
          }}>
          <Store className="w-10 h-10 text-red-600/50" />
          <div>
            <p className="text-white font-semibold">Belum ada workshop</p>
            <p className="text-slate-500 text-sm mt-1">
              Tambahkan workshop Anda untuk mulai menerima pesanan
            </p>
          </div>
          <a
            href="/operator/workshops"
            className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-red-600 hover:bg-red-700 transition"
            style={{ boxShadow: "0 4px 14px rgba(220,38,38,0.25)" }}>
            Tambah Workshop
          </a>
        </div>
      )}
    </div>
  );
}
