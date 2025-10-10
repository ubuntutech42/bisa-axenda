
'use client';

import { ThemeProvider } from '@/components/providers/theme-provider';
import { FirebaseClientProvider } from '@/firebase/client-provider';
import { PomodoroProvider } from '@/context/PomodoroContext';
import { AppContent } from './AppContent';

export function AppProviders({ children }: { children: React.ReactNode }) {
    return (
        <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
        >
            <FirebaseClientProvider>
              <PomodoroProvider>
                <AppContent>
                  {children}
                </AppContent>
              </PomodoroProvider>
            </FirebaseClientProvider>
        </ThemeProvider>
    );
}
