
'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser, useFirestore, useCollection, useDoc, useMemoFirebase } from '@/firebase';
import { collection, query, where, getDocs, doc } from 'firebase/firestore';
import type { KanbanBoard as KanbanBoardType, Task, KanbanList, User as UserType } from '@/lib/types';
import { Header } from '@/components/layout/Header';
import { StatCard } from '@/components/dashboard/StatCard';
import { WisdomNugget } from '@/components/dashboard/WisdomNugget';
import { TasksOverview } from '@/components/dashboard/TasksOverview';
import { CheckCircle, Clock, Coffee, Loader } from 'lucide-react';

type TaskWithBoardId = Task & { boardId: string };

export default function DashboardPage() {
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const firestore = useFirestore();

  const [allTasks, setAllTasks] = useState<TaskWithBoardId[]>([]);
  const [allLists, setAllLists] = useState<KanbanList[]>([]);
  const [areTasksLoading, setAreTasksLoading] = useState(true);
  
  const userDocRef = useMemoFirebase(() => user ? doc(firestore, 'users', user.uid) : null, [firestore, user]);
  const { data: userProfile, isLoading: isProfileLoading } = useDoc<UserType>(userDocRef);

  const boardsQuery = useMemoFirebase(() =>
    user ? query(collection(firestore, 'kanbanBoards'), where('userId', '==', user.uid)) : null,
    [firestore, user]
  );
  const { data: boards, isLoading: areBoardsLoading } = useCollection<KanbanBoardType>(boardsQuery);

  useEffect(() => {
    if (isUserLoading) return;
    if (!user) {
      router.push('/'); // Redirect to landing if not logged in
      return;
    }
  }, [user, router, isUserLoading]);

  useEffect(() => {
    if (!user || !firestore || areBoardsLoading || !boards) return;

    const fetchTasksAndLists = async () => {
      setAreTasksLoading(true);
      if (boards.length === 0) {
        setAllTasks([]);
        setAllLists([]);
        setAreTasksLoading(false);
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
        Promise.all(listsPromises),
      ]);
      
      const fetchedTasks: TaskWithBoardId[] = [];
      taskSnapshots.forEach((snapshot, index) => {
        const boardId = boards[index].id;
        snapshot.forEach(doc => {
          fetchedTasks.push({ id: doc.id, boardId, ...doc.data() } as TaskWithBoardId);
        });
      });

      const fetchedLists: KanbanList[] = [];
      listSnapshots.forEach(snapshot => {
        snapshot.forEach(doc => {
          fetchedLists.push({ id: doc.id, ...doc.data() } as KanbanList);
        });
      });

      setAllTasks(fetchedTasks);
      setAllLists(fetchedLists);
      setAreTasksLoading(false);
    };

    fetchTasksAndLists();
  }, [user, firestore, boards, areBoardsLoading]);

  const stats = useMemo(() => {
    if (!allTasks || !allLists) return { completedTasks: 0, totalTime: 0, activeTasks: 0 };
    
    const completedListNames = ['concluído', 'done'];
    const completedListIds = allLists
        .filter(l => completedListNames.includes(l.name.toLowerCase()))
        .map(l => l.id);

    const completedTasks = allTasks.filter(t => completedListIds.includes(t.listId));
    const totalTime = allTasks.reduce((acc, task) => acc + (task.timeSpent || 0), 0);
    const activeTasks = allTasks.length - completedTasks.length;

    return {
      completedTasks: completedTasks.length,
      totalTime: Math.floor(totalTime / 60), // in hours
      activeTasks: activeTasks,
    };
  }, [allTasks, allLists]);
  
  const getGreeting = () => {
    const name = userProfile?.firstName || user?.displayName?.split(' ')[0] || 'Guerreiro(a)';
    switch (userProfile?.gender) {
      case 'Mulher':
        return `Bem-vinda, ${name}!`;
      case 'Homem':
        return `Bem-vindo, ${name}!`;
      case 'Não-binário':
      case 'Outro':
        return `Bem-vinde, ${name}!`;
      default:
        return `Bem-vindo(a), ${name}!`;
    }
  };

  if (isUserLoading || areBoardsLoading || areTasksLoading || isProfileLoading || !user) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <Header title={getGreeting()} />

      <div className="space-y-8">
        <WisdomNugget />

        <div className="grid gap-4 md:grid-cols-3">
          <StatCard icon={CheckCircle} title="Tarefas Concluídas" value={stats.completedTasks.toString()} />
          <StatCard icon={Clock} title="Horas de Foco" value={stats.totalTime.toString()} />
          <StatCard icon={Coffee} title="Tarefas Ativas" value={stats.activeTasks.toString()} />
        </div>
        
        <TasksOverview tasks={allTasks} lists={allLists} />
      </div>
    </div>
  );
}
