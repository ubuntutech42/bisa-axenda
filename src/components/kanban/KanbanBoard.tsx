"use client";

import { useState, useEffect, useMemo } from 'react';
import { KanbanColumn } from './KanbanColumn';
import { TaskDialog } from './TaskDialog';
import type { Task, KanbanList } from '@/lib/types';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, doc, updateDoc, serverTimestamp, writeBatch } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Loader } from 'lucide-react';

interface KanbanBoardProps {
  lists: KanbanList[];
}

export function KanbanBoard({ lists }: KanbanBoardProps) {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  // Fetch Tasks
  const tasksQuery = useMemoFirebase(() => 
    user ? collection(firestore, 'users', user.uid, 'tasks') : null, 
    [firestore, user]
  );
  const { data: tasks, isLoading: areTasksLoading } = useCollection<Task>(tasksQuery);

  const [activeTask, setActiveTask] = useState<Task | null>(null);

  // Create default lists if none exist
  useEffect(() => {
    if (user && lists && lists.length === 0 && !areTasksLoading) {
      const createDefaultLists = async () => {
        const batch = writeBatch(firestore);
        const defaultLists = [
          { name: 'Backlog', order: 0 },
          { name: 'A Fazer', order: 1 },
          { name: 'Em Progresso', order: 2 },
          { name: 'Revisão', order: 3 },
          { name: 'Concluído', order: 4 },
        ];
        const listsCollection = collection(firestore, 'users', user.uid, 'kanbanLists');
        
        defaultLists.forEach(list => {
          const docRef = doc(listsCollection);
          batch.set(docRef, { ...list, userId: user.uid });
        });
        
        try {
          await batch.commit();
          toast({ title: 'Quadro iniciado!', description: 'Suas colunas padrão foram criadas.' });
        } catch (error) {
          console.error("Error creating default lists:", error);
          toast({ variant: "destructive", title: "Erro", description: "Não foi possível criar as colunas do quadro." });
        }
      };
      createDefaultLists();
    }
  }, [user, lists, firestore, toast, areTasksLoading]);

  const sortedLists = useMemo(() => {
    if (!lists) return [];
    return [...lists].sort((a, b) => a.order - b.order);
  }, [lists]);

  const handleCardClick = (task: Task) => {
    setActiveTask(task);
  };

  const handleCloseDialog = () => {
    setActiveTask(null);
  };

  const handleSaveTask = async (updatedTaskData: Partial<Task> & { id?: string }) => {
    if (!user || !updatedTaskData.id) return;
    try {
      const taskRef = doc(firestore, 'users', user.uid, 'tasks', updatedTaskData.id);
      await updateDoc(taskRef, {
        ...updatedTaskData,
        updatedAt: serverTimestamp(),
      });
      toast({
        title: 'Tarefa atualizada!',
        description: `A tarefa "${updatedTaskData.title}" foi salva.`,
      });
      handleCloseDialog();
    } catch (error) {
      console.error("Error updating task:", error);
      toast({
        variant: 'destructive',
        title: 'Erro ao atualizar',
        description: 'Não foi possível salvar as alterações. Tente novamente.',
      });
    }
  };

  const handleUpdateColumnName = async (listId: string, newName: string) => {
    if (!user) return;
    try {
      const listRef = doc(firestore, 'users', user.uid, 'kanbanLists', listId);
      await updateDoc(listRef, { name: newName });
      toast({ title: 'Coluna atualizada!', description: `O nome da coluna foi alterado para "${newName}".` });
    } catch (error) {
      console.error('Error updating column name:', error);
      toast({ variant: 'destructive', title: 'Erro', description: 'Não foi possível atualizar a coluna.' });
    }
  };

  const tasksByListId = useMemo(() => {
    if (!tasks) return {};
    return tasks.reduce((acc, task) => {
      // Default to the first column ('Backlog') if listId is missing
      const listId = task.listId || (sortedLists.find(l => l.order === 0)?.id);
      if (!listId) return acc;
      if (!acc[listId]) {
        acc[listId] = [];
      }
      acc[listId].push(task);
      return acc;
    }, {} as Record<string, Task[]>);
  }, [tasks, sortedLists]);

  if (areTasksLoading) {
    return <div className="flex items-center justify-center h-96"><Loader className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  return (
    <>
      <ScrollArea className="w-full whitespace-nowrap">
        <div className="flex gap-4 pb-4 items-start">
          {sortedLists.map((list) => {
            const columnTasks = tasksByListId[list.id] || [];
            return (
              <KanbanColumn
                key={list.id}
                list={list}
                tasks={columnTasks}
                onCardClick={handleCardClick}
                onUpdateListName={handleUpdateColumnName}
              />
            );
          })}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
      <TaskDialog 
        task={activeTask} 
        isOpen={!!activeTask} 
        onClose={handleCloseDialog}
        onSave={handleSaveTask}
        lists={sortedLists}
      />
    </>
  );
}
