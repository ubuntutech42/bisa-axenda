
'use client';

import { useUser } from '@/firebase';
import DashboardPage from './dashboard/page';
import LandingPage from './landing/page';
import { Loader } from 'lucide-react';
import LandingLayout from './landing/layout';

export default function HomePage() {
  const { user, isUserLoading } = useUser();

  if (isUserLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <Loader className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
     <LandingLayout>
        <LandingPage />
     </LandingLayout>
    );
  }

  return <DashboardPage />;
}
