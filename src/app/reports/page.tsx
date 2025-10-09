'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import type { Task, KanbanBoard } from '@/lib/types';
import { Header } from '@/components/layout/Header';
import { AiInsights } from '@/components/reports/AiInsights';
import { TimeDistributionChart } from '@/components/reports/TimeDistributionChart';
import { Loader } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function ReportsPage() {
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const firestore = useFirestore();
  const [activeBoard, setActiveBoard] = useState<KanbanBoard | null>(null);

  const boardsQuery = useMemoFirebase(() => 
    user ? query(collection(firestore, 'kanbanBoards'), where('userId', '==', user.uid)) : null,
    [firestore, user]
  );
  const { data: boards, isLoading: areBoardsLoading } = useCollection<KanbanBoard>(boardsQuery);

  useEffect(() => {
    if (boards && boards.length > 0 && !activeBoard) {
      setActiveBoard(boards[0]);
    }
  }, [boards, activeBoard]);

  const tasksQuery = useMemoFirebase(() => 
    user && activeBoard ? collection(firestore, 'kanbanBoards', activeBoard.id, 'tasks') : null, 
    [firestore, user, activeBoard]
  );
  
  const { data: tasks, isLoading: areTasksLoading } = useCollection<Task>(tasksQuery);


  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [isUserLoading, user, router]);

  const handleBoardChange = (boardId: string) => {
    const board = boards?.find(b => b.id === boardId) || null;
    setActiveBoard(board);
  };

  if (isUserLoading || areTasksLoading || areBoardsLoading || !user) {
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
           <Select onValueChange={handleBoardChange} value={activeBoard?.id}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Selecione um quadro" />
              </SelectTrigger>
              <SelectContent>
                {boards.map(board => (
                  <SelectItem key={board.id} value={board.id}>{board.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
        )}
      </Header>
      <div className="space-y-8">
        {activeBoard ? (
          <>
            <TimeDistributionChart tasks={tasks || []} />
            <AiInsights tasks={tasks || []} />
          </>
        ) : (
          <div className="text-center py-10">
              <h3 className="text-xl font-semibold">Selecione um quadro</h3>
              <p className="text-muted-foreground">Escolha um quadro para ver os relatórios e insights.</p>
          </div>
        )}
      </div>
    </div>
  );
}
