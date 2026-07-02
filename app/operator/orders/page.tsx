"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ClipboardList, Search, ChevronDown, ChevronUp } from "lucide-react";
import { workshopApi, orderApi, ApiRequestError } from "@/lib/api";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { SectionLoader } from "@/components/ui/PageLoader";
import { Header } from "@/components/layout/Header";
import { cn, inputClass, formatDateShort } from "@/lib/utils";
import { toast } from "@/components/ui/Toast";
import { orderStatusVariant, orderStatusLabel } from "@/lib/variants";
import type { Order, BookingStatus } from "@/lib/types";

// ─── Status transitions ───────────────────────────────────────────────────────

const NEXT_STATUSES: Partial<Record<BookingStatus, BookingStatus[]>> = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["done", "cancelled"],
};

const ALL_STATUSES: (BookingStatus | "all")[] = [
  "all",
  "pending",
  "confirmed",
  "done",
  "cancelled",
];

// ─── Status dropdown ──────────────────────────────────────────────────────────

function StatusDropdown({
  order,
  onUpdate,
  updating,
}: {
  order: Order;
  onUpdate: (status: BookingStatus) => void;
  updating: boolean;
}) {
  const [open, setOpen] = useState(false);
  const next = NEXT_STATUSES[order.status];

  if (!next || next.length === 0) {
    return (
      <Badge variant={orderStatusVariant[order.status]}>
        {orderStatusLabel[order.status]}
      </Badge>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        disabled={updating}
        className="flex items-center gap-1.5 group">
        <Badge variant={orderStatusVariant[order.status]}>
          {orderStatusLabel[order.status]}
        </Badge>
        <ChevronDown className="w-3.5 h-3.5 text-gray-400 group-hover:text-gray-600 transition" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 mt-1.5 w-44 bg-white rounded-xl border border-gray-200 shadow-lg z-20 py-1 overflow-hidden">
            <p className="text-xs text-gray-400 px-3 py-2 border-b border-gray-100">
              Ubah status ke:
            </p>
            {next.map((s) => (
              <button
                key={s}
                onClick={() => {
                  onUpdate(s);
                  setOpen(false);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition">
                <Badge variant={orderStatusVariant[s]}>
                  {orderStatusLabel[s]}
                </Badge>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ─── Order row ────────────────────────────────────────────────────────────────

function OrderRow({
  order,
  workshopName,
  onUpdateStatus,
  updating,
}: {
  order: Order;
  workshopName: string;
  onUpdateStatus: (id: string, status: BookingStatus) => void;
  updating: boolean;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="border-b border-gray-100 last:border-0">
      {/* Main row */}
      <div
        className="flex items-center gap-4 px-4 py-3.5 hover:bg-gray-50 transition cursor-pointer"
        onClick={() => setExpanded(!expanded)}>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-semibold text-gray-900 truncate">
              {order.vehicle_type} · {order.vehicle_plate}
            </p>
            <span className="text-gray-300 text-xs">·</span>
            <p className="text-xs text-gray-400 truncate">{workshopName}</p>
          </div>
          {order.notes && (
            <p className="text-xs text-gray-400 truncate mt-0.5">
              {order.notes}
            </p>
          )}
        </div>

        <div className="hidden sm:block text-right flex-shrink-0">
          <p className="text-xs text-gray-500 font-medium">
            {order.slot ? formatDateShort(order.slot.date) : "—"}
          </p>
          <p className="text-xs text-gray-400 mt-0.5">
            #{order.id.slice(0, 8)}
          </p>
        </div>

        <div onClick={(e) => e.stopPropagation()}>
          <StatusDropdown
            order={order}
            onUpdate={(status) => onUpdateStatus(order.id, status)}
            updating={updating}
          />
        </div>

        {expanded ? (
          <ChevronUp className="w-4 h-4 text-gray-400 flex-shrink-0" />
        ) : (
          <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />
        )}
      </div>

      {/* Expanded detail */}
      {expanded && (
        <div className="px-4 pb-4 grid grid-cols-2 sm:grid-cols-4 gap-3 bg-gray-50 border-t border-gray-100">
          {[
            { label: "ID Order", value: `#${order.id.slice(0, 8)}` },
            {
              label: "Jadwal",
              value: order.slot ? formatDateShort(order.slot.date) : "—",
            },
            { label: "Kendaraan", value: order.vehicle_type },
            { label: "Workshop", value: workshopName },
          ].map(({ label, value }) => (
            <div
              key={label}
              className="bg-white rounded-xl px-3 py-2.5 border border-gray-100 mt-3">
              <p className="text-xs text-gray-400">{label}</p>
              <p className="text-sm font-semibold text-gray-900 mt-0.5 truncate">
                {value}
              </p>
            </div>
          ))}
          <div className="col-span-2 sm:col-span-4 bg-white rounded-xl px-3 py-2.5 border border-gray-100">
            <p className="text-xs text-gray-400">Keluhan / Catatan</p>
            <p className="text-sm text-gray-900 mt-0.5 leading-relaxed">
              {order.notes || "—"}
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
  const [filterStatus, setFilterStatus] = useState<BookingStatus | "all">(
    "all",
  );
  const [search, setSearch] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const { data: workshopData, isLoading: loadingWorkshops } = useQuery({
    queryKey: ["operator-workshops"],
    queryFn: () => workshopApi.myWorkshops(1, 50),
  });
  const workshops = workshopData?.data ?? [];

  const { data: orders = [], isLoading: loadingOrders } = useQuery({
    queryKey: ["operator-orders", workshops.map((w) => w.id)],
    queryFn: async () => {
      if (workshops.length === 0) return [];
      const results = await Promise.all(
        workshops.map((w) => orderApi.workshopOrders(w.id, 1, 50)),
      );
      return results.flatMap((r) => r.data);
    },
    enabled: workshops.length > 0,
  });

  const updateMutation = useMutation({
    mutationFn: ({
      orderId,
      status,
    }: {
      orderId: string;
      status: BookingStatus;
    }) => {
      setUpdatingId(orderId);
      return orderApi.updateStatus(orderId, {
        status: status as "confirmed" | "done" | "cancelled",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["operator-orders"] });
      toast.success("Status pesanan diperbarui");
      setUpdatingId(null);
    },
    onError: (err: unknown) => {
      const message =
        err instanceof ApiRequestError ? err.message : "Gagal memperbarui status";
      toast.error(message);
      setUpdatingId(null);
    },
  });

  const isLoading = loadingWorkshops || loadingOrders;
  const workshopMap = Object.fromEntries(workshops.map((w) => [w.id, w.name]));

  const counts = orders.reduce(
    (acc, o) => {
      acc[o.status] = (acc[o.status] ?? 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  const filtered = orders
    .filter((o) => filterStatus === "all" || o.status === filterStatus)
    .filter((o) => {
      if (!search) return true;
      const q = search.toLowerCase();
      return (
        o.vehicle_type.toLowerCase().includes(q) ||
        o.vehicle_plate.toLowerCase().includes(q) ||
        o.notes.toLowerCase().includes(q) ||
        workshopMap[o.workshop_id]?.toLowerCase().includes(q)
      );
    })
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    );

  return (
    <>
      <Header
        title="Pesanan"
        subtitle="Kelola dan update status pesanan dari customer"
      />

      <div className="p-6 space-y-5">
        {/* Filter tabs */}
        <div className="flex items-center gap-2 flex-wrap">
          {ALL_STATUSES.map((s) => {
            const count = s === "all" ? orders.length : (counts[s] ?? 0);
            const active = filterStatus === s;
            return (
              <button
                key={s}
                onClick={() => setFilterStatus(s)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition border",
                  active
                    ? "bg-[var(--navy)] text-white border-[var(--navy)]"
                    : "bg-white text-gray-500 border-gray-200 hover:border-gray-300 hover:text-gray-700",
                )}>
                {s === "all" ? "Semua" : orderStatusLabel[s]}
                {count > 0 && (
                  <span
                    className={cn(
                      "px-1.5 py-0.5 rounded-md text-xs",
                      active
                        ? "bg-white/20 text-white"
                        : "bg-gray-100 text-gray-500",
                    )}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari kendaraan, plat, atau bengkel..."
            className={cn(inputClass, "pl-10")}
          />
        </div>

        {/* Table card */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          {isLoading ? (
            <SectionLoader />
          ) : filtered.length === 0 ? (
            <EmptyState
              icon={ClipboardList}
              title={
                search || filterStatus !== "all"
                  ? "Tidak ada pesanan yang cocok"
                  : "Belum ada pesanan"
              }
              description={
                search || filterStatus !== "all"
                  ? "Coba ubah filter atau kata kunci pencarian"
                  : "Pesanan dari customer akan muncul di sini"
              }
              action={
                search || filterStatus !== "all" ? (
                  <button
                    onClick={() => {
                      setSearch("");
                      setFilterStatus("all");
                    }}
                    className="text-sm text-red-600 hover:text-red-700 font-semibold transition">
                    Reset filter
                  </button>
                ) : undefined
              }
            />
          ) : (
            <div>
              {filtered.map((order) => (
                <OrderRow
                  key={order.id}
                  order={order}
                  workshopName={workshopMap[order.workshop_id] ?? "—"}
                  onUpdateStatus={(id, status) =>
                    updateMutation.mutate({ orderId: id, status })
                  }
                  updating={updatingId === order.id}
                />
              ))}
            </div>
          )}
        </div>

        {filtered.length > 0 && (
          <p className="text-gray-400 text-xs text-center">
            Menampilkan {filtered.length} dari {orders.length} pesanan
          </p>
        )}
      </div>
    </>
  );
}
