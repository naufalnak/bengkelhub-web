import type { Invoice, ServiceItem, Workshop } from "@/lib/types";

interface GenerateInvoicePdfParams {
  invoice: Invoice;
  workshop?: Workshop | null;
  serviceItems?: ServiceItem[];
}

/**
 * Generate PDF invoice sepenuhnya di browser (client-side) lalu trigger
 * download. Import @react-pdf/renderer di-lazy-load di dalam fungsi ini
 * supaya library berat ini tidak ikut ke bundle awal halaman & tidak
 * pernah dievaluasi di server (SSR/RSC).
 */
export async function generateInvoicePdf({
  invoice,
  workshop,
  serviceItems,
}: GenerateInvoicePdfParams) {
  const [{ pdf }, { InvoicePdfDocument }] = await Promise.all([
    import("@react-pdf/renderer"),
    import("@/lib/pdf/InvoicePdfDocument"),
  ]);

  const blob = await pdf(
    <InvoicePdfDocument
      invoice={invoice}
      workshop={workshop}
      serviceItems={serviceItems}
    />,
  ).toBlob();

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${invoice.invoice_no}.pdf`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
