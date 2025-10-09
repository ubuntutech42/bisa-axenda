"use client";

import { useState, useMemo, useEffect } from 'react';
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { culturalEvents } from '@/lib/data';
import type { Task, CulturalEvent, KanbanBoard, CalendarEvent as CalendarEventType } from '@/lib/types';
import { format, isSameDay, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import { Loader } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import type { CheckedState } from '@radix-ui/react-checkbox';


type CombinedEvent = (Task & { type: 'task' }) | (CulturalEvent & { type: 'cultural'; id: string; title: string; }) | (CalendarEventType & { type: 'userEvent' });

export function EventCalendar() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [activeCategories, setActiveCategories] = useState({
    task: true,
    cultural: true,
    userEvent: true,
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

  const userEventsQuery = useMemoFirebase(() =>
    user ? query(collection(firestore, 'users', user.uid, 'calendarEvents')) : null,
    [firestore, user]
  );
  const { data: userEvents, isLoading: areUserEventsLoading } = useCollection<CalendarEventType>(userEventsQuery);

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


  const allEvents: CombinedEvent[] = useMemo(() => {
    const eventList: CombinedEvent[] = [];
    if (activeCategories.task) {
        const tasksWithDeadlines = allTasks.filter(t => t.deadline);
        eventList.push(...tasksWithDeadlines.map(t => ({...t, type: 'task' as const })));
    }
    if (activeCategories.cultural) {
        eventList.push(...culturalEvents.map(e => ({...e, type: 'cultural' as const, id: e.title, title: e.title})));
    }
    if (activeCategories.userEvent && userEvents) {
      eventList.push(...userEvents.map(e => ({...e, type: 'userEvent' as const })));
    }
    return eventList;
  }, [allTasks, userEvents, activeCategories]);

  const selectedDayEvents = date ? allEvents.filter(event => {
    const eventDate = 'deadline' in event && event.deadline ? event.deadline : ('date' in event ? event.date : undefined);
    if (!eventDate) return false;
    return isSameDay(parseISO(eventDate), date);
  }) : [];

  const handleCategoryChange = (category: 'task' | 'cultural' | 'userEvent', checked: CheckedState) => {
    setActiveCategories(prev => ({
      ...prev,
      [category]: !!checked,
    }));
  };

  const getEventDate = (event: CombinedEvent): string | undefined => {
    if (event.type === 'task') return event.deadline;
    return event.date;
  }

  if (areBoardsLoading || areTasksLoading || areUserEventsLoading) {
    return <div className="flex items-center justify-center h-full"><Loader className="h-10 w-10 animate-spin text-primary" /></div>
  }

  return (
    <div className="lg:grid lg:grid-cols-3 lg:gap-8">
      <div className="lg:col-span-2 mb-8 lg:mb-0">
        <Card>
          <div className="flex justify-center">
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            className="p-0"
            locale={ptBR}
            classNames={{
              day_cell: "h-12 w-12 text-base text-center",
              head_cell: "text-muted-foreground rounded-md w-12 font-normal text-sm",
              row: "flex w-full mt-2 gap-4",
            }}
            components={{
              DayContent: ({ date }) => {
                const dayEvents = allEvents.filter(event => {
                    const eventDate = getEventDate(event);
                    if (!eventDate) return false;
                    return isSameDay(parseISO(eventDate), date);
                });
                return (
                  <div className="relative flex items-center justify-center h-full w-full">
                    {format(date, 'd')}
                    {dayEvents.length > 0 && (
                      <div className="absolute bottom-1 flex justify-center gap-1">
                        {dayEvents.slice(0,3).map(event => (
                            <div key={`${event.type}-${event.id}`} className="w-1.5 h-1.5 rounded-full" style={{
                              backgroundColor: event.type === 'cultural' ? 'hsl(var(--accent))' : event.type === 'task' ? 'hsl(var(--primary))' : event.color || 'hsl(var(--secondary))'
                            }}></div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              }
            }}
          />
          </div>
        </Card>
      </div>
      <div>
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">
              {date ? format(date, "d 'de' MMMM 'de' yyyy", { locale: ptBR }) : 'Selecione uma data'}
            </CardTitle>
            <div className="flex items-center flex-wrap gap-x-4 gap-y-2 pt-2">
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
              <div className="flex items-center space-x-2">
                <Checkbox id="userEvent-filter" checked={activeCategories.userEvent} onCheckedChange={(checked) => handleCategoryChange('userEvent', checked)} />
                <label htmlFor="userEvent-filter" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Eventos
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
                      ) : event.type === 'cultural' ? (
                        <>
                           <div className="flex justify-between items-start">
                             <p className="font-semibold">{event.title}</p>
                             <Badge className="bg-accent text-accent-foreground">Cultural</Badge>
                           </div>
                           <p className="text-sm text-muted-foreground mt-1">{event.description}</p>
                        </>
                      ) : (
                        <>
                          <div className="flex justify-between items-start">
                             <p className="font-semibold">{event.title}</p>
                             <Badge style={{ backgroundColor: event.color, color: 'white' }}>{event.category}</Badge>
                           </div>
                           {event.description && <p className="text-sm text-muted-foreground mt-1">{event.description}</p>}
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
