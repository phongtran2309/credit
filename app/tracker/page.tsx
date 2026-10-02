"use client";

import { useState, useEffect, useMemo } from "react";
import {
  getStoredTransactions,
  getStoredCards,
  deleteTransaction,
  syncCardsFromSupabase,
} from "@/lib/storage";
import {
  calculateStatementCycle,
  getCardStatementCycleByOffset,
  getTransactionStatementCycle,
  isDateInCycle,
  formatCurrencyVND,
} from "@/lib/statement-helper";
import { Transaction, CreditCard, CardSpendingSummary } from "@/types";
import StatementProgress from "@/components/StatementProgress";
import SpendingChart from "@/components/SpendingChart";
import TransactionModal from "@/components/TransactionModal";
import {
  Trash2,
  Edit3,
  Filter,
  PieChart as ChartIcon,
  Sparkles,
  Calendar,
  Layers,
  ArrowDownRight,
  CreditCard as CardIcon,
  CheckCircle2,
  Clock,
  ChevronRight,
  TrendingUp,
} from "lucide-react";

export default function TrackerPage() {
  const [cards, setCards] = useState<CreditCard[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [selectedCardFilter, setSelectedCardFilter] = useState<string>("all");
  const [selectedCycleOffset, setSelectedCycleOffset] = useState<number | "all">(0);
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);

  const loadData = () => {
    setCards(getStoredCards());
    setTransactions(getStoredTransactions());
  };

  useEffect(() => {
    loadData();

    syncCardsFromSupabase().then((synced) => {
      if (synced) setCards(synced);
    });

    const handleUpdate = () => loadData();
    window.addEventListener("transaction_updated", handleUpdate);
    window.addEventListener("cards_updated", handleUpdate);
    return () => {
      window.removeEventListener("transaction_updated", handleUpdate);
      window.removeEventListener("cards_updated", handleUpdate);
    };
  }, []);

  // Pre-generate statement cycle options (Offset 0: current, -1: prev, -2: 2 ago, -3: 3 ago, all)
  const cycleOptions = useMemo(() => {
    const foundCard = selectedCardFilter !== "all" ? cards.find((c) => c.id === selectedCardFilter) : undefined;
    const refCard = foundCard || cards[0] || { statementDay: 27, dueDay: 21 };

    const stDay = refCard.statementDay || 27;
    const dueDay = refCard.dueDay || 21;

    const cycle0 = getCardStatementCycleByOffset(stDay, dueDay, 0);
    const cycle1 = getCardStatementCycleByOffset(stDay, dueDay, -1);
    const cycle2 = getCardStatementCycleByOffset(stDay, dueDay, -2);
    const cycle3 = getCardStatementCycleByOffset(stDay, dueDay, -3);

    return [
      {
        offset: 0 as number | "all",
        label: "Kỳ hiện tại",
        dateRange: cycle0.shortCycleLabel,
        fullRange: `${cycle0.startDate.toLocaleDateString("vi-VN")} - ${cycle0.endDate.toLocaleDateString("vi-VN")}`,
        monthLabel: cycle0.cycleMonthLabel,
        isCurrent: true,
      },
      {
        offset: -1 as number | "all",
        label: "Kỳ trước",
        dateRange: cycle1.shortCycleLabel,
        fullRange: `${cycle1.startDate.toLocaleDateString("vi-VN")} - ${cycle1.endDate.toLocaleDateString("vi-VN")}`,
        monthLabel: cycle1.cycleMonthLabel,
        isCurrent: false,
      },
      {
        offset: -2 as number | "all",
        label: cycle2.cycleMonthLabel,
        dateRange: cycle2.shortCycleLabel,
        fullRange: `${cycle2.startDate.toLocaleDateString("vi-VN")} - ${cycle2.endDate.toLocaleDateString("vi-VN")}`,
        monthLabel: cycle2.cycleMonthLabel,
        isCurrent: false,
      },
      {
        offset: -3 as number | "all",
        label: cycle3.cycleMonthLabel,
        dateRange: cycle3.shortCycleLabel,
        fullRange: `${cycle3.startDate.toLocaleDateString("vi-VN")} - ${cycle3.endDate.toLocaleDateString("vi-VN")}`,
        monthLabel: cycle3.cycleMonthLabel,
        isCurrent: false,
      },
      {
        offset: "all" as number | "all",
        label: "Tất cả các kỳ",
        dateRange: "Toàn bộ",
        fullRange: "Tất cả các kỳ sao kê đã ghi nhận",
        monthLabel: "Toàn bộ thời gian",
        isCurrent: false,
      },
    ];
  }, [selectedCardFilter, cards]);

  // Check if a transaction belongs to a given cycle offset for its card
  const isTxInCycleOffset = (tx: Transaction, offset: number): boolean => {
    const card = cards.find((c) => c.id === tx.cardId);
    const stDay = card?.statementDay ?? 20;
    const dueDay = card?.dueDay ?? 5;
    const cycle = getCardStatementCycleByOffset(stDay, dueDay, offset);
    return isDateInCycle(tx.transactionDate, cycle);
  };

  // Transactions filtered by active card filter AND cycle offset
  const displayedTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      // 1. Filter by card
      if (selectedCardFilter !== "all" && tx.cardId !== selectedCardFilter) {
        return false;
      }
      // 2. Filter by cycle offset
      if (selectedCycleOffset !== "all") {
        return isTxInCycleOffset(tx, selectedCycleOffset);
      }
      return true;
    });
  }, [transactions, selectedCardFilter, selectedCycleOffset, cards]);

  // Spending summary per card for the SELECTED statement cycle
  const cardSummaries: CardSpendingSummary[] = useMemo(() => {
    const offset = selectedCycleOffset === "all" ? 0 : selectedCycleOffset;

    return cards.map((card) => {
      const cycleInfo = getCardStatementCycleByOffset(card.statementDay, card.dueDay, offset);
      const cycleTransactions = transactions.filter(
        (tx) => tx.cardId === card.id && isDateInCycle(tx.transactionDate, cycleInfo)
      );

      const totalSpent = cycleTransactions.reduce((sum, tx) => sum + tx.amount, 0);
      const totalCashback = cycleTransactions.reduce((sum, tx) => sum + tx.cashbackAmount, 0);
      const maxCashback = card.maxCashbackPerMonth;
      const isCapReached = totalCashback >= maxCashback;
      const cashbackPercentage = maxCashback > 0 ? (totalCashback / maxCashback) * 100 : 0;

      const optimalSpentTarget =
        card.optimalMonthlySpend ||
        (card.defaultCashbackRate > 0 ? card.maxCashbackPerMonth / (card.defaultCashbackRate / 100) : 10000000);
      const isOptimalSpendReached = totalSpent >= optimalSpentTarget || isCapReached;
      const spendProgressPercentage = Math.min(100, Math.round((totalSpent / optimalSpentTarget) * 100));

      const categoryBreakdown: CardSpendingSummary["categoryBreakdown"] = {};
      for (const tx of cycleTransactions) {
        const cat = tx.mccName || `Mã ${tx.mccCode}`;
        if (!categoryBreakdown[cat]) {
          const optCatSpend =
            card.categoryOptimalSpend?.[cat] ||
            (card.maxCashbackPerCategory ? card.maxCashbackPerCategory / 0.05 : undefined);
          categoryBreakdown[cat] = {
            spent: 0,
            cashback: 0,
            maxCategoryCashback: card.maxCashbackPerCategory,
            optimalCategorySpend: optCatSpend,
          };
        }
        categoryBreakdown[cat].spent += tx.amount;
        categoryBreakdown[cat].cashback += tx.cashbackAmount;
      }

      for (const cat in categoryBreakdown) {
        const item = categoryBreakdown[cat];
        if (item.maxCategoryCashback && item.cashback >= item.maxCategoryCashback) {
          item.isCapReached = true;
        }
        if (item.optimalCategorySpend && item.spent >= item.optimalCategorySpend) {
          item.isOptimalCategorySpendReached = true;
        }
        if (item.optimalCategorySpend && item.optimalCategorySpend > 0) {
          item.categorySpendProgressPercentage = Math.min(
            100,
            Math.round((item.spent / item.optimalCategorySpend) * 100)
          );
        }
      }

      return {
        card,
        cycleInfo,
        totalSpent,
        totalCashback,
        maxCashback,
        maxCashbackPerCategory: card.maxCashbackPerCategory,
        cashbackPercentage,
        isCapReached,
        optimalSpentTarget,
        isOptimalSpendReached,
        spendProgressPercentage,
        transactions: cycleTransactions,
        categoryBreakdown,
      };
    });
  }, [cards, transactions, selectedCycleOffset]);

  // Overall totals for the active cycle
  const cycleTotalSpent = useMemo(() => {
    return displayedTransactions.reduce((sum, tx) => sum + tx.amount, 0);
  }, [displayedTransactions]);

  const cycleTotalCashback = useMemo(() => {
    return displayedTransactions.reduce((sum, tx) => sum + tx.cashbackAmount, 0);
  }, [displayedTransactions]);

  const cycleAverageRate = useMemo(() => {
    return cycleTotalSpent > 0 ? ((cycleTotalCashback / cycleTotalSpent) * 100).toFixed(1) : "0";
  }, [cycleTotalSpent, cycleTotalCashback]);

  // Number of cards with spending in the active cycle
  const cardsWithSpendCount = useMemo(() => {
    const cardIdsWithSpend = new Set(displayedTransactions.map((tx) => tx.cardId));
    return cardIdsWithSpend.size;
  }, [displayedTransactions]);

  // Data for category chart
  const chartData = useMemo(() => {
    const agg: Record<string, { spent: number; cashback: number }> = {};

    for (const tx of displayedTransactions) {
      const label = tx.mccName || `MCC ${tx.mccCode}`;
      if (!agg[label]) {
        agg[label] = { spent: 0, cashback: 0 };
      }
      agg[label].spent += tx.amount;
      agg[label].cashback += tx.cashbackAmount;
    }

    return Object.entries(agg)
      .map(([name, val]) => ({
        name,
        value: val.spent,
        cashback: val.cashback,
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);
  }, [displayedTransactions]);

  // Grouped transactions by cycle when viewing "all"
  interface CycleGroup {
    key: string;
    label: string;
    shortRange: string;
    startDate: Date;
    endDate: Date;
    dueDate: Date;
    isCurrent: boolean;
    transactions: Transaction[];
    totalSpent: number;
    totalCashback: number;
  }

  const groupedTransactions = useMemo(() => {
    if (selectedCycleOffset !== "all") return [];

    const map = new Map<string, CycleGroup>();

    for (const tx of displayedTransactions) {
      const card = cards.find((c) => c.id === tx.cardId);
      const stDay = card?.statementDay ?? 20;
      const dueDay = card?.dueDay ?? 5;
      const cycle = getTransactionStatementCycle(stDay, dueDay, tx.transactionDate);

      const key = `${cycle.startDate.toISOString().slice(0, 10)}_${cycle.endDate.toISOString().slice(0, 10)}`;
      if (!map.has(key)) {
        map.set(key, {
          key,
          label: cycle.cycleMonthLabel,
          shortRange: `${cycle.startDate.getDate()}/${cycle.startDate.getMonth() + 1} - ${cycle.endDate.getDate()}/${cycle.endDate.getMonth() + 1}/${cycle.endDate.getFullYear()}`,
          startDate: cycle.startDate,
          endDate: cycle.endDate,
          dueDate: cycle.dueDate,
          isCurrent: cycle.isCurrentCycle,
          transactions: [],
          totalSpent: 0,
          totalCashback: 0,
        });
      }
      const group = map.get(key)!;
      group.transactions.push(tx);
      group.totalSpent += tx.amount;
      group.totalCashback += tx.cashbackAmount;
    }

    return Array.from(map.values()).sort(
      (a, b) => b.startDate.getTime() - a.startDate.getTime()
    );
  }, [displayedTransactions, selectedCycleOffset, cards]);

  const activeOption = cycleOptions.find((opt) => opt.offset === selectedCycleOffset) || cycleOptions[0];

  const handleDelete = (id: string) => {
    if (confirm("Bạn có chắc chắn muốn xóa giao dịch này không?")) {
      deleteTransaction(id);
      loadData();
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Banner & Quick Metrics */}
      <div className="border-b border-white/10 pb-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-300 text-xs font-bold border border-amber-500/20 mb-2">
          <ChartIcon className="w-3.5 h-3.5" /> Quản lý Tiến độ Kỳ sao kê & Hoàn tiền
        </div>
        <h1 className="text-2xl sm:text-4xl font-black text-white">Sổ tay Chi tiêu & Kỳ sao kê</h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Theo dõi chi tiêu và tiền hoàn tách biệt theo từng chu kỳ sao kê của thẻ tín dụng, tối ưu điểm thưởng và kiểm soát hạn mức hoàn tiền hàng tháng.
        </p>
      </div>

      {/* Statement Cycle & Filter Navigation Bar */}
      <div className="p-3 sm:p-4 rounded-3xl glass-panel border border-white/10 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 shadow-lg">
        {/* Cycle selector pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          <span className="text-xs font-bold text-slate-400 mr-1 flex items-center gap-1 shrink-0">
            <Calendar className="w-3.5 h-3.5 text-amber-400" /> Kỳ sao kê:
          </span>
          {cycleOptions.map((opt) => {
            const isSelected = selectedCycleOffset === opt.offset;
            return (
              <button
                key={String(opt.offset)}
                type="button"
                onClick={() => setSelectedCycleOffset(opt.offset)}
                className={`px-3 py-1.5 rounded-2xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 cursor-pointer ${
                  isSelected
                    ? "bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-md shadow-amber-500/20"
                    : "bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-white/10 hover:border-white/20"
                }`}
              >
                {opt.isCurrent && (
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      isSelected ? "bg-slate-950 animate-ping" : "bg-emerald-400"
                    }`}
                  />
                )}
                <span>{opt.label}</span>
                <span
                  className={`text-[10px] font-normal px-1.5 py-0.5 rounded-full ${
                    isSelected
                      ? "bg-slate-950/20 text-slate-950 font-semibold"
                      : "bg-white/5 text-slate-400"
                  }`}
                >
                  {opt.dateRange}
                </span>
              </button>
            );
          })}
        </div>

        {/* Card filter dropdown */}
        <div className="flex items-center gap-2 shrink-0">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            value={selectedCardFilter}
            onChange={(e) => setSelectedCardFilter(e.target.value)}
            className="w-full md:w-auto px-3 py-2 rounded-2xl bg-slate-900 border border-white/10 text-xs font-semibold text-white focus:outline-none focus:border-amber-400 cursor-pointer"
          >
            <option value="all">Tất cả các thẻ ({cards.length})</option>
            {cards.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
                {c.cardholderName ? ` [${c.cardholderName}]` : ""}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Overview Metric Cards (Divided Per Statement Cycle) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-3xl glass-panel border border-white/10 space-y-1 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
              <CardIcon className="w-4 h-4 text-slate-400" />
              {selectedCycleOffset === "all" ? "Tổng chi tiêu toàn thời gian" : `Chi tiêu ${activeOption.label}`}
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-white/10">
              {displayedTransactions.length} GD
            </span>
          </div>
          <span className="text-2xl sm:text-3xl font-black text-white block">
            {formatCurrencyVND(cycleTotalSpent)}
          </span>
          <span className="text-[11px] text-slate-500 block truncate">
            {selectedCycleOffset === "all" ? "Tổng hợp toàn bộ lịch sử chi tiêu" : activeOption.fullRange}
          </span>
        </div>

        <div className="p-5 rounded-3xl glass-panel border border-amber-500/30 space-y-1 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs text-amber-300 font-medium flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-400" />
              {selectedCycleOffset === "all" ? "Tổng tiền hoàn toàn thời gian" : `Tiền hoàn (Cashback) ${activeOption.label.toLowerCase()}`}
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
              {cycleAverageRate}% hoàn
            </span>
          </div>
          <span className="text-2xl sm:text-3xl font-black text-amber-400 block">
            +{formatCurrencyVND(cycleTotalCashback)}
          </span>
          <span className="text-[11px] text-emerald-400/90 font-medium block">
            Tỷ lệ sinh lời hoàn vốn: {cycleAverageRate}% trên tổng chi tiêu
          </span>
        </div>

        <div className="p-5 rounded-3xl glass-panel border border-white/10 space-y-1 relative overflow-hidden">
          <span className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-sky-400" />
            {selectedCardFilter !== "all" ? "Hạn mức hoàn tiền thẻ" : "Phạm vi thẻ theo dõi"}
          </span>
          {selectedCardFilter !== "all" && cards.find((c) => c.id === selectedCardFilter) ? (
            (() => {
              const currentCard = cards.find((c) => c.id === selectedCardFilter)!;
              const remaining = Math.max(0, currentCard.maxCashbackPerMonth - cycleTotalCashback);
              return (
                <>
                  <span className="text-2xl sm:text-3xl font-black text-sky-400 block">
                    {formatCurrencyVND(remaining)}
                  </span>
                  <span className="text-[11px] text-slate-400 block truncate">
                    Còn lại trước khi chạm trần ({formatCurrencyVND(currentCard.maxCashbackPerMonth)})
                  </span>
                </>
              );
            })()
          ) : (
            <>
              <span className="text-2xl sm:text-3xl font-black text-sky-400 block">
                {cards.length} Thẻ
              </span>
              <span className="text-[11px] text-slate-500 block">
                {cardsWithSpendCount} thẻ có giao dịch phát sinh trong kỳ này
              </span>
            </>
          )}
        </div>
      </div>

      {/* Statement Cycle Progress per Card (Multi-Column Grid) */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-amber-400" />
            <h3 className="text-lg font-bold text-white">
              Tiến độ chu kỳ sao kê từng thẻ ({cards.length})
            </h3>
          </div>
          <span className="text-xs text-amber-300/90 font-medium">
            Đang hiển thị dữ liệu: <b className="text-white">{activeOption.label} ({activeOption.dateRange})</b>
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {cardSummaries.map((summary) => (
            <StatementProgress key={summary.card.id} summary={summary} />
          ))}
        </div>
      </div>

      {/* Spending Distribution Chart & Filter */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 p-6 rounded-3xl glass-panel border border-white/10 space-y-4">
          <div>
            <h4 className="font-bold text-white text-base">Phân bổ chi tiêu danh mục</h4>
            <p className="text-xs text-slate-400">
              {selectedCycleOffset === "all" ? "Toàn bộ thời gian" : `Theo ${activeOption.label.toLowerCase()} (${activeOption.dateRange})`}
            </p>
          </div>
          <SpendingChart categoryData={chartData} />
        </div>

        {/* Transactions Table: Divided per statement cycle */}
        <div className="lg:col-span-2 p-6 rounded-3xl glass-panel border border-white/10 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
            <div>
              <h4 className="font-bold text-white text-base">Lịch sử giao dịch chi tiêu</h4>
              <p className="text-xs text-slate-400">
                {selectedCycleOffset === "all"
                  ? "Danh sách phân chia theo từng kỳ sao kê"
                  : `Giao dịch phát sinh trong ${activeOption.label.toLowerCase()} (${activeOption.dateRange})`}
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
              <span className="px-2.5 py-1 rounded-xl bg-slate-800 text-amber-300 font-bold border border-white/10">
                {displayedTransactions.length} giao dịch
              </span>
            </div>
          </div>

          {/* Render Table: Grouped by cycle when "all" is selected */}
          {selectedCycleOffset === "all" ? (
            groupedTransactions.length === 0 ? (
              <div className="text-center py-10 text-slate-500 text-sm">
                Chưa có giao dịch nào được ghi nhận cho bộ lọc này.
              </div>
            ) : (
              <div className="space-y-6">
                {groupedTransactions.map((group) => (
                  <div key={group.key} className="space-y-2 rounded-2xl bg-slate-950/40 border border-white/10 p-3 sm:p-4">
                    {/* Cycle Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-white/10">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-sm text-white flex items-center gap-1.5">
                          <Calendar className="w-4 h-4 text-amber-400" />
                          {group.label}
                        </span>
                        <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-white/10">
                          {group.shortRange}
                        </span>
                        {group.isCurrent ? (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            Kỳ hiện tại
                          </span>
                        ) : (
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-white/10">
                            Đã chốt sao kê
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-3 text-xs flex-wrap">
                        <span className="text-slate-400">
                          Chi tiêu: <b className="text-white">{formatCurrencyVND(group.totalSpent)}</b>
                        </span>
                        <span className="text-amber-400 font-bold">
                          Hoàn tiền: +{formatCurrencyVND(group.totalCashback)}
                        </span>
                        <span className="text-slate-500 text-[11px]">
                          ({group.transactions.length} GD)
                        </span>
                      </div>
                    </div>

                    {/* Table of transactions in this cycle */}
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs text-slate-300">
                        <tbody className="divide-y divide-white/5">
                          {group.transactions.map((tx) => {
                            const card = cards.find((c) => c.id === tx.cardId);
                            return (
                              <tr key={tx.id} className="hover:bg-white/5 transition-colors">
                                <td className="py-2.5 px-2 text-slate-400 whitespace-nowrap font-mono">
                                  {tx.transactionDate}
                                </td>
                                <td className="py-2.5 px-2">
                                  <div className="font-semibold text-white">
                                    {card?.name || tx.cardId}
                                    {card?.cardholderName && (
                                      <span className="text-[10px] text-emerald-400 font-medium ml-1.5">
                                        [{card.cardholderName}]
                                      </span>
                                    )}
                                  </div>
                                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">
                                    MCC {tx.mccCode}
                                  </span>
                                </td>
                                <td className="py-2.5 px-2">
                                  <div className="font-medium text-slate-200">{tx.mccName || "Giao dịch"}</div>
                                  {tx.note && <div className="text-[10px] text-slate-500">{tx.note}</div>}
                                </td>
                                <td className="py-2.5 px-2 text-right font-bold text-white whitespace-nowrap">
                                  {formatCurrencyVND(tx.amount)}
                                </td>
                                <td className="py-2.5 px-2 text-right whitespace-nowrap">
                                  <span className="font-bold text-emerald-400 block">
                                    +{formatCurrencyVND(tx.cashbackAmount)}
                                  </span>
                                  {(() => {
                                    const effectiveRate =
                                      tx.amount > 0
                                        ? Number(((tx.cashbackAmount / tx.amount) * 100).toFixed(2))
                                        : tx.cashbackRate || 0;
                                    return (
                                      <span className="text-[10px] text-amber-400/80 font-semibold">
                                        ({effectiveRate}%)
                                      </span>
                                    );
                                  })()}
                                </td>
                                <td className="py-2.5 px-2 text-center whitespace-nowrap">
                                  <div className="flex items-center justify-center gap-1.5">
                                    <button
                                      onClick={() => {
                                        setEditingTx(tx);
                                        setIsEditModalOpen(true);
                                      }}
                                      className="p-1 rounded-lg text-slate-400 hover:text-amber-300 hover:bg-amber-500/15 transition-colors cursor-pointer"
                                      title="Chỉnh sửa giao dịch"
                                    >
                                      <Edit3 className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      onClick={() => handleDelete(tx.id)}
                                      className="p-1 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/15 transition-colors cursor-pointer"
                                      title="Xóa giao dịch"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : (
            /* Single Cycle Table */
            displayedTransactions.length === 0 ? (
              <div className="text-center py-10 text-slate-500 text-sm space-y-2">
                <p>Chưa có giao dịch nào được ghi nhận trong {activeOption.label.toLowerCase()} ({activeOption.dateRange}).</p>
                <p className="text-xs text-slate-600">Các giao dịch phát sinh ngoài khoảng ngày này sẽ nằm ở kỳ sao kê tương ứng.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-900/80 text-slate-400 uppercase font-semibold text-[10px] border-b border-white/10">
                    <tr>
                      <th className="py-3 px-3">Ngày</th>
                      <th className="py-3 px-3">Thẻ & MCC</th>
                      <th className="py-3 px-3">Nội dung</th>
                      <th className="py-3 px-3 text-right">Số tiền</th>
                      <th className="py-3 px-3 text-right">Hoàn tiền</th>
                      <th className="py-3 px-3 text-center">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {displayedTransactions.map((tx) => {
                      const card = cards.find((c) => c.id === tx.cardId);
                      return (
                        <tr key={tx.id} className="hover:bg-white/5 transition-colors">
                          <td className="py-3 px-3 text-slate-400 whitespace-nowrap font-mono">
                            {tx.transactionDate}
                          </td>
                          <td className="py-3 px-3">
                            <div className="font-semibold text-white">
                              {card?.name || tx.cardId}
                              {card?.cardholderName && (
                                <span className="text-[10px] text-emerald-400 font-medium ml-1.5">
                                  [{card.cardholderName}]
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">
                              MCC {tx.mccCode}
                            </span>
                          </td>
                          <td className="py-3 px-3">
                            <div className="font-medium text-slate-200">{tx.mccName || "Giao dịch"}</div>
                            {tx.note && <div className="text-[10px] text-slate-500">{tx.note}</div>}
                          </td>
                          <td className="py-3 px-3 text-right font-bold text-white whitespace-nowrap">
                            {formatCurrencyVND(tx.amount)}
                          </td>
                          <td className="py-3 px-3 text-right whitespace-nowrap">
                            <span className="font-bold text-emerald-400 block">
                              +{formatCurrencyVND(tx.cashbackAmount)}
                            </span>
                            {(() => {
                              const effectiveRate =
                                tx.amount > 0
                                  ? Number(((tx.cashbackAmount / tx.amount) * 100).toFixed(2))
                                  : tx.cashbackRate || 0;
                              return (
                                <span className="text-[10px] text-amber-400/80 font-semibold">
                                  ({effectiveRate}%)
                                </span>
                              );
                            })()}
                          </td>
                          <td className="py-3 px-3 text-center whitespace-nowrap">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                onClick={() => {
                                  setEditingTx(tx);
                                  setIsEditModalOpen(true);
                                }}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-amber-300 hover:bg-amber-500/15 transition-colors cursor-pointer"
                                title="Chỉnh sửa giao dịch"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDelete(tx.id)}
                                className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/15 transition-colors cursor-pointer"
                                title="Xóa giao dịch"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )
          )}
        </div>
      </div>

      {/* Edit Transaction Modal */}
      <TransactionModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingTx(null);
        }}
        editingTransaction={editingTx}
        onSuccess={loadData}
      />
    </div>
  );
}
