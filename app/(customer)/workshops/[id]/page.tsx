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
  CheckCircle,
  Wrench,
} from "lucide-react";
import { format, addDays } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { workshopApi, slotApi, orderApi } from "@/lib/api";
import { useAuthStore } from "@/store/auth";
import type { Slot } from "@/lib/types";

const DAYS = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];

const schema = z.object({
  slot_id: z.string().min(1, "Pilih jadwal terlebih dahulu"),
  booking_date: z.string().min(1, "Pilih tanggal booking"),
  vehicle_type: z.string().min(2, "Jenis kendaraan wajib diisi"),
  complaint: z.string().min(5, "Keluhan minimal 5 karakter"),
});

type FormData = z.infer<typeof schema>;

const inputClass =
  "w-full px-3.5 py-2.5 rounded-xl text-sm text-white placeholder-slate-600 border bg-white/04 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500/60 transition";
const labelClass =
  "block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2";

// Generate next 14 days untuk date picker
function getAvailableDates(slots: Slot[]) {
  const activeDays = new Set(
    slots.filter((s) => s.is_active).map((s) => s.day_of_week),
  );
  const dates: { date: Date; label: string; dayOfWeek: number }[] = [];
  for (let i = 1; i <= 14; i++) {
    const d = addDays(new Date(), i);
    const dow = d.getDay();
    if (activeDays.has(dow)) {
      dates.push({
        date: d,
        label: format(d, "EEE, dd MMM", { locale: idLocale }),
        dayOfWeek: dow,
      });
    }
  }
  return dates;
}

export default function WorkshopDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { isAuthenticated, role } = useAuthStore();
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [selectedDow, setSelectedDow] = useState<number | null>(null);

  const { data: workshop, isLoading: loadingWorkshop } = useQuery({
    queryKey: ["workshop", id],
    queryFn: () => workshopApi.getById(id),
  });

  const { data: slots = [], isLoading: loadingSlots } = useQuery({
    queryKey: ["slots-public", id],
    queryFn: () => slotApi.listByWorkshop(id),
  });

  const availableDates = getAvailableDates(slots);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const selectedDate = watch("booking_date");
  const selectedSlotId = watch("slot_id");

  // Slot yang tersedia untuk hari yang dipilih
  const slotsForDate =
    selectedDow !== null
      ? slots.filter((s) => s.is_active && s.day_of_week === selectedDow)
      : [];

  const bookingMutation = useMutation({
    mutationFn: (data: FormData) =>
      orderApi.create({ ...data, workshop_id: id }),
    onSuccess: () => setBookingSuccess(true),
  });

  const handleDateSelect = (date: Date, dow: number) => {
    setValue("booking_date", format(date, "yyyy-MM-dd"));
    setValue("slot_id", "");
    setSelectedDow(dow);
  };

  if (loadingWorkshop) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-8 h-8 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!workshop) {
    return (
      <div className="text-center py-24">
        <p className="text-slate-400">Workshop tidak ditemukan</p>
        <button
          onClick={() => router.back()}
          className="text-red-400 text-sm mt-2 hover:text-red-300">
          ← Kembali
        </button>
      </div>
    );
  }

  // Booking success state
  if (bookingSuccess) {
    return (
      <div className="max-w-md mx-auto text-center py-16">
        <div className="w-20 h-20 bg-green-500/15 border border-green-500/30 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-10 h-10 text-green-400" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">
          Booking Berhasil!
        </h2>
        <p className="text-slate-400 mb-2">
          Pesanan Anda telah masuk ke{" "}
          <span className="text-white font-semibold">{workshop.name}</span>.
        </p>
        <p className="text-slate-500 text-sm mb-8">
          Notifikasi WhatsApp akan dikirim setelah bengkel mengkonfirmasi
          pesanan Anda.
        </p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={() => router.push("/bookings")}
            className="px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-red-600 hover:bg-red-700 transition"
            style={{ boxShadow: "0 4px 14px rgba(220,38,38,0.25)" }}>
            Lihat Riwayat Booking
          </button>
          <button
            onClick={() => setBookingSuccess(false)}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-300 hover:text-white transition"
            style={{
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.09)",
            }}>
            Booking Lagi
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Back */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-slate-400 hover:text-white text-sm transition">
        <ArrowLeft className="w-4 h-4" /> Kembali
      </button>

      {/* Workshop info */}
      <div
        className="rounded-2xl p-6"
        style={{
          background: "#0b1628",
          border: "1px solid rgba(255,255,255,0.07)",
        }}>
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-red-600/15 border border-red-600/25 flex items-center justify-center flex-shrink-0">
            <Wrench className="w-6 h-6 text-red-400" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-bold text-white">{workshop.name}</h1>
              <span
                className="px-2.5 py-1 rounded-lg text-xs font-semibold"
                style={{
                  color: workshop.is_active ? "#22c55e" : "#6b7280",
                  background: workshop.is_active
                    ? "rgba(34,197,94,0.10)"
                    : "rgba(107,114,128,0.10)",
                  border: `1px solid ${workshop.is_active ? "rgba(34,197,94,0.25)" : "rgba(107,114,128,0.20)"}`,
                }}>
                {workshop.is_active ? "Buka" : "Tutup"}
              </span>
            </div>
            <div className="flex flex-wrap gap-4 mt-3">
              <div className="flex items-center gap-1.5 text-slate-400 text-sm">
                <MapPin className="w-4 h-4 text-slate-600" />
                {workshop.address}, {workshop.city}
              </div>
              <div className="flex items-center gap-1.5 text-slate-400 text-sm">
                <Phone className="w-4 h-4 text-slate-600" />
                {workshop.phone}
              </div>
            </div>
            <p className="text-slate-500 text-sm mt-3 leading-relaxed">
              {workshop.description}
            </p>
          </div>
        </div>
      </div>

      {/* Jadwal tersedia */}
      <div
        className="rounded-2xl p-5"
        style={{
          background: "#0b1628",
          border: "1px solid rgba(255,255,255,0.07)",
        }}>
        <h2 className="text-white font-semibold text-sm mb-4 flex items-center gap-2">
          <CalendarClock className="w-4 h-4 text-red-400" />
          Jadwal Operasional
        </h2>
        {loadingSlots ? (
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="h-10 rounded-xl animate-pulse bg-white/04"
              />
            ))}
          </div>
        ) : slots.filter((s) => s.is_active).length === 0 ? (
          <p className="text-slate-500 text-sm">Belum ada jadwal tersedia</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {[...slots]
              .filter((s) => s.is_active)
              .sort((a, b) => a.day_of_week - b.day_of_week)
              .map((slot) => (
                <div
                  key={slot.id}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm"
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.08)",
                  }}>
                  <span className="text-white font-semibold">
                    {DAYS[slot.day_of_week]}
                  </span>
                  <span className="text-slate-500">
                    {slot.open_time}–{slot.close_time}
                  </span>
                  <div className="flex items-center gap-1 text-slate-600 text-xs">
                    <Users className="w-3 h-3" />
                    {slot.quota}
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>

      {/* Booking form */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{
          background: "#0b1628",
          border: "1px solid rgba(255,255,255,0.07)",
        }}>
        {/* Accent strip */}
        <div
          className="h-0.5"
          style={{
            background:
              "linear-gradient(90deg, transparent, #dc2626, transparent)",
          }}
        />
        <div className="p-6">
          <h2 className="text-white font-bold text-lg mb-6">Form Booking</h2>

          {!isAuthenticated ? (
            <div
              className="text-center py-8 rounded-xl"
              style={{
                background: "rgba(220,38,38,0.06)",
                border: "1px dashed rgba(220,38,38,0.25)",
              }}>
              <p className="text-slate-300 mb-4">
                Login terlebih dahulu untuk booking
              </p>
              <button
                onClick={() => router.push(`/login?redirect=/workshops/${id}`)}
                className="px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-red-600 hover:bg-red-700 transition">
                Login Sekarang
              </button>
            </div>
          ) : role() === "operator" ? (
            <div className="text-center py-8">
              <p className="text-slate-400 text-sm">
                Akun operator tidak bisa melakukan booking
              </p>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit((data) => bookingMutation.mutate(data))}
              className="space-y-5">
              {bookingMutation.isError && (
                <div className="bg-red-500/10 border border-red-500/25 text-red-400 text-sm px-4 py-3 rounded-xl">
                  {(bookingMutation.error as Error).message}
                </div>
              )}

              {/* Pilih tanggal */}
              <div>
                <label className={labelClass}>Pilih Tanggal</label>
                {availableDates.length === 0 ? (
                  <p className="text-slate-500 text-sm">
                    Tidak ada tanggal tersedia dalam 14 hari ke depan
                  </p>
                ) : (
                  <div className="flex gap-2 flex-wrap">
                    {availableDates.map(({ date, label, dayOfWeek }) => {
                      const val = format(date, "yyyy-MM-dd");
                      const active = selectedDate === val;
                      return (
                        <button
                          key={val}
                          type="button"
                          onClick={() => handleDateSelect(date, dayOfWeek)}
                          className="px-3 py-2 rounded-xl text-xs font-semibold transition"
                          style={{
                            background: active
                              ? "rgba(220,38,38,0.15)"
                              : "rgba(255,255,255,0.04)",
                            border: `1px solid ${active ? "rgba(220,38,38,0.40)" : "rgba(255,255,255,0.08)"}`,
                            color: active ? "#f87171" : "#94a3b8",
                          }}>
                          {label}
                        </button>
                      );
                    })}
                  </div>
                )}
                {errors.booking_date && (
                  <p className="text-red-400 text-xs mt-1.5">
                    {errors.booking_date.message}
                  </p>
                )}
              </div>

              {/* Pilih slot */}
              {selectedDow !== null && (
                <div>
                  <label className={labelClass}>Pilih Jam</label>
                  {slotsForDate.length === 0 ? (
                    <p className="text-slate-500 text-sm">
                      Tidak ada slot untuk hari ini
                    </p>
                  ) : (
                    <div className="flex gap-2 flex-wrap">
                      {slotsForDate.map((slot) => {
                        const active = selectedSlotId === slot.id;
                        return (
                          <button
                            key={slot.id}
                            type="button"
                            onClick={() => setValue("slot_id", slot.id)}
                            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition"
                            style={{
                              background: active
                                ? "rgba(220,38,38,0.15)"
                                : "rgba(255,255,255,0.04)",
                              border: `1px solid ${active ? "rgba(220,38,38,0.40)" : "rgba(255,255,255,0.08)"}`,
                              color: active ? "#f87171" : "#94a3b8",
                            }}>
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
                    <p className="text-red-400 text-xs mt-1.5">
                      {errors.slot_id.message}
                    </p>
                  )}
                </div>
              )}

              {/* Kendaraan */}
              <div>
                <label className={labelClass}>Jenis Kendaraan</label>
                <input
                  {...register("vehicle_type")}
                  placeholder="Honda Beat 2022 / Toyota Avanza"
                  className={inputClass}
                  style={{
                    borderColor: errors.vehicle_type
                      ? "rgba(239,68,68,0.5)"
                      : "rgba(255,255,255,0.09)",
                  }}
                />
                {errors.vehicle_type && (
                  <p className="text-red-400 text-xs mt-1.5">
                    {errors.vehicle_type.message}
                  </p>
                )}
              </div>

              {/* Keluhan */}
              <div>
                <label className={labelClass}>Keluhan / Kerusakan</label>
                <textarea
                  {...register("complaint")}
                  rows={3}
                  placeholder="Ganti oli, rem bunyi, AC tidak dingin..."
                  className={`${inputClass} resize-none`}
                  style={{
                    borderColor: errors.complaint
                      ? "rgba(239,68,68,0.5)"
                      : "rgba(255,255,255,0.09)",
                  }}
                />
                {errors.complaint && (
                  <p className="text-red-400 text-xs mt-1.5">
                    {errors.complaint.message}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={bookingMutation.isPending}
                className="w-full py-3 rounded-xl text-sm font-bold text-white bg-red-600 hover:bg-red-700 transition flex items-center justify-center gap-2 disabled:opacity-60"
                style={{ boxShadow: "0 4px 14px rgba(220,38,38,0.25)" }}>
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
