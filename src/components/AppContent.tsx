
'use client';

import React, { useEffect } from 'react';
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

export function AppContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
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
            await createUserProfile(user, firestore);
          } catch (error) {
            console.error("Failed to create user profile on-demand:", error);
          }
        }
      };
      checkAndCreateUserProfile();
    }
  }, [user, firestore]);
  
  // These are the public-only paths
  const publicPaths = ['/login', '/register'];
  const isPublicPath = publicPaths.includes(pathname);
  const isLandingPage = pathname === '/';

  if (isUserLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <Loader className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }
  
  if(isLandingPage) {
    return (
        <LandingLayout>
            <LandingPage/>
        </LandingLayout>
    )
  }

  if (user) {
    // If user is logged in, but tries to access a public-only path, redirect to dashboard
    if (isPublicPath) {
      router.replace('/dashboard');
      return (
        <div className="flex items-center justify-center h-screen bg-background">
            <Loader className="h-10 w-10 animate-spin text-primary" />
        </div>
      );
    }
    // For authenticated users, show the full app layout.
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

  // If user is not authenticated
  if (!user) {
      // Allow access to public paths
      if (isPublicPath) {
          return <>{children}</>;
      }
      // For any other path, redirect to login
      router.replace('/login');
      return (
        <div className="flex items-center justify-center h-screen bg-background">
            <Loader className="h-10 w-10 animate-spin text-primary" />
        </div>
      );
  }

  // Fallback just in case, though it should not be reached.
  return <>{children}</>;
}
