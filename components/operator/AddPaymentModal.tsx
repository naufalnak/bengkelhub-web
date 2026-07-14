"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { invoiceApi, ApiRequestError } from "@/lib/api";
import { Modal } from "@/components/ui/Modal";
import {
  cn,
  inputClass,
  labelClass,
  btnPrimary,
  btnOutline,
  formatCurrency,
} from "@/lib/utils";
import { toast } from "@/components/ui/Toast";
import type { PaymentMethod } from "@/lib/types";

const METHODS: { value: PaymentMethod; label: string }[] = [
  { value: "cash", label: "Tunai" },
  { value: "transfer", label: "Transfer" },
  { value: "qris", label: "QRIS" },
];

const schema = z.object({
  amount: z.number().min(1, "Jumlah pembayaran wajib diisi"),
  method: z.enum(["cash", "transfer", "qris"]),
  reference_no: z.string().optional().or(z.literal("")),
  notes: z.string().optional().or(z.literal("")),
});
type FormData = z.infer<typeof schema>;

interface AddPaymentModalProps {
  open: boolean;
  onClose: () => void;
  invoiceId: string;
  remaining: number;
}

export function AddPaymentModal({
  open,
  onClose,
  invoiceId,
  remaining,
}: AddPaymentModalProps) {
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      amount: remaining,
      method: "cash",
      reference_no: "",
      notes: "",
    },
  });

  const method = watch("method");

  const mutation = useMutation({
    mutationFn: (data: FormData) => invoiceApi.addPayment(invoiceId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoice", invoiceId] });
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      toast.success("Pembayaran berhasil dicatat");
      reset();
      onClose();
    },
    onError: (err: unknown) => {
      const message =
        err instanceof ApiRequestError ? err.message : "Gagal mencatat pembayaran";
      toast.error(message);
    },
  });

  const footer = (
    <div className="flex gap-3">
      <button
        type="button"
        onClick={onClose}
        className={cn(btnOutline, "flex-1 py-2.5 text-sm")}>
        Batal
      </button>
      <button
        type="submit"
        form="payment-form"
        disabled={mutation.isPending}
        className={cn(btnPrimary, "flex-1 py-2.5 text-sm")}>
        {mutation.isPending ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" /> Memproses...
          </>
        ) : (
          "Catat Pembayaran"
        )}
      </button>
    </div>
  );

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Catat Pembayaran"
      subtitle={`Sisa tagihan: ${formatCurrency(remaining)}`}
      size="sm"
      footer={footer}>
      <form
        id="payment-form"
        onSubmit={handleSubmit((d) => mutation.mutate(d))}
        className="space-y-4">
        <div>
          <label className={labelClass}>Jumlah Bayar</label>
          <input
            {...register("amount", { valueAsNumber: true })}
            type="number"
            min={1}
            className={cn(inputClass, errors.amount && "border-red-400")}
          />
          {errors.amount && (
            <p className="text-red-500 text-xs mt-1.5">
              {errors.amount.message}
            </p>
          )}
          <button
            type="button"
            onClick={() => setValue("amount", remaining)}
            className="text-xs text-red-600 hover:text-red-700 font-semibold mt-1.5 transition">
            Bayar lunas ({formatCurrency(remaining)})
          </button>
        </div>

        <div>
          <label className={labelClass}>Metode Pembayaran</label>
          <div className="grid grid-cols-3 gap-2">
            {METHODS.map((m) => (
              <button
                key={m.value}
                type="button"
                onClick={() => setValue("method", m.value)}
                className={cn(
                  "px-3 py-2 rounded-lg text-xs font-semibold border transition",
                  method === m.value
                    ? "bg-[var(--navy)] text-white border-[var(--navy)]"
                    : "bg-white text-gray-600 border-gray-200 hover:border-gray-300",
                )}>
                {m.label}
              </button>
            ))}
          </div>
        </div>

        {method !== "cash" && (
          <div>
            <label className={labelClass}>No. Referensi (opsional)</label>
            <input
              {...register("reference_no")}
              placeholder="TRX20260701001"
              className={inputClass}
            />
          </div>
        )}

        <div>
          <label className={labelClass}>Catatan (opsional)</label>
          <input
            {...register("notes")}
            placeholder="Bayar DP / Pelunasan..."
            className={inputClass}
          />
        </div>
      </form>
    </Modal>
  );
}
