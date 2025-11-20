'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useUser, useFirestore, useDoc, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where, addDoc, serverTimestamp, writeBatch, doc, getDocs, deleteDoc } from 'firebase/firestore';
import { Header } from '@/components/layout/Header';
import { Loader, Plus, ArrowLeft } from 'lucide-react';
import { CreateBoardDialog } from '@/components/kanban/CreateBoardDialog';
import type { KanbanBoard as KanbanBoardType, KanbanList, Task } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { boardTemplates } from '@/components/kanban/board-templates';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { KanbanBoard } from '@/components/kanban/KanbanBoard';
import { TaskDialog } from '@/components/kanban/TaskDialog';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';


export default function BoardPage() {
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const searchParams = useSearchParams();
  const firestore = useFirestore();
  const { toast } = useToast();

  const boardId = searchParams.get('id');

  const [isNewTaskDialogOpen, setIsNewTaskDialogOpen] = useState(false);

  const boardRef = useMemoFirebase(() =>
    user && boardId ? doc(firestore, 'kanbanBoards', boardId) : null,
    [firestore, user, boardId]
  );
  const { data: activeBoard, isLoading: isBoardLoading, error: boardError } = useDoc<KanbanBoardType>(boardRef);


  const listsQuery = useMemoFirebase(() => 
    user && activeBoard ? query(collection(firestore, 'kanbanBoards', activeBoard.id, 'lists')) : null, 
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
              <div className='flex items-center gap-2 flex-1'>
                 <Button variant="ghost" size="icon" asChild>
                  <Link href="/boards">
                    <ArrowLeft className="h-5 w-5 text-foreground" />
                  </Link>
                </Button>
                <span className='text-2xl sm:text-3xl font-bold font-headline text-foreground truncate'>
                  {activeBoard?.name || 'Carregando...'}
                </span>
              </div>
              <div className='flex items-center gap-2'>
                <Button onClick={() => setIsNewTaskDialogOpen(true)} disabled={!activeBoard}>
                    <Plus className="mr-2 h-4 w-4" />
                    Nova Tarefa
                </Button>
              </div>
            </Header>
            <Separator className="mb-4" />
          </div>
          
          <div className="flex-1 overflow-auto h-full">
              {activeBoard && !areListsLoading && lists ? (
                  <KanbanBoard boardId={activeBoard.id} lists={lists} />
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
      />}
    </>
  );
}

    