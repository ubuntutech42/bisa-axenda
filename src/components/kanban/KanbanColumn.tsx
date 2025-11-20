"use client";

import { useState } from 'react';
import { KanbanCard } from './KanbanCard';
import type { Task, KanbanList } from '@/lib/types';
import { Input } from '../ui/input';
import { Droppable } from 'react-beautiful-dnd';
import { cn } from '@/lib/utils';
import { Button } from '../ui/button';
import { Plus } from 'lucide-react';

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
            className="flex flex-col bg-gray-200/90 rounded-lg max-h-full"
        >
            <div className="flex items-center justify-between p-2 mb-2">
                {isEditing ? (
                <Input
                    value={listName}
                    onChange={handleNameChange}
                    onBlur={handleNameBlur}
                    onKeyDown={handleKeyDown}
                    autoFocus
                    className="font-semibold text-gray-800 bg-white border-primary h-8"
                />
                ) : (
                <h2
                    className="font-semibold text-gray-800 cursor-pointer p-1"
                    onClick={handleTitleClick}
                >
                    {list.name}
                </h2>
                )}
            </div>
            <Droppable droppableId={list.id} isDropDisabled={false}>
                {(provided, snapshot) => (
                <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={cn("flex-1 px-2 overflow-y-auto min-h-[50px] transition-colors", snapshot.isDraggingOver && "bg-gray-400/20")}
                >
                    {tasks.map((task, index) => (
                    <KanbanCard key={task.id} task={task} index={index} onClick={() => onCardClick(task)} />
                    ))}
                    {provided.placeholder}
                </div>
                )}
            </Droppable>
            <div className='p-2 mt-2'>
                <Button onClick={onNewTaskClick} variant='ghost' className='w-full justify-start text-gray-600 hover:bg-gray-300/80 hover:text-gray-800'>
                    <Plus className='mr-2' />
                    Adicionar um cartão
                </Button>
            </div>
      </div>
    </div>
  );
}
