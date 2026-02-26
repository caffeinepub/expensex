import React from 'react';
import { useGetAccounts, useGetTransactions } from '../hooks/useQueries';
import { useSettings } from '../context/SettingsContext';
import { TransactionType } from '../backend';
import BudgetOverview from '../components/BudgetOverview';
import { Skeleton } from '@/components/ui/skeleton';
import { TrendingUp, TrendingDown, Wallet, ArrowUpRight, ArrowDownRight } from 'lucide-react';

export default function HomePage() {
  const { data: accounts = [], isLoading: accountsLoading } = useGetAccounts();
  const { data: transactions = [], isLoading: txLoading } = useGetTransactions();
  const { formatAmount } = useSettings();

  const totalBalance = accounts.reduce((sum, a) => sum + a.balance, 0);

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime() * 1_000_000;

  const monthlyTxs = transactions.filter((tx) => Number(tx.timestamp) >= startOfMonth);
  const monthlyIncome = monthlyTxs
    .filter((tx) => tx.transactionType === TransactionType.income)
    .reduce((s, tx) => s + tx.amount, 0);
  const monthlyExpense = monthlyTxs
    .filter((tx) => tx.transactionType === TransactionType.expense)
    .reduce((s, tx) => s + tx.amount, 0);

  const recentTxs = [...transactions]
    .sort((a, b) => Number(b.timestamp - a.timestamp))
    .slice(0, 5);

  const isLoading = accountsLoading || txLoading;

  return (
    <div className="px-4 py-4 space-y-5 max-w-lg mx-auto page-transition">
      {/* Balance Card */}
      <div className="gradient-primary rounded-2xl p-5 text-white shadow-glow">
        <p className="text-white/70 text-sm font-medium">Total Balance</p>
        {isLoading ? (
          <Skeleton className="h-9 w-40 mt-1 bg-white/20" />
        ) : (
          <p className="text-3xl font-extrabold mt-1">{formatAmount(totalBalance)}</p>
        )}
        <div className="flex gap-4 mt-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
              <ArrowUpRight className="w-4 h-4" />
            </div>
            <div>
              <p className="text-white/70 text-xs">Income</p>
              {isLoading ? (
                <Skeleton className="h-4 w-20 bg-white/20" />
              ) : (
                <p className="text-sm font-semibold">{formatAmount(monthlyIncome)}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
              <ArrowDownRight className="w-4 h-4" />
            </div>
            <div>
              <p className="text-white/70 text-xs">Expense</p>
              {isLoading ? (
                <Skeleton className="h-4 w-20 bg-white/20" />
              ) : (
                <p className="text-sm font-semibold">{formatAmount(monthlyExpense)}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Accounts Summary */}
      {accounts.length > 0 && (
        <div>
          <h3 className="font-semibold text-foreground mb-3 text-sm">My Accounts</h3>
          <div className="flex gap-3 overflow-x-auto pb-1 -mx-1 px-1">
            {accounts.map((acc) => (
              <div
                key={acc.id}
                className="shrink-0 bg-card border border-border/50 rounded-xl p-3 min-w-[130px] shadow-xs"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Wallet className="w-4 h-4 text-primary" />
                  <span className="text-xs font-medium text-muted-foreground truncate">{acc.name}</span>
                </div>
                <p className="text-base font-bold text-foreground">{formatAmount(acc.balance)}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Budget Overview */}
      <BudgetOverview />

      {/* Recent Transactions */}
      <div>
        <h3 className="font-semibold text-foreground mb-3 text-sm">Recent Transactions</h3>
        {isLoading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => <Skeleton key={i} className="h-14 rounded-xl" />)}
          </div>
        ) : recentTxs.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <TrendingUp className="w-10 h-10 mx-auto mb-2 opacity-30" />
            <p className="text-sm">No transactions yet</p>
            <p className="text-xs mt-1">Tap + to add your first transaction</p>
          </div>
        ) : (
          <div className="space-y-2">
            {recentTxs.map((tx) => {
              const isIncome = tx.transactionType === TransactionType.income;
              const isExpense = tx.transactionType === TransactionType.expense;
              return (
                <div
                  key={tx.id}
                  className="flex items-center justify-between p-3 bg-card border border-border/50 rounded-xl"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                        isIncome
                          ? 'bg-green-500/10'
                          : isExpense
                            ? 'bg-red-500/10'
                            : 'bg-blue-500/10'
                      }`}
                    >
                      {isIncome ? (
                        <TrendingUp className="w-4 h-4 text-green-600" />
                      ) : isExpense ? (
                        <TrendingDown className="w-4 h-4 text-red-500" />
                      ) : (
                        <ArrowUpRight className="w-4 h-4 text-blue-500" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{tx.category}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(Number(tx.timestamp) / 1_000_000).toLocaleDateString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                        })}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`text-sm font-semibold ${
                      isIncome ? 'text-green-600' : isExpense ? 'text-red-500' : 'text-blue-500'
                    }`}
                  >
                    {isIncome ? '+' : '-'}{formatAmount(tx.amount)}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="pt-4 pb-2 text-center text-xs text-muted-foreground">
        <p>
          Built with{' '}
          <span className="text-red-500">♥</span>{' '}
          using{' '}
          <a
            href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname || 'expensex')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline font-medium"
          >
            caffeine.ai
          </a>
          {' '}· © {new Date().getFullYear()}
        </p>
      </footer>
    </div>
  );
}
