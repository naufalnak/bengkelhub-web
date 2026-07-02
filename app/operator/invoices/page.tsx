"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { Receipt, ChevronLeft, ChevronRight, User } from "lucide-react";
import { invoiceApi } from "@/lib/api";
import { WorkshopSwitcher } from "@/components/operator/WorkshopSwitcher";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { SkeletonRow } from "@/components/ui/PageLoader";
import { Header } from "@/components/layout/Header";
import { useActiveWorkshopStore } from "@/store/workshop";
import { cn, btnOutline, formatCurrency, formatDateShort } from "@/lib/utils";
import { invoiceStatusVariant, invoiceStatusLabel } from "@/lib/variants";
import type { InvoiceStatus } from "@/lib/types";

const PAGE_SIZE = 10;
const FILTER_STATUSES: (InvoiceStatus | "all")[] = [
  "all",
  "unpaid",
  "partial",
  "paid",
];

export default function InvoicesPage() {
  const router = useRouter();
  const activeWorkshopId = useActiveWorkshopStore((s) => s.activeWorkshopId);

  const [filterStatus, setFilterStatus] = useState<InvoiceStatus | "all">(
    "all",
  );
  const [page, setPage] = useState(1);

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["invoices", activeWorkshopId, filterStatus, page],
    queryFn: () =>
      invoiceApi.list(
        activeWorkshopId!,
        filterStatus === "all" ? "" : filterStatus,
        page,
        PAGE_SIZE,
      ),
    enabled: !!activeWorkshopId,
  });

  const invoices = data?.data ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <>
      <Header
        title="Invoice"
        subtitle="Kelola tagihan dan pembayaran servis"
      />

      <div className="p-6 space-y-6">
        <WorkshopSwitcher />

        {/* Filter tabs */}
        <div className="flex items-center gap-2 flex-wrap">
          {FILTER_STATUSES.map((s) => {
            const active = filterStatus === s;
            return (
              <button
                key={s}
                onClick={() => {
                  setFilterStatus(s);
                  setPage(1);
                }}
                className={cn(
                  "px-3 py-1.5 rounded-xl text-xs font-semibold border transition",
                  active
                    ? "bg-[var(--navy)] text-white border-[var(--navy)]"
                    : "bg-white text-gray-500 border-gray-200 hover:border-gray-300 hover:text-gray-700",
                )}>
                {s === "all" ? "Semua" : invoiceStatusLabel[s]}
              </button>
            );
          })}
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          {!activeWorkshopId ? null : isLoading ? (
            <table className="w-full">
              <tbody>
                {Array.from({ length: 5 }).map((_, i) => (
                  <SkeletonRow key={i} />
                ))}
              </tbody>
            </table>
          ) : invoices.length === 0 ? (
            <EmptyState
              icon={Receipt}
              title={
                filterStatus !== "all"
                  ? "Tidak ada invoice dengan status ini"
                  : "Belum ada invoice"
              }
              description={
                filterStatus !== "all"
                  ? "Coba pilih filter status lain"
                  : "Invoice dibuat otomatis dari servis yang sudah selesai"
              }
            />
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="text-left font-semibold text-gray-500 px-4 py-3">
                        No. Invoice
                      </th>
                      <th className="text-left font-semibold text-gray-500 px-4 py-3">
                        Kendaraan
                      </th>
                      <th className="text-left font-semibold text-gray-500 px-4 py-3">
                        Pelanggan
                      </th>
                      <th className="text-right font-semibold text-gray-500 px-4 py-3">
                        Total
                      </th>
                      <th className="text-left font-semibold text-gray-500 px-4 py-3">
                        Tanggal
                      </th>
                      <th className="text-left font-semibold text-gray-500 px-4 py-3">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoices.map((inv) => (
                      <tr
                        key={inv.id}
                        onClick={() =>
                          router.push(`/operator/invoices/${inv.id}`)
                        }
                        className="border-b border-gray-100 last:border-0 hover:bg-gray-50 transition cursor-pointer">
                        <td className="px-4 py-3 font-mono text-xs font-semibold text-gray-700">
                          {inv.invoice_no}
                        </td>
                        <td className="px-4 py-3">
                          {inv.service?.vehicle ? (
                            <div>
                              <p className="font-semibold text-gray-900">
                                {inv.service.vehicle.plate_number}
                              </p>
                              <p className="text-xs text-gray-400">
                                {inv.service.vehicle.brand}{" "}
                                {inv.service.vehicle.model}
                              </p>
                            </div>
                          ) : (
                            "—"
                          )}
                        </td>
                        <td className="px-4 py-3 text-gray-600">
                          <div className="flex items-center gap-1.5">
                            <User className="w-3.5 h-3.5 text-gray-400" />
                            {inv.service?.vehicle?.customer?.name ?? "—"}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right font-semibold text-gray-900">
                          {formatCurrency(inv.total)}
                        </td>
                        <td className="px-4 py-3 text-gray-500">
                          {formatDateShort(inv.created_at)}
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant={invoiceStatusVariant[inv.status]}>
                            {invoiceStatusLabel[inv.status]}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 bg-gray-50">
                <p className="text-xs text-gray-500">
                  Menampilkan {invoices.length} dari {total} invoice
                  {isFetching && " · memuat..."}
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page <= 1}
                    className={cn(
                      btnOutline,
                      "w-8 h-8 p-0 text-xs disabled:opacity-40",
                    )}>
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-xs font-medium text-gray-600">
                    {page} / {totalPages}
                  </span>
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page >= totalPages}
                    className={cn(
                      btnOutline,
                      "w-8 h-8 p-0 text-xs disabled:opacity-40",
                    )}>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
