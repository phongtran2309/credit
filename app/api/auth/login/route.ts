import { NextRequest, NextResponse } from "next/server";
import {
  COOKIE_NAME,
  createSessionToken,
  getAuthConfig,
  getClientIp,
  checkLockoutStatus,
  recordFailedAttempt,
  resetAttempts,
} from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request);
    const { isLocked } = checkLockoutStatus(ip);

    if (isLocked) {
      return NextResponse.json(
        {
          error: "Địa chỉ IP / Thiết bị của bạn đã bị KHÓA VĨNH VIỄN do phát hiện hành vi spam nhập sai quá 5 lần. Mọi yêu cầu đăng nhập từ IP này đều bị chặn.",
          isLocked: true,
          attemptsLeft: 0,
        },
        { status: 423 } // 423 Locked
      );
    }

    const body = await request.json().catch(() => ({}));
    const { password } = body;

    if (!password || typeof password !== "string") {
      return NextResponse.json(
        { error: "Vui lòng nhập mật khẩu truy cập." },
        { status: 400 }
      );
    }

    const { sitePassword } = getAuthConfig();

    if (!sitePassword) {
      return NextResponse.json(
        {
          error: "Chưa cấu hình SITE_PASSWORD trong biến môi trường. Vui lòng thiết lập trên Vercel hoặc .env.local.",
        },
        { status: 500 }
      );
    }

    // Kiểm tra mật khẩu
    if (password !== sitePassword) {
      const lockResult = recordFailedAttempt(ip);

      // Delay nhẹ 500ms để chống timing attack & script brute-force nhanh
      await new Promise((resolve) => setTimeout(resolve, 500));

      if (lockResult.isPermanentlyLocked) {
        return NextResponse.json(
          {
            error: "Bạn đã nhập sai quá 5 lần! Địa chỉ IP / Thiết bị này đã bị KHÓA VĨNH VIỄN để ngăn chặn spam/hack.",
            isLocked: true,
            attemptsLeft: 0,
          },
          { status: 423 }
        );
      }

      return NextResponse.json(
        {
          error: `Mật khẩu không chính xác. Thiết bị của bạn còn ${lockResult.attemptsLeft} lần thử trước khi bị KHÓA VĨNH VIỄN IP!`,
          isLocked: false,
          attemptsLeft: lockResult.attemptsLeft,
        },
        { status: 401 }
      );
    }

    // Đăng nhập thành công -> Reset bộ đếm lần sai
    resetAttempts(ip);

    const token = await createSessionToken();
    const isProduction = process.env.NODE_ENV === "production";

    const response = NextResponse.json({
      success: true,
      message: "Đăng nhập thành công!",
    });

    response.cookies.set({
      name: COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: isProduction,
      sameSite: "lax",
      path: "/",
      maxAge: 30 * 24 * 60 * 60, // 30 ngày
    });

    return response;
  } catch (error) {
    console.error("Login API Error:", error);
    return NextResponse.json(
      { error: "Đã xảy ra lỗi trong quá trình xử lý đăng nhập." },
      { status: 500 }
    );
  }
}
