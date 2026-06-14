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
  role: z.enum(["customer", "operator"]),
});

type FormData = z.infer<typeof schema>;

const inputClass =
  "w-full px-3.5 py-2.5 rounded-xl text-sm text-gray-900 placeholder-gray-400 border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 focus:bg-white transition";

const labelClass =
  "block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2";

export default function RegisterPage() {
  const router = useRouter();
  const login = useAuthStore((s) => s.login);

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { role: "operator" },
  });

  const selectedRole = watch("role");

  const onSubmit = async (data: FormData) => {
    setError("");
    try {
      const res = await authApi.register(data);
      login(res.token, res.user);

      if (res.user.role === "operator") {
        router.push("/operator/dashboard");
      } else {
        router.push("/workshops");
      }
    } catch (err) {
      if (err instanceof ApiRequestError) {
        setError(err.payload.error ?? "Terjadi kesalahan saat mendaftar");
      } else {
        setError("Terjadi kesalahan, coba lagi");
      }
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden"
      style={{
        background:
          "radial-gradient(ellipse at top left, #1e3a6e 0%, #152d55 40%, #0f2040 100%)",
      }}
    >
      {/* Dot grid */}
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
        }}
      >
        {/* ── LEFT PANEL ── */}
        <div
          className="hidden md:flex flex-col w-[45%] relative overflow-hidden p-8"
          style={{
            background:
              "linear-gradient(160deg, #1d4ed8 0%, #1e40af 40%, #1e3a8a 70%, #172554 100%)",
            minHeight: "640px",
          }}
        >
          {/* Dots */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage:
                "radial-gradient(rgba(255,255,255,0.05) 1px, transparent 1px)",
              backgroundSize: "24px 24px",
            }}
          />
          {/* Top glow */}
          <div
            className="absolute top-0 left-0 right-0 h-48 pointer-events-none"
            style={{
              background:
                "radial-gradient(ellipse at top, rgba(96,165,250,0.20) 0%, transparent 70%)",
            }}
          />

          {/* Content */}
          <div className="relative z-10 mb-6">
            <h2 className="text-3xl font-extrabold text-white leading-tight tracking-tight">
              BengkelHub
              <br />
              {selectedRole === "operator" ? "Operator Portal" : "Customer"}
            </h2>
            <p className="text-blue-200 text-sm mt-2">
              {selectedRole === "operator"
                ? "Kelola bengkel, jadwal, dan servis Anda"
                : "Temukan bengkel terpercaya di sekitar Anda"}
            </p>
          </div>

          {/* Decorative box */}
          <div className="relative z-10 flex-1 rounded-2xl overflow-hidden flex items-center justify-center"
            style={{
              background: "rgba(255,255,255,0.08)",
              border: "1px solid rgba(255,255,255,0.12)",
            }}
          >
            <Wrench className="w-24 h-24 text-white/10" />
          </div>

          {/* Info */}
          <div
            className="relative z-10 mt-6 rounded-2xl px-5 py-4"
            style={{
              background: "rgba(255,255,255,0.10)",
              border: "1px solid rgba(255,255,255,0.15)",
              backdropFilter: "blur(8px)",
            }}
          >
            <p className="text-white text-sm text-center leading-relaxed">
              {selectedRole === "operator"
                ? "Setelah daftar, bengkel Anda bisa langsung menerima booking dari ribuan customer di BengkelHub."
                : "Daftar sekarang dan booking servis bengkel terpercaya dengan mudah."}
            </p>
          </div>
        </div>

        {/* ── RIGHT PANEL: White form ── */}
        <div className="flex-1 flex flex-col justify-center px-8 py-10 bg-white relative overflow-y-auto">
          {/* Red accent strip */}
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
              Buat Akun BengkelHub
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              Mulai dalam 1 menit
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">
                {error}
              </div>
            )}

            {/* Role toggle */}
            <div>
              <label className={labelClass}>Daftar sebagai</label>
              <div className="grid grid-cols-2 gap-2">
                {(["operator", "customer"] as const).map((r) => (
                  <label
                    key={r}
                    className={`flex items-center justify-center gap-2 py-2.5 rounded-xl border text-sm font-semibold cursor-pointer transition ${
                      selectedRole === r
                        ? "bg-red-600 border-red-600 text-white"
                        : "bg-gray-50 border-gray-200 text-gray-600 hover:border-gray-300"
                    }`}
                  >
                    <input
                      {...register("role")}
                      type="radio"
                      value={r}
                      className="sr-only"
                    />
                    {r === "operator" ? "Operator Bengkel" : "Customer"}
                  </label>
                ))}
              </div>
            </div>

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
                <p className="text-red-500 text-xs mt-1.5">{errors.name.message}</p>
              )}
            </div>

            <div>
              <label className={labelClass}>
                Email <span className="text-red-500 normal-case">*</span>
              </label>
              <input
                {...register("email")}
                type="email"
                placeholder="email@contoh.com"
                autoComplete="email"
                className={inputClass}
              />
              {errors.email && (
                <p className="text-red-500 text-xs mt-1.5">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label className={labelClass}>
                No. Telepon <span className="text-red-500 normal-case">*</span>
              </label>
              <input
                {...register("phone")}
                placeholder="08123456789"
                className={inputClass}
              />
              {errors.phone && (
                <p className="text-red-500 text-xs mt-1.5">{errors.phone.message}</p>
              )}
            </div>

            <div>
              <label className={labelClass}>
                Password <span className="text-red-500 normal-case">*</span>
              </label>
              <div className="relative">
                <input
                  {...register("password")}
                  type={showPassword ? "text" : "password"}
                  placeholder="Minimal 6 karakter"
                  autoComplete="new-password"
                  className={`${inputClass} pr-10`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-500 text-xs mt-1.5">{errors.password.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-red-600 hover:bg-red-700 active:scale-[0.99] text-white font-bold py-2.5 rounded-xl text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-60 mt-2"
              style={{ boxShadow: "0 4px 14px rgba(220,38,38,0.25)" }}
            >
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
              className="text-red-600 hover:text-red-700 font-semibold transition"
            >
              Masuk ke dashboard
            </Link>
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="flex flex-col items-center gap-3 mt-5 relative z-10">
        <Link
          href="/"
          className="text-xs text-slate-500 hover:text-slate-300 transition"
        >
          ← Kembali ke halaman utama
        </Link>
      </div>
    </div>
  );
}
