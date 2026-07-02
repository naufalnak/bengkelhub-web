"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  Plus,
  Trash2,
  Loader2,
  User,
  Wrench,
  FileText,
  Receipt,
} from "lucide-react";
import { serviceApi, invoiceApi, ApiRequestError } from "@/lib/api";
import { ServiceItemModal } from "@/components/operator/ServiceItemModal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Badge } from "@/components/ui/Badge";
import { SectionLoader } from "@/components/ui/PageLoader";
import { Header } from "@/components/layout/Header";
import {
  cn,
  inputClass,
  btnPrimary,
  btnOutline,
  formatCurrency,
  formatDateTime,
} from "@/lib/utils";
import { toast } from "@/components/ui/Toast";
import { serviceStatusVariant, serviceStatusLabel } from "@/lib/variants";
import type { ServiceStatus, ServiceItem } from "@/lib/types";

const NEXT_STATUSES: Partial<Record<ServiceStatus, ServiceStatus[]>> = {
  pending: ["in_progress", "cancelled"],
  in_progress: ["done", "cancelled"],
};

function ItemRow({
  item,
  onDelete,
  deleting,
}: {
  item: ServiceItem;
  onDelete: () => void;
  deleting: boolean;
}) {
  return (
    <div className="flex items-center gap-4 px-4 py-3 border-b border-gray-100 last:border-0">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-900">{item.name}</p>
        {item.description && (
          <p className="text-xs text-gray-400">{item.description}</p>
        )}
      </div>
      <span className="text-xs text-gray-500 w-16 text-right">
        {item.qty}x
      </span>
      <span className="text-xs text-gray-500 w-28 text-right">
        {formatCurrency(item.unit_price)}
      </span>
      <span className="text-sm font-semibold text-gray-900 w-28 text-right">
        {formatCurrency(item.total)}
      </span>
      <button
        onClick={onDelete}
        disabled={deleting}
        className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition disabled:opacity-50">
        {deleting ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Trash2 className="w-4 h-4" />
        )}
      </button>
    </div>
  );
}

export default function ServiceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();

  const [itemModalOpen, setItemModalOpen] = useState(false);
  const [confirmDeleteItem, setConfirmDeleteItem] = useState<ServiceItem | null>(
    null,
  );
  const [diagnosis, setDiagnosis] = useState("");
  const [editingDiagnosis, setEditingDiagnosis] = useState(false);

  const { data: service, isLoading } = useQuery({
    queryKey: ["service", id],
    queryFn: () => serviceApi.getById(id),
  });

  const updateMutation = useMutation({
    mutationFn: (payload: { status?: ServiceStatus; diagnosis?: string }) =>
      serviceApi.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["service", id] });
      queryClient.invalidateQueries({ queryKey: ["services"] });
      toast.success("Servis berhasil diperbarui");
      setEditingDiagnosis(false);
    },
    onError: (err: unknown) => {
      const message =
        err instanceof ApiRequestError ? err.message : "Gagal memperbarui servis";
      toast.error(message);
    },
  });

  const deleteItemMutation = useMutation({
    mutationFn: (itemId: string) => serviceApi.deleteItem(id, itemId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["service", id] });
      toast.success("Item berhasil dihapus");
      setConfirmDeleteItem(null);
    },
    onError: (err: unknown) => {
      const message =
        err instanceof ApiRequestError ? err.message : "Gagal menghapus item";
      toast.error(message);
    },
  });

  const createInvoiceMutation = useMutation({
    mutationFn: () =>
      invoiceApi.create(service!.workshop_id, { service_id: id }),
    onSuccess: (invoice) => {
      toast.success("Invoice berhasil dibuat");
      router.push(`/operator/invoices/${invoice.id}`);
    },
    onError: (err: unknown) => {
      const message =
        err instanceof ApiRequestError ? err.message : "Gagal membuat invoice";
      toast.error(message);
    },
  });

  if (isLoading) return <SectionLoader />;
  if (!service)
    return (
      <div className="p-6 text-center">
        <p className="text-gray-500">Servis tidak ditemukan</p>
      </div>
    );

  const items = service.service_items ?? [];
  const subtotal = items.reduce((sum, i) => sum + i.total, 0);
  const nextStatuses = NEXT_STATUSES[service.status] ?? [];
  const canManage =
    service.status === "pending" || service.status === "in_progress";

  return (
    <>
      <Header
        title={service.service_no}
        subtitle="Detail pekerjaan servis"
      />

      <div className="p-6 space-y-6 max-w-4xl">
        <button
          onClick={() => router.push("/operator/services")}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-900 text-sm transition">
          <ArrowLeft className="w-4 h-4" /> Kembali ke daftar servis
        </button>

        {/* Info card */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center flex-shrink-0">
                <Wrench className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-lg font-bold text-gray-900">
                    {service.vehicle?.plate_number}
                  </h2>
                  <Badge variant={serviceStatusVariant[service.status]}>
                    {serviceStatusLabel[service.status]}
                  </Badge>
                </div>
                <p className="text-sm text-gray-500 mt-0.5">
                  {service.vehicle?.brand} {service.vehicle?.model}
                </p>
                <div className="flex items-center gap-1.5 text-xs text-gray-400 mt-1.5">
                  <User className="w-3.5 h-3.5" />
                  {service.vehicle?.customer?.name ?? "—"}
                </div>
              </div>
            </div>

            {/* Status action */}
            {nextStatuses.length > 0 && (
              <div className="flex gap-2">
                {nextStatuses.map((s) => (
                  <button
                    key={s}
                    onClick={() => updateMutation.mutate({ status: s })}
                    disabled={updateMutation.isPending}
                    className={cn(
                      s === "cancelled" ? btnOutline : btnPrimary,
                      "px-4 py-2 text-xs",
                    )}>
                    {s === "cancelled"
                      ? "Batalkan"
                      : `Tandai ${serviceStatusLabel[s]}`}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-5 pt-5 border-t border-gray-100">
            <div>
              <p className="text-xs text-gray-400">Tanggal Masuk</p>
              <p className="text-sm font-semibold text-gray-900 mt-0.5">
                {formatDateTime(service.start_date)}
              </p>
            </div>
            {service.end_date && (
              <div>
                <p className="text-xs text-gray-400">Tanggal Selesai</p>
                <p className="text-sm font-semibold text-gray-900 mt-0.5">
                  {formatDateTime(service.end_date)}
                </p>
              </div>
            )}
          </div>

          <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="text-xs text-gray-400 mb-1">Keluhan</p>
            <p className="text-sm text-gray-700 leading-relaxed">
              {service.complaint}
            </p>
          </div>

          {service.notes && (
            <div className="mt-3">
              <p className="text-xs text-gray-400 mb-1">Catatan</p>
              <p className="text-sm text-gray-700 leading-relaxed">
                {service.notes}
              </p>
            </div>
          )}
        </div>

        {/* Diagnosis */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <FileText className="w-4 h-4 text-[var(--navy)]" /> Diagnosis
            </h3>
            {!editingDiagnosis && canManage && (
              <button
                onClick={() => {
                  setDiagnosis(service.diagnosis);
                  setEditingDiagnosis(true);
                }}
                className="text-xs text-red-600 hover:text-red-700 font-semibold transition">
                {service.diagnosis ? "Edit" : "+ Tambah diagnosis"}
              </button>
            )}
          </div>

          {editingDiagnosis ? (
            <div className="space-y-3">
              <textarea
                value={diagnosis}
                onChange={(e) => setDiagnosis(e.target.value)}
                rows={3}
                placeholder="Kampas rem habis, oli mesin perlu diganti..."
                className={cn(inputClass, "resize-none")}
              />
              <div className="flex gap-2">
                <button
                  onClick={() => updateMutation.mutate({ diagnosis })}
                  disabled={updateMutation.isPending}
                  className={cn(btnPrimary, "px-4 py-2 text-xs")}>
                  Simpan
                </button>
                <button
                  onClick={() => setEditingDiagnosis(false)}
                  className={cn(btnOutline, "px-4 py-2 text-xs")}>
                  Batal
                </button>
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-600 leading-relaxed">
              {service.diagnosis || (
                <span className="text-gray-400">Belum ada diagnosis</span>
              )}
            </p>
          )}
        </div>

        {/* Service items */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h3 className="text-sm font-bold text-gray-900">
              Sparepart & Jasa
            </h3>
            {canManage && (
              <button
                onClick={() => setItemModalOpen(true)}
                className={cn(btnPrimary, "px-3 py-1.5 text-xs")}>
                <Plus className="w-3.5 h-3.5" /> Tambah Item
              </button>
            )}
          </div>

          {items.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">
              Belum ada item ditambahkan
            </p>
          ) : (
            <>
              <div>
                {items.map((item) => (
                  <ItemRow
                    key={item.id}
                    item={item}
                    onDelete={() => setConfirmDeleteItem(item)}
                    deleting={
                      deleteItemMutation.isPending &&
                      deleteItemMutation.variables === item.id
                    }
                  />
                ))}
              </div>
              <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-t border-gray-100">
                <span className="text-sm font-semibold text-gray-600">
                  Subtotal
                </span>
                <span className="text-base font-bold text-gray-900">
                  {formatCurrency(subtotal)}
                </span>
              </div>
            </>
          )}
        </div>

        {/* Create invoice CTA */}
        {service.status === "done" && items.length > 0 && (
          <div className="bg-green-50 border border-green-200 rounded-2xl p-5 flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <Receipt className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-bold text-green-800">
                  Servis selesai, siap dibuatkan invoice
                </p>
                <p className="text-xs text-green-600">
                  Total {formatCurrency(subtotal)} dari {items.length} item
                </p>
              </div>
            </div>
            <button
              onClick={() => createInvoiceMutation.mutate()}
              disabled={createInvoiceMutation.isPending}
              className={cn(btnPrimary, "px-5 py-2.5 text-sm")}>
              {createInvoiceMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Membuat...
                </>
              ) : (
                "Buat Invoice"
              )}
            </button>
          </div>
        )}
      </div>

      <ServiceItemModal
        open={itemModalOpen}
        onClose={() => setItemModalOpen(false)}
        serviceId={id}
      />

      <ConfirmDialog
        open={!!confirmDeleteItem}
        onClose={() => setConfirmDeleteItem(null)}
        onConfirm={() =>
          confirmDeleteItem && deleteItemMutation.mutate(confirmDeleteItem.id)
        }
        title="Hapus Item"
        description={`Yakin ingin menghapus item "${confirmDeleteItem?.name}"?`}
        confirmLabel="Ya, Hapus"
        loading={deleteItemMutation.isPending}
      />
    </>
  );
}
