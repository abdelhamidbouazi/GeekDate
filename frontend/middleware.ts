import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const AUTH_COOKIE = "auth";

const PUBLIC_ROUTES = [
  "/home",
  "/",
  "/login",
  "/signup",
  "/forgot-password",
  "/account/confirm-email",
  "/account/reset-password",
];

function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.includes(pathname);
}

function isAuthRoute(pathname: string): boolean {
  return ["/login", "/signup", "/forgot-password", "/home"].includes(pathname);
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasAuth = request.cookies.has(AUTH_COOKIE);

  if (hasAuth && isAuthRoute(pathname)) {
    return NextResponse.redirect(new URL("/verify", request.url));
  }

  if (!hasAuth && !isPublicRoute(pathname)) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|images|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
