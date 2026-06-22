"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth";

export default function RootPage() {
  const router = useRouter();
  const { isAuthenticated, role } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated && role() === "operator") {
      router.replace("/operator/dashboard");
    } else {
      router.replace("/home");
    }
  }, [isAuthenticated, role, router]);

  return null;
}
