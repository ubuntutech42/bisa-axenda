'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import type { KanbanBoard as KanbanBoardType } from '@/lib/types';
import { Header } from '@/components/layout/Header';
import { StatCard } from '@/components/dashboard/StatCard';
import { WisdomNugget } from '@/components/dashboard/WisdomNugget';
import { CheckCircle, Clock, Coffee, Loader, LayoutGrid } from 'lucide-react';
import { BoardGroupCard } from '@/components/dashboard/BoardGroupCard';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { CreateBoardDialog } from '@/components/kanban/CreateBoardDialog';
import { useToast } from '@/hooks/use-toast';
import { addDoc, serverTimestamp, writeBatch, doc } from 'firebase/firestore';
import { boardTemplates } from '@/components/kanban/board-templates';
import Link from 'next/link';


export default function DashboardPage() {
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isCreateBoardDialogOpen, setIsCreateBoardDialogOpen] = useState(false);

  // Fetch all boards for the user
  const boardsQuery = useMemoFirebase(() =>
    user ? query(collection(firestore, 'kanbanBoards'), where('userId', '==', user.uid)) : null,
    [firestore, user]
  );
  const { data: boards, isLoading: areBoardsLoading } = useCollection<KanbanBoardType>(boardsQuery);

  useEffect(() => {
    if (isUserLoading) return;
    if (!user) {
      router.push('/');
      return;
    }
  }, [user, router, isUserLoading]);

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
    // Sort so that "Sem Grupo" is always last
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
      // Navigate to the new board
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

  return (
    <div className="flex flex-col gap-8">
      <Header title={`Bem-vindo(a), ${user.displayName?.split(' ')[0] || 'Guerreiro(a)'}!`} />

      <div className="space-y-8">
        <WisdomNugget />

        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <h2 className="text-2xl font-bold font-headline text-foreground">
                    Grupos de Quadros
                </h2>
                <div className="flex items-center gap-2">
                   <Button variant="outline" asChild>
                        <Link href="/board">Ver Todos os Quadros</Link>
                   </Button>
                    <Button onClick={() => setIsCreateBoardDialogOpen(true)}>
                        <Plus className="mr-2 h-4 w-4" />
                        Novo Quadro
                    </Button>
                </div>
            </div>
            
            {boards && boards.length > 0 ? (
                <ScrollArea className="w-full whitespace-nowrap">
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
                <div className="flex flex-col items-center justify-center text-center p-8 border-2 border-dashed rounded-lg">
                  <LayoutGrid className="w-16 h-16 text-muted mb-4" />
                  <h2 className="text-xl font-semibold mb-2">Sua jornada começa aqui</h2>
                  <p className="text-muted-foreground mb-6 max-w-md mx-auto">Crie seu primeiro quadro para organizar tarefas, projetos ou ideias.</p>
                  <Button onClick={() => setIsCreateBoardDialogOpen(true)} size="lg">
                      <Plus className="mr-2 h-4 w-4" />
                      Criar Primeiro Quadro
                  </Button>
              </div>
            )}
        </div>
      </div>
      <CreateBoardDialog 
        isOpen={isCreateBoardDialogOpen}
        onClose={() => setIsCreateBoardDialogOpen(false)}
        onCreate={handleCreateBoard}
      />
    </div>
  );
}
