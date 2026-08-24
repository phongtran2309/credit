import { CreditCard, CardRecommendationResult, MccItem, PreviousSpendTier } from "@/types";
import { RAW_VIB_MCC_DATA } from "./mcc-database";

export const DEFAULT_CARDS: CreditCard[] = [
  {
    id: "vib-super-card",
    name: "VIB Super Card",
    bank: "VIB",
    cardType: "Mastercard Black / Tự chọn 15%",
    statementDay: 27,
    dueDay: 21,
    annualFee: 999000,
    maxCashbackPerMonth: 1000000,
    maxCashbackPerCategory: 500000, // Tối đa 500.000 Điểm/1 Danh mục chi tiêu/kỳ
    defaultCashbackRate: 0.1,
    optimalMonthlySpend: 6666667, // Tiêu ~6.67tr (3.33tr x 2 danh mục x 15% = 1tr)
    optimalSpendNote: "Điểm ngọt: Tiêu 3.333.333 VNĐ/danh mục (cho 2 danh mục) x 15% để nhận trọn 1.000.000 VNĐ hoàn tiền.",
    categoryOptimalSpend: {
      "Ẩm thực": 3333333,
      "Du lịch": 3333333,
      "Mua sắm": 3333333,
      "Giao dịch trực tuyến": 3333333,
      "Giao dịch nước ngoài": 3333333,
    },
    colorGradient: {
      from: "from-zinc-900",
      to: "to-neutral-950",
      text: "text-amber-300",
      accent: "bg-amber-400",
      border: "border-amber-500/30",
    },
    features: [
      "Hoàn tiền 15% cho danh mục chi tiêu tự chọn",
      "Mốc chi tiêu tối ưu: ~6.670.000 VNĐ/kỳ (3.33tr x 2 danh mục) để ăn trọn max 1tr hoàn tiền",
      "Giới hạn tối đa / 1 Danh mục chi tiêu: 500.000 Điểm thưởng / kỳ",
      "Ngày chốt sao kê 27 hằng tháng - Hạn thanh toán ngày 21",
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
    statementDay: 27,
    dueDay: 21,
    annualFee: 899000,
    maxCashbackPerMonth: 1000000,
    maxCashbackPerCategory: 500000, // Tối đa 500.000 Điểm/1 Danh mục chi tiêu/kỳ
    hasPreviousCycleTier: true,
    defaultCashbackRate: 0.1,
    optimalMonthlySpend: 20000000, // Mốc tối ưu: 20.000.000 VNĐ / kỳ sao kê
    optimalSpendNote: "Điểm ngọt: Tiêu đúng 20.000.000 VNĐ/kỳ (chia 10tr/danh mục cho 2 danh mục) ở mốc ≤50tr để nhận trọn 1.000.000 VNĐ hoàn tiền (500k/danh mục).",
    categoryOptimalSpend: {
      "Giáo dục": 10000000,
      "Y tế": 10000000,
      "Bảo hiểm": 10000000,
    },
    colorGradient: {
      from: "from-sky-700",
      to: "to-blue-900",
      text: "text-sky-200",
      accent: "bg-sky-400",
      border: "border-sky-400/30",
    },
    features: [
      "Mốc chi tiêu tối ưu: 20.000.000 VNĐ/kỳ (10tr Giáo dục + 10tr Bảo hiểm/Y tế) để lấy full 1.000.000 VNĐ tiền hoàn (ROI 5%)",
      "Tỷ lệ hoàn phụ thuộc chi tiêu kỳ liền trước: Đến 50tr (5%), 50-100tr (8%), Trên 100tr (10%)",
      "Áp dụng cho Giáo dục, Y tế/Bệnh viện, Bảo hiểm (MCC 6300)",
      "Hạn mức tối đa: 1.000.000 Điểm thưởng / kỳ sao kê (Ngày chốt 27 - Hạn TT 21)",
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
        note: "Hoàn 5% (kỳ trước ≤50tr), 8% (kỳ trước 50-100tr), 10% (kỳ trước >100tr) - Tối đa 500k/danh mục (tiêu 10tr/danh mục)",
      },
      {
        cardId: "vib-family-link",
        category: "Giáo dục",
        mccCodes: RAW_VIB_MCC_DATA["Giáo dục"],
        cashbackRate: 10.0,
        tierRates: { tier1: 5.0, tier2: 8.0, tier3: 10.0 },
        maxCashbackPerCategory: 500000,
        note: "Hoàn 5% (kỳ trước ≤50tr), 8% (kỳ trước 50-100tr), 10% (kỳ trước >100tr) - Tối đa 500k/danh mục (tiêu 10tr/danh mục)",
      },
      {
        cardId: "vib-family-link",
        category: "Y tế",
        mccCodes: RAW_VIB_MCC_DATA["Y tế"],
        cashbackRate: 10.0,
        tierRates: { tier1: 5.0, tier2: 8.0, tier3: 10.0 },
        maxCashbackPerCategory: 500000,
        note: "Hoàn 5% (kỳ trước ≤50tr), 8% (kỳ trước 50-100tr), 10% (kỳ trước >100tr) - Tối đa 500k/danh mục (tiêu 10tr/danh mục)",
      },
    ],
  },
  {
    id: "vib-cash-back",
    name: "VIB Cash Back",
    bank: "VIB",
    cardType: "Mastercard Platinum Cash Back",
    statementDay: 27,
    dueDay: 21,
    annualFee: 899000,
    maxCashbackPerMonth: 800000, // Sẽ linh hoạt theo bậc kỳ liền trước: 800k (≤50tr), 1tr (50-100tr), 2tr (>100tr)
    hasPreviousCycleTier: true,
    defaultCashbackRate: 0.1,
    optimalMonthlySpend: 16000000, // Mốc tối ưu: 16.000.000 VNĐ / kỳ sao kê
    optimalSpendNote: "Điểm ngọt: Tiêu đúng 16.000.000 VNĐ/kỳ (ở mốc ≤50tr) để nhận trọn max 800.000 VNĐ hoàn tiền với hiệu suất 5% kịch trần.",
    categoryOptimalSpend: {
      "Dịch vụ Marketing/Quảng cáo": 16000000,
      "Ẩm thực": 16000000,
      "Giải trí": 16000000,
    },
    colorGradient: {
      from: "from-emerald-700",
      to: "to-teal-950",
      text: "text-emerald-200",
      accent: "bg-emerald-400",
      border: "border-emerald-400/30",
    },
    features: [
      "Mốc chi tiêu tối ưu: 16.000.000 VNĐ/kỳ (ở mốc ≤50tr) để ăn trọn max 800.000 VNĐ hoàn tiền (ROI 5%)",
      "Tỷ lệ hoàn phụ thuộc chi tiêu kỳ liền trước: Đến 50tr (5% - max 800k), 50-100tr (8% - max 1tr), Trên 100tr (10% - max 2tr)",
      "Áp dụng cho Dịch vụ Marketing/Quảng cáo (Ads), Ẩm thực, Giải trí",
      "Hạn mức hoàn lên đến 2.000.000 VNĐ / kỳ sao kê (Ngày chốt 27 - Hạn TT 21)",
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
    statementDay: 27,
    dueDay: 21,
    annualFee: 699000,
    maxCashbackPerMonth: 600000, // 600.000 Điểm / kỳ
    defaultCashbackRate: 0.1,
    optimalMonthlySpend: 12000000, // 12 triệu cho ngoại tệ (5%) hoặc 20 triệu cho nội địa (3%)
    optimalSpendNote: "Điểm ngọt: Tiêu 12.000.000 VNĐ (trực tuyến ngoại tệ x5%) hoặc 20.000.000 VNĐ (nội địa x3%) để đạt max hoàn 600.000 VNĐ.",
    colorGradient: {
      from: "from-indigo-700",
      to: "to-purple-950",
      text: "text-purple-200",
      accent: "bg-purple-400",
      border: "border-purple-400/30",
    },
    features: [
      "Mốc chi tiêu tối ưu: 12.000.000 VNĐ (Online ngoại tệ x5%) để lấy max 600.000 VNĐ hoàn tiền",
      "Ưu đãi 1: Hoàn 5% chi tiêu trực tuyến nước ngoài (ngoại tệ), 3% trực tuyến trong nước, 0.1% chi tiêu còn lại (Max 600k/kỳ)",
      "Ưu đãi 2: Hoàn 50.000 VNĐ / giao dịch lưu thông tin thẻ (Grab, Netflix, Tiki, Spotify, Agoda...) - Max 100k/kỳ, 300k/KH",
      "Ngày chốt sao kê 27 hằng tháng - Hạn thanh toán ngày 21",
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
    statementDay: 27,
    dueDay: 21,
    annualFee: 899000,
    maxCashbackPerMonth: 1500000,
    defaultCashbackRate: 0.1,
    optimalMonthlySpend: 15000000,
    optimalSpendNote: "Điểm ngọt: Tiêu 15.000.000 VNĐ (x10%) để nhận trọn 1.500.000 VNĐ hoàn tiền.",
    colorGradient: {
      from: "from-amber-600",
      to: "to-orange-950",
      text: "text-amber-200",
      accent: "bg-amber-400",
      border: "border-amber-400/30",
    },
    features: [
      "Mốc chi tiêu tối ưu: 15.000.000 VNĐ/kỳ để lấy full 1.500.000 VNĐ tiền hoàn (10%)",
      "Hoàn 10% cho Mua sắm, Du lịch, Ẩm thực, Giải trí",
      "Áp dụng cho hơn 400+ mã MCC phủ khắp ngành hàng",
      "Hạn mức hoàn tối đa 1.500.000 VNĐ / kỳ sao kê (Ngày chốt 27 - Hạn TT 21)",
    ],
    rules: [
      {
        cardId: "vib-max-card",
        category: "Mua sắm",
        mccCodes: RAW_VIB_MCC_DATA["Mua sắm"],
        cashbackRate: 10.0,
        minSpendRequired: 0,
        maxCashbackPerCategory: 1500000,
        note: "Hoàn 10% hệ thống bán lẻ, TTTM, thời trang, mỹ phẩm",
      },
      {
        cardId: "vib-max-card",
        category: "Du lịch",
        mccCodes: RAW_VIB_MCC_DATA["Du lịch"],
        cashbackRate: 10.0,
        minSpendRequired: 0,
        maxCashbackPerCategory: 1500000,
        note: "Hoàn 10% Hàng không, Khách sạn, Resort toàn cầu",
      },
      {
        cardId: "vib-max-card",
        category: "Ẩm thực",
        mccCodes: RAW_VIB_MCC_DATA["Ẩm thực"],
        cashbackRate: 10.0,
        minSpendRequired: 0,
        maxCashbackPerCategory: 1500000,
        note: "Hoàn 10% Ẩm thực, Nhà hàng, Quán cafe",
      },
      {
        cardId: "vib-max-card",
        category: "Giải trí",
        mccCodes: RAW_VIB_MCC_DATA["Giải trí"],
        cashbackRate: 10.0,
        minSpendRequired: 0,
        maxCashbackPerCategory: 1500000,
        note: "Hoàn 10% Rạp phim CGV, Gym, Giải trí số",
      },
      {
        cardId: "vib-max-card",
        category: "Giao dịch trực tuyến",
        cashbackRate: 10.0,
        minSpendRequired: 0,
        maxCashbackPerCategory: 1500000,
        isOnlineOnly: true,
        excludedMcc: ["6300", "7399"],
        note: "Hoàn 10% chi tiêu trực tuyến (trừ 6300 và 7399)",
      },
    ],
  },
  {
    id: "shinhan-supreme",
    name: "Shinhan Supreme",
    bank: "Shinhan Bank",
    cardType: "Visa Supreme / Tích 12% Điểm Thưởng",
    statementDay: 25,
    dueDay: 10,
    annualFee: 550000,
    maxCashbackPerMonth: 1000000, // Tối đa 1.000.000 Điểm thưởng đặc biệt/kỳ (khi chi tiêu ≥ 15tr) hoặc 300.000 Điểm (chi tiêu ≥ 3tr)
    defaultCashbackRate: 0.1,
    optimalMonthlySpend: 15000000, // Mốc tối ưu: 15.000.000 VNĐ / kỳ sao kê
    optimalSpendNote: "Điểm ngọt: Tiêu tổng từ 15.000.000 VNĐ/kỳ (với ~8.333.333 VNĐ nhóm 12% như TMĐT/Điện máy/Giáo dục/Nhà sách) để nhận trọn 1.000.000 điểm thưởng.",
    categoryOptimalSpend: {
      "Thương mại điện tử": 8333333,
      "Điện máy": 8333333,
      "Giáo dục": 8333333,
      "Nhà sách": 8333333,
      "Bệnh viện": 16666667,
      "Bảo hiểm": 16666667,
    },
    colorGradient: {
      from: "from-blue-900",
      to: "to-slate-950",
      text: "text-sky-300",
      accent: "bg-sky-400",
      border: "border-sky-500/40",
    },
    features: [
      "Tích 12% Điểm thưởng: Thương mại điện tử (Shopee, Lazada...), Điện máy, Giáo dục (Học phí), Nhà sách",
      "Tích 6% Điểm thưởng: Bệnh viện, Viện phí, Dịch vụ y tế, Bảo hiểm",
      "Hạn mức điểm thưởng đặc biệt: 1.000.000 điểm/kỳ (khi chi tiêu ≥ 15tr) hoặc 300.000 điểm/kỳ (chi tiêu ≥ 3tr)",
      "Mốc chi tiêu tối ưu: 15.000.000 VNĐ/kỳ (với ~8.33tr nhóm 12%) để nhận full 1.000.000 điểm thưởng",
      "Điểm thưởng được ghi nhận vào Bảng sao kê của kỳ tiếp theo (N+1)",
      "Ngày chốt sao kê: 25 hàng tháng - Hạn thanh toán: ngày 10",
    ],
    rules: [
      {
        cardId: "shinhan-supreme",
        category: "Thương mại điện tử",
        mccCodes: ["5262", "5399"],
        cashbackRate: 12.0,
        minSpendRequired: 3000000,
        maxCashbackPerCategory: 1000000,
        note: "Tích 12% cho sàn Thương mại điện tử (MCC 5262, 5399: Shopee, Lazada, Tiki, TikTok Shop...)",
      },
      {
        cardId: "shinhan-supreme",
        category: "Điện máy",
        mccCodes: ["5732", "5722"],
        cashbackRate: 12.0,
        minSpendRequired: 3000000,
        maxCashbackPerCategory: 1000000,
        note: "Tích 12% Điện máy & Thiết bị gia dụng (MCC 5732, 5722: ĐMX, FPT Shop, TGDD, Nguyễn Kim...)",
      },
      {
        cardId: "shinhan-supreme",
        category: "Giáo dục",
        mccCodes: ["8211", "8220", "8241", "8244", "8249", "8299"],
        cashbackRate: 12.0,
        minSpendRequired: 3000000,
        maxCashbackPerCategory: 1000000,
        note: "Tích 12% Học phí, Trường học các cấp, Đại học & Trung tâm đào tạo (MCC 8211, 8220, 8241, 8244, 8249, 8299)",
      },
      {
        cardId: "shinhan-supreme",
        category: "Nhà sách",
        mccCodes: ["5942", "5192"],
        cashbackRate: 12.0,
        minSpendRequired: 3000000,
        maxCashbackPerCategory: 1000000,
        note: "Tích 12% Nhà sách, Sách báo & Tạp chí (MCC 5942, 5192: Fahasa, Nhã Nam, Phương Nam...)",
      },
      {
        cardId: "shinhan-supreme",
        category: "Bệnh viện",
        mccCodes: ["8011", "8062", "8099", "9399"],
        cashbackRate: 6.0,
        minSpendRequired: 3000000,
        maxCashbackPerCategory: 1000000,
        note: "Tích 6% Bệnh viện, Phòng khám, Dịch vụ y tế & Dịch vụ công (MCC 8011, 8062, 8099, 9399)",
      },
      {
        cardId: "shinhan-supreme",
        category: "Bảo hiểm",
        mccCodes: ["5960", "6300", "6381", "6399"],
        cashbackRate: 6.0,
        minSpendRequired: 3000000,
        maxCashbackPerCategory: 1000000,
        note: "Tích 6% Phí bảo hiểm nhân thọ, phi nhân thọ & Trực tuyến (MCC 5960, 6300, 6381, 6399)",
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
