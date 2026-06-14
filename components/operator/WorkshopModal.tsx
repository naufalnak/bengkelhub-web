"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { X, Loader2, Store } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { workshopApi } from "@/lib/api";
import type { Workshop } from "@/lib/types";

const schema = z.object({
  name: z.string().min(3, "Nama minimal 3 karakter"),
  address: z.string().min(5, "Alamat minimal 5 karakter"),
  city: z.string().min(2, "Kota minimal 2 karakter"),
  phone: z.string().min(9, "Nomor telepon tidak valid"),
  description: z.string().min(10, "Deskripsi minimal 10 karakter"),
});

type FormData = z.infer<typeof schema>;

const inputClass =
  "w-full px-3.5 py-2.5 rounded-xl text-sm text-white placeholder-slate-600 border bg-white/04 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500/60 transition";
const labelClass =
  "block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2";

interface WorkshopModalProps {
  open: boolean;
  onClose: () => void;
  workshop?: Workshop | null; // null = create mode
}

export function WorkshopModal({ open, onClose, workshop }: WorkshopModalProps) {
  const queryClient = useQueryClient();
  const isEdit = !!workshop;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  // Isi form kalau edit mode
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
      onClose();
    },
  });

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 cursor-pointer"
        style={{ background: "rgba(0,0,0,0.70)", backdropFilter: "blur(4px)" }}
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className="relative w-full max-w-lg rounded-3xl overflow-hidden"
        style={{
          background: "#0b1628",
          border: "1px solid rgba(255,255,255,0.09)",
          boxShadow: "0 32px 80px rgba(0,0,0,0.50)",
        }}>
        {/* Red accent strip */}
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
              <Store className="w-4 h-4 text-red-400" />
            </div>
            <div>
              <h2 className="text-white font-bold text-base">
                {isEdit ? "Edit Workshop" : "Tambah Workshop"}
              </h2>
              <p className="text-slate-500 text-xs mt-0.5">
                {isEdit ? "Update informasi bengkel" : "Daftarkan bengkel baru"}
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
          onSubmit={handleSubmit((data) => mutation.mutate(data))}
          className="px-6 py-5 space-y-4">
          {mutation.isError && (
            <div className="bg-red-500/10 border border-red-500/25 text-red-400 text-sm px-4 py-3 rounded-xl">
              {(mutation.error as Error).message}
            </div>
          )}

          <div>
            <label className={labelClass}>Nama Bengkel</label>
            <input
              {...register("name")}
              placeholder="Bengkel Maju Jaya"
              className={inputClass}
              style={{
                borderColor: errors.name
                  ? "rgba(239,68,68,0.5)"
                  : "rgba(255,255,255,0.09)",
              }}
            />
            {errors.name && (
              <p className="text-red-400 text-xs mt-1.5">
                {errors.name.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Kota</label>
              <input
                {...register("city")}
                placeholder="Jakarta"
                className={inputClass}
                style={{
                  borderColor: errors.city
                    ? "rgba(239,68,68,0.5)"
                    : "rgba(255,255,255,0.09)",
                }}
              />
              {errors.city && (
                <p className="text-red-400 text-xs mt-1.5">
                  {errors.city.message}
                </p>
              )}
            </div>
            <div>
              <label className={labelClass}>No. Telepon</label>
              <input
                {...register("phone")}
                placeholder="08123456789"
                className={inputClass}
                style={{
                  borderColor: errors.phone
                    ? "rgba(239,68,68,0.5)"
                    : "rgba(255,255,255,0.09)",
                }}
              />
              {errors.phone && (
                <p className="text-red-400 text-xs mt-1.5">
                  {errors.phone.message}
                </p>
              )}
            </div>
          </div>

          <div>
            <label className={labelClass}>Alamat Lengkap</label>
            <input
              {...register("address")}
              placeholder="Jl. Raya No. 123, Kelurahan..."
              className={inputClass}
              style={{
                borderColor: errors.address
                  ? "rgba(239,68,68,0.5)"
                  : "rgba(255,255,255,0.09)",
              }}
            />
            {errors.address && (
              <p className="text-red-400 text-xs mt-1.5">
                {errors.address.message}
              </p>
            )}
          </div>

          <div>
            <label className={labelClass}>Deskripsi</label>
            <textarea
              {...register("description")}
              placeholder="Bengkel spesialis motor & mobil, berpengalaman sejak..."
              rows={3}
              className={`${inputClass} resize-none`}
              style={{
                borderColor: errors.description
                  ? "rgba(239,68,68,0.5)"
                  : "rgba(255,255,255,0.09)",
              }}
            />
            {errors.description && (
              <p className="text-red-400 text-xs mt-1.5">
                {errors.description.message}
              </p>
            )}
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
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Menyimpan...
                </>
              ) : isEdit ? (
                "Simpan Perubahan"
              ) : (
                "Tambah Workshop"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
