import React, { useState } from 'react';
import { Home, List, Plus, BarChart2, Wallet } from 'lucide-react';
import AddTransactionModal from './AddTransactionModal';

interface Props {
  activePage: string;
  onNavigate: (page: string) => void;
}

const navItems = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'records', label: 'Records', icon: List },
  { id: 'add', label: 'Add', icon: Plus, isFab: true },
  { id: 'analysis', label: 'Analysis', icon: BarChart2 },
  { id: 'accounts', label: 'Accounts', icon: Wallet },
];

export default function BottomNavigation({ activePage, onNavigate }: Props) {
  const [showAddModal, setShowAddModal] = useState(false);

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-card border-t border-border/60 shadow-lg">
        <div className="max-w-lg mx-auto flex items-center justify-around px-2 h-16">
          {navItems.map((item) => {
            if (item.isFab) {
              return (
                <button
                  key={item.id}
                  onClick={() => setShowAddModal(true)}
                  className="relative -top-5 w-14 h-14 rounded-full gradient-primary flex items-center justify-center shadow-glow transition-transform active:scale-95 hover:opacity-90"
                  aria-label="Add transaction"
                >
                  <Plus className="w-7 h-7 text-white" />
                </button>
              );
            }

            const Icon = item.icon;
            const isActive = activePage === item.id;

            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg transition-colors min-w-[52px] ${
                  isActive
                    ? 'text-primary'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
                <span className={`text-[10px] font-medium ${isActive ? 'font-semibold' : ''}`}>
                  {item.label}
                </span>
                {isActive && (
                  <span className="absolute bottom-1 w-1 h-1 rounded-full bg-primary" />
                )}
              </button>
            );
          })}
        </div>
      </nav>

      <AddTransactionModal open={showAddModal} onOpenChange={setShowAddModal} />
    </>
  );
}
