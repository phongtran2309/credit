"use client";

import { useState, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import {
  X,
  CreditCard as CardIcon,
  Plus,
  Trash2,
  Copy,
  Sparkles,
  Check,
  Calendar,
  DollarSign,
  Palette,
  Shield,
  Layers,
  HelpCircle,
} from "lucide-react";
import { CreditCard, CashbackRule } from "@/types";
import { addCard, updateCard, duplicateCard, getStoredCards } from "@/lib/storage";
import CreditCardVisual from "./CreditCardVisual";
import { formatCurrencyVND } from "@/lib/statement-helper";

interface CardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (card: CreditCard) => void;
  initialMode?: "create" | "duplicate" | "edit";
  initialCard?: CreditCard | null;
}

const COLOR_PRESETS = [
  {
    name: "Huyền bí Vàng Đen (Black Gold)",
    from: "from-zinc-900",
    to: "to-neutral-950",
    text: "text-amber-300",
    accent: "bg-amber-400",
    border: "border-amber-500/30",
  },
  {
    name: "Xanh Navy Hoàng Gia (Royal Navy)",
    from: "from-blue-900",
    to: "to-slate-950",
    text: "text-sky-300",
    accent: "bg-sky-400",
    border: "border-sky-500/40",
  },
  {
    name: "Xanh Ngọc Bảo Lộc (Emerald Luxury)",
    from: "from-emerald-800",
    to: "to-teal-950",
    text: "text-emerald-300",
    accent: "bg-emerald-400",
    border: "border-emerald-500/30",
  },
  {
    name: "Tím Thạch Anh (Purple Velvet)",
    from: "from-purple-900",
    to: "to-indigo-950",
    text: "text-purple-300",
    accent: "bg-purple-400",
    border: "border-purple-500/30",
  },
  {
    name: "Đỏ Ruby Quyền Lực (Ruby Red)",
    from: "from-rose-900",
    to: "to-red-950",
    text: "text-rose-300",
    accent: "bg-rose-400",
    border: "border-rose-500/30",
  },
  {
    name: "Cam Ánh Dương (Sunrise Orange)",
    from: "from-amber-600",
    to: "to-orange-950",
    text: "text-amber-200",
    accent: "bg-amber-400",
    border: "border-amber-400/30",
  },
  {
    name: "Xám Titanium (Titanium Grey)",
    from: "from-slate-700",
    to: "to-zinc-900",
    text: "text-slate-200",
    accent: "bg-slate-400",
    border: "border-slate-500/30",
  },
];

const COMMON_CATEGORIES = [
  "Ẩm thực",
  "Mua sắm",
  "Du lịch",
  "Thương mại điện tử",
  "Dịch vụ Marketing/Quảng cáo",
  "Giáo dục",
  "Y tế",
  "Bảo hiểm",
  "Điện máy",
  "Nhà sách",
  "Giải trí",
  "Giao dịch trực tuyến",
  "Giao dịch nước ngoài",
  "Chi tiêu thông thường",
];

export default function CardModal({
  isOpen,
  onClose,
  onSuccess,
  initialMode = "create",
  initialCard = null,
}: CardModalProps) {
  const [mode, setMode] = useState<"create" | "duplicate" | "edit">(initialMode);
  const [existingCards, setExistingCards] = useState<CreditCard[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Duplicate mode states
  const [cloneSourceId, setCloneSourceId] = useState<string>("");
  const [duplicateCardholder, setDuplicateCardholder] = useState<string>("");
  const [duplicateStatementDay, setDuplicateStatementDay] = useState<number>(20);
  const [duplicateDueDay, setDuplicateDueDay] = useState<number>(5);

  // Custom / Edit Form states
  const [cardId, setCardId] = useState<string>("");
  const [bank, setBank] = useState<string>("VPBank");
  const [name, setName] = useState<string>("");
  const [cardholderName, setCardholderName] = useState<string>("");
  const [cardType, setCardType] = useState<string>("Mastercard Platinum");
  const [statementDay, setStatementDay] = useState<number>(20);
  const [dueDay, setDueDay] = useState<number>(5);
  const [annualFee, setAnnualFee] = useState<number | "">(0);
  const [maxCashbackPerMonth, setMaxCashbackPerMonth] = useState<number | "">(1000000);
  const [maxCashbackPerCategory, setMaxCashbackPerCategory] = useState<number | "">("");
  const [defaultCashbackRate, setDefaultCashbackRate] = useState<number>(0.1);
  const [colorPresetIndex, setColorPresetIndex] = useState<number>(0);
  const [imageUrl, setImageUrl] = useState<string>("");
  const [featuresText, setFeaturesText] = useState<string>("");
  const [rules, setRules] = useState<CashbackRule[]>([]);

  useEffect(() => {
    const loaded = getStoredCards();
    setExistingCards(loaded);
    if (loaded.length > 0 && !cloneSourceId) {
      setCloneSourceId(loaded[0].id);
    }
  }, [cloneSourceId]);

  useEffect(() => {
    setMode(initialMode);
    if (initialMode === "duplicate" && initialCard) {
      setCloneSourceId(initialCard.id);
      setDuplicateCardholder(initialCard.cardholderName ? `${initialCard.cardholderName} (2)` : "Chủ thẻ 2");
      setDuplicateStatementDay(initialCard.statementDay);
      setDuplicateDueDay(initialCard.dueDay);
    } else if (initialMode === "edit" && initialCard) {
      setCardId(initialCard.id);
      setBank(initialCard.bank);
      setName(initialCard.name);
      setCardholderName(initialCard.cardholderName || "");
      setCardType(initialCard.cardType || "Visa Platinum");
      setStatementDay(initialCard.statementDay);
      setDueDay(initialCard.dueDay);
      setAnnualFee(initialCard.annualFee || 0);
      setMaxCashbackPerMonth(initialCard.maxCashbackPerMonth || 1000000);
      setMaxCashbackPerCategory(initialCard.maxCashbackPerCategory || "");
      setDefaultCashbackRate(initialCard.defaultCashbackRate || 0.1);
      setImageUrl(initialCard.imageUrl || "");
      setFeaturesText((initialCard.features || []).join("\n"));
      setRules(initialCard.rules || []);

      // Try matching color gradient
      const matchedIdx = COLOR_PRESETS.findIndex(
        (p) => p.from === initialCard.colorGradient?.from && p.to === initialCard.colorGradient?.to
      );
      setColorPresetIndex(matchedIdx >= 0 ? matchedIdx : 0);
    } else {
      // New card reset
      setCardId(`card-${Date.now()}`);
      setBank("VPBank");
      setName("");
      setCardholderName("");
      setCardType("Mastercard Platinum");
      setStatementDay(20);
      setDueDay(5);
      setAnnualFee(0);
      setMaxCashbackPerMonth(1000000);
      setMaxCashbackPerCategory("");
      setDefaultCashbackRate(0.1);
      setImageUrl("");
      setFeaturesText("Hoàn tiền theo danh mục chi tiêu");
      setRules([
        {
          cardId: `card-${Date.now()}`,
          category: "Ẩm thực",
          cashbackRate: 10.0,
          note: "Hoàn 10% Ẩm thực, Nhà hàng, Quán ăn",
        },
      ]);
    }
  }, [initialMode, initialCard, isOpen]);

  // Live preview card object
  const previewCard: CreditCard = useMemo(() => {
    if (mode === "duplicate") {
      const source = existingCards.find((c) => c.id === cloneSourceId) || existingCards[0];
      if (!source) {
        return {
          id: "preview-card",
          name: "Thẻ nhân bản",
          bank: "Ngân hàng",
          cardholderName: duplicateCardholder || "CHỦ THẺ",
          cardType: "Mastercard Platinum",
          statementDay: duplicateStatementDay,
          dueDay: duplicateDueDay,
          annualFee: 0,
          maxCashbackPerMonth: 1000000,
          defaultCashbackRate: 0.1,
          features: [],
          rules: [],
          colorGradient: COLOR_PRESETS[0],
        };
      }
      return {
        ...source,
        cardholderName: duplicateCardholder || source.cardholderName || "CHỦ THẺ MỚI",
        statementDay: duplicateStatementDay,
        dueDay: duplicateDueDay,
      };
    }

    const color = COLOR_PRESETS[colorPresetIndex] || COLOR_PRESETS[0];
    return {
      id: cardId || "preview-card",
      bank: bank || "Ngân hàng",
      name: name || "Tên thẻ tín dụng",
      cardholderName: cardholderName || "",
      cardType: cardType || "Visa / Mastercard",
      statementDay: Number(statementDay) || 20,
      dueDay: Number(dueDay) || 5,
      annualFee: Number(annualFee) || 0,
      maxCashbackPerMonth: Number(maxCashbackPerMonth) || 1000000,
      maxCashbackPerCategory: maxCashbackPerCategory !== "" ? Number(maxCashbackPerCategory) : undefined,
      defaultCashbackRate: Number(defaultCashbackRate) || 0.1,
      imageUrl: (imageUrl || "").trim() || undefined,
      colorGradient: color,
      features: (featuresText || "").split("\n").filter((line) => line.trim().length > 0),
      rules: rules || [],
    };
  }, [
    mode,
    cloneSourceId,
    duplicateCardholder,
    duplicateStatementDay,
    duplicateDueDay,
    existingCards,
    cardId,
    bank,
    name,
    cardholderName,
    cardType,
    statementDay,
    dueDay,
    annualFee,
    maxCashbackPerMonth,
    maxCashbackPerCategory,
    defaultCashbackRate,
    colorPresetIndex,
    imageUrl,
    featuresText,
    rules,
  ]);

  // Lock body scroll when modal is open (Top level Hook)
  useEffect(() => {
    if (isOpen && typeof document !== "undefined") {
      document.body.style.overflow = "hidden";
    }
    return () => {
      if (typeof document !== "undefined") {
        document.body.style.overflow = "unset";
      }
    };
  }, [isOpen]);

  // Add a new cashback rule to state
  const handleAddRule = () => {
    const newRule: CashbackRule = {
      cardId: cardId || "new-card",
      category: "Ẩm thực",
      cashbackRate: 10.0,
      note: "Hoàn 10% cho danh mục Ẩm thực",
    };
    setRules([...rules, newRule]);
  };

  const handleUpdateRule = (index: number, updates: Partial<CashbackRule>) => {
    const updated = rules.map((r, i) => (i === index ? { ...r, ...updates } : r));
    setRules(updated);
  };

  const handleRemoveRule = (index: number) => {
    setRules(rules.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (mode === "duplicate") {
      if (!duplicateCardholder.trim()) {
        alert("Vui lòng nhập tên chủ thẻ mới để phân biệt với thẻ gốc.");
        return;
      }
      const cloned = duplicateCard(cloneSourceId, {
        cardholderName: duplicateCardholder.trim(),
        statementDay: duplicateStatementDay,
        dueDay: duplicateDueDay,
      });
      if (cloned) {
        onSuccess(cloned);
        onClose();
      }
      return;
    }

    if (!name.trim() || !bank.trim()) {
      alert("Vui lòng nhập đầy đủ tên ngân hàng và tên thẻ.");
      return;
    }

    const currentCardId = mode === "edit" ? cardId : `card-${Date.now().toString(36)}`;
    const finalFeatures = featuresText
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    const formattedRules: CashbackRule[] = rules.map((r) => ({
      ...r,
      cardId: currentCardId,
      cashbackRate: Number(r.cashbackRate) || 0,
      maxCashbackPerCategory: r.maxCashbackPerCategory ? Number(r.maxCashbackPerCategory) : undefined,
    }));

    const finalCard: CreditCard = {
      id: currentCardId,
      name: name.trim(),
      bank: bank.trim(),
      cardholderName: cardholderName.trim() || undefined,
      cardType: cardType.trim() || "Visa / Mastercard",
      statementDay: Number(statementDay) || 20,
      dueDay: Number(dueDay) || 5,
      annualFee: Number(annualFee) || 0,
      maxCashbackPerMonth: Number(maxCashbackPerMonth) || 1000000,
      maxCashbackPerCategory: maxCashbackPerCategory !== "" ? Number(maxCashbackPerCategory) : undefined,
      defaultCashbackRate: Number(defaultCashbackRate) || 0.1,
      imageUrl: (imageUrl || "").trim() || undefined,
      colorGradient: COLOR_PRESETS[colorPresetIndex] || COLOR_PRESETS[0],
      features: finalFeatures.length > 0 ? finalFeatures : [`Thẻ ${name.trim()} (${bank.trim()})`],
      rules: formattedRules,
      isCustom: true,
    };

    if (mode === "edit") {
      updateCard(currentCardId, finalCard);
    } else {
      addCard(finalCard);
    }

    onSuccess(finalCard);
    onClose();
  };

  if (!isOpen || !mounted || typeof document === "undefined") return null;

  return createPortal(
    <div className="fixed inset-0 z-[99999] overflow-y-auto bg-slate-950/98 backdrop-blur-2xl p-3 sm:p-6 flex min-h-screen items-center justify-center animate-in fade-in duration-200">
      <div className="w-full max-w-4xl rounded-3xl bg-slate-900 border border-amber-500/30 shadow-2xl p-5 sm:p-8 space-y-6 max-h-[88vh] overflow-y-auto my-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <CardIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-xl text-white">
                {mode === "duplicate"
                  ? "Nhân bản Thẻ cùng dòng (Khác Chủ thẻ)"
                  : mode === "edit"
                  ? "Chỉnh sửa Thông tin Thẻ"
                  : "Thêm Thẻ Tín Dụng Mới"}
              </h3>
              <p className="text-xs text-slate-400">
                {mode === "duplicate"
                  ? "Tạo thẻ thứ 2 cùng dòng nhưng đứng tên người khác, theo dõi hạn mức & sao kê độc lập"
                  : "Tự cấu hình quy tắc hoàn tiền theo chính sách ngân hàng khi bạn mở thẻ mới"}
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

        {/* Mode Selector Tabs (only when not in direct edit mode) */}
        {initialMode !== "edit" && (
          <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-slate-950/60 border border-white/10">
            <button
              type="button"
              onClick={() => setMode("duplicate")}
              className={`flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                mode === "duplicate"
                  ? "bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-lg shadow-sky-500/25"
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <Copy className="w-4 h-4" />
              1. Nhân bản thẻ cùng dòng (Khác tên chủ thẻ)
            </button>
            <button
              type="button"
              onClick={() => setMode("create")}
              className={`flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                mode === "create"
                  ? "bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-lg shadow-amber-500/25"
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <Plus className="w-4 h-4" />
              2. Tự tạo Thẻ mới hoàn toàn (Đa ngân hàng)
            </button>
          </div>
        )}

        {/* Live Visual Card Preview */}
        <div className="p-4 sm:p-6 rounded-3xl bg-slate-950/60 border border-white/10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="w-full md:w-72 shrink-0">
            <CreditCardVisual card={previewCard} />
          </div>
          <div className="flex-1 space-y-2 text-center md:text-left">
            <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-300 font-bold border border-amber-500/20 inline-block">
              Xem trước phôi thẻ thực tế
            </span>
            <h4 className="text-xl font-bold text-white">
              {previewCard.name}
            </h4>
            <div className="text-xs text-slate-400 space-y-1">
              <p>
                <strong className="text-slate-300">Chủ thẻ:</strong>{" "}
                {previewCard.cardholderName ? (
                  <span className="text-amber-300 font-bold uppercase">{previewCard.cardholderName}</span>
                ) : (
                  <span className="italic text-slate-500">Chưa nhập tên chủ thẻ</span>
                )}
              </p>
              <p>
                <strong className="text-slate-300">Chu kỳ:</strong> Chốt ngày {previewCard.statementDay} hàng tháng • Hạn thanh toán: ngày {previewCard.dueDay}
              </p>
              <p>
                <strong className="text-slate-300">Trần hoàn tiền:</strong> {formatCurrencyVND(previewCard.maxCashbackPerMonth)}/kỳ sao kê
              </p>
            </div>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* TAB 1: DUPLICATE MODE */}
          {mode === "duplicate" && (
            <div className="space-y-4 p-5 rounded-2xl bg-slate-800/40 border border-white/5">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Chọn dòng thẻ gốc muốn nhân bản:
                </label>
                <select
                  value={cloneSourceId}
                  onChange={(e) => setCloneSourceId(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-white/10 text-white font-medium text-sm focus:border-amber-400 focus:outline-none"
                >
                  {existingCards.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.bank}) {c.cardholderName ? `- Chủ thẻ: ${c.cardholderName}` : ""}
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-slate-400 mt-1">
                  Thẻ mới sẽ tự động sao chép toàn bộ bộ quy tắc hoàn tiền, mã MCC, và tỷ lệ % của dòng thẻ này.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-amber-300 mb-1.5 flex items-center gap-1.5">
                  <span className="text-amber-400">*</span>
                  Tên chủ thẻ mới (để phân biệt với thẻ đang có):
                </label>
                <input
                  type="text"
                  value={duplicateCardholder}
                  onChange={(e) => setDuplicateCardholder(e.target.value)}
                  placeholder="VD: Trần Phong (Thẻ 2), Vợ, Nguyễn Thị Lan, Thẻ phụ..."
                  required
                  className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-amber-500/40 text-amber-200 font-bold text-sm focus:border-amber-400 focus:outline-none placeholder:text-slate-500 placeholder:font-normal"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Ngày chốt sao kê (hàng tháng):
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="31"
                    value={duplicateStatementDay}
                    onChange={(e) => setDuplicateStatementDay(Number(e.target.value))}
                    required
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-white/10 text-white text-sm focus:border-amber-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Ngày hạn thanh toán (hàng tháng):
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="31"
                    value={duplicateDueDay}
                    onChange={(e) => setDuplicateDueDay(Number(e.target.value))}
                    required
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-white/10 text-white text-sm focus:border-amber-400 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 2 & 3: CREATE CUSTOM / EDIT MODE */}
          {(mode === "create" || mode === "edit") && (
            <div className="space-y-6">
              {/* Section 1: Basic Card Specs */}
              <div className="space-y-4">
                <h4 className="text-sm font-bold text-white flex items-center gap-2 border-b border-white/10 pb-2">
                  <Shield className="w-4 h-4 text-amber-400" />
                  1. Thông tin thẻ & Ngân hàng phát hành
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Ngân hàng phát hành:
                    </label>
                    <input
                      type="text"
                      value={bank}
                      onChange={(e) => setBank(e.target.value)}
                      placeholder="VD: VPBank, Techcombank, MB Bank, VIB..."
                      required
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-white/10 text-white text-sm focus:border-amber-400 focus:outline-none font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Tên dòng thẻ:
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="VD: VPBank Step Up, Techcombank Spark..."
                      required
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-white/10 text-white text-sm focus:border-amber-400 focus:outline-none font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-amber-300 mb-1.5">
                      Tên chủ thẻ (nếu có):
                    </label>
                    <input
                      type="text"
                      value={cardholderName}
                      onChange={(e) => setCardholderName(e.target.value)}
                      placeholder="VD: Trần Phong, Nguyễn Lan..."
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-amber-500/30 text-amber-200 text-sm focus:border-amber-400 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Hạng / Loại thẻ:
                    </label>
                    <input
                      type="text"
                      value={cardType}
                      onChange={(e) => setCardType(e.target.value)}
                      placeholder="VD: Mastercard Platinum, Visa Signature..."
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-white/10 text-white text-sm focus:border-amber-400 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Ngày chốt sao kê:
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="31"
                      value={statementDay}
                      onChange={(e) => setStatementDay(Number(e.target.value))}
                      required
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-white/10 text-white text-sm focus:border-amber-400 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Ngày hạn thanh toán:
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="31"
                      value={dueDay}
                      onChange={(e) => setDueDay(Number(e.target.value))}
                      required
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-white/10 text-white text-sm focus:border-amber-400 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Tỷ lệ hoàn mặc định (%):
                    </label>
                    <input
                      type="number"
                      step="0.05"
                      value={defaultCashbackRate}
                      onChange={(e) => setDefaultCashbackRate(Number(e.target.value))}
                      placeholder="0.1"
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-white/10 text-amber-400 font-bold text-sm focus:border-amber-400 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Hạn mức hoàn tối đa/tháng (VNĐ):
                    </label>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={maxCashbackPerMonth !== "" ? Number(maxCashbackPerMonth).toLocaleString("vi-VN") : ""}
                      onChange={(e) => {
                        const raw = e.target.value.replace(/\D/g, "");
                        setMaxCashbackPerMonth(raw === "" ? "" : Number(raw));
                      }}
                      placeholder="VD: 1.000.000"
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-white/10 text-emerald-400 font-bold text-sm focus:border-amber-400 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Trần tối đa/danh mục (tùy chọn):
                    </label>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={maxCashbackPerCategory !== "" ? Number(maxCashbackPerCategory).toLocaleString("vi-VN") : ""}
                      onChange={(e) => {
                        const raw = e.target.value.replace(/\D/g, "");
                        setMaxCashbackPerCategory(raw === "" ? "" : Number(raw));
                      }}
                      placeholder="VD: 500.000 (nếu có)"
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-white/10 text-amber-300 text-sm focus:border-amber-400 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Phí thường niên (VNĐ/năm):
                    </label>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={annualFee !== "" ? Number(annualFee).toLocaleString("vi-VN") : ""}
                      onChange={(e) => {
                        const raw = e.target.value.replace(/\D/g, "");
                        setAnnualFee(raw === "" ? "" : Number(raw));
                      }}
                      placeholder="VD: 999.000"
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-white/10 text-white text-sm focus:border-amber-400 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Color Preset Palette */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-2 flex items-center gap-1.5">
                    <Palette className="w-3.5 h-3.5 text-amber-400" />
                    Màu sắc phôi thẻ:
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {COLOR_PRESETS.map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setColorPresetIndex(idx)}
                        className={`p-2.5 rounded-xl border text-left flex items-center justify-between transition-all ${
                          colorPresetIndex === idx
                            ? "bg-amber-500/20 border-amber-500 text-white font-bold"
                            : "bg-slate-800/80 border-white/5 text-slate-400 hover:border-white/20"
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <div className={`w-4 h-4 rounded-full bg-gradient-to-tr ${preset.from} ${preset.to} border border-white/20 shrink-0`} />
                          <span className="text-xs truncate">{preset.name.split("(")[0]}</span>
                        </div>
                        {colorPresetIndex === idx && <Check className="w-3.5 h-3.5 text-amber-400 shrink-0" />}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Link ảnh phôi thẻ (tùy chọn nếu muốn dùng ảnh thực tế):
                  </label>
                  <input
                    type="url"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://example.com/card-image.png"
                    className="w-full px-4 py-2 rounded-xl bg-slate-800 border border-white/10 text-white text-xs font-mono focus:border-amber-400 focus:outline-none"
                  />
                </div>
              </div>

              {/* Section 2: Cashback Rules Management */}
              <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between border-b border-white/10 pb-2">
                  <div>
                    <h4 className="text-sm font-bold text-white flex items-center gap-2">
                      <Layers className="w-4 h-4 text-amber-400" />
                      2. Quy tắc Hoàn tiền theo Danh mục / Mã MCC ({rules.length} quy tắc)
                    </h4>
                    <p className="text-[11px] text-slate-400">
                      Hệ thống sẽ đối soát các quy tắc này khi bạn tra cứu MCC hoặc quẹt thẻ để tính % cashback cao nhất.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleAddRule}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition-all"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Thêm quy tắc
                  </button>
                </div>

                {rules.length === 0 ? (
                  <div className="p-6 rounded-2xl bg-slate-800/40 border border-dashed border-white/10 text-center space-y-2">
                    <p className="text-xs text-slate-400">Chưa có quy tắc hoàn tiền cụ thể nào. Thẻ sẽ áp dụng tỷ lệ mặc định {defaultCashbackRate}%.</p>
                    <button
                      type="button"
                      onClick={handleAddRule}
                      className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold text-xs inline-flex items-center gap-1.5 border border-white/10"
                    >
                      <Plus className="w-3.5 h-3.5" /> Thêm quy tắc đầu tiên
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                    {rules.map((rule, rIdx) => (
                      <div
                        key={rIdx}
                        className="p-4 rounded-2xl bg-slate-800/80 border border-white/10 space-y-3 relative group hover:border-amber-500/30 transition-all"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-amber-400">Quy tắc #{rIdx + 1}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveRule(rIdx)}
                            className="p-1 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                            title="Xóa quy tắc này"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div>
                            <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                              Danh mục chi tiêu:
                            </label>
                            <input
                              type="text"
                              list={`categories-list-${rIdx}`}
                              value={rule.category}
                              onChange={(e) => handleUpdateRule(rIdx, { category: e.target.value })}
                              placeholder="Ẩm thực, TMĐT..."
                              className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-white/10 text-white text-xs focus:border-amber-400 focus:outline-none"
                            />
                            <datalist id={`categories-list-${rIdx}`}>
                              {COMMON_CATEGORIES.map((c) => (
                                <option key={c} value={c} />
                              ))}
                            </datalist>
                          </div>

                          <div>
                            <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                              Tỷ lệ hoàn (%):
                            </label>
                            <input
                              type="number"
                              step="0.1"
                              value={rule.cashbackRate}
                              onChange={(e) => handleUpdateRule(rIdx, { cashbackRate: Number(e.target.value) })}
                              placeholder="VD: 15"
                              className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-white/10 text-amber-400 font-black text-xs focus:border-amber-400 focus:outline-none"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                              Trần danh mục (VNĐ/kỳ):
                            </label>
                            <input
                              type="number"
                              value={rule.maxCashbackPerCategory || ""}
                              onChange={(e) =>
                                handleUpdateRule(rIdx, {
                                  maxCashbackPerCategory: e.target.value ? Number(e.target.value) : undefined,
                                })
                              }
                              placeholder="VD: 500000 (nếu có)"
                              className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-white/10 text-white text-xs focus:border-amber-400 focus:outline-none"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                              Mã MCC áp dụng (phân cách bởi dấu phẩy):
                            </label>
                            <input
                              type="text"
                              value={(rule.mccCodes || []).join(", ")}
                              onChange={(e) => {
                                const codes = e.target.value
                                  .split(",")
                                  .map((c) => c.trim())
                                  .filter((c) => c.length > 0);
                                handleUpdateRule(rIdx, { mccCodes: codes.length > 0 ? codes : undefined });
                              }}
                              placeholder="VD: 5812, 5814, 5262..."
                              className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-white/10 text-white font-mono text-xs focus:border-amber-400 focus:outline-none"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                              Ghi chú điều kiện:
                            </label>
                            <input
                              type="text"
                              value={rule.note || ""}
                              onChange={(e) => handleUpdateRule(rIdx, { note: e.target.value })}
                              placeholder="VD: Hoàn 15% Shopee, Tiki, Lazada..."
                              className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-white/10 text-white text-xs focus:border-amber-400 focus:outline-none"
                            />
                          </div>
                        </div>

                        <div className="flex items-center gap-4 text-xs text-slate-300 pt-1">
                          <label className="flex items-center gap-1.5 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={!!rule.isOnlineOnly}
                              onChange={(e) => handleUpdateRule(rIdx, { isOnlineOnly: e.target.checked })}
                              className="rounded text-amber-500"
                            />
                            <span>Chỉ áp dụng Online</span>
                          </label>

                          <label className="flex items-center gap-1.5 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={!!rule.isForeignOnly}
                              onChange={(e) => handleUpdateRule(rIdx, { isForeignOnly: e.target.checked })}
                              className="rounded text-amber-500"
                            />
                            <span>Chỉ áp dụng Ngoại tệ</span>
                          </label>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Section 3: Features */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Điểm nổi bật / Giới thiệu thẻ (Mỗi dòng 1 điểm):
                </label>
                <textarea
                  rows={2}
                  value={featuresText}
                  onChange={(e) => setFeaturesText(e.target.value)}
                  placeholder="Hoàn tiền 15% cho mua sắm Online&#10;Hạn mức hoàn tối đa 600.000 VNĐ/kỳ"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-white/10 text-white text-xs focus:border-amber-400 focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-semibold transition-all"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-sm shadow-lg shadow-amber-500/25 transition-all hover:scale-[1.02]"
            >
              <Check className="w-4 h-4" />
              {mode === "duplicate" ? "Tạo thẻ nhân bản" : mode === "edit" ? "Lưu thay đổi" : "Tạo thẻ mới"}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
