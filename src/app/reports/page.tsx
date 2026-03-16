
'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import type { Task, KanbanBoard } from '@/lib/types';
import { Header } from '@/components/layout/Header';
import { Loader } from 'lucide-react';
import { ROUTES } from '@/lib/routes';

const TimeDistributionChart = dynamic(
  () => import('@/components/reports/TimeDistributionChart').then((m) => m.TimeDistributionChart),
  { ssr: false }
);

const AiInsights = dynamic(
  () => import('@/components/reports/AiInsights').then((m) => m.AiInsights),
  { ssr: false }
);
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UserProfileButton } from '@/components/layout/Sidebar';

// Add boardId to the Task type for local use in this component
type TaskWithBoardId = Task & { boardId: string };

export default function ReportsPage() {
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const firestore = useFirestore();
  const [selectedBoardId, setSelectedBoardId] = useState<string>('all');
  const [tasks, setTasks] = useState<TaskWithBoardId[]>([]);
  const [areTasksLoading, setAreTasksLoading] = useState(true);

  const boardsQuery = useMemoFirebase(() => 
    user ? query(collection(firestore, 'kanbanBoards'), where('members', 'array-contains', user.uid)) : null,
    [firestore, user]
  );
  const { data: boards, isLoading: areBoardsLoading } = useCollection<KanbanBoard>(boardsQuery);

  useEffect(() => {
    if (isUserLoading) return;
    if (!user) {
      router.push(ROUTES.LOGIN);
      return;
    }
  }, [isUserLoading, user, router]);


  useEffect(() => {
    if (!user || !firestore || areBoardsLoading) return;

    const fetchTasks = async () => {
      setAreTasksLoading(true);
      if (!boards || boards.length === 0) {
        setTasks([]);
        setAreTasksLoading(false);
        return;
      }
      
      let tasksToFetch: {boardId: string, boardName: string}[] = [];

      if (selectedBoardId === 'all') {
        tasksToFetch = boards.map(b => ({boardId: b.id, boardName: b.name}));
      } else {
        const selectedBoard = boards.find(b => b.id === selectedBoardId);
        if (selectedBoard) {
            tasksToFetch = [{boardId: selectedBoard.id, boardName: selectedBoard.name}];
        }
      }

      if (tasksToFetch.length === 0) {
        setTasks([]);
        setAreTasksLoading(false);
        return;
      }
      
      const tasksPromises = tasksToFetch.map(board => 
        getDocs(collection(firestore, 'kanbanBoards', board.boardId, 'tasks'))
      );

      const taskSnapshots = await Promise.all(tasksPromises);
      
      const fetchedTasks: TaskWithBoardId[] = [];
      taskSnapshots.forEach((snapshot, index) => {
        const boardId = tasksToFetch[index].boardId;
        snapshot.forEach(doc => {
          fetchedTasks.push({ id: doc.id, boardId, ...doc.data() } as TaskWithBoardId);
        });
      });

      setTasks(fetchedTasks);
      setAreTasksLoading(false);
    };

    fetchTasks();
  }, [user, firestore, boards, areBoardsLoading, selectedBoardId]);

  if (isUserLoading || areBoardsLoading || areTasksLoading || !user) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full w-full">
      <Header>
        <div className='flex items-center gap-4 flex-1'>
            <h1 className="text-3xl font-bold font-headline">Relatórios & Insights</h1>
            {boards && boards.length > 0 && (
            <Select onValueChange={setSelectedBoardId} value={selectedBoardId}>
                <SelectTrigger className="w-full sm:w-[220px]">
                    <SelectValue placeholder="Selecione um quadro" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">Todos os Quadros</SelectItem>
                    {boards.map(board => (
                    <SelectItem key={board.id} value={board.id}>{board.name}</SelectItem>
                    ))}
                </SelectContent>
                </Select>
            )}
        </div>
        <UserProfileButton />
      </Header>
      <div className="flex-1 overflow-y-auto -mr-6 pr-6">
        {tasks.length > 0 ? (
          <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
              <TimeDistributionChart tasks={tasks} />
              <AiInsights tasks={tasks} />
            </div>
          </div>
        ) : (
          <div className="text-center py-10 h-full flex flex-col justify-center items-center">
              <h3 className="text-xl font-semibold">Sem dados para exibir</h3>
              <p className="text-muted-foreground">Comece a registrar o tempo em suas tarefas para ver os relatórios.</p>
          </div>
        )}
      </div>
    </div>
  );
}
