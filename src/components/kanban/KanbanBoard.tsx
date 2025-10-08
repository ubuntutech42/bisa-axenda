"use client";

import { useState, useEffect } from 'react';
import { KanbanColumn } from './KanbanColumn';
import { TaskDialog } from './TaskDialog';
import { tasks as initialTasks, columns as initialColumns, columnOrder } from '@/lib/data';
import type { Task, KanbanColumn as ColumnType } from '@/lib/types';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

export function KanbanBoard() {
  const [tasks, setTasks] = useState<Record<string, Task>>(initialTasks);
  const [columns, setColumns] = useState<Record<string, ColumnType>>(initialColumns);
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  const handleCardClick = (task: Task) => {
    setActiveTask(task);
  };

  const handleCloseDialog = () => {
    setActiveTask(null);
  };

  const handleSaveTask = (updatedTask: Task) => {
    // In a real app, this would also update the backend.
    setTasks(prev => ({ ...prev, [updatedTask.id]: updatedTask }));
    
    // Logic to move task between columns if status changes
    const oldStatus = initialTasks[updatedTask.id].status;
    const newStatus = updatedTask.status;

    if (oldStatus !== newStatus) {
        setColumns(prev => {
            const newColumns = {...prev};
            
            // Remove from old column
            const oldColumn = newColumns[oldStatus];
            oldColumn.taskIds = oldColumn.taskIds.filter(id => id !== updatedTask.id);

            // Add to new column
            const newColumn = newColumns[newStatus];
            newColumn.taskIds.push(updatedTask.id);

            return newColumns;
        });
    }

    // to refresh the view
    initialTasks[updatedTask.id] = updatedTask;
  };

  return (
    <>
      <ScrollArea className="w-full whitespace-nowrap">
        <div className="flex gap-4 pb-4">
          {columnOrder.map((columnId) => {
            const column = columns[columnId];
            const columnTasks = column.taskIds.map((taskId) => tasks[taskId]);
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
