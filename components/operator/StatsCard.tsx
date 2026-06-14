import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  color?: "red" | "blue" | "green" | "yellow";
  sub?: string;
}

const colorMap = {
  red: {
    bg: "rgba(220,38,38,0.10)",
    border: "rgba(220,38,38,0.20)",
    icon: "rgba(220,38,38,0.80)",
    glow: "rgba(220,38,38,0.08)",
  },
  blue: {
    bg: "rgba(59,130,246,0.10)",
    border: "rgba(59,130,246,0.20)",
    icon: "rgba(59,130,246,0.80)",
    glow: "rgba(59,130,246,0.08)",
  },
  green: {
    bg: "rgba(34,197,94,0.10)",
    border: "rgba(34,197,94,0.20)",
    icon: "rgba(34,197,94,0.80)",
    glow: "rgba(34,197,94,0.08)",
  },
  yellow: {
    bg: "rgba(234,179,8,0.10)",
    border: "rgba(234,179,8,0.20)",
    icon: "rgba(234,179,8,0.80)",
    glow: "rgba(234,179,8,0.08)",
  },
};

export function StatsCard({
  label,
  value,
  icon: Icon,
  color = "red",
  sub,
}: StatsCardProps) {
  const c = colorMap[color];

  return (
    <div
      className="rounded-2xl p-5 flex items-center gap-4"
      style={{
        background: "#0b1628",
        border: `1px solid rgba(255,255,255,0.07)`,
        boxShadow: `0 0 40px ${c.glow}`,
      }}>
      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: c.bg, border: `1px solid ${c.border}` }}>
        <Icon className="w-5 h-5" style={{ color: c.icon }} />
      </div>
      <div className="min-w-0">
        <p className="text-slate-400 text-xs font-medium uppercase tracking-wider">
          {label}
        </p>
        <p className="text-white text-2xl font-bold tracking-tight mt-0.5">
          {value}
        </p>
        {sub && <p className="text-slate-500 text-xs mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}
