"use client";

import { useState, useEffect, useMemo } from "react";
import {
  getStoredTransactions,
  getStoredCards,
  deleteTransaction,
  syncCardsFromSupabase,
} from "@/lib/storage";
import { calculateStatementCycle, isDateInCycle, formatCurrencyVND } from "@/lib/statement-helper";
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
} from "lucide-react";

export default function TrackerPage() {
  const [cards, setCards] = useState<CreditCard[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [selectedCardFilter, setSelectedCardFilter] = useState<string>("all");
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);

  const loadData = () => {
    setCards(getStoredCards());
    setTransactions(getStoredTransactions());
  };

  useEffect(() => {
    loadData();

    // Try syncing from Supabase if connected
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

  // Compute spending summary per card for the current statement cycle
  const cardSummaries: CardSpendingSummary[] = useMemo(() => {
    return cards.map((card) => {
      const cycleInfo = calculateStatementCycle(card.statementDay, card.dueDay);
      const cycleTransactions = transactions.filter(
        (tx) => tx.cardId === card.id && isDateInCycle(tx.transactionDate, cycleInfo)
      );

      const totalSpent = cycleTransactions.reduce((sum, tx) => sum + tx.amount, 0);
      const totalCashback = cycleTransactions.reduce((sum, tx) => sum + tx.cashbackAmount, 0);
      const maxCashback = card.maxCashbackPerMonth;
      const isCapReached = totalCashback >= maxCashback;
      const cashbackPercentage = maxCashback > 0 ? (totalCashback / maxCashback) * 100 : 0;

      // Optimal Spend Target (Default fallback to 16tr for Cash Back, 20tr for Family Link if defined, or calculated)
      const optimalSpentTarget = card.optimalMonthlySpend || (card.maxCashbackPerMonth / (card.defaultCashbackRate / 100));
      const isOptimalSpendReached = totalSpent >= optimalSpentTarget || isCapReached;
      const spendProgressPercentage = Math.min(100, Math.round((totalSpent / optimalSpentTarget) * 100));

      // Category breakdown
      const categoryBreakdown: CardSpendingSummary["categoryBreakdown"] = {};
      for (const tx of cycleTransactions) {
        const cat = tx.mccName || `Mã ${tx.mccCode}`;
        if (!categoryBreakdown[cat]) {
          const optCatSpend = card.categoryOptimalSpend?.[cat] || (card.maxCashbackPerCategory ? (card.maxCashbackPerCategory / 0.05) : undefined);
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

      // Check cap and optimal spend status per category
      for (const cat in categoryBreakdown) {
        const item = categoryBreakdown[cat];
        if (item.maxCategoryCashback && item.cashback >= item.maxCategoryCashback) {
          item.isCapReached = true;
        }
        if (item.optimalCategorySpend && item.spent >= item.optimalCategorySpend) {
          item.isOptimalCategorySpendReached = true;
        }
        if (item.optimalCategorySpend && item.optimalCategorySpend > 0) {
          item.categorySpendProgressPercentage = Math.min(100, Math.round((item.spent / item.optimalCategorySpend) * 100));
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
  }, [cards, transactions]);

  // Filtered transactions for the table
  const displayedTransactions = useMemo(() => {
    if (selectedCardFilter === "all") return transactions;
    return transactions.filter((tx) => tx.cardId === selectedCardFilter);
  }, [transactions, selectedCardFilter]);

  // Data for chart
  const chartData = useMemo(() => {
    const agg: Record<string, { spent: number; cashback: number }> = {};

    const activeList =
      selectedCardFilter === "all"
        ? transactions
        : transactions.filter((tx) => tx.cardId === selectedCardFilter);

    for (const tx of activeList) {
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
  }, [transactions, selectedCardFilter]);

  // Overall totals across all cards
  const grandTotalSpent = transactions.reduce((sum, tx) => sum + tx.amount, 0);
  const grandTotalCashback = transactions.reduce((sum, tx) => sum + tx.cashbackAmount, 0);

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
          Theo dõi chi tiêu theo chu kỳ ngày chốt sao kê của từng thẻ tín dụng (VIB, Shinhan Bank...), đảm bảo tối đa hóa mức hoàn tiền/điểm thưởng và không vượt trần.
        </p>
      </div>

      {/* Overview Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-3xl glass-panel border border-white/10 space-y-1">
          <span className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
            <CardIcon className="w-4 h-4 text-slate-400" /> Tổng chi tiêu đã ghi nhận
          </span>
          <span className="text-2xl sm:text-3xl font-black text-white block">
            {formatCurrencyVND(grandTotalSpent)}
          </span>
          <span className="text-[11px] text-slate-500 block">Tổng hợp từ {transactions.length} giao dịch</span>
        </div>

        <div className="p-5 rounded-3xl glass-panel border border-amber-500/30 space-y-1">
          <span className="text-xs text-amber-300 font-medium flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-amber-400" /> Tổng tiền hoàn (Cashback)
          </span>
          <span className="text-2xl sm:text-3xl font-black text-amber-400 block">
            +{formatCurrencyVND(grandTotalCashback)}
          </span>
          <span className="text-[11px] text-emerald-400/90 font-medium block">
            Tỷ lệ sinh lời hoàn vốn bình quân: {grandTotalSpent > 0 ? ((grandTotalCashback / grandTotalSpent) * 100).toFixed(1) : 0}%
          </span>
        </div>

        <div className="p-5 rounded-3xl glass-panel border border-white/10 space-y-1">
          <span className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-sky-400" /> Số lượng thẻ đang quản lý
          </span>
          <span className="text-2xl sm:text-3xl font-black text-sky-400 block">
            {cards.length} Thẻ
          </span>
          <span className="text-[11px] text-slate-500 block">Dữ liệu theo danh mục thẻ VIB</span>
        </div>
      </div>

      {/* Statement Cycle Progress per Card (Multi-Column Grid) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Calendar className="w-5 h-5 text-amber-400" />
            Tiến độ hoàn tiền theo chu kỳ sao kê từng thẻ ({cards.length})
          </h3>
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
            <p className="text-xs text-slate-400">Top các nhóm chi tiêu nhiều nhất</p>
          </div>
          <SpendingChart categoryData={chartData} />
        </div>

        {/* Transactions Table */}
        <div className="lg:col-span-2 p-6 rounded-3xl glass-panel border border-white/10 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
            <div>
              <h4 className="font-bold text-white text-base">Lịch sử giao dịch chi tiêu</h4>
              <p className="text-xs text-slate-400">Danh sách các giao dịch được tính cashback</p>
            </div>

            {/* Filter by card */}
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-400" />
              <select
                value={selectedCardFilter}
                onChange={(e) => setSelectedCardFilter(e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-slate-800 border border-white/10 text-xs text-slate-200 focus:outline-none focus:border-amber-400"
              >
                <option value="all">Tất cả các thẻ ({transactions.length})</option>
                {cards.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}{c.cardholderName ? ` [${c.cardholderName}]` : ""}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Table */}
          {displayedTransactions.length === 0 ? (
            <div className="text-center py-10 text-slate-500 text-sm">
              Chưa có giao dịch nào được ghi nhận cho bộ lọc này.
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
                            const rate =
                              tx.cashbackRate > 0
                                ? tx.cashbackRate
                                : tx.amount > 0 && tx.cashbackAmount > 0
                                ? Number(((tx.cashbackAmount / tx.amount) * 100).toFixed(2))
                                : 0;
                            return (
                              <span className="text-[10px] text-amber-400/80 font-semibold">
                                ({rate}%)
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
                              className="p-1.5 rounded-lg text-slate-400 hover:text-amber-300 hover:bg-amber-500/15 transition-colors"
                              title="Chỉnh sửa giao dịch"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDelete(tx.id)}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/15 transition-colors"
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
