"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, Loader2, Wrench, ArrowRight } from "lucide-react";
import { authApi, ApiRequestError } from "@/lib/api";
import { useAuthStore } from "@/store/auth";

const schema = z.object({
  name: z.string().min(2, "Nama minimal 2 karakter"),
  email: z.string().email("Email tidak valid"),
  phone: z.string().min(9, "Nomor telepon tidak valid"),
  password: z.string().min(6, "Password minimal 6 karakter"),
});
type FormData = z.infer<typeof schema>;

const FEATURES = [
  "Kelola workshop & jadwal servis",
  "Terima booking dari customer",
  "Notifikasi WhatsApp otomatis",
];

const inputClass =
  "w-full px-3.5 py-2.5 rounded-xl text-sm text-gray-900 placeholder-gray-400 border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 focus:bg-white transition";

const labelClass =
  "block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2";

export default function RegisterPage() {
  const router = useRouter();
  const login = useAuthStore((s) => s.login);

  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setError("");
    try {
      const res = await authApi.register({ ...data, role: "operator" });
      login(res.token, res.user);
      router.push("/operator/dashboard");
    } catch (err) {
      if (err instanceof ApiRequestError)
        setError(err.message || "Terjadi kesalahan saat mendaftar");
      else setError("Terjadi kesalahan, coba lagi");
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden"
      style={{
        background:
          "radial-gradient(ellipse at top left, #1e3a6e 0%, #152d55 40%, #0f2040 100%)",
      }}>
      {/* Subtle dot grid */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(rgba(255,255,255,0.035) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />

      {/* Main split card */}
      <div
        className="w-full max-w-5xl relative z-10 rounded-3xl overflow-hidden flex"
        style={{
          boxShadow:
            "0 32px 80px rgba(0,0,0,0.45), 0 0 0 1px rgba(255,255,255,0.06)",
        }}>
        {/* ── LEFT PANEL: Blue gradient ── */}
        <div
          className="hidden md:flex flex-col w-[45%] relative overflow-hidden p-8"
          style={{
            background:
              "linear-gradient(160deg, #1d4ed8 0%, #1e40af 40%, #1e3a8a 70%, #172554 100%)",
            minHeight: "620px",
          }}>
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage:
                "radial-gradient(rgba(255,255,255,0.05) 1px, transparent 1px)",
              backgroundSize: "24px 24px",
            }}
          />
          <div
            className="absolute top-0 left-0 right-0 h-48 pointer-events-none"
            style={{
              background:
                "radial-gradient(ellipse at top, rgba(96,165,250,0.20) 0%, transparent 70%)",
            }}
          />

          <Link href="/" className="relative z-10 mb-6 inline-flex">
            <div className="w-9 h-9 bg-red-600 rounded-xl flex items-center justify-center shadow-lg">
              <Wrench className="w-4 h-4 text-white" />
            </div>
          </Link>

          <div className="relative z-10 mb-6">
            <h2 className="text-3xl font-extrabold text-white leading-tight tracking-tight">
              BengkelHub
              <br />
              Operator Portal
            </h2>
            <p className="text-blue-200 text-sm mt-2">
              Kelola bengkel, jadwal, dan servis Anda
            </p>
          </div>

          {/* Feature list */}
          <ul className="relative z-10 flex-1 space-y-3.5 mb-6">
            {FEATURES.map((f) => (
              <li
                key={f}
                className="flex items-center gap-2.5 text-sm text-blue-100">
                <div className="w-5 h-5 rounded-full bg-white/15 border border-white/25 flex items-center justify-center flex-shrink-0">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-400" />
                </div>
                {f}
              </li>
            ))}
          </ul>

          {/* Info box */}
          <div
            className="relative z-10 rounded-2xl px-5 py-4"
            style={{
              background: "rgba(255,255,255,0.10)",
              border: "1px solid rgba(255,255,255,0.15)",
              backdropFilter: "blur(8px)",
            }}>
            <p className="text-white text-sm text-center leading-relaxed">
              Setelah daftar, bengkel Anda bisa langsung menerima booking dari
              ribuan customer di BengkelHub.
            </p>
          </div>
        </div>

        {/* ── RIGHT PANEL: White form ── */}
        <div className="flex-1 flex flex-col justify-center px-8 py-10 bg-white relative overflow-y-auto">
          <div
            className="absolute top-0 left-8 right-8 h-0.5"
            style={{
              background:
                "linear-gradient(90deg, transparent, #dc2626, transparent)",
            }}
          />

          {/* Brand */}
          <div className="text-center mb-6">
            <Link href="/" className="inline-flex items-center gap-2.5 mb-4">
              <div className="w-11 h-11 bg-red-600 rounded-xl flex items-center justify-center shadow-md shadow-red-200">
                <Wrench className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900 tracking-tight">
                Bengkel<span className="text-red-600">Hub</span>
              </span>
            </Link>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
              Daftarkan Bengkel Anda
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              Mulai terima booking online dalam 1 menit
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">
                {error}
              </div>
            )}

            <div>
              <label className={labelClass}>
                Nama Lengkap <span className="text-red-500 normal-case">*</span>
              </label>
              <input
                {...register("name")}
                placeholder="Budi Santoso"
                className={inputClass}
              />
              {errors.name && (
                <p className="text-red-500 text-xs mt-1.5">
                  {errors.name.message}
                </p>
              )}
            </div>

            <div>
              <label className={labelClass}>
                Email <span className="text-red-500 normal-case">*</span>
              </label>
              <input
                {...register("email")}
                type="email"
                placeholder="owner@bengkel.com"
                autoComplete="email"
                className={inputClass}
              />
              {errors.email && (
                <p className="text-red-500 text-xs mt-1.5">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div>
              <label className={labelClass}>No. Telepon</label>
              <input
                {...register("phone")}
                placeholder="08123456789"
                className={inputClass}
              />
              {errors.phone && (
                <p className="text-red-500 text-xs mt-1.5">
                  {errors.phone.message}
                </p>
              )}
            </div>

            <div>
              <label className={labelClass}>
                Password <span className="text-red-500 normal-case">*</span>
              </label>
              <div className="relative">
                <input
                  {...register("password")}
                  type={showPass ? "text" : "password"}
                  placeholder="Minimal 6 karakter"
                  autoComplete="new-password"
                  className={`${inputClass} pr-10`}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition">
                  {showPass ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-500 text-xs mt-1.5">
                  {errors.password.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-red-600 hover:bg-red-700 active:scale-[0.99] text-white font-bold py-2.5 rounded-xl text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-60 mt-2"
              style={{ boxShadow: "0 4px 14px rgba(220,38,38,0.25)" }}>
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Mendaftar...
                </>
              ) : (
                <>
                  Daftar Sekarang <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-gray-100" />
            <span className="text-xs text-gray-400">atau</span>
            <div className="flex-1 h-px bg-gray-100" />
          </div>

          <p className="text-center text-sm text-gray-500">
            Sudah punya akun?{" "}
            <Link
              href="/login"
              className="text-red-600 hover:text-red-700 font-semibold transition">
              Masuk ke dashboard
            </Link>
          </p>
        </div>
      </div>

      {/* Footer links */}
      <div className="flex flex-col items-center gap-3 mt-5 relative z-10">
        <div
          className="inline-flex items-center gap-2 rounded-full px-4 py-1.5"
          style={{
            background: "rgba(255,255,255,0.07)",
            border: "1px solid rgba(255,255,255,0.12)",
          }}>
          <span className="text-xs text-slate-400">Mau booking servis?</span>
          <div className="w-1 h-1 rounded-full bg-slate-600" />
          <Link
            href="/daftar"
            className="text-xs text-red-400 hover:text-red-300 font-semibold transition">
            Daftar sebagai customer
          </Link>
        </div>
        <Link
          href="/"
          className="text-xs text-slate-500 hover:text-slate-300 transition">
          ← Kembali ke halaman utama
        </Link>
      </div>
    </div>
  );
}
