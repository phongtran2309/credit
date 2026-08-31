"use client";

import { useState, useEffect, useRef } from "react";
import { getStoredCards, syncCardsFromSupabase, deleteCard } from "@/lib/storage";
import { CreditCard } from "@/types";
import CreditCardVisual from "@/components/CreditCardVisual";
import { formatCurrencyVND } from "@/lib/statement-helper";
import {
  Layers,
  CheckCircle,
  Tag,
  Info,
  Calendar,
  DollarSign,
  Plus,
  Copy,
  Edit,
  Trash2,
  User,
  MoreVertical,
  BookOpen,
  X,
  Sparkles,
} from "lucide-react";
import CardModal from "@/components/CardModal";

export default function CardsPage() {
  const [cards, setCards] = useState<CreditCard[]>([]);
  const [mccModalCard, setMccModalCard] = useState<CreditCard | null>(null);
  const [openActionId, setOpenActionId] = useState<string | null>(null);

  // Card Modal state
  const [isCardModalOpen, setIsCardModalOpen] = useState(false);
  const [cardModalMode, setCardModalMode] = useState<"create" | "duplicate" | "edit">("create");
  const [cardModalTarget, setCardModalTarget] = useState<CreditCard | null>(null);

  // Close action dropdown on outside click
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const loaded = getStoredCards();
    setCards(loaded);

    // Tắt tự động mở rộng thẻ đầu tiên - mặc định đóng hết
    // Try syncing from Supabase if connected
    syncCardsFromSupabase().then((synced) => {
      if (synced) setCards(synced);
    });

    const handleUpdate = () => {
      setCards(getStoredCards());
    };
    window.addEventListener("cards_updated", handleUpdate);

    const handleOutsideClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpenActionId(null);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      window.removeEventListener("cards_updated", handleUpdate);
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  const handleOpenCreate = () => {
    setCardModalMode("create");
    setCardModalTarget(null);
    setIsCardModalOpen(true);
  };

  const handleOpenDuplicate = (card: CreditCard) => {
    setOpenActionId(null);
    setCardModalMode("duplicate");
    setCardModalTarget(card);
    setIsCardModalOpen(true);
  };

  const handleOpenEdit = (card: CreditCard) => {
    setOpenActionId(null);
    setCardModalMode("edit");
    setCardModalTarget(card);
    setIsCardModalOpen(true);
  };

  const handleDeleteCard = (card: CreditCard) => {
    setOpenActionId(null);
    if (
      confirm(
        `Bạn có chắc chắn muốn xóa thẻ "${card.name}${
          card.cardholderName ? ` (${card.cardholderName})` : ""
        }" khỏi danh mục quản lý không?`
      )
    ) {
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
          <h1 className="text-2xl sm:text-4xl font-black text-white">
            Chính sách & Danh mục Thẻ ({cards.length})
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Theo dõi tỷ lệ hoàn tiền, hạn mức kỳ & danh mục, quy tắc MCC và quản lý nhiều thẻ tín dụng của bạn.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-sm shadow-xl shadow-amber-500/25 transition-all hover:scale-[1.03] shrink-0 cursor-pointer"
        >
          <Plus className="w-5 h-5" />
          Thêm thẻ tín dụng mới
        </button>
      </div>

      {/* Cards Grid (Modern Multi-Column Grid) */}
      <div ref={dropdownRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {cards.map((card) => {
          const isActionOpen = openActionId === card.id;
          const maxRuleRate = Math.max(
            ...card.rules.map((r) => r.cashbackRate),
            card.defaultCashbackRate
          );

          return (
            <div
              key={card.id}
              className="rounded-3xl glass-panel border border-white/10 p-5 flex flex-col justify-between space-y-4 transition-all hover:border-amber-500/40 relative group"
            >
              {/* Top: Visual Mockup */}
              <div className="space-y-3">
                <div className="w-full">
                  <CreditCardVisual card={card} compact />
                </div>

                {/* Card Title & Holder */}
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-extrabold text-white text-base line-clamp-1">
                      {card.name}
                    </h3>
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30 shrink-0">
                      {card.bank}
                    </span>
                  </div>

                  {card.cardholderName ? (
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30 inline-flex items-center gap-1 mt-1">
                      <User className="w-3 h-3" /> {card.cardholderName}
                    </span>
                  ) : (
                    <span className="text-[11px] text-slate-500 italic block mt-1">
                      Chưa đặt chủ thẻ
                    </span>
                  )}
                </div>

                {/* Key Metrics Snippet */}
                <div className="p-3 rounded-2xl bg-slate-950/60 border border-white/5 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-amber-400" /> Ngày chốt:
                    </span>
                    <span className="font-semibold text-slate-200">
                      {card.statementDay} hàng tháng
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-slate-400">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-sky-400" /> Hạn thanh toán:
                    </span>
                    <span className="font-semibold text-sky-300">
                      Ngày {card.dueDay}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-slate-300 pt-1 border-t border-white/5">
                    <span className="flex items-center gap-1">
                      <DollarSign className="w-3.5 h-3.5 text-emerald-400" /> Trần hoàn kỳ:
                    </span>
                    <span className="font-extrabold text-amber-300">
                      {formatCurrencyVND(card.maxCashbackPerMonth)}
                    </span>
                  </div>

                  {card.maxCashbackPerCategory && (
                    <div className="flex items-center justify-between text-slate-400 text-[11px]">
                      <span>Max/danh mục:</span>
                      <span className="text-slate-300 font-medium">
                        {formatCurrencyVND(card.maxCashbackPerCategory)}
                      </span>
                    </div>
                  )}
                </div>

                {/* Features (Compact 2 bullets) */}
                <div className="space-y-1 text-xs text-slate-300">
                  {card.features.slice(0, 2).map((feat, idx) => {
                    const displayFeat = feat.replace(
                      /Hoàn tiền \d+% cho danh mục/gi,
                      `Hoàn tiền ${maxRuleRate}% cho danh mục`
                    );
                    return (
                      <div key={idx} className="flex items-start gap-1.5 text-[11px] text-slate-400">
                        <CheckCircle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                        <span className="line-clamp-1">{displayFeat}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Bottom Actions Bar */}
              <div className="pt-3 border-t border-white/10 flex items-center justify-between gap-2 relative">
                {/* Nút Xem MCC */}
                <button
                  type="button"
                  onClick={() => setMccModalCard(card)}
                  className="flex-1 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-bold border border-white/10 hover:border-amber-500/40 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Xem MCC ({card.rules.length})</span>
                </button>

                {/* Nút Action 3 chấm (Dropdown) */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setOpenActionId(isActionOpen ? null : card.id);
                    }}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-white/10 transition-colors cursor-pointer"
                    title="Tùy chọn thao tác"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>

                  {/* Dropdown Menu (3 actions: Edit / Duplicate / Delete) */}
                  {isActionOpen && (
                    <div className="absolute right-0 bottom-full mb-2 w-48 rounded-2xl bg-slate-900 border border-white/15 shadow-2xl p-1.5 z-30 space-y-1 animate-in fade-in zoom-in-95 duration-150">
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(card)}
                        className="w-full px-3 py-2 rounded-xl text-left text-xs font-semibold text-slate-200 hover:bg-white/10 flex items-center gap-2 transition-colors cursor-pointer"
                      >
                        <Edit className="w-3.5 h-3.5 text-sky-400" />
                        <span>Chỉnh sửa thông tin</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleOpenDuplicate(card)}
                        className="w-full px-3 py-2 rounded-xl text-left text-xs font-semibold text-slate-200 hover:bg-white/10 flex items-center gap-2 transition-colors cursor-pointer"
                      >
                        <Copy className="w-3.5 h-3.5 text-amber-400" />
                        <span>Nhân bản (Khác chủ thẻ)</span>
                      </button>

                      <div className="border-t border-white/10 my-1" />

                      <button
                        type="button"
                        onClick={() => handleDeleteCard(card)}
                        className="w-full px-3 py-2 rounded-xl text-left text-xs font-semibold text-rose-400 hover:bg-rose-500/10 flex items-center gap-2 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Xóa thẻ này</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Xem Danh Mục MCC Chi Tiết */}
      {mccModalCard && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-white/15 rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto relative">
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                    {mccModalCard.bank}
                  </span>
                  <h3 className="text-xl font-extrabold text-white">
                    {mccModalCard.name}
                  </h3>
                </div>
                <p className="text-xs text-slate-400">
                  Quy tắc hoàn tiền & danh sách mã danh mục MCC được áp dụng
                </p>
              </div>

              <button
                type="button"
                onClick={() => setMccModalCard(null)}
                className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Rules List */}
            <div className="space-y-4">
              {mccModalCard.rules.map((rule, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl bg-slate-950/80 border border-white/10 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-sm">
                      {rule.category}
                    </span>
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
                          ≤50Tr:{" "}
                          <strong className="text-amber-400 font-bold">
                            {rule.tierRates.tier1}%
                          </strong>
                        </div>
                        <div className="p-1.5 rounded-lg bg-slate-800 text-slate-300">
                          50-100Tr:{" "}
                          <strong className="text-amber-400 font-bold">
                            {rule.tierRates.tier2}%
                          </strong>
                        </div>
                        <div className="p-1.5 rounded-lg bg-slate-800 text-slate-300">
                          &gt;100Tr:{" "}
                          <strong className="text-amber-400 font-bold">
                            {rule.tierRates.tier3}%
                          </strong>
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
                      <div className="flex flex-wrap gap-1 max-h-36 overflow-y-auto pr-1">
                        {rule.mccCodes.map((code) => (
                          <span
                            key={code}
                            className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-slate-800 text-slate-200 border border-white/5 hover:border-amber-500/40"
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

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setMccModalCard(null)}
                className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold border border-white/10 transition-colors"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
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
