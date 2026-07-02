"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { slotApi, ApiRequestError } from "@/lib/api";
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
    start_date: z.string().min(1, "Tanggal mulai wajib diisi"),
    end_date: z.string().min(1, "Tanggal akhir wajib diisi"),
    days_of_week: z.array(z.number()).min(1, "Pilih minimal 1 hari"),
    time: z.string().min(1, "Jam wajib diisi"),
    max_booking: z.number().min(1, "Kuota minimal 1"),
  })
  .refine((d) => d.end_date >= d.start_date, {
    message: "Tanggal akhir harus setelah tanggal mulai",
    path: ["end_date"],
  });
type FormData = z.infer<typeof schema>;

interface SlotModalProps {
  open: boolean;
  onClose: () => void;
  workshopId: string;
}

const today = new Date().toISOString().slice(0, 10);

export function SlotModal({ open, onClose, workshopId }: SlotModalProps) {
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      start_date: today,
      end_date: today,
      days_of_week: [1, 2, 3, 4, 5, 6],
      time: "09:00",
      max_booking: 5,
    },
  });

  const mutation = useMutation({
    mutationFn: (data: FormData) => slotApi.bulkCreate(workshopId, data),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["slots", workshopId] });
      toast.success(
        `${result.created.length} slot berhasil dibuat${
          result.skipped > 0 ? ` (${result.skipped} dilewati/duplikat)` : ""
        }`,
      );
      reset();
      onClose();
    },
    onError: (err: unknown) => {
      const message =
        err instanceof ApiRequestError ? err.message : "Gagal membuat slot";
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
        form="slot-form"
        disabled={mutation.isPending}
        className={cn(btnPrimary, "flex-1 py-2.5 text-sm")}>
        {mutation.isPending ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" /> Membuat slot...
          </>
        ) : (
          "Generate Slot"
        )}
      </button>
    </div>
  );

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Generate Slot"
      subtitle="Buat banyak slot booking sekaligus untuk rentang tanggal tertentu"
      size="sm"
      footer={footer}>
      <form
        id="slot-form"
        onSubmit={handleSubmit((d) => mutation.mutate(d))}
        className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>Dari Tanggal</label>
            <input
              {...register("start_date")}
              type="date"
              min={today}
              className={cn(
                inputClass,
                errors.start_date && "border-red-400",
              )}
            />
            {errors.start_date && (
              <p className="text-red-500 text-xs mt-1.5">
                {errors.start_date.message}
              </p>
            )}
          </div>
          <div>
            <label className={labelClass}>Sampai Tanggal</label>
            <input
              {...register("end_date")}
              type="date"
              min={today}
              className={cn(inputClass, errors.end_date && "border-red-400")}
            />
            {errors.end_date && (
              <p className="text-red-500 text-xs mt-1.5">
                {errors.end_date.message}
              </p>
            )}
          </div>
        </div>

        <div>
          <label className={labelClass}>Hari Operasional</label>
          <Controller
            control={control}
            name="days_of_week"
            render={({ field }) => (
              <div className="flex flex-wrap gap-1.5">
                {DAYS.map((day, i) => {
                  const active = field.value.includes(i);
                  return (
                    <button
                      key={i}
                      type="button"
                      onClick={() =>
                        field.onChange(
                          active
                            ? field.value.filter((d) => d !== i)
                            : [...field.value, i],
                        )
                      }
                      className={cn(
                        "px-3 py-1.5 rounded-lg text-xs font-semibold border transition",
                        active
                          ? "bg-[var(--navy)] text-white border-[var(--navy)]"
                          : "bg-white text-gray-600 border-gray-200 hover:border-gray-300",
                      )}>
                      {day.slice(0, 3)}
                    </button>
                  );
                })}
              </div>
            )}
          />
          {errors.days_of_week && (
            <p className="text-red-500 text-xs mt-1.5">
              {errors.days_of_week.message}
            </p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>Jam</label>
            <input
              {...register("time")}
              type="time"
              className={cn(inputClass, errors.time && "border-red-400")}
            />
            {errors.time && (
              <p className="text-red-500 text-xs mt-1.5">
                {errors.time.message}
              </p>
            )}
          </div>
          <div>
            <label className={labelClass}>Kuota per Slot</label>
            <input
              {...register("max_booking", { valueAsNumber: true })}
              type="number"
              min={1}
              max={100}
              placeholder="5"
              className={cn(
                inputClass,
                errors.max_booking && "border-red-400",
              )}
            />
            {errors.max_booking && (
              <p className="text-red-500 text-xs mt-1.5">
                {errors.max_booking.message}
              </p>
            )}
          </div>
        </div>
        <p className="text-gray-400 text-xs">
          Slot akan dibuat untuk tiap tanggal yang cocok dengan hari yang
          dipilih, dalam rentang tanggal di atas. Tanggal yang sudah lewat
          atau sudah ada slotnya otomatis dilewati.
        </p>
      </form>
    </Modal>
  );
}
