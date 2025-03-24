import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

// List of admin routes that require admin authentication
const adminRoutes = ["/admin", "/api/admin"];

// List of protected routes that require any user authentication
const protectedRoutes = [
  "/user/account",
  "/user/orders",
  "/checkout",
  "/api/checkout",
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if the route is an admin route
  const isAdminRoute = adminRoutes.some((route) => pathname.startsWith(route));

  // Check if the route is a protected route
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route),
  );

  if (isAdminRoute || isProtectedRoute) {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });

    // If no token, redirect to login
    if (!token) {
      return NextResponse.redirect(
        new URL(isAdminRoute ? "/admin/login" : "/user/login", request.url),
      );
    }

    // For admin routes, check if user has admin role
    if (isAdminRoute && token.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  return NextResponse.next();
}

// Configure paths that should be checked by middleware
export const config = {
  matcher: [
    "/admin/:path*",
    "/api/admin/:path*",
    "/user/account/:path*",
    "/user/orders/:path*",
    "/checkout/:path*",
    "/api/checkout/:path*",
  ],
};
