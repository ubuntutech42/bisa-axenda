
'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where, writeBatch, doc, getDocs, deleteDoc, updateDoc, addDoc, serverTimestamp } from 'firebase/firestore';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Loader, Plus, Trash2 } from 'lucide-react';
import { CreateBoardDialog } from '@/components/kanban/CreateBoardDialog';
import type { KanbanBoard as KanbanBoardType } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { BoardGroupCard } from '@/components/board/BoardGroupCard';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { boardTemplates } from '@/components/kanban/board-templates';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

export default function BoardsPage() {
    const { user, isUserLoading } = useUser();
    const router = useRouter();
    const firestore = useFirestore();
    const { toast } = useToast();

    const [isCreateBoardDialogOpen, setIsCreateBoardDialogOpen] = useState(false);
    const [groupToDelete, setGroupToDelete] = useState<string | null>(null);

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

    const groupedBoards = useMemo(() => {
        if (!boards) return {};
        return boards.reduce((acc, board) => {
            const group = board.group || 'Sem Grupo';
            if (!acc[group]) {
                acc[group] = [];
            }
            acc[group].push(board);
            return acc;
        }, {} as Record<string, KanbanBoardType[]>);
    }, [boards]);

    const sortedGroups = useMemo(() => {
        const groupNames = Object.keys(groupedBoards);
        return groupNames.sort((a, b) => {
            if (a === 'Sem Grupo') return -1;
            if (b === 'Sem Grupo') return 1;
            return a.localeCompare(b);
        });
    }, [groupedBoards]);

    const handleCreateBoard = async (name: string, type: KanbanBoardType['type'], group?: string) => {
        if (!user) return;
    
        try {
          const boardsCollection = collection(firestore, 'kanbanBoards');
          const boardData: Omit<KanbanBoardType, 'id' | 'createdAt'> & {createdAt: any} = {
            name,
            type,
            userId: user.uid,
            createdAt: serverTimestamp(),
            group: group,
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
          router.push(`/board?group=${group || 'Sem Grupo'}`);
      
        } catch (error) {
          console.error('Error creating board:', error);
          toast({
            variant: 'destructive',
            title: 'Erro ao criar quadro',
            description: 'Não foi possível criar o novo quadro. Tente novamente.',
          });
        }
      };

    const handleDeleteGroup = async () => {
        if (!groupToDelete || !firestore || !boards) return;

        toast({ title: 'Excluindo grupo...', description: `Removendo o grupo "${groupToDelete}" e todos os seus quadros.` });
        
        try {
            const batch = writeBatch(firestore);
            const boardsInGroup = boards.filter(b => (b.group || 'Sem Grupo') === groupToDelete);

            for (const board of boardsInGroup) {
                const boardRef = doc(firestore, 'kanbanBoards', board.id);

                // Delete subcollections (tasks and lists)
                const tasksRef = collection(boardRef, 'tasks');
                const listsRef = collection(boardRef, 'lists');
                const [tasksSnap, listsSnap] = await Promise.all([getDocs(tasksRef), getDocs(listsRef)]);
                tasksSnap.forEach(doc => batch.delete(doc.ref));
                listsSnap.forEach(doc => batch.delete(doc.ref));

                // Delete the board itself
                batch.delete(boardRef);
            }

            await batch.commit();
            toast({ title: 'Grupo excluído!', description: 'O grupo e todos os seus quadros foram removidos.' });
        } catch (error) {
            console.error("Error deleting group:", error);
            toast({ variant: 'destructive', title: 'Erro ao excluir', description: 'Não foi possível remover o grupo.' });
        } finally {
            setGroupToDelete(null);
        }
    };
    
    const handleUpdateGroupName = async (oldGroupName: string, newGroupName: string) => {
        if (!firestore || !boards || !newGroupName.trim() || oldGroupName === 'Sem Grupo') return;
        
        toast({ title: 'Atualizando grupo...', description: `Renomeando "${oldGroupName}" para "${newGroupName}".`});

        try {
            const batch = writeBatch(firestore);
            const boardsInGroup = boards.filter(b => (b.group || 'Sem Grupo') === oldGroupName);
            
            boardsInGroup.forEach(board => {
                const boardRef = doc(firestore, 'kanbanBoards', board.id);
                batch.update(boardRef, { group: newGroupName });
            });
            
            await batch.commit();
            toast({ title: 'Grupo atualizado!', description: 'O nome do grupo foi alterado.' });
        } catch (error) {
            console.error("Error updating group name:", error);
            toast({ variant: 'destructive', title: 'Erro ao renomear', description: 'Não foi possível alterar o nome do grupo.' });
        }
    };


    if (isUserLoading || areBoardsLoading) {
        return (
            <div className="flex items-center justify-center h-full">
                <Loader className="h-10 w-10 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-8 h-full">
            <Header title="Meus Quadros">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button size="icon" aria-label="Criar novo item">
                            <Plus className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onSelect={() => setIsCreateBoardDialogOpen(true)}>
                            <Plus className="mr-2 h-4 w-4" />
                            <span>Novo Quadro</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </Header>

            <div className="flex-1 overflow-y-auto">
                {sortedGroups.length > 0 ? (
                    <div className="flex flex-wrap gap-8 pb-8">
                        {sortedGroups.map(groupName => (
                            <BoardGroupCard
                                key={groupName}
                                groupName={groupName}
                                boards={groupedBoards[groupName]}
                                onDeleteGroup={() => setGroupToDelete(groupName)}
                                onUpdateGroupName={handleUpdateGroupName}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center text-center p-8 border-2 border-dashed rounded-lg h-full">
                        <h2 className="text-xl font-semibold mb-2">Nenhum quadro encontrado</h2>
                        <p className="text-muted-foreground mb-4 max-w-md mx-auto">Comece criando seu primeiro quadro para organizar suas ideias e tarefas.</p>
                        <Button onClick={() => setIsCreateBoardDialogOpen(true)}>
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
                existingGroups={sortedGroups.filter(g => g !== 'Sem Grupo')}
            />

            <AlertDialog open={!!groupToDelete} onOpenChange={(open) => !open && setGroupToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Excluir o grupo "{groupToDelete}"?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Esta ação é permanente e <span className='font-bold'>excluirá todos os quadros</span>, colunas e tarefas dentro deste grupo. Você tem certeza?
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteGroup} className="bg-destructive hover:bg-destructive/90">Sim, excluir tudo</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
