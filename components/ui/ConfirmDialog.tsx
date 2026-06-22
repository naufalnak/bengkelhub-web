"use client";

import { AlertTriangle, Loader2 } from "lucide-react";
import { Modal } from "./Modal";
import { cn, btnPrimary, btnOutline } from "@/lib/utils";

interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  description?: string;
  confirmLabel?: string;
  loading?: boolean;
  variant?: "danger" | "primary";
}

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title = "Konfirmasi",
  description = "Apakah Anda yakin ingin melanjutkan tindakan ini?",
  confirmLabel = "Ya, Lanjutkan",
  loading = false,
  variant = "danger",
}: ConfirmDialogProps) {
  return (
    <Modal open={open} onClose={onClose} title="" size="sm">
      <div className="flex flex-col items-center text-center gap-3 py-2">
        <div
          className={cn(
            "w-12 h-12 rounded-2xl flex items-center justify-center",
            variant === "danger" ? "bg-red-50" : "bg-blue-50",
          )}>
          <AlertTriangle
            className={cn(
              "w-6 h-6",
              variant === "danger" ? "text-red-500" : "text-blue-500",
            )}
          />
        </div>
        <div>
          <h3 className="text-base font-bold text-gray-900">{title}</h3>
          <p className="text-sm text-gray-500 mt-1">{description}</p>
        </div>
        <div className="flex gap-3 w-full mt-2">
          <button
            onClick={onClose}
            disabled={loading}
            className={cn(btnOutline, "flex-1 py-2.5 text-sm")}>
            Batal
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={cn(
              "flex-1 py-2.5 text-sm rounded-xl font-semibold transition flex items-center justify-center gap-2 disabled:opacity-70",
              variant === "danger"
                ? "bg-red-600 hover:bg-red-700 text-white"
                : "bg-[var(--navy)] hover:bg-[var(--navy-light)] text-white",
            )}>
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Memproses...
              </>
            ) : (
              confirmLabel
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
}
