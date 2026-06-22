"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  MapPin,
  Phone,
  ArrowLeft,
  CalendarClock,
  Users,
  Loader2,
  CheckCircle2,
  Wrench,
} from "lucide-react";
import { format, addDays } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { workshopApi, slotApi, orderApi } from "@/lib/api";
import { useAuthStore } from "@/store/auth";
import { Badge } from "@/components/ui/Badge";
import { SectionLoader } from "@/components/ui/PageLoader";
import {
  cn,
  inputClass,
  labelClass,
  btnPrimary,
  btnOutline,
} from "@/lib/utils";
import { toast } from "@/components/ui/Toast";
import type { Slot } from "@/lib/types";

const DAYS = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];

const schema = z.object({
  slot_id: z.string().min(1, "Pilih jadwal terlebih dahulu"),
  booking_date: z.string().min(1, "Pilih tanggal booking"),
  vehicle_type: z.string().min(2, "Jenis kendaraan wajib diisi"),
  complaint: z.string().min(5, "Keluhan minimal 5 karakter"),
});
type FormData = z.infer<typeof schema>;

function getAvailableDates(slots: Slot[]) {
  const activeDays = new Set(
    slots.filter((s) => s.is_active).map((s) => s.day_of_week),
  );
  const dates: { date: Date; label: string; dow: number }[] = [];
  for (let i = 1; i <= 14; i++) {
    const d = addDays(new Date(), i);
    const dow = d.getDay();
    if (activeDays.has(dow)) {
      dates.push({
        date: d,
        label: format(d, "EEE, dd MMM", { locale: idLocale }),
        dow,
      });
    }
  }
  return dates;
}

export default function WorkshopDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { isAuthenticated, role } = useAuthStore();
  const [success, setSuccess] = useState(false);
  const [selectedDow, setSelectedDow] = useState<number | null>(null);

  const { data: workshop, isLoading: loadingWs } = useQuery({
    queryKey: ["workshop", id],
    queryFn: () => workshopApi.getById(id),
  });

  const { data: slots = [], isLoading: loadingSlots } = useQuery({
    queryKey: ["slots-public", id],
    queryFn: () => slotApi.listByWorkshop(id),
  });

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const selectedDate = watch("booking_date");
  const selectedSlotId = watch("slot_id");
  const availableDates = getAvailableDates(slots);
  const slotsForDate =
    selectedDow !== null
      ? slots.filter((s) => s.is_active && s.day_of_week === selectedDow)
      : [];

  const bookingMutation = useMutation({
    mutationFn: (data: FormData) =>
      orderApi.create({ ...data, workshop_id: id }),
    onSuccess: () => {
      setSuccess(true);
      toast.success("Booking berhasil! Menunggu konfirmasi bengkel");
    },
    onError: (err: Error) => {
      toast.error(err.message ?? "Gagal membuat booking");
    },
  });

  if (loadingWs) return <SectionLoader />;
  if (!workshop)
    return (
      <div className="text-center py-24">
        <p className="text-gray-500">Workshop tidak ditemukan</p>
        <button
          onClick={() => router.back()}
          className="text-red-600 text-sm mt-2 hover:text-red-700">
          ← Kembali
        </button>
      </div>
    );

  if (success)
    return (
      <div className="max-w-md mx-auto text-center py-16">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-10 h-10 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Booking Berhasil!
        </h2>
        <p className="text-gray-500 mb-1">
          Pesanan Anda telah masuk ke{" "}
          <span className="font-semibold text-gray-900">{workshop.name}</span>.
        </p>
        <p className="text-gray-400 text-sm mb-8">
          Notifikasi WhatsApp akan dikirim setelah bengkel mengkonfirmasi
          pesanan Anda.
        </p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={() => router.push("/bookings")}
            className={cn(btnPrimary, "px-5 py-2.5 text-sm")}>
            Lihat Riwayat Booking
          </button>
          <button
            onClick={() => setSuccess(false)}
            className={cn(btnOutline, "px-5 py-2.5 text-sm")}>
            Booking Lagi
          </button>
        </div>
      </div>
    );

  return (
    <div className="space-y-5 max-w-3xl mx-auto">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-gray-500 hover:text-gray-900 text-sm transition">
        <ArrowLeft className="w-4 h-4" /> Kembali
      </button>

      {/* Workshop info */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center flex-shrink-0">
            <Wrench className="w-6 h-6 text-red-600" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-xl font-bold text-gray-900">
                {workshop.name}
              </h1>
              <Badge variant={workshop.is_active ? "success" : "default"}>
                {workshop.is_active ? "Buka" : "Tutup"}
              </Badge>
            </div>
            <div className="flex flex-wrap gap-4 mt-2">
              <div className="flex items-center gap-1.5 text-gray-500 text-sm">
                <MapPin className="w-4 h-4 text-gray-400" />
                {workshop.address}, {workshop.city}
              </div>
              <div className="flex items-center gap-1.5 text-gray-500 text-sm">
                <Phone className="w-4 h-4 text-gray-400" />
                {workshop.phone}
              </div>
            </div>
            <p className="text-gray-500 text-sm mt-3 leading-relaxed">
              {workshop.description}
            </p>
          </div>
        </div>
      </div>

      {/* Jadwal */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5">
        <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2 mb-4">
          <CalendarClock className="w-4 h-4 text-red-600" /> Jadwal Operasional
        </h2>
        {loadingSlots ? (
          <SectionLoader />
        ) : slots.filter((s) => s.is_active).length === 0 ? (
          <p className="text-gray-400 text-sm">Belum ada jadwal tersedia</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {[...slots]
              .filter((s) => s.is_active)
              .sort((a, b) => a.day_of_week - b.day_of_week)
              .map((slot) => (
                <div
                  key={slot.id}
                  className="flex items-center gap-2 px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm">
                  <span className="font-semibold text-gray-900">
                    {DAYS[slot.day_of_week]}
                  </span>
                  <span className="text-gray-400">
                    {slot.open_time}–{slot.close_time}
                  </span>
                  <div className="flex items-center gap-1 text-gray-400 text-xs">
                    <Users className="w-3 h-3" />
                    {slot.quota}
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>

      {/* Booking form */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="bg-[var(--navy)] px-6 py-4">
          <h2 className="text-white font-bold">Form Booking</h2>
          <p className="text-blue-300 text-xs mt-0.5">
            Isi detail kendaraan dan pilih jadwal
          </p>
        </div>

        <div className="p-6">
          {!isAuthenticated ? (
            <div className="text-center py-8 bg-gray-50 rounded-2xl border border-gray-200">
              <p className="text-gray-600 mb-4 text-sm">
                Login terlebih dahulu untuk melakukan booking
              </p>
              <button
                onClick={() => router.push(`/login?redirect=/workshops/${id}`)}
                className={cn(btnPrimary, "px-5 py-2.5 text-sm mx-auto")}>
                Login Sekarang
              </button>
            </div>
          ) : role() === "operator" ? (
            <div className="text-center py-8">
              <p className="text-gray-400 text-sm">
                Akun operator tidak bisa melakukan booking
              </p>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit((d) => bookingMutation.mutate(d))}
              className="space-y-5">
              {bookingMutation.isError && (
                <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl">
                  {(bookingMutation.error as Error).message}
                </div>
              )}

              {/* Pilih tanggal */}
              <div>
                <label className={labelClass}>Pilih Tanggal</label>
                {availableDates.length === 0 ? (
                  <p className="text-gray-400 text-sm">
                    Tidak ada tanggal tersedia dalam 14 hari ke depan
                  </p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {availableDates.map(({ date, label, dow }) => {
                      const val = format(date, "yyyy-MM-dd");
                      const active = selectedDate === val;
                      return (
                        <button
                          key={val}
                          type="button"
                          onClick={() => {
                            setValue("booking_date", val);
                            setValue("slot_id", "");
                            setSelectedDow(dow);
                          }}
                          className={cn(
                            "px-3 py-2 rounded-xl text-xs font-semibold border transition",
                            active
                              ? "bg-[var(--navy)] text-white border-[var(--navy)]"
                              : "bg-white text-gray-600 border-gray-200 hover:border-gray-300",
                          )}>
                          {label}
                        </button>
                      );
                    })}
                  </div>
                )}
                {errors.booking_date && (
                  <p className="text-red-500 text-xs mt-1.5">
                    {errors.booking_date.message}
                  </p>
                )}
              </div>

              {/* Pilih jam */}
              {selectedDow !== null && (
                <div>
                  <label className={labelClass}>Pilih Jam</label>
                  {slotsForDate.length === 0 ? (
                    <p className="text-gray-400 text-sm">
                      Tidak ada slot untuk hari ini
                    </p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {slotsForDate.map((slot) => {
                        const active = selectedSlotId === slot.id;
                        return (
                          <button
                            key={slot.id}
                            type="button"
                            onClick={() => setValue("slot_id", slot.id)}
                            className={cn(
                              "flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border transition",
                              active
                                ? "bg-[var(--navy)] text-white border-[var(--navy)]"
                                : "bg-white text-gray-600 border-gray-200 hover:border-gray-300",
                            )}>
                            {slot.open_time}–{slot.close_time}
                            <span className="text-xs opacity-60">
                              ({slot.quota} kuota)
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                  {errors.slot_id && (
                    <p className="text-red-500 text-xs mt-1.5">
                      {errors.slot_id.message}
                    </p>
                  )}
                </div>
              )}

              <div>
                <label className={labelClass}>Jenis Kendaraan</label>
                <input
                  {...register("vehicle_type")}
                  placeholder="Honda Beat 2022 / Toyota Avanza"
                  className={cn(
                    inputClass,
                    errors.vehicle_type && "border-red-400",
                  )}
                />
                {errors.vehicle_type && (
                  <p className="text-red-500 text-xs mt-1.5">
                    {errors.vehicle_type.message}
                  </p>
                )}
              </div>

              <div>
                <label className={labelClass}>Keluhan / Kerusakan</label>
                <textarea
                  {...register("complaint")}
                  rows={3}
                  placeholder="Ganti oli, rem bunyi, AC tidak dingin..."
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

              <button
                type="submit"
                disabled={bookingMutation.isPending}
                className={cn(btnPrimary, "w-full py-3 text-sm")}>
                {bookingMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Memproses...
                  </>
                ) : (
                  "Booking Sekarang"
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
