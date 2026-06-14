import { NextRequest, NextResponse } from "next/server";
import { getTokenPayload, isTokenExpired } from "@/lib/auth";

// Routes that require auth, mapped to allowed roles
const PROTECTED: Record<string, string[]> = {
  "/operator": ["operator", "admin"],
  "/bookings": ["customer", "admin"],
};

// Auth pages — redirect away if already logged in
const AUTH_ROUTES = ["/login", "/register"];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Read token from zustand-persisted localStorage via cookie workaround:
  // Since middleware runs on edge (no localStorage), we store token in a
  // cookie on login. See store/auth.ts note below.
  const token = req.cookies.get("bengkelhub_token")?.value ?? null;

  const isAuthed = (() => {
    if (!token) return false;
    if (isTokenExpired(token)) return false;
    return true;
  })();

  const payload = isAuthed && token ? getTokenPayload(token) : null;
  const role = payload?.role ?? null;

  // Redirect logged-in users away from auth pages
  if (AUTH_ROUTES.some((r) => pathname.startsWith(r))) {
    if (isAuthed) {
      const dest = role === "operator" ? "/operator/dashboard" : "/";
      return NextResponse.redirect(new URL(dest, req.url));
    }
    return NextResponse.next();
  }

  // Check protected routes
  for (const [prefix, allowedRoles] of Object.entries(PROTECTED)) {
    if (pathname.startsWith(prefix)) {
      if (!isAuthed) {
        const loginUrl = new URL("/login", req.url);
        loginUrl.searchParams.set("redirect", pathname);
        return NextResponse.redirect(loginUrl);
      }
      if (role && !allowedRoles.includes(role)) {
        // Wrong role — send to home
        return NextResponse.redirect(new URL("/", req.url));
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all paths except:
     * - _next/static, _next/image, favicon
     * - public assets
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
