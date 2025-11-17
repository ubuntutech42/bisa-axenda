'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where, addDoc, serverTimestamp, writeBatch, doc, getDocs, deleteDoc, updateDoc } from 'firebase/firestore';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Loader, Plus, LayoutGrid, Trash2, MoreVertical } from 'lucide-react';
import { CreateBoardDialog } from '@/components/kanban/CreateBoardDialog';
import type { KanbanBoard as KanbanBoardType, KanbanList, Task } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { boardTemplates } from '@/components/kanban/board-templates';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import GroupSelector from '@/components/board/GroupSelector';
import BoardCarousel from '@/components/board/BoardCarousel';
import { KanbanBoard } from '@/components/kanban/KanbanBoard';
import { TaskDialog } from '@/components/kanban/TaskDialog';

const LAST_GROUP_ID_KEY = 'axenda-last-group-id-';

export default function BoardPage() {
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const firestore = useFirestore();
  const { toast } = useToast();

  // Dialog states
  const [isCreateBoardDialogOpen, setIsCreateBoardDialogOpen] = useState(false);
  const [isNewTaskDialogOpen, setIsNewTaskDialogOpen] = useState(false);
  const [boardToDelete, setBoardToDelete] = useState<KanbanBoardType | null>(null);

  // Data states
  const [activeGroup, setActiveGroup] = useState<string>('');
  const [activeBoard, setActiveBoard] = useState<KanbanBoardType | null>(null);
  const [allUserBoards, setAllUserBoards] = useState<KanbanBoardType[]>([]);

  // Firebase Queries
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


  // Redirect unauthenticated users
  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [isUserLoading, user, router]);

  // Initialize and filter boards
  useEffect(() => {
    if (boardsData) {
      setAllUserBoards(boardsData);
      
      if (activeGroup === '' && user) {
        const lastGroupId = localStorage.getItem(`${LAST_GROUP_ID_KEY}${user.uid}`) || 'ungrouped';
        const groups = [...new Set(boardsData.map(b => b.group || 'ungrouped'))];
        setActiveGroup(groups.includes(lastGroupId) ? lastGroupId : 'ungrouped');
      }
    }
  }, [boardsData, user, activeGroup]);

  // Derived state for groups and filtered boards
  const boardGroups = useMemo(() => {
    const groups = new Set(allUserBoards.map(b => b.group || 'ungrouped'));
    return ['ungrouped', ...Array.from(groups).filter(g => g !== 'ungrouped').sort()];
  }, [allUserBoards]);

  const boardsInGroup = useMemo(() => {
    const filtered = allUserBoards.filter(b => (b.group || 'ungrouped') === activeGroup);
    return filtered.sort((a,b) => (a.createdAt?.seconds || 0) - (b.createdAt?.seconds || 0));
  }, [allUserBoards, activeGroup]);

  // Effect to select active board
  useEffect(() => {
    if (boardsInGroup.length > 0 && !boardsInGroup.some(b => b.id === activeBoard?.id)) {
        setActiveBoard(boardsInGroup[0]);
    } else if (boardsInGroup.length === 0) {
        setActiveBoard(null);
    }
  }, [boardsInGroup, activeBoard]);

  // Handlers
  const handleGroupChange = (newGroup: string) => {
    setActiveGroup(newGroup);
    setActiveBoard(null); // Reset board selection
    if (user) {
        localStorage.setItem(`${LAST_GROUP_ID_KEY}${user.uid}`, newGroup);
    }
  };

  const handleCreateBoard = async (name: string, type: KanbanBoardType['type'], group?: string) => {
    if (!user) return;
  
    try {
      const boardsCollection = collection(firestore, 'kanbanBoards');
      const boardData: Omit<KanbanBoardType, 'id' | 'createdAt'> & {createdAt: any} = {
        name,
        type,
        userId: user.uid,
        createdAt: serverTimestamp(),
        group: group || activeGroup === 'ungrouped' ? undefined : activeGroup,
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
      if(group) handleGroupChange(group);
  
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


  if (isUserLoading || areBoardsLoading || !user) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full w-full">
        <Header title="Meus Quadros">
          <div className="flex items-center gap-2">
            <GroupSelector 
              groups={boardGroups}
              activeGroup={activeGroup}
              onGroupChange={handleGroupChange}
            />
            <Button onClick={() => setIsNewTaskDialogOpen(true)} disabled={!activeBoard}>
              <Plus className="mr-2 h-4 w-4" />
              Nova Tarefa
            </Button>
          </div>
        </Header>
        
        <div className="flex-1 flex flex-col gap-4 overflow-hidden">
            {boardsInGroup.length > 0 ? (
                <BoardCarousel 
                    boards={boardsInGroup}
                    activeBoard={activeBoard}
                    onSelectBoard={setActiveBoard}
                    onNewBoardClick={() => setIsCreateBoardDialogOpen(true)}
                    onDeleteBoard={setBoardToDelete}
                />
            ) : (
                <div className="flex flex-col items-center justify-center text-center p-8 border-2 border-dashed rounded-lg h-48">
                    <LayoutGrid className="w-12 h-12 text-muted mb-4" />
                    <h2 className="text-xl font-semibold mb-2">Sem quadros neste grupo</h2>
                    <p className="text-muted-foreground mb-4 max-w-md mx-auto">Crie seu primeiro quadro neste grupo para começar.</p>
                    <Button onClick={() => setIsCreateBoardDialogOpen(true)}>
                        <Plus className="mr-2 h-4 w-4" />
                        Criar Quadro
                    </Button>
                </div>
            )}
            
            <div className="flex-1 overflow-hidden h-full">
                {activeBoard && !areListsLoading && lists ? (
                    <KanbanBoard boardId={activeBoard.id} lists={lists} />
                ) : (
                    <div className="flex items-center justify-center h-full">
                        {areBoardsLoading ? <Loader className="h-8 w-8 animate-spin" /> : <p className="text-muted-foreground">Selecione um quadro acima para visualizar.</p>}
                    </div>
                )}
            </div>
        </div>

        <CreateBoardDialog 
            isOpen={isCreateBoardDialogOpen}
            onClose={() => setIsCreateBoardDialogOpen(false)}
            onCreate={handleCreateBoard}
            existingGroups={boardGroups.filter(g => g !== 'ungrouped')}
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
