import React, { useState, useMemo } from 'react';
import {
  useGetTransactions,
  useGetAccounts,
  useGetCategories,
  useDeleteTransaction,
  useFilterTransactions,
  useSearchTransactions,
} from '../hooks/useQueries';
import { useSettings } from '../context/SettingsContext';
import { TransactionType } from '../backend';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Search,
  Trash2,
  TrendingUp,
  TrendingDown,
  ArrowLeftRight,
  SlidersHorizontal,
  X,
} from 'lucide-react';
import ConfirmDeleteDialog from '../components/ConfirmDeleteDialog';
import type { Transaction } from '../backend';
import { Skeleton } from '@/components/ui/skeleton';

export default function RecordsPage() {
  const { data: allTransactions = [], isLoading } = useGetTransactions();
  const { data: accounts = [] } = useGetAccounts();
  const { data: categories = [] } = useGetCategories();
  const { mutate: deleteTransaction, isPending: isDeleting } = useDeleteTransaction();
  const { formatAmount } = useSettings();

  const [search, setSearch] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filterCategory, setFilterCategory] = useState('');
  const [filterAccount, setFilterAccount] = useState('');
  const [sortBy, setSortBy] = useState('date_desc');
  const [deleteTarget, setDeleteTarget] = useState<Transaction | null>(null);

  const { data: searchResults } = useSearchTransactions(search);
  const { data: filterResults } = useFilterTransactions({
    startTime: null,
    endTime: null,
    category: filterCategory || null,
    accountId: filterAccount || null,
    sortBy,
  });

  const accountMap = useMemo(
    () => new Map(accounts.map((a) => [a.id, a.name])),
    [accounts]
  );

  const displayedTransactions = useMemo(() => {
    if (search.trim()) return searchResults ?? [];
    if (filterCategory || filterAccount || sortBy !== 'date_desc') return filterResults ?? [];
    return allTransactions.slice().sort((a, b) => Number(b.timestamp - a.timestamp));
  }, [search, searchResults, filterCategory, filterAccount, sortBy, filterResults, allTransactions]);

  const hasActiveFilters = filterCategory || filterAccount || sortBy !== 'date_desc';

  const clearFilters = () => {
    setFilterCategory('');
    setFilterAccount('');
    setSortBy('date_desc');
  };

  return (
    <div className="px-4 py-4 space-y-4 max-w-lg mx-auto page-transition">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search transactions..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 h-11 pr-10"
        />
        {search && (
          <button
            onClick={() => setSearch('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Filter Toggle */}
      <div className="flex items-center gap-2">
        <Button
          variant={showFilters ? 'default' : 'outline'}
          size="sm"
          onClick={() => setShowFilters(!showFilters)}
          className={`h-8 text-xs ${showFilters ? 'gradient-primary text-white border-0' : ''}`}
        >
          <SlidersHorizontal className="w-3 h-3 mr-1" />
          Filters
          {hasActiveFilters && (
            <Badge className="ml-1 h-4 w-4 p-0 text-[9px] flex items-center justify-center bg-white text-primary">
              !
            </Badge>
          )}
        </Button>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="h-8 text-xs text-muted-foreground"
          >
            <X className="w-3 h-3 mr-1" />
            Clear
          </Button>
        )}
        <span className="ml-auto text-xs text-muted-foreground">
          {displayedTransactions.length} records
        </span>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-card border border-border/50 rounded-xl p-4 space-y-3 animate-slide-up">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground">Category</p>
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Categories</SelectItem>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.name}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground">Account</p>
              <Select value={filterAccount} onValueChange={setFilterAccount}>
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Accounts</SelectItem>
                  {accounts.map((a) => (
                    <SelectItem key={a.id} value={a.id}>
                      {a.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground">Sort By</p>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="h-9 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date_desc">Date (Newest First)</SelectItem>
                <SelectItem value="date_asc">Date (Oldest First)</SelectItem>
                <SelectItem value="amount_desc">Amount (High to Low)</SelectItem>
                <SelectItem value="amount_asc">Amount (Low to High)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      {/* Transactions List */}
      {isLoading ? (
        <div className="space-y-2">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-16 rounded-xl" />
          ))}
        </div>
      ) : displayedTransactions.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Search className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="font-medium">No transactions found</p>
          <p className="text-sm mt-1">Try adjusting your search or filters</p>
        </div>
      ) : (
        <div className="space-y-2">
          {displayedTransactions.map((tx) => {
            const isIncome = tx.transactionType === TransactionType.income;
            const isExpense = tx.transactionType === TransactionType.expense;
            const date = new Date(Number(tx.timestamp) / 1_000_000);

            return (
              <div
                key={tx.id}
                className="bg-card border border-border/50 rounded-xl p-3 flex items-center gap-3 hover:border-primary/20 transition-colors"
              >
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    isIncome ? 'bg-green-500/10' : isExpense ? 'bg-red-500/10' : 'bg-blue-500/10'
                  }`}
                >
                  {isIncome ? (
                    <TrendingUp className="w-4 h-4 text-green-600" />
                  ) : isExpense ? (
                    <TrendingDown className="w-4 h-4 text-red-500" />
                  ) : (
                    <ArrowLeftRight className="w-4 h-4 text-blue-500" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-foreground truncate">{tx.category}</p>
                    <Badge variant="outline" className="text-[10px] h-4 px-1 shrink-0">
                      {accountMap.get(tx.accountId) ?? 'Unknown'}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <p className="text-xs text-muted-foreground">
                      {date.toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: '2-digit',
                      })}
                    </p>
                    {tx.description && (
                      <p className="text-xs text-muted-foreground truncate">· {tx.description}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span
                    className={`text-sm font-bold ${
                      isIncome ? 'text-green-600' : isExpense ? 'text-red-500' : 'text-blue-500'
                    }`}
                  >
                    {isIncome ? '+' : '-'}{formatAmount(tx.amount)}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="w-7 h-7 text-muted-foreground hover:text-destructive"
                    onClick={() => setDeleteTarget(tx)}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <ConfirmDeleteDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (deleteTarget) {
            deleteTransaction(deleteTarget.id, { onSuccess: () => setDeleteTarget(null) });
          }
        }}
        title="Delete Transaction"
        description={`Delete this ${deleteTarget?.category} transaction of ${deleteTarget ? formatAmount(deleteTarget.amount) : ''}?`}
        isPending={isDeleting}
      />
    </div>
  );
}
