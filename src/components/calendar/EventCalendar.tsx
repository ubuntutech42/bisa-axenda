"use client";

import { useState, useMemo, useEffect } from 'react';
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { culturalEvents } from '@/lib/data';
import type { Task, CulturalEvent, KanbanBoard } from '@/lib/types';
import { format, isSameDay, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import { Loader } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import type { CheckedState } from '@radix-ui/react-checkbox';


type CalendarEvent = (Task & { type: 'task' }) | (CulturalEvent & { type: 'cultural' });

export function EventCalendar() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [activeCategories, setActiveCategories] = useState({
    task: true,
    cultural: true,
  });
  
  const { user } = useUser();
  const firestore = useFirestore();

  const boardsQuery = useMemoFirebase(() => 
    user ? query(collection(firestore, 'kanbanBoards'), where('userId', '==', user.uid)) : null,
    [firestore, user]
  );
  const { data: boards, isLoading: areBoardsLoading } = useCollection<KanbanBoard>(boardsQuery);

  const [allTasks, setAllTasks] = useState<Task[]>([]);
  const [areTasksLoading, setAreTasksLoading] = useState(true);

  useEffect(() => {
    if (!boards || !firestore || !user) {
      if(boards === null || user === null) {
        setAreTasksLoading(false);
      }
      return;
    };

    const fetchTasks = async () => {
      setAreTasksLoading(true);
      if (boards.length === 0) {
        setAllTasks([]);
        setAreTasksLoading(false);
        return;
      }

      const tasksPromises = boards.map(board => 
        import('firebase/firestore').then(({ getDocs, collection }) => 
          getDocs(collection(firestore, 'kanbanBoards', board.id, 'tasks'))
        )
      );
      
      const snapshots = await Promise.all(tasksPromises);
      const tasks: Task[] = [];
      snapshots.forEach(snapshot => {
        snapshot.forEach(doc => {
          tasks.push({ id: doc.id, ...doc.data() } as Task);
        });
      });
      setAllTasks(tasks);
      setAreTasksLoading(false);
    };

    fetchTasks();
  }, [boards, firestore, user]);


  const allEvents: CalendarEvent[] = useMemo(() => {
    const tasksWithDeadlines = allTasks.filter(t => t.deadline);
    const eventList: CalendarEvent[] = [];
    if (activeCategories.task) {
        eventList.push(...tasksWithDeadlines.map(t => ({...t, type: 'task' as const })));
    }
    if (activeCategories.cultural) {
        eventList.push(...culturalEvents.map(e => ({...e, type: 'cultural' as const, id: e.title, title: e.title})));
    }
    return eventList;
  }, [allTasks, activeCategories]);

  const selectedDayEvents = date ? allEvents.filter(event => {
    const eventDate = 'deadline' in event && event.deadline ? event.deadline : ('date' in event ? event.date : undefined);
    if (!eventDate) return false;
    return isSameDay(parseISO(eventDate), date);
  }) : [];

  const handleCategoryChange = (category: 'task' | 'cultural', checked: CheckedState) => {
    setActiveCategories(prev => ({
      ...prev,
      [category]: !!checked,
    }));
  };

  if (areBoardsLoading || areTasksLoading) {
    return <div className="flex items-center justify-center h-full"><Loader className="h-10 w-10 animate-spin text-primary" /></div>
  }

  return (
    <div className="lg:grid lg:grid-cols-3 lg:gap-8">
      <div className="lg:col-span-2">
        <Card>
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            className="p-0"
            locale={ptBR}
            classNames={{
              day: "h-12 w-12 text-base",
              head_cell: "text-muted-foreground rounded-md w-12 font-normal text-sm",
            }}
            components={{
              DayContent: ({ date }) => {
                const dayEvents = allEvents.filter(event => {
                    const eventDate = 'deadline' in event && event.deadline ? event.deadline : ('date' in event ? event.date : undefined);
                    if (!eventDate) return false;
                    return isSameDay(parseISO(eventDate), date);
                });
                return (
                  <div className="relative h-full w-full flex items-center justify-center">
                    <span>{format(date, 'd')}</span>
                    {dayEvents.length > 0 && (
                      <div className="absolute bottom-1 w-1 h-1 rounded-full bg-primary"></div>
                    )}
                  </div>
                );
              }
            }}
          />
        </Card>
      </div>
      <div>
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">
              {date ? format(date, "d 'de' MMMM 'de' yyyy", { locale: ptBR }) : 'Selecione uma data'}
            </CardTitle>
            <div className="flex items-center space-x-4 pt-2">
              <div className="flex items-center space-x-2">
                <Checkbox id="task-filter" checked={activeCategories.task} onCheckedChange={(checked) => handleCategoryChange('task', checked)} />
                <label htmlFor="task-filter" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Tarefas
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="cultural-filter" checked={activeCategories.cultural} onCheckedChange={(checked) => handleCategoryChange('cultural', checked)} />
                <label htmlFor="cultural-filter" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Cultural
                </label>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-80">
              <div className="space-y-4">
                {selectedDayEvents.length > 0 ? (
                  selectedDayEvents.map((event) => (
                    <div key={`${event.type}-${event.id}`} className="p-3 rounded-lg bg-muted/50">
                      {event.type === 'task' ? (
                        <>
                          <div className="flex justify-between items-start">
                             <p className="font-semibold">{event.title}</p>
                             <Badge variant="secondary">Tarefa</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{event.category}</p>
                        </>
                      ) : (
                        <>
                           <div className="flex justify-between items-start">
                             <p className="font-semibold">{event.title}</p>
                             <Badge className="bg-accent text-accent-foreground">Cultural</Badge>
                           </div>
                           <p className="text-sm text-muted-foreground mt-1">{event.description}</p>
                        </>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-center text-muted-foreground py-10">Nenhum evento para este dia.</p>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
