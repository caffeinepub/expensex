import React from 'react';
import BottomNavigation from './BottomNavigation';
import DarkModeToggle from './DarkModeToggle';
import { Settings, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useQueryClient } from '@tanstack/react-query';
import { useGetCallerUserProfile } from '../hooks/useQueries';

interface Props {
  activePage: string;
  onNavigate: (page: string) => void;
  children: React.ReactNode;
}

export default function AppLayout({ activePage, onNavigate, children }: Props) {
  const { clear } = useInternetIdentity();
  const queryClient = useQueryClient();
  const { data: profile } = useGetCallerUserProfile();

  const handleLogout = async () => {
    await clear();
    queryClient.clear();
  };

  const pageTitle: Record<string, string> = {
    home: 'Dashboard',
    records: 'Records',
    analysis: 'Analysis',
    accounts: 'Accounts',
    settings: 'Settings',
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-card/80 backdrop-blur-md border-b border-border/50 px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg gradient-primary flex items-center justify-center">
            <img
              src="/assets/generated/expensex-logo.dim_256x256.png"
              alt="X"
              className="w-5 h-5 object-contain"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          </div>
          <span className="font-bold text-foreground text-base">
            {pageTitle[activePage] ?? 'ExpenseX'}
          </span>
        </div>

        <div className="flex items-center gap-1">
          {profile?.name && (
            <span className="text-xs text-muted-foreground mr-1 hidden sm:block">
              Hi, {profile.name}
            </span>
          )}
          <DarkModeToggle />
          <Button
            variant="ghost"
            size="icon"
            className="w-9 h-9 rounded-lg"
            onClick={() => onNavigate('settings')}
            aria-label="Settings"
          >
            <Settings className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="w-9 h-9 rounded-lg text-destructive hover:text-destructive"
            onClick={handleLogout}
            aria-label="Logout"
          >
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 pb-safe overflow-y-auto">
        <div className="animate-fade-in">{children}</div>
      </main>

      {/* Bottom Navigation */}
      <BottomNavigation activePage={activePage} onNavigate={onNavigate} />
    </div>
  );
}
