import { Transaction, CreditCard } from "@/types";
import { DEFAULT_CARDS } from "./data/cards-database";
import { getSupabaseClient } from "./supabase";

const STORAGE_KEYS = {
  TRANSACTIONS: "mcc_transactions_data",
  CUSTOM_CARDS: "mcc_custom_cards",
  SETTINGS: "mcc_user_settings",
};

// Initial sample transactions for quick demonstration
const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: "tx-sample-1",
    cardId: "vib-super-card",
    mccCode: "5812",
    mccName: "Haidilao Hotpot Buffet",
    amount: 1850000,
    transactionDate: new Date().toISOString().split("T")[0],
    cashbackRate: 15.0,
    cashbackAmount: 277500,
    note: "Ăn tối gia đình cuối tuần",
    isOnline: false,
    isForeign: false,
    isSavedCard: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: "tx-sample-2",
    cardId: "vib-family-link",
    mccCode: "6300",
    mccName: "Phí Bảo hiểm Manulife Định kỳ",
    amount: 6000000,
    transactionDate: new Date(Date.now() - 3 * 86400000).toISOString().split("T")[0],
    cashbackRate: 10.0,
    cashbackAmount: 600000,
    note: "Đóng phí bảo hiểm nhân thọ",
    isOnline: true,
    isForeign: false,
    isSavedCard: false,
    createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
  },
  {
    id: "tx-sample-3",
    cardId: "vib-online-plus-2in1",
    mccCode: "5815",
    mccName: "Netflix Premium & Spotify Family",
    amount: 320000,
    transactionDate: new Date(Date.now() - 5 * 86400000).toISOString().split("T")[0],
    cashbackRate: 5.0,
    cashbackAmount: 16000,
    note: "Gia hạn tự động qua thẻ đã lưu",
    isOnline: true,
    isForeign: false,
    isSavedCard: true,
    createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
  },
  {
    id: "tx-sample-4",
    cardId: "vib-cash-back",
    mccCode: "7311",
    mccName: "Chạy Quảng cáo Facebook Ads",
    amount: 4500000,
    transactionDate: new Date(Date.now() - 8 * 86400000).toISOString().split("T")[0],
    cashbackRate: 10.0,
    cashbackAmount: 450000,
    note: "Ngân sách Ads chiến dịch Tết",
    isOnline: true,
    isForeign: true,
    isSavedCard: false,
    createdAt: new Date(Date.now() - 8 * 86400000).toISOString(),
  },
];

export function getStoredTransactions(): Transaction[] {
  if (typeof window === "undefined") return INITIAL_TRANSACTIONS;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(INITIAL_TRANSACTIONS));
      return INITIAL_TRANSACTIONS;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error("Lỗi đọc transactions từ localStorage:", e);
    return INITIAL_TRANSACTIONS;
  }
}

export function saveTransactions(transactions: Transaction[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
  } catch (e) {
    console.error("Lỗi lưu transactions vào localStorage:", e);
  }
}

export function addTransaction(transaction: Omit<Transaction, "id" | "createdAt">): Transaction {
  const transactions = getStoredTransactions();
  const newTx: Transaction = {
    ...transaction,
    id: `tx-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    createdAt: new Date().toISOString(),
  };
  const updated = [newTx, ...transactions];
  saveTransactions(updated);

  // Sync to Supabase in background if client is ready
  syncTransactionToSupabase(newTx);

  return newTx;
}

export function updateTransaction(id: string, updates: Partial<Transaction>): Transaction[] {
  const transactions = getStoredTransactions();
  const updated = transactions.map((tx) => (tx.id === id ? { ...tx, ...updates } : tx));
  saveTransactions(updated);

  // Sync update to Supabase in background
  const client = getSupabaseClient();
  if (client) {
    const targetTx = updated.find((t) => t.id === id);
    if (targetTx) {
      client
        .from("transactions")
        .update({
          card_id: targetTx.cardId,
          mcc_code: targetTx.mccCode,
          amount: targetTx.amount,
          transaction_date: targetTx.transactionDate,
          cashback_amount: targetTx.cashbackAmount,
          note: targetTx.note || null,
        })
        .eq("id", id)
        .then(() => {})
        .catch((e) => console.warn("Lỗi cập nhật giao dịch lên Supabase:", e));
    }
  }

  return updated;
}

export function deleteTransaction(id: string): Transaction[] {
  const transactions = getStoredTransactions();
  const updated = transactions.filter((tx) => tx.id !== id);
  saveTransactions(updated);

  // Sync delete to Supabase in background
  const client = getSupabaseClient();
  if (client) {
    client
      .from("transactions")
      .delete()
      .eq("id", id)
      .then(() => {})
      .catch((e) => console.warn("Lỗi xóa giao dịch trên Supabase:", e));
  }

  return updated;
}

export const CURRENT_DATA_VERSION = "v2.4_shinhan_statement_25";

export function getStoredCards(): CreditCard[] {
  if (typeof window === "undefined") return DEFAULT_CARDS;
  try {
    const storedVersion = localStorage.getItem("mcc_data_version");
    // If version changed or cache is outdated, auto-refresh with latest DEFAULT_CARDS
    if (storedVersion !== CURRENT_DATA_VERSION) {
      localStorage.setItem("mcc_data_version", CURRENT_DATA_VERSION);
      localStorage.setItem(STORAGE_KEYS.CUSTOM_CARDS, JSON.stringify(DEFAULT_CARDS));
      return DEFAULT_CARDS;
    }

    const raw = localStorage.getItem(STORAGE_KEYS.CUSTOM_CARDS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.CUSTOM_CARDS, JSON.stringify(DEFAULT_CARDS));
      return DEFAULT_CARDS;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      return DEFAULT_CARDS;
    }
    return parsed;
  } catch (e) {
    console.error("Lỗi đọc cards từ localStorage:", e);
    return DEFAULT_CARDS;
  }
}

export function saveCards(cards: CreditCard[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEYS.CUSTOM_CARDS, JSON.stringify(cards));
  } catch (e) {
    console.error("Lỗi lưu cards vào localStorage:", e);
  }
}

export function resetToDefaults(): void {
  if (typeof window === "undefined") return;
  localStorage.setItem("mcc_data_version", CURRENT_DATA_VERSION);
  localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(INITIAL_TRANSACTIONS));
  localStorage.setItem(STORAGE_KEYS.CUSTOM_CARDS, JSON.stringify(DEFAULT_CARDS));
}

// Background Supabase Sync Helpers for cards & cashback_rules
export async function syncCardsFromSupabase(): Promise<CreditCard[] | null> {
  const client = getSupabaseClient();
  if (!client) return null;

  try {
    const [cardsRes, rulesRes] = await Promise.all([
      client.from("cards").select("*"),
      client.from("cashback_rules").select("*"),
    ]);

    const cardsData = cardsRes.data;
    const rulesData = rulesRes.data;

    if ((!cardsData || cardsData.length === 0) && (!rulesData || rulesData.length === 0)) {
      return null;
    }

    const currentCards = getStoredCards();
    const updated = currentCards.map((c) => {
      const dbCard = cardsData?.find((d: any) => d.id === c.id);

      // Update rules from Supabase cashback_rules if available
      let updatedRules = [...c.rules];
      if (rulesData && rulesData.length > 0) {
        const cardRules = rulesData.filter((r: any) => r.card_id === c.id);
        if (cardRules.length > 0) {
          updatedRules = updatedRules.map((rule) => {
            // Match rule by category_name
            const matchedDbRule = cardRules.find((r: any) => {
              if (!r.category_name || !rule.category) return false;
              const rCat = r.category_name.trim().toLowerCase();
              const ruleCat = rule.category.trim().toLowerCase();
              return rCat === ruleCat || rCat.includes(ruleCat) || ruleCat.includes(rCat);
            });

            if (matchedDbRule) {
              const newRate = Number(matchedDbRule.cashback_rate);
              return {
                ...rule,
                cashbackRate: !isNaN(newRate) ? newRate : rule.cashbackRate,
                minSpendRequired:
                  matchedDbRule.min_spend_required !== null && matchedDbRule.min_spend_required !== undefined
                    ? Number(matchedDbRule.min_spend_required)
                    : rule.minSpendRequired,
                maxCashbackPerCategory:
                  matchedDbRule.max_cashback_per_category !== null && matchedDbRule.max_cashback_per_category !== undefined
                    ? Number(matchedDbRule.max_cashback_per_category)
                    : rule.maxCashbackPerCategory,
                note: matchedDbRule.note || rule.note,
              };
            }
            return rule;
          });
        }
      }

      if (dbCard) {
        return {
          ...c,
          statementDay: dbCard.statement_day ?? c.statementDay,
          dueDay: dbCard.due_day ?? c.dueDay,
          maxCashbackPerMonth: dbCard.max_cashback_per_month ?? c.maxCashbackPerMonth,
          maxCashbackPerCategory: dbCard.max_cashback_per_category ?? c.maxCashbackPerCategory,
          name: dbCard.name ?? c.name,
          bank: dbCard.bank ?? c.bank,
          defaultCashbackRate: dbCard.default_cashback_rate ?? c.defaultCashbackRate,
          rules: updatedRules,
        };
      }

      return {
        ...c,
        rules: updatedRules,
      };
    });

    saveCards(updated);
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("cards_updated"));
    }
    return updated;
  } catch (e) {
    console.warn("Lỗi sync cards từ Supabase:", e);
    return null;
  }
}

// Background Supabase Sync Helpers for mcc_codes
export async function syncMccCodesFromSupabase(): Promise<any[] | null> {
  const client = getSupabaseClient();
  if (!client) return null;

  try {
    const { data, error } = await client.from("mcc_codes").select("*");
    if (error || !data || data.length === 0) return null;

    const mccList = data.map((d: any) => ({
      code: String(d.code),
      category: d.category_name || "Khác",
      name: d.name || `Mã ${d.code}`,
      description: d.description || "",
      popularBrands: [],
      isOnlineEligible: true,
    }));

    if (typeof window !== "undefined") {
      localStorage.setItem("mcc_custom_codes", JSON.stringify(mccList));
      window.dispatchEvent(new Event("mcc_updated"));
    }
    return mccList;
  } catch (e) {
    console.warn("Lỗi sync MCC codes từ Supabase:", e);
    return null;
  }
}

// Background Supabase Sync Helpers for transactions
export async function syncTransactionsFromSupabase(): Promise<Transaction[] | null> {
  const client = getSupabaseClient();
  if (!client) return null;

  try {
    const { data, error } = await client
      .from("transactions")
      .select("*")
      .order("transaction_date", { ascending: false });

    if (error || !data) return null;

    const txList: Transaction[] = data.map((d: any) => ({
      id: d.id,
      cardId: d.card_id,
      mccCode: d.mcc_code || "",
      mccName: d.note || `Giao dịch ${d.mcc_code || ""}`,
      amount: Number(d.amount),
      transactionDate: d.transaction_date,
      cashbackRate: 0,
      cashbackAmount: Number(d.cashback_amount || 0),
      note: d.note || "",
      isOnline: false,
      isForeign: false,
      isSavedCard: false,
      createdAt: d.created_at || new Date().toISOString(),
    }));

    saveTransactions(txList);
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("transaction_updated"));
    }
    return txList;
  } catch (e) {
    console.warn("Lỗi sync transactions từ Supabase:", e);
    return null;
  }
}

// Master sync function for all 4 tables
export async function syncAllDataFromSupabase(): Promise<void> {
  await Promise.allSettled([
    syncCardsFromSupabase(),
    syncMccCodesFromSupabase(),
    syncTransactionsFromSupabase(),
  ]);
}

async function syncTransactionToSupabase(tx: Transaction) {
  const client = getSupabaseClient();
  if (!client) return;

  try {
    await client.from("transactions").insert({
      id: tx.id,
      card_id: tx.cardId,
      mcc_code: tx.mccCode,
      amount: tx.amount,
      transaction_date: tx.transactionDate,
      cashback_amount: tx.cashbackAmount,
      note: tx.note || null,
    });
  } catch (e) {
    console.warn("Không thể đồng bộ giao dịch lên Supabase:", e);
  }
}

// Export / Import
export function exportDataAsJson(): string {
  const data = {
    version: "1.0",
    exportDate: new Date().toISOString(),
    transactions: getStoredTransactions(),
    cards: getStoredCards(),
  };
  return JSON.stringify(data, null, 2);
}

export function importDataFromJson(jsonStr: string): boolean {
  try {
    const data = JSON.parse(jsonStr);
    if (data.transactions && Array.isArray(data.transactions)) {
      saveTransactions(data.transactions);
    }
    if (data.cards && Array.isArray(data.cards)) {
      saveCards(data.cards);
    }
    return true;
  } catch (e) {
    console.error("Lỗi import JSON:", e);
    return false;
  }
}
