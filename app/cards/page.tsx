"use client";

import { useState } from "react";
import { getStoredCards } from "@/lib/storage";
import { CreditCard } from "@/types";
import CreditCardVisual from "@/components/CreditCardVisual";
import { formatCurrencyVND } from "@/lib/statement-helper";
import {
  Layers,
  CheckCircle,
  Tag,
  ChevronDown,
  ChevronUp,
  Info,
  Calendar,
  DollarSign,
  PlusCircle,
  ShieldAlert,
} from "lucide-react";
import TransactionModal from "@/components/TransactionModal";

export default function CardsPage() {
  const cards = getStoredCards();
  const [expandedCardId, setExpandedCardId] = useState<string | null>(cards[0]?.id || null);
  const [activeTxCard, setActiveTxCard] = useState<CreditCard | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedCardId(expandedCardId === id ? null : id);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="border-b border-white/10 pb-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-300 text-xs font-bold border border-amber-500/20 mb-2">
          <Layers className="w-3.5 h-3.5" /> Danh mục Thẻ Tín Dụng & Chính sách Hoàn tiền Chuẩn
        </div>
        <h1 className="text-2xl sm:text-4xl font-black text-white">Chính sách & Danh mục MCC</h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Dữ liệu chi tiết về tỷ lệ hoàn tiền theo từng bậc chi tiêu kỳ trước, điều kiện hạn mức danh mục 500k và danh sách mã MCC áp dụng cho từng dòng thẻ VIB.
        </p>
      </div>

      {/* Cards Grid */}
      <div className="space-y-6">
        {cards.map((card) => {
          const isExpanded = expandedCardId === card.id;

          return (
            <div
              key={card.id}
              className="p-6 md:p-8 rounded-3xl glass-panel border border-white/10 space-y-6 transition-all hover:border-amber-500/30"
            >
              {/* Card Summary Header */}
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 w-full lg:w-auto">
                  {/* Visual mockup */}
                  <div className="w-full sm:w-64 shrink-0">
                    <CreditCardVisual card={card} compact />
                  </div>

                  {/* Summary Text */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-2xl font-black text-white">{card.name}</h3>
                      <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                        {card.bank}
                      </span>
                      {card.hasPreviousCycleTier && (
                        <span className="text-[11px] px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 font-semibold border border-sky-500/30">
                          Tỷ lệ theo kỳ trước
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-amber-400" /> Ngày chốt: {card.statementDay} hàng tháng
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-sky-400" /> Hạn thanh toán: ngày {card.dueDay}
                      </span>
                      <span className="flex items-center gap-1">
                        <DollarSign className="w-3.5 h-3.5 text-emerald-400" /> Trần hoàn: {formatCurrencyVND(card.maxCashbackPerMonth)}/kỳ
                      </span>
                      {card.maxCashbackPerCategory && (
                        <span className="flex items-center gap-1 text-amber-300/90 font-medium">
                          <Layers className="w-3.5 h-3.5 text-amber-400" /> Max/danh mục: {formatCurrencyVND(card.maxCashbackPerCategory)}/kỳ
                        </span>
                      )}
                    </div>

                    {/* Features list */}
                    <div className="space-y-1 pt-1">
                      {card.features.map((feat, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-xs text-slate-300">
                          <CheckCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                          <span>{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex sm:flex-col items-center sm:items-end justify-between w-full lg:w-auto gap-3 shrink-0">
                  <button
                    onClick={() => setActiveTxCard(card)}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition-all hover:scale-[1.02]"
                  >
                    <PlusCircle className="w-4 h-4" />
                    Quẹt thẻ này
                  </button>

                  <button
                    onClick={() => toggleExpand(card.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-white/5 transition-colors"
                  >
                    <span>{isExpanded ? "Thu gọn MCC" : `Xem chi tiết (${card.rules.length} quy tắc)`}</span>
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Detailed Rules & MCCs Accordion */}
              {isExpanded && (
                <div className="pt-6 border-t border-white/10 space-y-4 animate-in fade-in duration-200">
                  <h4 className="font-bold text-white text-sm flex items-center gap-2">
                    <Tag className="w-4 h-4 text-amber-400" />
                    Các quy tắc hoàn tiền & danh sách mã MCC áp dụng:
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {card.rules.map((rule, rIdx) => (
                      <div
                        key={rIdx}
                        className="p-4 rounded-2xl bg-slate-900/80 border border-white/5 space-y-3"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-white text-sm">{rule.category}</span>
                          <span className="px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 font-extrabold text-sm border border-amber-500/30">
                            {rule.tierRates ? "Hoàn 5% - 10%" : `Hoàn ${rule.cashbackRate}%`}
                          </span>
                        </div>

                        {rule.tierRates && (
                          <div className="p-2.5 rounded-xl bg-slate-950/60 border border-white/5 text-[11px] space-y-1">
                            <span className="font-semibold text-slate-300 block">Tỷ lệ theo tổng chi tiêu kỳ liền trước:</span>
                            <div className="grid grid-cols-3 gap-1 text-center font-medium">
                              <div className="p-1 rounded bg-slate-800 text-slate-300">
                                ≤50Tr: <strong className="text-amber-400 font-bold">{rule.tierRates.tier1}%</strong>
                              </div>
                              <div className="p-1 rounded bg-slate-800 text-slate-300">
                                50-100Tr: <strong className="text-amber-400 font-bold">{rule.tierRates.tier2}%</strong>
                              </div>
                              <div className="p-1 rounded bg-slate-800 text-slate-300">
                                &gt;100Tr: <strong className="text-amber-400 font-bold">{rule.tierRates.tier3}%</strong>
                              </div>
                            </div>
                          </div>
                        )}

                        {rule.note && (
                          <p className="text-xs text-slate-400 flex items-start gap-1">
                            <Info className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                            <span>{rule.note}</span>
                          </p>
                        )}

                        {/* MCC codes tags */}
                        {rule.mccCodes && rule.mccCodes.length > 0 && (
                          <div className="space-y-1.5 pt-1">
                            <div className="text-[11px] text-slate-500 font-semibold">
                              MÃ MCC ÁP DỤNG ({rule.mccCodes.length} mã):
                            </div>
                            <div className="flex flex-wrap gap-1 max-h-32 overflow-y-auto pr-1">
                              {rule.mccCodes.map((code) => (
                                <span
                                  key={code}
                                  className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-white/5 hover:border-amber-500/40"
                                >
                                  {code}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Transaction Modal */}
      {activeTxCard && (
        <TransactionModal
          isOpen={!!activeTxCard}
          onClose={() => setActiveTxCard(null)}
          defaultCardId={activeTxCard.id}
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
