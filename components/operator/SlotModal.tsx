"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { X, Loader2, CalendarClock } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { slotApi } from "@/lib/api";

const DAYS = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];

const schema = z
  .object({
    // Pakai z.number() biasa, bukan coerce — kita cast manual di select
    day_of_week: z.number().min(0).max(6),
    open_time: z.string().min(1, "Jam buka wajib diisi"),
    close_time: z.string().min(1, "Jam tutup wajib diisi"),
    // quota tetap number, bukan coerce
    quota: z.number().min(1, "Kuota minimal 1"),
  })
  .refine((d) => d.open_time < d.close_time, {
    message: "Jam buka harus lebih awal dari jam tutup",
    path: ["close_time"],
  });

// Tipe eksplisit dari schema output
type FormData = z.infer<typeof schema>;

const inputClass =
  "w-full px-3.5 py-2.5 rounded-xl text-sm text-white placeholder-slate-600 border bg-white/04 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500/60 transition";
const labelClass =
  "block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2";

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
    setValue,
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
      reset();
      onClose();
    },
  });

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 cursor-pointer"
        style={{ background: "rgba(0,0,0,0.70)", backdropFilter: "blur(4px)" }}
        onClick={onClose}
      />
      <div
        className="relative w-full max-w-md rounded-3xl overflow-hidden"
        style={{
          background: "#0b1628",
          border: "1px solid rgba(255,255,255,0.09)",
          boxShadow: "0 32px 80px rgba(0,0,0,0.50)",
        }}>
        {/* Accent strip */}
        <div
          className="absolute top-0 left-8 right-8 h-0.5"
          style={{
            background:
              "linear-gradient(90deg, transparent, #dc2626, transparent)",
          }}
        />

        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-5"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-red-600/15 border border-red-600/25 flex items-center justify-center">
              <CalendarClock className="w-4 h-4 text-red-400" />
            </div>
            <div>
              <h2 className="text-white font-bold text-base">Tambah Slot</h2>
              <p className="text-slate-500 text-xs mt-0.5">
                Atur jadwal & kuota harian
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-500 hover:text-white hover:bg-white/08 transition">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit((d) => mutation.mutate(d))}
          className="px-6 py-5 space-y-4">
          {mutation.isError && (
            <div className="bg-red-500/10 border border-red-500/25 text-red-400 text-sm px-4 py-3 rounded-xl">
              {(mutation.error as Error).message}
            </div>
          )}

          {/* Hari — pakai onChange manual karena select selalu return string */}
          <div>
            <label className={labelClass}>Hari</label>
            <select
              className={inputClass}
              style={{ borderColor: "rgba(255,255,255,0.09)" }}
              defaultValue={1}
              onChange={(e) =>
                // Cast ke number di sini, bukan di schema
                setValue("day_of_week", Number(e.target.value))
              }>
              {DAYS.map((day, i) => (
                <option key={i} value={i} className="bg-slate-900">
                  {day}
                </option>
              ))}
            </select>
          </div>

          {/* Jam */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Jam Buka</label>
              <input
                {...register("open_time")}
                type="time"
                className={inputClass}
                style={{
                  borderColor: errors.open_time
                    ? "rgba(239,68,68,0.5)"
                    : "rgba(255,255,255,0.09)",
                }}
              />
              {errors.open_time && (
                <p className="text-red-400 text-xs mt-1.5">
                  {errors.open_time.message}
                </p>
              )}
            </div>
            <div>
              <label className={labelClass}>Jam Tutup</label>
              <input
                {...register("close_time")}
                type="time"
                className={inputClass}
                style={{
                  borderColor: errors.close_time
                    ? "rgba(239,68,68,0.5)"
                    : "rgba(255,255,255,0.09)",
                }}
              />
              {errors.close_time && (
                <p className="text-red-400 text-xs mt-1.5">
                  {errors.close_time.message}
                </p>
              )}
            </div>
          </div>

          {/* Kuota — onChange manual juga */}
          <div>
            <label className={labelClass}>Kuota per Hari</label>
            <input
              type="number"
              min={1}
              max={100}
              placeholder="5"
              className={inputClass}
              style={{
                borderColor: errors.quota
                  ? "rgba(239,68,68,0.5)"
                  : "rgba(255,255,255,0.09)",
              }}
              defaultValue={5}
              onChange={(e) => setValue("quota", Number(e.target.value))}
            />
            {errors.quota && (
              <p className="text-red-400 text-xs mt-1.5">
                {errors.quota.message}
              </p>
            )}
            <p className="text-slate-600 text-xs mt-1.5">
              Jumlah maksimal kendaraan yang bisa booking pada hari ini
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-slate-400 hover:text-white transition"
              style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.08)",
              }}>
              Batal
            </button>
            <button
              type="submit"
              disabled={mutation.isPending}
              className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white bg-red-600 hover:bg-red-700 transition flex items-center justify-center gap-2 disabled:opacity-60"
              style={{ boxShadow: "0 4px 14px rgba(220,38,38,0.25)" }}>
              {mutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Menyimpan...
                </>
              ) : (
                "Tambah Slot"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
