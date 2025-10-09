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
  boardId: string;
  lists: KanbanList[];
}

export function KanbanBoard({ boardId, lists }: KanbanBoardProps) {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  const tasksQuery = useMemoFirebase(() => 
    user && boardId ? collection(firestore, 'kanbanBoards', boardId, 'tasks') : null, 
    [firestore, user, boardId]
  );
  const { data: tasks, isLoading: areTasksLoading } = useCollection<Task>(tasksQuery);

  const [activeTask, setActiveTask] = useState<Task | null>(null);

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
    if (!user || !updatedTaskData.id || !boardId) return;
    try {
      const taskRef = doc(firestore, 'kanbanBoards', boardId, 'tasks', updatedTaskData.id);
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
    if (!user || !boardId) return;
    try {
      const listRef = doc(firestore, 'kanbanBoards', boardId, 'lists', listId);
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
