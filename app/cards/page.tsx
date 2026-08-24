"use client";

import { useState, useEffect } from "react";
import { getStoredCards, syncCardsFromSupabase, deleteCard } from "@/lib/storage";
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
  Plus,
  Copy,
  Edit,
  Trash2,
  User,
} from "lucide-react";
import TransactionModal from "@/components/TransactionModal";
import CardModal from "@/components/CardModal";

export default function CardsPage() {
  const [cards, setCards] = useState<CreditCard[]>([]);
  const [expandedCardId, setExpandedCardId] = useState<string | null>(null);
  const [activeTxCard, setActiveTxCard] = useState<CreditCard | null>(null);

  // Card Modal state
  const [isCardModalOpen, setIsCardModalOpen] = useState(false);
  const [cardModalMode, setCardModalMode] = useState<"create" | "duplicate" | "edit">("create");
  const [cardModalTarget, setCardModalTarget] = useState<CreditCard | null>(null);

  useEffect(() => {
    const loaded = getStoredCards();
    setCards(loaded);
    if (loaded.length > 0) {
      setExpandedCardId(loaded[0].id);
    }

    // Try syncing from Supabase if connected
    syncCardsFromSupabase().then((synced) => {
      if (synced) setCards(synced);
    });

    const handleUpdate = () => {
      setCards(getStoredCards());
    };
    window.addEventListener("cards_updated", handleUpdate);
    return () => window.removeEventListener("cards_updated", handleUpdate);
  }, []);

  const toggleExpand = (id: string) => {
    setExpandedCardId(expandedCardId === id ? null : id);
  };

  const handleOpenCreate = () => {
    setCardModalMode("create");
    setCardModalTarget(null);
    setIsCardModalOpen(true);
  };

  const handleOpenDuplicate = (card: CreditCard) => {
    setCardModalMode("duplicate");
    setCardModalTarget(card);
    setIsCardModalOpen(true);
  };

  const handleOpenEdit = (card: CreditCard) => {
    setCardModalMode("edit");
    setCardModalTarget(card);
    setIsCardModalOpen(true);
  };

  const handleDeleteCard = (card: CreditCard) => {
    if (confirm(`Bạn có chắc chắn muốn xóa thẻ "${card.name}${card.cardholderName ? ` (${card.cardholderName})` : ""}" khỏi danh mục quản lý không?`)) {
      const updated = deleteCard(card.id);
      setCards(updated);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="border-b border-white/10 pb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-300 text-xs font-bold border border-amber-500/20 mb-2">
            <Layers className="w-3.5 h-3.5" /> Quản lý Danh mục Thẻ Tín Dụng & Chính sách Hoàn tiền
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-white">Chính sách & Danh mục Thẻ</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Theo dõi tỷ lệ hoàn tiền, hạn mức kỳ & danh mục, quy tắc MCC và dễ dàng thêm thẻ mới / nhân bản thẻ cùng dòng khác chủ thẻ.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-sm shadow-xl shadow-amber-500/25 transition-all hover:scale-[1.03] shrink-0"
        >
          <Plus className="w-5 h-5" />
          Thêm thẻ tín dụng mới
        </button>
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
                      {card.cardholderName && (
                        <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30 flex items-center gap-1">
                          <User className="w-3 h-3" /> Chủ thẻ: {card.cardholderName}
                        </span>
                      )}
                      {card.isCustom && (
                        <span className="text-[11px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-semibold border border-purple-500/30">
                          Thẻ tùy chỉnh
                        </span>
                      )}
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
                      {card.features.map((feat, idx) => {
                        const maxRuleRate = Math.max(...card.rules.map((r) => r.cashbackRate), card.defaultCashbackRate);
                        const displayFeat = feat.replace(/Hoàn tiền \d+% cho danh mục/gi, `Hoàn tiền ${maxRuleRate}% cho danh mục`);
                        return (
                          <div key={idx} className="flex items-center gap-2 text-xs text-slate-300">
                            <CheckCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                            <span>{displayFeat}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Actions Grid */}
                <div className="flex flex-wrap lg:flex-col items-start lg:items-end justify-between w-full lg:w-auto gap-2.5 shrink-0">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setActiveTxCard(card)}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition-all hover:scale-[1.02]"
                    >
                      <PlusCircle className="w-4 h-4" />
                      Quẹt thẻ
                    </button>

                    <button
                      onClick={() => handleOpenDuplicate(card)}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 font-bold text-xs border border-sky-500/30 transition-all"
                      title="Tạo thêm 1 thẻ cùng dòng cho người khác đứng tên"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      Nhân bản (Khác chủ thẻ)
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleOpenEdit(card)}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-white/5 transition-colors"
                      title="Chỉnh sửa thông tin thẻ"
                    >
                      <Edit className="w-3.5 h-3.5 text-slate-400" />
                      Sửa
                    </button>

                    <button
                      onClick={() => handleDeleteCard(card)}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-rose-950/50 hover:text-rose-300 text-slate-400 text-xs font-semibold border border-white/5 transition-colors"
                      title="Xóa thẻ khỏi danh mục"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                      Xóa
                    </button>

                    <button
                      onClick={() => toggleExpand(card.id)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-white/5 transition-colors"
                    >
                      <span>{isExpanded ? "Thu gọn" : `MCC (${card.rules.length})`}</span>
                      {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>
                  </div>
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
                    {card.rules.map((rule, rIdx) => {
                      const displayNote = rule.note
                        ? rule.note.replace(/Hoàn \d+(\.\d+)?%/gi, `Hoàn ${rule.cashbackRate}%`)
                        : `Hoàn ${rule.cashbackRate}% cho danh mục ${rule.category}`;

                      return (
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

                          {displayNote && (
                            <p className="text-xs text-slate-400 flex items-start gap-1">
                              <Info className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                              <span>{displayNote}</span>
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
                    );
                  })}
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

      {/* Card Management Modal (Create / Duplicate / Edit) */}
      <CardModal
        isOpen={isCardModalOpen}
        onClose={() => {
          setIsCardModalOpen(false);
          setCardModalTarget(null);
        }}
        initialMode={cardModalMode}
        initialCard={cardModalTarget}
        onSuccess={() => {
          setCards(getStoredCards());
        }}
      />
    </div>
  );
}
