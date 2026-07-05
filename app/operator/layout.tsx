"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Mail, X } from "lucide-react";
import { Sidebar } from "@/components/layout/Sidebar";
import { PageLoader } from "@/components/ui/PageLoader";
import { useAuthStore } from "@/store/auth";
import { useUIStore } from "@/store/ui";

function EmailVerificationBanner() {
  const { user } = useAuthStore();
  const [dismissed, setDismissed] = useState(false);

  if (!user || user.email_verified || dismissed) return null;

  return (
    <div className="bg-amber-50 border-b border-amber-200 px-4 py-2.5 flex items-center justify-between gap-3">
      <div className="flex items-center gap-2 text-amber-800">
        <Mail className="w-4 h-4 flex-shrink-0" />
        <p className="text-xs font-medium">
          Email kamu belum diverifikasi.{" "}
          <Link
            href="/verify-email"
            className="underline hover:text-amber-900 font-semibold">
            Klik di sini
          </Link>{" "}
          untuk kirim ulang link verifikasi.
        </p>
      </div>
      <button
        onClick={() => setDismissed(true)}
        className="p-1 rounded hover:bg-amber-100 transition text-amber-600 flex-shrink-0">
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

export default function OperatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { isAuthenticated, role } = useAuthStore();
  const sidebarOpen = useUIStore((s) => s.sidebarOpen);
  const closeSidebar = useUIStore((s) => s.closeSidebar);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(id);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    if (!isAuthenticated) {
      router.replace("/login?redirect=/operator/dashboard");
      return;
    }
    if (role() !== "operator") router.replace("/");
  }, [mounted, isAuthenticated, role, router]);

  if (!mounted || !isAuthenticated || role() !== "operator") {
    return <PageLoader />;
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar open={sidebarOpen} onClose={closeSidebar} />
      <main className="flex-1 flex flex-col overflow-hidden min-w-0">
        <EmailVerificationBanner />
        {children}
      </main>
    </div>
  );
}
