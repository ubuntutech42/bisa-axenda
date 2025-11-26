
'use client';

import React, { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Toaster } from '@/components/ui/toaster';
import { Sidebar } from '@/components/layout/Sidebar';
import { useUser, useFirestore } from '@/firebase';
import { BottomNav } from '@/components/layout/BottomNav';
import { usePomodoro } from '@/context/PomodoroContext';
import { FloatingPomodoro } from '@/components/pomodoro/FloatingPomodoro';
import { doc, getDoc, collection, writeBatch } from 'firebase/firestore';
import { createUserProfile } from '@/lib/user';
import { Loader, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { culturalEvents, quotes } from '@/lib/data';
import { Button } from '@/components/ui/button';

export function AppContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { isFloatingPomodoroOpen, setIsFloatingPomodoroOpen } = usePomodoro();
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const isAppRoute = !['/', '/login', '/register'].includes(pathname);
  const isAuthRoute = ['/login', '/register'].includes(pathname);

  // One-time data migration
  useEffect(() => {
    if (firestore && user) {
      const runMigration = async () => {
        const migrationStatus = localStorage.getItem('axenda_migration_v1');
        if (migrationStatus === 'completed') {
          return;
        }

        console.log('Running one-time data migration...');
        const batch = writeBatch(firestore);

        // Migrate quotes if they exist in the data file
        if (quotes && quotes.length > 0) {
          const quotesCol = collection(firestore, 'quotes');
          quotes.forEach(quote => {
            const docRef = doc(quotesCol);
            batch.set(docRef, { ...quote, createdAt: new Date() });
          });
        }
        
        // Migrate cultural events if they exist
        if (culturalEvents && culturalEvents.length > 0) {
            const eventsCol = collection(firestore, 'culturalEvents');
            culturalEvents.forEach(event => {
                const docRef = doc(eventsCol);
                batch.set(docRef, { ...event, createdAt: new Date() });
            });
        }

        try {
          await batch.commit();
          console.log('Migration completed successfully.');
          localStorage.setItem('axenda_migration_v1', 'completed');
        } catch (error) {
          console.error('Error during data migration:', error);
        }
      };

      runMigration();
    }
  }, [firestore, user]);


  useEffect(() => {
    if (isUserLoading) return;

    if (user) {
      // If user is logged in, redirect away from public-only pages
      if (pathname === '/' || isAuthRoute) {
        router.replace('/dashboard');
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
      // If user is not logged in and tries to access an app page, redirect to landing
      if (isAppRoute) {
        router.replace('/');
      }
    }
  }, [user, isUserLoading, pathname, isAppRoute, isAuthRoute, router, firestore]);
  
  // Global loader: show on initial load or when redirecting a logged-in user from a public page
  if (isUserLoading || (user && (pathname === '/' || isAuthRoute))) {
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
