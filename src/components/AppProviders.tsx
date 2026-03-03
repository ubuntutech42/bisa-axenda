'use client';

import dynamic from 'next/dynamic';
import { ThemeProvider } from '@/components/providers/theme-provider';
import { Loader } from 'lucide-react';

const FirebaseAppShell = dynamic(
  () => import('@/components/FirebaseAppShell').then((mod) => mod.FirebaseAppShell),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Loader className="h-10 w-10 animate-spin text-primary" aria-hidden />
      </div>
    ),
  }
);

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <FirebaseAppShell>{children}</FirebaseAppShell>
    </ThemeProvider>
  );
}
