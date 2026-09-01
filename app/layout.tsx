import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import SupabaseSyncProvider from "@/components/SupabaseSyncProvider";
import { ThemeProvider } from "@/components/ThemeProvider";

export const metadata: Metadata = {
  title: "MCC Cashback & Credit Card Spending Tracker",
  description:
    "Hệ thống tra cứu mã danh mục MCC thông minh và quản lý chu kỳ sao kê thẻ tín dụng, tối ưu hoàn tiền cao nhất.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const theme = localStorage.getItem('mcc_app_theme') || 'dark';
                document.documentElement.setAttribute('data-theme', theme);
                if (theme === 'light') {
                  document.documentElement.classList.remove('dark');
                  document.documentElement.classList.add('light');
                } else {
                  document.documentElement.classList.remove('light');
                  document.documentElement.classList.add('dark');
                }
              } catch (e) {}
            `,
          }}
        />
      </head>
      <body className="antialiased min-h-screen flex flex-col selection:bg-amber-500 selection:text-slate-950">
        <ThemeProvider>
          <SupabaseSyncProvider />
          <Navbar />
          <main className="flex-1 max-w-[1600px] w-full mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-6 md:py-8">
            {children}
          </main>
          <footer className="border-t border-white/10 glass-panel py-6 mt-12 text-center text-xs text-slate-400">
            <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div>
                <p className="font-semibold text-slate-300">
                  💳 MCC Cashback & Spending Tracker • Pro Edition
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Tối ưu hoàn tiền • Không lo chạm trần • Quản lý chu kỳ sao kê
                </p>
              </div>
            </div>
          </footer>
        </ThemeProvider>
      </body>
    </html>
  );
}
