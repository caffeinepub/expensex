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
import { useTransferMoney, useGetAccounts } from '../hooks/useQueries';
import { generateId, nowTimestamp } from '../utils/idGenerator';
import { Loader2, ArrowRight } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function TransferMoneyModal({ open, onClose }: Props) {
  const { data: accounts = [] } = useGetAccounts();
  const { mutate, isPending } = useTransferMoney();
  const { currencySymbol } = useSettings();

  const [fromId, setFromId] = useState('');
  const [toId, setToId] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fromId || !toId || !amount || fromId === toId) return;

    mutate(
      {
        fromAccountId: fromId,
        toAccountId: toId,
        amount: parseFloat(amount),
        transactionId: generateId('txn'),
        timestamp: nowTimestamp(),
        description: description.trim(),
      },
      {
        onSuccess: () => {
          setFromId('');
          setToId('');
          setAmount('');
          setDescription('');
          onClose();
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Transfer Money</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-[1fr,auto,1fr] items-end gap-2">
            <div className="space-y-2">
              <Label>From</Label>
              <Select value={fromId} onValueChange={setFromId}>
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="Select" />
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
            <ArrowRight className="w-5 h-5 text-muted-foreground mb-2" />
            <div className="space-y-2">
              <Label>To</Label>
              <Select value={toId} onValueChange={setToId}>
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  {accounts
                    .filter((a) => a.id !== fromId)
                    .map((a) => (
                      <SelectItem key={a.id} value={a.id}>
                        {a.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
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
            <Label>Note (optional)</Label>
            <Input
              placeholder="Transfer note"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="h-11"
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!fromId || !toId || !amount || fromId === toId || isPending}
              className="gradient-primary text-white border-0"
            >
              {isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Transfer
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
