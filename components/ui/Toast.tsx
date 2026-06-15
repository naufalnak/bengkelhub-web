"use client";

import { useEffect, useState, useCallback } from "react";
import { CheckCircle, XCircle, AlertCircle, X } from "lucide-react";

export type ToastType = "success" | "error" | "info";

interface Toast {
  id: string;
  type: ToastType;
  message: string;
}

// ─── Global event bus ─────────────────────────────────────────────────────────

type ToastListener = (toast: Toast) => void;
const listeners: ToastListener[] = [];

export function toast(message: string, type: ToastType = "info") {
  const t: Toast = { id: crypto.randomUUID(), type, message };
  listeners.forEach((l) => l(t));
}

toast.success = (message: string) => toast(message, "success");
toast.error = (message: string) => toast(message, "error");
toast.info = (message: string) => toast(message, "info");

// ─── Config ───────────────────────────────────────────────────────────────────

const TOAST_CONFIG = {
  success: {
    icon: CheckCircle,
    color: "#22c55e",
    bg: "rgba(34,197,94,0.10)",
    border: "rgba(34,197,94,0.25)",
  },
  error: {
    icon: XCircle,
    color: "#ef4444",
    bg: "rgba(239,68,68,0.10)",
    border: "rgba(239,68,68,0.25)",
  },
  info: {
    icon: AlertCircle,
    color: "#3b82f6",
    bg: "rgba(59,130,246,0.10)",
    border: "rgba(59,130,246,0.25)",
  },
};

// ─── Toast item ───────────────────────────────────────────────────────────────

function ToastItem({
  toast,
  onDismiss,
}: {
  toast: Toast;
  onDismiss: () => void;
}) {
  const cfg = TOAST_CONFIG[toast.type];
  const Icon = cfg.icon;

  useEffect(() => {
    const t = setTimeout(onDismiss, 4000);
    return () => clearTimeout(t);
  }, [onDismiss]);

  return (
    <div
      className="flex items-start gap-3 px-4 py-3.5 rounded-2xl min-w-[280px] max-w-sm animate-in"
      style={{
        background: "#0f1f3d",
        border: `1px solid ${cfg.border}`,
        boxShadow: "0 16px 40px rgba(0,0,0,0.40)",
      }}>
      <Icon
        className="w-5 h-5 flex-shrink-0 mt-0.5"
        style={{ color: cfg.color }}
      />
      <p className="text-white text-sm flex-1 leading-relaxed">
        {toast.message}
      </p>
      <button
        onClick={onDismiss}
        className="text-slate-500 hover:text-white transition flex-shrink-0">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

// ─── Provider ─────────────────────────────────────────────────────────────────

export function ToastProvider() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((t: Toast) => {
    setToasts((prev) => [...prev, t]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  useEffect(() => {
    listeners.push(addToast);
    return () => {
      const i = listeners.indexOf(addToast);
      if (i > -1) listeners.splice(i, 1);
    };
  }, [addToast]);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3">
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} onDismiss={() => removeToast(t.id)} />
      ))}
    </div>
  );
}
