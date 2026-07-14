"use client";

import { Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  CheckCircle2,
  Clock,
  XCircle,
  Loader2,
  ArrowLeft,
} from "lucide-react";
import { cn, btnPrimary, btnOutline } from "@/lib/utils";

function PaymentFinishContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Midtrans mengirimi query param ini setelah redirect
  const orderId = searchParams.get("order_id");
  const statusCode = searchParams.get("status_code");
  const transactionStatus = searchParams.get("transaction_status");
  const invoiceId = searchParams.get("invoice_id"); // dari callback URL kita

  // Tentukan state berdasarkan status dari Midtrans
  const isSuccess =
    transactionStatus === "settlement" ||
    transactionStatus === "capture" ||
    statusCode === "200";

  const isPending =
    transactionStatus === "pending" || statusCode === "201";

  const isFailed =
    transactionStatus === "cancel" ||
    transactionStatus === "deny" ||
    transactionStatus === "expire" ||
    transactionStatus === "failure" ||
    statusCode === "202";

  if (isSuccess) {
    return (
      <div className="text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-10 h-10 text-green-500" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Pembayaran Berhasil!
        </h1>
        <p className="text-gray-500 mb-2">
          Terima kasih, pembayaran Anda sudah diterima.
        </p>
        {orderId && (
          <p className="text-xs text-gray-400 mb-8">
            ID Transaksi: <span className="font-mono">{orderId}</span>
          </p>
        )}
        <div className="flex gap-3 justify-center flex-wrap">
          {invoiceId && (
            <Link
              href={`/operator/invoices/${invoiceId}`}
              className={cn(btnPrimary, "px-5 py-2.5 text-sm")}>
              Lihat Invoice
            </Link>
          )}
          <button
            onClick={() => router.push("/operator/invoices")}
            className={cn(btnOutline, "px-5 py-2.5 text-sm")}>
            <ArrowLeft className="w-4 h-4" /> Ke Daftar Invoice
          </button>
        </div>
      </div>
    );
  }

  if (isPending) {
    return (
      <div className="text-center">
        <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Clock className="w-10 h-10 text-amber-500" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Pembayaran Diproses
        </h1>
        <p className="text-gray-500 mb-2">
          Pembayaran Anda sedang diverifikasi. Status invoice akan diperbarui
          otomatis setelah konfirmasi dari bank.
        </p>
        {orderId && (
          <p className="text-xs text-gray-400 mb-8">
            ID Transaksi: <span className="font-mono">{orderId}</span>
          </p>
        )}
        <div className="flex gap-3 justify-center flex-wrap">
          {invoiceId && (
            <Link
              href={`/operator/invoices/${invoiceId}`}
              className={cn(btnPrimary, "px-5 py-2.5 text-sm")}>
              Cek Status Invoice
            </Link>
          )}
          <button
            onClick={() => router.push("/operator/invoices")}
            className={cn(btnOutline, "px-5 py-2.5 text-sm")}>
            <ArrowLeft className="w-4 h-4" /> Ke Daftar Invoice
          </button>
        </div>
      </div>
    );
  }

  if (isFailed) {
    return (
      <div className="text-center">
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <XCircle className="w-10 h-10 text-red-500" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Pembayaran Gagal
        </h1>
        <p className="text-gray-500 mb-8">
          Transaksi dibatalkan atau gagal diproses. Silakan coba lagi.
        </p>
        <div className="flex gap-3 justify-center flex-wrap">
          {invoiceId && (
            <Link
              href={`/operator/invoices/${invoiceId}`}
              className={cn(btnPrimary, "px-5 py-2.5 text-sm")}>
              Coba Bayar Lagi
            </Link>
          )}
          <button
            onClick={() => router.push("/operator/invoices")}
            className={cn(btnOutline, "px-5 py-2.5 text-sm")}>
            <ArrowLeft className="w-4 h-4" /> Ke Daftar Invoice
          </button>
        </div>
      </div>
    );
  }

  // Default: loading / status tidak diketahui
  return (
    <div className="text-center">
      <Loader2 className="w-10 h-10 animate-spin text-gray-400 mx-auto mb-4" />
      <p className="text-gray-500 text-sm">Memuat status pembayaran...</p>
    </div>
  );
}

export default function PaymentFinishPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-gray-200 p-10">
        {/* Logo */}
        <div className="flex items-center gap-2 justify-center mb-8">
          <div className="w-9 h-9 rounded-xl bg-red-600 flex items-center justify-center">
            <span className="text-white font-black text-lg leading-none">B</span>
          </div>
          <span className="text-xl font-black text-gray-900">
            Bengkel<span className="text-red-600">Hub</span>
          </span>
        </div>

        <Suspense
          fallback={
            <div className="text-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-gray-400 mx-auto" />
            </div>
          }>
          <PaymentFinishContent />
        </Suspense>
      </div>
    </div>
  );
}
