import { NextRequest, NextResponse } from "next/server";
import { getClientIp, unlockSystem, checkLockoutStatus } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request);
    const body = await request.json().catch(() => ({}));
    const { recoveryKey } = body;

    if (!recoveryKey || typeof recoveryKey !== "string") {
      return NextResponse.json(
        { error: "Vui lòng nhập Master Recovery Key để mở khóa." },
        { status: 400 }
      );
    }

    const success = unlockSystem(ip, recoveryKey);

    if (!success) {
      return NextResponse.json(
        { error: "Master Recovery Key không chính xác. Yêu cầu mở khóa bị từ chối." },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Mở khóa hệ thống thành công! Bạn có thể tiếp tục đăng nhập bình thường.",
    });
  } catch (error) {
    console.error("Unlock API Error:", error);
    return NextResponse.json(
      { error: "Đã xảy ra lỗi khi mở khóa." },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const ip = getClientIp(request);
  const status = checkLockoutStatus(ip);
  return NextResponse.json(status);
}
