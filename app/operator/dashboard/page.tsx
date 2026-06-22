"use client";

import { useQuery } from "@tanstack/react-query";
import {
  Store,
  ClipboardList,
  Clock,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import Link from "next/link";
import { workshopApi, orderApi } from "@/lib/api";
import { useAuthStore } from "@/store/auth";
import { StatsCard } from "@/components/operator/StatsCard";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { SectionLoader, SkeletonCard } from "@/components/ui/PageLoader";
import { Header } from "@/components/layout/Header";
import { formatDateShort } from "@/lib/utils";
import { orderStatusVariant, orderStatusLabel } from "@/lib/variants";
import type { Order } from "@/lib/types";

function OrderRow({ order }: { order: Order }) {
  return (
    <div className="flex items-center gap-4 px-4 py-3.5 hover:bg-gray-50 transition border-b border-gray-100 last:border-0">
      <div className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0">
        <ClipboardList className="w-4 h-4 text-gray-400" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-900 truncate">
          {order.vehicle_type}
        </p>
        <p className="text-xs text-gray-400 truncate mt-0.5">
          {order.complaint}
        </p>
      </div>
      <div className="hidden sm:block text-right flex-shrink-0">
        <p className="text-xs text-gray-500">
          {formatDateShort(order.booking_date)}
        </p>
      </div>
      <Badge variant={orderStatusVariant[order.status]}>
        {orderStatusLabel[order.status]}
      </Badge>
    </div>
  );
}

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);

  const { data: workshops = [], isLoading: loadingWorkshops } = useQuery({
    queryKey: ["operator-workshops"],
    queryFn: workshopApi.list,
  });

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

  const pending = orders.filter((o) => o.status === "pending").length;
  const confirmed = orders.filter((o) => o.status === "confirmed").length;
  const in_progress = orders.filter((o) => o.status === "in_progress").length;
  const done = orders.filter((o) => o.status === "done").length;

  const recentOrders = [...orders]
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    )
    .slice(0, 5);

  return (
    <>
      <Header
        title={`Selamat datang, ${user?.name?.split(" ")[0] ?? "Operator"} 👋`}
        subtitle="Ringkasan aktivitas bengkel Anda"
      />

      <div className="p-6 space-y-6">
        {/* Stats */}
        {isLoading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <SkeletonCard key={i} />
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
              href="/operator/workshops"
            />
            <StatsCard
              label="Menunggu"
              value={pending}
              icon={AlertCircle}
              color="amber"
              sub="perlu dikonfirmasi"
              href="/operator/orders"
            />
            <StatsCard
              label="Diproses"
              value={in_progress + confirmed}
              icon={Clock}
              color="red"
              sub="sedang berjalan"
              href="/operator/orders"
            />
            <StatsCard
              label="Selesai"
              value={done}
              icon={CheckCircle2}
              color="green"
              sub="total order selesai"
              href="/operator/orders"
            />
          </div>
        )}

        {/* Recent orders */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <div>
              <h2 className="text-sm font-bold text-[#0B1C3D]">
                Pesanan Terbaru
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">
                5 pesanan paling baru
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => refetch()}
                disabled={isFetching}
                className="p-1.5 rounded-lg hover:bg-gray-100 transition text-gray-400 hover:text-gray-600">
                <RefreshCw
                  className={`w-4 h-4 ${isFetching ? "animate-spin" : ""}`}
                />
              </button>
              <Link
                href="/operator/orders"
                className="text-xs text-red-600 hover:text-red-700 font-semibold transition">
                Lihat semua →
              </Link>
            </div>
          </div>

          {isLoading ? (
            <SectionLoader />
          ) : recentOrders.length === 0 ? (
            <EmptyState
              icon={ClipboardList}
              title="Belum ada pesanan"
              description="Pesanan dari customer akan muncul di sini"
            />
          ) : (
            <div>
              {recentOrders.map((order) => (
                <OrderRow key={order.id} order={order} />
              ))}
            </div>
          )}
        </div>

        {/* Empty workshop callout */}
        {!isLoading && workshops.length === 0 && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6 flex flex-col sm:flex-row items-center gap-4">
            <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <Store className="w-6 h-6 text-red-600" />
            </div>
            <div className="flex-1 text-center sm:text-left">
              <p className="text-sm font-bold text-red-800">
                Belum ada workshop
              </p>
              <p className="text-xs text-red-500 mt-0.5">
                Tambahkan workshop Anda untuk mulai menerima pesanan dari
                customer
              </p>
            </div>
            <Link
              href="/operator/workshops"
              className="px-4 py-2 rounded-xl text-sm font-bold text-white bg-red-600 hover:bg-red-700 transition flex-shrink-0">
              Tambah Workshop
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
