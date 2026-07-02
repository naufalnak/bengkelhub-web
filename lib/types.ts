// ─── Auth ────────────────────────────────────────────────────────────────────

export type Role = "customer" | "operator" | "admin";

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: Role;
  email_verified: boolean;
  created_at: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  phone?: string;
  role?: "customer" | "operator"; // backend cuma terima 2 ini saat register
}

// ─── Workshop ────────────────────────────────────────────────────────────────

export interface Workshop {
  id: string;
  owner_id: string;
  owner?: User; // hasil Preload, ada di GetAll/GetByID/Create/GetMyWorkshops
  name: string;
  description: string;
  address: string;
  phone: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateWorkshopPayload {
  name: string;
  description?: string;
  address: string;
  phone?: string;
}

export interface UpdateWorkshopPayload {
  name?: string;
  description?: string;
  address?: string;
  phone?: string;
  is_active?: boolean;
}

// ─── Slot ────────────────────────────────────────────────────────────────────
// Catatan: model Slot di backend itu PER TANGGAL SPESIFIK (bukan jadwal
// mingguan berulang). Satu row = satu tanggal+jam dengan kuota sendiri.

export interface Slot {
  id: string;
  workshop_id: string;
  date: string; // ISO datetime, contoh: "2026-07-01T09:00:00Z"
  max_booking: number;
  booked: number;
  created_at: string;
  updated_at: string;
}

// Field tambahan yang di-attach handler GetByWorkshop / GetByID
export interface SlotWithAvailability extends Slot {
  remaining: number;
  available: boolean;
}

export interface CreateSlotPayload {
  date: string; // RFC3339, contoh: "2026-07-01T09:00:00Z"
  max_booking?: number;
}

export interface UpdateSlotPayload {
  date?: string;
  max_booking?: number;
}

// Generate banyak slot sekaligus berdasarkan rentang tanggal + hari tertentu
export interface BulkCreateSlotPayload {
  start_date: string; // "2026-07-01"
  end_date: string; // "2026-07-31"
  days_of_week: number[]; // 0=Minggu ... 6=Sabtu
  time: string; // "09:00"
  max_booking?: number;
}

export interface BulkCreateSlotResult {
  created: Slot[];
  skipped: number;
}

// ─── Order (booking publik) ──────────────────────────────────────────────────

export type BookingStatus = "pending" | "confirmed" | "done" | "cancelled";

export interface Order {
  id: string;
  customer_id: string;
  customer?: User;
  workshop_id: string;
  workshop?: Workshop;
  slot_id: string;
  slot?: Slot;
  status: BookingStatus;
  notes: string;
  vehicle_type: string;
  vehicle_plate: string;
  created_at: string;
  updated_at: string;
}

export interface CreateOrderPayload {
  workshop_id: string;
  slot_id: string;
  vehicle_type: string;
  vehicle_plate: string;
  notes?: string;
}

export interface UpdateOrderStatusPayload {
  status: "confirmed" | "done" | "cancelled";
}

// ─── Customer (internal, walk-in, bukan akun login) ──────────────────────────

export interface Customer {
  id: string;
  workshop_id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  created_at: string;
  updated_at: string;
}

export interface CreateCustomerPayload {
  name: string;
  phone?: string;
  email?: string;
  address?: string;
}

export interface UpdateCustomerPayload {
  name?: string;
  phone?: string;
  email?: string;
  address?: string;
}

// ─── Vehicle ─────────────────────────────────────────────────────────────────

export interface Vehicle {
  id: string;
  workshop_id: string;
  customer_id: string;
  customer?: Customer;
  plate_number: string;
  brand: string;
  model: string;
  year: number;
  color: string;
  engine_cc: number;
  created_at: string;
  updated_at: string;
}

export interface CreateVehiclePayload {
  customer_id: string;
  plate_number: string;
  brand: string;
  model: string;
  year?: number;
  color?: string;
  engine_cc?: number;
}

export interface UpdateVehiclePayload {
  plate_number?: string;
  brand?: string;
  model?: string;
  year?: number;
  color?: string;
  engine_cc?: number;
}

// ─── Service (pekerjaan bengkel) ─────────────────────────────────────────────

export type ServiceStatus = "pending" | "in_progress" | "done" | "cancelled";

export interface ServiceItem {
  id: string;
  service_id: string;
  name: string;
  description: string;
  qty: number;
  unit_price: number;
  total: number;
  created_at: string;
}

export interface Service {
  id: string;
  workshop_id: string;
  vehicle_id: string;
  vehicle?: Vehicle;
  mechanic_id: string | null;
  mechanic?: User | null;
  service_no: string;
  complaint: string;
  diagnosis: string;
  notes: string;
  status: ServiceStatus;
  start_date: string;
  end_date: string | null;
  service_items?: ServiceItem[];
  created_at: string;
  updated_at: string;
}

export interface CreateServicePayload {
  vehicle_id: string;
  mechanic_id?: string;
  complaint: string;
  notes?: string;
}

export interface UpdateServicePayload {
  diagnosis?: string;
  notes?: string;
  mechanic_id?: string;
  status?: ServiceStatus;
}

export interface AddServiceItemPayload {
  name: string;
  description?: string;
  qty?: number;
  unit_price: number;
}

// ─── Invoice & Payment ────────────────────────────────────────────────────────

export type InvoiceStatus = "unpaid" | "partial" | "paid";

export interface Invoice {
  id: string;
  workshop_id: string;
  service_id: string;
  service?: Service;
  invoice_no: string;
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  status: InvoiceStatus;
  due_date: string | null;
  payments?: Payment[];
  created_at: string;
  updated_at: string;
}

export interface CreateInvoicePayload {
  service_id: string;
  tax?: number;
  discount?: number;
  due_date?: string; // "2026-07-15"
}

export type PaymentMethod = "cash" | "transfer" | "qris";

export interface Payment {
  id: string;
  workshop_id: string;
  invoice_id: string;
  amount: number;
  method: PaymentMethod;
  reference_no: string;
  notes: string;
  paid_at: string;
  created_at: string;
}

export interface AddPaymentPayload {
  amount: number;
  method?: PaymentMethod;
  reference_no?: string;
  notes?: string;
}

// ─── Laporan ─────────────────────────────────────────────────────────────────

export interface LaporanData {
  month: number;
  year: number;
  total_income: number;
  transactions: Payment[];
}

// ─── API Generic ─────────────────────────────────────────────────────────────

// Envelope sukses standar semua response Go: { success, message, data }
export interface ApiEnvelope<T> {
  success: boolean;
  message: string;
  data: T;
}

// Bentuk "data" untuk endpoint list yang dipaginate
export interface PaginatedData<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

// Item error validasi per field, dari pkg/validator Go (array, bukan object map)
export interface ValidationErrorItem {
  field: string;
  message: string;
}

// Envelope gagal: { success: false, message, error }
// `error` bisa berupa string biasa, ATAU array ValidationErrorItem[] kalau
// gagalnya di tahap validasi request body.
export interface ApiError {
  success?: boolean;
  message?: string;
  error?: string | ValidationErrorItem[] | null;
}
