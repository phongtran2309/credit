import { NextRequest, NextResponse } from "next/server";
import { COOKIE_NAME, verifySessionToken } from "@/lib/auth";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Bỏ qua các tài nguyên tĩnh và hệ thống Next.js
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api/auth/login") ||
    pathname.startsWith("/api/auth/unlock") ||
    pathname.startsWith("/api/auth/check") ||
    pathname === "/favicon.ico" ||
    pathname === "/robots.txt" ||
    pathname.match(/\.(png|jpg|jpeg|gif|svg|ico|webp|json|txt|woff|woff2)$/)
  ) {
    return NextResponse.next();
  }

  const token = request.cookies.get(COOKIE_NAME)?.value;
  const isAuthenticated = await verifySessionToken(token);

  // Đang vào trang /login
  if (pathname === "/login") {
    if (isAuthenticated) {
      // Đã đăng nhập rồi thì chuyển hướng về trang chủ
      return NextResponse.redirect(new URL("/", request.url));
    }
    return NextResponse.next();
  }

  // Chưa đăng nhập mà truy cập các trang hoặc API khác
  if (!isAuthenticated) {
    // Nếu là request API -> trả về 401 Unauthorized
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    // Nếu là request Page -> Redirect sang /login kèm param redirect
    const loginUrl = new URL("/login", request.url);
    if (pathname !== "/") {
      loginUrl.searchParams.set("redirect", pathname);
    }
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
