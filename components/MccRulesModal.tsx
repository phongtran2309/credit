"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import { X, BookOpen, Layers, Info, Check, Tag } from "lucide-react";
import { CreditCard } from "@/types";
import { formatCurrencyVND } from "@/lib/statement-helper";

interface MccRulesModalProps {
  isOpen: boolean;
  onClose: () => void;
  card: CreditCard | null;
}

export default function MccRulesModal({ isOpen, onClose, card }: MccRulesModalProps) {
  // Lock body scroll & listen for Escape key when modal is open
  useEffect(() => {
    if (!isOpen) return;
    if (typeof document !== "undefined") {
      document.body.style.overflow = "hidden";
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      if (typeof document !== "undefined") {
        document.body.style.overflow = "unset";
      }
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !card || typeof document === "undefined") return null;

  return createPortal(
    <div className="fixed inset-0 z-[99999] overflow-y-auto bg-slate-950/98 backdrop-blur-2xl p-4 sm:p-6 flex min-h-screen items-center justify-center animate-in fade-in duration-200">
      <div className="w-full max-w-2xl rounded-3xl bg-slate-900 border border-amber-500/30 shadow-2xl p-6 md:p-8 space-y-6 max-h-[88vh] overflow-y-auto my-auto relative">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-bold text-lg text-white">{card.name}</h3>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                  {card.bank}
                </span>
                {card.cardholderName && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30">
                    Chủ thẻ: {card.cardholderName}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Danh mục mã MCC áp dụng & Quy tắc tính tỷ lệ hoàn tiền
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-full hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Card Summary Highlights */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3.5 rounded-2xl bg-slate-950/60 border border-white/5 text-xs">
          <div>
            <span className="text-slate-400 block text-[11px]">Ngày chốt sao kê:</span>
            <span className="font-bold text-white text-sm">{card.statementDay} hàng tháng</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Hạn thanh toán:</span>
            <span className="font-bold text-sky-300 text-sm">Ngày {card.dueDay}</span>
          </div>
          <div className="col-span-2 sm:col-span-1">
            <span className="text-slate-400 block text-[11px]">Trần hoàn tiền kỳ:</span>
            <span className="font-extrabold text-amber-400 text-sm">
              {formatCurrencyVND(card.maxCashbackPerMonth)}
            </span>
          </div>
        </div>

        {/* Rules & MCC list */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-white text-sm flex items-center gap-2">
              <Tag className="w-4 h-4 text-amber-400" />
              Các quy tắc hoàn tiền & danh sách mã MCC ({card.rules.length} danh mục):
            </h4>
          </div>

          <div className="space-y-3">
            {card.rules.map((rule, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-slate-950/80 border border-white/10 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-amber-400 shrink-0" />
                    <span className="font-bold text-white text-sm">{rule.category}</span>
                  </div>
                  <span className="px-3 py-1 rounded-xl bg-amber-500/20 text-amber-300 font-black text-sm border border-amber-500/30">
                    {rule.tierRates ? "Hoàn 5% - 10%" : `Hoàn ${rule.cashbackRate}%`}
                  </span>
                </div>

                {rule.tierRates && (
                  <div className="p-3 rounded-xl bg-slate-900 border border-white/5 text-xs space-y-1.5">
                    <span className="font-semibold text-slate-300 block">
                      Tỷ lệ theo tổng chi tiêu kỳ liền trước:
                    </span>
                    <div className="grid grid-cols-3 gap-2 text-center font-medium">
                      <div className="p-1.5 rounded-lg bg-slate-800 text-slate-300">
                        ≤50Tr: <strong className="text-amber-400 font-bold">{rule.tierRates.tier1}%</strong>
                      </div>
                      <div className="p-1.5 rounded-lg bg-slate-800 text-slate-300">
                        50-100Tr: <strong className="text-amber-400 font-bold">{rule.tierRates.tier2}%</strong>
                      </div>
                      <div className="p-1.5 rounded-lg bg-slate-800 text-slate-300">
                        &gt;100Tr: <strong className="text-amber-400 font-bold">{rule.tierRates.tier3}%</strong>
                      </div>
                    </div>
                  </div>
                )}

                {rule.note && (
                  <p className="text-xs text-slate-400 flex items-start gap-1.5">
                    <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <span>{rule.note}</span>
                  </p>
                )}

                {/* MCC codes tags */}
                {rule.mccCodes && rule.mccCodes.length > 0 && (
                  <div className="space-y-1.5 pt-1">
                    <div className="text-[11px] text-slate-500 font-semibold">
                      MÃ MCC ÁP DỤNG ({rule.mccCodes.length} mã):
                    </div>
                    <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto pr-1">
                      {rule.mccCodes.map((code) => (
                        <span
                          key={code}
                          className="text-[11px] font-mono px-2 py-0.5 rounded-lg bg-slate-800 text-slate-200 border border-white/5 hover:border-amber-500/40"
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

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
          <button
            type="button"
            onClick={onClose}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-sm shadow-lg shadow-amber-500/25 transition-all hover:scale-[1.02] cursor-pointer"
          >
            <Check className="w-4 h-4" />
            Đã hiểu & Đóng
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
