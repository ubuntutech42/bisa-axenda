"use client";

import { tasks as allTasks } from '@/lib/data';
import type { Task, Priority } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge, type BadgeProps } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';

const priorityVariantMap: Record<Priority, BadgeProps['variant']> = {
  Urgent: 'destructive',
  High: 'default',
  Medium: 'secondary',
  Low: 'outline',
};

export function TasksOverview() {
  const upcomingTasks = Object.values(allTasks)
    .filter(task => task.status !== 'Done' && task.deadline)
    .sort((a, b) => new Date(a.deadline!).getTime() - new Date(b.deadline!).getTime())
    .slice(0, 5);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upcoming Tasks</CardTitle>
        <CardDescription>Your most urgent and upcoming deadlines.</CardDescription>
      </CardHeader>
      <CardContent>
        {upcomingTasks.length > 0 ? (
          <ul className="space-y-4">
            {upcomingTasks.map((task) => (
              <li key={task.id} className="flex items-center justify-between">
                <div>
                  <p className="font-semibold">{task.title}</p>
                  <p className="text-sm text-muted-foreground">
                    Due {formatDistanceToNow(new Date(task.deadline!), { addSuffix: true })}
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
            No upcoming deadlines. Time to plan ahead!
          </p>
        )}
      </CardContent>
    </Card>
  );
}
