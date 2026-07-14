"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/store/auth";

/**
 * Syncs Zustand token → document.cookie so Next.js middleware can read it.
 * Mount this once in root layout or a top-level provider.
 */
export function useTokenCookieSync() {
  const token = useAuthStore((s) => s.token);

  useEffect(() => {
    if (token) {
      document.cookie = `bengkelhub_token=${token}; path=/; SameSite=Lax`;
    } else {
      // Clear cookie on logout
      document.cookie =
        "bengkelhub_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    }
  }, [token]);
}
