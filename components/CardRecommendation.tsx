"use client";

import { CardRecommendationResult } from "@/types";
import { formatCurrencyVND } from "@/lib/statement-helper";
import { Trophy, ArrowRight, Zap, Info, PlusCircle, Layers } from "lucide-react";
import CreditCardVisual from "./CreditCardVisual";
import { useState } from "react";
import TransactionModal from "@/components/TransactionModal";

interface CardRecommendationProps {
  results: CardRecommendationResult[];
  spendAmount: number;
  selectedMccCode?: string;
  selectedMccName?: string;
}

export default function CardRecommendation({
  results,
  spendAmount,
  selectedMccCode,
  selectedMccName,
}: CardRecommendationProps) {
  const [activeTxCard, setActiveTxCard] = useState<CardRecommendationResult | null>(null);

  if (results.length === 0) {
    return (
      <div className="text-center py-12 glass-panel rounded-2xl p-6">
        <p className="text-slate-400 font-medium">Không tìm thấy thẻ phù hợp với điều kiện tìm kiếm.</p>
      </div>
    );
  }

  const topCard = results[0];

  return (
    <div className="space-y-6">
      {/* Best Recommendation Banner */}
      <div className="relative overflow-hidden rounded-3xl p-6 md:p-8 bg-gradient-to-br from-amber-500/20 via-slate-900 to-blue-950/80 border-2 border-amber-500/50 shadow-2xl backdrop-blur-2xl">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <Trophy className="w-64 h-64 text-amber-300" />
        </div>

        <div className="flex flex-col lg:flex-row items-center gap-8 z-10 relative">
          {/* Card Mockup */}
          <div className="w-full lg:w-72 shrink-0">
            <CreditCardVisual card={topCard.card} />
          </div>

          {/* Details & Cashback Callout */}
          <div className="flex-1 space-y-4 text-center lg:text-left">
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold uppercase tracking-wider">
                <Trophy className="w-3.5 h-3.5" /> Thẻ Hoàn Tiền Tối Ưu Nhất
              </span>
              {topCard.tierSpendLevel && (
                <span className="px-2.5 py-1 rounded-full bg-sky-500/20 border border-sky-500/40 text-sky-300 text-xs font-semibold">
                  {topCard.tierSpendLevel}
                </span>
              )}
            </div>

            <div>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
                {topCard.card.name}
              </h3>
              <p className="text-slate-300 text-sm mt-1">
                {topCard.rule.note || topCard.card.features[0]}
              </p>
            </div>

            {/* Big Cashback Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
              <div className="p-3 rounded-2xl bg-slate-900/80 border border-amber-500/30">
                <span className="text-xs text-slate-400 font-medium block">Tỷ lệ hoàn</span>
                <span className="text-2xl font-black text-amber-400">
                  {topCard.cashbackRate}%
                </span>
              </div>
              <div className="p-3 rounded-2xl bg-slate-900/80 border border-emerald-500/30">
                <span className="text-xs text-slate-400 font-medium block">Ước tính nhận</span>
                <span className={`text-xl font-bold ${topCard.estimatedCashback > 0 ? "text-emerald-400" : "text-slate-400"}`}>
                  +{formatCurrencyVND(topCard.estimatedCashback)}
                </span>
                {topCard.theoreticalCashback !== undefined && topCard.theoreticalCashback > topCard.estimatedCashback && (
                  <span className="text-[10px] text-amber-300/80 block mt-0.5">
                    (Gốc: +{formatCurrencyVND(topCard.theoreticalCashback)})
                  </span>
                )}
              </div>
              <div className="col-span-2 sm:col-span-1 p-3 rounded-2xl bg-slate-900/80 border border-white/10">
                <span className="text-xs text-slate-400 font-medium block">
                  {topCard.remainingCardCap !== undefined ? "Hạn mức còn lại kỳ này" : "Trần hoàn/kỳ"}
                </span>
                <span className="text-base font-bold text-white">
                  {topCard.remainingCardCap !== undefined
                    ? formatCurrencyVND(topCard.remainingCardCap)
                    : formatCurrencyVND(topCard.maxCategoryCap || topCard.card.maxCashbackPerMonth)}
                </span>
                {topCard.currentCycleCashback !== undefined && (
                  <span className="text-[10px] text-slate-400 block mt-0.5">
                    Đã hoàn: {formatCurrencyVND(topCard.currentCycleCashback)} / {formatCurrencyVND(topCard.card.maxCashbackPerMonth)}
                  </span>
                )}
              </div>
            </div>

            {/* Cap Warning Alert if reached */}
            {topCard.isCapReached && (
              <div className="p-3 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs flex items-center gap-2">
                <Info className="w-4 h-4 shrink-0 text-amber-400" />
                <span>Thẻ này đã đạt trần hoàn tiền tối đa trong chu kỳ sao kê hiện tại. Bạn nên chọn thẻ tiếp theo!</span>
              </div>
            )}

            {/* Quick Action */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 pt-2">
              <button
                onClick={() => setActiveTxCard(topCard)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-sm shadow-lg shadow-amber-500/25 transition-all hover:scale-[1.02]"
              >
                <PlusCircle className="w-4 h-4" />
                Ghi nhận chi tiêu bằng thẻ này
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Comparison Ranking List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-base font-bold text-white flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-400" />
            Bảng so sánh tất cả các thẻ khả dụng ({results.length})
          </h4>
          <span className="text-xs text-slate-400">Sắp xếp theo số tiền hoàn thực tế còn lại</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {results.map((res, index) => (
            <div
              key={res.card.id}
              className={`p-5 rounded-2xl glass-panel glass-panel-hover flex flex-col justify-between border ${
                index === 0 && res.estimatedCashback > 0
                  ? "border-amber-500/40 bg-amber-500/5"
                  : res.isCapReached
                  ? "border-white/5 opacity-75"
                  : "border-white/10"
              }`}
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="w-5 h-5 rounded-full bg-slate-800 text-amber-400 font-bold text-xs flex items-center justify-center border border-white/10">
                        #{index + 1}
                      </span>
                      <h5 className="font-bold text-white text-base">{res.card.name}</h5>
                      {res.isCapReached && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-500/20 text-red-300 font-bold border border-red-500/30">
                          Đã chạm trần
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-slate-400">
                      {res.card.bank} • Ngày chốt {res.card.statementDay}
                      {res.card.hasPreviousCycleTier && " (phân tầng kỳ trước)"}
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="px-3 py-1 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 font-black text-base">
                      {res.cashbackRate}%
                    </span>
                  </div>
                </div>

                {/* Estimation snippet */}
                <div className="p-3 rounded-xl bg-slate-900/60 border border-white/5 space-y-1.5 text-xs">
                  <div className="flex justify-between items-center text-slate-300">
                    <span>Dự kiến nhận (tiêu {formatCurrencyVND(spendAmount)}):</span>
                    <span className={`font-bold text-sm ${res.estimatedCashback > 0 ? "text-emerald-400" : "text-slate-400"}`}>
                      +{formatCurrencyVND(res.estimatedCashback)}
                    </span>
                  </div>
                  {res.remainingCardCap !== undefined && (
                    <div className="flex justify-between text-[11px] text-slate-400 pt-1 border-t border-white/5">
                      <span>Đã hoàn kỳ này: {formatCurrencyVND(res.currentCycleCashback || 0)}</span>
                      <span className="text-amber-300 font-semibold">Còn lại: {formatCurrencyVND(res.remainingCardCap)}</span>
                    </div>
                  )}
                  {res.maxCategoryCap && (
                    <div className="text-[11px] text-sky-300/90 flex items-center gap-1">
                      <Layers className="w-3 h-3 text-sky-400" />
                      <span>Trần danh mục: {formatCurrencyVND(res.maxCategoryCap)}/kỳ</span>
                    </div>
                  )}
                  {res.rule.note && (
                    <p className="text-[11px] text-slate-400 pt-1 border-t border-white/5 flex items-start gap-1">
                      <Info className="w-3.5 h-3.5 text-amber-400/80 shrink-0 mt-0.5" />
                      <span>{res.rule.note}</span>
                    </p>
                  )}
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-4 flex items-center justify-between">
                <span className="text-[11px] text-slate-400">
                  Trần thẻ: {formatCurrencyVND(res.card.maxCashbackPerMonth)}/kỳ
                </span>
                <button
                  onClick={() => setActiveTxCard(res)}
                  className="text-xs px-3 py-1.5 rounded-lg bg-white/10 hover:bg-amber-500 hover:text-slate-950 text-slate-200 font-semibold transition-all flex items-center gap-1"
                >
                  Chọn thẻ <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Transaction Modal when clicking on any card */}
      {activeTxCard && (
        <TransactionModal
          isOpen={!!activeTxCard}
          onClose={() => setActiveTxCard(null)}
          defaultCardId={activeTxCard.card.id}
          defaultMccCode={selectedMccCode}
          defaultMccName={selectedMccName}
          defaultAmount={spendAmount}
          defaultCashbackRate={activeTxCard.cashbackRate}
          onSuccess={() => {
            setActiveTxCard(null);
            if (typeof window !== "undefined") {
              window.dispatchEvent(new Event("transaction_updated"));
            }
          }}
        />
      )}
    </div>
  );
}
