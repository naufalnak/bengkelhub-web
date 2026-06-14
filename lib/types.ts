// ─── Auth ────────────────────────────────────────────────────────────────────

export type Role = "customer" | "operator" | "admin";

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: Role;
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
  phone: string;
  password: string;
  role: Role;
}

// ─── Workshop ────────────────────────────────────────────────────────────────

export interface Workshop {
  id: string;
  operator_id: string;
  name: string;
  address: string;
  city: string;
  phone: string;
  description: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface WorkshopPayload {
  name: string;
  address: string;
  city: string;
  phone: string;
  description: string;
}

// ─── Slot ────────────────────────────────────────────────────────────────────

export interface Slot {
  id: string;
  workshop_id: string;
  day_of_week: number; // 0=Sun, 1=Mon, ... 6=Sat
  open_time: string;   // "08:00"
  close_time: string;  // "17:00"
  quota: number;
  is_active: boolean;
}

export interface SlotPayload {
  day_of_week: number;
  open_time: string;
  close_time: string;
  quota: number;
}

// ─── Order ───────────────────────────────────────────────────────────────────

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "in_progress"
  | "done"
  | "cancelled";

export interface Order {
  id: string;
  customer_id: string;
  workshop_id: string;
  slot_id: string;
  booking_date: string; // "2025-06-13"
  vehicle_type: string;
  complaint: string;
  status: OrderStatus;
  created_at: string;
  updated_at: string;
  workshop?: Workshop;
}

export interface OrderPayload {
  workshop_id: string;
  slot_id: string;
  booking_date: string;
  vehicle_type: string;
  complaint: string;
}

export interface UpdateOrderStatusPayload {
  status: OrderStatus;
}

// ─── API Generic ─────────────────────────────────────────────────────────────

export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface ApiError {
  error: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}
