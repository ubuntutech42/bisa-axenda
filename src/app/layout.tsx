
'use client';

import type { Metadata } from 'next';
import { Toaster } from '@/components/ui/toaster';
import { Sidebar } from '@/components/layout/Sidebar';
import { FirebaseClientProvider, useUser } from '@/firebase/client-provider';
import { ThemeProvider } from '@/components/providers/theme-provider';
import { BottomNav } from '@/components/layout/BottomNav';
import { PomodoroProvider, usePomodoro } from '@/context/PomodoroContext';
import { FloatingPomodoro } from '@/components/pomodoro/FloatingPomodoro';
import './globals.css';
import { usePathname } from 'next/navigation';
import { LandingHeader } from '@/components/landing/LandingHeader';
import { Footer } from '@/components/landing/Footer';
import { useEffect } from 'react';
import { useFirestore } from '@/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { createUserProfile } from '@/lib/user';

// export const metadata: Metadata = {
//   title: 'Axénda',
//   description: 'Sua agenda com axé. Organize sua rotina, celebre sua raiz.',
// };

function AppContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { isFloatingPomodoroOpen } = usePomodoro();
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();

  useEffect(() => {
    if (user && firestore) {
      const checkAndCreateUserProfile = async () => {
        const userRef = doc(firestore, "users", user.uid);
        const userSnap = await getDoc(userRef);
        if (!userSnap.exists()) {
          try {
            // Pass the firestore instance directly
            await createUserProfile(user, firestore);
          } catch (error) {
            console.error("Failed to create user profile on-demand:", error);
          }
        }
      };
      checkAndCreateUserProfile();
    }
  }, [user, firestore]);

  const isHomePage = pathname === '/';

  // If user is not logged in and on the homepage, show the landing page layout.
  if (!user && !isUserLoading && isHomePage) {
    return (
      <div className="flex flex-col min-h-screen bg-background">
        <LandingHeader />
        <main className="flex-1">{children}</main>
        <Footer />
      </div>
    );
  }

  // While checking user auth on protected routes, show a loader.
  if (isUserLoading && !isHomePage) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }
  
  // For authenticated users, show the full app layout.
  if (user) {
    return (
      <div className="flex min-h-screen w-full bg-background">
        <Sidebar />
        <div className="flex flex-col flex-1 pb-16 md:pb-0 md:w-0">
          <main className="flex-1 p-4 sm:p-6 lg:p-8">
            {children}
          </main>
        </div>
        <BottomNav />
        <Toaster />
        {isFloatingPomodoroOpen && <FloatingPomodoro onClose={() => {}} />}
      </div>
    );
  }
  
  // For unauthenticated users on non-home, public pages (like /login), render children without any layout.
  return <>{children}</>;
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
      </body>
    </html>
  );
}
