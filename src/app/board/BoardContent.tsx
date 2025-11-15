'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where, addDoc, serverTimestamp, writeBatch, doc } from 'firebase/firestore';
import { Header } from '@/components/layout/Header';
import { KanbanBoard } from '@/components/kanban/KanbanBoard';
import { Button } from '@/components/ui/button';
import { Loader, Plus, LayoutDashboard, Home } from 'lucide-react';
import { TaskDialog } from '@/components/kanban/TaskDialog';
import type { Task, KanbanList, KanbanBoard as KanbanBoardType } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import BoardSelector from '@/components/kanban/BoardSelector';
import { CreateBoardDialog } from '@/components/kanban/CreateBoardDialog';
import { boardTemplates } from '@/components/kanban/board-templates';
import Link from 'next/link';

const LAST_BOARD_ID_KEY_PREFIX = 'axenda-last-board-id-';

export function BoardContent() {
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const searchParams = useSearchParams();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isNewTaskDialogOpen, setIsNewTaskDialogOpen] = useState(false);
  const [isCreateBoardDialogOpen, setIsCreateBoardDialogOpen] = useState(false);
  const [activeBoard, setActiveBoard] = useState<KanbanBoardType | null>(null);

  const groupFilter = searchParams.get('group');

  const boardsQuery = useMemoFirebase(() => {
    if (!user) return null;
    let q = query(collection(firestore, 'kanbanBoards'), where('userId', '==', user.uid));
    return q;
  },[firestore, user]);

  const { data: allUserBoards, isLoading: areBoardsLoading } = useCollection<KanbanBoardType>(boardsQuery);

  const boards = useMemo(() => {
      if (!allUserBoards) return [];
      if (!groupFilter) return []; // Should not happen in this component
      if (groupFilter === 'ungrouped') {
          return allUserBoards.filter(b => !b.group);
      }
      return allUserBoards.filter(b => b.group === groupFilter);
  }, [allUserBoards, groupFilter]);


  const listsQuery = useMemoFirebase(() => 
    user && activeBoard ? query(collection(firestore, 'kanbanBoards', activeBoard.id, 'lists')) : null, 
    [firestore, user, activeBoard]
  );
  const { data: lists, isLoading: areListsLoading } = useCollection<KanbanList>(listsQuery);

  const handleSetActiveBoard = useCallback((board: KanbanBoardType | null) => {
    setActiveBoard(board);
    if (board && user) {
      const key = `${LAST_BOARD_ID_KEY_PREFIX}${user.uid}-${groupFilter}`;
      localStorage.setItem(key, board.id);
    }
  }, [user, groupFilter]);

  useEffect(() => {
    if (boards && boards.length > 0 && !activeBoard) {
      const key = user ? `${LAST_BOARD_ID_KEY_PREFIX}${user.uid}-${groupFilter}` : '';
      const lastBoardId = key ? localStorage.getItem(key) : null;
      const lastBoardInGroup = boards.find(b => b.id === lastBoardId);
      
      if (lastBoardInGroup) {
        handleSetActiveBoard(lastBoardInGroup);
      } else {
        handleSetActiveBoard(boards[0]);
      }
    }
    if (activeBoard && boards && !boards.find(b => b.id === activeBoard.id)) {
        handleSetActiveBoard(boards.length > 0 ? boards[0] : null);
    }

  }, [boards, activeBoard, handleSetActiveBoard, user, groupFilter]);

  const handleCreateBoard = async (name: string, type: KanbanBoardType['type'], group?: string) => {
    if (!user) return;
  
    try {
      const boardsCollection = collection(firestore, 'kanbanBoards');
      const boardData: Omit<KanbanBoardType, 'id' | 'createdAt'> & {createdAt: any} = {
        name,
        type,
        userId: user.uid,
        createdAt: serverTimestamp(),
        // Force the group to be the current group filter
        group: groupFilter === 'ungrouped' ? undefined : groupFilter || group,
      };

      const newBoardRef = await addDoc(boardsCollection, boardData);
  
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
      
      const newBoard: KanbanBoardType = {
        id: newBoardRef.id,
        name,
        type,
        userId: user.uid,
        createdAt: new Date() as any,
        group: boardData.group,
      };

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

  const headerTitle = groupFilter ? (
      <>
        <span className="text-muted-foreground">Grupo: </span>{groupFilter === 'ungrouped' ? 'Sem Grupo' : groupFilter}
      </>
    ) : "Todos os Quadros";

  return (
    <div className="flex flex-col h-full w-full">
        <Header title={activeBoard?.name || headerTitle}>
          <div className="flex items-center gap-2">
            <Button variant="outline" asChild>
                <Link href="/board"><Home className="mr-2 h-4 w-4" /> Ver Grupos</Link>
            </Button>
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
        <div className="flex-1 overflow-hidden h-full">
          {areListsLoading && activeBoard && <div className="flex items-center justify-center h-full"><Loader className="h-8 w-8 animate-spin text-primary" /></div>}
          
          {!areListsLoading && activeBoard && lists ? (
            <KanbanBoard boardId={activeBoard.id} lists={lists} />
          ) : (
             boards.length > 0 && !activeBoard ? (
                <div className="flex items-center justify-center h-full">
                  <p className="text-muted-foreground">Selecione um quadro para começar.</p>
                </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center p-8">
                  <LayoutDashboard className="w-20 h-20 text-muted mb-4" />
                <h2 className="text-2xl font-semibold mb-2">Nenhum quadro neste grupo</h2>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">Crie um novo quadro para começar a visualizar suas tarefas, projetos ou ideias.</p>
                <Button onClick={() => setIsCreateBoardDialogOpen(true)} size="lg">
                    <Plus className="mr-2 h-4 w-4" />
                    Criar um quadro
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
