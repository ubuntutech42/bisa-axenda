'use client';

import React, { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Toaster } from '@/components/ui/toaster';
import { Sidebar } from '@/components/layout/Sidebar';
import { useUser, useFirestore } from '@/firebase';
import { BottomNav } from '@/components/layout/BottomNav';
import { usePomodoro } from '@/context/PomodoroContext';
import { FloatingPomodoro } from '@/components/pomodoro/FloatingPomodoro';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';
import { createUserProfile } from '@/lib/user';
import { Loader } from 'lucide-react';
import { cn } from '@/lib/utils';

export function AppContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { isFloatingPomodoroOpen, setIsFloatingPomodoroOpen } = usePomodoro();
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [hasNotifications, setHasNotifications] = useState(true); // Placeholder state

  const nonAppPaths = ['/', '/login', '/register'];
  const isAppPath = !nonAppPaths.includes(pathname);

  useEffect(() => {
    if (isUserLoading) return;

    if (user) {
      // If user is logged in and on a non-app page (like landing or login), redirect to dashboard
      if (!isAppPath) {
        router.replace('/dashboard');
        return;
      }
      
      // If user is logged in, ensure their profile exists
      if (firestore) {
        const userRef = doc(firestore, "users", user.uid);
        
        // Simple one-time check to create profile if it's missing after a short delay
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

        const timeoutId = setTimeout(checkAndCreateProfile, 2000); // 2-second delay
        return () => clearTimeout(timeoutId);
      }

    } else {
      // If user is not logged in and tries to access an app page, redirect to landing
      if (isAppPath) {
        router.replace('/');
      }
    }
  }, [user, isUserLoading, isAppPath, pathname, router, firestore]);
  
  // Show a global loader while checking auth state, or if a redirect is imminent
  if (isUserLoading || (user && !isAppPath) || (!user && isAppPath)) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <Loader className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  // If it's not an app path and user is not logged in, render the public page (e.g., landing, login)
  if (!isAppPath && !user) {
    return <>{children}</>;
  }
  
  // If user is authenticated and it's an app path, show the full app layout
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

  // Fallback for any other case (should not be reached)
  return <>{children}</>;
}
