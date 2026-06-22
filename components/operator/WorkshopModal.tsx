"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { workshopApi } from "@/lib/api";
import { Modal } from "@/components/ui/Modal";
import {
  cn,
  inputClass,
  labelClass,
  btnPrimary,
  btnOutline,
} from "@/lib/utils";
import { toast } from "@/components/ui/Toast";
import type { Workshop } from "@/lib/types";

const schema = z.object({
  name: z.string().min(3, "Nama minimal 3 karakter"),
  address: z.string().min(5, "Alamat minimal 5 karakter"),
  city: z.string().min(2, "Kota minimal 2 karakter"),
  phone: z.string().min(9, "Nomor telepon tidak valid"),
  description: z.string().min(10, "Deskripsi minimal 10 karakter"),
});
type FormData = z.infer<typeof schema>;

interface WorkshopModalProps {
  open: boolean;
  onClose: () => void;
  workshop?: Workshop | null;
}

export function WorkshopModal({ open, onClose, workshop }: WorkshopModalProps) {
  const queryClient = useQueryClient();
  const isEdit = !!workshop;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    if (workshop) {
      reset({
        name: workshop.name,
        address: workshop.address,
        city: workshop.city,
        phone: workshop.phone,
        description: workshop.description,
      });
    } else {
      reset({ name: "", address: "", city: "", phone: "", description: "" });
    }
  }, [workshop, reset]);

  const mutation = useMutation({
    mutationFn: (data: FormData) =>
      isEdit
        ? workshopApi.update(workshop!.id, data)
        : workshopApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["operator-workshops"] });
      toast.success(
        isEdit
          ? "Workshop berhasil diperbarui"
          : "Workshop berhasil ditambahkan",
      );
      onClose();
    },
    onError: (err: Error) => {
      toast.error(err.message ?? "Gagal menyimpan workshop");
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
        form="workshop-form"
        disabled={mutation.isPending}
        className={cn(btnPrimary, "flex-1 py-2.5 text-sm")}>
        {mutation.isPending ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" /> Menyimpan...
          </>
        ) : isEdit ? (
          "Simpan Perubahan"
        ) : (
          "Tambah Workshop"
        )}
      </button>
    </div>
  );

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? "Edit Workshop" : "Tambah Workshop"}
      subtitle={isEdit ? "Update informasi bengkel" : "Daftarkan bengkel baru"}
      footer={footer}>
      <form
        id="workshop-form"
        onSubmit={handleSubmit((d) => mutation.mutate(d))}
        className="space-y-4">
        <div>
          <label className={labelClass}>Nama Bengkel</label>
          <input
            {...register("name")}
            placeholder="Bengkel Maju Jaya"
            className={cn(inputClass, errors.name && "border-red-400")}
          />
          {errors.name && (
            <p className="text-red-500 text-xs mt-1.5">{errors.name.message}</p>
          )}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>Kota</label>
            <input
              {...register("city")}
              placeholder="Jakarta"
              className={cn(inputClass, errors.city && "border-red-400")}
            />
            {errors.city && (
              <p className="text-red-500 text-xs mt-1.5">
                {errors.city.message}
              </p>
            )}
          </div>
          <div>
            <label className={labelClass}>No. Telepon</label>
            <input
              {...register("phone")}
              placeholder="08123456789"
              className={cn(inputClass, errors.phone && "border-red-400")}
            />
            {errors.phone && (
              <p className="text-red-500 text-xs mt-1.5">
                {errors.phone.message}
              </p>
            )}
          </div>
        </div>
        <div>
          <label className={labelClass}>Alamat Lengkap</label>
          <input
            {...register("address")}
            placeholder="Jl. Raya No. 123..."
            className={cn(inputClass, errors.address && "border-red-400")}
          />
          {errors.address && (
            <p className="text-red-500 text-xs mt-1.5">
              {errors.address.message}
            </p>
          )}
        </div>
        <div>
          <label className={labelClass}>Deskripsi</label>
          <textarea
            {...register("description")}
            placeholder="Bengkel spesialis motor & mobil..."
            rows={3}
            className={cn(
              inputClass,
              "resize-none",
              errors.description && "border-red-400",
            )}
          />
          {errors.description && (
            <p className="text-red-500 text-xs mt-1.5">
              {errors.description.message}
            </p>
          )}
        </div>
      </form>
    </Modal>
  );
}
