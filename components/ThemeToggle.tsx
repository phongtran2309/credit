"use client";

import { useState, useRef, useEffect } from "react";
import { useTheme, ThemeMode } from "./ThemeProvider";
import { Moon, Sun, Sliders, Check, Sparkles, Coffee } from "lucide-react";

interface ThemeOption {
  id: ThemeMode;
  name: string;
  shortName: string;
  desc: string;
  badge?: string;
  icon: typeof Moon;
  accentColor: string;
}

export const THEME_OPTIONS: ThemeOption[] = [
  {
    id: "warm-dark",
    name: "Tối Ấm (Warm Dark)",
    shortName: "Tối ấm",
    desc: "Xám than ấm áp, dịu mắt, chống chói loá",
    badge: "Êm dịu",
    icon: Coffee,
    accentColor: "text-amber-400 bg-amber-500/10 border-amber-500/30",
  },
  {
    id: "neutral",
    name: "Trung Tính (Neutral)",
    shortName: "Trung tính",
    desc: "Xám ghi cân bằng, không chói, dễ chịu",
    badge: "Cân bằng",
    icon: Sliders,
    accentColor: "text-sky-400 bg-sky-500/10 border-sky-500/30",
  },
  {
    id: "warm-light",
    name: "Sáng Ấm (Warm Light)",
    shortName: "Sáng ấm",
    desc: "Nền kem ngà mềm mại, không chói gắt",
    badge: "Mềm mại",
    icon: Sun,
    accentColor: "text-orange-400 bg-orange-500/10 border-orange-500/30",
  },
];

interface ThemeToggleProps {
  variant?: "dropdown" | "pills" | "compact";
  className?: string;
}

export default function ThemeToggle({ variant = "dropdown", className = "" }: ThemeToggleProps) {
  const { theme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentOption = THEME_OPTIONS.find((t) => t.id === theme) || THEME_OPTIONS[0];
  const CurrentIcon = currentOption.icon;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  if (variant === "pills") {
    return (
      <div className={`flex items-center gap-1.5 p-1 rounded-2xl bg-black/20 backdrop-blur-md border border-white/10 ${className}`}>
        {THEME_OPTIONS.map((opt) => {
          const Icon = opt.icon;
          const isActive = theme === opt.id;
          return (
            <button
              key={opt.id}
              onClick={() => setTheme(opt.id)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                isActive
                  ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20 font-bold scale-[1.02]"
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{opt.shortName}</span>
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className={`relative shrink-0 ${className}`} ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        title={`Chuyển giao diện: Hiện tại là ${currentOption.name}`}
        aria-label="Thay đổi theme"
        className="flex items-center gap-1.5 p-2 sm:px-3 sm:py-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 border border-white/10 transition-all cursor-pointer whitespace-nowrap shrink-0"
      >
        <CurrentIcon className="w-4 h-4 text-amber-400 shrink-0" />
        <span className="hidden lg:inline text-xs font-medium whitespace-nowrap">{currentOption.shortName}</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 p-2 rounded-2xl glass-panel shadow-2xl border border-white/15 z-50 animate-in fade-in zoom-in-95 duration-150">
          <div className="px-3 py-2 border-b border-white/10 mb-1">
            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400 uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Chọn Giao Diện (3 Themes)</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Đã tối ưu êm dịu, không còn tone tối gắt hay sáng chói
            </p>
          </div>

          <div className="space-y-1">
            {THEME_OPTIONS.map((opt) => {
              const Icon = opt.icon;
              const isActive = theme === opt.id;
              return (
                <button
                  key={opt.id}
                  onClick={() => {
                    setTheme(opt.id);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left transition-all cursor-pointer ${
                    isActive
                      ? "bg-amber-500/15 border border-amber-500/30 text-amber-300"
                      : "hover:bg-white/5 text-slate-300 hover:text-white border border-transparent"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${opt.accentColor}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold leading-none mb-1 flex items-center gap-1.5">
                        {opt.name}
                        {opt.badge && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                            {opt.badge}
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-400 leading-tight">
                        {opt.desc}
                      </div>
                    </div>
                  </div>

                  {isActive && <Check className="w-4 h-4 text-amber-400 shrink-0 ml-2" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
