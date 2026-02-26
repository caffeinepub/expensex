import React, { useState } from 'react';
import { useGetAccounts, useDeleteAccount } from '../hooks/useQueries';
import { useSettings } from '../context/SettingsContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, ArrowLeftRight, Wallet, CreditCard, Banknote, Smartphone } from 'lucide-react';
import AddAccountModal from '../components/AddAccountModal';
import TransferMoneyModal from '../components/TransferMoneyModal';
import ConfirmDeleteDialog from '../components/ConfirmDeleteDialog';
import type { Account, AccountType } from '../backend';
import { Skeleton } from '@/components/ui/skeleton';

function getAccountIcon(type: AccountType) {
  switch (type.__kind__) {
    case 'cash': return <Banknote className="w-5 h-5" />;
    case 'bankAccount': return <Wallet className="w-5 h-5" />;
    case 'upi': return <Smartphone className="w-5 h-5" />;
    case 'creditCard': return <CreditCard className="w-5 h-5" />;
    default: return <Wallet className="w-5 h-5" />;
  }
}

function getAccountTypeLabel(type: AccountType): string {
  switch (type.__kind__) {
    case 'cash': return 'Cash';
    case 'bankAccount': return 'Bank Account';
    case 'upi': return 'UPI';
    case 'creditCard': return 'Credit Card';
    case 'custom': return type.custom;
    default: return 'Account';
  }
}

const typeColors: Record<string, string> = {
  cash: 'bg-green-500/10 text-green-600',
  bankAccount: 'bg-blue-500/10 text-blue-600',
  upi: 'bg-purple-500/10 text-purple-600',
  creditCard: 'bg-orange-500/10 text-orange-600',
  custom: 'bg-gray-500/10 text-gray-600',
};

export default function AccountsPage() {
  const { data: accounts = [], isLoading } = useGetAccounts();
  const { mutate: deleteAccount, isPending: isDeleting } = useDeleteAccount();
  const { formatAmount } = useSettings();

  const [showAdd, setShowAdd] = useState(false);
  const [showTransfer, setShowTransfer] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Account | null>(null);

  const totalBalance = accounts.reduce((sum, a) => sum + a.balance, 0);

  return (
    <div className="px-4 py-4 space-y-4 max-w-lg mx-auto page-transition">
      {/* Header */}
      <div className="gradient-primary rounded-2xl p-5 text-white shadow-glow">
        <p className="text-white/70 text-sm">Total Balance</p>
        <p className="text-3xl font-extrabold mt-1">{formatAmount(totalBalance)}</p>
        <p className="text-white/70 text-xs mt-1">{accounts.length} account{accounts.length !== 1 ? 's' : ''}</p>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <Button
          onClick={() => setShowAdd(true)}
          className="flex-1 gradient-primary text-white border-0 h-11"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Account
        </Button>
        <Button
          variant="outline"
          onClick={() => setShowTransfer(true)}
          disabled={accounts.length < 2}
          className="flex-1 h-11"
        >
          <ArrowLeftRight className="w-4 h-4 mr-2" />
          Transfer
        </Button>
      </div>

      {/* Accounts List */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-20 rounded-xl" />)}
        </div>
      ) : accounts.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Wallet className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="font-medium">No accounts yet</p>
          <p className="text-sm mt-1">Add your first account to get started</p>
        </div>
      ) : (
        <div className="space-y-3">
          {accounts.map((acc) => {
            const colorClass = typeColors[acc.accountType.__kind__] ?? typeColors.custom;
            return (
              <div
                key={acc.id}
                className="bg-card border border-border/50 rounded-xl p-4 flex items-center justify-between shadow-xs hover:shadow-card transition-shadow"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${colorClass}`}>
                    {getAccountIcon(acc.accountType)}
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{acc.name}</p>
                    <Badge variant="secondary" className="text-[10px] h-4 px-1.5 mt-0.5">
                      {getAccountTypeLabel(acc.accountType)}
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p
                      className={`font-bold text-base ${
                        acc.balance < 0 ? 'text-destructive' : 'text-foreground'
                      }`}
                    >
                      {formatAmount(acc.balance)}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="w-8 h-8 text-muted-foreground hover:text-destructive"
                    onClick={() => setDeleteTarget(acc)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <AddAccountModal open={showAdd} onClose={() => setShowAdd(false)} />
      <TransferMoneyModal open={showTransfer} onClose={() => setShowTransfer(false)} />
      <ConfirmDeleteDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (deleteTarget) {
            deleteAccount(deleteTarget.id, { onSuccess: () => setDeleteTarget(null) });
          }
        }}
        title="Delete Account"
        description={`Delete "${deleteTarget?.name}"? All associated transactions will remain but the account will be removed.`}
        isPending={isDeleting}
      />
    </div>
  );
}
