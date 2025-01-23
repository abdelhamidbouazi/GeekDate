import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { deleteToken } from "./app/actions";

const authRoutes = ["/register", "/login"];
const ProfileCompletion = "/complete-profile";
const response = {
  isSucceeded: true,
  data: {
    isProfileCompleted: true,
  },
};

export async function middleware(request: NextRequest) {
  console.log("entring the middleware");
  const cookie = await request.cookies.get("token");
  if (!cookie && !authRoutes.includes(request.nextUrl.pathname)) {
    return NextResponse.redirect(new URL("/login", request.nextUrl));
  }
  if (cookie) {
    try {
      // const response = await axiosInstance.get("/api/Account/validate-token", cookie.value);
      console.log("------->>>>the response is -------->>>>>    ", response);
      if (!response.isSucceeded) {
        console.log("Token verification failed");
        throw new Error("Token verification failed");
      }
      if (
        response.isSucceeded &&
        (request.nextUrl.pathname === ProfileCompletion || authRoutes.includes(request.nextUrl.pathname))
      ) {
        console.log("1111")
        if (response.data.isProfileCompleted && (request.nextUrl.pathname === ProfileCompletion || authRoutes.includes(request.nextUrl.pathname))) {
          console.log("entring the if block");
          return NextResponse.redirect(new URL("/browse", request.nextUrl));
        } else if ( request.nextUrl.pathname !== ProfileCompletion && !response.data.isProfileCompleted) {
          return NextResponse.redirect(new URL("/complete-profile", request.nextUrl));
        }
      }
    } catch (error) {
      if (cookie) await deleteToken();
      if (!authRoutes.includes(request.nextUrl.pathname)) {
        console.log("You must login first", error);
        return NextResponse.redirect(new URL("/login", request.nextUrl));
      }
    }
  }
}
export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|images|_next|icons|img|icons/logout.svg|img/logo.svg|_next/static/css/app|logo.svg|favicon.ico).*)",
  ],
};
