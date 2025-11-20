
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
import { Loader } from 'lucide-react';
import { cn } from '@/lib/utils';
import HomePage from '@/app/page';
import { culturalEvents, quotes } from '@/lib/data';

export function AppContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { isFloatingPomodoroOpen, setIsFloatingPomodoroOpen } = usePomodoro();
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [hasNotifications, setHasNotifications] = useState(true); // Placeholder state

  const isAppPath = pathname !== '/';

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
      if (pathname === '/') {
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

        const timeoutId = setTimeout(checkAndCreateProfile, 2000);
        return () => clearTimeout(timeoutId);
      }

    } else {
      // If user is not logged in and tries to access an app page, redirect to landing
      if (isAppPath && pathname !== '/login' && pathname !== '/register') {
        router.replace('/');
      }
    }
  }, [user, isUserLoading, isAppPath, pathname, router, firestore]);
  
  // Global loader
  if (isUserLoading || (user && pathname === '/')) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <Loader className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  // Unauthenticated user on public paths
  if (!user) {
    if (pathname === '/') {
       return <HomePage />;
    }
    return <>{children}</>;
  }
  
  // Authenticated user on app paths
  if (user && isAppPath) {
    return (
      <div className="flex h-screen w-full bg-background">
        <Sidebar 
          isCollapsed={isSidebarCollapsed} 
          onToggle={() => setIsSidebarCollapsed(prev => !prev)}
          hasNotifications={hasNotifications}
        />
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

  // Fallback for any other case
  return null;
}
