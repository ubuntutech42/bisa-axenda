'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/firebase';
import { Header } from '@/components/layout/Header';
import { StatCard } from '@/components/dashboard/StatCard';
import { TasksOverview } from '@/components/dashboard/TasksOverview';
import { WisdomNugget } from '@/components/dashboard/WisdomNugget';
import { CheckCircle, Clock, Coffee, Loader } from 'lucide-react';
import { tasks } from '@/lib/data';

export default function DashboardPage() {
  const { user, isUserLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [isUserLoading, user, router]);

  if (isUserLoading || !user) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  const tasksCompleted = Object.values(tasks).filter(task => task.status === 'Concluído').length;
  const totalFocusTime = Object.values(tasks).reduce((sum, task) => sum + task.timeSpent, 0);
  const hours = Math.floor(totalFocusTime / 60);
  const minutes = totalFocusTime % 60;
  
  const pomodoros = Object.values(tasks).filter(t => t.category === 'Trabalho' || t.category === 'Estudo').reduce((acc, t) => acc + Math.floor(t.timeSpent/25), 0)

  return (
    <div>
      <Header title={`Bem-vindo(a), ${user.displayName?.split(' ')[0] || 'Guerreiro(a)'}!`} />

      <div className="space-y-8">
        <WisdomNugget />

        <div className="grid gap-4 md:grid-cols-3">
          <StatCard title="Tarefas Concluídas" value={String(tasksCompleted)} icon={CheckCircle} />
          <StatCard title="Tempo de Foco" value={`${hours}h ${minutes}m`} icon={Clock} />
          <StatCard title="Pomodoros" value={String(pomodoros)} icon={Coffee} />
        </div>

        <TasksOverview />
      </div>
    </div>
  );
}
