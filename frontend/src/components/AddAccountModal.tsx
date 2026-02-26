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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAddAccount } from '../hooks/useQueries';
import { generateId } from '../utils/idGenerator';
import { Loader2 } from 'lucide-react';
import type { AccountType } from '../backend';

interface Props {
  open: boolean;
  onClose: () => void;
}

const ACCOUNT_TYPES = [
  { value: 'cash', label: 'Cash' },
  { value: 'bankAccount', label: 'Bank Account' },
  { value: 'upi', label: 'UPI' },
  { value: 'creditCard', label: 'Credit Card' },
  { value: 'custom', label: 'Custom' },
];

export default function AddAccountModal({ open, onClose }: Props) {
  const [name, setName] = useState('');
  const [type, setType] = useState('cash');
  const [customType, setCustomType] = useState('');
  const [balance, setBalance] = useState('0');
  const { mutate, isPending } = useAddAccount();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    let accountType: AccountType;
    if (type === 'cash') accountType = { __kind__: 'cash', cash: null };
    else if (type === 'bankAccount') accountType = { __kind__: 'bankAccount', bankAccount: null };
    else if (type === 'upi') accountType = { __kind__: 'upi', upi: null };
    else if (type === 'creditCard') accountType = { __kind__: 'creditCard', creditCard: null };
    else accountType = { __kind__: 'custom', custom: customType || 'Custom' };

    mutate(
      {
        id: generateId('acc'),
        name: name.trim(),
        accountType,
        balance: parseFloat(balance) || 0,
      },
      {
        onSuccess: () => {
          setName('');
          setType('cash');
          setCustomType('');
          setBalance('0');
          onClose();
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Add Account</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Account Name</Label>
            <Input
              placeholder="e.g. HDFC Savings"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-11"
            />
          </div>
          <div className="space-y-2">
            <Label>Account Type</Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger className="h-11">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ACCOUNT_TYPES.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {type === 'custom' && (
            <div className="space-y-2">
              <Label>Custom Type Name</Label>
              <Input
                placeholder="e.g. Wallet"
                value={customType}
                onChange={(e) => setCustomType(e.target.value)}
                className="h-11"
              />
            </div>
          )}
          <div className="space-y-2">
            <Label>Initial Balance</Label>
            <Input
              type="number"
              placeholder="0.00"
              value={balance}
              onChange={(e) => setBalance(e.target.value)}
              className="h-11"
              min="0"
              step="0.01"
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!name.trim() || isPending}
              className="gradient-primary text-white border-0"
            >
              {isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Add Account
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
