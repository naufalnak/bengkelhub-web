import Link from "next/link";
import { Wrench, Home, Search } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 bg-[var(--navy)] rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl">
          <Wrench className="w-9 h-9 text-white" />
        </div>
        <h1 className="text-6xl font-black text-[var(--navy)] tracking-tight mb-2">
          404
        </h1>
        <h2 className="text-xl font-bold text-gray-900 mb-3">
          Halaman Tidak Ditemukan
        </h2>
        <p className="text-gray-500 text-sm leading-relaxed mb-8">
          Halaman yang Anda cari tidak ada atau sudah dipindahkan.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Link
            href="/"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-red-600 hover:bg-red-700 transition shadow-sm">
            <Home className="w-4 h-4" /> Ke Beranda
          </Link>
          <Link
            href="/workshops"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-gray-700 bg-white border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition">
            <Search className="w-4 h-4" /> Cari Bengkel
          </Link>
        </div>
      </div>
    </div>
  );
}
