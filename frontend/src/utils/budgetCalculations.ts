import type { Transaction, Budget } from '../backend';
import { TransactionType } from '../backend';

export function getCurrentMonthExpenses(transactions: Transaction[]): Transaction[] {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime() * 1_000_000;
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59).getTime() * 1_000_000;

  return transactions.filter(
    (tx) =>
      tx.transactionType === TransactionType.expense &&
      Number(tx.timestamp) >= startOfMonth &&
      Number(tx.timestamp) <= endOfMonth
  );
}

export function getTotalSpending(transactions: Transaction[]): number {
  return transactions.reduce((sum, tx) => sum + tx.amount, 0);
}

export function getCategorySpending(transactions: Transaction[]): Record<string, number> {
  return transactions.reduce(
    (acc, tx) => {
      acc[tx.category] = (acc[tx.category] ?? 0) + tx.amount;
      return acc;
    },
    {} as Record<string, number>
  );
}

export function getBudgetStatus(spent: number, budget: number): 'normal' | 'warning' | 'exceeded' {
  const pct = budget > 0 ? (spent / budget) * 100 : 0;
  if (pct >= 100) return 'exceeded';
  if (pct >= 80) return 'warning';
  return 'normal';
}

export function getBudgetPercentage(spent: number, budget: number): number {
  if (budget <= 0) return 0;
  return Math.min((spent / budget) * 100, 100);
}

export function computeBudgetInfo(
  budget: Budget,
  transactions: Transaction[]
): {
  spent: number;
  remaining: number;
  percentage: number;
  status: 'normal' | 'warning' | 'exceeded';
} {
  const monthlyExpenses = getCurrentMonthExpenses(transactions);
  let spent = 0;

  if (budget.category) {
    spent = monthlyExpenses
      .filter((tx) => tx.category === budget.category)
      .reduce((sum, tx) => sum + tx.amount, 0);
  } else {
    spent = getTotalSpending(monthlyExpenses);
  }

  const remaining = budget.amount - spent;
  const percentage = getBudgetPercentage(spent, budget.amount);
  const status = getBudgetStatus(spent, budget.amount);

  return { spent, remaining, percentage, status };
}
