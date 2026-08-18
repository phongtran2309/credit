"use client";

import { useState, useEffect } from "react";
import { X, CreditCard as CardIcon, Tag, Calendar, DollarSign, Sparkles, Check } from "lucide-react";
import { getStoredCards, addTransaction } from "@/lib/storage";
import { ALL_MCC_ITEMS, getMccByCode } from "@/lib/data/mcc-database";
import { getRecommendedCardsForMcc } from "@/lib/data/cards-database";
import { CreditCard, MccItem } from "@/types";
import { formatCurrencyVND } from "@/lib/statement-helper";

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  defaultCardId?: string;
  defaultMccCode?: string;
  defaultMccName?: string;
  defaultAmount?: number;
  defaultCashbackRate?: number;
}

export default function TransactionModal({
  isOpen,
  onClose,
  onSuccess,
  defaultCardId,
  defaultMccCode,
  defaultMccName,
  defaultAmount,
  defaultCashbackRate,
}: TransactionModalProps) {
  const [cards, setCards] = useState<CreditCard[]>([]);
  const [selectedCardId, setSelectedCardId] = useState<string>(defaultCardId || "vib-super-card");
  const [mccCode, setMccCode] = useState<string>(defaultMccCode || "5812");
  const [mccName, setMccName] = useState<string>(defaultMccName || "");
  const [amount, setAmount] = useState<number>(defaultAmount || 500000);
  const [date, setDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [cashbackRate, setCashbackRate] = useState<number>(defaultCashbackRate || 15.0);
  const [note, setNote] = useState<string>("");
  const [isOnline, setIsOnline] = useState<boolean>(false);
  const [isForeign, setIsForeign] = useState<boolean>(false);
  const [isSavedCard, setIsSavedCard] = useState<boolean>(false);

  useEffect(() => {
    const loadedCards = getStoredCards();
    setCards(loadedCards);
    if (!defaultCardId && loadedCards.length > 0) {
      setSelectedCardId(loadedCards[0].id);
    }
  }, [defaultCardId]);

  // Auto-fill MCC name & calculate Cashback rate whenever card, MCC, or conditions change
  useEffect(() => {
    const mccItem = getMccByCode(mccCode);
    if (mccItem && !defaultMccName) {
      setMccName(mccItem.name);
    }

    if (mccItem && selectedCardId) {
      const recs = getRecommendedCardsForMcc(
        mccItem,
        { isOnline, isForeign, isSavedCard, amount },
        cards.length > 0 ? cards : undefined
      );
      const cardRec = recs.find((r) => r.card.id === selectedCardId);
      if (cardRec) {
        setCashbackRate(cardRec.cashbackRate);
      }
    }
  }, [mccCode, selectedCardId, isOnline, isForeign, isSavedCard, amount, cards, defaultMccName]);

  if (!isOpen) return null;

  const calculatedCashback = Math.round((amount * cashbackRate) / 100);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || amount <= 0) return;

    addTransaction({
      cardId: selectedCardId,
      mccCode,
      mccName: mccName || `Mã MCC ${mccCode}`,
      amount: Number(amount),
      transactionDate: date,
      cashbackRate: Number(cashbackRate),
      cashbackAmount: calculatedCashback,
      note,
      isOnline,
      isForeign,
      isSavedCard,
    });

    if (onSuccess) onSuccess();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-lg rounded-3xl bg-slate-900 border border-amber-500/30 shadow-2xl p-6 md:p-8 space-y-6 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-white">Ghi nhận giao dịch chi tiêu</h3>
              <p className="text-xs text-slate-400">Tự động tính tiền hoàn & cập nhật kỳ sao kê</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-full hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Card Select */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <CardIcon className="w-3.5 h-3.5 text-amber-400" />
              Chọn thẻ thanh toán:
            </label>
            <select
              value={selectedCardId}
              onChange={(e) => setSelectedCardId(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-white/10 text-white font-medium text-sm focus:border-amber-400 focus:outline-none"
            >
              {cards.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.bank} - Ngày chốt {c.statementDay})
                </option>
              ))}
            </select>
          </div>

          {/* Amount & Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-amber-400" />
                Số tiền chi tiêu (VNĐ):
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                step="1000"
                min="1000"
                required
                className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-white/10 text-amber-300 font-bold text-base focus:border-amber-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-amber-400" />
                Ngày giao dịch:
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-white/10 text-white text-sm focus:border-amber-400 focus:outline-none"
              />
            </div>
          </div>

          {/* MCC Code & Name */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-1">
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-amber-400" />
                Mã MCC:
              </label>
              <select
                value={mccCode}
                onChange={(e) => {
                  setMccCode(e.target.value);
                  const item = getMccByCode(e.target.value);
                  if (item) setMccName(item.name);
                }}
                className="w-full px-3 py-3 rounded-xl bg-slate-800 border border-white/10 text-white font-mono text-sm focus:border-amber-400 focus:outline-none"
              >
                {ALL_MCC_ITEMS.slice(0, 50).map((m) => (
                  <option key={m.code} value={m.code}>
                    {m.code} - {m.category}
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Tên cửa hàng / Nội dung:
              </label>
              <input
                type="text"
                value={mccName}
                onChange={(e) => setMccName(e.target.value)}
                placeholder="VD: Haidilao, Shopee, Bảo hiểm Manulife..."
                className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-white/10 text-white text-sm focus:border-amber-400 focus:outline-none"
              />
            </div>
          </div>

          {/* Conditions Checkboxes */}
          <div className="grid grid-cols-3 gap-2 text-xs">
            <label className="flex items-center gap-1.5 p-2 rounded-lg bg-slate-800/60 border border-white/5 cursor-pointer">
              <input
                type="checkbox"
                checked={isOnline}
                onChange={(e) => setIsOnline(e.target.checked)}
                className="rounded text-amber-500"
              />
              <span className="text-slate-300">Online</span>
            </label>
            <label className="flex items-center gap-1.5 p-2 rounded-lg bg-slate-800/60 border border-white/5 cursor-pointer">
              <input
                type="checkbox"
                checked={isForeign}
                onChange={(e) => setIsForeign(e.target.checked)}
                className="rounded text-amber-500"
              />
              <span className="text-slate-300">Ngoại tệ</span>
            </label>
            <label className="flex items-center gap-1.5 p-2 rounded-lg bg-slate-800/60 border border-white/5 cursor-pointer">
              <input
                type="checkbox"
                checked={isSavedCard}
                onChange={(e) => setIsSavedCard(e.target.checked)}
                className="rounded text-amber-500"
              />
              <span className="text-slate-300">Lưu thẻ</span>
            </label>
          </div>

          {/* Note */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Ghi chú thêm (tùy chọn):
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="VD: Tiệc liên hoan phòng, mua quà sinh nhật..."
              className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-white/10 text-white text-sm focus:border-amber-400 focus:outline-none"
            />
          </div>

          {/* Cashback Auto Calculation Summary Box */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/15 via-slate-800 to-emerald-500/15 border border-amber-500/30 flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-300 font-medium block">Tỷ lệ hoàn tự động</span>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-lg font-black text-amber-400">{cashbackRate}%</span>
                <span className="text-xs text-slate-400">(theo rule thẻ VIB)</span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-300 font-medium block">Tiền hoàn nhận được</span>
              <span className="text-xl font-extrabold text-emerald-400">
                +{formatCurrencyVND(calculatedCashback)}
              </span>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-semibold transition-all"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-sm shadow-lg shadow-amber-500/25 transition-all hover:scale-[1.02]"
            >
              <Check className="w-4 h-4" />
              Lưu giao dịch
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
