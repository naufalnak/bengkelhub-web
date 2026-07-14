"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { serviceApi, ApiRequestError } from "@/lib/api";
import { Modal } from "@/components/ui/Modal";
import {
  cn,
  inputClass,
  labelClass,
  btnPrimary,
  btnOutline,
} from "@/lib/utils";
import { toast } from "@/components/ui/Toast";

const schema = z.object({
  name: z.string().min(2, "Nama item minimal 2 karakter"),
  description: z.string().optional().or(z.literal("")),
  qty: z.number().min(1, "Qty minimal 1"),
  unit_price: z.number().min(0, "Harga tidak boleh negatif"),
});
type FormData = z.infer<typeof schema>;

interface ServiceItemModalProps {
  open: boolean;
  onClose: () => void;
  serviceId: string;
}

export function ServiceItemModal({
  open,
  onClose,
  serviceId,
}: ServiceItemModalProps) {
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", description: "", qty: 1, unit_price: 0 },
  });

  const mutation = useMutation({
    mutationFn: (data: FormData) => serviceApi.addItem(serviceId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["service", serviceId] });
      toast.success("Item berhasil ditambahkan");
      reset();
      onClose();
    },
    onError: (err: unknown) => {
      const message =
        err instanceof ApiRequestError ? err.message : "Gagal menambahkan item";
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
        form="service-item-form"
        disabled={mutation.isPending}
        className={cn(btnPrimary, "flex-1 py-2.5 text-sm")}>
        {mutation.isPending ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" /> Menyimpan...
          </>
        ) : (
          "Tambah Item"
        )}
      </button>
    </div>
  );

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Tambah Item Servis"
      subtitle="Sparepart atau jasa yang dikerjakan"
      size="sm"
      footer={footer}>
      <form
        id="service-item-form"
        onSubmit={handleSubmit((d) => mutation.mutate(d))}
        className="space-y-4">
        <div>
          <label className={labelClass}>Nama Item</label>
          <input
            {...register("name")}
            placeholder="Kampas Rem Depan / Jasa Servis Rutin"
            className={cn(inputClass, errors.name && "border-red-400")}
          />
          {errors.name && (
            <p className="text-red-500 text-xs mt-1.5">{errors.name.message}</p>
          )}
        </div>

        <div>
          <label className={labelClass}>Deskripsi (opsional)</label>
          <input
            {...register("description")}
            placeholder="Kampas rem cakram depan original"
            className={inputClass}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>Qty</label>
            <input
              {...register("qty", { valueAsNumber: true })}
              type="number"
              min={1}
              className={cn(inputClass, errors.qty && "border-red-400")}
            />
            {errors.qty && (
              <p className="text-red-500 text-xs mt-1.5">{errors.qty.message}</p>
            )}
          </div>
          <div>
            <label className={labelClass}>Harga Satuan</label>
            <input
              {...register("unit_price", { valueAsNumber: true })}
              type="number"
              min={0}
              placeholder="50000"
              className={cn(
                inputClass,
                errors.unit_price && "border-red-400",
              )}
            />
            {errors.unit_price && (
              <p className="text-red-500 text-xs mt-1.5">
                {errors.unit_price.message}
              </p>
            )}
          </div>
        </div>
      </form>
    </Modal>
  );
}
