import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import axiosInstance from './src/lib/axios'


export async function middleware(request: NextRequest) {
  const cookie = await request.cookies.get('token')
  if (!cookie && request.nextUrl.pathname !== '/login')
    return await NextResponse.redirect(new URL('/login', request.nextUrl))
  // if (cookie) {
  //   try {
  //     const response = await axios.post("/api/Account/login", data);
  //     const res = await fetch(`${process.env.NEXT_PUBLIC_IP_BACK}/users/me`, {
  //       method: 'GET',
  //       headers: {
  //         Cookie: `token=${cookie.value}`
  //       }
  //     })
  //     const data = await res.json()
  //     if (res.status !== 200 && request.nextUrl.pathname !== '/login') {
  //       return NextResponse.redirect(new URL('/login', request.nextUrl))
  //     }
  //   } catch (error) {
  //     console.log("res--> ", error);
  //   }
  // }
  return NextResponse.next()
}
export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|images|_next|icons|img|icons/logout.svg|img/logo.svg|_next/static/css/app|logo.svg|favicon.ico).*)',
  ],

};