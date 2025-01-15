import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import axiosInstance from "./src/lib/axios";
import { deleteToken } from "./app/actions";

export async function middleware(request: NextRequest) {
  const cookie = await request.cookies.get("token");
  if (!cookie && (request.nextUrl.pathname !== "/login" && request.nextUrl.pathname !== "/register" && request.nextUrl.pathname !== "/")) 
    return await NextResponse.redirect(new URL("/login", request.nextUrl));
  // if (cookie && request.nextUrl.pathname === '/login'){
  //   return await NextResponse.redirect(new URL('/browse', request.nextUrl))
  // }
  // if (cookie) {
  //   try {
  //     const response = await axiosInstance.get("/api/Users", {
  //       headers: {
  //         Authorization: `Bearer ${cookie.value}`,
  //       },
  //     });
  //     if (response.status === 200) {
  //       console.log("Token verification response: ", response);
  //       if (request.nextUrl.pathname === "/login" || request.nextUrl.pathname === "/register") {
  //         return NextResponse.redirect(new URL("/browse", request.nextUrl));
  //       }
  //       // if (response.data.isProfileCompleted) {
  //       //   return NextResponse.redirect(new URL("/browse", request.nextUrl));
  //       // } else if (request.nextUrl.pathname !== "/complete-profile" && !response.data.isProfileCompleted) {
  //       //   return NextResponse.redirect(new URL("/complete-profile", request.nextUrl));
  //       // }
  //     }
  //   } catch (error) {
  //     await deleteToken();
  //     if (request.nextUrl.pathname !== "/login"){
  //       console.log("Token verification error: ", error);
  //       return NextResponse.redirect(new URL("/login", request.nextUrl));
  //     }
  //   }
  // }
  return NextResponse.next();
}
export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|images|_next|icons|img|icons/logout.svg|img/logo.svg|_next/static/css/app|logo.svg|favicon.ico).*)",
  ],
};
