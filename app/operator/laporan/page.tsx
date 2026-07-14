"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  TrendingUp,
  Wallet,
  CreditCard,
  Smartphone,
  ChevronLeft,
  ChevronRight,
  BarChart2,
} from "lucide-react";
import { laporanApi } from "@/lib/api";
import { WorkshopSwitcher } from "@/components/operator/WorkshopSwitcher";
import { EmptyState } from "@/components/ui/EmptyState";
import { SectionLoader } from "@/components/ui/PageLoader";
import { Header } from "@/components/layout/Header";
import { useActiveWorkshopStore } from "@/store/workshop";
import { cn, formatCurrency, formatDateTime } from "@/lib/utils";
import type { PaymentMethod } from "@/lib/types";

const MONTHS = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

const METHOD_CONFIG: Record<
  PaymentMethod,
  { label: string; icon: React.ElementType; color: string; bg: string }
> = {
  cash: {
    label: "Tunai",
    icon: Wallet,
    color: "text-green-600",
    bg: "bg-green-50",
  },
  transfer: {
    label: "Transfer",
    icon: CreditCard,
    color: "text-blue-600",
    bg: "bg-blue-50",
  },
  qris: {
    label: "QRIS",
    icon: Smartphone,
    color: "text-purple-600",
    bg: "bg-purple-50",
  },
};

function StatCard({
  label,
  value,
  icon: Icon,
  color,
  bg,
}: {
  label: string;
  value: string;
  icon: React.ElementType;
  color: string;
  bg: string;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5">
      <div className="flex items-center gap-3 mb-3">
        <div
          className={cn(
            "w-9 h-9 rounded-xl flex items-center justify-center",
            bg,
          )}>
          <Icon className={cn("w-4 h-4", color)} />
        </div>
        <p className="text-xs font-semibold text-gray-500">{label}</p>
      </div>
      <p className="text-xl font-bold text-gray-900">{value}</p>
    </div>
  );
}

export default function LaporanPage() {
  const activeWorkshopId = useActiveWorkshopStore((s) => s.activeWorkshopId);
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());

  const { data, isLoading } = useQuery({
    queryKey: ["laporan", activeWorkshopId, month, year],
    queryFn: () => laporanApi.getMonthly(activeWorkshopId!, month, year),
    enabled: !!activeWorkshopId,
  });

  // Hitung per-metode dari transaksi
  const breakdown = (data?.transactions ?? []).reduce(
    (acc, t) => {
      acc[t.method] = (acc[t.method] ?? 0) + t.amount;
      return acc;
    },
    {} as Record<PaymentMethod, number>,
  );

  const prevMonth = () => {
    if (month === 1) {
      setMonth(12);
      setYear((y) => y - 1);
    } else {
      setMonth((m) => m - 1);
    }
  };

  const nextMonth = () => {
    const isCurrentMonth =
      month === now.getMonth() + 1 && year === now.getFullYear();
    if (isCurrentMonth) return;
    if (month === 12) {
      setMonth(1);
      setYear((y) => y + 1);
    } else {
      setMonth((m) => m + 1);
    }
  };

  const isCurrentMonth =
    month === now.getMonth() + 1 && year === now.getFullYear();

  return (
    <>
      <Header
        title="Laporan"
        subtitle="Ringkasan pendapatan bulanan bengkel Anda"
      />

      <div className="p-6 space-y-6">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
          <WorkshopSwitcher />

          {/* Month picker */}
          <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-2">
            <button
              onClick={prevMonth}
              className="p-1 rounded-lg hover:bg-gray-100 transition text-gray-500 hover:text-gray-900">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm font-semibold text-gray-900 w-36 text-center">
              {MONTHS[month - 1]} {year}
            </span>
            <button
              onClick={nextMonth}
              disabled={isCurrentMonth}
              className="p-1 rounded-lg hover:bg-gray-100 transition text-gray-500 hover:text-gray-900 disabled:opacity-30 disabled:cursor-not-allowed">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {!activeWorkshopId ? null : isLoading ? (
          <SectionLoader />
        ) : (
          <>
            {/* Summary cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="col-span-2 bg-gradient-to-br from-[var(--navy)] to-[var(--navy-light)] rounded-2xl p-5 text-white">
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp className="w-4 h-4 opacity-70" />
                  <p className="text-xs font-semibold opacity-70">
                    Total Pendapatan
                  </p>
                </div>
                <p className="text-2xl font-bold">
                  {formatCurrency(data?.total_income ?? 0)}
                </p>
                <p className="text-xs opacity-50 mt-1">
                  {MONTHS[month - 1]} {year} ·{" "}
                  {data?.transactions.length ?? 0} transaksi
                </p>
              </div>

              {(["cash", "transfer", "qris"] as PaymentMethod[]).map((m) => {
                const cfg = METHOD_CONFIG[m];
                return (
                  <StatCard
                    key={m}
                    label={cfg.label}
                    value={formatCurrency(breakdown[m] ?? 0)}
                    icon={cfg.icon}
                    color={cfg.color}
                    bg={cfg.bg}
                  />
                );
              })}
            </div>

            {/* Transaction table */}
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100">
                <h3 className="text-sm font-bold text-gray-900">
                  Riwayat Transaksi
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  {MONTHS[month - 1]} {year}
                </p>
              </div>

              {(data?.transactions ?? []).length === 0 ? (
                <EmptyState
                  icon={BarChart2}
                  title="Belum ada transaksi"
                  description={`Tidak ada pembayaran tercatat pada ${MONTHS[month - 1]} ${year}`}
                />
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200">
                        <th className="text-left font-semibold text-gray-500 px-4 py-3">
                          Waktu
                        </th>
                        <th className="text-left font-semibold text-gray-500 px-4 py-3">
                          No. Invoice
                        </th>
                        <th className="text-left font-semibold text-gray-500 px-4 py-3">
                          Metode
                        </th>
                        <th className="text-left font-semibold text-gray-500 px-4 py-3">
                          Referensi
                        </th>
                        <th className="text-right font-semibold text-gray-500 px-4 py-3">
                          Jumlah
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {[...( data?.transactions ?? [])]
                        .sort(
                          (a, b) =>
                            new Date(b.paid_at).getTime() -
                            new Date(a.paid_at).getTime(),
                        )
                        .map((t) => {
                          const cfg = METHOD_CONFIG[t.method];
                          const MethodIcon = cfg.icon;
                          return (
                            <tr
                              key={t.id}
                              className="border-b border-gray-100 last:border-0 hover:bg-gray-50 transition">
                              <td className="px-4 py-3 text-gray-500">
                                {formatDateTime(t.paid_at)}
                              </td>
                              <td className="px-4 py-3 font-mono text-xs text-gray-600">
                                #{t.invoice_id.slice(0, 8)}
                              </td>
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-1.5">
                                  <div
                                    className={cn(
                                      "w-6 h-6 rounded-md flex items-center justify-center",
                                      cfg.bg,
                                    )}>
                                    <MethodIcon
                                      className={cn("w-3.5 h-3.5", cfg.color)}
                                    />
                                  </div>
                                  <span className="text-gray-700 text-xs font-medium">
                                    {cfg.label}
                                  </span>
                                </div>
                              </td>
                              <td className="px-4 py-3 text-gray-400 text-xs">
                                {t.reference_no || t.notes || "—"}
                              </td>
                              <td className="px-4 py-3 text-right font-semibold text-gray-900">
                                {formatCurrency(t.amount)}
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                    <tfoot>
                      <tr className="bg-gray-50 border-t-2 border-gray-200">
                        <td
                          colSpan={4}
                          className="px-4 py-3 text-sm font-bold text-gray-700">
                          Total {MONTHS[month - 1]} {year}
                        </td>
                        <td className="px-4 py-3 text-right text-base font-bold text-gray-900">
                          {formatCurrency(data?.total_income ?? 0)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </>
  );
}
