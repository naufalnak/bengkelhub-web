"use client";

import { Bell, Menu } from "lucide-react";
import { useAuthStore } from "@/store/auth";

interface HeaderProps {
  title: string;
  subtitle?: string;
  onMenuClick?: () => void;
}

export function Header({ title, subtitle, onMenuClick }: HeaderProps) {
  const user = useAuthStore((s) => s.user);

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 shadow-sm flex-shrink-0">
      <div className="flex items-center gap-3">
        {/* Mobile hamburger */}
        {onMenuClick && (
          <button
            onClick={onMenuClick}
            className="md:hidden p-2 rounded-xl hover:bg-gray-100 transition -ml-1">
            <Menu className="w-5 h-5 text-gray-500" />
          </button>
        )}
        <div>
          <h1 className="text-lg font-bold text-[#0B1C3D]">{title}</h1>
          {subtitle && (
            <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Bell */}
        <button className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-gray-100 transition relative">
          <Bell className="w-4 h-4 text-gray-500" />
        </button>

        {/* User */}
        <div className="flex items-center gap-2.5 pl-3 border-l border-gray-200">
          <div className="w-9 h-9 rounded-xl bg-[var(--navy)] flex items-center justify-center text-white text-sm font-bold shadow-md">
            {user?.name?.charAt(0).toUpperCase() ?? "U"}
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-semibold text-gray-900 leading-tight">
              {user?.name}
            </p>
            <p className="text-xs text-gray-400 leading-tight">{user?.email}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
