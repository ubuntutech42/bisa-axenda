'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import type { Task, KanbanList, KanbanBoard as KanbanBoardType } from '@/lib/types';
import { Header } from '@/components/layout/Header';
import { StatCard } from '@/components/dashboard/StatCard';
import { TasksOverview } from '@/components/dashboard/TasksOverview';
import { WisdomNugget } from '@/components/dashboard/WisdomNugget';
import { CheckCircle, Clock, Coffee, Loader } from 'lucide-react';


export default function DashboardPage() {
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const firestore = useFirestore();

  const [allTasks, setAllTasks] = useState<Task[]>([]);
  const [allLists, setAllLists] = useState<KanbanList[]>([]);
  const [areGlobalTasksLoading, setAreGlobalTasksLoading] = useState(true);

  // Fetch all boards for the user
  const boardsQuery = useMemoFirebase(() =>
    user ? query(collection(firestore, 'kanbanBoards'), where('userId', '==', user.uid)) : null,
    [firestore, user]
  );
  const { data: boards, isLoading: areBoardsLoading } = useCollection<KanbanBoardType>(boardsQuery);


  useEffect(() => {
    if (!boards || !firestore || !user) {
      if(boards === null || user === null) {
        setAreGlobalTasksLoading(false);
      }
      return;
    };

    const fetchAllData = async () => {
      setAreGlobalTasksLoading(true);
      if (boards.length === 0) {
        setAllTasks([]);
        setAllLists([]);
        setAreGlobalTasksLoading(false);
        return;
      }

      const tasksPromises = boards.map(board => 
        getDocs(collection(firestore, 'kanbanBoards', board.id, 'tasks'))
      );
      const listsPromises = boards.map(board =>
        getDocs(collection(firestore, 'kanbanBoards', board.id, 'lists'))
      );
      
      const [taskSnapshots, listSnapshots] = await Promise.all([
        Promise.all(tasksPromises),
        Promise.all(listsPromises)
      ]);

      const tasks: Task[] = [];
      taskSnapshots.forEach(snapshot => {
        snapshot.forEach(doc => {
          tasks.push({ id: doc.id, ...doc.data() } as Task);
        });
      });

      const lists: KanbanList[] = [];
      listSnapshots.forEach(snapshot => {
        snapshot.forEach(doc => {
          lists.push({ id: doc.id, ...doc.data() } as KanbanList);
        });
      });

      setAllTasks(tasks);
      setAllLists(lists);
      setAreGlobalTasksLoading(false);
    };

    fetchAllData();
  }, [boards, firestore, user]);


  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [isUserLoading, user, router]);

  const stats = useMemo(() => {
    if (!allTasks || !allLists) {
      return { tasksCompleted: 0, totalFocusTime: 0, pomodoros: 0 };
    }
    const completedListIds = allLists.filter(list => list.name === 'Concluído').map(l => l.id);
    const tasksCompleted = allTasks.filter(task => completedListIds.includes(task.listId)).length;
    const totalFocusTime = allTasks.reduce((sum, task) => sum + task.timeSpent, 0);
    const pomodoros = allTasks.filter(t => t.category === 'Trabalho' || t.category === 'Estudo').reduce((acc, t) => acc + Math.floor(t.timeSpent/25), 0);
    return { tasksCompleted, totalFocusTime, pomodoros };
  }, [allTasks, allLists]);
  
  const hours = Math.floor(stats.totalFocusTime / 60);
  const minutes = stats.totalFocusTime % 60;
  
  if (isUserLoading || areGlobalTasksLoading || areBoardsLoading || !user) {
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

        <TasksOverview tasks={allTasks || []} lists={allLists || []} />
      </div>
    </div>
  );
}
