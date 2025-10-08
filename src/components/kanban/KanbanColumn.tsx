"use client";

import { KanbanCard } from './KanbanCard';
import type { Task, KanbanColumn as ColumnType } from '@/lib/types';

interface KanbanColumnProps {
  column: ColumnType;
  tasks: Task[];
  onCardClick: (task: Task) => void;
}

export function KanbanColumn({ column, tasks, onCardClick }: KanbanColumnProps) {
  return (
    <div className="flex flex-col w-72 md:w-80 flex-shrink-0">
      <div className="flex items-center justify-between p-2 mb-2">
        <h2 className="font-headline font-semibold text-foreground">{column.title}</h2>
        <span className="text-sm font-medium bg-muted text-muted-foreground rounded-full px-2 py-0.5">
          {tasks.length}
        </span>
      </div>
      <div className="flex-1 bg-muted/50 rounded-lg p-2 overflow-y-auto min-h-[300px]">
        {tasks.map((task) => (
          <KanbanCard key={task.id} task={task} onClick={() => onCardClick(task)} />
        ))}
      </div>
    </div>
  );
}
