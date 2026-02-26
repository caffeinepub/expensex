import React from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Button } from '@/components/ui/button';
import { Loader2, TrendingUp, Shield, BarChart3 } from 'lucide-react';

export default function LoginScreen() {
  const { login, loginStatus } = useInternetIdentity();
  const isLoggingIn = loginStatus === 'logging-in';

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-6 animate-fade-in">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full opacity-10 gradient-primary blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full opacity-10 gradient-primary blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-sm flex flex-col items-center gap-8">
        {/* Logo */}
        <div className="flex flex-col items-center gap-4">
          <div className="w-20 h-20 rounded-2xl gradient-primary flex items-center justify-center shadow-glow">
            <img
              src="/assets/generated/expensex-logo.dim_256x256.png"
              alt="ExpenseX"
              className="w-14 h-14 object-contain"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
            <TrendingUp className="w-10 h-10 text-white hidden" />
          </div>
          <div className="text-center">
            <h1 className="text-3xl font-extrabold text-foreground tracking-tight">ExpenseX</h1>
            <p className="text-muted-foreground text-sm mt-1">Smart Personal Finance Manager</p>
          </div>
        </div>

        {/* Features */}
        <div className="w-full space-y-3">
          {[
            { icon: TrendingUp, label: 'Track Income & Expenses', desc: 'Monitor every transaction' },
            { icon: BarChart3, label: 'Visual Analytics', desc: 'Charts & spending insights' },
            { icon: Shield, label: 'Secure & Private', desc: 'Your data on the blockchain' },
          ].map(({ icon: Icon, label, desc }) => (
            <div key={label} className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border/50">
              <div className="w-9 h-9 rounded-lg gradient-primary flex items-center justify-center shrink-0">
                <Icon className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">{label}</p>
                <p className="text-xs text-muted-foreground">{desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Login Button */}
        <Button
          onClick={login}
          disabled={isLoggingIn}
          className="w-full h-12 text-base font-semibold gradient-primary text-white border-0 rounded-xl shadow-glow hover:opacity-90 transition-opacity"
        >
          {isLoggingIn ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Connecting...
            </>
          ) : (
            'Get Started — Login Securely'
          )}
        </Button>

        <p className="text-xs text-muted-foreground text-center">
          Powered by Internet Identity &bull; No passwords needed
        </p>
      </div>
    </div>
  );
}
