
'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where, writeBatch, doc, getDocs, deleteDoc, updateDoc, addDoc, serverTimestamp } from 'firebase/firestore';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Loader, Plus, LayoutGrid, Trash2 } from 'lucide-react';
import { CreateBoardDialog } from '@/components/kanban/CreateBoardDialog';
import type { KanbanBoard as KanbanBoardType } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { BoardGroupCard } from '@/components/board/BoardGroupCard';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { boardTemplates, boardTemplatesInfo } from '@/components/kanban/board-templates';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Separator } from '@/components/ui/separator';

function BoardsPageContent() {
    const router = useRouter();
    const { user, isUserLoading } = useUser();
    const firestore = useFirestore();
    const { toast } = useToast();

    const [isCreateBoardDialogOpen, setIsCreateBoardDialogOpen] = useState(false);
    const [createDialogMode, setCreateDialogMode] = useState<'board' | 'group'>('board');
    const [groupToDelete, setGroupToDelete] = useState<string | null>(null);
    const [boardToDelete, setBoardToDelete] = useState<KanbanBoardType | null>(null);

    const boardsQuery = useMemoFirebase(() =>
        user ? query(collection(firestore, 'kanbanBoards'), where('members', 'array-contains', user.uid)) : null,
        [firestore, user]
    );
    const { data: boards, isLoading: areBoardsLoading } = useCollection<KanbanBoardType>(boardsQuery);

    useEffect(() => {
        if (!isUserLoading && !user) {
            router.push('/login');
        }
    }, [isUserLoading, user, router]);

    const { groupedBoards, ungroupedBoards } = useMemo(() => {
        if (!boards) return { groupedBoards: {}, ungroupedBoards: [] };
        
        const grouped = boards.reduce((acc, board) => {
            if (board.group) {
                if (!acc[board.group]) {
                    acc[board.group] = [];
                }
                acc[board.group].push(board);
            }
            return acc;
        }, {} as Record<string, KanbanBoardType[]>);

        const ungrouped = boards.filter(board => !board.group);
        
        return { groupedBoards: grouped, ungroupedBoards: ungrouped };
    }, [boards]);

    const sortedGroups = useMemo(() => {
        return Object.keys(groupedBoards).sort((a, b) => a.localeCompare(b));
    }, [groupedBoards]);

    const handleCreateBoard = async (name: string, type: KanbanBoardType['type'], group?: string) => {
        if (!user) return;
    
        try {
          const boardsCollection = collection(firestore, 'kanbanBoards');
          const boardData: Omit<KanbanBoardType, 'id'> = {
            name,
            type,
            userId: user.uid,
            createdAt: serverTimestamp() as any,
            group: group,
            members: [user.uid], // Start with the creator as a member
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
          router.push(`/board?id=${newBoardRef.id}`);
      
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
            const boardsInGroup = boards.filter(b => b.group === groupToDelete);

            for (const board of boardsInGroup) {
                // Only allow deletion if the current user is the owner
                if(board.userId !== user?.uid) continue;

                const boardRef = doc(firestore, 'kanbanBoards', board.id);

                const tasksRef = collection(boardRef, 'tasks');
                const listsRef = collection(boardRef, 'lists');
                const [tasksSnap, listsSnap] = await Promise.all([getDocs(tasksRef), getDocs(listsRef)]);
                tasksSnap.forEach(doc => batch.delete(doc.ref));
                listsSnap.forEach(doc => batch.delete(doc.ref));
                
                batch.delete(boardRef);
            }

            await batch.commit();
            toast({ title: 'Grupo excluído!', description: 'Os quadros que você possui no grupo foram removidos.' });
        } catch (error) {
            console.error("Error deleting group:", error);
            toast({ variant: 'destructive', title: 'Erro ao excluir', description: 'Não foi possível remover o grupo.' });
        } finally {
            setGroupToDelete(null);
        }
    };
    
    const handleDeleteBoard = async () => {
        if (!boardToDelete || !firestore || !user) return;
        
        // Security check: Only owner can delete
        if(boardToDelete.userId !== user.uid) {
            toast({ variant: 'destructive', title: 'Acesso Negado', description: 'Apenas o proprietário pode excluir este quadro.' });
            setBoardToDelete(null);
            return;
        }

        toast({ title: 'Excluindo quadro...', description: `Removendo o quadro "${boardToDelete.name}".` });

        try {
            const batch = writeBatch(firestore);
            const boardRef = doc(firestore, 'kanbanBoards', boardToDelete.id);

            const tasksRef = collection(boardRef, 'tasks');
            const listsRef = collection(boardRef, 'lists');
            const [tasksSnap, listsSnap] = await Promise.all([getDocs(tasksRef), getDocs(listsRef)]);
            tasksSnap.forEach(doc => batch.delete(doc.ref));
            listsSnap.forEach(doc => batch.delete(doc.ref));

            batch.delete(boardRef);

            await batch.commit();
            toast({ title: 'Quadro excluído!', description: 'O quadro foi removido.' });

        } catch (error) {
            console.error("Error deleting board:", error);
            toast({ variant: 'destructive', title: 'Erro ao excluir', description: 'Não foi possível remover o quadro.' });
        } finally {
            setBoardToDelete(null);
        }
    };
    
    const handleUpdateGroupName = async (oldGroupName: string, newGroupName: string) => {
        if (!firestore || !boards || !newGroupName.trim() || !user) return;
        
        toast({ title: 'Atualizando grupo...', description: `Renomeando "${oldGroupName}" para "${newGroupName}".`});

        try {
            const batch = writeBatch(firestore);
            const boardsInGroup = boards.filter(b => (b.group || 'Sem Grupo') === oldGroupName && b.userId === user.uid);
            
            boardsInGroup.forEach(board => {
                const boardRef = doc(firestore, 'kanbanBoards', board.id);
                batch.update(boardRef, { group: newGroupName });
            });
            
            await batch.commit();
            toast({ title: 'Grupo atualizado!', description: 'O nome do grupo foi alterado nos quadros que você possui.' });
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

    const hasContent = (boards && boards.length > 0);

    return (
        <div className="flex flex-col h-full w-full">
            <Header>
                <h1 className="text-3xl font-bold font-headline">Meus Quadros</h1>
                 <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button size="default" variant="default" aria-label="Criar novo item">
                            <Plus className="mr-2 h-4 w-4" />
                            <span>Criar</span>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onSelect={() => { setCreateDialogMode('board'); setIsCreateBoardDialogOpen(true); }}>
                            <LayoutGrid />
                            <span>Novo Quadro</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => { setCreateDialogMode('group'); setIsCreateBoardDialogOpen(true); }}>
                            <Plus />
                            <span>Novo Grupo</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </Header>

            <div className="flex-1 overflow-y-auto -mr-6 pr-6">
                {hasContent ? (
                    <div className="space-y-8 pb-8">
                         {ungroupedBoards.length > 0 && (
                            <div>
                                <h2 className="text-lg font-semibold text-foreground mb-4">Quadros Individuais</h2>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                     {ungroupedBoards.map(board => (
                                        <Link key={board.id} href={`/board?id=${board.id}`} className="block">
                                            <div className="group relative p-4 border rounded-lg h-full hover:shadow-lg transition-shadow bg-card">
                                                <h3 className="font-semibold text-card-foreground truncate">{board.name}</h3>
                                                <p className="text-sm text-muted-foreground">{boardTemplatesInfo.find(t => t.type === board.type)?.name || 'Quadro'}</p>
                                                {board.userId === user?.uid && <Button 
                                                    variant="ghost" 
                                                    size="icon" 
                                                    className="absolute top-2 right-2 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                                                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); setBoardToDelete(board); }}
                                                >
                                                    <Trash2 className="h-4 w-4 text-destructive" />
                                                </Button>}
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        )}
                        
                        {ungroupedBoards.length > 0 && sortedGroups.length > 0 && <Separator />}

                        {sortedGroups.length > 0 && (
                             <div>
                                <h2 className="text-lg font-semibold text-foreground mb-4">Grupos de Quadros</h2>
                                <div className="flex flex-wrap gap-8">
                                    {sortedGroups.map(groupName => (
                                        <BoardGroupCard
                                            key={groupName}
                                            groupName={groupName}
                                            boards={groupedBoards[groupName]}
                                            onDeleteGroup={() => setGroupToDelete(groupName)}
                                            onUpdateGroupName={handleUpdateGroupName}
                                            isOwner={groupedBoards[groupName].some(b => b.userId === user?.uid)}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center text-center p-8 border-2 border-dashed rounded-lg h-full">
                        <h2 className="text-xl font-semibold mb-2">Nenhum quadro encontrado</h2>
                        <p className="text-muted-foreground mb-4 max-w-md mx-auto">Comece criando seu primeiro quadro para organizar suas ideias e tarefas.</p>
                        <Button onClick={() => { setCreateDialogMode('board'); setIsCreateBoardDialogOpen(true); }}>
                            <Plus />
                            Criar Primeiro Quadro
                        </Button>
                    </div>
                )}
            </div>
            
            <CreateBoardDialog
                isOpen={isCreateBoardDialogOpen}
                onClose={() => setIsCreateBoardDialogOpen(false)}
                onCreate={handleCreateBoard}
                existingGroups={sortedGroups}
                initialFocus={createDialogMode}
            />

            <AlertDialog open={!!groupToDelete} onOpenChange={(open) => !open && setGroupToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Excluir o grupo "{groupToDelete}"?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Esta ação é permanente e <span className='font-bold'>excluirá todos os quadros que você possui</span> dentro deste grupo. Quadros compartilhados com você não serão afetados. Você tem certeza?
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteGroup} className="bg-destructive hover:bg-destructive/90">Sim, excluir meus quadros</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
            
            <AlertDialog open={!!boardToDelete} onOpenChange={(open) => !open && setBoardToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Excluir o quadro "{boardToDelete?.name}"?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Esta ação é permanente e excluirá todas as colunas e tarefas dentro deste quadro. Apenas o proprietário pode fazer isso. Você tem certeza?
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteBoard} className="bg-destructive hover:bg-destructive/90">Sim, excluir quadro</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}

export default function BoardsPage() {
    return (
        <Suspense fallback={<div className="flex items-center justify-center h-full"><Loader className="h-10 w-10 animate-spin text-primary" /></div>}>
            <BoardsPageContent />
        </Suspense>
    );
}
