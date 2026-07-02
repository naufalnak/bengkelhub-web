"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import {
  CheckCircle2,
  XCircle,
  Mail,
  Loader2,
  ArrowRight,
} from "lucide-react";
import { authApi, ApiRequestError } from "@/lib/api";
import { useAuthStore } from "@/store/auth";
import { cn, btnPrimary, btnOutline } from "@/lib/utils";
import { toast } from "@/components/ui/Toast";

// Komponen utama dipisah biar bisa dibungkus Suspense
// (Next.js wajib Suspense kalau komponen pakai useSearchParams)
function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const status = searchParams.get("status"); // "success" | "error" | null
  const message = searchParams.get("message");
  const { isAuthenticated } = useAuthStore();
  const [resent, setResent] = useState(false);

  const resendMutation = useMutation({
    mutationFn: () => authApi.resendVerification(),
    onSuccess: () => {
      setResent(true);
      toast.success("Email verifikasi berhasil dikirim ulang, cek inbox kamu");
    },
    onError: (err: unknown) => {
      const msg =
        err instanceof ApiRequestError ? err.message : "Gagal mengirim ulang email";
      toast.error(msg);
    },
  });

  // ── Success state ────────────────────────────────────────────
  if (status === "success") {
    return (
      <div className="text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-10 h-10 text-green-500" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Email Terverifikasi!
        </h1>
        <p className="text-gray-500 mb-8">
          Akun kamu sudah aktif. Sekarang kamu bisa menggunakan semua fitur
          BengkelHub.
        </p>
        <Link
          href="/"
          className={cn(
            btnPrimary,
            "px-6 py-3 text-sm inline-flex items-center gap-2",
          )}>
          Ke Beranda <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  // ── Error state ───────────────────────────────────────────────
  if (status === "error") {
    const isExpired =
      message?.toLowerCase().includes("expired") ||
      message?.toLowerCase().includes("kadaluarsa");

    return (
      <div className="text-center">
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <XCircle className="w-10 h-10 text-red-500" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          {isExpired ? "Link Kadaluarsa" : "Link Tidak Valid"}
        </h1>
        <p className="text-gray-500 mb-6">
          {isExpired
            ? "Link verifikasi ini sudah tidak berlaku (expired setelah 24 jam)."
            : "Link verifikasi tidak ditemukan atau sudah pernah dipakai."}
        </p>

        {isAuthenticated && !resent && (
          <button
            onClick={() => resendMutation.mutate()}
            disabled={resendMutation.isPending}
            className={cn(btnPrimary, "px-6 py-3 text-sm mb-4")}>
            {resendMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Mengirim...
              </>
            ) : (
              <>
                <Mail className="w-4 h-4" /> Kirim Ulang Email Verifikasi
              </>
            )}
          </button>
        )}

        {resent && (
          <div className="bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-3 rounded-xl mb-4">
            Email verifikasi baru sudah dikirim, cek inbox kamu.
          </div>
        )}

        {!isAuthenticated && (
          <p className="text-sm text-gray-400 mb-4">
            Login dulu untuk bisa kirim ulang email verifikasi.
          </p>
        )}

        <Link
          href="/"
          className={cn(
            btnOutline,
            "px-5 py-2.5 text-sm inline-flex items-center gap-2",
          )}>
          Kembali ke Beranda
        </Link>
      </div>
    );
  }

  // ── Default: belum ada status (user buka halaman langsung, bukan dari link) ──
  return (
    <div className="text-center">
      <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
        <Mail className="w-10 h-10 text-blue-500" />
      </div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">
        Verifikasi Email
      </h1>
      <p className="text-gray-500 mb-6">
        Cek email kamu dan klik link verifikasi yang sudah dikirim saat
        mendaftar.
      </p>
      <p className="text-sm text-gray-400 mb-6">
        Link berlaku selama <strong>24 jam</strong>.
      </p>

      {isAuthenticated && !resent && (
        <div className="space-y-3">
          <p className="text-sm text-gray-500">Tidak menerima email?</p>
          <button
            onClick={() => resendMutation.mutate()}
            disabled={resendMutation.isPending}
            className={cn(btnPrimary, "px-6 py-3 text-sm")}>
            {resendMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Mengirim...
              </>
            ) : (
              <>
                <Mail className="w-4 h-4" /> Kirim Ulang Email Verifikasi
              </>
            )}
          </button>
        </div>
      )}

      {resent && (
        <div className="bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-3 rounded-xl">
          Email verifikasi baru sudah dikirim, cek inbox kamu.
        </div>
      )}
    </div>
  );
}

// ── Page wrapper dengan Suspense ──────────────────────────────
export default function VerifyEmailPage() {
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

        {/* Content — dibungkus Suspense karena pakai useSearchParams */}
        <Suspense
          fallback={
            <div className="text-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-gray-400 mx-auto" />
            </div>
          }>
          <VerifyEmailContent />
        </Suspense>
      </div>
    </div>
  );
}
