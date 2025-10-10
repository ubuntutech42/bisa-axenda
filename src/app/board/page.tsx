
'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where, addDoc, serverTimestamp, writeBatch, doc } from 'firebase/firestore';
import { Header } from '@/components/layout/Header';
import { KanbanBoard } from '@/components/kanban/KanbanBoard';
import { Button } from '@/components/ui/button';
import { Loader, Plus, LayoutDashboard } from 'lucide-react';
import { TaskDialog } from '@/components/kanban/TaskDialog';
import type { Task, KanbanList, KanbanBoard as KanbanBoardType } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import BoardSelector from '@/components/kanban/BoardSelector';
import { CreateBoardDialog } from '@/components/kanban/CreateBoardDialog';
import { boardTemplates } from '@/components/kanban/board-templates';

const LAST_BOARD_ID_KEY = 'axenda-last-board-id';

export default function BoardPage() {
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isNewTaskDialogOpen, setIsNewTaskDialogOpen] = useState(false);
  const [isCreateBoardDialogOpen, setIsCreateBoardDialogOpen] = useState(false);
  const [activeBoard, setActiveBoard] = useState<KanbanBoardType | null>(null);

  const boardsQuery = useMemoFirebase(() => 
    user ? query(collection(firestore, 'kanbanBoards'), where('userId', '==', user.uid)) : null,
    [firestore, user]
  );
  const { data: boards, isLoading: areBoardsLoading } = useCollection<KanbanBoardType>(boardsQuery);

  const listsQuery = useMemoFirebase(() => 
    user && activeBoard ? query(collection(firestore, 'kanbanBoards', activeBoard.id, 'lists')) : null, 
    [firestore, user, activeBoard]
  );
  const { data: lists, isLoading: areListsLoading } = useCollection<KanbanList>(listsQuery);

  const handleSetActiveBoard = useCallback((board: KanbanBoardType | null) => {
    setActiveBoard(board);
    if (board) {
      localStorage.setItem(LAST_BOARD_ID_KEY, board.id);
    }
  }, []);

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [isUserLoading, user, router]);

  useEffect(() => {
    if (boards && boards.length > 0 && !activeBoard) {
      const lastBoardId = localStorage.getItem(LAST_BOARD_ID_KEY);
      const lastBoard = boards.find(b => b.id === lastBoardId);
      if (lastBoard) {
        handleSetActiveBoard(lastBoard);
      } else {
        handleSetActiveBoard(boards[0]);
      }
    }
    // If there are no boards, make sure activeBoard is null
    if (boards && boards.length === 0) {
        handleSetActiveBoard(null);
    }
  }, [boards, activeBoard, handleSetActiveBoard]);

  const handleCreateBoard = async (name: string, type: KanbanBoardType['type']) => {
    if (!user) return;
  
    try {
      const boardsCollection = collection(firestore, 'kanbanBoards');
      const newBoardRef = await addDoc(boardsCollection, {
        name,
        type,
        userId: user.uid,
        createdAt: serverTimestamp(),
      });
  
      const listsCollection = collection(firestore, 'kanbanBoards', newBoardRef.id, 'lists');
      const batch = writeBatch(firestore);
      const template = boardTemplates[type];
      
      template.forEach(list => {
        const listRef = doc(listsCollection);
        batch.set(listRef, list);
      });
      
      await batch.commit();
  
      toast({
        title: 'Quadro criado!',
        description: `O quadro "${name}" foi criado com sucesso.`,
      });
      
      const newBoard = {
        id: newBoardRef.id,
        name,
        type,
        userId: user.uid,
        createdAt: new Date() as any, // This is a temporary client-side timestamp
      };

      // Set the new board as active
      handleSetActiveBoard(newBoard);

      setIsCreateBoardDialogOpen(false);
  
    } catch (error) {
      console.error('Error creating board:', error);
      toast({
        variant: 'destructive',
        title: 'Erro ao criar quadro',
        description: 'Não foi possível criar o novo quadro. Tente novamente.',
      });
    }
  };

  const handleCreateTask = async (newTaskData: Omit<Task, 'id' | 'userId' | 'timeSpent' | 'createdAt' >) => {
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

  const currentBoardName = activeBoard ? activeBoard.name : "Quadro Kanban";

  if (isUserLoading || areBoardsLoading || !user) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full w-full">
        <Header title={currentBoardName}>
          <div className="flex items-center gap-2">
            {activeBoard && (
              <Button onClick={() => setIsNewTaskDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Nova Tarefa
              </Button>
            )}
            <BoardSelector 
              boards={boards || []} 
              activeBoard={activeBoard} 
              setActiveBoard={handleSetActiveBoard} 
              onNewBoardClick={() => setIsCreateBoardDialogOpen(true)}
            />
          </div>
        </Header>
        <div className="flex-1 overflow-hidden">
          {areListsLoading && <div className="flex items-center justify-center h-full"><Loader className="h-8 w-8 animate-spin text-primary" /></div>}
          {!areListsLoading && activeBoard && lists ? (
            <KanbanBoard boardId={activeBoard.id} lists={lists} />
          ) : (
            !areBoardsLoading && !activeBoard && (
              <div className="flex flex-col items-center justify-center h-full text-center p-8">
                  <LayoutDashboard className="w-20 h-20 text-muted mb-4" />
                <h2 className="text-2xl font-semibold mb-2">Bem-vindo(a) ao seu espaço de organização!</h2>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">Crie seu primeiro quadro para começar a visualizar suas tarefas, projetos ou ideias.</p>
                <Button onClick={() => setIsCreateBoardDialogOpen(true)} size="lg">
                    <Plus className="mr-2 h-4 w-4" />
                    Criar seu primeiro quadro
                </Button>
              </div>
            )
          )}
        </div>
        {lists && <TaskDialog
          isOpen={isNewTaskDialogOpen}
          onClose={() => setIsNewTaskDialogOpen(false)}
          onSave={handleCreateTask}
          lists={lists}
        />}
      <CreateBoardDialog 
        isOpen={isCreateBoardDialogOpen}
        onClose={() => setIsCreateBoardDialogOpen(false)}
        onCreate={handleCreateBoard}
      />
    </div>
  );
}
