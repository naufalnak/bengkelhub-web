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

const schema = z.object({
  email: z.string().email("Email tidak valid"),
  password: z.string().min(6, "Password minimal 6 karakter"),
});

type FormData = z.infer<typeof schema>;

const SLIDES = [
  {
    title: "BengkelHub Operator Portal",
    subtitle: "Kelola bengkel, jadwal, dan servis Anda",
    color: "from-blue-900 to-slate-900",
  },
  {
    title: "Pantau Semua Booking",
    subtitle: "Lihat dan konfirmasi jadwal servis secara real-time",
    color: "from-slate-900 to-blue-950",
  },
  {
    title: "Laporan Lengkap",
    subtitle: "Analisis performa bengkel Anda setiap saat",
    color: "from-blue-950 to-slate-900",
  },
];

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") ?? "/operator/dashboard";

  const login = useAuthStore((s) => s.login);
  const role = useAuthStore((s) => s.role);

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [activeSlide, setActiveSlide] = useState(0);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

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

      // Redirect based on role
      const userRole = res.user.role;
      if (userRole === "operator") {
        router.push("/operator/dashboard");
      } else if (userRole === "customer") {
        router.push("/workshops");
      } else {
        router.push(redirect);
      }
    } catch (err) {
      if (err instanceof ApiRequestError) {
        setError(err.payload.error ?? "Email atau password salah");
      } else {
        setError("Terjadi kesalahan, coba lagi");
      }
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4 py-8 relative overflow-hidden"
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
        {/* ── LEFT: Carousel ── */}
        <div
          className="hidden md:flex relative w-[55%] overflow-hidden"
          style={{ minHeight: "540px" }}
        >
          {SLIDES.map((slide, i) => (
            <div
              key={i}
              className={`absolute inset-0 bg-gradient-to-br ${slide.color} transition-opacity duration-700 flex flex-col justify-end p-8`}
              style={{ opacity: activeSlide === i ? 1 : 0 }}
            >
              {/* Grid pattern overlay */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  backgroundImage:
                    "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)",
                  backgroundSize: "40px 40px",
                }}
              />
              {/* Icon decoration */}
              <div className="absolute top-10 left-10 w-24 h-24 rounded-full bg-white/5 flex items-center justify-center">
                <Wrench className="w-10 h-10 text-white/20" />
              </div>
              <div className="relative z-10">
                <h2 className="text-white text-2xl font-bold tracking-tight mb-1">
                  {slide.title}
                </h2>
                <p className="text-slate-300 text-sm">{slide.subtitle}</p>

                <div className="flex items-center gap-2 mt-4">
                  {SLIDES.map((_, j) => (
                    <button
                      key={j}
                      onClick={() => setActiveSlide(j)}
                      className="rounded-full transition-all duration-300"
                      style={{
                        width: activeSlide === j ? "20px" : "8px",
                        height: "8px",
                        background:
                          activeSlide === j
                            ? "#dc2626"
                            : "rgba(255,255,255,0.30)",
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ── RIGHT: Form ── */}
        <div className="flex-1 flex flex-col justify-center px-8 py-10 bg-white relative">
          {/* Red accent strip */}
          <div
            className="absolute top-0 left-8 right-8 h-0.5"
            style={{
              background:
                "linear-gradient(90deg, transparent, #dc2626, transparent)",
            }}
          />

          {/* Brand */}
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-2.5 mb-5">
              <div className="w-11 h-11 bg-red-600 rounded-xl flex items-center justify-center shadow-md shadow-red-200">
                <Wrench className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900 tracking-tight">
                Bengkel<span className="text-red-600">Hub</span>
              </span>
            </Link>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
              Selamat Datang Kembali!
            </h1>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Email
              </label>
              <input
                {...register("email")}
                type="email"
                placeholder="operator@bengkel.com"
                autoComplete="email"
                className="w-full px-3.5 py-2.5 rounded-xl text-sm text-gray-900 placeholder-gray-400 border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 focus:bg-white transition"
              />
              {errors.email && (
                <p className="text-red-500 text-xs mt-1.5">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Password
                </label>
              </div>
              <div className="relative">
                <input
                  {...register("password")}
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className="w-full px-3.5 py-2.5 rounded-xl text-sm text-gray-900 placeholder-gray-400 border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 focus:bg-white transition pr-10"
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
                <p className="text-red-500 text-xs mt-1.5">
                  {errors.password.message}
                </p>
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
                  <Loader2 className="w-4 h-4 animate-spin" /> Masuk...
                </>
              ) : (
                "Masuk ke Dashboard"
              )}
            </button>
          </form>

          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-gray-100" />
            <span className="text-xs text-gray-400">atau</span>
            <div className="flex-1 h-px bg-gray-100" />
          </div>

          <p className="text-center text-sm text-gray-500">
            Belum daftarkan bengkel?{" "}
            <Link
              href="/register"
              className="text-red-600 hover:text-red-700 font-semibold transition"
            >
              Daftar bengkel
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
          }}
        >
          <span className="text-xs text-slate-400">
            Cari bengkel untuk servis?
          </span>
          <div className="w-1 h-1 rounded-full bg-slate-600" />
          <Link
            href="/workshops"
            className="text-xs text-red-400 hover:text-red-300 font-semibold transition"
          >
            Cari bengkel sekarang
          </Link>
        </div>
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
