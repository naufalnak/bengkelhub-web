import Link from "next/link";
import { Wrench, Home, Search } from "lucide-react";

export default function NotFound() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4 relative overflow-hidden"
      style={{
        background:
          "radial-gradient(ellipse at top left, #1e3a6e 0%, #0f2040 50%, #060f20 100%)",
      }}>
      {/* Dot grid */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(rgba(255,255,255,0.035) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />

      <div className="relative z-10 text-center max-w-md">
        {/* Icon */}
        <div className="relative inline-flex mb-8">
          <div className="w-24 h-24 rounded-3xl bg-red-600/15 border border-red-600/25 flex items-center justify-center">
            <Wrench className="w-10 h-10 text-red-400" />
          </div>
          <span
            className="absolute -top-3 -right-3 text-3xl font-black text-white/10"
            style={{ fontSize: "72px", lineHeight: 1 }}>
            ?
          </span>
        </div>

        {/* Text */}
        <h1 className="text-6xl font-black text-white tracking-tight mb-2">
          404
        </h1>
        <h2 className="text-xl font-bold text-white mb-3">
          Halaman Tidak Ditemukan
        </h2>
        <p className="text-slate-400 text-sm leading-relaxed mb-8">
          Halaman yang Anda cari tidak ada atau sudah dipindahkan. Mungkin
          URL-nya salah?
        </p>

        {/* Actions */}
        <div className="flex items-center justify-center gap-3 flex-wrap">
          <Link
            href="/"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-red-600 hover:bg-red-700 transition"
            style={{ boxShadow: "0 4px 14px rgba(220,38,38,0.25)" }}>
            <Home className="w-4 h-4" />
            Ke Beranda
          </Link>
          <Link
            href="/workshops"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-300 hover:text-white transition"
            style={{
              background: "rgba(255,255,255,0.07)",
              border: "1px solid rgba(255,255,255,0.10)",
            }}>
            <Search className="w-4 h-4" />
            Cari Bengkel
          </Link>
        </div>
      </div>
    </div>
  );
}
