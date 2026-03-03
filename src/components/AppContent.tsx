
'use client';

import React, { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Toaster } from '@/components/ui/toaster';
import { Sidebar } from '@/components/layout/Sidebar';
import { useUser, useFirestore } from '@/firebase';
import { BottomNav } from '@/components/layout/BottomNav';
import { usePomodoro } from '@/context/PomodoroContext';
import { FloatingPomodoro } from '@/components/pomodoro/FloatingPomodoro';
import { doc, getDoc } from 'firebase/firestore';
import { createUserProfile } from '@/lib/user';
import { Loader, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { isAppRoute as checkAppRoute, isAuthRoute as checkAuthRoute, ROUTES } from '@/lib/routes';
import { DataMigration } from '@/components/DataMigration';

export function AppContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { isFloatingPomodoroOpen, setIsFloatingPomodoroOpen } = usePomodoro();
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const isAppRoute = checkAppRoute(pathname);
  const isAuthRoute = checkAuthRoute(pathname);

  useEffect(() => {
    if (isUserLoading) return;

    if (user) {
      if (pathname === ROUTES.HOME || isAuthRoute) {
        router.replace(ROUTES.DASHBOARD);
        return;
      }
      
      // Ensure user profile exists
      if (firestore) {
        const userRef = doc(firestore, "users", user.uid);
        const checkAndCreateProfile = async () => {
          try {
            const userSnap = await getDoc(userRef);
            if (!userSnap.exists()) {
              console.log("User profile doesn't exist, creating one...");
              await createUserProfile(user, firestore);
            }
          } catch (error) {
            console.error("Failed to create user profile on-demand:", error);
          }
        };
        // Delay to avoid race conditions on first login
        const timeoutId = setTimeout(checkAndCreateProfile, 2000);
        return () => clearTimeout(timeoutId);
      }

    } else {
      if (isAppRoute) {
        router.replace(ROUTES.HOME);
      }
    }
  }, [user, isUserLoading, pathname, isAppRoute, isAuthRoute, router, firestore]);

  if (isUserLoading || (user && (pathname === ROUTES.HOME || isAuthRoute))) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <Loader className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }
  
  // If user is logged in and on an app route, show the full app layout
  if (user && isAppRoute) {
    return (
      <div className="flex h-screen w-full bg-background relative">
        <DataMigration firestore={firestore} userId={user?.uid ?? null} />
        <Sidebar isCollapsed={isSidebarCollapsed} />
        <div className="hidden md:block">
           <Button
              variant="ghost"
              size="icon"
              className={cn(
                'absolute top-1/2 -translate-y-1/2 bg-card hover:bg-accent-hover border rounded-full h-8 w-8 z-40 transition-all duration-300 ease-in-out',
                isSidebarCollapsed ? 'left-[68px]' : 'left-[244px]'
              )}
              onClick={() => setIsSidebarCollapsed(prev => !prev)}
            >
              {isSidebarCollapsed ? <ChevronRight /> : <ChevronLeft />}
              <span className="sr-only">{isSidebarCollapsed ? 'Expandir' : 'Recolher'} menu</span>
            </Button>
        </div>
        <div className={cn("flex flex-col flex-1 transition-all duration-300 ease-in-out", 
            isSidebarCollapsed ? "md:ml-20" : "md:ml-64"
        )}>
            <main className="flex-1 p-4 sm:p-6 lg:p-8 pb-24 md:pb-8 overflow-y-auto">
              {children}
            </main>
        </div>
        <BottomNav />
        <Toaster />
        {isFloatingPomodoroOpen && <FloatingPomodoro onClose={() => setIsFloatingPomodoroOpen(false)} />}
      </div>
    );
  }

  // If user is not logged in, just show the public page content (landing, login, register)
  if (!user && !isAppRoute) {
    return <>{children}</>;
  }

  // Fallback for any other case (shouldn't happen)
  return null;
}
