import { Wrench } from "lucide-react";

export function PageLoader({ text = "Memuat..." }: { text?: string }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-gray-50">
      <div className="w-14 h-14 rounded-2xl bg-[var(--navy)] flex items-center justify-center">
        <Wrench className="w-6 h-6 text-white animate-pulse" />
      </div>
      <p className="text-gray-400 text-sm">{text}</p>
    </div>
  );
}

export function SectionLoader() {
  return (
    <div className="flex items-center justify-center py-16">
      <div className="w-7 h-7 border-2 border-[var(--navy)] border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

export function SkeletonRow() {
  return (
    <tr className="animate-pulse">
      {Array.from({ length: 5 }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <div className="h-4 bg-gray-100 rounded-lg" />
        </td>
      ))}
    </tr>
  );
}

export function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-200 animate-pulse space-y-3">
      <div className="flex gap-3">
        <div className="w-11 h-11 rounded-xl bg-gray-100" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-100 rounded-lg w-3/4" />
          <div className="h-3 bg-gray-100 rounded-lg w-1/3" />
        </div>
      </div>
      <div className="h-3 bg-gray-100 rounded-lg w-full" />
      <div className="h-3 bg-gray-100 rounded-lg w-4/5" />
    </div>
  );
}
