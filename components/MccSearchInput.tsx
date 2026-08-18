"use client";

import { useState, useEffect, useRef } from "react";
import { Search, X, Tag, Globe, Sparkles, CreditCard, BookmarkCheck, History } from "lucide-react";
import { searchMccCodes } from "@/lib/data/mcc-database";
import { MccItem, PreviousSpendTier } from "@/types";

interface MccSearchInputProps {
  onSelectMcc: (mcc: MccItem) => void;
  selectedMcc: MccItem | null;
  isOnline: boolean;
  setIsOnline: (val: boolean) => void;
  isForeign: boolean;
  setIsForeign: (val: boolean) => void;
  isSavedCard: boolean;
  setIsSavedCard: (val: boolean) => void;
  spendAmount: number;
  setSpendAmount: (val: number) => void;
  previousSpendTier: PreviousSpendTier;
  setPreviousSpendTier: (val: PreviousSpendTier) => void;
}

const QUICK_TAGS = [
  { label: "🛡️ Bảo hiểm Nhân thọ (6300)", code: "6300" },
  { label: "🎓 Học phí Trường học (8211)", code: "8211" },
  { label: "🏥 Bệnh viện / Viện phí (8062)", code: "8062" },
  { label: "📢 Chạy Facebook/Google Ads (7311)", code: "7311", isOnline: true },
  { label: "🍔 Ăn uống / Cafe (5812, 5814)", code: "5812" },
  { label: "🛍️ Shopee / E-Commerce (5399)", code: "5399", isOnline: true },
  { label: "🛒 Siêu thị WinMart (5411)", code: "5411" },
  { label: "✈️ Vé máy bay / Khách sạn (4511)", code: "4511" },
  { label: "🚗 Grab / Spotify (Lưu thẻ)", code: "4121", isSavedCard: true },
];

const PREV_SPEND_TIERS: { id: PreviousSpendTier; label: string; desc: string; rateTag: string }[] = [
  { id: "tier1", label: "Đến 50 triệu VNĐ", desc: "Family / Cash Back hoàn 5%", rateTag: "5%" },
  { id: "tier2", label: "Từ 50 - 100 triệu VNĐ", desc: "Family / Cash Back hoàn 8%", rateTag: "8%" },
  { id: "tier3", label: "Trên 100 triệu VNĐ", desc: "Family / Cash Back hoàn 10% (Max 2Tr)", rateTag: "10%" },
];

export default function MccSearchInput({
  onSelectMcc,
  selectedMcc,
  isOnline,
  setIsOnline,
  isForeign,
  setIsForeign,
  isSavedCard,
  setIsSavedCard,
  spendAmount,
  setSpendAmount,
  previousSpendTier,
  setPreviousSpendTier,
}: MccSearchInputProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<MccItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (query.trim()) {
      const matched = searchMccCodes(query);
      setResults(matched);
      setIsOpen(true);
    } else {
      setResults(searchMccCodes(""));
    }
  }, [query]);

  // Click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (item: MccItem) => {
    onSelectMcc(item);
    setQuery(`${item.code} - ${item.name}`);
    setIsOpen(false);
  };

  const handleQuickTagClick = (tag: typeof QUICK_TAGS[0]) => {
    const matched = searchMccCodes(tag.code);
    if (matched.length > 0) {
      handleSelect(matched[0]);
      if (tag.isOnline !== undefined) setIsOnline(tag.isOnline);
      if (tag.isSavedCard !== undefined) setIsSavedCard(tag.isSavedCard);
    }
  };

  return (
    <div className="w-full space-y-4">
      {/* Search Input Box */}
      <div className="relative" ref={dropdownRef}>
        <div className="relative flex items-center">
          <div className="absolute left-4 pointer-events-none text-amber-400">
            <Search className="w-6 h-6" />
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setIsOpen(true);
            }}
            onFocus={() => setIsOpen(true)}
            placeholder="Nhập mã MCC (6300, 8211, 7311, 5812...) hoặc tên ngành (Bảo hiểm, Học phí, Chạy Ads, Grab...)"
            className="w-full pl-13 pr-12 py-4 rounded-2xl bg-slate-900/90 border-2 border-amber-500/40 focus:border-amber-400 text-white placeholder-slate-400 text-base shadow-xl backdrop-blur-xl focus:outline-none focus:ring-4 focus:ring-amber-500/20 transition-all font-medium"
          />
          {query && (
            <button
              onClick={() => {
                setQuery("");
                setIsOpen(false);
              }}
              className="absolute right-4 text-slate-400 hover:text-white p-1 rounded-full hover:bg-white/10"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Autocomplete Dropdown */}
        {isOpen && results.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-2 max-h-96 overflow-y-auto rounded-2xl bg-slate-900 border border-amber-500/30 shadow-2xl z-50 divide-y divide-white/5 backdrop-blur-2xl">
            <div className="px-4 py-2 bg-slate-950/60 text-xs font-semibold text-slate-400 flex items-center justify-between">
              <span>GỢI Ý MÃ MCC PHÙ HỢP ({results.length})</span>
              <span className="text-[11px] text-amber-400">Chọn để xem thẻ tối ưu</span>
            </div>
            {results.map((item) => (
              <button
                key={item.code}
                onClick={() => handleSelect(item)}
                className="w-full text-left px-4 py-3 hover:bg-amber-500/10 flex items-start gap-3 transition-colors group"
              >
                <span className="px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 font-mono font-bold text-sm border border-amber-500/30 shrink-0 group-hover:bg-amber-500 group-hover:text-slate-950 transition-colors">
                  {item.code}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-white group-hover:text-amber-300 transition-colors">
                      {item.name}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-white/10">
                      {item.category}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{item.description}</p>
                  {item.popularBrands && item.popularBrands.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {item.popularBrands.slice(0, 4).map((brand) => (
                        <span
                          key={brand}
                          className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 text-slate-300 border border-white/5"
                        >
                          {brand}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Quick Category Chips */}
      <div className="flex flex-wrap gap-2 items-center">
        <span className="text-xs font-semibold text-slate-400 flex items-center gap-1 shrink-0 mr-1">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Nhanh:
        </span>
        {QUICK_TAGS.map((tag) => (
          <button
            key={tag.code}
            onClick={() => handleQuickTagClick(tag)}
            className="text-xs px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-amber-500/20 hover:border-amber-500/40 text-slate-300 hover:text-amber-300 border border-white/10 transition-all active:scale-95"
          >
            {tag.label}
          </button>
        ))}
      </div>

      {/* Previous Statement Cycle Spend Tier Selector */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-950/40 via-slate-900/90 to-amber-950/30 border border-blue-500/30 space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <span className="text-xs font-bold text-sky-300 flex items-center gap-1.5">
            <History className="w-4 h-4 text-sky-400" />
            Tổng chi tiêu kỳ sao kê liền trước (Áp dụng cho Family Link & Cash Back):
          </span>
          <span className="text-[11px] text-slate-400 font-medium">Chọn để tính tỷ lệ 5% / 8% / 10%</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {PREV_SPEND_TIERS.map((tier) => {
            const isSelected = previousSpendTier === tier.id;
            return (
              <button
                key={tier.id}
                type="button"
                onClick={() => setPreviousSpendTier(tier.id)}
                className={`p-2.5 rounded-xl text-left border transition-all flex flex-col justify-between ${
                  isSelected
                    ? "bg-sky-500/20 border-sky-400 shadow-md shadow-sky-500/20"
                    : "bg-slate-900/60 border-white/10 hover:border-sky-500/40"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-bold ${isSelected ? "text-white" : "text-slate-300"}`}>
                    {tier.label}
                  </span>
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded font-black ${
                      isSelected
                        ? "bg-amber-400 text-slate-950"
                        : "bg-slate-800 text-amber-300 border border-white/10"
                    }`}
                  >
                    Hoàn {tier.rateTag}
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 mt-1">{tier.desc}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Dynamic Spend Options & Conditions */}
      <div className="p-4 rounded-2xl glass-panel space-y-4 border border-white/10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-white flex items-center gap-1.5">
              <CreditCard className="w-4 h-4 text-amber-400" />
              Số tiền dự kiến giao dịch:
            </span>
          </div>
          <div className="flex items-center gap-2">
            {[500000, 1000000, 2000000, 5000000, 10000000].map((amt) => (
              <button
                key={amt}
                onClick={() => setSpendAmount(amt)}
                className={`text-xs px-2.5 py-1 rounded-lg font-medium transition-all ${
                  spendAmount === amt
                    ? "bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20"
                    : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                }`}
              >
                {amt / 1000000 >= 1 ? `${amt / 1000000}Tr` : `${amt / 1000}k`}
              </button>
            ))}
          </div>
        </div>

        {/* Conditions Toggles */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2 border-t border-white/5">
          <label className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-900/60 border border-white/5 hover:border-amber-500/30 cursor-pointer transition-all select-none">
            <input
              type="checkbox"
              checked={isOnline}
              onChange={(e) => setIsOnline(e.target.checked)}
              className="w-4 h-4 rounded text-amber-500 focus:ring-amber-400 bg-slate-800 border-slate-700"
            />
            <Globe className="w-4 h-4 text-sky-400 shrink-0" />
            <span className="text-xs text-slate-300 font-medium">Chi tiêu Trực tuyến (Online)</span>
          </label>

          <label className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-900/60 border border-white/5 hover:border-amber-500/30 cursor-pointer transition-all select-none">
            <input
              type="checkbox"
              checked={isForeign}
              onChange={(e) => setIsForeign(e.target.checked)}
              className="w-4 h-4 rounded text-amber-500 focus:ring-amber-400 bg-slate-800 border-slate-700"
            />
            <Tag className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="text-xs text-slate-300 font-medium">Ngoại tệ / Quốc tế (Online & POS)</span>
          </label>

          <label className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-900/60 border border-white/5 hover:border-amber-500/30 cursor-pointer transition-all select-none">
            <input
              type="checkbox"
              checked={isSavedCard}
              onChange={(e) => setIsSavedCard(e.target.checked)}
              className="w-4 h-4 rounded text-amber-500 focus:ring-amber-400 bg-slate-800 border-slate-700"
            />
            <BookmarkCheck className="w-4 h-4 text-purple-400 shrink-0" />
            <span className="text-xs text-slate-300 font-medium">Đã lưu thẻ (Grab, Spotify, Netflix...)</span>
          </label>
        </div>
      </div>
    </div>
  );
}
