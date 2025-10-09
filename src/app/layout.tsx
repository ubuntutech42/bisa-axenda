
'use client';

import type { Metadata } from 'next';
import { Toaster } from '@/components/ui/toaster';
import { Sidebar } from '@/components/layout/Sidebar';
import { FirebaseClientProvider } from '@/firebase/client-provider';
import { ThemeProvider } from '@/components/providers/theme-provider';
import { BottomNav } from '@/components/layout/BottomNav';
import { PomodoroProvider, usePomodoro } from '@/context/PomodoroContext';
import { FloatingPomodoro } from '@/components/pomodoro/FloatingPomodoro';
import './globals.css';

// export const metadata: Metadata = {
//   title: 'Axénda',
//   description: 'Sua agenda com axé. Organize sua rotina, celebre sua raiz.',
// };

function AppLayout({ children }: { children: React.ReactNode }) {
  const { isFloatingPomodoroOpen, setIsFloatingPomodoroOpen } = usePomodoro();

  return (
    <>
      <div className="flex min-h-screen w-full bg-background">
        <Sidebar />
        <div className="flex flex-col flex-1 pb-16 md:pb-0">
          <main className="flex-1 p-4 sm:p-6 lg:p-8">
            {children}
          </main>
        </div>
        <BottomNav />
        <Toaster />
        {isFloatingPomodoroOpen && <FloatingPomodoro onClose={() => setIsFloatingPomodoroOpen(false)} />}
      </div>
    </>
  );
}


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <title>Axénda</title>
        <meta name="description" content="Sua agenda com axé. Organize sua rotina, celebre sua raiz." />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
        >
            <FirebaseClientProvider>
              <PomodoroProvider>
                <AppLayout>
                  {children}
                </AppLayout>
              </PomodoroProvider>
            </FirebaseClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
