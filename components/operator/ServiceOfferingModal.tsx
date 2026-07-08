"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2, Pencil, Loader2, Wrench } from "lucide-react";
import { serviceOfferingApi, ApiRequestError } from "@/lib/api";
import { Modal } from "@/components/ui/Modal";
import { EmptyState } from "@/components/ui/EmptyState";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import {
  cn,
  formatCurrency,
  inputClass,
  labelClass,
  btnPrimary,
} from "@/lib/utils";
import { toast } from "@/components/ui/Toast";
import type { ServiceOffering } from "@/lib/types";

interface ServiceOfferingModalProps {
  open: boolean;
  onClose: () => void;
  workshopId: string;
  workshopName: string;
}

interface FormState {
  name: string;
  description: string;
  estimatedPrice: string;
}

const emptyForm: FormState = { name: "", description: "", estimatedPrice: "" };

export function ServiceOfferingModal({
  open,
  onClose,
  workshopId,
  workshopName,
}: ServiceOfferingModalProps) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState<FormState>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [toDelete, setToDelete] = useState<ServiceOffering | null>(null);

  const { data: offerings = [], isLoading } = useQuery({
    queryKey: ["service-offerings", workshopId],
    queryFn: () => serviceOfferingApi.list(workshopId),
    enabled: open,
  });

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
  };

  const createMutation = useMutation({
    mutationFn: () =>
      serviceOfferingApi.create(workshopId, {
        name: form.name,
        description: form.description || undefined,
        estimated_price: form.estimatedPrice
          ? Number(form.estimatedPrice)
          : null,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["service-offerings", workshopId],
      });
      toast.success("Layanan berhasil ditambahkan");
      resetForm();
    },
    onError: (err: unknown) => {
      toast.error(
        err instanceof ApiRequestError ? err.message : "Gagal menambah layanan",
      );
    },
  });

  const updateMutation = useMutation({
    mutationFn: () =>
      serviceOfferingApi.update(editingId!, {
        name: form.name,
        description: form.description,
        estimated_price: form.estimatedPrice
          ? Number(form.estimatedPrice)
          : null,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["service-offerings", workshopId],
      });
      toast.success("Layanan berhasil diperbarui");
      resetForm();
    },
    onError: (err: unknown) => {
      toast.error(
        err instanceof ApiRequestError
          ? err.message
          : "Gagal memperbarui layanan",
      );
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => serviceOfferingApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["service-offerings", workshopId],
      });
      toast.success("Layanan berhasil dihapus");
      setToDelete(null);
    },
    onError: (err: unknown) => {
      toast.error(
        err instanceof ApiRequestError
          ? err.message
          : "Gagal menghapus layanan",
      );
    },
  });

  const startEdit = (o: ServiceOffering) => {
    setEditingId(o.id);
    setForm({
      name: o.name,
      description: o.description,
      estimatedPrice:
        o.estimated_price != null ? String(o.estimated_price) : "",
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error("Nama layanan wajib diisi");
      return;
    }
    if (editingId) {
      updateMutation.mutate();
    } else {
      createMutation.mutate();
    }
  };

  const saving = createMutation.isPending || updateMutation.isPending;

  return (
    <>
      <Modal
        open={open}
        onClose={() => {
          resetForm();
          onClose();
        }}
        title="Kelola Layanan"
        subtitle={`Daftar layanan yang ditampilkan ke customer di halaman ${workshopName}`}
        size="md">
        <div className="space-y-5">
          {/* Form tambah/edit */}
          <form
            onSubmit={handleSubmit}
            className="bg-gray-50 rounded-xl p-4 space-y-3 border border-gray-200">
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2 sm:col-span-1">
                <label className={labelClass}>Nama Layanan</label>
                <input
                  value={form.name}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, name: e.target.value }))
                  }
                  placeholder="Ganti Oli"
                  className={inputClass}
                />
              </div>
              <div className="col-span-2 sm:col-span-1">
                <label className={labelClass}>Estimasi Harga (opsional)</label>
                <input
                  type="number"
                  min={0}
                  value={form.estimatedPrice}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, estimatedPrice: e.target.value }))
                  }
                  placeholder="75000"
                  className={inputClass}
                />
              </div>
              <div className="col-span-2">
                <label className={labelClass}>Deskripsi (opsional)</label>
                <input
                  value={form.description}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, description: e.target.value }))
                  }
                  placeholder="Oli mesin + cek pelumas lainnya"
                  className={inputClass}
                />
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-3 py-2 text-xs font-semibold text-gray-500 hover:text-gray-700">
                  Batal Edit
                </button>
              )}
              <button
                type="submit"
                disabled={saving}
                className={cn(btnPrimary, "px-4 py-2 text-xs")}>
                {saving ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : editingId ? (
                  <Pencil className="w-3.5 h-3.5" />
                ) : (
                  <Plus className="w-3.5 h-3.5" />
                )}
                {editingId ? "Simpan Perubahan" : "Tambah Layanan"}
              </button>
            </div>
          </form>

          {/* Daftar layanan */}
          {isLoading ? (
            <div className="flex justify-center py-6">
              <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
            </div>
          ) : offerings.length === 0 ? (
            <EmptyState
              icon={Wrench}
              title="Belum ada layanan"
              description="Tambahkan layanan pertama lewat form di atas"
            />
          ) : (
            <div className="space-y-2 max-h-72 overflow-y-auto">
              {offerings.map((o) => (
                <div
                  key={o.id}
                  className="flex items-start justify-between gap-3 bg-white border border-gray-200 rounded-xl px-4 py-3">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-900">
                      {o.name}
                    </p>
                    {o.description && (
                      <p className="text-xs text-gray-400 mt-0.5">
                        {o.description}
                      </p>
                    )}
                    {o.estimated_price != null && (
                      <p className="text-xs font-semibold text-gray-600 mt-1">
                        Mulai {formatCurrency(o.estimated_price)}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    <button
                      onClick={() => startEdit(o)}
                      className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-500">
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setToDelete(o)}
                      className="w-8 h-8 rounded-lg hover:bg-red-50 flex items-center justify-center text-red-500">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Modal>

      <ConfirmDialog
        open={!!toDelete}
        onClose={() => setToDelete(null)}
        onConfirm={() => toDelete && deleteMutation.mutate(toDelete.id)}
        title="Hapus Layanan"
        description={`Yakin ingin menghapus layanan "${toDelete?.name}"?`}
        confirmLabel="Ya, Hapus"
        loading={deleteMutation.isPending}
      />
    </>
  );
}
