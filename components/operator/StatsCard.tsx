import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface StatsCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  color?: "red" | "blue" | "green" | "amber";
  sub?: string;
  href?: string;
}

const colorMap = {
  red: { icon: "bg-red-50 text-red-600", ring: "hover:ring-red-100" },
  blue: { icon: "bg-blue-50 text-blue-600", ring: "hover:ring-blue-100" },
  green: { icon: "bg-green-50 text-green-600", ring: "hover:ring-green-100" },
  amber: { icon: "bg-amber-50 text-amber-600", ring: "hover:ring-amber-100" },
};

export function StatsCard({
  label,
  value,
  icon: Icon,
  color = "blue",
  sub,
  href,
}: StatsCardProps) {
  const c = colorMap[color];

  const inner = (
    <div
      className={cn(
        "bg-white rounded-2xl p-5 border border-gray-200 flex items-center gap-4 transition",
        href && "hover:shadow-md hover:ring-2 ring-transparent " + c.ring,
      )}>
      <div
        className={cn(
          "w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0",
          c.icon,
        )}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="min-w-0">
        <p className="text-gray-500 text-xs font-medium uppercase tracking-wider truncate">
          {label}
        </p>
        <p className="text-[#0B1C3D] text-2xl font-bold tracking-tight mt-0.5">
          {value}
        </p>
        {sub && <p className="text-gray-400 text-xs mt-0.5">{sub}</p>}
      </div>
    </div>
  );

  if (href) return <Link href={href}>{inner}</Link>;
  return inner;
}
