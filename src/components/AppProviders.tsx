'use client';

import { useEffect } from 'react';
import dynamic from 'next/dynamic';
import { ThemeProvider } from '@/components/providers/theme-provider';
import { Loader } from 'lucide-react';

const FirebaseAppShell = dynamic(
  () => import('@/components/FirebaseAppShell').then((mod) => {
    // #region agent log
    if (typeof fetch !== 'undefined') fetch('http://127.0.0.1:7478/ingest/67b52dda-7cfc-4e99-9fbb-9d237c3be7a6',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'80706c'},body:JSON.stringify({sessionId:'80706c',location:'AppProviders.tsx:FirebaseAppShell loaded',message:'Dynamic chunk FirebaseAppShell loaded',data:{t:Date.now()},timestamp:Date.now(),hypothesisId:'D'})}).catch(()=>{});
    // #endregion
    return mod.FirebaseAppShell;
  }),
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
  // #region agent log
  useEffect(() => {
    if (typeof fetch !== 'undefined') fetch('http://127.0.0.1:7478/ingest/67b52dda-7cfc-4e99-9fbb-9d237c3be7a6',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'80706c'},body:JSON.stringify({sessionId:'80706c',location:'AppProviders.tsx:mount',message:'AppProviders mounted',data:{t:Date.now()},timestamp:Date.now(),hypothesisId:'E'})}).catch(()=>{});
  }, []);
  // #endregion
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
