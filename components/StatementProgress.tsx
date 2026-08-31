"use client";

import { useState } from "react";
import { CardSpendingSummary } from "@/types";
import { formatCurrencyVND } from "@/lib/statement-helper";
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Calendar,
  TrendingUp,
  Sparkles,
  Layers,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

interface StatementProgressProps {
  summary: CardSpendingSummary;
}

export default function StatementProgress({ summary }: StatementProgressProps) {
  const [showCategories, setShowCategories] = useState(false);

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
  const hasCategories = Object.keys(categoryBreakdown).length > 0;

  return (
    <div className="p-4 sm:p-5 rounded-3xl glass-panel border border-white/10 hover:border-amber-500/30 transition-all flex flex-col justify-between space-y-3.5 relative overflow-hidden">
      {/* Header Info */}
      <div className="space-y-1.5 border-b border-white/10 pb-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 flex-wrap">
            <h4 className="font-extrabold text-base text-white line-clamp-1">{card.name}</h4>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-amber-300 font-semibold border border-white/10 shrink-0">
              {card.bank}
            </span>
          </div>

          {/* Days remaining badge */}
          <div className="shrink-0 flex items-center gap-1">
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full border flex items-center gap-1 ${
                cycleInfo.isDueApproaching
                  ? "bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse"
                  : "bg-blue-500/15 text-sky-300 border-blue-500/30"
              }`}
            >
              <Clock className="w-3 h-3" />
              Còn {cycleInfo.daysRemaining} ngày
            </span>
          </div>
        </div>

        {/* Cardholder name & cycle label */}
        <div className="flex items-center justify-between text-xs text-slate-400 flex-wrap gap-1">
          {card.cardholderName && (
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30">
              Chủ thẻ: {card.cardholderName}
            </span>
          )}
          <span className="text-[11px] text-slate-400 flex items-center gap-1">
            <Calendar className="w-3 h-3 text-amber-400" />
            {cycleInfo.cycleLabel.replace("Kỳ sao kê: ", "")}
          </span>
        </div>
      </div>

      {/* Stats Mini Grid */}
      <div className="grid grid-cols-2 gap-2">
        <div className="p-2.5 rounded-2xl bg-slate-950/60 border border-white/5 space-y-0.5">
          <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
            <TrendingUp className="w-3 h-3 text-slate-400" /> Đã chi tiêu
          </span>
          <span className="text-sm sm:text-base font-bold text-white block">
            {formatCurrencyVND(totalSpent)}
          </span>
        </div>

        <div className="p-2.5 rounded-2xl bg-slate-950/60 border border-amber-500/20 space-y-0.5">
          <span className="text-[11px] text-amber-300 font-medium flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-400" /> Tiền hoàn
          </span>
          <span className="text-sm sm:text-base font-black text-amber-400 block">
            +{formatCurrencyVND(totalCashback)}
          </span>
        </div>
      </div>

      {/* Progress Bars Section */}
      <div className="space-y-2.5">
        {/* 1. Spending Progress vs Optimal Target */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-[11px] font-semibold">
            <span className="text-slate-300">Tiến độ chi tiêu tối ưu ({spendProgressPercentage}%)</span>
            <span className={`font-bold ${isOptimalSpendReached ? "text-emerald-400" : "text-slate-400"}`}>
              {formatCurrencyVND(optimalSpentTarget)}
            </span>
          </div>

          <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden border border-white/5 relative">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                isOptimalSpendReached
                  ? "bg-gradient-to-r from-emerald-500 to-teal-400"
                  : "bg-gradient-to-r from-blue-500 to-emerald-400"
              }`}
              style={{ width: `${spendProgressPercentage}%` }}
            />
          </div>
        </div>

        {/* 2. Cashback Ceiling Progress */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span>Tiến độ nhận hoàn tiền ({percentageCapped}%)</span>
            <span>Trần: {formatCurrencyVND(maxCashback)}</span>
          </div>

          <div className="w-full h-1.5 rounded-full bg-slate-800/80 overflow-hidden border border-white/5 relative">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                isCapReached
                  ? "bg-gradient-to-r from-amber-500 to-rose-500"
                  : "bg-gradient-to-r from-amber-400 to-yellow-400"
              }`}
              style={{ width: `${percentageCapped}%` }}
            />
          </div>
        </div>
      </div>

      {/* Success / Warning badge */}
      {isOptimalSpendReached || isCapReached ? (
        <div className="p-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[11px] font-semibold flex items-center gap-1.5">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Đã đạt mốc tối ưu! Nên chuyển sang thẻ tiếp theo.</span>
        </div>
      ) : (
        <div className="text-[11px] text-slate-400 flex items-center justify-between pt-0.5">
          <span>Còn thiếu để đạt tối ưu:</span>
          <span className="text-amber-300 font-bold">
            {formatCurrencyVND(Math.max(0, optimalSpentTarget - totalSpent))}
          </span>
        </div>
      )}

      {/* Category breakdown accordion */}
      {hasCategories && (
        <div className="pt-2 border-t border-white/10">
          <button
            type="button"
            onClick={() => setShowCategories(!showCategories)}
            className="w-full flex items-center justify-between text-[11px] font-semibold text-slate-400 hover:text-amber-300 transition-colors"
          >
            <span className="flex items-center gap-1">
              <Layers className="w-3.5 h-3.5" /> Chi tiết {Object.keys(categoryBreakdown).length} danh mục
            </span>
            {showCategories ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          {showCategories && (
            <div className="space-y-1.5 pt-2 animate-in fade-in duration-150">
              {Object.entries(categoryBreakdown).map(([catName, info]) => {
                const isCatDone = info.isCapReached || info.isOptimalCategorySpendReached;
                return (
                  <div
                    key={catName}
                    className="p-2 rounded-xl bg-slate-950/80 border border-white/5 text-[11px] space-y-1"
                  >
                    <div className="flex justify-between font-medium">
                      <span className="text-slate-300">{catName}</span>
                      <span className="text-amber-300 font-bold">+{formatCurrencyVND(info.cashback)}</span>
                    </div>
                    <div className="flex justify-between text-slate-500 text-[10px]">
                      <span>Tiêu: {formatCurrencyVND(info.spent)}</span>
                      {isCatDone && <span className="text-emerald-400 font-semibold">Max trần</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
