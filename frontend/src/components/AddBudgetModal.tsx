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
import { Switch } from '@/components/ui/switch';
import { useAddBudget, useGetCategories } from '../hooks/useQueries';
import { generateId } from '../utils/idGenerator';
import { Loader2 } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function AddBudgetModal({ open, onClose }: Props) {
  const { data: categories = [] } = useGetCategories();
  const { mutate, isPending } = useAddBudget();
  const { currencySymbol } = useSettings();

  const [isCategory, setIsCategory] = useState(false);
  const [category, setCategory] = useState('');
  const [amount, setAmount] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount) return;

    mutate(
      {
        id: generateId('budget'),
        amount: parseFloat(amount),
        category: isCategory ? category || undefined : undefined,
        isMonthly: true,
      },
      {
        onSuccess: () => {
          setIsCategory(false);
          setCategory('');
          setAmount('');
          onClose();
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Set Budget</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-center justify-between p-3 rounded-xl bg-muted/50">
            <Label className="cursor-pointer">Category-wise Budget</Label>
            <Switch checked={isCategory} onCheckedChange={setIsCategory} />
          </div>

          {isCategory && (
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
          )}

          <div className="space-y-2">
            <Label>Monthly Budget Amount ({currencySymbol})</Label>
            <Input
              type="number"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="h-11"
              min="1"
              step="0.01"
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!amount || (isCategory && !category) || isPending}
              className="gradient-primary text-white border-0"
            >
              {isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Set Budget
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
