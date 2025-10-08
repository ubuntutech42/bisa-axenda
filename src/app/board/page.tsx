'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, addDoc, serverTimestamp, query } from 'firebase/firestore';
import { Header } from '@/components/layout/Header';
import { KanbanBoard } from '@/components/kanban/KanbanBoard';
import { Button } from '@/components/ui/button';
import { Loader, Plus } from 'lucide-react';
import { TaskDialog } from '@/components/kanban/TaskDialog';
import type { Task, KanbanList } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

export default function BoardPage() {
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isNewTaskDialogOpen, setIsNewTaskDialogOpen] = useState(false);

  const listsQuery = useMemoFirebase(() => 
    user ? query(collection(firestore, 'users', user.uid, 'kanbanLists')) : null, 
    [firestore, user]
  );
  const { data: lists, isLoading: areListsLoading } = useCollection<KanbanList>(listsQuery);

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [isUserLoading, user, router]);

  const handleCreateTask = async (newTaskData: Omit<Task, 'id' | 'userId' | 'timeSpent' >) => {
    if (!user) return;
    try {
      const tasksCollection = collection(firestore, 'users', user.uid, 'tasks');
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

  const handleAddColumn = async () => {
    if (!user) return;
    const newColumnName = prompt('Digite o nome da nova coluna:');
    if (newColumnName) {
      try {
        const listsCollection = collection(firestore, 'users', user.uid, 'kanbanLists');
        await addDoc(listsCollection, {
          name: newColumnName,
          order: lists ? lists.length : 0,
          userId: user.uid,
        });
        toast({ title: 'Coluna adicionada!', description: `A coluna "${newColumnName}" foi criada.` });
      } catch (error) {
        console.error('Error adding column:', error);
        toast({ variant: 'destructive', title: 'Erro', description: 'Não foi possível adicionar a coluna.' });
      }
    }
  };

  if (isUserLoading || areListsLoading || !user || !lists) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <Header title="Quadro Kanban">
        <div className="flex items-center gap-2">
          <Button onClick={() => setIsNewTaskDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Nova Tarefa
          </Button>
          <Button variant="outline" onClick={handleAddColumn}>
            <Plus className="mr-2 h-4 w-4" />
            Adicionar Lista
          </Button>
        </div>
      </Header>
      <div className="flex-1 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8">
        <KanbanBoard lists={lists} />
      </div>
      <TaskDialog
        isOpen={isNewTaskDialogOpen}
        onClose={() => setIsNewTaskDialogOpen(false)}
        onSave={handleCreateTask}
        lists={lists}
      />
    </div>
  );
}
