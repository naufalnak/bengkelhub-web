"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { customerApi } from "@/lib/api";
import { ApiRequestError } from "@/lib/api";
import { Modal } from "@/components/ui/Modal";
import {
  cn,
  inputClass,
  labelClass,
  btnPrimary,
  btnOutline,
} from "@/lib/utils";
import { toast } from "@/components/ui/Toast";
import type { Customer } from "@/lib/types";

const schema = z.object({
  name: z.string().min(2, "Nama minimal 2 karakter"),
  phone: z.string().optional().or(z.literal("")),
  email: z.string().email("Format email tidak valid").optional().or(z.literal("")),
  address: z.string().optional().or(z.literal("")),
});
type FormData = z.infer<typeof schema>;

interface CustomerModalProps {
  open: boolean;
  onClose: () => void;
  workshopId: string;
  customer?: Customer | null;
}

export function CustomerModal({
  open,
  onClose,
  workshopId,
  customer,
}: CustomerModalProps) {
  const queryClient = useQueryClient();
  const isEdit = !!customer;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    if (customer) {
      reset({
        name: customer.name,
        phone: customer.phone,
        email: customer.email,
        address: customer.address,
      });
    } else {
      reset({ name: "", phone: "", email: "", address: "" });
    }
  }, [customer, reset]);

  const mutation = useMutation({
    mutationFn: (data: FormData) =>
      isEdit
        ? customerApi.update(customer!.id, data)
        : customerApi.create(workshopId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers", workshopId] });
      toast.success(
        isEdit ? "Pelanggan berhasil diperbarui" : "Pelanggan berhasil ditambahkan",
      );
      onClose();
    },
    onError: (err: unknown) => {
      const message =
        err instanceof ApiRequestError ? err.message : "Gagal menyimpan pelanggan";
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
        form="customer-form"
        disabled={mutation.isPending}
        className={cn(btnPrimary, "flex-1 py-2.5 text-sm")}>
        {mutation.isPending ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" /> Menyimpan...
          </>
        ) : isEdit ? (
          "Simpan Perubahan"
        ) : (
          "Tambah Pelanggan"
        )}
      </button>
    </div>
  );

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? "Edit Pelanggan" : "Tambah Pelanggan"}
      subtitle={
        isEdit
          ? "Update data pelanggan"
          : "Catat data pelanggan walk-in (tidak perlu akun login)"
      }
      footer={footer}>
      <form
        id="customer-form"
        onSubmit={handleSubmit((d) => mutation.mutate(d))}
        className="space-y-4">
        <div>
          <label className={labelClass}>Nama Pelanggan</label>
          <input
            {...register("name")}
            placeholder="Budi Santoso"
            className={cn(inputClass, errors.name && "border-red-400")}
          />
          {errors.name && (
            <p className="text-red-500 text-xs mt-1.5">{errors.name.message}</p>
          )}
        </div>
        <div>
          <label className={labelClass}>No. Telepon</label>
          <input
            {...register("phone")}
            placeholder="081234567890"
            className={cn(inputClass, errors.phone && "border-red-400")}
          />
          {errors.phone && (
            <p className="text-red-500 text-xs mt-1.5">{errors.phone.message}</p>
          )}
        </div>
        <div>
          <label className={labelClass}>Email (opsional)</label>
          <input
            {...register("email")}
            placeholder="budi@email.com"
            className={cn(inputClass, errors.email && "border-red-400")}
          />
          {errors.email && (
            <p className="text-red-500 text-xs mt-1.5">{errors.email.message}</p>
          )}
        </div>
        <div>
          <label className={labelClass}>Alamat (opsional)</label>
          <textarea
            {...register("address")}
            placeholder="Jl. Kemang Raya No. 5..."
            rows={2}
            className={cn(inputClass, "resize-none", errors.address && "border-red-400")}
          />
          {errors.address && (
            <p className="text-red-500 text-xs mt-1.5">{errors.address.message}</p>
          )}
        </div>
      </form>
    </Modal>
  );
}
