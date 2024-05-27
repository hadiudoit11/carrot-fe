// import { NextResponse } from "next/server";
// import type { NextRequest } from "next/server";

// export function middleware(request: NextRequest) {
//   const pathname = request.nextUrl.pathname;

//   console.log('Request URL:', request.url);

//   if (pathname.startsWith("/home") || pathname.startsWith("/dashboard")) {
//     const token =
//       request.cookies.get("next-auth.session-token") ||
//       request.cookies.get("__Secure-next-auth.session-token");

//     console.log('Token:', token);

//     if (!token) {
//       console.log('No token found, redirecting to login');
//       return NextResponse.redirect(new URL("/user/login", request.url));
//     }
//   }

//   return NextResponse.next();
// }

// export const config = {
//   matcher: ["/home/:path*", "/dashboard/:path*"],
// };
