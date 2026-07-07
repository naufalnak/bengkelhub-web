"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, QrCode, X, MapPin } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { workshopApi } from "@/lib/api";
import { Modal } from "@/components/ui/Modal";
import {
  cn,
  inputClass,
  labelClass,
  btnPrimary,
  btnOutline,
  extractLatLngFromGoogleMapsURL,
} from "@/lib/utils";
import { toast } from "@/components/ui/Toast";
import type { Workshop } from "@/lib/types";

const MAX_QRIS_SIZE_MB = 2;

const schema = z.object({
  name: z.string().min(3, "Nama minimal 3 karakter"),
  address: z.string().min(5, "Alamat minimal 5 karakter"),
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
  const [qrisImage, setQrisImage] = useState<string | undefined>(undefined);
  const [mapsLink, setMapsLink] = useState("");
  const [coords, setCoords] = useState<
    { lat: number; lng: number } | undefined
  >(undefined);
  const [mapsError, setMapsError] = useState("");

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
        phone: workshop.phone,
        description: workshop.description,
      });
      Promise.resolve().then(() => {
        setQrisImage(workshop.qris_image_url || undefined);
        if (workshop.latitude != null && workshop.longitude != null) {
          setCoords({ lat: workshop.latitude, lng: workshop.longitude });
        } else {
          setCoords(undefined);
        }
        setMapsLink("");
        setMapsError("");
      });
    } else {
      reset({ name: "", address: "", phone: "", description: "" });
      Promise.resolve().then(() => {
        setQrisImage(undefined);
        setCoords(undefined);
        setMapsLink("");
        setMapsError("");
      });
    }
  }, [workshop, reset]);

  const handleMapsLinkChange = (value: string) => {
    setMapsLink(value);
    if (!value.trim()) {
      setMapsError("");
      return;
    }
    const parsed = extractLatLngFromGoogleMapsURL(value);
    if (parsed) {
      setCoords(parsed);
      setMapsError("");
    } else {
      setMapsError(
        "Koordinat gak ketemu di link ini. Pastikan link lengkap dari address bar (bukan link singkat maps.app.goo.gl), atau isi manual di bawah.",
      );
    }
  };

  const handleQrisChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("File harus berupa gambar (PNG/JPG)");
      return;
    }
    if (file.size > MAX_QRIS_SIZE_MB * 1024 * 1024) {
      toast.error(`Ukuran gambar maksimal ${MAX_QRIS_SIZE_MB}MB`);
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setQrisImage(reader.result as string);
    reader.onerror = () => toast.error("Gagal membaca file gambar");
    reader.readAsDataURL(file);
  };

  const mutation = useMutation({
    mutationFn: (data: FormData) =>
      isEdit
        ? workshopApi.update(workshop!.id, {
            ...data,
            qris_image_url: qrisImage,
            latitude: coords?.lat,
            longitude: coords?.lng,
          })
        : workshopApi.create({
            ...data,
            latitude: coords?.lat,
            longitude: coords?.lng,
          }),
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
          <label className={labelClass}>Lokasi Google Maps (opsional)</label>
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <input
              value={mapsLink}
              onChange={(e) => handleMapsLinkChange(e.target.value)}
              placeholder="Tempel link Google Maps ke sini..."
              className={inputClass}
            />
          </div>
          {mapsError ? (
            <p className="text-red-500 text-xs mt-1.5">{mapsError}</p>
          ) : coords ? (
            <p className="text-xs text-emerald-600 mt-1.5 font-medium">
              ✓ Koordinat terdeteksi: {coords.lat.toFixed(5)},{" "}
              {coords.lng.toFixed(5)}
            </p>
          ) : (
            <p className="text-xs text-gray-400 mt-1.5">
              Buka lokasi bengkel di Google Maps, copy link dari address bar
              browser, lalu tempel di sini. Ini dipakai buat fitur &quot;cari
              bengkel terdekat&quot; di sisi customer.
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
        {isEdit && (
          <div>
            <label className={labelClass}>
              Kode QRIS (buat pembayaran tunai/QRIS di tempat)
            </label>
            {qrisImage ? (
              <div className="relative w-32 h-32 rounded-xl border border-gray-200 overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={qrisImage}
                  alt="QRIS bengkel"
                  className="w-full h-full object-contain"
                />
                <button
                  type="button"
                  onClick={() => setQrisImage(undefined)}
                  className="absolute top-1 right-1 w-6 h-6 rounded-full bg-white/90 border border-gray-200 flex items-center justify-center hover:bg-red-50">
                  <X className="w-3.5 h-3.5 text-red-600" />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center w-32 h-32 rounded-xl border-2 border-dashed border-gray-300 cursor-pointer hover:border-gray-400 transition">
                <QrCode className="w-6 h-6 text-gray-400" />
                <span className="text-xs text-gray-400 mt-1">Upload QRIS</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleQrisChange}
                  className="hidden"
                />
              </label>
            )}
            <p className="text-xs text-gray-400 mt-1.5">
              Gambar kode QRIS statis dari bank/e-wallet bengkel, akan
              ditampilkan ke customer di halaman invoice. Maks{" "}
              {MAX_QRIS_SIZE_MB}MB.
            </p>
          </div>
        )}
      </form>
    </Modal>
  );
}
