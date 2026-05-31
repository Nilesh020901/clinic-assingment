import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const userRoutes = ["/user"];
const adminRoutes = ["/admin"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("healthcare_token")?.value;
  const role = request.cookies.get("healthcare_role")?.value;

  const isUserRoute = userRoutes.some((r) => pathname.startsWith(r));
  const isAdminRoute =
    adminRoutes.some((r) => pathname.startsWith(r)) &&
    !pathname.startsWith("/admin/login");

  if (isUserRoute && !token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (isUserRoute && role === "admin") {
    return NextResponse.redirect(new URL("/admin/dashboard", request.url));
  }

  if (isAdminRoute && !token) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  if (isAdminRoute && role === "user") {
    return NextResponse.redirect(new URL("/user/dashboard", request.url));
  }

  if ((pathname === "/" || pathname === "/login" || pathname === "/admin/login") && token) {
    const redirect =
      role === "admin" ? "/admin/dashboard" : "/user/dashboard";
    return NextResponse.redirect(new URL(redirect, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/user/:path*", "/admin/:path*", "/login", "/admin/login"],
};
