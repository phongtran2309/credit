import { CreditCard, CardRecommendationResult, MccItem, PreviousSpendTier } from "@/types";
import { RAW_VIB_MCC_DATA } from "./mcc-database";

export const DEFAULT_CARDS: CreditCard[] = [
  {
    id: "vib-super-card",
    name: "VIB Super Card",
    bank: "VIB",
    cardType: "Mastercard Black / Tự chọn 15%",
    statementDay: 20,
    dueDay: 5,
    annualFee: 999000,
    maxCashbackPerMonth: 1000000,
    maxCashbackPerCategory: 500000, // Tối đa 500.000 Điểm/1 Danh mục chi tiêu/kỳ
    defaultCashbackRate: 0.1,
    colorGradient: {
      from: "from-zinc-900",
      to: "to-neutral-950",
      text: "text-amber-300",
      accent: "bg-amber-400",
      border: "border-amber-500/30",
    },
    features: [
      "Hoàn tiền 15% cho danh mục chi tiêu tự chọn",
      "Hạn mức tối đa: 1.000.000 Điểm thưởng / kỳ sao kê",
      "Giới hạn tối đa / 1 Danh mục chi tiêu: 500.000 Điểm thưởng / kỳ",
      "Tùy chọn ngày chốt sao kê linh hoạt qua ứng dụng MyVIB",
    ],
    rules: [
      {
        cardId: "vib-super-card",
        category: "Ẩm thực",
        mccCodes: RAW_VIB_MCC_DATA["Ẩm thực"],
        cashbackRate: 15.0,
        minSpendRequired: 0,
        maxCashbackPerCategory: 500000,
        note: "Hoàn 15% Ẩm thực, Nhà hàng, Cafe (tối đa 500.000đ/kỳ cho danh mục này)",
      },
      {
        cardId: "vib-super-card",
        category: "Du lịch",
        mccCodes: RAW_VIB_MCC_DATA["Du lịch"],
        cashbackRate: 15.0,
        minSpendRequired: 0,
        maxCashbackPerCategory: 500000,
        note: "Hoàn 15% Vé máy bay, Khách sạn, Resort, Tour (tối đa 500.000đ/kỳ cho danh mục này)",
      },
      {
        cardId: "vib-super-card",
        category: "Mua sắm",
        mccCodes: RAW_VIB_MCC_DATA["Mua sắm"],
        cashbackRate: 15.0,
        minSpendRequired: 0,
        maxCashbackPerCategory: 500000,
        note: "Hoàn 15% Trung tâm thương mại, Thời trang, Mỹ phẩm (tối đa 500.000đ/kỳ cho danh mục này)",
      },
      {
        cardId: "vib-super-card",
        category: "Giao dịch trực tuyến",
        cashbackRate: 15.0,
        minSpendRequired: 0,
        maxCashbackPerCategory: 500000,
        isOnlineOnly: true,
        excludedMcc: ["6300", "7399"],
        note: "Hoàn 15% chi tiêu Online (trừ Bảo hiểm 6300 & Dịch vụ thương mại 7399, tối đa 500k/danh mục)",
      },
      {
        cardId: "vib-super-card",
        category: "Giao dịch nước ngoài",
        cashbackRate: 15.0,
        minSpendRequired: 0,
        maxCashbackPerCategory: 500000,
        isForeignOnly: true,
        note: "Hoàn 15% chi tiêu trực tiếp tại POS / Contactless nước ngoài (tối đa 500k/danh mục)",
      },
    ],
  },
  {
    id: "vib-family-link",
    name: "VIB Family Link",
    bank: "VIB",
    cardType: "Mastercard World Platinum",
    statementDay: 20,
    dueDay: 5,
    annualFee: 899000,
    maxCashbackPerMonth: 1000000,
    maxCashbackPerCategory: 500000, // Tối đa 500.000 Điểm/1 Danh mục chi tiêu/kỳ
    hasPreviousCycleTier: true,
    defaultCashbackRate: 0.1,
    colorGradient: {
      from: "from-sky-700",
      to: "to-blue-900",
      text: "text-sky-200",
      accent: "bg-sky-400",
      border: "border-sky-400/30",
    },
    features: [
      "Tỷ lệ hoàn phụ thuộc chi tiêu kỳ liền trước: Đến 50tr (5%), 50-100tr (8%), Trên 100tr (10%)",
      "Áp dụng cho Giáo dục, Y tế/Bệnh viện, Bảo hiểm (MCC 6300)",
      "Hạn mức tối đa: 1.000.000 Điểm thưởng / kỳ sao kê",
      "Giới hạn tối đa / 1 Danh mục chi tiêu: 500.000 Điểm thưởng / kỳ",
    ],
    rules: [
      {
        cardId: "vib-family-link",
        category: "Bảo hiểm",
        mccCodes: RAW_VIB_MCC_DATA["Bảo hiểm"],
        cashbackRate: 10.0,
        tierRates: { tier1: 5.0, tier2: 8.0, tier3: 10.0 },
        maxCashbackPerCategory: 500000,
        note: "Hoàn 5% (kỳ trước ≤50tr), 8% (kỳ trước 50-100tr), 10% (kỳ trước >100tr) - Tối đa 500k/danh mục",
      },
      {
        cardId: "vib-family-link",
        category: "Giáo dục",
        mccCodes: RAW_VIB_MCC_DATA["Giáo dục"],
        cashbackRate: 10.0,
        tierRates: { tier1: 5.0, tier2: 8.0, tier3: 10.0 },
        maxCashbackPerCategory: 500000,
        note: "Hoàn 5% (kỳ trước ≤50tr), 8% (kỳ trước 50-100tr), 10% (kỳ trước >100tr) - Tối đa 500k/danh mục",
      },
      {
        cardId: "vib-family-link",
        category: "Y tế",
        mccCodes: RAW_VIB_MCC_DATA["Y tế"],
        cashbackRate: 10.0,
        tierRates: { tier1: 5.0, tier2: 8.0, tier3: 10.0 },
        maxCashbackPerCategory: 500000,
        note: "Hoàn 5% (kỳ trước ≤50tr), 8% (kỳ trước 50-100tr), 10% (kỳ trước >100tr) - Tối đa 500k/danh mục",
      },
    ],
  },
  {
    id: "vib-cash-back",
    name: "VIB Cash Back",
    bank: "VIB",
    cardType: "Mastercard Platinum Cash Back",
    statementDay: 20,
    dueDay: 5,
    annualFee: 899000,
    maxCashbackPerMonth: 800000, // Sẽ linh hoạt theo bậc kỳ liền trước: 800k (≤50tr), 1tr (50-100tr), 2tr (>100tr)
    hasPreviousCycleTier: true,
    defaultCashbackRate: 0.1,
    colorGradient: {
      from: "from-emerald-700",
      to: "to-teal-950",
      text: "text-emerald-200",
      accent: "bg-emerald-400",
      border: "border-emerald-400/30",
    },
    features: [
      "Tỷ lệ hoàn phụ thuộc chi tiêu kỳ liền trước: Đến 50tr (5% - max 800k), 50-100tr (8% - max 1tr), Trên 100tr (10% - max 2tr)",
      "Áp dụng cho Dịch vụ Marketing/Quảng cáo (Ads), Ẩm thực, Giải trí",
      "Hạn mức hoàn lên đến 2.000.000 VNĐ / kỳ sao kê khi chi tiêu kỳ trước > 100 triệu",
    ],
    rules: [
      {
        cardId: "vib-cash-back",
        category: "Dịch vụ Marketing/Quảng cáo",
        mccCodes: RAW_VIB_MCC_DATA["Dịch vụ Marketing/Quảng cáo"],
        cashbackRate: 10.0,
        tierRates: { tier1: 5.0, tier2: 8.0, tier3: 10.0 },
        note: "Hoàn 5% (max 800k), 8% (max 1tr), 10% (max 2tr) cho Facebook/Google/TikTok Ads theo chi tiêu kỳ trước",
      },
      {
        cardId: "vib-cash-back",
        category: "Ẩm thực",
        mccCodes: RAW_VIB_MCC_DATA["Ẩm thực"],
        cashbackRate: 10.0,
        tierRates: { tier1: 5.0, tier2: 8.0, tier3: 10.0 },
        note: "Hoàn 5%, 8%, 10% cho Nhà hàng, Quán ăn, Đồ uống theo chi tiêu kỳ trước",
      },
      {
        cardId: "vib-cash-back",
        category: "Giải trí",
        mccCodes: RAW_VIB_MCC_DATA["Giải trí"],
        cashbackRate: 10.0,
        tierRates: { tier1: 5.0, tier2: 8.0, tier3: 10.0 },
        note: "Hoàn 5%, 8%, 10% cho Rạp chiếu phim CGV, Thể thao, Gym, Media giải trí",
      },
    ],
  },
  {
    id: "vib-online-plus-2in1",
    name: "VIB Online Plus 2in1",
    bank: "VIB",
    cardType: "Mastercard Platinum Online",
    statementDay: 20,
    dueDay: 5,
    annualFee: 699000,
    maxCashbackPerMonth: 600000, // 600.000 Điểm / kỳ
    defaultCashbackRate: 0.1,
    colorGradient: {
      from: "from-indigo-700",
      to: "to-purple-950",
      text: "text-purple-200",
      accent: "bg-purple-400",
      border: "border-purple-400/30",
    },
    features: [
      "Ưu đãi 1: Hoàn 5% chi tiêu trực tuyến nước ngoài (ngoại tệ), 3% trực tuyến trong nước, 0.1% chi tiêu còn lại (Max 600k/kỳ)",
      "Ưu đãi 2: Hoàn 50.000 VNĐ / giao dịch lưu thông tin thẻ (Grab, Netflix, Tiki, Spotify, Agoda...) - Max 100k/kỳ, 300k/KH",
      "Giao dịch đặc biệt tích lũy tối đa: 300.000 Điểm thưởng / kỳ",
    ],
    rules: [
      {
        cardId: "vib-online-plus-2in1",
        category: "Giao dịch chi tiêu trực tuyến nước ngoài",
        cashbackRate: 5.0, // Chính xác 5% theo văn bản 2.6.1
        minSpendRequired: 0,
        maxCashbackPerCategory: 600000,
        isOnlineOnly: true,
        isForeignOnly: true,
        note: "Hoàn 5% cho các giao dịch chi tiêu trực tuyến tại ĐVCNT nước ngoài và bằng ngoại tệ (Max 600k/kỳ)",
      },
      {
        cardId: "vib-online-plus-2in1",
        category: "Giao dịch có lưu thông tin Thẻ",
        cashbackRate: 5.0, // Ước tính tương đương hoặc hoàn cố định 50k
        fixedCashbackPerTx: 50000,
        maxSavedCardCashbackPerCycle: 100000,
        isSavedCardOnly: true,
        note: "Hoàn 50.000 VNĐ/giao dịch lưu thẻ (Grab, Netflix, Tiki, Agoda, Spotify...) - Tối đa 100.000đ/kỳ, 300k/KH",
      },
      {
        cardId: "vib-online-plus-2in1",
        category: "Giao dịch chi tiêu trực tuyến còn lại",
        cashbackRate: 3.0, // Chính xác 3%
        minSpendRequired: 0,
        maxCashbackPerCategory: 600000,
        isOnlineOnly: true,
        note: "Hoàn 3% cho các giao dịch chi tiêu trực tuyến nội địa Việt Nam (Shopee, Lazada, TikTok Shop...)",
      },
    ],
  },
  {
    id: "vib-max-card",
    name: "VIB Max Card",
    bank: "VIB",
    cardType: "Mastercard Platinum Max",
    statementDay: 20,
    dueDay: 5,
    annualFee: 899000,
    maxCashbackPerMonth: 1000000,
    defaultCashbackRate: 0.1,
    colorGradient: {
      from: "from-amber-600",
      to: "to-orange-950",
      text: "text-amber-200",
      accent: "bg-amber-400",
      border: "border-amber-400/30",
    },
    features: [
      "Hoàn 10% cho Mua sắm, Du lịch, Ẩm thực, Giải trí",
      "Áp dụng cho hơn 400+ mã MCC phủ khắp ngành hàng",
      "Hạn mức hoàn tối đa 1.000.000 VNĐ / kỳ sao kê",
    ],
    rules: [
      {
        cardId: "vib-max-card",
        category: "Mua sắm",
        mccCodes: RAW_VIB_MCC_DATA["Mua sắm"],
        cashbackRate: 10.0,
        minSpendRequired: 0,
        maxCashbackPerCategory: 1000000,
        note: "Hoàn 10% hệ thống bán lẻ, TTTM, thời trang, mỹ phẩm",
      },
      {
        cardId: "vib-max-card",
        category: "Du lịch",
        mccCodes: RAW_VIB_MCC_DATA["Du lịch"],
        cashbackRate: 10.0,
        minSpendRequired: 0,
        maxCashbackPerCategory: 1000000,
        note: "Hoàn 10% Hàng không, Khách sạn, Resort toàn cầu",
      },
      {
        cardId: "vib-max-card",
        category: "Ẩm thực",
        mccCodes: RAW_VIB_MCC_DATA["Ẩm thực"],
        cashbackRate: 10.0,
        minSpendRequired: 0,
        maxCashbackPerCategory: 1000000,
        note: "Hoàn 10% Ẩm thực, Nhà hàng, Quán cafe",
      },
      {
        cardId: "vib-max-card",
        category: "Giải trí",
        mccCodes: RAW_VIB_MCC_DATA["Giải trí"],
        cashbackRate: 10.0,
        minSpendRequired: 0,
        maxCashbackPerCategory: 1000000,
        note: "Hoàn 10% Rạp phim CGV, Gym, Giải trí số",
      },
      {
        cardId: "vib-max-card",
        category: "Giao dịch trực tuyến",
        cashbackRate: 10.0,
        minSpendRequired: 0,
        maxCashbackPerCategory: 1000000,
        isOnlineOnly: true,
        excludedMcc: ["6300", "7399"],
        note: "Hoàn 10% chi tiêu trực tuyến (trừ 6300 và 7399)",
      },
    ],
  },
  {
    id: "vpbank-stepup",
    name: "VPBank StepUp",
    bank: "VPBank",
    cardType: "Mastercard Platinum",
    statementDay: 25,
    dueDay: 10,
    annualFee: 499000,
    maxCashbackPerMonth: 600000,
    defaultCashbackRate: 0.1,
    colorGradient: {
      from: "from-emerald-600",
      to: "to-green-950",
      text: "text-emerald-300",
      accent: "bg-emerald-400",
      border: "border-emerald-500/30",
    },
    features: [
      "Hoàn đến 15% cho Mua sắm Online (Shopee, Tiki, Lazada, Sendo)",
      "Hoàn 5% cho Grab, Be, Siêu thị & Ăn uống",
      "Miễn phí thường niên năm đầu khi có 3 giao dịch",
    ],
    rules: [
      {
        cardId: "vpbank-stepup",
        category: "Giao dịch trực tuyến",
        cashbackRate: 15.0,
        minSpendRequired: 0,
        maxCashbackPerCategory: 600000,
        isOnlineOnly: true,
        note: "Hoàn 15% mua sắm online trên Shopee, Lazada, Tiki, TikTok Shop",
      },
      {
        cardId: "vpbank-stepup",
        category: "Giao thông & Di chuyển",
        mccCodes: ["4121", "4111"],
        cashbackRate: 5.0,
        minSpendRequired: 0,
        maxCashbackPerCategory: 600000,
        note: "Hoàn 5% cho Grab, Be, Taxi",
      },
      {
        cardId: "vpbank-stepup",
        category: "Siêu thị & Tiêu dùng",
        mccCodes: ["5411", "5422", "5441"],
        cashbackRate: 5.0,
        minSpendRequired: 0,
        maxCashbackPerCategory: 600000,
        note: "Hoàn 5% tại Siêu thị WinMart, Co.opmart, Big C",
      },
    ],
  },
];

// Helper to determine effective rate and max cap based on previous cycle spend tier
export function getEffectiveCardRate(
  rule: any,
  card: CreditCard,
  previousTier: PreviousSpendTier = "tier1"
): { rate: number; maxCardCap: number; maxCategoryCap?: number; noteText: string } {
  let rate = rule.cashbackRate;
  let maxCardCap = card.maxCashbackPerMonth;
  let maxCategoryCap = rule.maxCashbackPerCategory || card.maxCashbackPerCategory;
  let noteText = rule.note || "";

  // Apply tier rates if card supports them
  if (rule.tierRates) {
    rate = rule.tierRates[previousTier] || rule.cashbackRate;
  }

  // VIB Cash Back dynamic max cap by tier
  if (card.id === "vib-cash-back") {
    if (previousTier === "tier1") {
      maxCardCap = 800000;
    } else if (previousTier === "tier2") {
      maxCardCap = 1000000;
    } else if (previousTier === "tier3") {
      maxCardCap = 2000000;
    }
  }

  return { rate, maxCardCap, maxCategoryCap, noteText };
}

// Smart recommendation algorithm with dynamic previous cycle tier support
export function getRecommendedCardsForMcc(
  mcc: MccItem,
  options?: {
    isOnline?: boolean;
    isForeign?: boolean;
    isSavedCard?: boolean;
    amount?: number;
    previousSpendTier?: PreviousSpendTier;
  },
  customCards?: CreditCard[]
): CardRecommendationResult[] {
  const cards = customCards || DEFAULT_CARDS;
  const results: CardRecommendationResult[] = [];
  const spendAmount = options?.amount || 1000000;
  const prevTier = options?.previousSpendTier || "tier1"; // Mặc định bậc 1 (<= 50tr) hoặc người dùng tự chọn

  for (const card of cards) {
    let bestRule: {
      rule: any;
      rate: number;
      fixedAmount?: number;
      matchType: "mcc_exact" | "category" | "online" | "foreign" | "saved_card" | "general";
      notes: string[];
      maxCategoryCap?: number;
    } | null = null;

    // Check specific rules of the card
    for (const rule of card.rules) {
      let matches = false;
      let matchType: "mcc_exact" | "category" | "online" | "foreign" | "saved_card" | "general" = "category";
      const notes: string[] = [];

      // Saved card match (VIB Online Plus 2in1 Ưu đãi 2)
      if (options?.isSavedCard && rule.isSavedCardOnly) {
        matches = true;
        matchType = "saved_card";
        notes.push("Ưu đãi 2: Hoàn 50.000 VNĐ / giao dịch lưu thông tin thẻ trên Grab, Netflix, Tiki, Agoda, Spotify...");
      }
      // Foreign online match (VIB Online Plus 2in1 Ưu đãi 1: 5%)
      else if (options?.isOnline && options?.isForeign && rule.isForeignOnly && rule.isOnlineOnly) {
        matches = true;
        matchType = "foreign";
        notes.push("Ưu đãi 1: Hoàn 5% chi tiêu trực tuyến tại ĐVCNT ngoài lãnh thổ VN bằng ngoại tệ");
      }
      // Foreign offline match (Super Card 15%)
      else if (options?.isForeign && rule.isForeignOnly && !rule.isOnlineOnly) {
        matches = true;
        matchType = "foreign";
        notes.push("Hoàn 15% cho giao dịch qua POS / Contactless nước ngoài");
      }
      // Direct MCC match
      else if (rule.mccCodes && rule.mccCodes.includes(mcc.code)) {
        matches = true;
        matchType = "mcc_exact";
        if (rule.note) notes.push(rule.note);
      }
      // Category match
      else if (
        rule.category &&
        (rule.category.toLowerCase() === mcc.category.toLowerCase() ||
          mcc.category.toLowerCase().includes(rule.category.toLowerCase()))
      ) {
        if (rule.excludedMcc && rule.excludedMcc.includes(mcc.code)) {
          matches = false;
        } else {
          matches = true;
          matchType = "category";
          if (rule.note) notes.push(rule.note);
        }
      }
      // Online general match
      else if (options?.isOnline && rule.isOnlineOnly && !rule.isForeignOnly) {
        if (rule.excludedMcc && rule.excludedMcc.includes(mcc.code)) {
          matches = false;
        } else {
          matches = true;
          matchType = "online";
          notes.push("Ưu đãi giao dịch trực tuyến nội địa");
        }
      }

      if (matches) {
        const { rate, maxCategoryCap } = getEffectiveCardRate(rule, card, prevTier);

        if (!bestRule || rate > bestRule.rate || (rule.fixedCashbackPerTx && rule.fixedCashbackPerTx > 0)) {
          bestRule = {
            rule,
            rate,
            fixedAmount: rule.fixedCashbackPerTx,
            matchType,
            notes,
            maxCategoryCap,
          };
        }
      }
    }

    // Fallback to default card rate
    if (!bestRule) {
      bestRule = {
        rule: {
          cardId: card.id,
          category: "Chi tiêu thông thường",
          cashbackRate: card.defaultCashbackRate,
          note: "Tích lũy cơ bản 0.1% cho giao dịch thông thường",
        },
        rate: card.defaultCashbackRate,
        matchType: "general",
        notes: ["Tích lũy cơ bản không thuộc danh mục ưu đãi"],
      };
    }

    // Calculate estimated cashback
    let estimatedCashback = 0;
    if (bestRule.fixedAmount && options?.isSavedCard) {
      // Fixed 50.000 VND / tx (max 100k/month)
      estimatedCashback = Math.min(bestRule.fixedAmount, 100000);
    } else {
      const calculated = (spendAmount * bestRule.rate) / 100;
      const categoryCap = bestRule.maxCategoryCap || card.maxCashbackPerCategory || 1000000;
      const { maxCardCap } = getEffectiveCardRate(bestRule.rule, card, prevTier);
      estimatedCashback = Math.min(calculated, categoryCap, maxCardCap);
    }

    const tierLabels = {
      tier1: "Kỳ trước ≤ 50 triệu",
      tier2: "Kỳ trước 50 - 100 triệu",
      tier3: "Kỳ trước > 100 triệu",
    };

    results.push({
      card,
      rule: bestRule.rule,
      cashbackRate: bestRule.rate,
      estimatedCashback,
      matchType: bestRule.matchType,
      notes: bestRule.notes,
      tierSpendLevel: card.hasPreviousCycleTier ? tierLabels[prevTier] : undefined,
      maxCategoryCap: bestRule.maxCategoryCap || card.maxCashbackPerCategory,
    });
  }

  // Sort descending by cashback rate and estimated cashback
  results.sort((a, b) => b.cashbackRate - a.cashbackRate || b.estimatedCashback - a.estimatedCashback);

  return results;
}
