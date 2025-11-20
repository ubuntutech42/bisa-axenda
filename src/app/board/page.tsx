
'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useUser, useFirestore, useDoc, useCollection, useMemoFirebase } from '@/firebase';
import { collection, addDoc, serverTimestamp, doc } from 'firebase/firestore';
import { Header } from '@/components/layout/Header';
import { Loader, Plus, ArrowLeft, Users } from 'lucide-react';
import type { KanbanBoard as KanbanBoardType, KanbanList, Task } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { KanbanBoard } from '@/components/kanban/KanbanBoard';
import { TaskDialog } from '@/components/kanban/TaskDialog';
import { Button } from '@/components/ui/button';
import { BoardMembers } from '@/components/board/BoardMembers';
import { ShareDialog } from '@/components/board/ShareDialog';


export default function BoardPage() {
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const searchParams = useSearchParams();
  const firestore = useFirestore();
  const { toast } = useToast();

  const boardId = searchParams.get('id');

  const [isNewTaskDialogOpen, setIsNewTaskDialogOpen] = useState(false);
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const [initialListForNewTask, setInitialListForNewTask] = useState<string | undefined>();


  const boardRef = useMemoFirebase(() =>
    user && boardId ? doc(firestore, 'kanbanBoards', boardId) : null,
    [firestore, user, boardId]
  );
  const { data: activeBoard, isLoading: isBoardLoading, error: boardError } = useDoc<KanbanBoardType>(boardRef);


  const listsQuery = useMemoFirebase(() => 
    user && activeBoard ? collection(firestore, 'kanbanBoards', activeBoard.id, 'lists') : null, 
    [firestore, user, activeBoard]
  );
  const { data: lists, isLoading: areListsLoading } = useCollection<KanbanList>(listsQuery);

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [isUserLoading, user, router]);

  // Redirect if board is not found or doesn't belong to the user
  useEffect(() => {
      if (boardError) {
          toast({ variant: 'destructive', title: 'Acesso Negado', description: 'Você não tem permissão para ver este quadro.' });
          router.push('/boards');
          return;
      }
      if (!isBoardLoading && user && activeBoard === null && boardId) {
          toast({ variant: 'destructive', title: 'Quadro não encontrado' });
          router.push('/boards');
      }
  }, [activeBoard, isBoardLoading, user, router, boardId, toast, boardError]);

  const handleCreateTask = async (newTaskData: Omit<Task, 'id' | 'timeSpent' | 'createdAt' >) => {
    if (!user || !activeBoard) return;
    try {
      const tasksCollection = collection(firestore, 'kanbanBoards', activeBoard.id, 'tasks');
      await addDoc(tasksCollection, {
        ...newTaskData,
        userId: user.uid,
        timeSpent: 0,
        createdAt: serverTimestamp(),
      });
      toast({
        title: 'Tarefa criada!',
        description: `A tarefa "${newTaskData.title}" foi adicionada ao seu quadro.`,
      });
      setIsNewTaskDialogOpen(false);
    } catch (error) {
      console.error('Error creating task:', error);
      toast({
        variant: 'destructive',
        title: 'Erro ao criar tarefa',
        description: 'Não foi possível salvar a nova tarefa. Tente novamente.',
      });
    }
  };
  
  const handleOpenNewTaskDialog = (listId?: string) => {
    setInitialListForNewTask(listId);
    setIsNewTaskDialogOpen(true);
  };


  if (isUserLoading || isBoardLoading || !user || !activeBoard) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }
  
  return (
    <>
      <div className="flex flex-col h-full w-full">
          <div className="flex-shrink-0">
            <Header>
              <div className='flex items-center gap-2 flex-1 min-w-0'>
                 <Button variant="ghost" size="icon" asChild>
                  <Link href="/boards">
                    <ArrowLeft className="h-5 w-5" />
                  </Link>
                </Button>
                <h1 className='text-2xl sm:text-3xl font-bold font-headline truncate'>
                  {activeBoard?.name || 'Carregando...'}
                </h1>
              </div>
              <div className='flex items-center gap-4'>
                {activeBoard && <BoardMembers memberIds={activeBoard.members} />}
                <Button onClick={() => setIsShareDialogOpen(true)} variant="outline">
                    <Users className="mr-2 h-4 w-4" />
                    Compartilhar
                </Button>
                <Button onClick={() => handleOpenNewTaskDialog()} disabled={!activeBoard}>
                    <Plus className="mr-2 h-4 w-4" />
                    Nova Tarefa
                </Button>
              </div>
            </Header>
          </div>
          
          <div className="flex-1 overflow-auto -mr-6 pr-2 -ml-6 pl-6">
              {activeBoard && !areListsLoading && lists ? (
                  <KanbanBoard 
                    board={activeBoard}
                    lists={lists} 
                    onNewTaskClick={handleOpenNewTaskDialog}
                  />
              ) : (
                  <div className="flex items-center justify-center h-full">
                      <Loader className="h-8 w-8 animate-spin" />
                  </div>
              )}
          </div>
      </div>

      {lists && activeBoard && <TaskDialog
        isOpen={isNewTaskDialogOpen}
        onClose={() => setIsNewTaskDialogOpen(false)}
        onSave={handleCreateTask}
        lists={lists}
        initialListId={initialListForNewTask}
      />}
      {activeBoard && user && <ShareDialog 
        board={activeBoard}
        currentUser={user}
        isOpen={isShareDialogOpen}
        onClose={() => setIsShareDialogOpen(false)}
      />}
    </>
  );
}
