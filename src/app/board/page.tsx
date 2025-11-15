'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where, addDoc, serverTimestamp, writeBatch, doc } from 'firebase/firestore';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Loader, Plus, LayoutGrid } from 'lucide-react';
import { CreateBoardDialog } from '@/components/kanban/CreateBoardDialog';
import type { KanbanBoard as KanbanBoardType } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { BoardGroupCard } from '@/components/dashboard/BoardGroupCard';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { boardTemplates } from '@/components/kanban/board-templates';
import { BoardContent } from './BoardContent';

export default function BoardPage() {
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const searchParams = useSearchParams();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isCreateBoardDialogOpen, setIsCreateBoardDialogOpen] = useState(false);

  const groupFilter = searchParams.get('group');

  const boardsQuery = useMemoFirebase(() =>
    user ? query(collection(firestore, 'kanbanBoards'), where('userId', '==', user.uid)) : null,
    [firestore, user]
  );
  const { data: boards, isLoading: areBoardsLoading } = useCollection<KanbanBoardType>(boardsQuery);

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [isUserLoading, user, router]);

  const boardGroups = useMemo(() => {
    if (!boards) return {};
    return boards.reduce((acc, board) => {
      const groupName = board.group || 'Sem Grupo';
      if (!acc[groupName]) {
        acc[groupName] = [];
      }
      acc[groupName].push(board);
      return acc;
    }, {} as Record<string, KanbanBoardType[]>);
  }, [boards]);

  const sortedGroupNames = useMemo(() => {
    const groupNames = Object.keys(boardGroups);
    return groupNames.sort((a, b) => {
        if (a === 'Sem Grupo') return 1;
        if (b === 'Sem Grupo') return -1;
        return a.localeCompare(b);
    });
  }, [boardGroups]);

  const handleCreateBoard = async (name: string, type: KanbanBoardType['type'], group?: string) => {
    if (!user) return;
  
    try {
      const boardsCollection = collection(firestore, 'kanbanBoards');
      const boardData: Omit<KanbanBoardType, 'id' | 'createdAt'> & {createdAt: any} = {
        name,
        type,
        userId: user.uid,
        createdAt: serverTimestamp(),
      };
      if (group) {
        boardData.group = group;
      }

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

      setIsCreateBoardDialogOpen(false);
      // Navigate to the new board's group
      const groupParam = group || 'ungrouped';
      router.push(`/board?group=${encodeURIComponent(groupParam)}`);
  
    } catch (error) {
      console.error('Error creating board:', error);
      toast({
        variant: 'destructive',
        title: 'Erro ao criar quadro',
        description: 'Não foi possível criar o novo quadro. Tente novamente.',
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

  // If a group is selected, show the Kanban board view for that group
  if (groupFilter) {
    return <BoardContent />;
  }

  // Otherwise, show the board groups overview
  return (
    <div className="flex flex-col h-full w-full">
        <Header title="Meus Quadros">
            <Button onClick={() => setIsCreateBoardDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Novo Quadro
            </Button>
        </Header>
        <div className="flex-1">
            {boards && boards.length > 0 ? (
                <ScrollArea className="w-full whitespace-nowrap h-full">
                    <div className="flex gap-6 pb-4">
                    {sortedGroupNames.map(groupName => (
                        <BoardGroupCard 
                            key={groupName}
                            groupName={groupName}
                            boards={boardGroups[groupName]}
                        />
                    ))}
                    </div>
                    <ScrollBar orientation="horizontal" />
                </ScrollArea>
            ) : (
                <div className="flex flex-col items-center justify-center h-full text-center p-8 border-2 border-dashed rounded-lg">
                    <LayoutGrid className="w-20 h-20 text-muted mb-4" />
                    <h2 className="text-2xl font-semibold mb-2">Sua jornada começa aqui</h2>
                    <p className="text-muted-foreground mb-6 max-w-md mx-auto">Crie seu primeiro quadro para organizar tarefas, projetos ou ideias.</p>
                    <Button onClick={() => setIsCreateBoardDialogOpen(true)} size="lg">
                        <Plus className="mr-2 h-4 w-4" />
                        Criar Primeiro Quadro
                    </Button>
                </div>
            )}
        </div>
        <CreateBoardDialog 
            isOpen={isCreateBoardDialogOpen}
            onClose={() => setIsCreateBoardDialogOpen(false)}
            onCreate={handleCreateBoard}
        />
    </div>
  );
}
