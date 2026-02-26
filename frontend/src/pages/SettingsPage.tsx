import React, { useState } from 'react';
import { useGetSettings, useUpdateSettings, useGetCurrencies } from '../hooks/useQueries';
import { useSettings } from '../context/SettingsContext';
import CategoryManagement from '../components/CategoryManagement';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Loader2, Globe, DollarSign, Tag, Info } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import type { AppSettings } from '../backend';

export default function SettingsPage() {
  const { data: settings, isLoading: settingsLoading } = useGetSettings();
  const { data: currencies = [], isLoading: currenciesLoading } = useGetCurrencies();
  const { mutate: updateSettings, isPending: isSaving } = useUpdateSettings();
  const { currencySymbol } = useSettings();

  const [savingCurrency, setSavingCurrency] = useState(false);
  const [savingLanguage, setSavingLanguage] = useState(false);

  const handleCurrencyChange = (currencyCode: string) => {
    if (!settings) return;
    const selectedCurrency = currencies.find((c) => c.code === currencyCode);
    if (!selectedCurrency) return;

    setSavingCurrency(true);
    const newSettings: AppSettings = {
      currency: selectedCurrency,
      language: settings.language,
    };
    updateSettings(newSettings, {
      onSettled: () => setSavingCurrency(false),
    });
  };

  const handleLanguageChange = (checked: boolean) => {
    if (!settings) return;
    setSavingLanguage(true);
    const newSettings: AppSettings = {
      currency: settings.currency,
      language: checked ? 'hi' : 'en',
    };
    updateSettings(newSettings, {
      onSettled: () => setSavingLanguage(false),
    });
  };

  const isHindi = settings?.language === 'hi';

  return (
    <div className="px-4 py-4 space-y-6 max-w-lg mx-auto page-transition">
      {/* Currency Section */}
      <section className="bg-card border border-border/50 rounded-xl p-4 shadow-xs space-y-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <DollarSign className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground text-sm">Currency</h3>
            <p className="text-xs text-muted-foreground">
              Currently: {currencySymbol} ({settings?.currency?.code ?? 'INR'})
            </p>
          </div>
        </div>

        {settingsLoading || currenciesLoading ? (
          <Skeleton className="h-11 w-full rounded-lg" />
        ) : (
          <div className="flex items-center gap-2">
            <Select
              value={settings?.currency?.code ?? 'INR'}
              onValueChange={handleCurrencyChange}
              disabled={savingCurrency}
            >
              <SelectTrigger className="h-11 flex-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {currencies.map((c) => (
                  <SelectItem key={c.code} value={c.code}>
                    <span className="font-medium">{c.symbol}</span>
                    <span className="ml-2 text-muted-foreground">{c.name} ({c.code})</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {savingCurrency && <Loader2 className="w-4 h-4 animate-spin text-primary shrink-0" />}
          </div>
        )}
      </section>

      {/* Language Section */}
      <section className="bg-card border border-border/50 rounded-xl p-4 shadow-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <Globe className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground text-sm">Language</h3>
              <p className="text-xs text-muted-foreground">
                {isHindi ? 'हिंदी (Hindi)' : 'English'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Label className="text-xs text-muted-foreground">EN</Label>
            {settingsLoading ? (
              <Skeleton className="h-6 w-11 rounded-full" />
            ) : (
              <Switch
                checked={isHindi}
                onCheckedChange={handleLanguageChange}
                disabled={savingLanguage || isSaving}
              />
            )}
            <Label className="text-xs text-muted-foreground">हि</Label>
            {savingLanguage && <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />}
          </div>
        </div>
      </section>

      <Separator />

      {/* Category Management */}
      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center">
            <Tag className="w-4 h-4 text-orange-600" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground text-sm">Categories</h3>
            <p className="text-xs text-muted-foreground">Manage your transaction categories</p>
          </div>
        </div>
        <CategoryManagement />
      </section>

      <Separator />

      {/* App Info */}
      <section className="bg-card border border-border/50 rounded-xl p-4 shadow-xs">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
            <Info className="w-4 h-4 text-muted-foreground" />
          </div>
          <h3 className="font-semibold text-foreground text-sm">About ExpenseX</h3>
        </div>
        <div className="space-y-1.5 text-xs text-muted-foreground">
          <p>Version 1.0.0</p>
          <p>Secure personal finance management on the Internet Computer blockchain.</p>
          <p className="pt-1">
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
        </div>
      </section>
    </div>
  );
}
