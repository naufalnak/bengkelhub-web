"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  Plus,
  Trash2,
  Loader2,
  User,
  Receipt,
  Wallet,
} from "lucide-react";
import { invoiceApi, ApiRequestError } from "@/lib/api";
import { AddPaymentModal } from "@/components/operator/AddPaymentModal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Badge } from "@/components/ui/Badge";
import { SectionLoader } from "@/components/ui/PageLoader";
import { Header } from "@/components/layout/Header";
import {
  cn,
  btnPrimary,
  formatCurrency,
  formatDateTime,
} from "@/lib/utils";
import { toast } from "@/components/ui/Toast";
import { invoiceStatusVariant, invoiceStatusLabel } from "@/lib/variants";
import type { Payment, PaymentMethod } from "@/lib/types";

const PAYMENT_METHOD_LABEL: Record<PaymentMethod, string> = {
  cash: "Tunai",
  transfer: "Transfer",
  qris: "QRIS",
};

function PaymentRow({
  payment,
  onDelete,
  deleting,
}: {
  payment: Payment;
  onDelete: () => void;
  deleting: boolean;
}) {
  return (
    <div className="flex items-center gap-4 px-4 py-3 border-b border-gray-100 last:border-0">
      <div className="w-9 h-9 rounded-xl bg-green-50 flex items-center justify-center flex-shrink-0">
        <Wallet className="w-4 h-4 text-green-600" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-900">
          {formatCurrency(payment.amount)}
        </p>
        <p className="text-xs text-gray-400">
          {PAYMENT_METHOD_LABEL[payment.method]}
          {payment.reference_no && ` · ${payment.reference_no}`}
          {payment.notes && ` · ${payment.notes}`}
        </p>
      </div>
      <span className="text-xs text-gray-400 flex-shrink-0">
        {formatDateTime(payment.paid_at)}
      </span>
      <button
        onClick={onDelete}
        disabled={deleting}
        className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition disabled:opacity-50 flex-shrink-0">
        {deleting ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Trash2 className="w-4 h-4" />
        )}
      </button>
    </div>
  );
}

export default function InvoiceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();

  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [confirmDeletePayment, setConfirmDeletePayment] =
    useState<Payment | null>(null);

  const { data: invoice, isLoading } = useQuery({
    queryKey: ["invoice", id],
    queryFn: () => invoiceApi.getById(id),
  });

  const deletePaymentMutation = useMutation({
    mutationFn: (paymentId: string) => invoiceApi.deletePayment(id, paymentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoice", id] });
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      toast.success("Pembayaran berhasil dihapus");
      setConfirmDeletePayment(null);
    },
    onError: (err: unknown) => {
      const message =
        err instanceof ApiRequestError ? err.message : "Gagal menghapus pembayaran";
      toast.error(message);
    },
  });

  if (isLoading) return <SectionLoader />;
  if (!invoice)
    return (
      <div className="p-6 text-center">
        <p className="text-gray-500">Invoice tidak ditemukan</p>
      </div>
    );

  const payments = invoice.payments ?? [];
  const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
  const remaining = Math.max(0, invoice.total - totalPaid);

  return (
    <>
      <Header title={invoice.invoice_no} subtitle="Detail invoice & pembayaran" />

      <div className="p-6 space-y-6 max-w-3xl">
        <button
          onClick={() => router.push("/operator/invoices")}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-900 text-sm transition">
          <ArrowLeft className="w-4 h-4" /> Kembali ke daftar invoice
        </button>

        {/* Header card */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center flex-shrink-0">
                <Receipt className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-lg font-bold text-gray-900">
                    {invoice.invoice_no}
                  </h2>
                  <Badge variant={invoiceStatusVariant[invoice.status]}>
                    {invoiceStatusLabel[invoice.status]}
                  </Badge>
                </div>
                {invoice.service?.vehicle && (
                  <p className="text-sm text-gray-500 mt-0.5">
                    {invoice.service.vehicle.plate_number} —{" "}
                    {invoice.service.vehicle.brand} {invoice.service.vehicle.model}
                  </p>
                )}
                {invoice.service?.vehicle?.customer && (
                  <div className="flex items-center gap-1.5 text-xs text-gray-400 mt-1.5">
                    <User className="w-3.5 h-3.5" />
                    {invoice.service.vehicle.customer.name}
                  </div>
                )}
              </div>
            </div>

            {invoice.status !== "paid" && (
              <button
                onClick={() => setPaymentModalOpen(true)}
                className={cn(btnPrimary, "px-4 py-2.5 text-sm")}>
                <Plus className="w-4 h-4" /> Catat Pembayaran
              </button>
            )}
          </div>

          {/* Breakdown */}
          <div className="mt-5 pt-5 border-t border-gray-100 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Subtotal</span>
              <span className="text-gray-900 font-medium">
                {formatCurrency(invoice.subtotal)}
              </span>
            </div>
            {invoice.tax > 0 && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Pajak</span>
                <span className="text-gray-900 font-medium">
                  {formatCurrency(invoice.tax)}
                </span>
              </div>
            )}
            {invoice.discount > 0 && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Diskon</span>
                <span className="text-red-600 font-medium">
                  -{formatCurrency(invoice.discount)}
                </span>
              </div>
            )}
            <div className="flex items-center justify-between pt-2 border-t border-gray-100">
              <span className="text-sm font-bold text-gray-900">Total</span>
              <span className="text-lg font-bold text-gray-900">
                {formatCurrency(invoice.total)}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Sudah dibayar</span>
              <span className="text-green-600 font-semibold">
                {formatCurrency(totalPaid)}
              </span>
            </div>
            {remaining > 0 && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Sisa tagihan</span>
                <span className="text-red-600 font-semibold">
                  {formatCurrency(remaining)}
                </span>
              </div>
            )}
          </div>

          {invoice.due_date && (
            <p className="text-xs text-gray-400 mt-3">
              Jatuh tempo: {formatDateTime(invoice.due_date)}
            </p>
          )}
        </div>

        {/* Payment history */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h3 className="text-sm font-bold text-gray-900">
              Riwayat Pembayaran
            </h3>
          </div>

          {payments.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">
              Belum ada pembayaran tercatat
            </p>
          ) : (
            <div>
              {payments.map((p) => (
                <PaymentRow
                  key={p.id}
                  payment={p}
                  onDelete={() => setConfirmDeletePayment(p)}
                  deleting={
                    deletePaymentMutation.isPending &&
                    deletePaymentMutation.variables === p.id
                  }
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <AddPaymentModal
        open={paymentModalOpen}
        onClose={() => setPaymentModalOpen(false)}
        invoiceId={id}
        remaining={remaining}
      />

      <ConfirmDialog
        open={!!confirmDeletePayment}
        onClose={() => setConfirmDeletePayment(null)}
        onConfirm={() =>
          confirmDeletePayment &&
          deletePaymentMutation.mutate(confirmDeletePayment.id)
        }
        title="Hapus Pembayaran"
        description={`Yakin ingin menghapus pembayaran sebesar ${
          confirmDeletePayment ? formatCurrency(confirmDeletePayment.amount) : ""
        }? Status invoice akan dihitung ulang.`}
        confirmLabel="Ya, Hapus"
        loading={deletePaymentMutation.isPending}
      />
    </>
  );
}
