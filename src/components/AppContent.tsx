
'use client';

import React, { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Toaster } from '@/components/ui/toaster';
import { Sidebar } from '@/components/layout/Sidebar';
import { useUser, useFirestore, useAuth } from '@/firebase';
import { BottomNav } from '@/components/layout/BottomNav';
import { usePomodoro } from '@/context/PomodoroContext';
import { FloatingPomodoro } from '@/components/pomodoro/FloatingPomodoro';
import { doc, getDoc } from 'firebase/firestore';
import { signInAnonymously } from 'firebase/auth';
import { createUserProfile } from '@/lib/user';
import { Loader } from 'lucide-react';
import { cn } from '@/lib/utils';
import { isAppRoute as checkAppRoute, isAuthRoute as checkAuthRoute, ROUTES } from '@/lib/routes';
import { DataMigration } from '@/components/DataMigration';

/** Em desenvolvimento: define em .env.local como "true" para entrar sem login (usa usuário anônimo). */
const DEV_SKIP_AUTH = process.env.NEXT_PUBLIC_DEV_SKIP_AUTH === 'true';

export function AppContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const auth = useAuth();
  const { isFloatingPomodoroOpen, setIsFloatingPomodoroOpen } = usePomodoro();
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const isAppRoute = checkAppRoute(pathname);
  const isAuthRoute = checkAuthRoute(pathname);

  // #region agent log
  React.useEffect(() => {
    if (typeof fetch !== 'undefined') fetch('http://127.0.0.1:7478/ingest/67b52dda-7cfc-4e99-9fbb-9d237c3be7a6',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'80706c'},body:JSON.stringify({sessionId:'80706c',location:'AppContent.tsx:auth state',message:'AppContent auth state',data:{t:Date.now(),isUserLoading,hasUser:!!user,pathname},timestamp:Date.now(),hypothesisId:'B'})}).catch(()=>{});
  }, [isUserLoading, user, pathname]);
  // #endregion

  // Dev: login anônimo automático para desenvolver sem tela de login
  useEffect(() => {
    if (!DEV_SKIP_AUTH || !auth || isUserLoading || user) return;
    signInAnonymously(auth).catch((err) => console.error('Dev skip auth: signInAnonymously failed', err));
  }, [DEV_SKIP_AUTH, auth, isUserLoading, user]);

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
        const timeoutId = setTimeout(checkAndCreateProfile, 2000);
        return () => clearTimeout(timeoutId);
      }

    } else {
      if (isAppRoute && !DEV_SKIP_AUTH) {
        router.replace(ROUTES.HOME);
      }
    }
  }, [user, isUserLoading, pathname, isAppRoute, isAuthRoute, router, firestore]);

  if (isUserLoading || (DEV_SKIP_AUTH && !user) || (user && (pathname === ROUTES.HOME || isAuthRoute))) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <Loader className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }
  
  // If user is logged in and on an app route, show the full app layout
  if (user && isAppRoute) {
    // #region agent log
    if (typeof fetch !== 'undefined') fetch('http://127.0.0.1:7478/ingest/67b52dda-7cfc-4e99-9fbb-9d237c3be7a6',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'80706c'},body:JSON.stringify({sessionId:'80706c',location:'AppContent.tsx:full app render',message:'Full app layout rendering',data:{t:Date.now()},timestamp:Date.now(),hypothesisId:'E'})}).catch(()=>{});
    // #endregion
    return (
      <div className="flex h-screen w-full bg-background relative">
        <DataMigration firestore={firestore} userId={user?.uid ?? null} />
        <Sidebar isCollapsed={isSidebarCollapsed} onCollapsedChange={setIsSidebarCollapsed} />
        <div
          className={cn(
            'flex flex-col flex-1 min-h-0 transition-[margin] duration-300 ease-in-out',
            isSidebarCollapsed ? 'md:ml-[4.5rem]' : 'md:ml-64'
          )}
        >
            <main className="flex-1 min-h-0 p-4 sm:p-6 lg:p-8 pb-24 md:pb-8 overflow-y-auto overflow-x-hidden">
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
