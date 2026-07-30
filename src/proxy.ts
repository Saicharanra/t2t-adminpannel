import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Static assets and auth routes
  const isAuthPage =
    pathname.startsWith("/login") ||
    pathname.startsWith("/verify-otp") ||
    pathname.startsWith("/forgot-password");

  const isStaticAsset =
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.includes(".") ||
    pathname.startsWith("/favicon.ico");

  if (isStaticAsset) {
    return NextResponse.next();
  }

  // Check if session token exists in cookies
  // For local development / verification, we can support a simple admin session cookie check
  const sessionToken = request.cookies.get("t2t_session");

  if (!sessionToken && !isAuthPage) {
    // Redirect to login page
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  if (sessionToken && isAuthPage) {
    // Redirect authenticated users trying to access auth pages back to dashboard
    const url = request.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
