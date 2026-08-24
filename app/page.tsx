"use client";

import { useState, useMemo, useEffect } from "react";
import MccSearchInput from "@/components/MccSearchInput";
import CardRecommendation from "@/components/CardRecommendation";
import { getMccByCode, ALL_MCC_ITEMS } from "@/lib/data/mcc-database";
import { getRecommendedCardsForMcc } from "@/lib/data/cards-database";
import { getStoredCards, getStoredTransactions, syncCardsFromSupabase, syncTransactionsFromSupabase } from "@/lib/storage";
import { MccItem, PreviousSpendTier, CreditCard, Transaction } from "@/types";
import { Sparkles, ShieldCheck, TrendingUp, ArrowRight, Award } from "lucide-react";
import Link from "next/link";

export default function HomePage() {
  const [cards, setCards] = useState<CreditCard[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  // Mặc định ban đầu để null (trống) để người dùng tự do gõ MCC hoặc chọn tính năng Online/Ngoại tệ
  const [selectedMcc, setSelectedMcc] = useState<MccItem | null>(null);
  const [isOnline, setIsOnline] = useState<boolean>(false);
  const [isForeign, setIsForeign] = useState<boolean>(false);
  const [isSavedCard, setIsSavedCard] = useState<boolean>(false);
  const [spendAmount, setSpendAmount] = useState<number>(2000000);
  const [previousSpendTier, setPreviousSpendTier] = useState<PreviousSpendTier>("tier1"); // Default: <= 50tr

  useEffect(() => {
    setCards(getStoredCards());
    setTransactions(getStoredTransactions());

    syncCardsFromSupabase().then((synced) => {
      if (synced) setCards(synced);
    });
    syncTransactionsFromSupabase().then((synced) => {
      if (synced) setTransactions(synced);
    });

    const handleCardsUpdate = () => setCards(getStoredCards());
    const handleTxUpdate = () => setTransactions(getStoredTransactions());

    window.addEventListener("cards_updated", handleCardsUpdate);
    window.addEventListener("transaction_updated", handleTxUpdate);

    return () => {
      window.removeEventListener("cards_updated", handleCardsUpdate);
      window.removeEventListener("transaction_updated", handleTxUpdate);
    };
  }, []);

  // Compute recommendations dynamically with previous statement spend tier and transactions limits
  const recommendations = useMemo(() => {
    return getRecommendedCardsForMcc(
      selectedMcc,
      {
        isOnline,
        isForeign,
        isSavedCard,
        amount: spendAmount,
        previousSpendTier,
      },
      cards.length > 0 ? cards : undefined,
      transactions.length > 0 ? transactions : undefined
    );
  }, [selectedMcc, isOnline, isForeign, isSavedCard, spendAmount, previousSpendTier, cards, transactions]);

  return (
    <div className="space-y-8">
      {/* Hero Banner */}
      <div className="text-center max-w-3xl mx-auto space-y-3 pt-2">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5" /> Tra cứu MCC Thông minh & Tối ưu Hoàn tiền
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
          Quẹt thẻ nào để{" "}
          <span className="bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-500 bg-clip-text text-transparent">
            Hoàn tiền cao nhất?
          </span>
        </h1>
        <p className="text-slate-300 text-sm sm:text-base font-normal max-w-2xl mx-auto">
          Tự động so sánh và tính toán tỷ lệ hoàn tiền/tích điểm tối ưu nhất cho các dòng thẻ tín dụng đa ngân hàng (VIB, Shinhan Bank, VPBank, Techcombank...).
        </p>
      </div>

      {/* Main Search Section */}
      <div className="max-w-3xl mx-auto">
        <MccSearchInput
          selectedMcc={selectedMcc}
          onSelectMcc={(item) => setSelectedMcc(item)}
          isOnline={isOnline}
          setIsOnline={setIsOnline}
          isForeign={isForeign}
          setIsForeign={setIsForeign}
          isSavedCard={isSavedCard}
          setIsSavedCard={setIsSavedCard}
          spendAmount={spendAmount}
          setSpendAmount={setSpendAmount}
          previousSpendTier={previousSpendTier}
          setPreviousSpendTier={setPreviousSpendTier}
        />
      </div>

      {/* Active Filter / MCC Badge Bar */}
      <div className="max-w-4xl mx-auto p-4 rounded-2xl bg-slate-900/80 border border-amber-500/20 glass-panel flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        {selectedMcc ? (
          <>
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 rounded-xl bg-amber-500/20 text-amber-300 font-mono font-black text-lg border border-amber-500/30 shrink-0">
                MCC {selectedMcc.code}
              </span>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-white text-base">{selectedMcc.name}</span>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-white/10">
                    {selectedMcc.category}
                  </span>
                  {isOnline && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/30">
                      🌐 Online
                    </span>
                  )}
                  {isForeign && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      💱 Ngoại tệ
                    </span>
                  )}
                  {isSavedCard && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                      🔖 Đã lưu thẻ
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400 mt-0.5">{selectedMcc.description}</p>
              </div>
            </div>
            {selectedMcc.popularBrands && selectedMcc.popularBrands.length > 0 && (
              <div className="text-xs text-slate-400 shrink-0">
                <span className="text-slate-500">Ví dụ: </span>
                <span className="text-slate-300 font-medium">{selectedMcc.popularBrands.slice(0, 3).join(", ")}</span>
              </div>
            )}
          </>
        ) : isOnline && isForeign ? (
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 rounded-xl bg-sky-500/20 text-sky-300 font-black text-sm border border-sky-500/30">
              🌐 💱 Online Ngoại tệ
            </span>
            <div>
              <span className="font-bold text-white text-base">Chi tiêu Trực tuyến Quốc tế / Ngoại tệ</span>
              <p className="text-xs text-slate-400">Tự động chọn thẻ hoàn tiền cao nhất cho giao dịch online bằng ngoại tệ (VIB Online Plus 5%, Super Card 15%...)</p>
            </div>
          </div>
        ) : isOnline ? (
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 rounded-xl bg-sky-500/20 text-sky-300 font-black text-sm border border-sky-500/30">
              🌐 Chi tiêu Online
            </span>
            <div>
              <span className="font-bold text-white text-base">Giao dịch Trực tuyến / Mua sắm Online</span>
              <p className="text-xs text-slate-400">Đang so sánh các thẻ có ưu đãi hoàn tiền cho chi tiêu Online (Shopee, Lazada, Tiki, Website/App...)</p>
            </div>
          </div>
        ) : isForeign ? (
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 rounded-xl bg-emerald-500/20 text-emerald-300 font-black text-sm border border-emerald-500/30">
              💱 Ngoại tệ / POS Nước ngoài
            </span>
            <div>
              <span className="font-bold text-white text-base">Chi tiêu Quốc tế / POS Nước ngoài</span>
              <p className="text-xs text-slate-400">Đang so sánh các thẻ hoàn tiền cao nhất cho giao dịch ngoại tệ hoặc quẹt thẻ tại nước ngoài</p>
            </div>
          </div>
        ) : isSavedCard ? (
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 rounded-xl bg-purple-500/20 text-purple-300 font-black text-sm border border-purple-500/30">
              🔖 Đã lưu thẻ
            </span>
            <div>
              <span className="font-bold text-white text-base">Giao dịch có Lưu thông tin Thẻ</span>
              <p className="text-xs text-slate-400">Hoàn tiền cố định cho các ứng dụng có lưu thẻ thanh toán (Grab, Spotify, Netflix, Agoda, Tiki...)</p>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 rounded-xl bg-slate-800 text-amber-300 font-black text-sm border border-white/10">
              💳 Tất cả các thẻ
            </span>
            <div>
              <span className="font-bold text-white text-base">So sánh Tỷ lệ hoàn tiền & Tích lũy cơ bản</span>
              <p className="text-xs text-slate-400">Nhập mã MCC hoặc chọn ô tính năng (Online, Ngoại tệ, Lưu thẻ) ở trên để nhận đề xuất tối ưu nhất</p>
            </div>
          </div>
        )}
      </div>

      {/* Recommendations Result */}
      <div className="max-w-4xl mx-auto">
        <CardRecommendation
          results={recommendations}
          spendAmount={spendAmount}
          selectedMccCode={selectedMcc?.code}
          selectedMccName={selectedMcc ? selectedMcc.name : isOnline ? "Chi tiêu Trực tuyến (Online)" : isForeign ? "Chi tiêu Ngoại tệ" : isSavedCard ? "Lưu thẻ" : undefined}
        />
      </div>

      {/* Features Quick Grid */}
      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-4 pt-6 border-t border-white/10">
        <div className="p-5 rounded-2xl glass-panel border border-white/5 space-y-2">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Award className="w-5 h-5" />
          </div>
          <h4 className="font-bold text-white text-sm">Chuẩn xác từng bậc chi tiêu</h4>
          <p className="text-xs text-slate-400">
            Tự động điều chỉnh tỷ lệ % hoàn tiền theo tổng chi tiêu kỳ liền trước của các dòng thẻ có điều kiện phân tầng.
          </p>
        </div>

        <div className="p-5 rounded-2xl glass-panel border border-white/5 space-y-2">
          <div className="w-10 h-10 rounded-xl bg-sky-500/20 border border-sky-500/30 flex items-center justify-center text-sky-400">
            <TrendingUp className="w-5 h-5" />
          </div>
          <h4 className="font-bold text-white text-sm">Quản lý trần danh mục & sao kê</h4>
          <p className="text-xs text-slate-400">
            Kiểm soát trần hoàn tiền theo từng ngành hàng và toàn chu kỳ, cảnh báo thông minh khi sắp chạm hạn mức.
          </p>
          <Link
            href="/tracker"
            className="text-xs text-sky-400 font-semibold inline-flex items-center gap-1 hover:underline pt-1"
          >
            Mở sổ tay chi tiêu <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="p-5 rounded-2xl glass-panel border border-white/5 space-y-2">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h4 className="font-bold text-white text-sm">Bảo mật & Đồng bộ Supabase</h4>
          <p className="text-xs text-slate-400">
            Dữ liệu được lưu trữ an toàn, hỗ trợ đồng bộ đám mây và xuất file JSON sao lưu bất kỳ lúc nào.
          </p>
        </div>
      </div>
    </div>
  );
}
