import { cn } from "@/lib/utils";
import { badge } from "@/lib/variants";

interface BadgeProps {
  children: React.ReactNode;
  variant?: keyof typeof badge;
  className?: string;
}

export function Badge({
  children,
  variant = "default",
  className,
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold",
        badge[variant],
        className,
      )}>
      {children}
    </span>
  );
}
