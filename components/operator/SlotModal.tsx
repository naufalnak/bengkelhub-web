"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { slotApi } from "@/lib/api";
import { Modal } from "@/components/ui/Modal";
import {
  cn,
  inputClass,
  labelClass,
  btnPrimary,
  btnOutline,
} from "@/lib/utils";
import { toast } from "@/components/ui/Toast";

const DAYS = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];

const schema = z
  .object({
    day_of_week: z.number().min(0).max(6),
    open_time: z.string().min(1, "Jam buka wajib diisi"),
    close_time: z.string().min(1, "Jam tutup wajib diisi"),
    quota: z.number().min(1, "Kuota minimal 1"),
  })
  .refine((d) => d.open_time < d.close_time, {
    message: "Jam buka harus lebih awal dari jam tutup",
    path: ["close_time"],
  });
type FormData = z.infer<typeof schema>;

interface SlotModalProps {
  open: boolean;
  onClose: () => void;
  workshopId: string;
}

export function SlotModal({ open, onClose, workshopId }: SlotModalProps) {
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      day_of_week: 1,
      open_time: "08:00",
      close_time: "17:00",
      quota: 5,
    },
  });

  const mutation = useMutation({
    mutationFn: (data: FormData) => slotApi.create(workshopId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["slots", workshopId] });
      toast.success("Slot berhasil ditambahkan");
      reset();
      onClose();
    },
    onError: (err: Error) => {
      toast.error(err.message ?? "Gagal menambahkan slot");
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
        form="slot-form"
        disabled={mutation.isPending}
        className={cn(btnPrimary, "flex-1 py-2.5 text-sm")}>
        {mutation.isPending ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" /> Menyimpan...
          </>
        ) : (
          "Tambah Slot"
        )}
      </button>
    </div>
  );

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Tambah Slot"
      subtitle="Atur jadwal & kuota harian"
      size="sm"
      footer={footer}>
      <form
        id="slot-form"
        onSubmit={handleSubmit((d) => mutation.mutate(d))}
        className="space-y-4">
        <div>
          <label className={labelClass}>Hari</label>
          <select
            {...register("day_of_week", { valueAsNumber: true })}
            className={cn(inputClass, "cursor-pointer")}>
            {DAYS.map((day, i) => (
              <option key={i} value={i}>
                {day}
              </option>
            ))}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>Jam Buka</label>
            <input
              {...register("open_time")}
              type="time"
              className={cn(inputClass, errors.open_time && "border-red-400")}
            />
            {errors.open_time && (
              <p className="text-red-500 text-xs mt-1.5">
                {errors.open_time.message}
              </p>
            )}
          </div>
          <div>
            <label className={labelClass}>Jam Tutup</label>
            <input
              {...register("close_time")}
              type="time"
              className={cn(inputClass, errors.close_time && "border-red-400")}
            />
            {errors.close_time && (
              <p className="text-red-500 text-xs mt-1.5">
                {errors.close_time.message}
              </p>
            )}
          </div>
        </div>
        <div>
          <label className={labelClass}>Kuota per Hari</label>
          <input
            {...register("quota", { valueAsNumber: true })}
            type="number"
            min={1}
            max={100}
            placeholder="5"
            className={cn(inputClass, errors.quota && "border-red-400")}
          />
          {errors.quota && (
            <p className="text-red-500 text-xs mt-1.5">
              {errors.quota.message}
            </p>
          )}
          <p className="text-gray-400 text-xs mt-1.5">
            Maksimal kendaraan yang bisa booking per hari
          </p>
        </div>
      </form>
    </Modal>
  );
}
