import React, { useState } from 'react';
import { useInternetIdentity } from './hooks/useInternetIdentity';
import { useGetCallerUserProfile } from './hooks/useQueries';
import { SettingsProvider } from './context/SettingsContext';
import LoginScreen from './components/LoginScreen';
import ProfileSetupModal from './components/ProfileSetupModal';
import AppLayout from './components/AppLayout';
import HomePage from './pages/HomePage';
import RecordsPage from './pages/RecordsPage';
import AnalysisPage from './pages/AnalysisPage';
import AccountsPage from './pages/AccountsPage';
import SettingsPage from './pages/SettingsPage';
import { Toaster } from '@/components/ui/sonner';
import { ThemeProvider } from 'next-themes';

type Page = 'home' | 'records' | 'analysis' | 'accounts' | 'settings';

function AuthenticatedApp() {
  const [activePage, setActivePage] = useState<Page>('home');
  const { data: userProfile, isLoading: profileLoading, isFetched } = useGetCallerUserProfile();
  const { identity } = useInternetIdentity();

  const isAuthenticated = !!identity;
  // Show profile setup if authenticated, data is loaded, and name is empty or profile is null
  const showProfileSetup =
    isAuthenticated &&
    !profileLoading &&
    isFetched &&
    (userProfile == null || userProfile.name === '');

  const renderPage = () => {
    switch (activePage) {
      case 'home':
        return <HomePage />;
      case 'records':
        return <RecordsPage />;
      case 'analysis':
        return <AnalysisPage />;
      case 'accounts':
        return <AccountsPage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <HomePage />;
    }
  };

  return (
    <>
      <AppLayout
        activePage={activePage}
        onNavigate={(page) => setActivePage(page as Page)}
      >
        {renderPage()}
      </AppLayout>
      <ProfileSetupModal open={showProfileSetup} />
    </>
  );
}

function AppContent() {
  const { identity, isInitializing } = useInternetIdentity();

  // Show spinner while auth client is initializing to prevent flash
  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!identity) {
    return <LoginScreen />;
  }

  return <AuthenticatedApp />;
}

export default function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <SettingsProvider>
        <AppContent />
        <Toaster richColors position="top-center" />
      </SettingsProvider>
    </ThemeProvider>
  );
}
