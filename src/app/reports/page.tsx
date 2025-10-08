'use client';

import { useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import type { Task } from '@/lib/types';
import { Header } from '@/components/layout/Header';
import { AiInsights } from '@/components/reports/AiInsights';
import { TimeDistributionChart } from '@/components/reports/TimeDistributionChart';
import { Loader } from 'lucide-react';

export default function ReportsPage() {
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const firestore = useFirestore();

  const tasksQuery = useMemoFirebase(() => 
    user ? collection(firestore, 'users', user.uid, 'tasks') : null, 
    [firestore, user]
  );
  
  const { data: tasks, isLoading: areTasksLoading } = useCollection<Task>(tasksQuery);


  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [isUserLoading, user, router]);

  if (isUserLoading || areTasksLoading || !user) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div>
      <Header title="Relatórios & Insights" />
      <div className="space-y-8">
        <TimeDistributionChart tasks={tasks || []} />
        <AiInsights tasks={tasks || []} />
      </div>
    </div>
  );
}
