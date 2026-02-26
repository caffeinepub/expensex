import React, { useState, useMemo } from 'react';
import { useGetTransactions, useGetAccounts } from '../hooks/useQueries';
import { useSettings } from '../context/SettingsContext';
import { TransactionType } from '../backend';
import {
  getFilteredTransactions,
  getMonthlyBarData,
  getCategoryPieData,
  getSpendingTrendData,
  type TimeFilter,
} from '../utils/chartCalculations';
import { generatePDFReport } from '../utils/pdfGenerator';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
} from 'recharts';
import { Button } from '@/components/ui/button';
import { Download, TrendingUp, TrendingDown, Wallet, BarChart2, PieChart as PieIcon, Activity } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

const PIE_COLORS = [
  '#10b981', '#3b82f6', '#8b5cf6', '#f59e0b',
  '#ef4444', '#06b6d4', '#84cc16', '#f97316',
  '#ec4899', '#14b8a6',
];

const TIME_FILTERS: { label: string; value: TimeFilter }[] = [
  { label: 'Weekly', value: 'weekly' },
  { label: 'Monthly', value: 'monthly' },
  { label: 'Yearly', value: 'yearly' },
];

export default function AnalysisPage() {
  const { data: transactions = [], isLoading } = useGetTransactions();
  const { data: accounts = [] } = useGetAccounts();
  const { formatAmount, currencySymbol } = useSettings();

  const [timeFilter, setTimeFilter] = useState<TimeFilter>('monthly');

  const filtered = useMemo(
    () => getFilteredTransactions(transactions, timeFilter),
    [transactions, timeFilter]
  );

  const totalBalance = accounts.reduce((sum, a) => sum + a.balance, 0);
  const totalIncome = filtered
    .filter((tx) => tx.transactionType === TransactionType.income)
    .reduce((s, tx) => s + tx.amount, 0);
  const totalExpense = filtered
    .filter((tx) => tx.transactionType === TransactionType.expense)
    .reduce((s, tx) => s + tx.amount, 0);

  const barData = useMemo(() => getMonthlyBarData(filtered), [filtered]);
  const pieData = useMemo(() => getCategoryPieData(filtered), [filtered]);
  const trendData = useMemo(() => getSpendingTrendData(filtered, timeFilter), [filtered, timeFilter]);

  const handleDownloadPDF = () => {
    const filterLabel = TIME_FILTERS.find((f) => f.value === timeFilter)?.label ?? 'Monthly';
    generatePDFReport(filtered, accounts, currencySymbol, filterLabel);
  };

  const summaryCards = [
    {
      label: 'Total Balance',
      value: formatAmount(totalBalance),
      icon: Wallet,
      color: 'text-primary',
      bg: 'bg-primary/10',
    },
    {
      label: 'Income',
      value: formatAmount(totalIncome),
      icon: TrendingUp,
      color: 'text-green-600',
      bg: 'bg-green-500/10',
    },
    {
      label: 'Expense',
      value: formatAmount(totalExpense),
      icon: TrendingDown,
      color: 'text-red-500',
      bg: 'bg-red-500/10',
    },
  ];

  return (
    <div className="px-4 py-4 space-y-5 max-w-lg mx-auto page-transition">
      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-3">
        {summaryCards.map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="bg-card border border-border/50 rounded-xl p-3 shadow-xs">
            <div className={`w-8 h-8 rounded-lg ${bg} flex items-center justify-center mb-2`}>
              <Icon className={`w-4 h-4 ${color}`} />
            </div>
            <p className="text-xs text-muted-foreground">{label}</p>
            {isLoading ? (
              <Skeleton className="h-4 w-full mt-1" />
            ) : (
              <p className={`text-sm font-bold mt-0.5 ${color}`}>{value}</p>
            )}
          </div>
        ))}
      </div>

      {/* Time Filter + Download */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex gap-1 bg-muted/50 rounded-xl p-1">
          {TIME_FILTERS.map(({ label, value }) => (
            <button
              key={value}
              onClick={() => setTimeFilter(value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                timeFilter === value
                  ? 'gradient-primary text-white shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={handleDownloadPDF}
          className="h-8 text-xs shrink-0"
        >
          <Download className="w-3 h-3 mr-1" />
          Export
        </Button>
      </div>

      {/* Bar Chart - Monthly Income vs Expense */}
      <div className="bg-card border border-border/50 rounded-xl p-4 shadow-xs">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
            <BarChart2 className="w-3.5 h-3.5 text-primary" />
          </div>
          <p className="text-sm font-semibold text-foreground">Income vs Expense</p>
        </div>
        {isLoading ? (
          <Skeleton className="h-48 w-full rounded-lg" />
        ) : barData.length === 0 ? (
          <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">
            No data for this period
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={barData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="currentColor" strokeOpacity={0.1} />
              <XAxis dataKey="month" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip
                formatter={(value: number) => formatAmount(value)}
                contentStyle={{
                  borderRadius: '8px',
                  fontSize: '12px',
                  border: '1px solid oklch(var(--border))',
                  background: 'oklch(var(--card))',
                  color: 'oklch(var(--card-foreground))',
                }}
              />
              <Legend wrapperStyle={{ fontSize: '11px' }} />
              <Bar dataKey="income" name="Income" fill="#10b981" radius={[3, 3, 0, 0]} />
              <Bar dataKey="expense" name="Expense" fill="#ef4444" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Pie Chart - Category-wise Expense */}
      <div className="bg-card border border-border/50 rounded-xl p-4 shadow-xs">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-7 h-7 rounded-lg bg-purple-500/10 flex items-center justify-center">
            <PieIcon className="w-3.5 h-3.5 text-purple-600" />
          </div>
          <p className="text-sm font-semibold text-foreground">Expense by Category</p>
        </div>
        {isLoading ? (
          <Skeleton className="h-48 w-full rounded-lg" />
        ) : pieData.length === 0 ? (
          <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">
            No expense data for this period
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4">
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={75}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {pieData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number) => formatAmount(value)}
                  contentStyle={{
                    borderRadius: '8px',
                    fontSize: '12px',
                    border: '1px solid oklch(var(--border))',
                    background: 'oklch(var(--card))',
                    color: 'oklch(var(--card-foreground))',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            {/* Legend */}
            <div className="w-full grid grid-cols-2 gap-1.5">
              {pieData.slice(0, 8).map((entry, index) => (
                <div key={entry.name} className="flex items-center gap-1.5">
                  <div
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: PIE_COLORS[index % PIE_COLORS.length] }}
                  />
                  <span className="text-xs text-muted-foreground truncate">{entry.name}</span>
                  <span className="text-xs font-medium text-foreground ml-auto shrink-0">
                    {formatAmount(entry.value)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Line Chart - Spending Trend */}
      <div className="bg-card border border-border/50 rounded-xl p-4 shadow-xs">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-7 h-7 rounded-lg bg-blue-500/10 flex items-center justify-center">
            <Activity className="w-3.5 h-3.5 text-blue-600" />
          </div>
          <p className="text-sm font-semibold text-foreground">Spending Trend</p>
        </div>
        {isLoading ? (
          <Skeleton className="h-48 w-full rounded-lg" />
        ) : trendData.length === 0 ? (
          <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">
            No spending data for this period
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={trendData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="currentColor" strokeOpacity={0.1} />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip
                formatter={(value: number) => formatAmount(value)}
                contentStyle={{
                  borderRadius: '8px',
                  fontSize: '12px',
                  border: '1px solid oklch(var(--border))',
                  background: 'oklch(var(--card))',
                  color: 'oklch(var(--card-foreground))',
                }}
              />
              <Line
                type="monotone"
                dataKey="amount"
                name="Spending"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={{ r: 3, fill: '#3b82f6' }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Footer */}
      <footer className="pt-2 pb-2 text-center text-xs text-muted-foreground">
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
