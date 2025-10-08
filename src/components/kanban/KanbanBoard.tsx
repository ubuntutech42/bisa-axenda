"use client";

import { useState, useEffect, useMemo } from 'react';
import { KanbanColumn } from './KanbanColumn';
import { TaskDialog } from './TaskDialog';
import { columns as initialColumns, columnOrder } from '@/lib/data';
import type { Task, Status } from '@/lib/types';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';

export function KanbanBoard() {
  const { user } = useUser();
  const firestore = useFirestore();

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
            newColumns[task.status].taskIds.push(task.id);
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

  const handleSaveTask = (updatedTask: Task) => {
    // In a real app, this would also update the backend.
    // We will do this in the next step.
    console.log("Saving task:", updatedTask);
  };

  const tasksById = useMemo(() => {
    if (!tasks) return {};
    return tasks.reduce((acc, task) => {
      acc[task.id] = task;
      return acc;
    }, {} as Record<string, Task>);
  }, [tasks]);

  if (isLoading) {
      // You can return a loader here
      return <div>Carregando...</div>
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
