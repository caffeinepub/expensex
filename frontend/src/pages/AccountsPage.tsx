import { useState } from 'react';
import { Plus, Trash2, ArrowLeftRight, Wallet, CreditCard, Banknote, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import { useGetAccounts, useAddAccount, useDeleteAccount, useGetSettings } from '@/hooks/useQueries';
import TransferMoneyModal from '@/components/TransferMoneyModal';
import { AccountType } from '@/backend';

function getAccountIcon(type: AccountType) {
  switch (type.__kind__) {
    case 'bankAccount': return <Banknote className="h-5 w-5" />;
    case 'cash': return <Wallet className="h-5 w-5" />;
    case 'upi': return <Smartphone className="h-5 w-5" />;
    case 'creditCard': return <CreditCard className="h-5 w-5" />;
    default: return <Wallet className="h-5 w-5" />;
  }
}

function getAccountTypeLabel(type: AccountType): string {
  switch (type.__kind__) {
    case 'bankAccount': return 'Bank Account';
    case 'cash': return 'Cash';
    case 'upi': return 'UPI';
    case 'creditCard': return 'Credit Card';
    case 'custom': return type.custom;
    default: return 'Account';
  }
}

export default function AccountsPage() {
  const [addOpen, setAddOpen] = useState(false);
  const [transferOpen, setTransferOpen] = useState(false);
  const [transferFromId, setTransferFromId] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Add account form state
  const [name, setName] = useState('');
  const [accountTypeKey, setAccountTypeKey] = useState('bankAccount');
  const [customTypeName, setCustomTypeName] = useState('');
  const [balance, setBalance] = useState('');

  const { data: accounts = [], isLoading } = useGetAccounts();
  const { data: settings } = useGetSettings();
  const addAccount = useAddAccount();
  const deleteAccount = useDeleteAccount();

  const currencySymbol = settings?.currency?.symbol ?? '₹';

  const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);

  const resetAddForm = () => {
    setName('');
    setAccountTypeKey('bankAccount');
    setCustomTypeName('');
    setBalance('');
  };

  const buildAccountType = (): AccountType => {
    switch (accountTypeKey) {
      case 'bankAccount': return { __kind__: 'bankAccount', bankAccount: null };
      case 'cash': return { __kind__: 'cash', cash: null };
      case 'upi': return { __kind__: 'upi', upi: null };
      case 'creditCard': return { __kind__: 'creditCard', creditCard: null };
      default: return { __kind__: 'custom', custom: customTypeName || 'Custom' };
    }
  };

  const handleAddAccount = () => {
    if (!name.trim()) return;
    const parsedBalance = parseFloat(balance) || 0;

    addAccount.mutate(
      {
        id: `acc_${Date.now()}_${Math.random().toString(36).slice(2)}`,
        name: name.trim(),
        accountType: buildAccountType(),
        balance: parsedBalance,
      },
      {
        onSuccess: () => {
          resetAddForm();
          setAddOpen(false);
        },
      }
    );
  };

  const handleDeleteAccount = (id: string) => {
    deleteAccount.mutate(id, {
      onSuccess: () => setDeleteConfirmId(null),
    });
  };

  const handleOpenTransfer = (accountId: string) => {
    setTransferFromId(accountId);
    setTransferOpen(true);
  };

  return (
    <div className="p-4 pb-24 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Accounts</h1>
          <p className="text-sm text-muted-foreground">
            Total: {currencySymbol}{totalBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </p>
        </div>
        <Button onClick={() => setAddOpen(true)} size="sm">
          <Plus className="h-4 w-4 mr-1" />
          Add Account
        </Button>
      </div>

      {/* Accounts List */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : accounts.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Wallet className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground">No accounts yet. Add your first account!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {accounts.map((acc) => (
            <Card key={acc.id} className="overflow-hidden">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-primary/10 text-primary shrink-0">
                    {getAccountIcon(acc.accountType)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-foreground truncate">{acc.name}</p>
                    <p className="text-xs text-muted-foreground">{getAccountTypeLabel(acc.accountType)}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className={`font-bold text-lg ${acc.balance < 0 ? 'text-destructive' : 'text-foreground'}`}>
                      {currencySymbol}{acc.balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2 mt-3 pt-3 border-t border-border">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleOpenTransfer(acc.id)}
                  >
                    <ArrowLeftRight className="h-3.5 w-3.5 mr-1" />
                    Transfer
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={() => setDeleteConfirmId(acc.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add Account Dialog */}
      <Dialog open={addOpen} onOpenChange={(v) => { if (!v) resetAddForm(); setAddOpen(v); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Account</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1">
              <Label htmlFor="acc-name">Account Name</Label>
              <Input
                id="acc-name"
                placeholder="e.g. SBI Savings"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label>Account Type</Label>
              <Select value={accountTypeKey} onValueChange={setAccountTypeKey}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent position="popper" className="z-[200]">
                  <SelectItem value="bankAccount">Bank Account</SelectItem>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="upi">UPI</SelectItem>
                  <SelectItem value="creditCard">Credit Card</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {accountTypeKey === 'custom' && (
              <div className="space-y-1">
                <Label htmlFor="custom-type">Custom Type Name</Label>
                <Input
                  id="custom-type"
                  placeholder="e.g. Wallet"
                  value={customTypeName}
                  onChange={(e) => setCustomTypeName(e.target.value)}
                />
              </div>
            )}
            <div className="space-y-1">
              <Label htmlFor="acc-balance">Opening Balance</Label>
              <Input
                id="acc-balance"
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={balance}
                onChange={(e) => setBalance(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { resetAddForm(); setAddOpen(false); }}>
              Cancel
            </Button>
            <Button
              onClick={handleAddAccount}
              disabled={!name.trim() || addAccount.isPending}
            >
              {addAccount.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adding...
                </>
              ) : (
                'Add Account'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm Dialog */}
      <Dialog open={!!deleteConfirmId} onOpenChange={(v) => { if (!v) setDeleteConfirmId(null); }}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Account</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground py-2">
            Are you sure you want to delete this account? This action cannot be undone.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirmId(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteConfirmId && handleDeleteAccount(deleteConfirmId)}
              disabled={deleteAccount.isPending}
            >
              {deleteAccount.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Transfer Money Modal */}
      <TransferMoneyModal
        open={transferOpen}
        onOpenChange={setTransferOpen}
        defaultFromAccountId={transferFromId}
      />
    </div>
  );
}
