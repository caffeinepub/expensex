import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type {
  Account,
  Transaction,
  Category,
  Budget,
  AppSettings,
  UserProfile,
  Currency,
} from '../backend';

// ── User Profile ──────────────────────────────────────────────────────────────

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error('Actor not available');
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

// ── Accounts ──────────────────────────────────────────────────────────────────

export function useGetAccounts() {
  const { actor, isFetching } = useActor();

  return useQuery<Account[]>({
    queryKey: ['accounts'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAccounts();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddAccount() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (account: Account) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addAccount(account);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
    },
  });
}

export function useDeleteAccount() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (accountId: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteAccount(accountId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },
  });
}

export function useTransferMoney() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      fromAccountId: string;
      toAccountId: string;
      amount: number;
      transactionId: string;
      timestamp: bigint;
      description: string;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.transferMoney(
        params.fromAccountId,
        params.toAccountId,
        params.amount,
        params.transactionId,
        params.timestamp,
        params.description
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },
  });
}

// ── Transactions ──────────────────────────────────────────────────────────────

export function useGetTransactions() {
  const { actor, isFetching } = useActor();

  return useQuery<Transaction[]>({
    queryKey: ['transactions'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getTransactions();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddTransaction() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (transaction: Transaction) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addTransaction(transaction);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
    },
  });
}

export function useDeleteTransaction() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (transactionId: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteTransaction(transactionId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
    },
  });
}

export function useSearchTransactions(keyword: string) {
  const { actor, isFetching } = useActor();

  return useQuery<Transaction[]>({
    queryKey: ['transactions', 'search', keyword],
    queryFn: async () => {
      if (!actor) return [];
      return actor.searchTransactions(keyword);
    },
    enabled: !!actor && !isFetching && keyword.trim().length > 0,
  });
}

export function useFilterTransactions(params: {
  startTime: bigint | null;
  endTime: bigint | null;
  category: string | null;
  accountId: string | null;
  sortBy: string;
}) {
  const { actor, isFetching } = useActor();

  // Serialize bigint values to strings for the query key to avoid BigInt-in-key lint error
  const queryKey = [
    'transactions',
    'filter',
    {
      startTime: params.startTime !== null ? params.startTime.toString() : null,
      endTime: params.endTime !== null ? params.endTime.toString() : null,
      category: params.category,
      accountId: params.accountId,
      sortBy: params.sortBy,
    },
  ];

  return useQuery<Transaction[]>({
    queryKey,
    queryFn: async () => {
      if (!actor) return [];
      return actor.filterTransactions(
        params.startTime,
        params.endTime,
        params.category,
        params.accountId,
        params.sortBy
      );
    },
    enabled: !!actor && !isFetching,
  });
}

// ── Categories ────────────────────────────────────────────────────────────────

export function useGetCategories() {
  const { actor, isFetching } = useActor();

  return useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getCategories();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddCategory() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (category: Category) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addCategory(category);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
}

export function useEditCategory() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ categoryId, newName }: { categoryId: string; newName: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.editCategory(categoryId, newName);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },
  });
}

export function useDeleteCategory() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (categoryId: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteCategory(categoryId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
}

// ── Budgets ───────────────────────────────────────────────────────────────────

export function useGetBudgets() {
  const { actor, isFetching } = useActor();

  return useQuery<Budget[]>({
    queryKey: ['budgets'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getBudgets();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddBudget() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (budget: Budget) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addBudget(budget);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
    },
  });
}

export function useDeleteBudget() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (budgetId: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteBudget(budgetId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
    },
  });
}

// ── Settings ──────────────────────────────────────────────────────────────────

export function useGetSettings() {
  const { actor, isFetching } = useActor();

  return useQuery<AppSettings | null>({
    queryKey: ['settings'],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getSettings();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useUpdateSettings() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (settings: AppSettings) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateSettings(settings);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
    },
  });
}

export function useGetCurrencies() {
  const { actor } = useActor();

  return useQuery<Currency[]>({
    queryKey: ['currencies'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getCurrencies();
    },
    enabled: !!actor,
  });
}
