'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where, addDoc, serverTimestamp, writeBatch, doc, getDocs, deleteDoc, updateDoc } from 'firebase/firestore';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Loader, Plus, Trash2 } from 'lucide-react';
import { CreateBoardDialog } from '@/components/kanban/CreateBoardDialog';
import type { KanbanBoard as KanbanBoardType, KanbanList, Task } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { boardTemplates } from '@/components/kanban/board-templates';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import GroupSelector from '@/components/board/GroupSelector';
import BoardSelector from '@/components/kanban/BoardSelector';
import { KanbanBoard } from '@/components/kanban/KanbanBoard';
import { TaskDialog } from '@/components/kanban/TaskDialog';
import Link from 'next/link';

export default function BoardPage() {
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const searchParams = useSearchParams();
  const firestore = useFirestore();
  const { toast } = useToast();

  const [isCreateBoardDialogOpen, setIsCreateBoardDialogOpen] = useState(false);
  const [isNewTaskDialogOpen, setIsNewTaskDialogOpen] = useState(false);
  const [boardToDelete, setBoardToDelete] = useState<KanbanBoardType | null>(null);

  const [activeGroup, setActiveGroup] = useState<string | null>(null);
  const [activeBoard, setActiveBoard] = useState<KanbanBoardType | null>(null);
  const [allUserBoards, setAllUserBoards] = useState<KanbanBoardType[]>([]);

  const boardsQuery = useMemoFirebase(() =>
    user ? query(collection(firestore, 'kanbanBoards'), where('userId', '==', user.uid)) : null,
    [firestore, user]
  );
  const { data: boardsData, isLoading: areBoardsLoading } = useCollection<KanbanBoardType>(boardsQuery);

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

  useEffect(() => {
    if (boardsData) {
      setAllUserBoards(boardsData);
      const groupFromUrl = searchParams.get('group') || 'ungrouped';
      
      if (activeGroup !== groupFromUrl) {
          setActiveGroup(groupFromUrl);
          setActiveBoard(null); // Reset active board when group changes
      }
    }
  }, [boardsData, searchParams, activeGroup]);

  const boardGroups = useMemo(() => {
    const groups = new Set(allUserBoards.map(b => b.group || 'ungrouped'));
    return ['ungrouped', ...Array.from(groups).filter(g => g !== 'ungrouped').sort()];
  }, [allUserBoards]);

  const boardsInGroup = useMemo(() => {
    const groupName = activeGroup === 'ungrouped' ? undefined : activeGroup;
    return allUserBoards
      .filter(b => (b.group || undefined) === groupName)
      .sort((a,b) => (a.createdAt?.seconds || 0) - (b.createdAt?.seconds || 0));
  }, [allUserBoards, activeGroup]);

  useEffect(() => {
    if (!activeBoard && boardsInGroup.length > 0) {
      setActiveBoard(boardsInGroup[0]);
    } else if (boardsInGroup.length === 0) {
      setActiveBoard(null);
    }
  }, [boardsInGroup, activeBoard]);

  const handleGroupChange = (newGroup: string) => {
    router.push(`/board?group=${newGroup}`);
  };

  const handleCreateBoard = async (name: string, type: KanbanBoardType['type'], group?: string) => {
    if (!user || !activeGroup) return;
  
    const targetGroup = group || (activeGroup === 'ungrouped' ? undefined : activeGroup);

    try {
      const boardsCollection = collection(firestore, 'kanbanBoards');
      const boardData: Omit<KanbanBoardType, 'id' | 'createdAt'> & {createdAt: any} = {
        name,
        type,
        userId: user.uid,
        createdAt: serverTimestamp(),
        group: targetGroup,
      };

      const newBoardRef = await addDoc(boardsCollection, boardData);
  
      const listsCollection = collection(firestore, 'kanbanBoards', newBoardRef.id, 'lists');
      const template = boardTemplates[type];
      
      if (template && template.length > 0) {
        const batch = writeBatch(firestore);
        template.forEach(list => {
          const listRef = doc(listsCollection);
          batch.set(listRef, list);
        });
        await batch.commit();
      }
  
      toast({
        title: 'Quadro criado!',
        description: `O quadro "${name}" foi criado com sucesso.`,
      });
      setIsCreateBoardDialogOpen(false);
      if(targetGroup && targetGroup !== activeGroup) {
        handleGroupChange(targetGroup);
      }
  
    } catch (error) {
      console.error('Error creating board:', error);
      toast({
        variant: 'destructive',
        title: 'Erro ao criar quadro',
        description: 'Não foi possível criar o novo quadro. Tente novamente.',
      });
    }
  };

  const deleteBoardAndSubcollections = async (boardId: string) => {
    if (!firestore) return;
    const boardRef = doc(firestore, 'kanbanBoards', boardId);

    const tasksRef = collection(boardRef, 'tasks');
    const tasksSnap = await getDocs(tasksRef);
    const taskDeletes = tasksSnap.docs.map(doc => deleteDoc(doc.ref));
    
    const listsRef = collection(boardRef, 'lists');
    const listsSnap = await getDocs(listsRef);
    const listDeletes = listsSnap.docs.map(doc => deleteDoc(doc.ref));

    await Promise.all([...taskDeletes, ...listDeletes]);
    await deleteDoc(boardRef);
  };
  
  const handleDeleteBoard = async () => {
    if (!boardToDelete) return;
    toast({ title: 'Excluindo quadro...', description: `Removendo "${boardToDelete.name}".`});
    try {
      await deleteBoardAndSubcollections(boardToDelete.id);
      toast({ title: 'Quadro excluído!', description: 'O quadro foi removido com sucesso.' });
      if (activeBoard?.id === boardToDelete.id) {
          setActiveBoard(null);
      }
    } catch (error) {
      console.error('Error deleting board:', error);
      toast({ variant: 'destructive', title: 'Erro ao excluir quadro', description: 'Não foi possível remover o quadro.'});
    } finally {
      setBoardToDelete(null);
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

  if (isUserLoading || areBoardsLoading || !user || !activeGroup) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }
  
  const displayGroup = activeGroup === 'ungrouped' ? 'Sem Grupo' : activeGroup;

  return (
    <div className="flex flex-col h-full w-full">
        <Header title={activeBoard?.name || 'Carregando...'}>
          <div className="flex items-center gap-2">
            <GroupSelector 
              groups={boardGroups}
              activeGroup={activeGroup}
              onGroupChange={handleGroupChange}
            />
            <BoardSelector 
              boards={boardsInGroup}
              activeBoard={activeBoard}
              setActiveBoard={setActiveBoard}
              onNewBoardClick={() => setIsCreateBoardDialogOpen(true)}
            />
            <Button onClick={() => setIsNewTaskDialogOpen(true)} disabled={!activeBoard}>
              <Plus className="mr-2 h-4 w-4" />
              Nova Tarefa
            </Button>
          </div>
        </Header>
        
        <div className="flex-1 overflow-hidden h-full">
            {activeBoard && !areListsLoading && lists ? (
                <KanbanBoard boardId={activeBoard.id} lists={lists} />
            ) : boardsInGroup.length === 0 ? (
                <div className="text-center p-8 border-2 border-dashed rounded-lg h-full flex flex-col justify-center items-center">
                    <h2 className="text-xl font-semibold mb-2">Nenhum quadro em "{displayGroup}"</h2>
                    <p className="text-muted-foreground mb-4 max-w-md mx-auto">Crie seu primeiro quadro neste grupo para começar.</p>
                    <div className='flex gap-4'>
                        <Button onClick={() => setIsCreateBoardDialogOpen(true)}>
                            <Plus className="mr-2 h-4 w-4" />
                            Criar Quadro
                        </Button>
                        <Button variant="outline" asChild>
                           <Link href="/boards">Ver todos os grupos</Link>
                        </Button>
                    </div>
                </div>
            ) : (
                <div className="flex items-center justify-center h-full">
                    <Loader className="h-8 w-8 animate-spin" />
                </div>
            )}
        </div>

        <CreateBoardDialog 
            isOpen={isCreateBoardDialogOpen}
            onClose={() => setIsCreateBoardDialogOpen(false)}
            onCreate={handleCreateBoard}
            existingGroups={boardGroups.filter(g => g !== 'ungrouped')}
            currentGroup={activeGroup}
        />

         <AlertDialog open={!!boardToDelete} onOpenChange={(open) => !open && setBoardToDelete(null)}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                    <AlertDialogDescription>
                        A exclusão do quadro "{boardToDelete?.name}" é permanente. Todas as colunas e tarefas dentro dele serão apagadas para sempre.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel onClick={() => setBoardToDelete(null)}>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDeleteBoard} className="bg-destructive hover:bg-destructive/90">Sim, excluir</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>

        {lists && activeBoard && <TaskDialog
          isOpen={isNewTaskDialogOpen}
          onClose={() => setIsNewTaskDialogOpen(false)}
          onSave={handleCreateTask}
          lists={lists}
        />}
    </div>
  );
}
