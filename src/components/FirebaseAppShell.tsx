'use client';

import { FirebaseClientProvider } from '@/firebase/client-provider';
import { PomodoroProvider } from '@/context/PomodoroContext';
import { AppContent } from './AppContent';
import { FirebaseErrorListener } from './FirebaseErrorListener';

/**
 * Shell que encapsula toda a árvore que depende do Firebase.
 * Carregado apenas no client (via dynamic import com ssr: false) para evitar
 * ChunkLoadError ao solicitar chunks do Firebase durante o RSC/layout.
 */
export function FirebaseAppShell({ children }: { children: React.ReactNode }) {
  return (
    <FirebaseClientProvider>
      <PomodoroProvider>
        <FirebaseErrorListener />
        <AppContent>
          {children}
        </AppContent>
      </PomodoroProvider>
    </FirebaseClientProvider>
  );
}
