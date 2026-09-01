"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  CreditCard,
  Search,
  PieChart,
  Layers,
  Settings,
  PlusCircle,
  Sparkles,
  LogOut,
} from "lucide-react";
import { useState } from "react";
import TransactionModal from "@/components/TransactionModal";

import ThemeToggle from "@/components/ThemeToggle";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  // Nếu đang ở trang đăng nhập, không hiển thị menu điều hướng nội bộ
  const isLoginPage = pathname === "/login";

  const navItems = [
    { name: "Tra cứu MCC", href: "/", icon: Search },
    { name: "Sổ tay Chi tiêu", href: "/tracker", icon: PieChart },
    { name: "Danh mục Thẻ", href: "/cards", icon: Layers },
    { name: "Cài đặt & Sync", href: "/settings", icon: Settings },
  ];

  const handleLogout = async () => {
    if (loggingOut) return;
    setLoggingOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
      router.refresh();
    } catch (err) {
      console.error("Lỗi đăng xuất:", err);
      window.location.href = "/login";
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-white/10 glass-panel">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo & Brand */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-vib-blue via-vib-sky to-vib-gold flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform">
              <CreditCard className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 font-bold text-lg tracking-tight text-white">
                <span>MCC Cashback</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/30 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> Multi-Bank
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium hidden sm:block">
                Tra cứu MCC & Tối ưu Hoàn tiền Thẻ tín dụng
              </p>
            </div>
          </Link>

          {!isLoginPage ? (
            <>
              {/* Nav links desktop */}
              <nav className="hidden md:flex items-center gap-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                        isActive
                          ? "bg-white/10 text-amber-300 shadow-sm border border-white/10"
                          : "text-slate-300 hover:text-white hover:bg-white/5"
                      }`}
                    >
                      <Icon
                        className={`w-4 h-4 ${
                          isActive ? "text-amber-400" : "text-slate-400"
                        }`}
                      />
                      {item.name}
                    </Link>
                  );
                })}
              </nav>

              {/* Action buttons */}
              <div className="flex items-center gap-2 sm:gap-3">
                {/* Theme Selector */}
                <ThemeToggle />

                <button
                  onClick={() => setIsModalOpen(true)}
                  className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-sm font-semibold shadow-lg shadow-amber-500/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  <PlusCircle className="w-4 h-4 text-slate-950" />
                  <span className="hidden sm:inline">Ghi nhận giao dịch</span>
                  <span className="sm:hidden">Thêm</span>
                </button>

                {/* Logout / Lock Button */}
                <button
                  onClick={handleLogout}
                  title="Khóa phiên & Đăng xuất an toàn"
                  disabled={loggingOut}
                  className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-all cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <ThemeToggle />
            </div>
          )}
        </div>

        {/* Mobile Nav Bar at Bottom */}
        {!isLoginPage && (
          <div className="md:hidden flex items-center justify-around border-t border-white/5 py-2 px-2 bg-slate-950/80 backdrop-blur-md">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex flex-col items-center gap-1 py-1 px-3 rounded-lg text-xs font-medium ${
                    isActive ? "text-amber-400 font-semibold" : "text-slate-400"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.name.replace(" & Sync", "")}</span>
                </Link>
              );
            })}
          </div>
        )}
      </header>

      {/* Quick Transaction Modal */}
      {isModalOpen && !isLoginPage && (
        <TransactionModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSuccess={() => {
            setIsModalOpen(false);
            if (typeof window !== "undefined") {
              window.dispatchEvent(new Event("transaction_updated"));
            }
          }}
        />
      )}
    </>
  );
}
