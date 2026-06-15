"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import Link from "next/link";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error("App error:", error);
  }, [error]);

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4 relative overflow-hidden"
      style={{
        background:
          "radial-gradient(ellipse at top, #2d1515 0%, #0f2040 50%, #060f20 100%)",
      }}>
      {/* Dot grid */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(rgba(255,255,255,0.03) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />

      <div className="relative z-10 text-center max-w-md">
        {/* Icon */}
        <div className="w-20 h-20 rounded-3xl bg-red-600/15 border border-red-600/30 flex items-center justify-center mx-auto mb-6">
          <AlertTriangle className="w-9 h-9 text-red-400" />
        </div>

        <h1 className="text-2xl font-bold text-white mb-2">
          Terjadi Kesalahan
        </h1>
        <p className="text-slate-400 text-sm leading-relaxed mb-2">
          Sesuatu yang tidak terduga terjadi. Coba refresh halaman atau kembali
          ke beranda.
        </p>
        {error.message && (
          <p
            className="text-xs text-slate-600 font-mono mb-8 px-4 py-2 rounded-xl mx-auto max-w-xs truncate"
            style={{ background: "rgba(255,255,255,0.04)" }}>
            {error.message}
          </p>
        )}

        {/* Actions */}
        <div className="flex items-center justify-center gap-3 flex-wrap">
          <button
            onClick={reset}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-red-600 hover:bg-red-700 transition"
            style={{ boxShadow: "0 4px 14px rgba(220,38,38,0.25)" }}>
            <RefreshCw className="w-4 h-4" />
            Coba Lagi
          </button>
          <Link
            href="/"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-300 hover:text-white transition"
            style={{
              background: "rgba(255,255,255,0.07)",
              border: "1px solid rgba(255,255,255,0.10)",
            }}>
            <Home className="w-4 h-4" />
            Ke Beranda
          </Link>
        </div>
      </div>
    </div>
  );
}
