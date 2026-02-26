import type { Transaction } from '../backend';
import { TransactionType } from '../backend';

export type TimeFilter = 'weekly' | 'monthly' | 'yearly';

export function getFilteredTransactions(transactions: Transaction[], filter: TimeFilter): Transaction[] {
  const now = new Date();
  let startMs: number;

  if (filter === 'weekly') {
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1);
    startMs = new Date(now.getFullYear(), now.getMonth(), diff).getTime();
  } else if (filter === 'monthly') {
    startMs = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
  } else {
    startMs = new Date(now.getFullYear(), 0, 1).getTime();
  }

  const startNs = BigInt(startMs) * BigInt(1_000_000);
  return transactions.filter((tx) => tx.timestamp >= startNs);
}

export function computeTotals(transactions: Transaction[], accountBalances: number) {
  const income = transactions
    .filter((tx) => tx.transactionType === TransactionType.income)
    .reduce((sum, tx) => sum + tx.amount, 0);
  const expense = transactions
    .filter((tx) => tx.transactionType === TransactionType.expense)
    .reduce((sum, tx) => sum + tx.amount, 0);
  return { totalBalance: accountBalances, totalIncome: income, totalExpense: expense };
}

export function getMonthlyBarData(transactions: Transaction[]) {
  const map: Record<string, { month: string; income: number; expense: number }> = {};

  transactions.forEach((tx) => {
    const date = new Date(Number(tx.timestamp) / 1_000_000);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    const label = date.toLocaleString('default', { month: 'short', year: '2-digit' });
    if (!map[key]) map[key] = { month: label, income: 0, expense: 0 };
    if (tx.transactionType === TransactionType.income) map[key].income += tx.amount;
    if (tx.transactionType === TransactionType.expense) map[key].expense += tx.amount;
  });

  return Object.entries(map)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([, v]) => v);
}

export function getCategoryPieData(transactions: Transaction[]) {
  const map: Record<string, number> = {};
  transactions
    .filter((tx) => tx.transactionType === TransactionType.expense)
    .forEach((tx) => {
      map[tx.category] = (map[tx.category] ?? 0) + tx.amount;
    });

  return Object.entries(map)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);
}

export function getSpendingTrendData(transactions: Transaction[], filter: TimeFilter) {
  const expenseTxs = transactions.filter((tx) => tx.transactionType === TransactionType.expense);
  const map: Record<string, number> = {};

  expenseTxs.forEach((tx) => {
    const date = new Date(Number(tx.timestamp) / 1_000_000);
    let key: string;
    if (filter === 'weekly') {
      key = date.toLocaleDateString('default', { weekday: 'short' });
    } else if (filter === 'monthly') {
      key = String(date.getDate());
    } else {
      key = date.toLocaleString('default', { month: 'short' });
    }
    map[key] = (map[key] ?? 0) + tx.amount;
  });

  return Object.entries(map).map(([name, amount]) => ({ name, amount }));
}
