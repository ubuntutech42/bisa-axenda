"use client";

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Task } from '@/lib/types';
import { cn } from '@/lib/utils';
import { formatDistanceToNowStrict } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Clock, MessageSquare, CheckSquare } from 'lucide-react';
import { Draggable } from 'react-beautiful-dnd';

interface KanbanCardProps {
  task: Task;
  index: number;
  onClick: () => void;
}

const priorityClasses: Record<Task['priority'], string> = {
  Baixa: 'border-secondary',
  Média: 'border-accent',
  Alta: 'border-primary',
  Urgente: 'border-destructive',
};

const categoryClasses: Record<Task['category'], string> = {
    Trabalho: "bg-chart-1/10 text-chart-1 border-chart-1/20",
    Estudo: "bg-chart-2/10 text-chart-2 border-chart-2/20",
    Criação: "bg-chart-3/10 text-chart-3 border-chart-3/20",
    "Autocuidado": "bg-chart-4/10 text-chart-4 border-chart-4/20",
    Pessoal: "bg-chart-5/10 text-chart-5 border-chart-5/20",
};


export function KanbanCard({ task, index, onClick }: KanbanCardProps) {
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
    const createdAtDate = task.createdAt?.toDate();
    if(createdAtDate) {
      return `Criada há ${formatDistanceToNowStrict(createdAtDate, { locale: ptBR })}`;
    }
    return '';
  };
  const timeText = getTimeText();

  return (
    <Draggable draggableId={task.id} index={index}>
      {(provided, snapshot) => (
        <div
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            onClick={onClick}
            className="mb-2"
        >
            <Card
              className={cn(
                'cursor-pointer hover:shadow-lg transition-shadow duration-200 border-l-4 bg-card',
                priorityClasses[task.priority],
                snapshot.isDragging && 'shadow-xl ring-2 ring-primary'
              )}
            >
              <CardContent className="p-3">
                <p className="font-semibold mb-2 text-foreground">{task.title}</p>
                <div className="flex flex-wrap gap-2 mb-3">
                  <Badge variant="outline" className={cn(categoryClasses[task.category])}>
                    {task.category}
                  </Badge>
                </div>
                <div className="flex justify-between items-center text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{timeText}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    {task.comments && task.comments.length > 0 && (
                      <div className="flex items-center gap-1">
                        <MessageSquare className="w-3 h-3" />
                        <span>{task.comments.length}</span>
                      </div>
                    )}
                    {checklistTotal > 0 && (
                      <div className="flex items-center gap-1">
                        <CheckSquare className="w-3 h-3" />
                        <span>{checklistProgress}/{checklistTotal}</span>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
        </div>
      )}
    </Draggable>
  );
}
