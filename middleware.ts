import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import axiosInstance from "./src/lib/axios";
import { deleteToken } from "./app/actions";

const authRoutes = ["/login", "/register", "/complete-profile"];

export async function middleware(request: NextRequest) {
  const cookie = await request.cookies.get("token");
  if (!cookie && !authRoutes.includes(request.nextUrl.pathname)) {
    return NextResponse.redirect(new URL("/login", request.nextUrl));
  } else if (cookie) {
    try {
      const response = await axiosInstance.post("/api/Account/validate-token", cookie.value);
      // const response = await axiosInstance.post("/api/Account/validate-token", {
      //   token: cookie.value,
      //   headers: {
      //     Authorization: `Bearer ${cookie.value}`,
      //   },
      // });
      console.log("------->>>>the response is -------->>>>>    ", response);
      if (authRoutes.includes(request.nextUrl.pathname)) {
        return NextResponse.redirect(new URL("/browse", request.nextUrl));
      }
      // if (response.isSucceeded && !authRoutes.includes(request.nextUrl.pathname)) {
      //   // console.log("Token verification response: ", response);
      //   if (response.data.isProfileCompleted) {
      //     return NextResponse.redirect(new URL("/browse", request.nextUrl));
      //   } else if (request.nextUrl.pathname !== "/complete-profile" && !response.data.isProfileCompleted) {
      //     return NextResponse.redirect(new URL("/complete-profile", request.nextUrl));
      //   }
      // } else {
      //   console.log("Token verification error: ", response);
      // }
    } catch (error) {
      await deleteToken();
      if (request.nextUrl.pathname !== "/login") {
        console.log("Token verification error: ", error);
        return NextResponse.redirect(new URL("/login", request.nextUrl));
      }
    }
  }
  return NextResponse.next();
}
export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|images|_next|icons|img|icons/logout.svg|img/logo.svg|_next/static/css/app|logo.svg|favicon.ico).*)",
  ],
};
