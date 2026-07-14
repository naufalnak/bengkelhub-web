"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, ChevronDown, Check, Search } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { serviceApi, vehicleApi, ApiRequestError } from "@/lib/api";
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
  vehicle_id: z.string().min(1, "Pilih kendaraan terlebih dahulu"),
  complaint: z.string().min(5, "Keluhan minimal 5 karakter"),
  notes: z.string().optional().or(z.literal("")),
});
type FormData = z.infer<typeof schema>;

interface ServiceModalProps {
  open: boolean;
  onClose: () => void;
  workshopId: string;
}

function VehiclePicker({
  workshopId,
  value,
  onChange,
  error,
}: {
  workshopId: string;
  value: string;
  onChange: (id: string) => void;
  error?: string;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedLabel, setSelectedLabel] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["vehicles-picker", workshopId, search],
    queryFn: () => vehicleApi.list(workshopId, search, 1, 20),
    enabled: open,
  });
  const vehicles = data?.data ?? [];

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
          {selectedLabel || "Pilih kendaraan..."}
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
                  placeholder="Cari plat, merek, model..."
                  className="w-full pl-8 pr-2 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[var(--navy)]"
                />
              </div>
            </div>
            <div className="max-h-48 overflow-y-auto">
              {isLoading ? (
                <p className="text-xs text-gray-400 px-3 py-3 text-center">
                  Memuat...
                </p>
              ) : vehicles.length === 0 ? (
                <p className="text-xs text-gray-400 px-3 py-3 text-center">
                  Kendaraan tidak ditemukan
                </p>
              ) : (
                vehicles.map((v) => (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => {
                      onChange(v.id);
                      setSelectedLabel(
                        `${v.plate_number} — ${v.brand} ${v.model}`,
                      );
                      setOpen(false);
                    }}
                    className="w-full flex items-center justify-between gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition text-left">
                    <span className="truncate">
                      <span className="font-mono font-semibold">
                        {v.plate_number}
                      </span>{" "}
                      — {v.brand} {v.model}
                      {v.customer?.name && (
                        <span className="text-gray-400">
                          {" "}
                          ({v.customer.name})
                        </span>
                      )}
                    </span>
                    {value === v.id && (
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

export function ServiceModal({ open, onClose, workshopId }: ServiceModalProps) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { vehicle_id: "", complaint: "", notes: "" },
  });

  const mutation = useMutation({
    mutationFn: (data: FormData) => serviceApi.create(workshopId, data),
    onSuccess: (service) => {
      queryClient.invalidateQueries({ queryKey: ["services", workshopId] });
      toast.success("Servis berhasil dibuat");
      reset();
      onClose();
      router.push(`/operator/services/${service.id}`);
    },
    onError: (err: unknown) => {
      const message =
        err instanceof ApiRequestError ? err.message : "Gagal membuat servis";
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
        form="service-form"
        disabled={mutation.isPending}
        className={cn(btnPrimary, "flex-1 py-2.5 text-sm")}>
        {mutation.isPending ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" /> Membuat...
          </>
        ) : (
          "Buat Servis"
        )}
      </button>
    </div>
  );

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Buat Servis Baru"
      subtitle="Catat pekerjaan servis untuk kendaraan pelanggan"
      footer={footer}>
      <form
        id="service-form"
        onSubmit={handleSubmit((d) => mutation.mutate(d))}
        className="space-y-4">
        <div>
          <label className={labelClass}>Kendaraan</label>
          <Controller
            control={control}
            name="vehicle_id"
            render={({ field }) => (
              <VehiclePicker
                workshopId={workshopId}
                value={field.value}
                onChange={field.onChange}
                error={errors.vehicle_id?.message}
              />
            )}
          />
          {errors.vehicle_id && (
            <p className="text-red-500 text-xs mt-1.5">
              {errors.vehicle_id.message}
            </p>
          )}
        </div>

        <div>
          <label className={labelClass}>Keluhan</label>
          <textarea
            {...register("complaint")}
            rows={3}
            placeholder="Suara mesin kasar, rem kurang pakem..."
            className={cn(
              inputClass,
              "resize-none",
              errors.complaint && "border-red-400",
            )}
          />
          {errors.complaint && (
            <p className="text-red-500 text-xs mt-1.5">
              {errors.complaint.message}
            </p>
          )}
        </div>

        <div>
          <label className={labelClass}>Catatan (opsional)</label>
          <textarea
            {...register("notes")}
            rows={2}
            placeholder="Catatan tambahan dari customer..."
            className={cn(inputClass, "resize-none")}
          />
        </div>
      </form>
    </Modal>
  );
}
