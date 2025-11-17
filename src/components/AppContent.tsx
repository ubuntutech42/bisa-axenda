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
import LandingLayout from '@/app/landing/layout';
import LandingPage from '@/app/landing/page';
import { cn } from '@/lib/utils';

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
    if (isUserLoading) return;

    if (user) {
      if (isPublicPath) {
        router.replace('/dashboard');
        return;
      }
      
      if (!firestore) return;

      const userRef = doc(firestore, "users", user.uid);
      const unsubscribe = onSnapshot(userRef, (userSnap) => {
        if (!userSnap.exists()) {
           // User doc doesn't exist, maybe it's being created.
           // Let's not rush to create it again, just wait.
           // It might be created by the login flow with Google data.
        }
      }, (error) => {
        console.error("Error listening to user profile:", error);
      });

      // Simple one-time check to create profile if it's missing after a short delay
      setTimeout(async () => {
        const userSnap = await getDoc(userRef);
        if (!userSnap.exists()) {
          console.log("User profile doesn't exist, creating one...");
          try {
            await createUserProfile(user, firestore);
          } catch (error) {
            console.error("Failed to create user profile on-demand:", error);
          }
        }
      }, 2000); // 2-second delay to allow login flow to complete

      return () => unsubscribe();

    } else {
      if (!isPublicPath && !isLandingPage) {
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
