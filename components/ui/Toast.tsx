"use client";

import { useEffect, useState, useCallback } from "react";
import { CheckCircle2, XCircle, Info, X } from "lucide-react";
import { cn } from "@/lib/utils";

export type ToastType = "success" | "error" | "info";

interface Toast {
  id: string;
  type: ToastType;
  message: string;
}

type ToastListener = (t: Toast) => void;
const listeners: ToastListener[] = [];

export function toast(message: string, type: ToastType = "info") {
  const t: Toast = { id: crypto.randomUUID(), type, message };
  listeners.forEach((l) => l(t));
}
toast.success = (m: string) => toast(m, "success");
toast.error = (m: string) => toast(m, "error");
toast.info = (m: string) => toast(m, "info");

const CONFIG = {
  success: { icon: CheckCircle2, cls: "text-green-600", bar: "bg-green-500" },
  error: { icon: XCircle, cls: "text-red-600", bar: "bg-red-500" },
  info: { icon: Info, cls: "text-blue-600", bar: "bg-blue-500" },
};

function ToastItem({
  toast,
  onDismiss,
}: {
  toast: Toast;
  onDismiss: () => void;
}) {
  const { icon: Icon, cls, bar } = CONFIG[toast.type];

  useEffect(() => {
    const t = setTimeout(onDismiss, 4000);
    return () => clearTimeout(t);
  }, [onDismiss]);

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden w-80 animate-in">
      {/* Progress bar */}
      <div className={cn("h-1 w-full", bar)} />
      <div className="flex items-start gap-3 p-4">
        <Icon className={cn("w-5 h-5 flex-shrink-0 mt-0.5", cls)} />
        <p className="text-sm text-gray-800 flex-1 leading-relaxed">
          {toast.message}
        </p>
        <button
          onClick={onDismiss}
          className="text-gray-400 hover:text-gray-600 transition flex-shrink-0">
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

export function ToastProvider() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const add = useCallback((t: Toast) => setToasts((p) => [...p, t]), []);
  const remove = useCallback(
    (id: string) => setToasts((p) => p.filter((t) => t.id !== id)),
    [],
  );

  useEffect(() => {
    listeners.push(add);
    return () => {
      const i = listeners.indexOf(add);
      if (i > -1) listeners.splice(i, 1);
    };
  }, [add]);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3">
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} onDismiss={() => remove(t.id)} />
      ))}
    </div>
  );
}
