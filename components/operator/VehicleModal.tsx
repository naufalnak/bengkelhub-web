"use client";

import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, ChevronDown, Check, Search } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { vehicleApi, customerApi, ApiRequestError } from "@/lib/api";
import { Modal } from "@/components/ui/Modal";
import {
  cn,
  inputClass,
  labelClass,
  btnPrimary,
  btnOutline,
} from "@/lib/utils";
import { toast } from "@/components/ui/Toast";
import type { Vehicle } from "@/lib/types";

const schema = z.object({
  customer_id: z.string().min(1, "Pilih pelanggan terlebih dahulu"),
  plate_number: z.string().min(3, "Nomor plat minimal 3 karakter"),
  brand: z.string().min(2, "Merek wajib diisi"),
  model: z.string().min(1, "Model wajib diisi"),
  year: z.number().optional(),
  color: z.string().optional().or(z.literal("")),
  engine_cc: z.number().optional(),
});
type FormData = z.infer<typeof schema>;

interface VehicleModalProps {
  open: boolean;
  onClose: () => void;
  workshopId: string;
  vehicle?: Vehicle | null;
}

function CustomerPicker({
  workshopId,
  value,
  onChange,
  error,
}: {
  workshopId: string;
  value: string;
  onChange: (id: string, label: string) => void;
  error?: string;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedLabel, setSelectedLabel] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["customers-picker", workshopId, search],
    queryFn: () => customerApi.list(workshopId, search, 1, 20),
    enabled: open,
  });
  const customers = data?.data ?? [];

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={cn(
          inputClass,
          "flex items-center justify-between text-left",
          error && "border-red-400",
        )}>
        <span className={cn(!value && "text-gray-400")}>
          {selectedLabel || "Pilih pelanggan..."}
        </span>
        <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute left-0 right-0 mt-1.5 bg-white rounded-xl border border-gray-200 shadow-lg z-20 overflow-hidden">
            <div className="p-2 border-b border-gray-100">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  autoFocus
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Cari nama pelanggan..."
                  className="w-full pl-8 pr-2 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[var(--navy)]"
                />
              </div>
            </div>
            <div className="max-h-48 overflow-y-auto">
              {isLoading ? (
                <p className="text-xs text-gray-400 px-3 py-3 text-center">
                  Memuat...
                </p>
              ) : customers.length === 0 ? (
                <p className="text-xs text-gray-400 px-3 py-3 text-center">
                  Pelanggan tidak ditemukan
                </p>
              ) : (
                customers.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => {
                      onChange(c.id, c.name);
                      setSelectedLabel(c.name);
                      setOpen(false);
                    }}
                    className="w-full flex items-center justify-between gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition text-left">
                    <span className="truncate">
                      {c.name}
                      {c.phone && (
                        <span className="text-gray-400"> · {c.phone}</span>
                      )}
                    </span>
                    {value === c.id && (
                      <Check className="w-4 h-4 text-[var(--navy)] flex-shrink-0" />
                    )}
                  </button>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export function VehicleModal({
  open,
  onClose,
  workshopId,
  vehicle,
}: VehicleModalProps) {
  const queryClient = useQueryClient();
  const isEdit = !!vehicle;

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    if (vehicle) {
      reset({
        customer_id: vehicle.customer_id,
        plate_number: vehicle.plate_number,
        brand: vehicle.brand,
        model: vehicle.model,
        year: vehicle.year || undefined,
        color: vehicle.color,
        engine_cc: vehicle.engine_cc || undefined,
      });
    } else {
      reset({
        customer_id: "",
        plate_number: "",
        brand: "",
        model: "",
        year: undefined,
        color: "",
        engine_cc: undefined,
      });
    }
  }, [vehicle, reset]);

  const mutation = useMutation({
    mutationFn: (data: FormData) =>
      isEdit
        ? vehicleApi.update(vehicle!.id, data)
        : vehicleApi.create(workshopId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vehicles", workshopId] });
      toast.success(
        isEdit ? "Kendaraan berhasil diperbarui" : "Kendaraan berhasil ditambahkan",
      );
      onClose();
    },
    onError: (err: unknown) => {
      const message =
        err instanceof ApiRequestError ? err.message : "Gagal menyimpan kendaraan";
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
        form="vehicle-form"
        disabled={mutation.isPending}
        className={cn(btnPrimary, "flex-1 py-2.5 text-sm")}>
        {mutation.isPending ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" /> Menyimpan...
          </>
        ) : isEdit ? (
          "Simpan Perubahan"
        ) : (
          "Tambah Kendaraan"
        )}
      </button>
    </div>
  );

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? "Edit Kendaraan" : "Tambah Kendaraan"}
      subtitle={
        isEdit ? "Update data kendaraan" : "Daftarkan kendaraan milik pelanggan"
      }
      footer={footer}>
      <form
        id="vehicle-form"
        onSubmit={handleSubmit((d) => mutation.mutate(d))}
        className="space-y-4">
        {!isEdit && (
          <div>
            <label className={labelClass}>Pelanggan</label>
            <Controller
              control={control}
              name="customer_id"
              render={({ field }) => (
                <CustomerPicker
                  workshopId={workshopId}
                  value={field.value}
                  onChange={(id) => field.onChange(id)}
                  error={errors.customer_id?.message}
                />
              )}
            />
            {errors.customer_id && (
              <p className="text-red-500 text-xs mt-1.5">
                {errors.customer_id.message}
              </p>
            )}
          </div>
        )}

        <div>
          <label className={labelClass}>Nomor Plat</label>
          <input
            {...register("plate_number")}
            placeholder="B 1234 ABC"
            className={cn(inputClass, errors.plate_number && "border-red-400")}
          />
          {errors.plate_number && (
            <p className="text-red-500 text-xs mt-1.5">
              {errors.plate_number.message}
            </p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>Merek</label>
            <input
              {...register("brand")}
              placeholder="Honda"
              className={cn(inputClass, errors.brand && "border-red-400")}
            />
            {errors.brand && (
              <p className="text-red-500 text-xs mt-1.5">{errors.brand.message}</p>
            )}
          </div>
          <div>
            <label className={labelClass}>Model</label>
            <input
              {...register("model")}
              placeholder="Vario 150"
              className={cn(inputClass, errors.model && "border-red-400")}
            />
            {errors.model && (
              <p className="text-red-500 text-xs mt-1.5">{errors.model.message}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className={labelClass}>Tahun</label>
            <input
              {...register("year", { valueAsNumber: true })}
              type="number"
              placeholder="2022"
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Warna</label>
            <input
              {...register("color")}
              placeholder="Hitam"
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>CC</label>
            <input
              {...register("engine_cc", { valueAsNumber: true })}
              type="number"
              placeholder="150"
              className={inputClass}
            />
          </div>
        </div>
      </form>
    </Modal>
  );
}
