import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAddTransaction, useGetAccounts, useGetCategories } from '../hooks/useQueries';
import { generateId, nowTimestamp } from '../utils/idGenerator';
import { Loader2, TrendingUp, TrendingDown, ArrowLeftRight } from 'lucide-react';
import { TransactionType } from '../backend';
import { useSettings } from '../context/SettingsContext';
import TransferMoneyModal from './TransferMoneyModal';

interface Props {
  open: boolean;
  onClose: () => void;
}

type TxType = 'income' | 'expense' | 'transfer';

export default function AddTransactionModal({ open, onClose }: Props) {
  const { data: accounts = [] } = useGetAccounts();
  const { data: categories = [] } = useGetCategories();
  const { mutate, isPending } = useAddTransaction();
  const { currencySymbol } = useSettings();

  const [txType, setTxType] = useState<TxType>('expense');
  const [accountId, setAccountId] = useState('');
  const [category, setCategory] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [dateTime, setDateTime] = useState(() => {
    const now = new Date();
    return now.toISOString().slice(0, 16);
  });
  const [showTransfer, setShowTransfer] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!accountId || !category || !amount) return;

    const timestamp = BigInt(new Date(dateTime).getTime()) * BigInt(1_000_000);

    const txTypeMap: Record<TxType, TransactionType> = {
      income: TransactionType.income,
      expense: TransactionType.expense,
      transfer: TransactionType.transfer,
    };

    mutate(
      {
        id: generateId('txn'),
        transactionType: txTypeMap[txType],
        accountId,
        category,
        amount: parseFloat(amount),
        timestamp,
        description: description.trim(),
      },
      {
        onSuccess: () => {
          setTxType('expense');
          setAccountId('');
          setCategory('');
          setAmount('');
          setDescription('');
          setDateTime(new Date().toISOString().slice(0, 16));
          onClose();
        },
      }
    );
  };

  const typeButtons: { type: TxType; label: string; icon: React.ReactNode; color: string }[] = [
    {
      type: 'income',
      label: 'Income',
      icon: <TrendingUp className="w-4 h-4" />,
      color: 'bg-green-500/10 text-green-600 border-green-500/30',
    },
    {
      type: 'expense',
      label: 'Expense',
      icon: <TrendingDown className="w-4 h-4" />,
      color: 'bg-red-500/10 text-red-600 border-red-500/30',
    },
    {
      type: 'transfer',
      label: 'Transfer',
      icon: <ArrowLeftRight className="w-4 h-4" />,
      color: 'bg-blue-500/10 text-blue-600 border-blue-500/30',
    },
  ];

  if (showTransfer) {
    return (
      <TransferMoneyModal
        open={open}
        onClose={() => {
          setShowTransfer(false);
          onClose();
        }}
      />
    );
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-sm max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Transaction</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Type selector */}
          <div className="grid grid-cols-3 gap-2">
            {typeButtons.map(({ type, label, icon, color }) => (
              <button
                key={type}
                type="button"
                onClick={() => {
                  if (type === 'transfer') {
                    setShowTransfer(true);
                  } else {
                    setTxType(type);
                  }
                }}
                className={`flex flex-col items-center gap-1 p-2 rounded-xl border-2 transition-all text-sm font-medium ${
                  txType === type && type !== 'transfer'
                    ? color + ' border-current'
                    : 'border-border text-muted-foreground hover:border-primary/30'
                }`}
              >
                {icon}
                {label}
              </button>
            ))}
          </div>

          <div className="space-y-2">
            <Label>Account</Label>
            <Select value={accountId} onValueChange={setAccountId}>
              <SelectTrigger className="h-11">
                <SelectValue placeholder="Select account" />
              </SelectTrigger>
              <SelectContent>
                {accounts.map((a) => (
                  <SelectItem key={a.id} value={a.id}>
                    {a.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="h-11">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((c) => (
                  <SelectItem key={c.id} value={c.name}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Amount ({currencySymbol})</Label>
            <Input
              type="number"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="h-11"
              min="0.01"
              step="0.01"
            />
          </div>

          <div className="space-y-2">
            <Label>Date & Time</Label>
            <Input
              type="datetime-local"
              value={dateTime}
              onChange={(e) => setDateTime(e.target.value)}
              className="h-11"
            />
          </div>

          <div className="space-y-2">
            <Label>Note (optional)</Label>
            <Textarea
              placeholder="Add a note..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="resize-none"
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!accountId || !category || !amount || isPending}
              className="gradient-primary text-white border-0"
            >
              {isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Add
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
