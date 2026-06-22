"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { ClipboardList, Wrench, ChevronDown, ChevronUp, X } from "lucide-react";
import { orderApi } from "@/lib/api";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { SectionLoader } from "@/components/ui/PageLoader";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { cn, formatDateShort, formatDateTime } from "@/lib/utils";
import { toast } from "@/components/ui/Toast";
import { orderStatusVariant, orderStatusLabel } from "@/lib/variants";
import type { Order, OrderStatus } from "@/lib/types";

const FILTER_STATUSES: (OrderStatus | "all")[] = [
  "all",
  "pending",
  "confirmed",
  "in_progress",
  "done",
  "cancelled",
];

function BookingCard({
  order,
  onCancel,
}: {
  order: Order;
  onCancel: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const canCancel = order.status === "pending";

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-md transition">
      {/* Main row */}
      <div
        className="flex items-center gap-4 px-5 py-4 cursor-pointer hover:bg-gray-50 transition"
        onClick={() => setExpanded(!expanded)}>
        <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0">
          <Wrench className="w-4 h-4 text-gray-400" />
        </div>
        <div className="flex-1 min-w-0">
          {order.workshop && (
            <p className="text-xs font-semibold text-[var(--navy)] truncate">
              {order.workshop.name}
            </p>
          )}
          <p className="text-sm font-bold text-gray-900 truncate">
            {order.vehicle_type}
          </p>
          <p className="text-xs text-gray-400 truncate mt-0.5">
            {order.complaint}
          </p>
        </div>
        <div className="hidden sm:block text-right flex-shrink-0">
          <p className="text-xs font-medium text-gray-600">
            {formatDateShort(order.booking_date)}
          </p>
        </div>
        <Badge variant={orderStatusVariant[order.status]}>
          {orderStatusLabel[order.status]}
        </Badge>
        {expanded ? (
          <ChevronUp className="w-4 h-4 text-gray-400 flex-shrink-0" />
        ) : (
          <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />
        )}
      </div>

      {/* Expanded */}
      {expanded && (
        <div className="border-t border-gray-100 px-5 pb-5 bg-gray-50">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-4">
            {[
              { label: "ID Order", value: `#${order.id.slice(0, 8)}` },
              {
                label: "Tanggal Booking",
                value: formatDateShort(order.booking_date),
              },
              { label: "Dibuat", value: formatDateTime(order.created_at) },
            ].map(({ label, value }) => (
              <div
                key={label}
                className="bg-white rounded-xl px-3 py-2.5 border border-gray-200">
                <p className="text-xs text-gray-400">{label}</p>
                <p className="text-sm font-semibold text-gray-900 mt-0.5">
                  {value}
                </p>
              </div>
            ))}
            <div className="col-span-2 sm:col-span-3 bg-white rounded-xl px-3 py-2.5 border border-gray-200">
              <p className="text-xs text-gray-400">Keluhan</p>
              <p className="text-sm text-gray-900 mt-0.5 leading-relaxed">
                {order.complaint}
              </p>
            </div>
          </div>

          {canCancel && (
            <div className="flex justify-end mt-4">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onCancel();
                }}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 transition">
                <X className="w-4 h-4" /> Batalkan Booking
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
  const [toCancel, setToCancel] = useState<Order | null>(null);

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["my-orders"],
    queryFn: orderApi.myOrders,
  });

  const cancelMutation = useMutation({
    mutationFn: (orderId: string) => orderApi.cancel(orderId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-orders"] });
      toast.success("Booking berhasil dibatalkan");
      setToCancel(null);
    },
    onError: (err: Error) => {
      toast.error(err.message ?? "Gagal membatalkan booking");
    },
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
        <h1 className="text-2xl font-bold text-gray-900">Riwayat Booking</h1>
        <p className="text-gray-500 text-sm mt-1">
          Pantau status servis kendaraan Anda
        </p>
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-2 flex-wrap">
        {FILTER_STATUSES.map((s) => {
          const count = s === "all" ? orders.length : (counts[s] ?? 0);
          const active = filterStatus === s;
          return (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition",
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

      {/* List */}
      {isLoading ? (
        <SectionLoader />
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200">
          <EmptyState
            icon={ClipboardList}
            title={
              filterStatus !== "all"
                ? "Tidak ada booking dengan status ini"
                : "Belum ada booking"
            }
            description={
              filterStatus !== "all"
                ? "Coba filter status yang lain"
                : "Cari bengkel dan buat booking pertama Anda"
            }
            action={
              filterStatus === "all" ? (
                <Link
                  href="/workshops"
                  className="px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-red-600 hover:bg-red-700 transition inline-flex items-center">
                  Cari Bengkel
                </Link>
              ) : (
                <button
                  onClick={() => setFilterStatus("all")}
                  className="text-sm text-red-600 hover:text-red-700 font-semibold transition">
                  Lihat semua booking
                </button>
              )
            }
          />
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((order) => (
            <BookingCard
              key={order.id}
              order={order}
              onCancel={() => setToCancel(order)}
            />
          ))}
        </div>
      )}

      <ConfirmDialog
        open={!!toCancel}
        onClose={() => setToCancel(null)}
        onConfirm={() => toCancel && cancelMutation.mutate(toCancel.id)}
        title="Batalkan Booking"
        description={`Yakin ingin membatalkan booking ${toCancel?.vehicle_type}? Tindakan ini tidak bisa dibatalkan.`}
        confirmLabel="Ya, Batalkan"
        loading={cancelMutation.isPending}
      />
    </div>
  );
}
