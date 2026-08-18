"use client";

import { useState, useEffect, useMemo } from "react";
import {
  getStoredTransactions,
  getStoredCards,
  deleteTransaction,
} from "@/lib/storage";
import { calculateStatementCycle, isDateInCycle, formatCurrencyVND } from "@/lib/statement-helper";
import { Transaction, CreditCard, CardSpendingSummary } from "@/types";
import StatementProgress from "@/components/StatementProgress";
import SpendingChart from "@/components/SpendingChart";
import TransactionModal from "@/components/TransactionModal";
import {
  PlusCircle,
  Trash2,
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
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const loadData = () => {
    setCards(getStoredCards());
    setTransactions(getStoredTransactions());
  };

  useEffect(() => {
    loadData();

    const handleUpdate = () => loadData();
    window.addEventListener("transaction_updated", handleUpdate);
    return () => window.removeEventListener("transaction_updated", handleUpdate);
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

      // Category breakdown
      const categoryBreakdown: { [category: string]: { spent: number; cashback: number } } = {};
      for (const tx of cycleTransactions) {
        const cat = tx.mccName || `Mã ${tx.mccCode}`;
        if (!categoryBreakdown[cat]) {
          categoryBreakdown[cat] = { spent: 0, cashback: 0 };
        }
        categoryBreakdown[cat].spent += tx.amount;
        categoryBreakdown[cat].cashback += tx.cashbackAmount;
      }

      return {
        card,
        cycleInfo,
        totalSpent,
        totalCashback,
        maxCashback,
        cashbackPercentage,
        isCapReached,
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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-300 text-xs font-bold border border-amber-500/20 mb-2">
            <ChartIcon className="w-3.5 h-3.5" /> Quản lý Tiến độ Kỳ sao kê & Hoàn tiền
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-white">Sổ tay Chi tiêu & Kỳ sao kê</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Theo dõi chi tiêu theo chu kỳ ngày chốt của từng thẻ, đảm bảo tối đa hóa mức hoàn tiền không vượt trần.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-sm shadow-lg shadow-amber-500/25 transition-all hover:scale-[1.02]"
          >
            <PlusCircle className="w-4 h-4" />
            Ghi nhận chi tiêu mới
          </button>
        </div>
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

      {/* Statement Cycle Progress per Card */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Calendar className="w-5 h-5 text-amber-400" />
            Tiến độ hoàn tiền theo chu kỳ sao kê từng thẻ
          </h3>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
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
                    {c.name}
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
                    <th className="py-3 px-2 text-center">Xóa</th>
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
                          <div className="font-semibold text-white">{card?.name || tx.cardId}</div>
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
                          <span className="text-[10px] text-amber-400/80 font-semibold">
                            ({tx.cashbackRate}%)
                          </span>
                        </td>
                        <td className="py-3 px-2 text-center">
                          <button
                            onClick={() => handleDelete(tx.id)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                            title="Xóa giao dịch"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
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

      {/* Transaction Modal */}
      {isModalOpen && (
        <TransactionModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSuccess={() => {
            setIsModalOpen(false);
            loadData();
          }}
        />
      )}
    </div>
  );
}
