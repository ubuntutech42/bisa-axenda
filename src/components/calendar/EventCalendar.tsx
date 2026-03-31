
'use client';

import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Task, CulturalEvent, KanbanBoard, CalendarEvent as CalendarEventType, LunarPhase, LunarPhaseName } from '@/lib/types';
import { format, isSameDay, parseISO, getMonth, getYear, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';
import { getMasterCalendarEventsForYear } from '@/lib/master-calendar-axenda';
import { ptBR } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { Loader, CalendarDays } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import type { CheckedState } from '@radix-ui/react-checkbox';
import { getLunarDataForMonthAction } from '@/app/calendar/actions';
import { LunarMonthSummary } from './LunarMonthSummary';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { useCategories } from '@/hooks/useCategories';
import { CreateEventDialog } from './CreateEventDialog';
import { addDoc, serverTimestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { buttonVariants } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useUserIsAdmin } from '@/hooks/useUserIsAdmin';

type CombinedEvent = (Task & { type: 'task' }) | (CulturalEvent & { type: 'cultural' | 'comercial' }) | (CalendarEventType & { type: 'userEvent' }) | (LunarPhase & { type: 'lunar' });

const processSvg = (svgString: string) => {
    if (!svgString) return '';
    // Remove width and height attributes to allow Tailwind to control the size
    return svgString.replace(/width="[^"]*"/g, '').replace(/height="[^"]*"/g, '');
};

export function EventCalendar() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const [isCreateEventDialogOpen, setIsCreateEventDialogOpen] = useState(false);
  const [initialEventDate, setInitialEventDate] = useState<Date | undefined>();

  const [activeCategories, setActiveCategories] = useState({
    task: true,
    cultural: true,
    comercial: true,
    userEvent: true,
    lunar: true,
  });
  
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const { isAdmin } = useUserIsAdmin();

  const { allCategories, categoriesMap, isLoading: areCategoriesLoading } = useCategories();
  
  const culturalEventsQuery = useMemoFirebase(() => query(collection(firestore, 'culturalEvents')), [firestore]);
  const { data: culturalEvents, isLoading: areCulturalEventsLoading } = useCollection<CulturalEvent>(culturalEventsQuery);


  const [allTasks, setAllTasks] = useState<Task[]>([]);
  const [areTasksLoading, setAreTasksLoading] = useState(true);

  const boardsQuery = useMemoFirebase(() =>
    user ? query(collection(firestore, 'kanbanBoards'), where('members', 'array-contains', user.uid)) : null,
    [firestore, user]
  );
  const { data: boards, isLoading: areBoardsLoading } = useCollection<KanbanBoard>(boardsQuery);

  useEffect(() => {
    if (!user || !firestore || areBoardsLoading || !boards) {
        if (!areBoardsLoading) setAreTasksLoading(false);
        return;
    }

    const fetchTasksWithDeadline = async () => {
        setAreTasksLoading(true);
        if (boards.length === 0) {
            setAllTasks([]);
            setAreTasksLoading(false);
            return;
        }

        try {
            const tasksPromises = boards.map(board => 
                getDocs(query(collection(firestore, 'kanbanBoards', board.id, 'tasks'), where('deadline', '!=', null)))
            );
    
            const taskSnapshots = await Promise.all(tasksPromises);
            
            const fetchedTasks: Task[] = [];
            taskSnapshots.forEach(snapshot => {
                snapshot.forEach(doc => {
                    fetchedTasks.push({ id: doc.id, ...doc.data() } as Task);
                });
            });
            
            setAllTasks(fetchedTasks);
        } catch (error) {
            console.error("Failed to fetch tasks with deadline:", error);
            setAllTasks([]);
        } finally {
            setAreTasksLoading(false);
        }
    };

    fetchTasksWithDeadline();
  }, [user, firestore, boards, areBoardsLoading]);


  const [lunarData, setLunarData] = useState<Record<string, LunarPhase>>({});
  const [isLunarDataLoading, setIsLunarDataLoading] = useState(true);
  const fetchedLunarMonthsRef = useRef<Set<string>>(new Set());

  const userEventsQuery = useMemoFirebase(() =>
    user ? query(collection(firestore, 'users', user.uid, 'calendarEvents')) : null,
    [firestore, user]
  );
  const { data: userEvents, isLoading: areUserEventsLoading } = useCollection<CalendarEventType>(userEventsQuery);
  
  const fetchLunarDataForMonth = useCallback(async (monthDate: Date) => {
    const monthKey = format(monthDate, 'yyyy-MM');
    if (fetchedLunarMonthsRef.current.has(monthKey)) {
      setIsLunarDataLoading(false);
      return;
    }
    fetchedLunarMonthsRef.current.add(monthKey);
    setIsLunarDataLoading(true);
    const month = getMonth(monthDate) + 1;
    const year = getYear(monthDate);
    try {
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
          setLunarData(prev => ({ ...prev, ...newLunarData }));
        } else {
          console.error("Failed to fetch lunar data:", result.error);
        }
    } catch (error) {
        console.error("Error in fetchLunarDataForMonth action:", error);
    } finally {
        setIsLunarDataLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLunarDataForMonth(currentMonth);
  }, [currentMonth, fetchLunarDataForMonth]);

  const allEvents: CombinedEvent[] = useMemo(() => {
    const eventList: CombinedEvent[] = [];
    if (activeCategories.task) {
        eventList.push(...allTasks.map(t => ({...t, type: 'task' as const })));
    }
    if (activeCategories.cultural) {
        const masterCultural = getMasterCalendarEventsForYear(getYear(currentMonth), { includeEditorialContent: isAdmin });
        eventList.push(...masterCultural.map(e => ({ ...e, type: 'cultural' as const })));
        if (culturalEvents) {
          eventList.push(...culturalEvents.filter(e => e.type === 'cultural').map(e => ({ ...e })));
        }
    }
    if (activeCategories.comercial && culturalEvents) {
        eventList.push(...culturalEvents.filter(e => e.type === 'comercial').map(e => ({...e})));
    }
    if (activeCategories.userEvent && userEvents) {
      eventList.push(...userEvents.map(e => ({...e, type: 'userEvent' as const })));
    }
    if (activeCategories.lunar && lunarData) {
        const lunarEvents: CombinedEvent[] = Object.values(lunarData).map(phase => ({ ...phase, type: 'lunar' as const }));
        eventList.push(...lunarEvents);
    }
    return eventList;
  }, [allTasks, userEvents, culturalEvents, activeCategories, lunarData, currentMonth, isAdmin]);

  const getEventDate = useCallback((event: CombinedEvent): string | undefined => {
    if (event.type === 'task') return event.deadline;
    return event.date;
  }, []);

  const eventsByDayKey = useMemo(() => {
    const map = new Map<string, CombinedEvent[]>();
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    const days = eachDayOfInterval({ start, end });
    for (const d of days) {
      const key = format(d, 'yyyy-MM-dd');
      const dayEvents = allEvents.filter(event => {
        const eventDate = getEventDate(event);
        if (!eventDate) return false;
        return isSameDay(parseISO(eventDate), d);
      });
      if (dayEvents.length) map.set(key, dayEvents);
    }
    return map;
  }, [allEvents, currentMonth, getEventDate]);

  const selectedDayEvents = useMemo(() => {
    if (!date) return [];
    const key = format(date, 'yyyy-MM-dd');
    return eventsByDayKey.get(key) ?? [];
  }, [date, eventsByDayKey]);

  const handleCategoryChange = (category: keyof typeof activeCategories, checked: CheckedState) => {
    setActiveCategories(prev => ({
      ...prev,
      [category]: !!checked,
    }));
  };

  const getEventColor = (event: CombinedEvent): string => {
    switch (event.type) {
        case 'cultural': return 'hsl(var(--accent))';
        case 'comercial': return 'hsl(var(--chart-3))';
        case 'task': 
            const category = categoriesMap.get(event.category)
            return category?.color || 'hsl(var(--secondary))';
        case 'userEvent': return categoriesMap.get(event.categoryId)?.color || 'hsl(var(--secondary))';
        default: return 'transparent';
    }
  }
  
  const handleCreateEvent = async (eventData: Omit<CalendarEventType, 'id' | 'userId' | 'createdAt'>) => {
    if (!user || !firestore) return;
    try {
      const eventsCollection = collection(firestore, 'users', user.uid, 'calendarEvents');
      await addDoc(eventsCollection, {
        ...eventData,
        userId: user.uid,
        createdAt: serverTimestamp(),
      });
      toast({
        title: 'Evento criado!',
        description: `O evento "${eventData.title}" foi adicionado ao seu calendário.`,
      });
      setIsCreateEventDialogOpen(false);
    } catch (error) {
      console.error('Error creating event:', error);
      toast({
        variant: 'destructive',
        title: 'Erro ao criar evento',
        description: 'Não foi possível salvar o novo evento. Tente novamente.',
      });
    }
  };

  const handleDayDoubleClick = (day: Date) => {
    setDate(day);
    setInitialEventDate(day);
    setIsCreateEventDialogOpen(true);
  };

  const [selectedEventForDetail, setSelectedEventForDetail] = useState<CombinedEvent | null>(null);


  if (areTasksLoading || areUserEventsLoading || areCategoriesLoading || areCulturalEventsLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 lg:gap-8">
        <div className="lg:col-span-2 flex items-center justify-center min-h-[24rem]">
          <Loader className="h-10 w-10 animate-spin text-primary" />
        </div>
        <div className="animate-pulse space-y-4">
          <div className="h-32 rounded-lg bg-muted" />
          <div className="h-64 rounded-lg bg-muted" />
        </div>
      </div>
    );
  }

  return (
    <>
    <div className="grid grid-cols-1 lg:grid-cols-3 lg:items-start lg:gap-8">
      <div className="lg:col-span-2 mb-8 lg:mb-0">
        <Card className="overflow-hidden">
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            month={currentMonth}
            onMonthChange={setCurrentMonth}
            className="p-0"
            classNames={{
              months: 'flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0',
              month: 'space-y-4 w-full',
              caption: 'flex justify-center pt-1 relative items-center',
              caption_label: 'text-sm font-medium',
              nav: 'space-x-1 flex items-center',
              nav_button: cn(
                buttonVariants({ variant: 'outline' }),
                'h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100'
              ),
              nav_button_previous: 'absolute left-1',
              nav_button_next: 'absolute right-1',
              table: 'w-full border-collapse space-y-1',
              head_row: 'flex w-full',
              head_cell:
                'text-muted-foreground rounded-md w-full font-normal text-[0.8rem]',
              row: 'flex w-full mt-2',
              cell: 'h-auto text-center text-sm p-0 relative [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20 w-full',
              day: cn(
                buttonVariants({ variant: 'ghost' }),
                'h-12 w-full p-0 font-normal aria-selected:opacity-100'
              ),
              day_selected:
                'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground',
              day_today: 'bg-accent text-accent-foreground',
              day_outside: 'text-muted-foreground opacity-50',
              day_disabled: 'text-muted-foreground opacity-50',
              day_range_middle:
                'aria-selected:bg-accent aria-selected:text-accent-foreground',
              day_hidden: 'invisible',
            }}
            style={{ maxWidth: 'none' }}
            locale={ptBR}
            components={{
              DayContent: ({ date }) => {
                const key = format(date, 'yyyy-MM-dd');
                const dayEvents = eventsByDayKey.get(key) ?? [];
                const dayLunarData = activeCategories.lunar ? lunarData[key] : null;
                const nonLunar = dayEvents.filter(e => e.type !== 'lunar').slice(0, 3);
                return (
                  <div
                    className="relative flex flex-col items-center justify-center h-full w-full min-h-[2.5rem] cursor-pointer"
                    onDoubleClick={(e) => { e.stopPropagation(); handleDayDoubleClick(date); }}
                  >
                    {dayLunarData && (
                      <div
                        className="absolute top-0.5 right-0.5 w-4 h-4 flex items-center justify-center overflow-hidden text-foreground [&>svg]:max-w-full [&>svg]:max-h-full"
                        dangerouslySetInnerHTML={{ __html: processSvg(dayLunarData.svg) }}
                      />
                    )}
                    <span className="relative block">{format(date, 'd')}</span>
                    {nonLunar.length > 0 && (
                      <div className="absolute bottom-0.5 left-1/2 -translate-x-1/2 flex justify-center gap-0.5">
                        {nonLunar.map(event => (
                          <div
                            key={`${event.type}-${event.id}`}
                            className="w-1.5 h-1.5 rounded-full shrink-0"
                            style={{ backgroundColor: getEventColor(event) }}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                );
              },
            }}
          />
        </Card>
      </div>
      <div className="space-y-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="font-headline text-lg">
              Fases da Lua em {format(currentMonth, 'MMMM', { locale: ptBR })}
            </CardTitle>
            <LunarMonthSummary lunarData={lunarData} isLoading={isLunarDataLoading} />
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="font-headline text-base">
              {date ? format(date, "d 'de' MMMM", { locale: ptBR }) : 'Selecione uma data'}
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">
              Um clique no dia mostra os eventos; dois cliques criam um novo. Clique em um evento para ver os detalhes.
            </p>
          </CardHeader>
          <Separator />
          <CardContent className="pt-4 space-y-4">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">Filtrar por</p>
              <div className="flex flex-wrap gap-x-4 gap-y-2.5">
                <label className="flex items-center gap-2 cursor-pointer">
                  <Checkbox checked={activeCategories.task} onCheckedChange={(c) => handleCategoryChange('task', c)} />
                  <span className="text-sm">Tarefas</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <Checkbox checked={activeCategories.cultural} onCheckedChange={(c) => handleCategoryChange('cultural', c)} />
                  <span className="text-sm">Cultural</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <Checkbox checked={activeCategories.comercial} onCheckedChange={(c) => handleCategoryChange('comercial', c)} />
                  <span className="text-sm">Comercial</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <Checkbox checked={activeCategories.userEvent} onCheckedChange={(c) => handleCategoryChange('userEvent', c)} />
                  <span className="text-sm">Eventos</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <Checkbox checked={activeCategories.lunar} onCheckedChange={(c) => handleCategoryChange('lunar', c)} />
                  <span className="text-sm">Lua</span>
                </label>
              </div>
            </div>
            <ScrollArea className="h-64 pr-2">
              <div className="space-y-3">
                {selectedDayEvents.length > 0 ? (
                  selectedDayEvents.map((event) => {
                    const category = event.type === 'userEvent' ? categoriesMap.get(event.categoryId) : undefined;
                    const eventColor = getEventColor(event);
                    return (
                      <div
                        key={`${event.type}-${event.id}`}
                        role="button"
                        tabIndex={0}
                        onClick={() => setSelectedEventForDetail(event)}
                        onKeyDown={(e) => e.key === 'Enter' && setSelectedEventForDetail(event)}
                        className="rounded-lg border bg-card text-sm overflow-hidden pl-3 border-l-4 cursor-pointer transition-colors hover:bg-muted/50 focus:outline-none focus:ring-2 focus:ring-ring"
                        style={{ borderLeftColor: event.type === 'lunar' ? 'hsl(var(--muted-foreground))' : eventColor }}
                      >
                        <div className="py-2.5 pr-3">
                          {event.type === 'task' ? (
                            <>
                              <div className="flex justify-between items-start gap-2">
                                <p className="font-medium leading-tight">{event.title}</p>
                                <Badge variant="secondary" className="shrink-0 text-xs">Tarefa</Badge>
                              </div>
                              <p className="text-muted-foreground text-xs mt-0.5">{event.category}</p>
                            </>
                          ) : event.type === 'cultural' ? (
                            <>
                              <div className="flex justify-between items-start gap-2">
                                <p className="font-medium leading-tight">{event.title}</p>
                                <Badge style={{ backgroundColor: eventColor }} className="text-accent-foreground shrink-0 text-xs">Cultural</Badge>
                              </div>
                              {event.description && <p className="text-muted-foreground text-xs mt-0.5 line-clamp-2">{event.description}</p>}
                            </>
                          ) : event.type === 'comercial' ? (
                            <>
                              <div className="flex justify-between items-start gap-2">
                                <p className="font-medium leading-tight">{event.title}</p>
                                <Badge style={{ backgroundColor: eventColor, color: 'white' }} className="shrink-0 text-xs">Comercial</Badge>
                              </div>
                              {event.description && <p className="text-muted-foreground text-xs mt-0.5 line-clamp-2">{event.description}</p>}
                            </>
                          ) : event.type === 'userEvent' && category ? (
                            <>
                              <div className="flex justify-between items-start gap-2">
                                <p className="font-medium leading-tight">{event.title}</p>
                                <Badge style={{ backgroundColor: category.color, color: 'white' }} className="shrink-0 text-xs">{category.name}</Badge>
                              </div>
                              {event.description && <p className="text-muted-foreground text-xs mt-0.5 line-clamp-2">{event.description}</p>}
                            </>
                          ) : event.type === 'lunar' ? (
                            <>
                              <div className="flex justify-between items-start gap-2">
                                <div className="flex items-center gap-2 min-w-0">
                                  <div className="w-4 h-4 shrink-0 text-foreground [&>svg]:w-full [&>svg]:h-full" dangerouslySetInnerHTML={{ __html: processSvg(event.svg) }} />
                                  <p className="font-medium leading-tight truncate">{event.phaseName}</p>
                                </div>
                                <Badge variant="outline" className="shrink-0 text-xs">Lua</Badge>
                              </div>
                              {event.description && <p className="text-muted-foreground text-xs mt-0.5 line-clamp-2">{event.description}</p>}
                            </>
                          ) : null}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="flex flex-col items-center justify-center py-10 text-center">
                    <CalendarDays className="h-10 w-10 text-muted-foreground/50 mb-3" />
                    <p className="text-sm text-muted-foreground">Nenhum evento para este dia.</p>
                    <p className="text-xs text-muted-foreground/80 mt-1">Clique em um dia no calendário para adicionar.</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
    <CreateEventDialog
        isOpen={isCreateEventDialogOpen}
        onClose={() => setIsCreateEventDialogOpen(false)}
        onCreate={handleCreateEvent}
        initialDate={initialEventDate}
      />
    <Dialog open={!!selectedEventForDetail} onOpenChange={(open) => !open && setSelectedEventForDetail(null)}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        {selectedEventForDetail && (
          <>
            <DialogHeader>
              <DialogTitle className="pr-8">
                {selectedEventForDetail.type === 'task' && selectedEventForDetail.title}
                {selectedEventForDetail.type === 'cultural' && selectedEventForDetail.title}
                {selectedEventForDetail.type === 'comercial' && selectedEventForDetail.title}
                {selectedEventForDetail.type === 'userEvent' && selectedEventForDetail.title}
                {selectedEventForDetail.type === 'lunar' && selectedEventForDetail.phaseName}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                {date && (
                  <span className="text-sm text-muted-foreground">
                    {format(date, "d 'de' MMMM yyyy", { locale: ptBR })}
                  </span>
                )}
                {selectedEventForDetail.type === 'task' && (
                  <Badge variant="secondary">Tarefa</Badge>
                )}
                {selectedEventForDetail.type === 'cultural' && (
                  <Badge style={{ backgroundColor: getEventColor(selectedEventForDetail) }} className="text-accent-foreground">Cultural</Badge>
                )}
                {selectedEventForDetail.type === 'comercial' && (
                  <Badge style={{ backgroundColor: getEventColor(selectedEventForDetail), color: 'white' }}>Comercial</Badge>
                )}
                {selectedEventForDetail.type === 'userEvent' && (() => {
                  const cat = categoriesMap.get(selectedEventForDetail.categoryId);
                  return cat ? <Badge style={{ backgroundColor: cat.color, color: 'white' }}>{cat.name}</Badge> : null;
                })()}
                {selectedEventForDetail.type === 'lunar' && <Badge variant="outline">Lua</Badge>}
              </div>
              {selectedEventForDetail.type === 'task' && selectedEventForDetail.category && (
                <p className="text-sm text-muted-foreground">{selectedEventForDetail.category}</p>
              )}
              {(selectedEventForDetail.type === 'cultural' || selectedEventForDetail.type === 'comercial' || selectedEventForDetail.type === 'userEvent') && selectedEventForDetail.description && (
                <p className="text-sm whitespace-pre-wrap">{selectedEventForDetail.description}</p>
              )}
              {selectedEventForDetail.type === 'lunar' && selectedEventForDetail.description && (
                <p className="text-sm whitespace-pre-wrap">{selectedEventForDetail.description}</p>
              )}
              {selectedEventForDetail.type === 'lunar' && (
                <div className="w-10 h-10 text-foreground [&>svg]:max-w-full [&>svg]:max-h-full" dangerouslySetInnerHTML={{ __html: processSvg(selectedEventForDetail.svg) }} />
              )}
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
    </>
  );
}
