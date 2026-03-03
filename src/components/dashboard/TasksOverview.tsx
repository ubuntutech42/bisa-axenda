"use client";

import React from 'react';
import type { Task, Priority, KanbanList } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge, type BadgeProps } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const priorityVariantMap: Record<Priority, BadgeProps['variant']> = {
  Urgente: 'destructive',
  Alta: 'default',
  Média: 'secondary',
  Baixa: 'outline',
};

const TaskRow = React.memo(function TaskRow({ task }: { task: Task }) {
  return (
    <li className="flex items-center justify-between">
      <div>
        <p className="font-semibold">{task.title}</p>
        <p className="text-sm text-muted-foreground">
          Vence {formatDistanceToNow(new Date(task.deadline!), { addSuffix: true, locale: ptBR })}
        </p>
      </div>
      <Badge variant={priorityVariantMap[task.priority]} className="text-xs">
        {task.priority}
      </Badge>
    </li>
  );
});

interface TasksOverviewProps {
  tasks: Task[];
  lists: KanbanList[];
}

function TasksOverviewInner({ tasks, lists }: TasksOverviewProps) {
  const completedListNames = ['concluído', 'done'];
  const completedListIds = React.useMemo(
    () => lists.filter(l => completedListNames.includes(l.name.toLowerCase())).map(l => l.id),
    [lists]
  );

  const upcomingTasks = React.useMemo(
    () =>
      tasks
        .filter(task => !completedListIds.includes(task.listId) && task.deadline)
        .sort((a, b) => new Date(a.deadline!).getTime() - new Date(b.deadline!).getTime())
        .slice(0, 5),
    [tasks, completedListIds]
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Próximas Tarefas</CardTitle>
        <CardDescription>Seus prazos mais urgentes e próximos.</CardDescription>
      </CardHeader>
      <CardContent>
        {upcomingTasks.length > 0 ? (
          <ul className="space-y-4">
            {upcomingTasks.map((task) => <TaskRow key={task.id} task={task} />)}
          </ul>
        ) : (
          <p className="text-center text-muted-foreground py-4">
            Nenhum prazo próximo. Hora de planejar!
          </p>
        )}
      </CardContent>
    </Card>
  );
}

export const TasksOverview = React.memo(TasksOverviewInner);
