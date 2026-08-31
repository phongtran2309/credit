import { StatementCycleInfo } from "@/types";

/**
 * Calculates current statement cycle info based on card's statement_day and due_day.
 * A statement cycle for a card with statementDay = 20:
 * - If today is Oct 15: cycle is from Sep 21 to Oct 20. Statement date is Oct 20.
 * - If today is Oct 25: cycle is from Oct 21 to Nov 20. Statement date is Nov 20.
 */
export function calculateStatementCycle(
  statementDay: number,
  dueDay: number,
  referenceDate: Date = new Date()
): StatementCycleInfo {
  const currentYear = referenceDate.getFullYear();
  const currentMonth = referenceDate.getMonth(); // 0-indexed
  const currentDay = referenceDate.getDate();

  let startYear = currentYear;
  let startMonth = currentMonth;
  let endYear = currentYear;
  let endMonth = currentMonth;

  if (currentDay > statementDay) {
    // We are currently past the statement date of this month.
    // Cycle is from (This month, statementDay + 1) to (Next month, statementDay)
    startMonth = currentMonth;
    endMonth = currentMonth + 1;
    if (endMonth > 11) {
      endMonth = 0;
      endYear += 1;
    }
  } else {
    // We are before or on the statement date of this month.
    // Cycle is from (Previous month, statementDay + 1) to (This month, statementDay)
    startMonth = currentMonth - 1;
    if (startMonth < 0) {
      startMonth = 11;
      startYear -= 1;
    }
    endMonth = currentMonth;
  }

  // Handle max days in start month
  const maxDaysInStartMonth = new Date(startYear, startMonth + 1, 0).getDate();
  const actualStartDay = Math.min(statementDay + 1, maxDaysInStartMonth);
  const startDate = new Date(startYear, startMonth, actualStartDay, 0, 0, 0, 0);

  // Handle max days in end month
  const maxDaysInEndMonth = new Date(endYear, endMonth + 1, 0).getDate();
  const actualEndDay = Math.min(statementDay, maxDaysInEndMonth);
  const endDate = new Date(endYear, endMonth, actualEndDay, 23, 59, 59, 999);

  // Due date: usually dueDay days after statement date or in the following month on dueDay
  let dueYear = endYear;
  let dueMonth = endMonth;
  if (dueDay <= statementDay) {
    dueMonth += 1;
    if (dueMonth > 11) {
      dueMonth = 0;
      dueYear += 1;
    }
  }
  const maxDaysInDueMonth = new Date(dueYear, dueMonth + 1, 0).getDate();
  const actualDueDay = Math.min(dueDay, maxDaysInDueMonth);
  const dueDate = new Date(dueYear, dueMonth, actualDueDay, 23, 59, 59, 999);

  // Days remaining in this cycle
  const diffTime = endDate.getTime() - referenceDate.getTime();
  const daysRemaining = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

  const formattedStart = `${startDate.getDate()}/${startDate.getMonth() + 1}`;
  const formattedEnd = `${endDate.getDate()}/${endDate.getMonth() + 1}/${endDate.getFullYear()}`;
  const cycleLabel = `Kỳ sao kê: ${formattedStart} - ${formattedEnd}`;

  const dueDiffTime = dueDate.getTime() - referenceDate.getTime();
  const dueDaysRemaining = Math.ceil(dueDiffTime / (1000 * 60 * 60 * 24));
  const isDueApproaching = dueDaysRemaining >= 0 && dueDaysRemaining <= 5;

  return {
    startDate,
    endDate,
    dueDate,
    daysRemaining,
    cycleLabel,
    isDueApproaching,
  };
}

/**
 * Checks if a transaction date falls into a given statement cycle
 */
export function isDateInCycle(dateString: string, cycle: StatementCycleInfo): boolean {
  const tDate = new Date(dateString);
  tDate.setHours(12, 0, 0, 0); // normalize time
  return tDate >= cycle.startDate && tDate <= cycle.endDate;
}

/**
 * Format currency to Vietnamese Dong (VNĐ)
 */
export function formatCurrencyVND(amount: number): string {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format number with comma
 */
/**
 * Thông tin trạng thái nhắc hạn thanh toán
 */
export interface CardPaymentDueStatus {
  card: any;
  cycleInfo: StatementCycleInfo;
  dueDate: Date;
  dueDaysRemaining: number;
  isOverdue: boolean;
  isDueSoon: boolean; // 1-5 ngày
  statusLabel: string;
  urgencyLevel: "critical" | "warning" | "info" | "normal";
  cycleSpentAmount: number;
}

export function getCardPaymentDueStatus(
  card: any,
  transactions: any[] = [],
  referenceDate: Date = new Date()
): CardPaymentDueStatus {
  const cycleInfo = calculateStatementCycle(card.statementDay, card.dueDay, referenceDate);

  // Tính số ngày còn lại đến hạn thanh toán
  const diffTime = cycleInfo.dueDate.getTime() - referenceDate.getTime();
  const dueDaysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  const isOverdue = dueDaysRemaining < 0;
  const isDueSoon = dueDaysRemaining >= 0 && dueDaysRemaining <= 5;

  let urgencyLevel: "critical" | "warning" | "info" | "normal" = "normal";
  let statusLabel = `Hạn ${cycleInfo.dueDate.getDate()}/${cycleInfo.dueDate.getMonth() + 1} (còn ${dueDaysRemaining} ngày)`;

  if (isOverdue) {
    urgencyLevel = "critical";
    statusLabel = `Đã quá hạn (${Math.abs(dueDaysRemaining)} ngày trước)`;
  } else if (dueDaysRemaining === 0) {
    urgencyLevel = "critical";
    statusLabel = `Hạn chót HÔM NAY!`;
  } else if (dueDaysRemaining <= 3) {
    urgencyLevel = "critical";
    statusLabel = `Gấp: Còn ${dueDaysRemaining} ngày`;
  } else if (dueDaysRemaining <= 7) {
    urgencyLevel = "warning";
    statusLabel = `Sắp đến hạn (${dueDaysRemaining} ngày)`;
  } else if (cycleInfo.daysRemaining <= 3) {
    urgencyLevel = "info";
    statusLabel = `Sắp chốt sao kê (còn ${cycleInfo.daysRemaining} ngày)`;
  }

  // Tổng chi tiêu trong kỳ
  const cycleTxs = transactions.filter(
    (tx) => tx.cardId === card.id && isDateInCycle(tx.transactionDate, cycleInfo)
  );
  const cycleSpentAmount = cycleTxs.reduce((sum, tx) => sum + tx.amount, 0);

  return {
    card,
    cycleInfo,
    dueDate: cycleInfo.dueDate,
    dueDaysRemaining,
    isOverdue,
    isDueSoon,
    statusLabel,
    urgencyLevel,
    cycleSpentAmount,
  };
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat("vi-VN").format(num);
}

