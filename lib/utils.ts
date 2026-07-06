import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number | string): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(Number(amount));
}

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(date));
}

export function formatDateShort(date: Date | string): string {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

export function formatDateTime(date: Date | string): string {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

// Normalisasi nomor HP Indonesia (format lokal "0812...", "62812...", atau
// yang sudah "+62812...") ke format E.164 ("+62812...") yang divalidasi
// backend (validate:"e164"). Tanpa ini, nomor yang diketik user pakai awalan
// "0" (paling umum di Indonesia) bakal DITOLAK backend saat register.
export function toE164(phone: string): string {
  const digits = phone.replace(/[^\d+]/g, "");
  if (digits.startsWith("+")) return digits;
  if (digits.startsWith("62")) return "+" + digits;
  if (digits.startsWith("0")) return "+62" + digits.slice(1);
  return "+62" + digits;
}

// ─── Shared class strings ─────────────────────────────────────────────────────

export const inputClass =
  "w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0B1C3D] focus:border-transparent transition bg-white text-gray-900 placeholder-gray-400";

export const labelClass = "block text-sm font-semibold text-gray-700 mb-1.5";

export const btnPrimary =
  "bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl transition shadow-sm disabled:opacity-70 flex items-center justify-center gap-2";

export const btnSecondary =
  "bg-[var(--navy)] hover:bg-[var(--navy-light)] text-white font-semibold rounded-xl transition disabled:opacity-70 flex items-center justify-center gap-2";

export const btnOutline =
  "border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium rounded-xl transition flex items-center justify-center gap-2";

export const btnDanger =
  "bg-red-50 hover:bg-red-100 text-red-600 font-semibold rounded-xl transition disabled:opacity-70 flex items-center justify-center gap-2";
