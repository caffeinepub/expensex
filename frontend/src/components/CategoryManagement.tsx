import React, { useState } from 'react';
import { useGetCategories, useDeleteCategory } from '../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Pencil, Trash2, Tag } from 'lucide-react';
import AddCategoryModal from './AddCategoryModal';
import EditCategoryModal from './EditCategoryModal';
import ConfirmDeleteDialog from './ConfirmDeleteDialog';
import type { Category } from '../backend';
import { Skeleton } from '@/components/ui/skeleton';

export default function CategoryManagement() {
  const { data: categories = [], isLoading } = useGetCategories();
  const { mutate: deleteCategory, isPending: isDeleting } = useDeleteCategory();

  const [showAdd, setShowAdd] = useState(false);
  const [editTarget, setEditTarget] = useState<Category | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);

  const defaultCats = categories.filter((c) => c.isDefault);
  const customCats = categories.filter((c) => !c.isDefault);

  if (isLoading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3].map((i) => <Skeleton key={i} className="h-12 rounded-xl" />)}
      </div>
    );
  }

  const renderCategory = (cat: Category) => (
    <div
      key={cat.id}
      className="flex items-center justify-between p-3 rounded-xl bg-card border border-border/50 hover:border-primary/30 transition-colors"
    >
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
          <Tag className="w-4 h-4 text-primary" />
        </div>
        <span className="text-sm font-medium text-foreground">{cat.name}</span>
        {cat.isDefault && (
          <Badge variant="secondary" className="text-[10px] h-4 px-1.5">
            Default
          </Badge>
        )}
      </div>
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          className="w-7 h-7 text-muted-foreground hover:text-primary"
          onClick={() => setEditTarget(cat)}
        >
          <Pencil className="w-3.5 h-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="w-7 h-7 text-muted-foreground hover:text-destructive"
          onClick={() => setDeleteTarget(cat)}
        >
          <Trash2 className="w-3.5 h-3.5" />
        </Button>
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-foreground">Categories</h3>
        <Button
          size="sm"
          onClick={() => setShowAdd(true)}
          className="gradient-primary text-white border-0 h-8 text-xs"
        >
          <Plus className="w-3 h-3 mr-1" />
          Add
        </Button>
      </div>

      {customCats.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Custom</p>
          {customCats.map(renderCategory)}
        </div>
      )}

      <div className="space-y-2">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Default</p>
        {defaultCats.map(renderCategory)}
      </div>

      <AddCategoryModal open={showAdd} onClose={() => setShowAdd(false)} />
      <EditCategoryModal
        open={!!editTarget}
        onClose={() => setEditTarget(null)}
        category={editTarget}
      />
      <ConfirmDeleteDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (deleteTarget) {
            deleteCategory(deleteTarget.id, { onSuccess: () => setDeleteTarget(null) });
          }
        }}
        title="Delete Category"
        description={`Delete category "${deleteTarget?.name}"? This cannot be undone.`}
        isPending={isDeleting}
      />
    </div>
  );
}
