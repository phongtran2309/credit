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
  return updated;
}

export function deleteTransaction(id: string): Transaction[] {
  const transactions = getStoredTransactions();
  const updated = transactions.filter((tx) => tx.id !== id);
  saveTransactions(updated);
  return updated;
}

export const CURRENT_DATA_VERSION = "v2.3_shinhan_supreme_added";

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

// Background Supabase Sync Helper
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
