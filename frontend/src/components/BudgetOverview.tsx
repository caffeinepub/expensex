import React, { useState } from 'react';
import { useGetBudgets, useDeleteBudget, useGetTransactions } from '../hooks/useQueries';
import { computeBudgetInfo } from '../utils/budgetCalculations';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, AlertTriangle, AlertCircle, Target } from 'lucide-react';
import AddBudgetModal from './AddBudgetModal';
import ConfirmDeleteDialog from './ConfirmDeleteDialog';
import { useSettings } from '../context/SettingsContext';
import type { Budget } from '../backend';
import { Skeleton } from '@/components/ui/skeleton';

export default function BudgetOverview() {
  const { data: budgets = [], isLoading: budgetsLoading } = useGetBudgets();
  const { data: transactions = [] } = useGetTransactions();
  const { mutate: deleteBudget, isPending: isDeleting } = useDeleteBudget();
  const { formatAmount } = useSettings();

  const [showAdd, setShowAdd] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Budget | null>(null);

  if (budgetsLoading) {
    return (
      <div className="space-y-3">
        {[1, 2].map((i) => (
          <Skeleton key={i} className="h-24 rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-foreground">Monthly Budgets</h3>
        <Button
          size="sm"
          onClick={() => setShowAdd(true)}
          className="gradient-primary text-white border-0 h-8 text-xs"
        >
          <Plus className="w-3 h-3 mr-1" />
          Set Budget
        </Button>
      </div>

      {budgets.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <Target className="w-10 h-10 mx-auto mb-2 opacity-40" />
          <p className="text-sm">No budgets set yet</p>
          <p className="text-xs mt-1">Set a budget to track your spending</p>
        </div>
      ) : (
        <div className="space-y-3">
          {budgets.map((budget) => {
            const { spent, remaining, percentage, status } = computeBudgetInfo(budget, transactions);
            const label = budget.category ? budget.category : 'Overall Monthly';

            return (
              <div
                key={budget.id}
                className={`p-4 rounded-xl border ${
                  status === 'exceeded'
                    ? 'border-destructive/30 bg-destructive/5'
                    : status === 'warning'
                      ? 'border-warning/30 bg-warning/5'
                      : 'border-border bg-card'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm text-foreground">{label}</span>
                      {status === 'exceeded' && (
                        <Badge variant="destructive" className="text-[10px] h-4 px-1">
                          <AlertCircle className="w-2.5 h-2.5 mr-0.5" />
                          Exceeded
                        </Badge>
                      )}
                      {status === 'warning' && (
                        <Badge className="text-[10px] h-4 px-1 bg-warning/20 text-warning-foreground border-warning/30">
                          <AlertTriangle className="w-2.5 h-2.5 mr-0.5" />
                          80%+
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {formatAmount(spent)} of {formatAmount(budget.amount)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-sm font-semibold ${
                        remaining < 0 ? 'text-destructive' : 'text-primary'
                      }`}
                    >
                      {remaining < 0 ? '-' : ''}{formatAmount(Math.abs(remaining))} left
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="w-7 h-7 text-muted-foreground hover:text-destructive"
                      onClick={() => setDeleteTarget(budget)}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
                <Progress
                  value={percentage}
                  className={`h-2 ${
                    status === 'exceeded'
                      ? '[&>div]:bg-destructive'
                      : status === 'warning'
                        ? '[&>div]:bg-warning'
                        : '[&>div]:bg-primary'
                  }`}
                />
                <p className="text-xs text-muted-foreground mt-1 text-right">
                  {percentage.toFixed(0)}% used
                </p>
              </div>
            );
          })}
        </div>
      )}

      <AddBudgetModal open={showAdd} onClose={() => setShowAdd(false)} />

      <ConfirmDeleteDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (deleteTarget) {
            deleteBudget(deleteTarget.id, { onSuccess: () => setDeleteTarget(null) });
          }
        }}
        title="Delete Budget"
        description={`Remove the budget for "${deleteTarget?.category ?? 'Overall Monthly'}"?`}
        isPending={isDeleting}
      />
    </div>
  );
}
