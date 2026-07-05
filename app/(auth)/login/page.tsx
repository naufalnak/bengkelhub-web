"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, Loader2, Wrench } from "lucide-react";
import { authApi, ApiRequestError } from "@/lib/api";
import { useAuthStore } from "@/store/auth";
import { cn } from "@/lib/utils";

const schema = z.object({
  email: z.string().email("Email tidak valid"),
  password: z.string().min(6, "Password minimal 6 karakter"),
});
type FormData = z.infer<typeof schema>;

const SLIDES = [
  {
    title: "Kelola Bengkel Lebih Mudah",
    sub: "Satu platform untuk semua kebutuhan operasional bengkel Anda",
  },
  {
    title: "Pantau Semua Booking",
    sub: "Konfirmasi dan update status servis secara real-time",
  },
  {
    title: "Notifikasi WhatsApp",
    sub: "Customer dapat reminder otomatis H-1 sebelum servis",
  },
];

const inputClass =
  "w-full px-3.5 py-2.5 rounded-xl text-sm text-gray-900 placeholder-gray-400 border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 focus:bg-white transition";

const labelClass =
  "block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") ?? "/";
  const login = useAuthStore((s) => s.login);

  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [activeSlide, setActiveSlide] = useState(0);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % SLIDES.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const onSubmit = async (data: FormData) => {
    setError("");
    try {
      const res = await authApi.login(data);
      login(res.token, res.user);
      if (res.user.role === "operator") router.push("/operator/dashboard");
      else if (res.user.role === "customer") router.push("/workshops");
      else router.push(redirect);
    } catch (err) {
      if (err instanceof ApiRequestError)
        setError(err.message || "Email atau password salah");
      else setError("Terjadi kesalahan, coba lagi");
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4 py-8 relative overflow-hidden"
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
        {/* ── LEFT: Slide panel ── */}
        <div
          className="hidden md:flex flex-col w-[48%] p-10 relative overflow-hidden"
          style={{ background: "var(--navy)" }}>
          <div
            className="absolute inset-0 pointer-events-none opacity-20"
            style={{
              backgroundImage: "radial-gradient(white 1px, transparent 1px)",
              backgroundSize: "28px 28px",
            }}
          />

          <Link
            href="/"
            className="relative z-10 flex items-center gap-3 mb-12">
            <div className="w-9 h-9 bg-red-600 rounded-xl flex items-center justify-center shadow-lg">
              <Wrench className="w-4 h-4 text-white" />
            </div>
            <span className="text-white font-bold text-lg tracking-tight">
              Bengkel<span className="text-red-400">Hub</span>
            </span>
          </Link>

          <div className="relative z-10 flex-1 flex flex-col justify-center">
            <div className="space-y-8">
              {SLIDES.map((slide, i) => (
                <div
                  key={i}
                  className={cn(
                    "transition-all duration-500",
                    activeSlide === i ? "opacity-100" : "opacity-30",
                  )}>
                  <h2 className="text-white text-xl font-bold leading-tight">
                    {slide.title}
                  </h2>
                  <p className="text-blue-300 text-sm mt-1.5">{slide.sub}</p>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-2 mt-10">
              {SLIDES.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveSlide(i)}
                  className={cn(
                    "h-1.5 rounded-full transition-all duration-300",
                    activeSlide === i ? "w-6 bg-red-500" : "w-1.5 bg-white/30",
                  )}
                />
              ))}
            </div>
          </div>

          <p className="relative z-10 text-blue-400 text-xs mt-8">
            Platform manajemen bengkel terpercaya di Indonesia
          </p>
        </div>

        {/* ── RIGHT: Form (WHITE panel) ── */}
        <div className="flex-1 flex flex-col justify-center px-8 py-10 bg-white relative">
          {/* Red accent strip top */}
          <div
            className="absolute top-0 left-8 right-8 h-0.5"
            style={{
              background:
                "linear-gradient(90deg, transparent, #dc2626, transparent)",
            }}
          />

          {/* Mobile logo */}
          <Link href="/" className="flex md:hidden items-center gap-2.5 mb-8">
            <div className="w-9 h-9 bg-[var(--navy)] rounded-xl flex items-center justify-center">
              <Wrench className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-[var(--navy)] text-lg">
              Bengkel<span className="text-red-600">Hub</span>
            </span>
          </Link>

          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
              Selamat Datang Kembali
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              Masuk ke akun BengkelHub Anda
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">
                {error}
              </div>
            )}

            <div>
              <label className={labelClass}>Email</label>
              <input
                {...register("email")}
                type="email"
                placeholder="operator@bengkel.com"
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
              <label className={labelClass}>Password</label>
              <div className="relative">
                <input
                  {...register("password")}
                  type={showPass ? "text" : "password"}
                  placeholder="••••••••"
                  autoComplete="current-password"
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
                  <Loader2 className="w-4 h-4 animate-spin" /> Masuk...
                </>
              ) : (
                "Masuk"
              )}
            </button>
          </form>

          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-gray-100" />
            <span className="text-xs text-gray-400">atau</span>
            <div className="flex-1 h-px bg-gray-100" />
          </div>

          <p className="text-center text-sm text-gray-500">
            Belum punya akun?{" "}
            <Link
              href="/daftar"
              className="text-red-600 hover:text-red-700 font-semibold transition">
              Daftar sekarang
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
            href="/workshops"
            className="text-xs text-red-400 hover:text-red-300 font-semibold transition">
            Cari bengkel
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
