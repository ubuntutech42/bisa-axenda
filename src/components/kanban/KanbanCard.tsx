
"use client";

import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { Badge, type BadgeProps } from '@/components/ui/badge';
import type { Task } from '@/lib/types';
import { cn } from '@/lib/utils';
import { formatDistanceToNowStrict } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Clock, MessageSquare, CheckSquare, AlignLeft } from 'lucide-react';
import { Draggable } from 'react-beautiful-dnd';

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
    return null;
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
            className="mb-3"
        >
            <Card
              className={cn(
                'cursor-pointer border-l-4 hover:shadow-md transition-shadow',
                priorityClasses[task.priority],
                snapshot.isDragging && 'shadow-xl ring-2 ring-primary'
              )}
            >
              <CardHeader className="p-3">
                <Badge variant="outline" className={cn("text-xs self-start", categoryClasses[task.category])}>{task.category}</Badge>
              </CardHeader>
              <CardContent className="p-3 pt-0">
                <p className="font-medium text-sm text-card-foreground">{task.title}</p>
              </CardContent>
              <CardFooter className="p-3 pt-0 flex justify-between items-center text-xs text-muted-foreground">
                <div className="flex items-center gap-3">
                  {task.description && <AlignLeft className="w-4 h-4" />}
                  {task.comments && task.comments.length > 0 && (
                    <div className="flex items-center gap-1">
                      <MessageSquare className="w-4 h-4" />
                      <span>{task.comments.length}</span>
                    </div>
                  )}
                  {checklistTotal > 0 && (
                    <div className={cn("flex items-center gap-1", checklistProgress === checklistTotal && "text-green-600")}>
                      <CheckSquare className="w-4 h-4" />
                      <span>{checklistProgress}/{checklistTotal}</span>
                    </div>
                  )}
                </div>
                {timeText && (
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>{timeText}</span>
                  </div>
                )}
              </CardFooter>
            </Card>
        </div>
      )}
    </Draggable>
  );
}
