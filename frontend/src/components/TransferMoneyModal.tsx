import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import { useGetAccounts, useTransferMoney } from '@/hooks/useQueries';

interface TransferMoneyModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultFromAccountId?: string;
}

export default function TransferMoneyModal({ open, onOpenChange, defaultFromAccountId }: TransferMoneyModalProps) {
  const [fromAccountId, setFromAccountId] = useState(defaultFromAccountId ?? '');
  const [toAccountId, setToAccountId] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');

  const { data: accounts = [] } = useGetAccounts();
  const transferMoney = useTransferMoney();

  const resetForm = () => {
    setFromAccountId(defaultFromAccountId ?? '');
    setToAccountId('');
    setAmount('');
    setDescription('');
  };

  const handleSubmit = () => {
    const parsedAmount = parseFloat(amount);
    if (!fromAccountId || !toAccountId || !amount || isNaN(parsedAmount) || parsedAmount <= 0) return;
    if (fromAccountId === toAccountId) return;

    const timestamp = BigInt(Date.now()) * 1_000_000n;

    transferMoney.mutate(
      {
        fromAccountId,
        toAccountId,
        amount: parsedAmount,
        transactionId: `tx_transfer_${Date.now()}_${Math.random().toString(36).slice(2)}`,
        timestamp,
        description,
      },
      {
        onSuccess: () => {
          resetForm();
          onOpenChange(false);
        },
      }
    );
  };

  const isValid =
    !!fromAccountId &&
    !!toAccountId &&
    fromAccountId !== toAccountId &&
    !!amount &&
    !isNaN(parseFloat(amount)) &&
    parseFloat(amount) > 0;

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) resetForm(); onOpenChange(v); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Transfer Money</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* From Account */}
          <div className="space-y-1">
            <Label>From Account</Label>
            <Select value={fromAccountId} onValueChange={setFromAccountId}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select source account" />
              </SelectTrigger>
              <SelectContent position="popper" className="z-[200]">
                {accounts.map((acc) => (
                  <SelectItem key={acc.id} value={acc.id}>
                    {acc.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* To Account */}
          <div className="space-y-1">
            <Label>To Account</Label>
            <Select value={toAccountId} onValueChange={setToAccountId}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select destination account" />
              </SelectTrigger>
              <SelectContent position="popper" className="z-[200]">
                {accounts
                  .filter((acc) => acc.id !== fromAccountId)
                  .map((acc) => (
                    <SelectItem key={acc.id} value={acc.id}>
                      {acc.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          {/* Amount */}
          <div className="space-y-1">
            <Label htmlFor="transfer-amount">Amount</Label>
            <Input
              id="transfer-amount"
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>

          {/* Description */}
          <div className="space-y-1">
            <Label htmlFor="transfer-description">Description (optional)</Label>
            <Input
              id="transfer-description"
              placeholder="Add a note..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {fromAccountId && toAccountId && fromAccountId === toAccountId && (
            <p className="text-sm text-destructive">Source and destination accounts must be different.</p>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => { resetForm(); onOpenChange(false); }}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!isValid || transferMoney.isPending}
          >
            {transferMoney.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Transferring...
              </>
            ) : (
              'Transfer'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
