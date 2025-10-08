import { Header } from '@/components/layout/Header';
import { StatCard } from '@/components/dashboard/StatCard';
import { TasksOverview } from '@/components/dashboard/TasksOverview';
import { WisdomNugget } from '@/components/dashboard/WisdomNugget';
import { CheckCircle, Clock, Coffee } from 'lucide-react';

// In a real app, this data would come from a database.
import { tasks } from '@/lib/data';

export default function DashboardPage() {
  const tasksCompleted = Object.values(tasks).filter(task => task.status === 'Done').length;
  const totalFocusTime = Object.values(tasks).reduce((sum, task) => sum + task.timeSpent, 0);
  const hours = Math.floor(totalFocusTime / 60);
  const minutes = totalFocusTime % 60;
  
  const pomodoros = Object.values(tasks).filter(t => t.category === 'Work' || t.category === 'Study').reduce((acc, t) => acc + Math.floor(t.timeSpent/25), 0)

  return (
    <div>
      <Header title="Dashboard" />

      <div className="space-y-8">
        <WisdomNugget />

        <div className="grid gap-4 md:grid-cols-3">
          <StatCard title="Tasks Completed" value={String(tasksCompleted)} icon={CheckCircle} />
          <StatCard title="Focus Time" value={`${hours}h ${minutes}m`} icon={Clock} />
          <StatCard title="Pomodoros" value={String(pomodoros)} icon={Coffee} />
        </div>

        <TasksOverview />
      </div>
    </div>
  );
}
