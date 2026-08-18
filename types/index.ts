export interface MccItem {
  code: string;
  category: string; // e.g. "Mua sắm", "Ẩm thực", "Du lịch", "Giải trí", "Y tế", "Giáo dục", "Bảo hiểm", "Marketing/Quảng cáo", "Dịch vụ trực tuyến"
  name: string; // Vietnamese name
  description: string;
  popularBrands?: string[];
  isOnlineEligible?: boolean;
}

export type PreviousSpendTier = "tier1" | "tier2" | "tier3"; // tier1: <= 50tr, tier2: > 50tr - 100tr, tier3: > 100tr

export interface CashbackTierRate {
  tier1: number; // <= 50tr (e.g., 5%)
  tier2: number; // > 50tr - 100tr (e.g., 8%)
  tier3: number; // > 100tr (e.g., 10%)
}

export interface CashbackRule {
  cardId: string;
  category: string;
  mccCodes?: string[];
  cashbackRate: number; // Default base rate or fixed rate
  tierRates?: CashbackTierRate; // Dynamic rate based on previous statement cycle spend
  minSpendRequired?: number;
  maxCashbackPerCategory?: number; // Hạn mức tối đa / 1 danh mục / kỳ (VD: 500.000đ cho Family Link & Super Card)
  note?: string;
  isOnlineOnly?: boolean;
  isForeignOnly?: boolean;
  isSavedCardOnly?: boolean;
  fixedCashbackPerTx?: number; // VD: 50.000đ/giao dịch cho thẻ lưu thông tin
  maxSavedCardCashbackPerCycle?: number; // 100.000đ/kỳ
  excludedMcc?: string[];
}

export interface CreditCard {
  id: string;
  name: string;
  bank: string;
  colorGradient: {
    from: string;
    to: string;
    text: string;
    accent: string;
    border: string;
  };
  cardType: string;
  statementDay: number;
  dueDay: number;
  annualFee: number;
  maxCashbackPerMonth: number; // Hạn mức tổng / kỳ (hoặc theo bậc: 800k/1tr/2tr)
  maxCashbackPerCategory?: number; // 500.000đ cho Family Link & Super Card
  features: string[];
  rules: CashbackRule[];
  defaultCashbackRate: number;
  hasPreviousCycleTier?: boolean; // true nếu tỷ lệ hoàn phụ thuộc vào kỳ liền trước (Family Link, Cash Back)
  optimalMonthlySpend?: number; // Mức chi tiêu tối ưu / kỳ sao kê (VD: 16.000.000đ cho Cash Back, 20.000.000đ cho Family Link)
  optimalSpendNote?: string; // Ghi chú chiến lược điểm ngọt chi tiêu
  categoryOptimalSpend?: { [category: string]: number }; // Mức chi tiêu tối ưu theo danh mục (VD: Giáo dục 10tr, Y tế 10tr)
}

export interface Transaction {
  id: string;
  cardId: string;
  mccCode: string;
  mccName?: string;
  amount: number;
  transactionDate: string; // YYYY-MM-DD
  cashbackRate: number;
  cashbackAmount: number;
  note?: string;
  isOnline?: boolean;
  isForeign?: boolean;
  isSavedCard?: boolean;
  createdAt?: string;
}

export interface StatementCycleInfo {
  startDate: Date;
  endDate: Date;
  dueDate: Date;
  daysRemaining: number;
  cycleLabel: string;
  isDueApproaching: boolean;
}

export interface CardSpendingSummary {
  card: CreditCard;
  cycleInfo: StatementCycleInfo;
  totalSpent: number;
  totalCashback: number;
  maxCashback: number;
  maxCashbackPerCategory?: number;
  cashbackPercentage: number;
  isCapReached: boolean;
  optimalSpentTarget: number; // Mốc chi tiêu tối ưu mục tiêu (VD: 16tr hoặc 20tr)
  isOptimalSpendReached: boolean; // Đã đạt mốc chi tiêu tối ưu chưa
  spendProgressPercentage: number; // Tiến độ % chi tiêu so với mốc tối ưu
  transactions: Transaction[];
  categoryBreakdown: {
    [category: string]: {
      spent: number;
      cashback: number;
      isCapReached?: boolean;
      maxCategoryCashback?: number;
      optimalCategorySpend?: number;
      isOptimalCategorySpendReached?: boolean;
      categorySpendProgressPercentage?: number;
    };
  };
}

export interface CardRecommendationResult {
  card: CreditCard;
  rule: CashbackRule;
  cashbackRate: number;
  estimatedCashback: number;
  matchType: "mcc_exact" | "category" | "online" | "foreign" | "saved_card" | "general";
  notes: string[];
  tierSpendLevel?: string;
  maxCategoryCap?: number;
}
