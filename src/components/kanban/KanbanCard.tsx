"use client";

import React from 'react';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Task } from '@/lib/types';
import { cn } from '@/lib/utils';
import { formatDistanceToNowStrict } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Clock, MessageSquare, CheckSquare, AlignLeft } from 'lucide-react';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';

interface KanbanCardProps {
  task: Task;
  index: number;
  onClick: () => void;
}

const priorityClasses: Record<Task['priority'], string> = {
  Baixa: 'border-green-500',
  Média: 'border-yellow-500',
  Alta: 'border-orange-500',
  Urgente: 'border-red-500',
};

const priorityStripClasses: Record<Task['priority'], string> = {
  Baixa: 'bg-green-500/25',
  Média: 'bg-yellow-500/25',
  Alta: 'bg-orange-500/25',
  Urgente: 'bg-red-500/25',
};

const categoryClasses: Record<Task['category'], string> = {
    Trabalho: "bg-chart-1/10 text-chart-1 border-chart-1/20",
    Estudo: "bg-chart-2/10 text-chart-2 border-chart-2/20",
    Criação: "bg-chart-3/10 text-chart-3 border-chart-3/20",
    "Autocuidado": "bg-chart-4/10 text-chart-4 border-chart-4/20",
    Pessoal: "bg-chart-5/10 text-chart-5 border-chart-5/20",
};


function KanbanCardInner({ task, index, onClick }: KanbanCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging,
  } = useDraggable({ id: task.id });

  const style = transform
    ? { transform: CSS.Translate.toString(transform) }
    : undefined;

  const checklistProgress = task.checklist ? task.checklist.filter(item => item.completed).length : 0;
  const checklistTotal = task.checklist ? task.checklist.length : 0;

  const getTimeText = () => {
    if (task.deadline) {
      const deadlineDate = new Date(task.deadline);
      const now = new Date();
      const distanceText = formatDistanceToNowStrict(deadlineDate, { locale: ptBR });
      if (deadlineDate < now) {
        return `Venceu há ${distanceText}`;
      }
      return `Vence em ${distanceText}`;
    }
    return null;
  };
  const timeText = getTimeText();

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      onClick={onClick}
      className="mb-3"
    >
      <Card
        className={cn(
          'cursor-grab active:cursor-grabbing border-l-4 hover:shadow-md transition-shadow overflow-hidden rounded-lg',
          priorityClasses[task.priority],
          isDragging && 'shadow-xl ring-2 ring-primary opacity-90'
        )}
      >
              {task.coverImageUrl ? (
                <div className="w-full h-[100px] bg-muted rounded-t-lg overflow-hidden">
                  <img
                    src={task.coverImageUrl}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className={cn('w-full h-1 rounded-t-lg', priorityStripClasses[task.priority])} aria-hidden />
              )}
              <CardHeader className="p-2.5 pb-1">
                <Badge variant="outline" className={cn("text-xs self-start shrink-0", categoryClasses[task.category])}>{task.category}</Badge>
              </CardHeader>
              <CardContent className="p-2.5 pt-0">
                <p className="font-medium text-sm text-card-foreground leading-snug line-clamp-2 break-words">{task.title}</p>
              </CardContent>
              <CardFooter className="p-2.5 pt-1 flex justify-between items-center gap-2 text-xs text-muted-foreground min-h-0">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  {task.description && <AlignLeft className="w-3.5 h-3.5 shrink-0" />}
                  {task.comments && task.comments.length > 0 && (
                    <div className="flex items-center gap-0.5 shrink-0">
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>{task.comments.length}</span>
                    </div>
                  )}
                  {checklistTotal > 0 && (
                    <div className={cn("flex items-center gap-0.5 shrink-0", checklistProgress === checklistTotal && "text-green-600")}>
                      <CheckSquare className="w-3.5 h-3.5" />
                      <span>{checklistProgress}/{checklistTotal}</span>
                    </div>
                  )}
                </div>
                {timeText && (
                  <div className="flex items-center gap-0.5 shrink-0">
                    <Clock className="w-3.5 h-3.5" />
                    <span className="truncate">{timeText}</span>
                  </div>
                )}
              </CardFooter>
            </Card>
    </div>
  );
}

export const KanbanCard = React.memo(KanbanCardInner);
