// Button variants
export const btn = {
  primary:
    "bg-red-600 hover:bg-red-700 text-white font-semibold transition shadow-sm disabled:opacity-70",
  secondary:
    "bg-[var(--navy)] hover:bg-[var(--navy-light)] text-white font-semibold transition disabled:opacity-70",
  outline:
    "border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium transition",
  ghost: "hover:bg-gray-100 text-gray-700 transition",
  danger:
    "bg-red-50 hover:bg-red-100 text-red-600 font-semibold transition disabled:opacity-70",
} as const;

// Badge variants
export const badge = {
  default: "bg-gray-100 text-gray-700",
  success: "bg-green-100 text-green-700",
  warning: "bg-amber-100 text-amber-700",
  danger: "bg-red-100 text-red-700",
  info: "bg-blue-100 text-blue-700",
  navy: "bg-[var(--navy)] text-white",
  purple: "bg-purple-100 text-purple-700",
} as const;

// Order status → badge variant mapping
export const orderStatusVariant: Record<string, keyof typeof badge> = {
  pending: "warning",
  confirmed: "info",
  in_progress: "purple",
  done: "success",
  cancelled: "default",
} as const;

export const orderStatusLabel: Record<string, string> = {
  pending: "Menunggu",
  confirmed: "Dikonfirmasi",
  in_progress: "Diproses",
  done: "Selesai",
  cancelled: "Dibatalkan",
} as const;
