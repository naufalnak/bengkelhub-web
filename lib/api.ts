import { getToken } from "./auth";
import type {
  ApiEnvelope,
  ApiError,
  PaginatedData,
  ValidationErrorItem,
  AuthResponse,
  LoginPayload,
  RegisterPayload,
  User,
  Workshop,
  CreateWorkshopPayload,
  UpdateWorkshopPayload,
  Slot,
  SlotWithAvailability,
  CreateSlotPayload,
  UpdateSlotPayload,
  BulkCreateSlotPayload,
  BulkCreateSlotResult,
  Order,
  CreateOrderPayload,
  UpdateOrderStatusPayload,
  Customer,
  CreateCustomerPayload,
  UpdateCustomerPayload,
  Vehicle,
  CreateVehiclePayload,
  UpdateVehiclePayload,
  Service,
  ServiceItem,
  CreateServicePayload,
  UpdateServicePayload,
  AddServiceItemPayload,
  Invoice,
  CreateInvoicePayload,
  Payment,
  AddPaymentPayload,
  LaporanData,
} from "./types";

// Semua route Go di-mount di group /api/v1, jadi base url WAJIB include itu.
// Set NEXT_PUBLIC_API_URL=http://localhost:8080/api/v1 di .env.local
const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080/api/v1";

// ─── Core fetch wrapper ───────────────────────────────────────────────────────

interface RequestOptions extends Omit<RequestInit, "body"> {
  body?: unknown;
  /** Skip Authorization header (e.g. login/register) */
  public?: boolean;
  /** Query string params, otomatis di-encode & dibuang kalau undefined/"" */
  query?: Record<string, string | number | boolean | undefined>;
}

export class ApiRequestError extends Error {
  constructor(
    public status: number,
    public payload: ApiError,
  ) {
    super(ApiRequestError.extractMessage(payload));
  }

  // Backend pkg/validator Go balikin error validasi sebagai ARRAY:
  // { "error": [{ "field": "Email", "message": "Invalid email format" }] }
  // Selain itu, error non-validasi balik sebagai string biasa:
  // { "error": null, "message": "workshop not found" }
  // Di-flatten di sini biar nggak ada komponen yang nyoba render object/array mentah di JSX.
  private static extractMessage(payload: ApiError): string {
    const raw = payload?.error;

    if (typeof raw === "string" && raw.length > 0) return raw;

    if (Array.isArray(raw) && raw.length > 0) {
      const messages = (raw as ValidationErrorItem[])
        .map((item) =>
          item?.field ? `${item.field}: ${item.message}` : item?.message,
        )
        .filter((v): v is string => typeof v === "string" && v.length > 0);
      if (messages.length > 0) return messages.join(", ");
    }

    if (typeof payload?.message === "string" && payload.message.length > 0) {
      return payload.message;
    }

    return "Request failed";
  }
}

function buildQueryString(
  query?: Record<string, string | number | boolean | undefined>,
): string {
  if (!query) return "";
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== "") params.set(key, String(value));
  }
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

export async function apiFetch<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const { body, public: isPublic, query, ...rest } = options;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    // Kalau NEXT_PUBLIC_API_URL nunjuk ke tunnel ngrok (*.ngrok-free.dev),
    // header ini wajib ada, soalnya ngrok free tier nampilin halaman
    // interstitial warning (tanpa CORS header) buat request tanpa header ini,
    // dan itu yang kebaca browser sebagai "CORS error" padahal backend aman.
    "ngrok-skip-browser-warning": "true",
  };

  if (!isPublic) {
    const token = getToken();
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE_URL}${path}${buildQueryString(query)}`, {
    ...rest,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    let errorPayload: ApiError = { error: "Unknown error" };
    try {
      errorPayload = await res.json();
    } catch {
      // non-JSON error body
    }
    throw new ApiRequestError(res.status, errorPayload);
  }

  // 204 No Content
  if (res.status === 204) return undefined as T;

  return res.json() as Promise<T>;
}

// Shortcut: panggil endpoint yang envelope-nya { success, message, data },
// langsung balikin isi `data`-nya aja.
function unwrap<T>(path: string, options?: RequestOptions): Promise<T> {
  return apiFetch<ApiEnvelope<T>>(path, options).then((res) => res.data);
}

// ─── Auth ────────────────────────────────────────────────────────────────────

export const authApi = {
  login: (payload: LoginPayload) =>
    unwrap<AuthResponse>("/auth/login", {
      method: "POST",
      body: payload,
      public: true,
    }),

  register: (payload: RegisterPayload) =>
    unwrap<AuthResponse>("/auth/register", {
      method: "POST",
      body: payload,
      public: true,
    }),

  me: () => unwrap<User>("/auth/me"),

  // Kirim ulang email verifikasi — butuh Bearer token
  resendVerification: () =>
    unwrap<void>("/auth/resend-verification", { method: "POST" }),
};

// ─── Workshop ────────────────────────────────────────────────────────────────

export const workshopApi = {
  // Publik, gak perlu token
  list: (page = 1, limit = 10) =>
    unwrap<PaginatedData<Workshop>>("/workshops", {
      public: true,
      query: { page, limit },
    }),

  getById: (id: string) =>
    unwrap<Workshop>(`/workshops/${id}`, { public: true }),

  // Operator: workshop milik sendiri
  myWorkshops: (page = 1, limit = 10) =>
    unwrap<PaginatedData<Workshop>>("/workshops/my", {
      query: { page, limit },
    }),

  create: (payload: CreateWorkshopPayload) =>
    unwrap<Workshop>("/workshops", { method: "POST", body: payload }),

  update: (id: string, payload: UpdateWorkshopPayload) =>
    unwrap<Workshop>(`/workshops/${id}`, { method: "PATCH", body: payload }),

  delete: (id: string) =>
    apiFetch<void>(`/workshops/${id}`, { method: "DELETE" }),
};

// ─── Slot ────────────────────────────────────────────────────────────────────

export const slotApi = {
  listByWorkshop: (workshopId: string, onlyAvailable = false) =>
    unwrap<SlotWithAvailability[]>(`/workshops/${workshopId}/slots`, {
      public: true,
      query: { available: onlyAvailable || undefined },
    }),

  getById: (id: string) =>
    unwrap<SlotWithAvailability>(`/slots/${id}`, { public: true }),

  create: (workshopId: string, payload: CreateSlotPayload) =>
    unwrap<Slot>(`/workshops/${workshopId}/slots`, {
      method: "POST",
      body: payload,
    }),

  // Generate banyak slot sekaligus, biar operator gak perlu klik manual berkali-kali
  bulkCreate: (workshopId: string, payload: BulkCreateSlotPayload) =>
    unwrap<BulkCreateSlotResult>(`/workshops/${workshopId}/slots/bulk`, {
      method: "POST",
      body: payload,
    }),

  update: (id: string, payload: UpdateSlotPayload) =>
    unwrap<Slot>(`/slots/${id}`, { method: "PATCH", body: payload }),

  // Catatan: route standalone, BUKAN nested di bawah /workshops/:workshopId/slots/:id
  delete: (id: string) => apiFetch<void>(`/slots/${id}`, { method: "DELETE" }),
};

// ─── Order (booking publik) ──────────────────────────────────────────────────

export const orderApi = {
  // Customer: create booking
  create: (payload: CreateOrderPayload) =>
    unwrap<Order>("/orders", { method: "POST", body: payload }),

  // Customer: my orders — route backend-nya "/orders/my", BUKAN "/orders/me"
  myOrders: (page = 1, limit = 10) =>
    unwrap<PaginatedData<Order>>("/orders/my", { query: { page, limit } }),

  getById: (id: string) => unwrap<Order>(`/orders/${id}`),

  // Customer: cancel
  cancel: (orderId: string) =>
    unwrap<Order>(`/orders/${orderId}/cancel`, { method: "PATCH" }),

  // Operator: orders untuk workshop miliknya
  workshopOrders: (workshopId: string, page = 1, limit = 10) =>
    unwrap<PaginatedData<Order>>(`/workshops/${workshopId}/orders`, {
      query: { page, limit },
    }),

  // Operator: update status
  updateStatus: (orderId: string, payload: UpdateOrderStatusPayload) =>
    unwrap<Order>(`/orders/${orderId}/status`, {
      method: "PATCH",
      body: payload,
    }),
};

// ─── Customer (internal, walk-in) ─────────────────────────────────────────────

export const customerApi = {
  list: (workshopId: string, search = "", page = 1, limit = 10) =>
    unwrap<PaginatedData<Customer>>(`/workshops/${workshopId}/customers`, {
      query: { search, page, limit },
    }),

  getById: (id: string) => unwrap<Customer>(`/customers/${id}`),

  create: (workshopId: string, payload: CreateCustomerPayload) =>
    unwrap<Customer>(`/workshops/${workshopId}/customers`, {
      method: "POST",
      body: payload,
    }),

  update: (id: string, payload: UpdateCustomerPayload) =>
    unwrap<Customer>(`/customers/${id}`, { method: "PATCH", body: payload }),

  delete: (id: string) =>
    apiFetch<void>(`/customers/${id}`, { method: "DELETE" }),
};

// ─── Vehicle ─────────────────────────────────────────────────────────────────

export const vehicleApi = {
  list: (workshopId: string, search = "", page = 1, limit = 10) =>
    unwrap<PaginatedData<Vehicle>>(`/workshops/${workshopId}/vehicles`, {
      query: { search, page, limit },
    }),

  getById: (id: string) => unwrap<Vehicle>(`/vehicles/${id}`),

  create: (workshopId: string, payload: CreateVehiclePayload) =>
    unwrap<Vehicle>(`/workshops/${workshopId}/vehicles`, {
      method: "POST",
      body: payload,
    }),

  update: (id: string, payload: UpdateVehiclePayload) =>
    unwrap<Vehicle>(`/vehicles/${id}`, { method: "PATCH", body: payload }),

  delete: (id: string) =>
    apiFetch<void>(`/vehicles/${id}`, { method: "DELETE" }),
};

// ─── Service (pekerjaan bengkel) ──────────────────────────────────────────────

export const serviceApi = {
  list: (workshopId: string, status = "", page = 1, limit = 10) =>
    unwrap<PaginatedData<Service>>(`/workshops/${workshopId}/services`, {
      query: { status, page, limit },
    }),

  getById: (id: string) => unwrap<Service>(`/services/${id}`),

  create: (workshopId: string, payload: CreateServicePayload) =>
    unwrap<Service>(`/workshops/${workshopId}/services`, {
      method: "POST",
      body: payload,
    }),

  update: (id: string, payload: UpdateServicePayload) =>
    unwrap<Service>(`/services/${id}`, { method: "PATCH", body: payload }),

  delete: (id: string) =>
    apiFetch<void>(`/services/${id}`, { method: "DELETE" }),

  addItem: (serviceId: string, payload: AddServiceItemPayload) =>
    unwrap<ServiceItem>(`/services/${serviceId}/items`, {
      method: "POST",
      body: payload,
    }),

  deleteItem: (serviceId: string, itemId: string) =>
    apiFetch<void>(`/services/${serviceId}/items/${itemId}`, {
      method: "DELETE",
    }),
};

// ─── Invoice & Payment ────────────────────────────────────────────────────────

export const invoiceApi = {
  list: (workshopId: string, status = "", page = 1, limit = 10) =>
    unwrap<PaginatedData<Invoice>>(`/workshops/${workshopId}/invoices`, {
      query: { status, page, limit },
    }),

  getById: (id: string) => unwrap<Invoice>(`/invoices/${id}`),

  create: (workshopId: string, payload: CreateInvoicePayload) =>
    unwrap<Invoice>(`/workshops/${workshopId}/invoices`, {
      method: "POST",
      body: payload,
    }),

  addPayment: (invoiceId: string, payload: AddPaymentPayload) =>
    unwrap<Payment>(`/invoices/${invoiceId}/payments`, {
      method: "POST",
      body: payload,
    }),

  deletePayment: (invoiceId: string, paymentId: string) =>
    apiFetch<void>(`/invoices/${invoiceId}/payments/${paymentId}`, {
      method: "DELETE",
    }),
};

// ─── Laporan ─────────────────────────────────────────────────────────────────

export const laporanApi = {
  getMonthly: (workshopId: string, month: number, year: number) =>
    unwrap<LaporanData>(`/workshops/${workshopId}/laporan`, {
      query: { month, year },
    }),
};
