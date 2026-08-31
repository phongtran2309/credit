"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ShieldAlert,
  ShieldCheck,
  Lock,
  KeyRound,
  Eye,
  EyeOff,
  AlertTriangle,
  Sparkles,
  Unlock,
  CreditCard,
  CheckCircle2,
} from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect") || "/";

  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLocked, setIsLocked] = useState(false);
  const [attemptsLeft, setAttemptsLeft] = useState<number | null>(null);
  const [isShaking, setIsShaking] = useState(false);

  // Recovery Key State
  const [showRecoveryModal, setShowRecoveryModal] = useState(false);
  const [recoveryKey, setRecoveryKey] = useState("");
  const [recoveryLoading, setRecoveryLoading] = useState(false);
  const [recoveryError, setRecoveryError] = useState("");
  const [recoverySuccess, setRecoverySuccess] = useState("");

  // Kiểm tra trạng thái khóa khi load trang
  useEffect(() => {
    async function checkStatus() {
      // Kiểm tra cờ cấm trên thiết bị này trước
      if (typeof window !== "undefined" && localStorage.getItem("device_permanently_banned") === "true") {
        setIsLocked(true);
        setAttemptsLeft(0);
      }

      try {
        const res = await fetch("/api/auth/unlock");
        if (res.ok) {
          const data = await res.json();
          if (data.isLocked) {
            setIsLocked(true);
            setAttemptsLeft(0);
            if (typeof window !== "undefined") {
              localStorage.setItem("device_permanently_banned", "true");
            }
          } else {
            setAttemptsLeft(data.attemptsLeft);
          }
        }
      } catch (err) {
        console.error("Lỗi kiểm tra trạng thái khóa:", err);
      }
    }
    checkStatus();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim() || loading || isLocked) return;

    setLoading(true);
    setErrorMessage("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        // Đăng nhập thành công
        if (typeof window !== "undefined") {
          localStorage.removeItem("device_permanently_banned");
        }
        router.push(redirectUrl);
        router.refresh();
      } else {
        // Đăng nhập thất bại
        setIsShaking(true);
        setTimeout(() => setIsShaking(false), 500);

        if (data.isLocked || res.status === 423) {
          setIsLocked(true);
          setAttemptsLeft(0);
          if (typeof window !== "undefined") {
            localStorage.setItem("device_permanently_banned", "true");
          }
          setErrorMessage(
            data.error || "Địa chỉ IP / Thiết bị này đã bị KHÓA VĨNH VIỄN do nhập sai quá 5 lần!"
          );
        } else {
          setAttemptsLeft(data.attemptsLeft);
          setErrorMessage(data.error || "Mật khẩu không chính xác.");
        }
      }
    } catch (err) {
      setErrorMessage("Không thể kết nối đến máy chủ. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recoveryKey.trim() || recoveryLoading) return;

    setRecoveryLoading(true);
    setRecoveryError("");
    setRecoverySuccess("");

    try {
      const res = await fetch("/api/auth/unlock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recoveryKey }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        if (typeof window !== "undefined") {
          localStorage.removeItem("device_permanently_banned");
        }
        setRecoverySuccess("Mở khóa thành công! Bạn có thể đăng nhập lại ngay.");
        setIsLocked(false);
        setAttemptsLeft(5);
        setErrorMessage("");
        setTimeout(() => {
          setShowRecoveryModal(false);
          setRecoveryKey("");
          setRecoverySuccess("");
        }, 1500);
      } else {
        setRecoveryError(data.error || "Master Recovery Key không hợp lệ.");
      }
    } catch (err) {
      setRecoveryError("Lỗi hệ thống khi mở khóa. Vui lòng thử lại.");
    } finally {
      setRecoveryLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div
        className={`w-full max-w-md transition-transform duration-200 ${
          isShaking ? "animate-shake" : ""
        }`}
      >
        {/* Card Form */}
        <div className="relative rounded-3xl bg-slate-900/90 border border-white/10 backdrop-blur-2xl shadow-2xl p-8 sm:p-10 overflow-hidden">
          {/* Background Glow Accents */}
          <div className="absolute -top-24 -left-24 w-48 h-48 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />

          {/* Header */}
          <div className="text-center mb-8 relative z-10">
            <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 via-amber-400 to-amber-600 p-0.5 shadow-xl shadow-amber-500/20 mb-4 flex items-center justify-center">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                {isLocked ? (
                  <ShieldAlert className="w-8 h-8 text-rose-500 animate-pulse" />
                ) : (
                  <Lock className="w-8 h-8 text-amber-400" />
                )}
              </div>
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Bảo mật Riêng tư • Chủ sở hữu</span>
            </div>

            <h1 className="text-2xl font-bold text-white tracking-tight">
              {isLocked ? "Thiết Bị / IP Này Đã Bị Khóa" : "Xác Thực Quyền Truy Cập"}
            </h1>
            <p className="text-sm text-slate-400 mt-2">
              {isLocked
                ? "Đã phát hiện hành vi spam nhập sai quá 5 lần từ địa chỉ IP / thiết bị này. Truy cập từ thiết bị này đã bị chặn vĩnh viễn."
                : "Vui lòng nhập Master Passcode / PIN của bạn để mở khóa toàn bộ hệ thống."}
            </p>
          </div>

          {/* Locked Alert Box */}
          {isLocked && (
            <div className="mb-6 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-rose-200">
                    ĐÃ CẤM TRUY CẬP (IP / Device Banned)
                  </p>
                  <p className="text-xs text-rose-300/80 mt-1 leading-relaxed">
                    Địa chỉ IP / thiết bị này đã bị chặn hoàn toàn. Các thiết bị hợp lệ khác của bạn vẫn có thể truy cập bình thường. Nếu bạn chính là chủ sở hữu thiết bị này, bạn có thể mở khóa bằng Master Recovery Key.
                  </p>
                  <button
                    type="button"
                    onClick={() => setShowRecoveryModal(true)}
                    className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-500 hover:bg-rose-600 text-white text-xs font-semibold transition-all shadow-md shadow-rose-500/30"
                  >
                    <Unlock className="w-3.5 h-3.5" />
                    Mở khóa khẩn cấp thiết bị này
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Normal Error Message */}
          {!isLocked && errorMessage && (
            <div className="mb-6 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">{errorMessage}</p>
                {attemptsLeft !== null && attemptsLeft > 0 && attemptsLeft < 5 && (
                  <p className="text-xs text-amber-300 font-semibold mt-1">
                    ⚠️ Chú ý: Còn lại {attemptsLeft}/5 lần thử. Nhập sai 5 lần sẽ
                    bị KHÓA VĨNH VIỄN!
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Form */}
          {!isLocked && (
            <form onSubmit={handleLogin} className="space-y-5 relative z-10">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-2">
                  Master Passcode / Mật khẩu truy cập
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <KeyRound className="w-5 h-5" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Nhập mật khẩu của bạn..."
                    autoFocus
                    required
                    disabled={loading}
                    className="w-full pl-11 pr-11 py-3 bg-slate-950/60 border border-white/10 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-200 transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Security Hint */}
              <div className="flex items-center justify-between text-[11px] text-slate-400 px-1">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  Bảo vệ HMAC SHA-256
                </span>
                <span className="text-amber-400/90 font-medium">
                  {attemptsLeft !== null ? `Còn lại: ${attemptsLeft}/5 lần` : "Tối đa 5 lần thử"}
                </span>
              </div>

              <button
                type="submit"
                disabled={loading || !password.trim()}
                className="w-full py-3.5 px-4 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 hover:from-amber-400 hover:to-amber-500 active:scale-[0.99] text-slate-950 font-bold rounded-xl shadow-lg shadow-amber-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                    <span>Đang xác thực an toàn...</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4 text-slate-950" />
                    <span>Mở Khóa Truy Cập</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* Footer note */}
          <div className="mt-8 pt-6 border-t border-white/5 text-center text-xs text-slate-500">
            <p>MCC Cashback & Spending Tracker • Private Edition</p>
          </div>
        </div>
      </div>

      {/* Modal Mở Khóa Khẩn Cấp (Master Recovery) */}
      {showRecoveryModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-white/10 rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <Unlock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base">
                  Mở Khóa Hệ Thống Khẩn Cấp
                </h3>
                <p className="text-xs text-slate-400">
                  Dành riêng cho Quản trị viên / Chủ sở hữu web
                </p>
              </div>
            </div>

            {recoveryError && (
              <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
                {recoveryError}
              </div>
            )}

            {recoverySuccess && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                {recoverySuccess}
              </div>
            )}

            <form onSubmit={handleUnlock} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Master Recovery Key hoặc Mật khẩu gốc (SITE_PASSWORD)
                </label>
                <input
                  type="password"
                  value={recoveryKey}
                  onChange={(e) => setRecoveryKey(e.target.value)}
                  placeholder="Nhập khóa khôi phục bí mật..."
                  autoFocus
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                />
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowRecoveryModal(false);
                    setRecoveryError("");
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:bg-white/5 border border-white/10"
                >
                  Đóng
                </button>
                <button
                  type="submit"
                  disabled={recoveryLoading || !recoveryKey.trim()}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold shadow-md shadow-amber-500/20 disabled:opacity-50"
                >
                  {recoveryLoading ? "Đang xác thực..." : "Xác nhận Mở Khóa"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[85vh] flex items-center justify-center text-slate-400 text-sm">
          Đang tải trang đăng nhập bảo mật...
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
