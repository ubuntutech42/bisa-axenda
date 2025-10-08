'use client';

import { useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import type { Task } from '@/lib/types';
import { Header } from '@/components/layout/Header';
import { StatCard } from '@/components/dashboard/StatCard';
import { TasksOverview } from '@/components/dashboard/TasksOverview';
import { WisdomNugget } from '@/components/dashboard/WisdomNugget';
import { CheckCircle, Clock, Coffee, Loader } from 'lucide-react';


export default function DashboardPage() {
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

  const stats = useMemo(() => {
    if (!tasks) {
      return { tasksCompleted: 0, totalFocusTime: 0, pomodoros: 0 };
    }
    const tasksCompleted = tasks.filter(task => task.status === 'Concluído').length;
    const totalFocusTime = tasks.reduce((sum, task) => sum + task.timeSpent, 0);
    const pomodoros = tasks.filter(t => t.category === 'Trabalho' || t.category === 'Estudo').reduce((acc, t) => acc + Math.floor(t.timeSpent/25), 0);
    return { tasksCompleted, totalFocusTime, pomodoros };
  }, [tasks]);
  
  const hours = Math.floor(stats.totalFocusTime / 60);
  const minutes = stats.totalFocusTime % 60;
  
  if (isUserLoading || areTasksLoading || !user) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div>
      <Header title={`Bem-vindo(a), ${user.displayName?.split(' ')[0] || 'Guerreiro(a)'}!`} />

      <div className="space-y-8">
        <WisdomNugget />

        <div className="grid gap-4 md:grid-cols-3">
          <StatCard title="Tarefas Concluídas" value={String(stats.tasksCompleted)} icon={CheckCircle} />
          <StatCard title="Tempo de Foco" value={`${hours}h ${minutes}m`} icon={Clock} />
          <StatCard title="Pomodoros" value={String(stats.pomodoros)} icon={Coffee} />
        </div>

        <TasksOverview tasks={tasks || []} />
      </div>
    </div>
  );
}
