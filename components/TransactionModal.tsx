"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { X, CreditCard as CardIcon, Tag, Calendar, DollarSign, Sparkles, Check, Search, ChevronDown, AlertTriangle } from "lucide-react";
import { getStoredCards, getStoredTransactions, addTransaction } from "@/lib/storage";
import { searchMccCodes, getMccByCode } from "@/lib/data/mcc-database";
import { getRecommendedCardsForMcc } from "@/lib/data/cards-database";
import { CreditCard, MccItem } from "@/types";
import { formatCurrencyVND, calculateStatementCycle, isDateInCycle } from "@/lib/statement-helper";

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

const QUICK_MCC_TAGS = [
  { label: "🛍️ TMĐT Shopee/Lazada (5262)", code: "5262", isOnline: true },
  { label: "📱 Điện máy (5732)", code: "5732" },
  { label: "🎓 Học phí (8211)", code: "8211" },
  { label: "📚 Nhà sách (5942)", code: "5942" },
  { label: "🏥 Bệnh viện (8062)", code: "8062" },
  { label: "🛡️ Bảo hiểm (6300)", code: "6300" },
  { label: "📢 Ads/Quảng cáo (7311)", code: "7311", isOnline: true },
  { label: "🍔 Ăn uống/Cafe (5812)", code: "5812" },
];

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
  const [selectedCardId, setSelectedCardId] = useState<string>(defaultCardId || "");
  const [mccCode, setMccCode] = useState<string>(defaultMccCode || "");
  const [mccName, setMccName] = useState<string>(defaultMccName || "");
  const [mccSearchQuery, setMccSearchQuery] = useState<string>(defaultMccCode ? `${defaultMccCode}` : "");
  const [isMccDropdownOpen, setIsMccDropdownOpen] = useState<boolean>(false);
  const [amount, setAmount] = useState<number | "">(defaultAmount !== undefined ? defaultAmount : "");
  const [date, setDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [cashbackRate, setCashbackRate] = useState<number>(defaultCashbackRate || 0);
  const [note, setNote] = useState<string>("");
  const [isOnline, setIsOnline] = useState<boolean>(false);
  const [isForeign, setIsForeign] = useState<boolean>(false);
  const [isSavedCard, setIsSavedCard] = useState<boolean>(false);

  const mccDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadedCards = getStoredCards();
    setCards(loadedCards);
    if (!selectedCardId && loadedCards.length > 0) {
      setSelectedCardId(defaultCardId || loadedCards[0].id);
    }
  }, [defaultCardId, selectedCardId]);

  // Click outside to close MCC dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (mccDropdownRef.current && !mccDropdownRef.current.contains(event.target as Node)) {
        setIsMccDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Set initial MCC text only when defaultMccCode prop is provided
  useEffect(() => {
    if (defaultMccCode) {
      const item = getMccByCode(defaultMccCode);
      if (item) {
        setMccCode(item.code);
        setMccSearchQuery(`${item.code} - ${item.name}`);
        if (defaultMccName) {
          setMccName(defaultMccName);
        }
      }
    }
  }, [defaultMccCode, defaultMccName]);

  // Update cashback rate whenever card, MCC, or conditions change
  useEffect(() => {
    if (!mccCode || !selectedCardId) return;
    const mccItem = getMccByCode(mccCode);
    if (mccItem && selectedCardId) {
      const recs = getRecommendedCardsForMcc(
        mccItem,
        { isOnline, isForeign, isSavedCard, amount: Number(amount) || 0 },
        cards.length > 0 ? cards : undefined
      );
      const cardRec = recs.find((r) => r.card.id === selectedCardId);
      if (cardRec) {
        setCashbackRate(cardRec.cashbackRate);
      }
    }
  }, [mccCode, selectedCardId, isOnline, isForeign, isSavedCard, amount, cards]);

  const selectedCard = useMemo(
    () => cards.find((c) => c.id === selectedCardId) || cards[0],
    [cards, selectedCardId]
  );
  const mccItem = useMemo(() => getMccByCode(mccCode), [mccCode]);

  const matchedRec = useMemo(() => {
    if (!mccItem || !selectedCard) return null;
    const recs = getRecommendedCardsForMcc(
      mccItem,
      { isOnline, isForeign, isSavedCard, amount: Number(amount) || 0 },
      cards.length > 0 ? cards : undefined
    );
    return recs.find((r) => r.card.id === selectedCardId) || null;
  }, [mccItem, selectedCard, selectedCardId, isOnline, isForeign, isSavedCard, amount, cards]);

  // Compute accurate cashback with all card & category limits and statement cycle tracking
  const { theoreticalCashback, actualCashback, capMessage, isCapped, categoryMaxCap, cardMaxCap } = useMemo(() => {
    if (!selectedCard) {
      return {
        theoreticalCashback: 0,
        actualCashback: 0,
        capMessage: "",
        isCapped: false,
        categoryMaxCap: undefined,
        cardMaxCap: 0,
      };
    }

    const isFixed = Boolean(matchedRec?.rule?.fixedCashbackPerTx && isSavedCard);
    const theoretical = isFixed
      ? (matchedRec?.rule?.fixedCashbackPerTx || 50000)
      : Math.round((Number(amount || 0) * Number(cashbackRate || 0)) / 100);

    const cardCap = selectedCard.maxCashbackPerMonth || Infinity;
    const catCap = matchedRec?.maxCategoryCap || matchedRec?.rule?.maxCashbackPerCategory || selectedCard.maxCashbackPerCategory;

    // Cycle tracking
    const cycleInfo = calculateStatementCycle(selectedCard.statementDay, selectedCard.dueDay, new Date(date || new Date()));
    const storedTxs = getStoredTransactions();
    const cycleTxs = storedTxs.filter((tx) => tx.cardId === selectedCard.id && isDateInCycle(tx.transactionDate, cycleInfo));

    const cycleTotalEarned = cycleTxs.reduce((sum, tx) => sum + (tx.cashbackAmount || 0), 0);

    const targetCategory = mccItem?.category || matchedRec?.rule?.category;
    const cycleCategoryTxs = cycleTxs.filter((tx) => {
      if (matchedRec?.rule?.mccCodes && matchedRec.rule.mccCodes.includes(tx.mccCode)) return true;
      const m = getMccByCode(tx.mccCode);
      return m?.category && targetCategory && m.category.toLowerCase() === targetCategory.toLowerCase();
    });
    const cycleCatEarned = cycleCategoryTxs.reduce((sum, tx) => sum + (tx.cashbackAmount || 0), 0);

    const remCardCap = Math.max(0, cardCap - cycleTotalEarned);
    const remCatCap = catCap !== undefined ? Math.max(0, catCap - cycleCatEarned) : Infinity;

    const actual = Math.max(0, Math.min(theoretical, remCatCap, remCardCap));
    const capped = actual < theoretical;

    let message = "";
    if (capped) {
      if (remCardCap <= remCatCap && cardCap < Infinity) {
        if (remCardCap === 0) {
          message = `Đã đạt trần thẻ trong kỳ này (${formatCurrencyVND(cycleTotalEarned)} / ${formatCurrencyVND(cardCap)})`;
        } else {
          message = `Áp dụng trần thẻ ${formatCurrencyVND(cardCap)}/kỳ (Trong kỳ đã tích lũy ${formatCurrencyVND(cycleTotalEarned)})`;
        }
      } else if (catCap !== undefined && catCap < Infinity) {
        if (remCatCap === 0) {
          message = `Đã đạt trần danh mục ${targetCategory || ""} trong kỳ này (${formatCurrencyVND(cycleCatEarned)} / ${formatCurrencyVND(catCap)})`;
        } else {
          message = `Áp dụng trần danh mục ${formatCurrencyVND(catCap)}/kỳ (Trong kỳ đã tích lũy ${formatCurrencyVND(cycleCatEarned)})`;
        }
      }
    }

    return {
      theoreticalCashback: theoretical,
      actualCashback: actual,
      capMessage: message,
      isCapped: capped,
      categoryMaxCap: catCap,
      cardMaxCap: cardCap,
    };
  }, [selectedCard, matchedRec, isSavedCard, amount, cashbackRate, date, mccItem]);

  if (!isOpen) return null;

  const filteredMccResults = searchMccCodes(mccSearchQuery);

  const handleSelectMcc = (item: MccItem) => {
    setMccCode(item.code);
    setMccSearchQuery(`${item.code} - ${item.name}`);
    setIsMccDropdownOpen(false);
  };

  const handleQuickTagClick = (tag: typeof QUICK_MCC_TAGS[0]) => {
    const item = getMccByCode(tag.code);
    if (item) {
      handleSelectMcc(item);
      if (tag.isOnline !== undefined) setIsOnline(tag.isOnline);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = Number(amount);
    if (!numAmount || numAmount <= 0) return;

    addTransaction({
      cardId: selectedCardId || (cards[0]?.id ?? "vib-super-card"),
      mccCode: mccCode || "0000",
      mccName: mccName || (mccCode ? `Mã MCC ${mccCode}` : "Chi tiêu khác"),
      amount: numAmount,
      transactionDate: date,
      cashbackRate: Number(cashbackRate),
      cashbackAmount: actualCashback,
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
      <div className="w-full max-w-lg rounded-3xl bg-slate-900 border border-amber-500/30 shadow-2xl p-6 md:p-8 space-y-5 max-h-[92vh] overflow-y-auto">
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
                type="text"
                inputMode="numeric"
                value={amount !== "" && amount !== undefined ? Number(amount).toLocaleString("vi-VN") : ""}
                onChange={(e) => {
                  const rawValue = e.target.value.replace(/\D/g, "");
                  setAmount(rawValue === "" ? "" : Number(rawValue));
                }}
                placeholder="VD: 16.000.000"
                required
                className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-white/10 text-amber-300 font-bold text-base focus:border-amber-400 focus:outline-none placeholder:text-slate-500 placeholder:font-normal"
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

          {/* Searchable MCC Input with Autocomplete Dropdown */}
          <div className="space-y-2 relative" ref={mccDropdownRef}>
            <label className="block text-xs font-semibold text-slate-300 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-amber-400" />
                Tìm kiếm & Chọn Mã MCC:
              </span>
              <span className="text-[11px] text-amber-400 font-mono font-bold">
                {mccCode ? `Đang chọn: MCC ${mccCode}` : "Chưa chọn MCC"}
              </span>
            </label>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Search className="w-4 h-4 text-amber-400" />
              </div>
              <input
                type="text"
                value={mccSearchQuery}
                onFocus={() => setIsMccDropdownOpen(true)}
                onChange={(e) => {
                  setMccSearchQuery(e.target.value);
                  setIsMccDropdownOpen(true);
                }}
                placeholder="Nhập mã MCC (6300, 5812...), tên ngành (Bảo hiểm, Học phí) hoặc thương hiệu..."
                className="w-full pl-10 pr-10 py-3 rounded-xl bg-slate-800 border border-white/10 text-white text-sm focus:border-amber-400 focus:outline-none placeholder:text-slate-500"
              />
              <button
                type="button"
                onClick={() => setIsMccDropdownOpen(!isMccDropdownOpen)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-white"
              >
                <ChevronDown className={`w-4 h-4 transition-transform ${isMccDropdownOpen ? "rotate-180" : ""}`} />
              </button>
            </div>

            {/* Quick MCC Chips */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {QUICK_MCC_TAGS.map((tag) => (
                <button
                  key={tag.code}
                  type="button"
                  onClick={() => handleQuickTagClick(tag)}
                  className={`text-[11px] px-2.5 py-1 rounded-lg border transition-all ${
                    mccCode === tag.code
                      ? "bg-amber-500/20 text-amber-300 border-amber-500/50 font-bold"
                      : "bg-slate-800/80 text-slate-400 border-white/5 hover:border-white/20 hover:text-slate-200"
                  }`}
                >
                  {tag.label}
                </button>
              ))}
            </div>

            {/* Dropdown Results List */}
            {isMccDropdownOpen && (
              <div className="absolute top-full left-0 right-0 mt-1.5 max-h-56 overflow-y-auto rounded-2xl bg-slate-900 border border-amber-500/30 shadow-2xl z-50 divide-y divide-white/5 backdrop-blur-xl">
                {filteredMccResults.length === 0 ? (
                  <div className="p-4 text-center text-xs text-slate-400">
                    Không tìm thấy mã MCC phù hợp. Bạn vẫn có thể nhập trực tiếp.
                  </div>
                ) : (
                  filteredMccResults.map((item) => (
                    <button
                      key={item.code}
                      type="button"
                      onClick={() => handleSelectMcc(item)}
                      className={`w-full text-left p-3 hover:bg-white/10 transition-colors flex items-center justify-between gap-2 ${
                        mccCode === item.code ? "bg-amber-500/10" : ""
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="px-2 py-0.5 rounded-lg bg-amber-500/20 text-amber-300 font-mono font-bold text-xs shrink-0 border border-amber-500/30">
                          {item.code}
                        </span>
                        <div className="truncate">
                          <span className="font-semibold text-white text-xs block truncate">{item.name}</span>
                          <span className="text-[10px] text-slate-400 block truncate">
                            {item.category} {item.popularBrands?.length ? `• ${item.popularBrands.slice(0, 2).join(", ")}` : ""}
                          </span>
                        </div>
                      </div>
                      {mccCode === item.code && (
                        <Check className="w-4 h-4 text-amber-400 shrink-0" />
                      )}
                    </button>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Store / Transaction Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Tên cửa hàng / Nội dung hiển thị:
            </label>
            <input
              type="text"
              value={mccName}
              onChange={(e) => setMccName(e.target.value)}
              placeholder="VD: Haidilao, Shopee, Bảo hiểm Manulife..."
              className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-white/10 text-white text-sm focus:border-amber-400 focus:outline-none"
            />
          </div>

          {/* Conditions Checkboxes */}
          <div className="grid grid-cols-3 gap-2 text-xs">
            <label className="flex items-center gap-1.5 p-2 rounded-lg bg-slate-800/60 border border-white/5 cursor-pointer hover:bg-slate-800">
              <input
                type="checkbox"
                checked={isOnline}
                onChange={(e) => setIsOnline(e.target.checked)}
                className="rounded text-amber-500"
              />
              <span className="text-slate-300">Online</span>
            </label>
            <label className="flex items-center gap-1.5 p-2 rounded-lg bg-slate-800/60 border border-white/5 cursor-pointer hover:bg-slate-800">
              <input
                type="checkbox"
                checked={isForeign}
                onChange={(e) => setIsForeign(e.target.checked)}
                className="rounded text-amber-500"
              />
              <span className="text-slate-300">Ngoại tệ</span>
            </label>
            <label className="flex items-center gap-1.5 p-2 rounded-lg bg-slate-800/60 border border-white/5 cursor-pointer hover:bg-slate-800">
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
          <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/15 via-slate-800 to-emerald-500/15 border border-amber-500/30 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-300 font-medium block">Tỷ lệ hoàn tự động</span>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-lg font-black text-amber-400">{cashbackRate}%</span>
                  <span className="text-xs text-slate-400">({selectedCard?.bank || "Thẻ tín dụng"})</span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-300 font-medium block">Tiền hoàn nhận được</span>
                <div className="flex items-baseline justify-end gap-2">
                  {isCapped && (
                    <span className="text-xs text-slate-400 line-through">
                      +{formatCurrencyVND(theoreticalCashback)}
                    </span>
                  )}
                  <span className="text-xl font-extrabold text-emerald-400">
                    +{formatCurrencyVND(actualCashback)}
                  </span>
                </div>
              </div>
            </div>

            {/* Capped Warning or Notice */}
            {isCapped ? (
              <div className="pt-2 border-t border-amber-500/20 flex items-start gap-2 text-xs text-amber-300 bg-amber-500/10 p-2.5 rounded-xl border border-amber-500/30">
                <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
                <div className="space-y-0.5">
                  <p className="font-semibold text-amber-200">{capMessage}</p>
                  <p className="text-[11px] text-slate-300">
                    Lý thuyết: {formatCurrencyVND(theoreticalCashback)} ➔ Tiền hoàn thực nhận được tự động khống chế theo hạn mức quy định của thẻ.
                  </p>
                </div>
              </div>
            ) : (
              (categoryMaxCap || (cardMaxCap && cardMaxCap < Infinity)) && (
                <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-400">
                  <span>Hạn mức hoàn tối đa:</span>
                  <span className="text-slate-300 font-medium">
                    {categoryMaxCap ? `Trần danh mục: ${formatCurrencyVND(categoryMaxCap)}/kỳ` : `Trần thẻ: ${formatCurrencyVND(cardMaxCap)}/kỳ`}
                  </span>
                </div>
              )
            )}
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
