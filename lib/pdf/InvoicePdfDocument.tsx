import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import { formatCurrency, formatDate, formatDateTime } from "@/lib/utils";
import type { Invoice, ServiceItem, Workshop } from "@/lib/types";

const PAYMENT_METHOD_LABEL: Record<string, string> = {
  cash: "Tunai",
  transfer: "Transfer",
  qris: "QRIS",
};

const STATUS_LABEL: Record<string, string> = {
  unpaid: "Belum Dibayar",
  partial: "Dibayar Sebagian",
  paid: "Lunas",
};

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: "Helvetica",
    color: "#1f2937",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  workshopName: {
    fontSize: 16,
    fontFamily: "Helvetica-Bold",
    marginBottom: 3,
  },
  mutedSmall: {
    fontSize: 9,
    color: "#6b7280",
    marginBottom: 1,
  },
  invoiceTitle: {
    fontSize: 18,
    fontFamily: "Helvetica-Bold",
    textAlign: "right",
  },
  invoiceNo: {
    fontSize: 10,
    color: "#6b7280",
    textAlign: "right",
    marginTop: 3,
  },
  statusBadge: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    textAlign: "right",
    marginTop: 6,
  },
  section: {
    marginBottom: 18,
  },
  sectionTitle: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: "#6b7280",
    textTransform: "uppercase",
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  twoColRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  colBlock: {
    width: "48%",
  },
  bold: {
    fontFamily: "Helvetica-Bold",
  },
  table: {
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  tableHeaderRow: {
    flexDirection: "row",
    backgroundColor: "#f9fafb",
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderTopWidth: 1,
    borderTopColor: "#f3f4f6",
  },
  tableHeaderCell: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: "#6b7280",
    textTransform: "uppercase",
  },
  colItem: { width: "46%" },
  colQty: { width: "12%", textAlign: "center" },
  colPrice: { width: "21%", textAlign: "right" },
  colTotal: { width: "21%", textAlign: "right" },
  summaryBlock: {
    marginTop: 14,
    alignSelf: "flex-end",
    width: "50%",
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 3,
  },
  summaryDivider: {
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    marginTop: 4,
    paddingTop: 6,
  },
  summaryLabel: {
    color: "#6b7280",
  },
  summaryTotalLabel: {
    fontFamily: "Helvetica-Bold",
    fontSize: 11,
  },
  summaryTotalValue: {
    fontFamily: "Helvetica-Bold",
    fontSize: 11,
  },
  paidValue: {
    color: "#16a34a",
    fontFamily: "Helvetica-Bold",
  },
  dueValue: {
    color: "#dc2626",
    fontFamily: "Helvetica-Bold",
  },
  emptyNote: {
    fontSize: 9,
    color: "#9ca3af",
    textAlign: "center",
    paddingVertical: 14,
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: "center",
    fontSize: 8,
    color: "#9ca3af",
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    paddingTop: 8,
  },
});

interface InvoicePdfDocumentProps {
  invoice: Invoice;
  workshop?: Workshop | null;
  serviceItems?: ServiceItem[];
}

export function InvoicePdfDocument({
  invoice,
  workshop,
  serviceItems = [],
}: InvoicePdfDocumentProps) {
  const payments = invoice.payments ?? [];
  const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
  const remaining = Math.max(0, invoice.total - totalPaid);
  const vehicle = invoice.service?.vehicle;
  const customer = vehicle?.customer;

  return (
    <Document title={`Invoice ${invoice.invoice_no}`}>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.workshopName}>
              {workshop?.name ?? "BengkelHub"}
            </Text>
            {workshop?.address && (
              <Text style={styles.mutedSmall}>{workshop.address}</Text>
            )}
            {workshop?.phone && (
              <Text style={styles.mutedSmall}>{workshop.phone}</Text>
            )}
          </View>
          <View>
            <Text style={styles.invoiceTitle}>INVOICE</Text>
            <Text style={styles.invoiceNo}>{invoice.invoice_no}</Text>
            <Text style={styles.statusBadge}>
              {STATUS_LABEL[invoice.status] ?? invoice.status}
            </Text>
          </View>
        </View>

        {/* Info pelanggan & kendaraan */}
        <View style={[styles.section, styles.twoColRow]}>
          <View style={styles.colBlock}>
            <Text style={styles.sectionTitle}>Pelanggan</Text>
            <Text style={styles.bold}>{customer?.name ?? "-"}</Text>
            {customer?.phone && (
              <Text style={styles.mutedSmall}>{customer.phone}</Text>
            )}
            {customer?.address && (
              <Text style={styles.mutedSmall}>{customer.address}</Text>
            )}
          </View>
          <View style={styles.colBlock}>
            <Text style={styles.sectionTitle}>Kendaraan</Text>
            <Text style={styles.bold}>
              {vehicle ? `${vehicle.brand} ${vehicle.model}` : "-"}
            </Text>
            {vehicle?.plate_number && (
              <Text style={styles.mutedSmall}>{vehicle.plate_number}</Text>
            )}
            {invoice.service?.service_no && (
              <Text style={styles.mutedSmall}>
                No. Servis: {invoice.service.service_no}
              </Text>
            )}
          </View>
        </View>

        {/* Tanggal */}
        <View style={[styles.section, styles.twoColRow]}>
          <View style={styles.colBlock}>
            <Text style={styles.sectionTitle}>Tanggal Invoice</Text>
            <Text>{formatDate(invoice.created_at)}</Text>
          </View>
          <View style={styles.colBlock}>
            <Text style={styles.sectionTitle}>Jatuh Tempo</Text>
            <Text>{invoice.due_date ? formatDate(invoice.due_date) : "-"}</Text>
          </View>
        </View>

        {/* Rincian pekerjaan / item servis */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Rincian Pekerjaan</Text>
          <View style={styles.table}>
            <View style={styles.tableHeaderRow}>
              <Text style={[styles.tableHeaderCell, styles.colItem]}>Item</Text>
              <Text style={[styles.tableHeaderCell, styles.colQty]}>Qty</Text>
              <Text style={[styles.tableHeaderCell, styles.colPrice]}>
                Harga
              </Text>
              <Text style={[styles.tableHeaderCell, styles.colTotal]}>
                Subtotal
              </Text>
            </View>
            {serviceItems.length === 0 ? (
              <Text style={styles.emptyNote}>
                Tidak ada rincian item servis
              </Text>
            ) : (
              serviceItems.map((item) => (
                <View key={item.id} style={styles.tableRow}>
                  <Text style={styles.colItem}>{item.name}</Text>
                  <Text style={styles.colQty}>{item.qty}</Text>
                  <Text style={styles.colPrice}>
                    {formatCurrency(item.unit_price)}
                  </Text>
                  <Text style={styles.colTotal}>
                    {formatCurrency(item.total)}
                  </Text>
                </View>
              ))
            )}
          </View>
        </View>

        {/* Ringkasan biaya */}
        <View style={styles.summaryBlock}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal</Text>
            <Text>{formatCurrency(invoice.subtotal)}</Text>
          </View>
          {invoice.tax > 0 && (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Pajak</Text>
              <Text>{formatCurrency(invoice.tax)}</Text>
            </View>
          )}
          {invoice.discount > 0 && (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Diskon</Text>
              <Text>-{formatCurrency(invoice.discount)}</Text>
            </View>
          )}
          <View style={[styles.summaryRow, styles.summaryDivider]}>
            <Text style={styles.summaryTotalLabel}>Total</Text>
            <Text style={styles.summaryTotalValue}>
              {formatCurrency(invoice.total)}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Sudah Dibayar</Text>
            <Text style={styles.paidValue}>{formatCurrency(totalPaid)}</Text>
          </View>
          {remaining > 0 && (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Sisa Tagihan</Text>
              <Text style={styles.dueValue}>{formatCurrency(remaining)}</Text>
            </View>
          )}
        </View>

        {/* Riwayat pembayaran */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Riwayat Pembayaran</Text>
          <View style={styles.table}>
            <View style={styles.tableHeaderRow}>
              <Text style={[styles.tableHeaderCell, { width: "28%" }]}>
                Tanggal
              </Text>
              <Text style={[styles.tableHeaderCell, { width: "18%" }]}>
                Metode
              </Text>
              <Text style={[styles.tableHeaderCell, { width: "24%" }]}>
                Referensi
              </Text>
              <Text
                style={[
                  styles.tableHeaderCell,
                  { width: "30%", textAlign: "right" },
                ]}>
                Jumlah
              </Text>
            </View>
            {payments.length === 0 ? (
              <Text style={styles.emptyNote}>
                Belum ada pembayaran tercatat
              </Text>
            ) : (
              payments.map((p) => (
                <View key={p.id} style={styles.tableRow}>
                  <Text style={{ width: "28%" }}>
                    {formatDateTime(p.paid_at)}
                  </Text>
                  <Text style={{ width: "18%" }}>
                    {PAYMENT_METHOD_LABEL[p.method] ?? p.method}
                  </Text>
                  <Text style={{ width: "24%" }}>{p.reference_no || "-"}</Text>
                  <Text style={{ width: "30%", textAlign: "right" }}>
                    {formatCurrency(p.amount)}
                  </Text>
                </View>
              ))
            )}
          </View>
        </View>

        <Text style={styles.footer}>
          Invoice ini dibuat otomatis oleh sistem BengkelHub pada{" "}
          {formatDateTime(new Date().toISOString())}
        </Text>
      </Page>
    </Document>
  );
}
