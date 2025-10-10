
'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where, getDocs, DocumentData } from 'firebase/firestore';
import type { Task, KanbanBoard } from '@/lib/types';
import { Header } from '@/components/layout/Header';
import { AiInsights } from '@/components/reports/AiInsights';
import { TimeDistributionChart } from '@/components/reports/TimeDistributionChart';
import { Loader } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

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
    user ? query(collection(firestore, 'kanbanBoards'), where('userId', '==', user.uid)) : null,
    [firestore, user]
  );
  const { data: boards, isLoading: areBoardsLoading } = useCollection<KanbanBoard>(boardsQuery);

  useEffect(() => {
    if (isUserLoading) return;
    if (!user) {
      router.push('/login');
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
    <div>
      <Header title="Relatórios & Insights">
        {boards && boards.length > 0 && (
           <Select onValueChange={setSelectedBoardId} value={selectedBoardId}>
              <SelectTrigger className="w-[220px]">
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
      </Header>
      <div className="space-y-8">
        {tasks.length > 0 ? (
          <>
            <TimeDistributionChart tasks={tasks} />
            <AiInsights tasks={tasks} />
          </>
        ) : (
          <div className="text-center py-10">
              <h3 className="text-xl font-semibold">Sem dados para exibir</h3>
              <p className="text-muted-foreground">Comece a registrar o tempo em suas tarefas para ver os relatórios.</p>
          </div>
        )}
      </div>
    </div>
  );
}
