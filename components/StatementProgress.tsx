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
    optimalSpentTarget,
    isOptimalSpendReached,
    spendProgressPercentage,
    cashbackPercentage,
    categoryBreakdown,
  } = summary;

  const percentageCapped = Math.min(Math.round(cashbackPercentage), 100);
  const remainingCashbackCap = Math.max(0, maxCashback - totalCashback);

  return (
    <div className="p-6 rounded-3xl glass-panel border border-white/10 space-y-5 relative overflow-hidden">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="font-extrabold text-lg text-white">{card.name}</h4>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-800 text-amber-300 font-semibold border border-white/10">
              {card.bank}
            </span>
            {card.cardholderName && (
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                Chủ thẻ: {card.cardholderName}
              </span>
            )}
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

      {/* Stats Cards: Spending, Cashback, Optimal Target */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-white/5 space-y-1">
          <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5 text-slate-400" /> Chi tiêu trong kỳ
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

        <div className="col-span-2 sm:col-span-1 p-4 rounded-2xl bg-slate-900/80 border border-emerald-500/30 space-y-1">
          <span className="text-xs text-emerald-300 font-medium flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Mốc chi tiêu tối ưu
          </span>
          <span className="text-lg sm:text-xl font-extrabold text-emerald-300 block">
            {formatCurrencyVND(optimalSpentTarget)}
          </span>
        </div>
      </div>

      {/* Progress Bars Section */}
      <div className="space-y-3 pt-1">
        {/* 1. Spending Progress vs Optimal Target (Chi tiêu / Mốc tối ưu) */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-slate-200 flex items-center gap-1">
              Tiến độ chi tiêu tối ưu ({spendProgressPercentage}%)
            </span>
            <span className={`font-bold ${isOptimalSpendReached ? "text-emerald-400" : "text-slate-400"}`}>
              {formatCurrencyVND(totalSpent)} / {formatCurrencyVND(optimalSpentTarget)}
            </span>
          </div>

          <div className="w-full h-3 rounded-full bg-slate-800 overflow-hidden p-0.5 border border-white/10 relative">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                isOptimalSpendReached
                  ? "bg-gradient-to-r from-emerald-500 to-teal-400"
                  : "bg-gradient-to-r from-blue-500 via-sky-400 to-emerald-400"
              }`}
              style={{ width: `${spendProgressPercentage}%` }}
            />
          </div>
        </div>

        {/* 2. Cashback Ceiling Progress (Tiền hoàn / Trần thẻ) */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
            <span>Tiến độ nhận hoàn tiền ({percentageCapped}%)</span>
            <span>Trần hoàn: {formatCurrencyVND(maxCashback)}/kỳ</span>
          </div>

          <div className="w-full h-2 rounded-full bg-slate-800/80 overflow-hidden p-0.5 border border-white/5 relative">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                isCapReached
                  ? "bg-gradient-to-r from-amber-500 to-rose-500"
                  : "bg-gradient-to-r from-amber-400 to-yellow-500"
              }`}
              style={{ width: `${percentageCapped}%` }}
            />
          </div>
        </div>

        {/* Card Optimal Spend Strategy Note */}
        {card.optimalSpendNote && (
          <div className="p-3 rounded-xl bg-slate-900/90 border border-white/10 text-xs text-slate-300 flex items-start gap-2">
            <Layers className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <span>{card.optimalSpendNote}</span>
          </div>
        )}

        {/* Category breakdown progress list if categories exist */}
        {Object.keys(categoryBreakdown).length > 0 && (
          <div className="space-y-2 pt-2 border-t border-white/10">
            <span className="text-xs font-bold text-slate-300 block">Tiến độ chi tiêu từng danh mục:</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {Object.entries(categoryBreakdown).map(([catName, info]) => {
                const isCatDone = info.isCapReached || info.isOptimalCategorySpendReached;
                return (
                  <div
                    key={catName}
                    className={`p-2.5 rounded-xl border text-xs flex flex-col justify-between space-y-1 ${
                      isCatDone
                        ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-200"
                        : "bg-slate-900/60 border-white/5 text-slate-300"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold">{catName}</span>
                      {isCatDone && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold">
                          ✓ Max Cap
                        </span>
                      )}
                    </div>
                    <div className="flex justify-between text-[11px] text-slate-400">
                      <span>Đã tiêu: {formatCurrencyVND(info.spent)}</span>
                      <span className="text-amber-300 font-medium">+{formatCurrencyVND(info.cashback)}</span>
                    </div>
                    {info.optimalCategorySpend && (
                      <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-emerald-400 h-full transition-all"
                          style={{ width: `${info.categorySpendProgressPercentage || 0}%` }}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Warning or Success Message */}
        {isOptimalSpendReached || isCapReached ? (
          <div className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-500/40 text-emerald-200 text-xs font-semibold space-y-1">
            <div className="flex items-center gap-2 font-bold text-emerald-300 text-sm">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              🎉 ĐÃ ĐẠT MỐC CHI TIÊU TỐI ƯU MAX CAP!
            </div>
            <p className="text-slate-300">
              Bạn đã tiêu đủ <strong className="text-emerald-300">{formatCurrencyVND(totalSpent)}</strong> (đạt/vượt mốc {formatCurrencyVND(optimalSpentTarget)}) và nhận trọn <strong className="text-amber-300">{formatCurrencyVND(totalCashback)}</strong> hoàn tiền với tỷ lệ lợi nhuận 5% cao nhất.
            </p>
            <p className="text-amber-300 font-bold pt-1 flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
              Khuyên dùng: Hãy ngưng quẹt thẻ này và chuyển sang thẻ tín dụng tiếp theo!
            </p>
          </div>
        ) : (
          <div className="text-[11px] text-slate-400 flex items-center gap-1 pt-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Còn thiếu {formatCurrencyVND(Math.max(0, optimalSpentTarget - totalSpent))} chi tiêu để đạt trần hoàn tiền tối ưu.</span>
          </div>
        )}
      </div>
    </div>
  );
}
