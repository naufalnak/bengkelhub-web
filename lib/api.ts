import { getToken } from "./auth";
import type { ApiError } from "./types";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

// ─── Core fetch wrapper ───────────────────────────────────────────────────────

interface RequestOptions extends Omit<RequestInit, "body"> {
  body?: unknown;
  /** Skip Authorization header (e.g. login/register) */
  public?: boolean;
}

export class ApiRequestError extends Error {
  constructor(
    public status: number,
    public payload: ApiError,
  ) {
    super(payload.error ?? payload.message ?? "Request failed");
  }
}

export async function apiFetch<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const { body, public: isPublic, ...rest } = options;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (!isPublic) {
    const token = getToken();
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE_URL}${path}`, {
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

// ─── Auth endpoints ───────────────────────────────────────────────────────────

import type {
  AuthResponse,
  LoginPayload,
  RegisterPayload,
  User,
} from "./types";

export const authApi = {
  login: (payload: LoginPayload) =>
    apiFetch<AuthResponse>("/auth/login", {
      method: "POST",
      body: payload,
      public: true,
    }),

  register: (payload: RegisterPayload) =>
    apiFetch<AuthResponse>("/auth/register", {
      method: "POST",
      body: payload,
      public: true,
    }),

  me: () => apiFetch<User>("/auth/me"),
};

// ─── Workshop endpoints ───────────────────────────────────────────────────────

import type { Workshop, WorkshopPayload } from "./types";

export const workshopApi = {
  list: () => apiFetch<Workshop[]>("/workshops"),

  getById: (id: string) => apiFetch<Workshop>(`/workshops/${id}`),

  create: (payload: WorkshopPayload) =>
    apiFetch<Workshop>("/workshops", { method: "POST", body: payload }),

  update: (id: string, payload: Partial<WorkshopPayload>) =>
    apiFetch<Workshop>(`/workshops/${id}`, { method: "PUT", body: payload }),

  delete: (id: string) =>
    apiFetch<void>(`/workshops/${id}`, { method: "DELETE" }),
};

// ─── Slot endpoints ───────────────────────────────────────────────────────────

import type { Slot, SlotPayload } from "./types";

export const slotApi = {
  listByWorkshop: (workshopId: string) =>
    apiFetch<Slot[]>(`/workshops/${workshopId}/slots`),

  create: (workshopId: string, payload: SlotPayload) =>
    apiFetch<Slot>(`/workshops/${workshopId}/slots`, {
      method: "POST",
      body: payload,
    }),

  delete: (workshopId: string, slotId: string) =>
    apiFetch<void>(`/workshops/${workshopId}/slots/${slotId}`, {
      method: "DELETE",
    }),
};

// ─── Order endpoints ──────────────────────────────────────────────────────────

import type { Order, OrderPayload, UpdateOrderStatusPayload } from "./types";

export const orderApi = {
  // Customer: create booking
  create: (payload: OrderPayload) =>
    apiFetch<Order>("/orders", { method: "POST", body: payload }),

  // Customer: my orders
  myOrders: () => apiFetch<Order[]>("/orders/me"),

  // Customer: cancel
  cancel: (orderId: string) =>
    apiFetch<Order>(`/orders/${orderId}/cancel`, { method: "PATCH" }),

  // Operator: orders for their workshop
  workshopOrders: (workshopId: string) =>
    apiFetch<Order[]>(`/workshops/${workshopId}/orders`),

  // Operator: update status
  updateStatus: (orderId: string, payload: UpdateOrderStatusPayload) =>
    apiFetch<Order>(`/orders/${orderId}/status`, {
      method: "PATCH",
      body: payload,
    }),
};
