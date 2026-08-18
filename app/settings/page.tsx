"use client";

import { useState, useEffect } from "react";
import {
  getSupabaseCredentials,
  resetSupabaseClient,
} from "@/lib/supabase";
import {
  exportDataAsJson,
  importDataFromJson,
  resetToDefaults,
} from "@/lib/storage";
import {
  Settings,
  Database,
  Download,
  Upload,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  Server,
  Sparkles,
} from "lucide-react";

export default function SettingsPage() {
  const [supabaseUrl, setSupabaseUrl] = useState("");
  const [supabaseKey, setSupabaseKey] = useState("");
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const [copiedSql, setCopiedSql] = useState(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);

  useEffect(() => {
    const creds = getSupabaseCredentials();
    setSupabaseUrl(creds.url);
    setSupabaseKey(creds.key);
  }, []);

  const handleSaveSupabase = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem("mcc_supabase_url", supabaseUrl.trim());
    localStorage.setItem("mcc_supabase_key", supabaseKey.trim());
    resetSupabaseClient();
    setSaveStatus("Đã lưu thông tin cấu hình Supabase thành công!");
    setTimeout(() => setSaveStatus(null), 4000);
  };

  const handleExport = () => {
    const jsonStr = exportDataAsJson();
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `mcc-cashback-backup-${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const success = importDataFromJson(content);
      if (success) {
        setImportStatus("Nhập dữ liệu thành công! Vui lòng tải lại trang.");
        if (typeof window !== "undefined") {
          window.dispatchEvent(new Event("transaction_updated"));
        }
      } else {
        setImportStatus("File JSON không hợp lệ hoặc bị lỗi định dạng.");
      }
      setTimeout(() => setImportStatus(null), 5000);
    };
    reader.readAsText(file);
  };

  const handleReset = () => {
    if (confirm("Bạn có chắc chắn muốn khôi phục dữ liệu mẫu ban đầu? Toàn bộ giao dịch tùy chỉnh sẽ được đặt lại.")) {
      resetToDefaults();
      alert("Đã khôi phục dữ liệu mặc định!");
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("transaction_updated"));
        window.location.reload();
      }
    }
  };

  const copySqlCode = () => {
    const sqlContent = `-- Script khởi tạo Supabase cho MCC Cashback Tracker
-- Vui lòng chạy file supabase-schema.sql trong thư mục dự án trên SQL Editor của Supabase.`;
    navigator.clipboard.writeText(sqlContent);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="border-b border-white/10 pb-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-300 text-xs font-bold border border-amber-500/20 mb-2">
          <Settings className="w-3.5 h-3.5" /> Quản lý Hệ thống & Đồng bộ
        </div>
        <h1 className="text-2xl sm:text-4xl font-black text-white">Cài đặt & Cơ sở dữ liệu</h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Cấu hình kết nối Supabase Cloud Sync, sao lưu & khôi phục dữ liệu chi tiêu.
        </p>
      </div>

      {/* Supabase Cloud Connection Box */}
      <div className="p-6 md:p-8 rounded-3xl glass-panel border border-white/10 space-y-6">
        <div className="flex items-center gap-3 border-b border-white/10 pb-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Server className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Kết nối Supabase (PostgreSQL Cloud)</h3>
            <p className="text-xs text-slate-400">
              Đồng bộ dữ liệu đa thiết bị và lưu trữ vĩnh viễn trên Supabase miễn phí.
            </p>
          </div>
        </div>

        <form onSubmit={handleSaveSupabase} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Supabase Project URL:
            </label>
            <input
              type="url"
              value={supabaseUrl}
              onChange={(e) => setSupabaseUrl(e.target.value)}
              placeholder="https://your-project-id.supabase.co"
              className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-white/10 text-white font-mono text-sm focus:border-amber-400 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Supabase Anon / Public Key:
            </label>
            <input
              type="password"
              value={supabaseKey}
              onChange={(e) => setSupabaseKey(e.target.value)}
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
              className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-white/10 text-white font-mono text-sm focus:border-amber-400 focus:outline-none"
            />
          </div>

          {saveStatus && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-medium flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>{saveStatus}</span>
            </div>
          )}

          <div className="flex items-center justify-between pt-2">
            <span className="text-[11px] text-slate-500">
              Mẹo: Nếu để trống, ứng dụng sẽ lưu trữ dữ liệu offline trực tiếp trên LocalStorage của trình duyệt.
            </span>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-sm shadow-lg shadow-amber-500/25 transition-all"
            >
              Lưu cấu hình
            </button>
          </div>
        </form>
      </div>

      {/* SQL Migration Script helper */}
      <div className="p-6 rounded-3xl glass-panel border border-white/10 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-amber-400" />
            <h4 className="font-bold text-white text-base">File SQL Schema khởi tạo (supabase-schema.sql)</h4>
          </div>
          <span className="text-xs text-slate-400 font-mono">Đã tạo sẵn ở gốc thư mục</span>
        </div>
        <p className="text-xs text-slate-400">
          Bạn có thể mở file <code className="text-amber-300">supabase-schema.sql</code> và dán vào tab SQL Editor của Supabase để tự động tạo 4 bảng và nạp toàn bộ dữ liệu thẻ VIB.
        </p>
      </div>

      {/* Backup, Export & Import */}
      <div className="p-6 md:p-8 rounded-3xl glass-panel border border-white/10 space-y-6">
        <div className="border-b border-white/10 pb-4">
          <h3 className="text-lg font-bold text-white">Sao lưu & Khôi phục Dữ liệu (JSON)</h3>
          <p className="text-xs text-slate-400">
            Xuất file sao lưu toàn bộ giao dịch hoặc chuyển sang thiết bị khác.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <button
            onClick={handleExport}
            className="p-4 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-white/10 text-left space-y-2 transition-all hover:border-amber-500/30 group"
          >
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Download className="w-4 h-4" />
            </div>
            <h5 className="font-bold text-white text-sm">Xuất dữ liệu (Export)</h5>
            <p className="text-[11px] text-slate-400">Tải về máy file .json chứa toàn bộ lịch sử chi tiêu</p>
          </button>

          <label className="p-4 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-white/10 text-left space-y-2 transition-all hover:border-sky-500/30 cursor-pointer group">
            <div className="w-8 h-8 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Upload className="w-4 h-4" />
            </div>
            <h5 className="font-bold text-white text-sm">Nhập dữ liệu (Import)</h5>
            <p className="text-[11px] text-slate-400">Khôi phục từ file JSON đã sao lưu trước đó</p>
            <input type="file" accept=".json" onChange={handleImport} className="hidden" />
          </label>

          <button
            onClick={handleReset}
            className="p-4 rounded-2xl bg-slate-900 hover:bg-rose-950/30 border border-white/10 hover:border-rose-500/30 text-left space-y-2 transition-all group"
          >
            <div className="w-8 h-8 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <RotateCcw className="w-4 h-4" />
            </div>
            <h5 className="font-bold text-white text-sm">Khôi phục Mặc định</h5>
            <p className="text-[11px] text-slate-400">Đặt lại dữ liệu thẻ & giao dịch mẫu ban đầu</p>
          </button>
        </div>

        {importStatus && (
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-medium flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            <span>{importStatus}</span>
          </div>
        )}
      </div>
    </div>
  );
}
