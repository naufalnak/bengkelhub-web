"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <AlertTriangle className="w-8 h-8 text-red-600" />
        </div>
        <h1 className="text-xl font-bold text-gray-900 mb-2">
          Terjadi Kesalahan
        </h1>
        <p className="text-gray-500 text-sm leading-relaxed mb-2">
          Sesuatu yang tidak terduga terjadi. Coba refresh halaman atau kembali
          ke beranda.
        </p>
        {error.message && (
          <p className="text-xs text-gray-400 font-mono bg-gray-100 px-3 py-2 rounded-xl mb-8 truncate">
            {error.message}
          </p>
        )}
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={reset}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-red-600 hover:bg-red-700 transition shadow-sm">
            <RefreshCw className="w-4 h-4" /> Coba Lagi
          </button>
          <Link
            href="/"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 transition">
            <Home className="w-4 h-4" /> Ke Beranda
          </Link>
        </div>
      </div>
    </div>
  );
}
