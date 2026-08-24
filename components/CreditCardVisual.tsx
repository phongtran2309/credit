"use client";

import { useState } from "react";
import { CreditCard } from "@/types";
import { Wifi, Sparkles } from "lucide-react";

interface CreditCardVisualProps {
  card: CreditCard;
  compact?: boolean;
}

export default function CreditCardVisual({ card, compact = false }: CreditCardVisualProps) {
  const [imageError, setImageError] = useState(false);

  const gradient = card.colorGradient || {
    from: "from-slate-800",
    to: "to-zinc-950",
    text: "text-amber-300",
    accent: "bg-amber-400",
    border: "border-amber-500/30",
  };

  if (card.imageUrl && !imageError) {
    return (
      <div
        className={`relative overflow-hidden rounded-2xl border border-white/10 shadow-2xl transition-all hover:scale-[1.02] duration-300 ${
          compact ? "w-full aspect-[1.58/1]" : "w-full max-w-sm aspect-[1.58/1]"
        } select-none group bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-1`}
      >
        <img
          src={card.imageUrl}
          alt={card.name}
          onError={() => setImageError(true)}
          className="w-full h-full object-contain object-center drop-shadow-2xl rounded-xl"
        />
        {/* Cardholder name badge if present on image view */}
        {card.cardholderName && (
          <div className="absolute bottom-2.5 left-3 px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-md border border-white/20 text-[10px] font-mono font-bold tracking-widest text-amber-300 shadow-md uppercase">
            👤 {card.cardholderName}
          </div>
        )}
        {/* Subtle shine on hover */}
        <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/10 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none rounded-2xl" />
      </div>
    );
  }

  return (
    <div
      className={`card-shine rounded-2xl p-5 relative overflow-hidden bg-gradient-to-br ${gradient.from} ${gradient.to} border ${gradient.border} shadow-2xl transition-all hover:scale-[1.02] duration-300 ${
        compact ? "w-full aspect-[1.58/1]" : "w-full max-w-sm aspect-[1.58/1]"
      } flex flex-col justify-between select-none`}
    >
      {/* Background glowing orb */}
      <div className="absolute -top-12 -right-12 w-36 h-36 rounded-full bg-white/10 blur-2xl pointer-events-none" />
      <div className="absolute -bottom-10 -left-10 w-32 h-32 rounded-full bg-amber-500/10 blur-xl pointer-events-none" />

      {/* Card Header: Bank Name & Contactless */}
      <div className="flex items-center justify-between z-10">
        <div className="flex items-center gap-2">
          <span className="font-extrabold tracking-wider text-xl text-white drop-shadow-md">
            {card.bank}
          </span>
          <span className="text-[10px] px-2 py-0.5 rounded bg-white/15 text-white font-medium backdrop-blur-sm border border-white/20">
            {card.name.replace(new RegExp(`^(${card.bank}|VIB|VPBank|Shinhan Bank|Shinhan|Techcombank)\\s+`, "i"), "")}
          </span>
        </div>
        <Wifi className="w-5 h-5 text-white/80 rotate-90" />
      </div>

      {/* Card EMV Chip & Hologram */}
      <div className="flex items-center gap-4 my-auto z-10">
        {/* EMV Chip */}
        <div className="w-11 h-8 rounded-md bg-gradient-to-tr from-amber-200 via-amber-400 to-yellow-100 border border-amber-500/60 p-1 flex flex-col justify-between shadow-inner">
          <div className="w-full h-px bg-amber-700/40" />
          <div className="w-full h-px bg-amber-700/40" />
        </div>

        {/* Small badge */}
        <div className="text-[11px] font-semibold text-white/80 flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-amber-300" />
          <span>Hoàn tối đa {card.maxCashbackPerMonth ? (card.maxCashbackPerMonth / 1000).toLocaleString() + "k" : "1Tr"}/kỳ</span>
        </div>
      </div>

      {/* Card Footer: Cardholder & Network Logo */}
      <div className="flex items-end justify-between z-10">
        <div className="min-w-0">
          <div className="text-[9px] text-white/60 tracking-wider uppercase font-semibold">
            Chốt sao kê ngày {card.statementDay}
          </div>
          <div className={`font-semibold tracking-wide ${gradient.text} text-sm drop-shadow truncate`}>
            {card.name}
          </div>
          {card.cardholderName && (
            <div className="text-[10px] font-mono font-bold tracking-widest text-white/90 uppercase mt-0.5 truncate">
              {card.cardholderName}
            </div>
          )}
        </div>

        {/* Card Network Logo (VISA or Mastercard) */}
        {(card.cardType || "").toLowerCase().includes("visa") ? (
          <div className="px-2 py-0.5 rounded bg-white/15 border border-white/20 backdrop-blur-sm shrink-0 ml-2">
            <span className="text-base font-black italic tracking-widest text-white drop-shadow">VISA</span>
          </div>
        ) : (
          <div className="flex items-center -space-x-2 shrink-0 ml-2">
            <div className="w-6 h-6 rounded-full bg-red-500/90 shadow-md" />
            <div className="w-6 h-6 rounded-full bg-amber-400/90 shadow-md" />
          </div>
        )}
      </div>
    </div>
  );
}
