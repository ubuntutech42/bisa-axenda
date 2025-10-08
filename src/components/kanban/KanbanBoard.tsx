"use client";

import { useState, useEffect, useMemo } from 'react';
import { KanbanColumn } from './KanbanColumn';
import { TaskDialog } from './TaskDialog';
import { columns as initialColumns, columnOrder } from '@/lib/data';
import type { Task, Status } from '@/lib/types';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Loader } from 'lucide-react';

export function KanbanBoard() {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  const tasksQuery = useMemoFirebase(() => 
    user ? collection(firestore, 'users', user.uid, 'tasks') : null, 
    [firestore, user]
  );
  
  const { data: tasks, isLoading } = useCollection<Task>(tasksQuery);

  const [columns, setColumns] = useState(initialColumns);
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  useEffect(() => {
    if (tasks) {
      setColumns(prevColumns => {
        const newColumns = { ...prevColumns };
        // Reset taskIds
        Object.keys(newColumns).forEach(key => {
            newColumns[key as Status].taskIds = [];
        });
        // Populate taskIds from fetched tasks
        tasks.forEach(task => {
          if (newColumns[task.status]) {
            // Avoid duplicates
            if (!newColumns[task.status].taskIds.includes(task.id)) {
              newColumns[task.status].taskIds.push(task.id);
            }
          }
        });
        return newColumns;
      });
    }
  }, [tasks]);


  const handleCardClick = (task: Task) => {
    setActiveTask(task);
  };

  const handleCloseDialog = () => {
    setActiveTask(null);
  };

  const handleSaveTask = async (updatedTask: Task) => {
    if (!user) return;
    try {
      const taskRef = doc(firestore, 'users', user.uid, 'tasks', updatedTask.id);
      await updateDoc(taskRef, {
        ...updatedTask,
        updatedAt: serverTimestamp(),
      });
      toast({
        title: 'Tarefa atualizada!',
        description: `A tarefa "${updatedTask.title}" foi salva.`,
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

  const tasksById = useMemo(() => {
    if (!tasks) return {};
    return tasks.reduce((acc, task) => {
      acc[task.id] = task;
      return acc;
    }, {} as Record<string, Task>);
  }, [tasks]);

  if (isLoading) {
      return <div className="flex items-center justify-center h-96"><Loader className="h-8 w-8 animate-spin text-primary" /></div>
  }

  return (
    <>
      <ScrollArea className="w-full whitespace-nowrap">
        <div className="flex gap-4 pb-4">
          {columnOrder.map((columnId) => {
            const column = columns[columnId];
            const columnTasks = column.taskIds.map((taskId) => tasksById[taskId]).filter(Boolean);
            return (
              <KanbanColumn
                key={column.id}
                column={column}
                tasks={columnTasks}
                onCardClick={handleCardClick}
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
      />
    </>
  );
}
