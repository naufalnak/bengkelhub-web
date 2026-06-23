// components/landing/footer.tsx

import Link from "next/link";
import { Wrench, Phone, Mail } from "lucide-react";

const footerColumns = [
  {
    title: "Pelanggan",
    links: [
      { label: "Cari Bengkel", href: "/workshops" },
      { label: "Daftar Akun", href: "/register" },
      { label: "Masuk", href: "/login" },
      { label: "Booking Saya", href: "/bookings" },
    ],
  },
  {
    title: "Operator",
    links: [
      { label: "Daftarkan Bengkel", href: "/register" },
      { label: "Login Operator", href: "/login" },
      { label: "Dashboard", href: "/operator/dashboard" },
      { label: "Kelola Pesanan", href: "/operator/orders" },
    ],
  },
  {
    title: "Platform",
    links: [
      { label: "Cara Kerja", href: "#cara-kerja" },
      { label: "Fitur", href: "#layanan" },
      { label: "Tentang Kami", href: "#" },
      { label: "Kontak", href: "#" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="bg-[var(--navy)] text-gray-400 border-t border-white/10">
      <div className="max-w-7xl mx-auto px-6 pt-16 pb-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center">
                <Wrench className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="font-bold text-white block">BengkelHub</span>
                <span className="text-xs text-blue-400">
                  Platform Bengkel Indonesia
                </span>
              </div>
            </div>
            <p className="text-xs leading-relaxed mb-4">
              Platform bengkel kendaraan yang menghubungkan pelanggan dengan
              bengkel terpercaya di seluruh Indonesia.
            </p>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs">
                <Phone className="w-3.5 h-3.5 text-red-400" />
                <span>+62 812-3456-7890</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <Mail className="w-3.5 h-3.5 text-red-400" />
                <span>hello@bengkelhub.id</span>
              </div>
            </div>
          </div>

          {footerColumns.map(({ title, links }) => (
            <div key={title}>
              <h4 className="text-sm font-bold text-white mb-4 uppercase tracking-wider">
                {title}
              </h4>
              <div className="space-y-2.5">
                {links.map((l) => (
                  <Link
                    key={l.label}
                    href={l.href}
                    className="block text-xs hover:text-red-400 transition">
                    {l.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="text-xs">
            © {new Date().getFullYear()} BengkelHub. All rights reserved.
          </p>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span className="text-xs text-green-400">
              Semua sistem berjalan normal
            </span>
          </div>
          <p className="text-xs">Bangga Buatan Anak IT Lokal 🇮🇩</p>
        </div>
      </div>
    </footer>
  );
}
