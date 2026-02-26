import React, { createContext, useContext, useMemo } from 'react';
import { useGetSettings } from '../hooks/useQueries';
import type { AppSettings } from '../backend';

interface SettingsContextValue {
  settings: AppSettings | null | undefined;
  currencySymbol: string;
  language: string;
  formatAmount: (amount: number) => string;
  isLoading: boolean;
}

const SettingsContext = createContext<SettingsContextValue>({
  settings: null,
  currencySymbol: '₹',
  language: 'en',
  formatAmount: (amount) => `₹${amount.toFixed(2)}`,
  isLoading: false,
});

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const { data: settings, isLoading } = useGetSettings();

  const value = useMemo<SettingsContextValue>(() => {
    const symbol = settings?.currency?.symbol ?? '₹';
    const lang = settings?.language ?? 'en';

    return {
      settings: settings ?? null,
      currencySymbol: symbol,
      language: lang,
      formatAmount: (amount: number) => {
        const formatted = Math.abs(amount).toLocaleString('en-IN', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        });
        return `${symbol}${formatted}`;
      },
      isLoading,
    };
  }, [settings, isLoading]);

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings() {
  return useContext(SettingsContext);
}
