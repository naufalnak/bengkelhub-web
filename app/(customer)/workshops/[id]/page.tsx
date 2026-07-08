"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
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
  Tag,
} from "lucide-react";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import {
  workshopApi,
  slotApi,
  orderApi,
  serviceOfferingApi,
  ApiRequestError,
} from "@/lib/api";
import { useAuthStore } from "@/store/auth";
import { Badge } from "@/components/ui/Badge";
import { SectionLoader } from "@/components/ui/PageLoader";
import {
  cn,
  inputClass,
  labelClass,
  btnPrimary,
  btnOutline,
  formatCurrency,
} from "@/lib/utils";
import { toast } from "@/components/ui/Toast";

const schema = z.object({
  slot_id: z.string().min(1, "Pilih jadwal terlebih dahulu"),
  vehicle_type: z.string().min(2, "Jenis kendaraan wajib diisi"),
  vehicle_plate: z.string().min(3, "Nomor plat wajib diisi"),
  notes: z.string().optional().or(z.literal("")),
});
type FormData = z.infer<typeof schema>;

export default function WorkshopDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { isAuthenticated, role } = useAuthStore();
  const [success, setSuccess] = useState(false);

  const { data: workshop, isLoading: loadingWs } = useQuery({
    queryKey: ["workshop", id],
    queryFn: () => workshopApi.getById(id),
  });

  // Cuma slot yang masih ada sisa kuota & belum lewat tanggalnya
  const { data: slots = [], isLoading: loadingSlots } = useQuery({
    queryKey: ["slots-public", id],
    queryFn: () => slotApi.listByWorkshop(id, true),
  });

  const { data: offerings = [], isLoading: loadingOfferings } = useQuery({
    queryKey: ["service-offerings", id],
    queryFn: () => serviceOfferingApi.list(id),
  });

  const sortedSlots = [...slots].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  );

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const selectedSlotId = watch("slot_id");

  const bookingMutation = useMutation({
    mutationFn: (data: FormData) =>
      orderApi.create({ ...data, workshop_id: id }),
    onSuccess: () => {
      setSuccess(true);
      toast.success("Booking berhasil! Menunggu konfirmasi bengkel");
    },
    onError: (err: unknown) => {
      const message =
        err instanceof ApiRequestError ? err.message : "Gagal membuat booking";
      toast.error(message);
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
    <div className="max-w-5xl mx-auto">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-gray-500 hover:text-gray-900 text-sm transition mb-5">
        <ArrowLeft className="w-4 h-4" /> Semua Bengkel
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ───── Left — Info ───── */}
        <div className="lg:col-span-2 space-y-5">
          {/* Header card */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-2xl bg-[var(--navy)] flex items-center justify-center flex-shrink-0">
                <Wrench className="w-7 h-7 text-white" />
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
                <a
                  href={
                    workshop.latitude != null && workshop.longitude != null
                      ? `https://www.google.com/maps/search/?api=1&query=${workshop.latitude},${workshop.longitude}`
                      : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                          `${workshop.name} ${workshop.address}`,
                        )}`
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-gray-500 hover:text-red-600 text-sm mt-1.5 transition group w-fit">
                  <MapPin className="w-3.5 h-3.5 text-gray-400 group-hover:text-red-500 flex-shrink-0" />
                  <span className="underline decoration-gray-300 group-hover:decoration-red-400 underline-offset-2">
                    {workshop.address}
                  </span>
                </a>
              </div>
            </div>

            {/* Info row */}
            <div className="flex flex-wrap gap-4 py-4 my-4 border-y border-gray-100">
              <div className="flex items-center gap-1.5 text-sm text-gray-600">
                <Phone className="w-4 h-4 text-gray-400" />
                {workshop.phone}
              </div>
            </div>

            {workshop.description && (
              <p className="text-sm text-gray-600 leading-relaxed">
                {workshop.description}
              </p>
            )}
          </div>

          {/* Slot tersedia */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2 mb-4">
              <CalendarClock className="w-4 h-4 text-[var(--navy)]" /> Jadwal
              Tersedia
            </h2>
            {loadingSlots ? (
              <SectionLoader />
            ) : sortedSlots.length === 0 ? (
              <p className="text-gray-400 text-sm">
                Belum ada jadwal tersedia saat ini
              </p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {sortedSlots.map((slot) => (
                  <div
                    key={slot.id}
                    className="flex items-center gap-2 px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm">
                    <span className="font-semibold text-gray-900">
                      {format(new Date(slot.date), "EEE, dd MMM", {
                        locale: idLocale,
                      })}
                    </span>
                    <span className="text-gray-400">
                      {format(new Date(slot.date), "HH:mm")}
                    </span>
                    <div className="flex items-center gap-1 text-gray-400 text-xs">
                      <Users className="w-3 h-3" />
                      {slot.remaining}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Layanan yang ditawarkan */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2 mb-4">
              <Wrench className="w-4 h-4 text-[var(--navy)]" /> Layanan
            </h2>
            {loadingOfferings ? (
              <SectionLoader />
            ) : offerings.length === 0 ? (
              <p className="text-gray-400 text-sm">
                Bengkel ini belum mencantumkan daftar layanan
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {offerings.map((o) => (
                  <div
                    key={o.id}
                    className="flex items-start gap-3 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3">
                    <div className="w-8 h-8 rounded-lg bg-white border border-gray-200 flex items-center justify-center flex-shrink-0">
                      <Tag className="w-3.5 h-3.5 text-gray-400" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-900">
                        {o.name}
                      </p>
                      {o.description && (
                        <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
                          {o.description}
                        </p>
                      )}
                      {o.estimated_price != null && (
                        <p className="text-xs font-semibold text-[var(--navy)] mt-1">
                          Mulai {formatCurrency(o.estimated_price)}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ───── Right — Sticky booking CTA ───── */}
        <div>
          <div className="bg-white rounded-2xl border border-gray-200 p-5 sticky top-6">
            <h3 className="text-base font-semibold text-gray-900 mb-1">
              Pesan Sekarang
            </h3>
            <p className="text-xs text-gray-500 mb-5">
              Pilih jadwal, lalu isi detail kendaraan
            </p>

            {!isAuthenticated ? (
              <div className="text-center py-6 bg-gray-50 rounded-xl border border-gray-200">
                <p className="text-gray-600 mb-4 text-sm">
                  Kamu perlu login untuk booking
                </p>
                <button
                  onClick={() =>
                    router.push(`/login?redirect=/workshops/${id}`)
                  }
                  className={cn(btnPrimary, "px-5 py-2.5 text-sm mx-auto")}>
                  Login Sekarang
                </button>
                <p className="text-xs text-gray-400 mt-3">
                  Belum punya akun?{" "}
                  <Link href="/daftar" className="text-red-600 hover:underline">
                    Daftar
                  </Link>
                </p>
              </div>
            ) : role() === "operator" ? (
              <div className="text-center py-6">
                <p className="text-gray-400 text-sm">
                  Akun operator tidak bisa melakukan booking
                </p>
              </div>
            ) : (
              <form
                onSubmit={handleSubmit((d) => bookingMutation.mutate(d))}
                className="space-y-4">
                {bookingMutation.isError && (
                  <div className="bg-red-50 border border-red-200 text-red-600 text-xs px-3 py-2.5 rounded-xl">
                    {(bookingMutation.error as Error).message}
                  </div>
                )}

                {/* Pilih slot */}
                <div>
                  <label className={labelClass}>Pilih Jadwal</label>
                  {sortedSlots.length === 0 ? (
                    <p className="text-gray-400 text-xs">
                      Tidak ada jadwal tersedia saat ini
                    </p>
                  ) : (
                    <div className="flex flex-wrap gap-1.5">
                      {sortedSlots.map((slot) => {
                        const active = selectedSlotId === slot.id;
                        return (
                          <button
                            key={slot.id}
                            type="button"
                            onClick={() => setValue("slot_id", slot.id)}
                            className={cn(
                              "flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold border transition",
                              active
                                ? "bg-[var(--navy)] text-white border-[var(--navy)]"
                                : "bg-white text-gray-600 border-gray-200 hover:border-gray-300",
                            )}>
                            {format(new Date(slot.date), "dd MMM, HH:mm", {
                              locale: idLocale,
                            })}
                            <span className="opacity-60">
                              ({slot.remaining})
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

                <div>
                  <label className={labelClass}>Jenis Kendaraan</label>
                  <input
                    {...register("vehicle_type")}
                    placeholder="Honda Beat 2022 / Toyota Avanza"
                    className={cn(
                      inputClass,
                      "text-sm",
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
                  <label className={labelClass}>Nomor Plat</label>
                  <input
                    {...register("vehicle_plate")}
                    placeholder="B 1234 ABC"
                    className={cn(
                      inputClass,
                      "text-sm",
                      errors.vehicle_plate && "border-red-400",
                    )}
                  />
                  {errors.vehicle_plate && (
                    <p className="text-red-500 text-xs mt-1.5">
                      {errors.vehicle_plate.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className={labelClass}>
                    Keluhan / Kerusakan (opsional)
                  </label>
                  <textarea
                    {...register("notes")}
                    rows={3}
                    placeholder="Ganti oli, rem bunyi, AC tidak dingin..."
                    className={cn(inputClass, "text-sm resize-none")}
                  />
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
    </div>
  );
}
