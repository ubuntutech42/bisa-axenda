
"use client";

import { useState, useMemo, useEffect, useCallback } from 'react';
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { culturalEvents } from '@/lib/data';
import type { Task, CulturalEvent, KanbanBoard, CalendarEvent as CalendarEventType, LunarPhase, LunarPhaseName } from '@/lib/types';
import { format, isSameDay, parseISO, getMonth, getYear } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { Loader } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import type { CheckedState } from '@radix-ui/react-checkbox';
import { getLunarDataForMonthAction } from '@/app/calendar/actions';
import { LunarMonthSummary } from './LunarMonthSummary';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { buttonVariants } from '@/components/ui/button';
import { LunarIcon } from './LunarIcon';

type CombinedEvent = (Task & { type: 'task' }) | (CulturalEvent & { id: string; }) | (CalendarEventType & { type: 'userEvent' }) | (LunarPhase & {type: 'lunar'});

export function EventCalendar() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const [activeCategories, setActiveCategories] = useState({
    task: true,
    cultural: true,
    comercial: true,
    userEvent: true,
    lunar: true,
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
  const [lunarData, setLunarData] = useState<Record<string, LunarPhase>>({});
  const [isLunarDataLoading, setIsLunarDataLoading] = useState(true);

  const userEventsQuery = useMemoFirebase(() =>
    user ? query(collection(firestore, 'users', user.uid, 'calendarEvents')) : null,
    [firestore, user]
  );
  const { data: userEvents, isLoading: areUserEventsLoading } = useCollection<CalendarEventType>(userEventsQuery);

  const fetchLunarDataForMonth = useCallback(async (monthDate: Date) => {
    setIsLunarDataLoading(true);
    const month = getMonth(monthDate) + 1; // 1-based month
    const year = getYear(monthDate);

    const monthKey = format(monthDate, 'yyyy-MM');
    // Check if data for this month is already fetched
    if (Object.keys(lunarData).some(key => key.startsWith(monthKey))) {
        setIsLunarDataLoading(false);
        return;
    }
    
    const result = await getLunarDataForMonthAction(month, year);
    
    if (result.success && result.data) {
      const newLunarData: Record<string, LunarPhase> = {};
      for (const day in result.data.phase) {
        const phaseInfo = result.data.phase[day];
        const dateStr = format(new Date(year, month - 1, parseInt(day)), 'yyyy-MM-dd');
        newLunarData[dateStr] = {
          id: `lunar-${dateStr}`,
          date: dateStr,
          phaseName: phaseInfo.phaseName as LunarPhaseName,
          description: phaseInfo.svgDescription,
          svg: phaseInfo.svg,
        };
      }
      setLunarData(prevData => ({ ...prevData, ...newLunarData }));
    } else {
      console.error("Failed to fetch lunar data:", result.error);
    }
    setIsLunarDataLoading(false);
  }, [lunarData]);

  useEffect(() => {
    fetchLunarDataForMonth(currentMonth);
  }, [currentMonth, fetchLunarDataForMonth]);


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
        getDocs(collection(firestore, 'kanbanBoards', board.id, 'tasks'))
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
        eventList.push(...culturalEvents.filter(e => e.type === 'cultural').map(e => ({...e, id: e.title})));
    }
    if (activeCategories.comercial) {
        eventList.push(...culturalEvents.filter(e => e.type === 'comercial').map(e => ({...e, id: e.title})));
    }
    if (activeCategories.userEvent && userEvents) {
      eventList.push(...userEvents.map(e => ({...e, type: 'userEvent' as const })));
    }
    if (activeCategories.lunar && lunarData) {
        const lunarEvents: CombinedEvent[] = Object.values(lunarData).map(phase => ({ ...phase, type: 'lunar' as const }));
        eventList.push(...lunarEvents);
    }
    return eventList;
  }, [allTasks, userEvents, activeCategories, lunarData]);

  const selectedDayEvents = date ? allEvents.filter(event => {
    const eventDate = 'deadline' in event && event.deadline ? event.deadline : ('date' in event ? event.date : undefined);
    if (!eventDate) return false;
    return isSameDay(parseISO(eventDate), date);
  }) : [];

  const handleCategoryChange = (category: keyof typeof activeCategories, checked: CheckedState) => {
    setActiveCategories(prev => ({
      ...prev,
      [category]: !!checked,
    }));
  };

  const getEventDate = (event: CombinedEvent): string | undefined => {
    if (event.type === 'task') return event.deadline;
    return event.date;
  }
  
  const getEventColor = (event: CombinedEvent): string => {
    switch (event.type) {
        case 'cultural': return 'hsl(var(--accent))';
        case 'comercial': return 'hsl(var(--chart-3))';
        case 'task': return 'hsl(var(--primary))';
        case 'userEvent': return event.color || 'hsl(var(--secondary))';
        default: return 'transparent';
    }
  }


  if (areBoardsLoading || areTasksLoading || areUserEventsLoading) {
    return <div className="flex items-center justify-center h-full"><Loader className="h-10 w-10 animate-spin text-primary" /></div>
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 lg:items-start lg:gap-8">
      <div className="lg:col-span-2 mb-8 lg:mb-0">
        <Card>
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            month={currentMonth}
            onMonthChange={setCurrentMonth}
            className="p-0"
            style={{ maxWidth: 'none' }}
            locale={ptBR}
            classNames={{
                months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
                month: "space-y-4 w-full",
                caption: "flex justify-center pt-1 relative items-center",
                caption_label: "text-sm font-medium",
                nav: "space-x-1 flex items-center",
                nav_button: cn(
                  buttonVariants({ variant: "outline" }),
                  "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100"
                ),
                nav_button_previous: "absolute left-1",
                nav_button_next: "absolute right-1",
                table: "w-full border-collapse space-y-1",
                head_row: "flex justify-between",
                head_cell: "text-muted-foreground rounded-md w-full font-normal text-sm",
                row: "flex w-full mt-2 justify-between",
                cell: "h-12 w-full text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
                day: cn(
                  buttonVariants({ variant: "ghost" }),
                  "h-12 w-full p-0 font-normal aria-selected:opacity-100"
                ),
                day_range_end: "day-range-end",
                day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
                day_today: "bg-accent text-accent-foreground",
                day_outside: "text-muted-foreground opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30",
                day_disabled: "text-muted-foreground opacity-50",
                day_range_middle: "aria-selected:bg-accent aria-selected:text-accent-foreground",
                day_hidden: "invisible",
              }}
            components={{
              DayContent: ({ date }) => {
                const dayEvents = allEvents.filter(event => {
                    const eventDate = getEventDate(event);
                    if (!eventDate) return false;
                    return isSameDay(parseISO(eventDate), date);
                });
                const dayLunarData = activeCategories.lunar ? lunarData[format(date, 'yyyy-MM-dd')] : null;

                return (
                  <div className="relative flex flex-col items-center justify-center h-full w-full">
                    {dayLunarData && (
                      <div 
                        className="absolute top-1 right-1 w-4 h-4 text-foreground"
                        dangerouslySetInnerHTML={{ __html: dayLunarData.svg }}
                      />
                    )}
                    <span className="relative">{format(date, 'd')}</span>
                    {dayEvents.length > 0 && (
                      <div className="absolute bottom-1 flex justify-center gap-1">
                        {dayEvents.filter(e => e.type !== 'lunar').slice(0,3).map(event => (
                            <div key={`${event.type}-${event.id}`} className="w-1.5 h-1.5 rounded-full" style={{
                              backgroundColor: getEventColor(event)
                            }}></div>
                        ))}
                      </div>
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
          <CardHeader className='pb-4'>
            <CardTitle className="font-headline text-lg">
                Fases da Lua em {format(currentMonth, "MMMM", { locale: ptBR })}
            </CardTitle>
            <LunarMonthSummary lunarData={lunarData} isLoading={isLunarDataLoading} />
          </CardHeader>
          <Separator />
          <CardContent className='pt-4'>
            <p className="font-semibold text-foreground mb-2">
                {date ? format(date, "d 'de' MMMM", { locale: ptBR }) : 'Selecione uma data'}
            </p>
             <div className="flex items-center flex-wrap gap-x-4 gap-y-2 mb-4">
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
                <Checkbox id="comercial-filter" checked={activeCategories.comercial} onCheckedChange={(checked) => handleCategoryChange('comercial', checked)} />
                <label htmlFor="comercial-filter" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Comercial
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="userEvent-filter" checked={activeCategories.userEvent} onCheckedChange={(checked) => handleCategoryChange('userEvent', checked)} />
                <label htmlFor="userEvent-filter" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Eventos
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="lunar-filter" checked={activeCategories.lunar} onCheckedChange={(checked) => handleCategoryChange('lunar', checked)} />
                <label htmlFor="lunar-filter" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Lua
                </label>
              </div>
            </div>
            <ScrollArea className="h-64">
              <div className="space-y-4">
                {selectedDayEvents.length > 0 ? (
                  selectedDayEvents.map((event) => (
                    <div key={`${event.type}-${event.id}`} className="p-3 rounded-lg bg-muted/50 text-sm">
                      {event.type === 'task' ? (
                        <>
                          <div className="flex justify-between items-start">
                             <p className="font-semibold">{event.title}</p>
                             <Badge variant="secondary">Tarefa</Badge>
                          </div>
                          <p className="text-muted-foreground">{event.category}</p>
                        </>
                      ) : event.type === 'cultural' ? (
                        <>
                           <div className="flex justify-between items-start">
                             <p className="font-semibold">{event.title}</p>
                             <Badge style={{ backgroundColor: getEventColor(event) }} className="text-accent-foreground">Cultural</Badge>
                           </div>
                           <p className="text-muted-foreground mt-1">{event.description}</p>
                        </>
                      ) : event.type === 'comercial' ? (
                        <>
                           <div className="flex justify-between items-start">
                             <p className="font-semibold">{event.title}</p>
                             <Badge style={{ backgroundColor: getEventColor(event), color: 'white' }}>Comercial</Badge>
                           </div>
                           <p className="text-muted-foreground mt-1">{event.description}</p>
                        </>
                      ) : event.type === 'userEvent' ? (
                        <>
                          <div className="flex justify-between items-start">
                             <p className="font-semibold">{event.title}</p>
                             <Badge style={{ backgroundColor: event.color, color: 'white' }}>{event.category}</Badge>
                           </div>
                           {event.description && <p className="text-muted-foreground mt-1">{event.description}</p>}
                        </>
                      ) : event.type === 'lunar' ? (
                        <>
                          <div className="flex justify-between items-start">
                             <div className='flex items-center gap-2'>
                                <div className="w-5 h-5">
                                    <LunarIcon phaseName={event.phaseName} className="w-full h-full" />
                                </div>
                                <p className="font-semibold">{event.phaseName}</p>
                             </div>
                             <Badge variant="outline">Lua</Badge>
                           </div>
                           <p className="text-muted-foreground mt-1">{event.description}</p>
                        </>
                      ) : null }
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
