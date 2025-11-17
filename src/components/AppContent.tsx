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
import { Loader } from 'lucide-react';
import LandingLayout from '@/app/landing/layout';
import LandingPage from '@/app/landing/page';
import { FloatingActions } from './layout/FloatingActions';
import { cn } from '@/lib/utils';
import { FloatingNotifications } from './layout/FloatingNotifications';

export function AppContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { isFloatingPomodoroOpen, setIsFloatingPomodoroOpen } = usePomodoro();
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [hasNotifications, setHasNotifications] = useState(true); // Placeholder state


  const publicPaths = ['/login', '/register'];
  const isPublicPath = publicPaths.includes(pathname);
  const isLandingPage = pathname === '/';


  useEffect(() => {
    if (isUserLoading) return; // Do nothing while loading

    if (user) {
      if (isPublicPath) {
        // Logged-in user on a public-only path, redirect to dashboard
        router.replace('/dashboard');
      }
      // Check and create profile if it doesn't exist
      const checkAndCreateUserProfile = async () => {
        if (firestore) {
          const userRef = doc(firestore, "users", user.uid);
          const userSnap = await getDoc(userRef);
          if (!userSnap.exists()) {
            try {
              await createUserProfile(user, firestore);
            } catch (error) {
              console.error("Failed to create user profile on-demand:", error);
            }
          }
        }
      };
      checkAndCreateUserProfile();
    } else {
      // Not logged-in user
      if (!isPublicPath && !isLandingPage) {
        // Trying to access a protected page, redirect to login
        router.replace('/login');
      }
    }
  }, [user, isUserLoading, isPublicPath, isLandingPage, pathname, router, firestore]);
  
  if (isUserLoading || (!user && !isPublicPath && !isLandingPage) || (user && isPublicPath)) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <Loader className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }
  
  if(isLandingPage && !user) {
    return (
        <LandingLayout>
            <LandingPage/>
        </LandingLayout>
    )
  }

  if (user) {
    // For authenticated users, show the full app layout on non-public paths.
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
        <FloatingActions />
        <FloatingNotifications hasNotifications={hasNotifications} />
        <Toaster />
        {isFloatingPomodoroOpen && <FloatingPomodoro onClose={() => setIsFloatingPomodoroOpen(false)} />}
      </div>
    );
  }

  // If user is not authenticated, and it's a public path, show children
  if (!user && isPublicPath) {
    return <>{children}</>;
  }


  // Fallback just in case, though it should not be reached with the useEffect logic.
  return (
    <div className="flex items-center justify-center h-screen bg-background">
      <Loader className="h-10 w-10 animate-spin text-primary" />
    </div>
  );
}
