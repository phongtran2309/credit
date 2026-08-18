"use client";

import { CardSpendingSummary } from "@/types";
import { formatCurrencyVND } from "@/lib/statement-helper";
import { AlertTriangle, CheckCircle2, Clock, Calendar, TrendingUp, Sparkles, Layers } from "lucide-react";

interface StatementProgressProps {
  summary: CardSpendingSummary;
}

export default function StatementProgress({ summary }: StatementProgressProps) {
  const {
    card,
    cycleInfo,
    totalSpent,
    totalCashback,
    maxCashback,
    isCapReached,
    cashbackPercentage,
    categoryBreakdown,
  } = summary;

  const percentageCapped = Math.min(Math.round(cashbackPercentage), 100);
  const remainingCashbackCap = Math.max(0, maxCashback - totalCashback);

  return (
    <div className="p-6 rounded-3xl glass-panel border border-white/10 space-y-5">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h4 className="font-extrabold text-lg text-white">{card.name}</h4>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-800 text-amber-300 font-semibold border border-white/10">
              {card.bank}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-amber-400" />
            {cycleInfo.cycleLabel}
          </p>
        </div>

        {/* Days remaining badge */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs font-semibold">
            <Clock className="w-3.5 h-3.5" />
            Còn {cycleInfo.daysRemaining} ngày đến chốt kỳ
          </div>
          {cycleInfo.isDueApproaching && (
            <div className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs font-bold animate-pulse">
              <AlertTriangle className="w-3.5 h-3.5" />
              Sắp đến hạn TT
            </div>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-white/5 space-y-1">
          <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5 text-slate-400" /> Tổng chi trong kỳ
          </span>
          <span className="text-lg sm:text-xl font-bold text-white block">
            {formatCurrencyVND(totalSpent)}
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-amber-500/30 space-y-1">
          <span className="text-xs text-amber-300 font-medium flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Đã hoàn được
          </span>
          <span className="text-lg sm:text-xl font-black text-amber-400 block">
            {formatCurrencyVND(totalCashback)}
          </span>
        </div>

        <div className="col-span-2 sm:col-span-1 p-4 rounded-2xl bg-slate-900/80 border border-white/5 space-y-1">
          <span className="text-xs text-slate-400 font-medium">Hạn mức hoàn còn lại</span>
          <span className={`text-lg sm:text-xl font-bold block ${isCapReached ? "text-rose-400" : "text-emerald-400"}`}>
            {isCapReached ? "Đã chạm trần" : formatCurrencyVND(remainingCashbackCap)}
          </span>
        </div>
      </div>

      {/* Progress Bar for Cashback Ceiling */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-semibold">
          <span className="text-slate-300 flex items-center gap-1">
            Tiến độ hoàn tổng ({percentageCapped}%)
          </span>
          <span className="text-slate-400">
            Trần thẻ: {formatCurrencyVND(maxCashback)}/kỳ
          </span>
        </div>

        <div className="w-full h-3 rounded-full bg-slate-800 overflow-hidden p-0.5 border border-white/10 relative">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              isCapReached
                ? "bg-gradient-to-r from-amber-500 to-rose-500"
                : "bg-gradient-to-r from-vib-sky via-amber-400 to-amber-500"
            }`}
            style={{ width: `${percentageCapped}%` }}
          />
        </div>

        {/* Note if card has 500k per category cap */}
        {card.maxCashbackPerCategory && (
          <div className="text-[11px] text-sky-300 flex items-center gap-1.5 pt-1">
            <Layers className="w-3.5 h-3.5 text-sky-400 shrink-0" />
            <span>
              Giới hạn tối đa / 1 Danh mục chi tiêu:{" "}
              <strong className="text-amber-300 font-bold">
                {formatCurrencyVND(card.maxCashbackPerCategory)} / kỳ
              </strong>
            </span>
          </div>
        )}

        {/* Warning or Success Message */}
        {isCapReached ? (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs font-medium flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>
              Thẻ đã đạt hạn mức hoàn tối đa trong kỳ này ({formatCurrencyVND(maxCashback)}). Các chi tiêu tiếp theo nên chuyển sang thẻ khác để tối ưu!
            </span>
          </div>
        ) : percentageCapped >= 80 ? (
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-medium flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400" />
            <span>
              Cảnh báo: Bạn đã hoàn được {percentageCapped}% hạn mức. Chỉ còn lại{" "}
              {formatCurrencyVND(remainingCashbackCap)} tiền hoàn khả dụng trong kỳ.
            </span>
          </div>
        ) : (
          <div className="text-[11px] text-slate-400 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Hạn mức hoàn còn khả dụng, hãy tiếp tục tận dụng ưu đãi thẻ.</span>
          </div>
        )}
      </div>
    </div>
  );
}
