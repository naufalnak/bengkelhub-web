import { Wrench } from "lucide-react";

interface PageLoaderProps {
  text?: string;
}

export function PageLoader({ text = "Memuat..." }: PageLoaderProps) {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center gap-4"
      style={{ background: "#060f20" }}>
      <div className="relative">
        <div className="w-16 h-16 rounded-2xl bg-red-600/15 border border-red-600/25 flex items-center justify-center">
          <Wrench className="w-7 h-7 text-red-400" />
        </div>
        <div className="absolute -inset-1 rounded-2xl border-2 border-transparent border-t-red-600 animate-spin" />
      </div>
      <p className="text-slate-500 text-sm">{text}</p>
    </div>
  );
}

export function SectionLoader() {
  return (
    <div className="flex items-center justify-center py-16">
      <div className="w-8 h-8 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}
