
"use client";

import { useState } from 'react';
import { KanbanCard } from './KanbanCard';
import type { Task, KanbanList } from '@/lib/types';
import { Input } from '../ui/input';
import { Droppable } from 'react-beautiful-dnd';
import { cn } from '@/lib/utils';

interface KanbanColumnProps {
  list: KanbanList;
  tasks: Task[];
  onCardClick: (task: Task) => void;
  onUpdateListName: (listId: string, newName: string) => void;
}

export function KanbanColumn({ list, tasks, onCardClick, onUpdateListName }: KanbanColumnProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [listName, setListName] = useState(list.name);

  const handleTitleClick = () => {
    setIsEditing(true);
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setListName(e.target.value);
  };

  const handleNameBlur = () => {
    setIsEditing(false);
    if (listName.trim() && listName !== list.name) {
      onUpdateListName(list.id, listName);
    } else {
      setListName(list.name);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleNameBlur();
    }
  };

  return (
    <div className="flex flex-col w-72 md:w-80 flex-shrink-0">
      <div className="flex items-center justify-between p-2 mb-2">
        {isEditing ? (
          <Input
            value={listName}
            onChange={handleNameChange}
            onBlur={handleNameBlur}
            onKeyDown={handleKeyDown}
            autoFocus
            className="font-headline font-semibold text-foreground bg-transparent border-primary"
          />
        ) : (
          <h2
            className="font-headline font-semibold text-foreground cursor-pointer"
            onClick={handleTitleClick}
          >
            {list.name}
          </h2>
        )}
        <span className="text-sm font-medium bg-muted text-muted-foreground rounded-full px-2 py-0.5">
          {tasks.length}
        </span>
      </div>
      <Droppable droppableId={list.id} isDropDisabled={false}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={cn("flex-1 bg-muted/50 rounded-lg p-2 overflow-y-auto min-h-[300px] transition-colors", snapshot.isDraggingOver && "bg-primary/10")}
          >
            {tasks.map((task, index) => (
              <KanbanCard key={task.id} task={task} index={index} onClick={() => onCardClick(task)} />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
}
