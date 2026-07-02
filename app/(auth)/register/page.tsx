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
import { cn, inputClass, labelClass, btnPrimary } from "@/lib/utils";

const schema = z.object({
  name: z.string().min(2, "Nama minimal 2 karakter"),
  email: z.string().email("Email tidak valid"),
  phone: z.string().min(9, "Nomor telepon tidak valid"),
  password: z.string().min(6, "Password minimal 6 karakter"),
  role: z.enum(["customer", "operator"]),
});
type FormData = z.infer<typeof schema>;

export default function RegisterPage() {
  const router = useRouter();
  const login = useAuthStore((s) => s.login);

  const [showPass, setShowPass] = useState(false);
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
      if (res.user.role === "operator") router.push("/operator/dashboard");
      else router.push("/workshops");
    } catch (err) {
      if (err instanceof ApiRequestError)
        setError(err.message || "Terjadi kesalahan saat mendaftar");
      else setError("Terjadi kesalahan, coba lagi");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-5xl bg-white rounded-3xl shadow-2xl overflow-hidden flex border border-gray-200">
        {/* ── LEFT: Navy panel ── */}
        <div
          className="hidden md:flex flex-col justify-between w-[42%] p-10 relative overflow-hidden"
          style={{ background: "var(--navy)" }}>
          {/* Dot grid */}
          <div
            className="absolute inset-0 pointer-events-none opacity-20"
            style={{
              backgroundImage: "radial-gradient(white 1px, transparent 1px)",
              backgroundSize: "28px 28px",
            }}
          />

          {/* Logo */}
          <div className="relative z-10 flex items-center gap-3">
            <div className="w-9 h-9 bg-red-600 rounded-xl flex items-center justify-center shadow-lg">
              <Wrench className="w-4 h-4 text-white" />
            </div>
            <span className="text-white font-bold text-lg">
              Bengkel<span className="text-red-400">Hub</span>
            </span>
          </div>

          {/* Content */}
          <div className="relative z-10">
            <h2 className="text-white text-2xl font-bold leading-tight">
              {selectedRole === "operator"
                ? "Bergabung sebagai Operator"
                : "Bergabung sebagai Customer"}
            </h2>
            <p className="text-blue-300 text-sm mt-2 leading-relaxed">
              {selectedRole === "operator"
                ? "Daftarkan bengkel Anda dan mulai terima booking dari ribuan customer."
                : "Temukan bengkel terpercaya dan booking servis dengan mudah."}
            </p>

            {/* Feature list */}
            <ul className="mt-6 space-y-3">
              {(selectedRole === "operator"
                ? [
                    "Kelola workshop & jadwal servis",
                    "Terima booking dari customer",
                    "Notifikasi WhatsApp otomatis",
                  ]
                : [
                    "Cari bengkel terdekat",
                    "Booking servis online",
                    "Pantau status servis real-time",
                  ]
              ).map((f) => (
                <li
                  key={f}
                  className="flex items-center gap-2.5 text-sm text-blue-200">
                  <div className="w-5 h-5 rounded-full bg-red-600/30 border border-red-500/50 flex items-center justify-center flex-shrink-0">
                    <div className="w-1.5 h-1.5 rounded-full bg-red-400" />
                  </div>
                  {f}
                </li>
              ))}
            </ul>
          </div>

          <p className="relative z-10 text-blue-400 text-xs">
            Platform manajemen bengkel terpercaya
          </p>
        </div>

        {/* ── RIGHT: Form ── */}
        <div className="flex-1 flex flex-col justify-center px-8 py-10 overflow-y-auto">
          {/* Mobile logo */}
          <div className="flex md:hidden items-center gap-2.5 mb-8">
            <div className="w-9 h-9 bg-[var(--navy)] rounded-xl flex items-center justify-center">
              <Wrench className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-[var(--navy)] text-lg">
              Bengkel<span className="text-red-600">Hub</span>
            </span>
          </div>

          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Buat Akun Baru</h1>
            <p className="text-gray-500 text-sm mt-1">Mulai dalam 1 menit</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl">
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
                    className={cn(
                      "flex items-center justify-center py-2.5 rounded-xl border text-sm font-semibold cursor-pointer transition",
                      selectedRole === r
                        ? "bg-[var(--navy)] border-[var(--navy)] text-white"
                        : "bg-white border-gray-200 text-gray-600 hover:border-gray-300",
                    )}>
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
              <label className={labelClass}>Nama Lengkap</label>
              <input
                {...register("name")}
                placeholder="Budi Santoso"
                className={cn(inputClass, errors.name && "border-red-400")}
              />
              {errors.name && (
                <p className="text-red-500 text-xs mt-1.5">
                  {errors.name.message}
                </p>
              )}
            </div>

            <div>
              <label className={labelClass}>Email</label>
              <input
                {...register("email")}
                type="email"
                placeholder="email@contoh.com"
                autoComplete="email"
                className={cn(inputClass, errors.email && "border-red-400")}
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
                className={cn(inputClass, errors.phone && "border-red-400")}
              />
              {errors.phone && (
                <p className="text-red-500 text-xs mt-1.5">
                  {errors.phone.message}
                </p>
              )}
            </div>

            <div>
              <label className={labelClass}>Password</label>
              <div className="relative">
                <input
                  {...register("password")}
                  type={showPass ? "text" : "password"}
                  placeholder="Minimal 6 karakter"
                  autoComplete="new-password"
                  className={cn(
                    inputClass,
                    "pr-10",
                    errors.password && "border-red-400",
                  )}
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
              className={cn(btnPrimary, "w-full py-2.5 text-sm mt-2")}>
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Mendaftar...
                </>
              ) : (
                <>
                  {" "}
                  Daftar Sekarang <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-gray-400">atau</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          <p className="text-center text-sm text-gray-500">
            Sudah punya akun?{" "}
            <Link
              href="/login"
              className="text-red-600 hover:text-red-700 font-semibold transition">
              Masuk sekarang
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
