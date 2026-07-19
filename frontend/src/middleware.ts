// middleware.ts
import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

// Routes that require authentication (protected routes)
const protectedRoutes = ["/dashboard", "/settings", "/profile"];
// Routes that should be accessible only when logged out (auth pages)
const authRoutes = ["/auth/sign-in", "/auth/sign-up", "/auth/forgot-password"];

// Check if path matches a pattern
function matchPath(path: string, patterns: string[]): boolean {
  return patterns.some((pattern) => path.startsWith(pattern));
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only check if session cookie exists (fast, no DB call)
  const sessionCookie = getSessionCookie(request);

  // If user is on auth page (sign-in/sign-up) and has session, redirect to dashboard
  if (matchPath(pathname, authRoutes)) {
    if (sessionCookie) {
      return NextResponse.redirect(
        new URL("/dashboard", request.url)
      );
    }
    // Allow access to auth pages when no session
    return NextResponse.next();
  }

  // If user is on protected route and has no session, redirect to sign-in
  if (matchPath(pathname, protectedRoutes)) {
    if (!sessionCookie) {
      return NextResponse.redirect(
        new URL("/auth/sign-in", request.url)
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/settings/:path*",
    "/profile/:path*",
    "/auth/sign-in",
    "/auth/sign-up",
    "/auth/:path*",
  ],
};


// import { type NextRequest, NextResponse } from "next/server";

// export async function middleware(request: NextRequest) {
//   const cookieHeader = request.headers.get("cookie") || "";

//   // Call the backend get-session endpoint to verify authentication
//   try {
//     const res = await fetch(`${request.nextUrl.origin}/api/auth/get-session`, {
//       method: "GET",
//       headers: {
//         "Content-Type": "application/json",
//         Cookie: cookieHeader,
//       },
//     });

//     if (!res.ok) {
//       throw new Error("Unauthorized");
//     }

//     const session = await res.json();
//     if (!session || !session.session) {
//       return NextResponse.redirect(new URL("/auth/sign-in", request.url));
//     }

//     return NextResponse.next();
//   } catch {
//     // If verification fails, redirect to sign-in
//     return NextResponse.redirect(new URL("/auth/sign-in", request.url));
//   }
// }

// export const config = {
//   matcher: ["/dashboard/:path*"],
// };
