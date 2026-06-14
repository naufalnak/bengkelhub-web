"use client";

import { useTokenCookieSync } from "@/lib/useTokenCookieSync";

/**
 * Client component tipis — hanya tugasnya sync token ke cookie.
 * Dipasang di root layout agar aktif di semua halaman.
 */
export function TokenSyncProvider() {
  useTokenCookieSync();
  return null;
}
