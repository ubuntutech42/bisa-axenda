"use client";

import { useState } from 'react';
import { KanbanCard } from './KanbanCard';
import type { Task, KanbanList } from '@/lib/types';
import { Input } from '../ui/input';
import { Droppable } from 'react-beautiful-dnd';
import { cn } from '@/lib/utils';
import { Button } from '../ui/button';
import { Plus } from 'lucide-react';
import { ScrollArea } from '../ui/scroll-area';

interface KanbanColumnProps {
  list: KanbanList;
  tasks: Task[];
  onCardClick: (task: Task) => void;
  onUpdateListName: (listId: string, newName: string) => void;
  onNewTaskClick: () => void;
}

export function KanbanColumn({ list, tasks, onCardClick, onUpdateListName, onNewTaskClick }: KanbanColumnProps) {
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
    <div className="flex flex-col w-72 md:w-80 flex-shrink-0 h-full">
        <div 
            className="flex flex-col bg-muted/50 rounded-lg max-h-full"
        >
            <div className="flex items-center justify-between p-3 border-b">
                {isEditing ? (
                <Input
                    value={listName}
                    onChange={handleNameChange}
                    onBlur={handleNameBlur}
                    onKeyDown={handleKeyDown}
                    autoFocus
                    className="font-semibold bg-card border-primary h-8"
                />
                ) : (
                <h2
                    className="font-semibold text-foreground cursor-pointer p-1"
                    onClick={handleTitleClick}
                >
                    {list.name}
                </h2>
                )}
                 <span className="text-sm font-normal text-muted-foreground">{tasks.length}</span>
            </div>
            <Droppable droppableId={list.id} isDropDisabled={false}>
                {(provided, snapshot) => (
                <ScrollArea
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={cn("flex-1 p-3 transition-colors", snapshot.isDraggingOver && "bg-muted")}
                >
                    {tasks.map((task, index) => (
                    <KanbanCard key={task.id} task={task} index={index} onClick={() => onCardClick(task)} />
                    ))}
                    {provided.placeholder}
                </ScrollArea>
                )}
            </Droppable>
            <div className='p-2 mt-auto border-t'>
                <Button onClick={onNewTaskClick} variant='ghost' className='w-full justify-start text-muted-foreground hover:bg-muted hover:text-foreground'>
                    <Plus className='mr-2' />
                    Adicionar um cartão
                </Button>
            </div>
      </div>
    </div>
  );
}
