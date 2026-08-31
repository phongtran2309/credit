"use client";

import { useState, useEffect, useMemo } from "react";
import { CreditCard, Transaction } from "@/types";
import { getCardPaymentDueStatus, formatCurrencyVND } from "@/lib/statement-helper";
import {
  BellRing,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Calendar,
  ChevronDown,
  ChevronUp,
  CreditCard as CardIcon,
  ShieldCheck,
} from "lucide-react";

interface PaymentDueReminderProps {
  cards: CreditCard[];
  transactions: Transaction[];
}

export default function PaymentDueReminder({ cards, transactions }: PaymentDueReminderProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [paidCardIds, setPaidCardIds] = useState<Record<string, boolean>>({});

  useEffect(() => {
    try {
      const currentMonthKey = new Date().toISOString().slice(0, 7); // "YYYY-MM"
      const saved = localStorage.getItem(`mcc_paid_status_${currentMonthKey}`);
      if (saved) {
        setPaidCardIds(JSON.parse(saved));
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const togglePaid = (cardId: string) => {
    const currentMonthKey = new Date().toISOString().slice(0, 7);
    const updated = { ...paidCardIds, [cardId]: !paidCardIds[cardId] };
    setPaidCardIds(updated);
    try {
      localStorage.setItem(`mcc_paid_status_${currentMonthKey}`, JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
  };

  const dueList = useMemo(() => {
    return cards
      .map((card) => getCardPaymentDueStatus(card, transactions))
      .sort((a, b) => {
        // Ưu tiên: chưa thanh toán trước, sau đó theo số ngày còn lại tăng dần
        const aPaid = !!paidCardIds[a.card.id];
        const bPaid = !!paidCardIds[b.card.id];
        if (aPaid !== bPaid) return aPaid ? 1 : -1;
        return a.dueDaysRemaining - b.dueDaysRemaining;
      });
  }, [cards, transactions, paidCardIds]);

  const urgentCount = dueList.filter(
    (item) => !paidCardIds[item.card.id] && (item.isOverdue || item.dueDaysRemaining <= 5)
  ).length;

  if (cards.length === 0) return null;

  return (
    <div className="rounded-3xl glass-panel border border-amber-500/30 overflow-hidden shadow-xl transition-all">
      {/* Header Bar */}
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="p-4 sm:p-5 flex items-center justify-between cursor-pointer hover:bg-white/5 transition-colors select-none"
      >
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-lg ${
              urgentCount > 0
                ? "bg-rose-500/20 text-rose-400 border border-rose-500/30 animate-pulse"
                : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
            }`}
          >
            <BellRing className="w-5 h-5" />
          </div>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-extrabold text-white text-base sm:text-lg flex items-center gap-2">
                Nhắc Lịch Thanh Toán Tín Dụng & Hạn Sao Kê
              </h3>
              {urgentCount > 0 ? (
                <span className="px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 text-xs font-bold border border-rose-500/40 flex items-center gap-1 animate-pulse">
                  <AlertTriangle className="w-3 h-3" /> {urgentCount} thẻ cần thanh toán gấp!
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold border border-emerald-500/30 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> Tất cả thẻ an toàn
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Theo dõi hạn thanh toán để tránh phát sinh lãi suất & phí phạt chậm trả.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white transition-colors">
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Expanded Grid */}
      {isExpanded && (
        <div className="p-4 sm:p-5 pt-0 border-t border-white/5 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 pt-3">
            {dueList.map((item) => {
              const isPaid = !!paidCardIds[item.card.id];
              const isUrgent = !isPaid && (item.isOverdue || item.dueDaysRemaining <= 5);
              const isWarning = !isPaid && item.dueDaysRemaining <= 10;

              return (
                <div
                  key={item.card.id}
                  className={`p-3.5 rounded-2xl border transition-all flex flex-col justify-between space-y-2.5 relative overflow-hidden ${
                    isPaid
                      ? "bg-slate-900/40 border-white/5 opacity-60"
                      : isUrgent
                      ? "bg-rose-950/30 border-rose-500/40 shadow-lg shadow-rose-950/40"
                      : isWarning
                      ? "bg-amber-950/20 border-amber-500/30"
                      : "bg-slate-900/80 border-white/10"
                  }`}
                >
                  {/* Top card info */}
                  <div className="space-y-1">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="font-bold text-white text-sm line-clamp-1">
                          {item.card.name}
                        </h4>
                        <div className="flex items-center gap-1.5 flex-wrap text-[11px] text-slate-400">
                          <span className="text-amber-400 font-semibold">{item.card.bank}</span>
                          {item.card.cardholderName && (
                            <span className="text-emerald-300 font-medium">
                              • {item.card.cardholderName}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Urgency Badge */}
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${
                          isPaid
                            ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                            : isUrgent
                            ? "bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse"
                            : isWarning
                            ? "bg-amber-500/20 text-amber-300 border-amber-500/30"
                            : "bg-slate-800 text-slate-300 border-white/10"
                        }`}
                      >
                        {isPaid ? "✓ Đã thanh toán" : item.statusLabel}
                      </span>
                    </div>
                  </div>

                  {/* Dates & Amounts */}
                  <div className="p-2.5 rounded-xl bg-slate-950/60 border border-white/5 space-y-1 text-xs">
                    <div className="flex justify-between text-slate-400">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-amber-400" /> Ngày chốt:
                      </span>
                      <span className="font-semibold text-slate-200">
                        {item.card.statementDay} hàng tháng
                      </span>
                    </div>

                    <div className="flex justify-between text-slate-400">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-sky-400" /> Hạn thanh toán:
                      </span>
                      <span
                        className={`font-bold ${
                          isUrgent ? "text-rose-400" : "text-sky-300"
                        }`}
                      >
                        {item.dueDate.getDate()}/{item.dueDate.getMonth() + 1}/{item.dueDate.getFullYear()}
                      </span>
                    </div>

                    {item.cycleSpentAmount > 0 && (
                      <div className="flex justify-between text-slate-300 pt-1 border-t border-white/5 font-semibold">
                        <span>Đã chi tiêu kỳ này:</span>
                        <span className="text-amber-300">
                          {formatCurrencyVND(item.cycleSpentAmount)}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Action Checkbox */}
                  <div className="pt-1 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => togglePaid(item.card.id)}
                      className={`w-full py-1.5 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        isPaid
                          ? "bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30"
                          : "bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-slate-300 border border-white/10"
                      }`}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      {isPaid ? "Đã xong (Bấm để hủy)" : "Đánh dấu Đã thanh toán"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
