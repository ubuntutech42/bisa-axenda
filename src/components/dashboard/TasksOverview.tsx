"use client";

import type { Task, Priority } from '@/lib/types';
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

interface TasksOverviewProps {
    tasks: Task[];
    lists: { id: string, name: string }[];
}

export function TasksOverview({ tasks, lists }: TasksOverviewProps) {
  const completedListName = 'Concluído';
  const completedList = lists.find(list => list.name.toLowerCase() === completedListName.toLowerCase());

  const upcomingTasks = tasks
    .filter(task => (!completedList || task.listId !== completedList.id) && task.deadline)
    .sort((a, b) => new Date(a.deadline!).getTime() - new Date(b.deadline!).getTime())
    .slice(0, 5);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Próximas Tarefas</CardTitle>
        <CardDescription>Seus prazos mais urgentes e próximos.</CardDescription>
      </CardHeader>
      <CardContent>
        {upcomingTasks.length > 0 ? (
          <ul className="space-y-4">
            {upcomingTasks.map((task) => (
              <li key={task.id} className="flex items-center justify-between">
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
            ))}
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
