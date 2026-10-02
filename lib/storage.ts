import { Transaction, CreditCard } from "@/types";
import { DEFAULT_CARDS } from "./data/cards-database";
import { getAllMccItems } from "./data/mcc-database";
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
    window.dispatchEvent(new Event("transaction_updated"));
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
      (async () => {
        try {
          const noteText = targetTx.note || targetTx.mccName || null;
          await client
            .from("transactions")
            .update({
              card_id: targetTx.cardId,
              mcc_code: targetTx.mccCode,
              amount: targetTx.amount,
              transaction_date: targetTx.transactionDate,
              cashback_amount: targetTx.cashbackAmount,
              note: noteText,
            })
            .eq("id", id);
        } catch (e) {
          console.warn("Lỗi cập nhật giao dịch lên Supabase:", e);
        }
      })();
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
    (async () => {
      try {
        await client.from("transactions").delete().eq("id", id);
      } catch (e) {
        console.warn("Lỗi xóa giao dịch trên Supabase:", e);
      }
    })();
  }

  return updated;
}

export const CURRENT_DATA_VERSION = "v2.7_cardholder_tran_van_phong";

export function getStoredCards(): CreditCard[] {
  if (typeof window === "undefined") return DEFAULT_CARDS;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CUSTOM_CARDS);
    if (!raw) {
      localStorage.setItem("mcc_data_version", CURRENT_DATA_VERSION);
      localStorage.setItem(STORAGE_KEYS.CUSTOM_CARDS, JSON.stringify(DEFAULT_CARDS));
      return DEFAULT_CARDS;
    }
    const parsed = JSON.parse(raw);
    const version = localStorage.getItem("mcc_data_version");
    if (version !== CURRENT_DATA_VERSION) {
      localStorage.setItem("mcc_data_version", CURRENT_DATA_VERSION);
      localStorage.setItem(STORAGE_KEYS.CUSTOM_CARDS, JSON.stringify(DEFAULT_CARDS));
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
    window.dispatchEvent(new Event("cards_updated"));
    window.dispatchEvent(new Event("mcc_updated"));
  } catch (e) {
    console.error("Lỗi lưu cards vào localStorage:", e);
  }
}

const DELETED_CARDS_KEY = "mcc_deleted_card_ids";

export function getDeletedCardIds(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(DELETED_CARDS_KEY);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
}

export function recordDeletedCardId(id: string): void {
  if (typeof window === "undefined") return;
  try {
    const ids = getDeletedCardIds();
    ids.add(id);
    localStorage.setItem(DELETED_CARDS_KEY, JSON.stringify(Array.from(ids)));
  } catch {}
}

export function addCard(newCard: CreditCard): CreditCard[] {
  const cards = getStoredCards();
  const updated = [...cards, newCard];
  saveCards(updated);
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("cards_updated"));
  }
  syncCardToSupabase(newCard);
  return updated;
}

export function updateCard(id: string, updates: Partial<CreditCard>): CreditCard[] {
  const cards = getStoredCards();
  const updated = cards.map((c) => (c.id === id ? { ...c, ...updates } : c));
  saveCards(updated);
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("cards_updated"));
  }
  const modified = updated.find((c) => c.id === id);
  if (modified) {
    syncCardToSupabase(modified);
  }
  return updated;
}

export function deleteCard(id: string): CreditCard[] {
  const cards = getStoredCards();
  const updated = cards.filter((c) => c.id !== id);
  saveCards(updated);
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("cards_updated"));
  }
  deleteCardFromSupabase(id);
  return updated;
}

export function duplicateCard(
  sourceCardId: string,
  options: {
    cardholderName: string;
    customName?: string;
    statementDay?: number;
    dueDay?: number;
  }
): CreditCard | null {
  const cards = getStoredCards();
  const source = cards.find((c) => c.id === sourceCardId) || DEFAULT_CARDS.find((c) => c.id === sourceCardId);
  if (!source) return null;

  // Make sure newId stays <= 50 chars for database VARCHAR(50)
  const basePrefix = source.id.replace(/^card-/, "").slice(0, 20);
  const newId = `card-${basePrefix}-${Date.now().toString(36)}`;
  const clonedRules = source.rules.map((r) => ({ ...r, cardId: newId }));
  const newCard: CreditCard = {
    ...source,
    id: newId,
    name: options.customName || source.name,
    cardholderName: options.cardholderName.trim(),
    statementDay: options.statementDay ?? source.statementDay,
    dueDay: options.dueDay ?? source.dueDay,
    rules: clonedRules,
    isCustom: true,
  };

  addCard(newCard);
  return newCard;
}

export function resetToDefaults(): void {
  if (typeof window === "undefined") return;
  localStorage.setItem("mcc_data_version", CURRENT_DATA_VERSION);
  localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(INITIAL_TRANSACTIONS));
  localStorage.setItem(STORAGE_KEYS.CUSTOM_CARDS, JSON.stringify(DEFAULT_CARDS));
  localStorage.removeItem(DELETED_CARDS_KEY);
}

// Background Supabase Sync Helpers for individual card
export async function syncCardToSupabase(card: CreditCard): Promise<void> {
  const client = getSupabaseClient();
  if (!client) return;

  try {
    const cardData = {
      id: card.id,
      name: card.name,
      bank: card.bank,
      cardholder_name: card.cardholderName || null,
      statement_day: card.statementDay,
      due_day: card.dueDay,
      max_cashback_per_month: card.maxCashbackPerMonth ?? null,
      max_cashback_per_category: card.maxCashbackPerCategory ?? null,
      default_cashback_rate: card.defaultCashbackRate ?? 0.1,
    };

    const { error: cardError } = await client.from("cards").upsert(cardData, { onConflict: "id" });
    if (cardError) {
      console.warn("Lỗi đồng bộ thẻ lên Supabase:", cardError);
      return;
    }

    // Đồng bộ cashback_rules cho thẻ
    if (card.rules && card.rules.length > 0) {
      try {
        await client.from("cashback_rules").delete().eq("card_id", card.id);
        const rulesToInsert = card.rules.map((r) => ({
          card_id: card.id,
          category_name: r.category ? r.category.slice(0, 100) : null,
          cashback_rate: Number(r.cashbackRate) || 0,
          min_spend_required: r.minSpendRequired ?? 0,
          max_cashback_per_category: r.maxCashbackPerCategory ?? null,
          is_online_only: Boolean(r.isOnlineOnly),
          is_foreign_only: Boolean(r.isForeignOnly),
          is_saved_card_only: Boolean(r.isSavedCardOnly),
          note: r.note ? r.note.slice(0, 255) : null,
        }));
        await client.from("cashback_rules").insert(rulesToInsert);
      } catch (ruleErr) {
        console.warn("Lỗi sync cashback_rules:", ruleErr);
      }
    }
  } catch (e) {
    console.warn("Không thể đồng bộ thẻ lên Supabase:", e);
  }
}

export async function deleteCardFromSupabase(cardId: string): Promise<void> {
  const client = getSupabaseClient();
  if (!client) return;

  try {
    recordDeletedCardId(cardId);
    await client.from("cards").delete().eq("id", cardId);
  } catch (e) {
    console.warn("Không thể xóa thẻ trên Supabase:", e);
  }
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

    if (!cardsData || cardsData.length === 0) {
      return null;
    }

    const currentCards = getStoredCards();
    const deletedCardIds = getDeletedCardIds();
    const remoteCardIds = new Set(cardsData.map((d: any) => d.id));

    // 1. Đồng bộ thẻ từ local lên Supabase nếu trên Supabase chưa có (ví dụ: thẻ nhân bản trước đó trên thiết bị này)
    const localOnly = currentCards.filter((c) => !remoteCardIds.has(c.id) && !deletedCardIds.has(c.id));
    for (const missing of localOnly) {
      await syncCardToSupabase(missing);
    }

    // 2. Map các thẻ hiện tại
    const cardMap = new Map<string, CreditCard>();
    currentCards.forEach((c) => cardMap.set(c.id, c));

    // 3. Xử lý các thẻ lấy từ Supabase về
    for (const dbCard of cardsData) {
      if (deletedCardIds.has(dbCard.id)) {
        continue;
      }

      const cardRulesData = (rulesData || []).filter((r: any) => r.card_id === dbCard.id);

      if (cardMap.has(dbCard.id)) {
        // Cập nhật thẻ hiện có
        const local = cardMap.get(dbCard.id)!;
        let updatedRules = [...local.rules];
        if (cardRulesData.length > 0) {
          updatedRules = updatedRules.map((rule) => {
            const matchedDbRule = cardRulesData.find((r: any) => {
              if (!r.category_name || !rule.category) return false;
              const rCat = r.category_name.trim().toLowerCase();
              const ruleCat = rule.category.trim().toLowerCase();
              return rCat === ruleCat || rCat.includes(ruleCat) || ruleCat.includes(rCat);
            });

            if (matchedDbRule) {
              const newRate = Number(matchedDbRule.cashback_rate);
              const effectiveRate = !isNaN(newRate) ? newRate : rule.cashbackRate;
              const rawNote = matchedDbRule.note || rule.note || "";
              const formattedNote = rawNote
                ? rawNote.replace(/Hoàn \d+(\.\d+)?%/gi, `Hoàn ${effectiveRate}%`)
                : `Hoàn ${effectiveRate}% cho danh mục ${rule.category}`;

              return {
                ...rule,
                cashbackRate: effectiveRate,
                minSpendRequired:
                  matchedDbRule.min_spend_required !== null && matchedDbRule.min_spend_required !== undefined
                    ? Number(matchedDbRule.min_spend_required)
                    : rule.minSpendRequired,
                maxCashbackPerCategory:
                  matchedDbRule.max_cashback_per_category !== null && matchedDbRule.max_cashback_per_category !== undefined
                    ? Number(matchedDbRule.max_cashback_per_category)
                    : rule.maxCashbackPerCategory,
                note: formattedNote,
              };
            }
            return rule;
          });
        }

        cardMap.set(dbCard.id, {
          ...local,
          statementDay: dbCard.statement_day ?? local.statementDay,
          dueDay: dbCard.due_day ?? local.dueDay,
          maxCashbackPerMonth: dbCard.max_cashback_per_month ?? local.maxCashbackPerMonth,
          maxCashbackPerCategory: dbCard.max_cashback_per_category ?? local.maxCashbackPerCategory,
          name: dbCard.name ?? local.name,
          bank: dbCard.bank ?? local.bank,
          cardholderName: dbCard.cardholder_name ?? local.cardholderName,
          defaultCashbackRate: dbCard.default_cashback_rate ?? local.defaultCashbackRate,
          imageUrl: dbCard.image ?? dbCard.image_url ?? local.imageUrl,
          rules: updatedRules,
        });
      } else {
        // Thẻ có trên Supabase nhưng thiết bị này CHƯA CÓ (ví dụ nhân bản từ thiết bị khác) -> Tái tạo & thêm vào máy này!
        const template =
          DEFAULT_CARDS.find(
            (dc) =>
              dbCard.id.startsWith(`card-${dc.id.replace(/^card-/, "")}`) ||
              dbCard.id.includes(dc.id) ||
              dc.name.toLowerCase() === dbCard.name?.toLowerCase()
          ) || DEFAULT_CARDS[0];

        let cardRules = template.rules.map((r) => ({ ...r, cardId: dbCard.id }));
        if (cardRulesData.length > 0) {
          cardRules = template.rules.map((r) => {
            const matchedDbRule = cardRulesData.find((dbr: any) => {
              if (!dbr.category_name || !r.category) return false;
              const rCat = dbr.category_name.trim().toLowerCase();
              const ruleCat = r.category.trim().toLowerCase();
              return rCat === ruleCat || rCat.includes(ruleCat) || ruleCat.includes(rCat);
            });
            if (matchedDbRule) {
              const newRate = Number(matchedDbRule.cashback_rate);
              return {
                ...r,
                cardId: dbCard.id,
                cashbackRate: !isNaN(newRate) ? newRate : r.cashbackRate,
                minSpendRequired:
                  matchedDbRule.min_spend_required != null
                    ? Number(matchedDbRule.min_spend_required)
                    : r.minSpendRequired,
                maxCashbackPerCategory:
                  matchedDbRule.max_cashback_per_category != null
                    ? Number(matchedDbRule.max_cashback_per_category)
                    : r.maxCashbackPerCategory,
                note: matchedDbRule.note || r.note,
              };
            }
            return { ...r, cardId: dbCard.id };
          });
        }

        const newRemoteCard: CreditCard = {
          ...template,
          id: dbCard.id,
          name: dbCard.name || template.name,
          bank: dbCard.bank || template.bank,
          cardholderName: dbCard.cardholder_name || template.cardholderName,
          statementDay: dbCard.statement_day ?? template.statementDay,
          dueDay: dbCard.due_day ?? template.dueDay,
          maxCashbackPerMonth: dbCard.max_cashback_per_month ?? template.maxCashbackPerMonth,
          maxCashbackPerCategory: dbCard.max_cashback_per_category ?? template.maxCashbackPerCategory,
          defaultCashbackRate: dbCard.default_cashback_rate ?? template.defaultCashbackRate,
          imageUrl: dbCard.image ?? dbCard.image_url ?? template.imageUrl,
          rules: cardRules,
          isCustom: true,
        };

        cardMap.set(dbCard.id, newRemoteCard);
      }
    }

    const mergedList = Array.from(cardMap.values());
    saveCards(mergedList);
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("cards_updated"));
    }
    return mergedList;
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
      // Hợp nhất với danh sách MCC đầy đủ hiện có (từ dictionary và các thẻ /cards) để không bao giờ bị mất mã như 5732
      const currentItems = getAllMccItems();
      const map = new Map<string, any>();
      for (const item of currentItems) {
        map.set(item.code, item);
      }
      for (const d of mccList) {
        if (!map.has(d.code) || map.get(d.code).category === "Khác") {
          map.set(d.code, d);
        }
      }
      const mergedList = Array.from(map.values());
      localStorage.setItem("mcc_custom_codes", JSON.stringify(mergedList));
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

    const supabaseTxs: Transaction[] = data.map((d: any) => {
      const amount = Number(d.amount || 0);
      const cashbackAmount = Number(d.cashback_amount || 0);
      const calculatedRate =
        amount > 0 && cashbackAmount > 0
          ? Number(((cashbackAmount / amount) * 100).toFixed(2))
          : 0;

      return {
        id: d.id,
        cardId: d.card_id,
        mccCode: d.mcc_code || "",
        mccName: d.note || `Giao dịch ${d.mcc_code || ""}`,
        amount,
        transactionDate: d.transaction_date,
        cashbackRate: calculatedRate,
        cashbackAmount,
        note: d.note || "",
        isOnline: false,
        isForeign: false,
        isSavedCard: false,
        createdAt: d.created_at || new Date().toISOString(),
      };
    });

    const localTxs = getStoredTransactions();
    const remoteIds = new Set(supabaseTxs.map((t) => t.id));
    const localOnly = localTxs.filter((t) => !remoteIds.has(t.id) && !t.id.startsWith("tx-sample-"));

    // Sync any local transactions that aren't on Supabase yet
    for (const missing of localOnly) {
      syncTransactionToSupabase(missing);
    }

    // Merge: retain local details if available
    const combinedMap = new Map<string, Transaction>();
    supabaseTxs.forEach((t) => combinedMap.set(t.id, t));
    localTxs.forEach((t) => {
      if (combinedMap.has(t.id)) {
        const remote = combinedMap.get(t.id)!;
        combinedMap.set(t.id, {
          ...remote,
          ...t,
          cashbackRate: t.amount > 0 ? Number(((t.cashbackAmount / t.amount) * 100).toFixed(2)) : t.cashbackRate,
        });
      } else {
        combinedMap.set(t.id, t);
      }
    });

    const mergedList = Array.from(combinedMap.values()).sort(
      (a, b) => new Date(b.transactionDate).getTime() - new Date(a.transactionDate).getTime()
    );

    saveTransactions(mergedList);
    return mergedList;
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
    const noteText = tx.mccName
      ? tx.note
        ? `${tx.mccName} (${tx.note})`
        : tx.mccName
      : tx.note || null;

    await client.from("transactions").upsert({
      id: tx.id,
      card_id: tx.cardId,
      mcc_code: tx.mccCode,
      amount: tx.amount,
      transaction_date: tx.transactionDate,
      cashback_amount: tx.cashbackAmount,
      note: noteText,
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
      data.transactions.forEach((tx: Transaction) => syncTransactionToSupabase(tx));
    }
    if (data.cards && Array.isArray(data.cards)) {
      saveCards(data.cards);
      data.cards.forEach((card: CreditCard) => syncCardToSupabase(card));
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("cards_updated"));
      }
    }
    return true;
  } catch (e) {
    console.error("Lỗi import JSON:", e);
    return false;
  }
}

