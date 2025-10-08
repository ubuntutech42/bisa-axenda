"use client";

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Task } from '@/lib/types';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { Clock, MessageSquare, CheckSquare } from 'lucide-react';

interface KanbanCardProps {
  task: Task;
  onClick: () => void;
}

const priorityClasses: Record<Task['priority'], string> = {
  Low: 'border-secondary',
  Medium: 'border-accent',
  High: 'border-primary',
  Urgent: 'border-destructive',
};

const categoryClasses: Record<Task['category'], string> = {
    Work: "bg-chart-1/10 text-chart-1 border-chart-1/20",
    Study: "bg-chart-2/10 text-chart-2 border-chart-2/20",
    Creation: "bg-chart-3/10 text-chart-3 border-chart-3/20",
    "Self-care": "bg-chart-4/10 text-chart-4 border-chart-4/20",
    Personal: "bg-chart-5/10 text-chart-5 border-chart-5/20",
};


export function KanbanCard({ task, onClick }: KanbanCardProps) {
  const checklistProgress = task.checklist ? task.checklist.filter(item => item.completed).length : 0;
  const checklistTotal = task.checklist ? task.checklist.length : 0;

  return (
    <Card
      onClick={onClick}
      className={cn(
        'mb-2 cursor-pointer hover:shadow-lg transition-shadow duration-200 border-l-4',
        priorityClasses[task.priority]
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
          {task.deadline && (
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>{formatDistanceToNow(new Date(task.deadline), { addSuffix: true })}</span>
            </div>
          )}
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
  );
}
