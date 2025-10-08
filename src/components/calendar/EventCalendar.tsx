"use client";

import { useState } from 'react';
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { tasks as allTasks, culturalEvents } from '@/lib/data';
import type { Task, CulturalEvent } from '@/lib/types';
import { format, isSameDay, parseISO } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

type CalendarEvent = (Task & { type: 'task' }) | (CulturalEvent & { type: 'cultural' });

export function EventCalendar() {
  const [date, setDate] = useState<Date | undefined>(new Date());

  const tasksWithDeadlines = Object.values(allTasks).filter(t => t.deadline);
  
  const allEvents: CalendarEvent[] = [
    ...tasksWithDeadlines.map(t => ({...t, type: 'task' as const })),
    ...culturalEvents.map(e => ({...e, type: 'cultural' as const, id: e.title}))
  ];

  const selectedDayEvents = date ? allEvents.filter(event => {
    const eventDate = 'deadline' in event ? event.deadline : event.date;
    return isSameDay(parseISO(eventDate!), date);
  }) : [];

  return (
    <div className="lg:grid lg:grid-cols-3 lg:gap-8">
      <div className="lg:col-span-2">
        <Card>
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            className="p-0"
            classNames={{
              day: "h-12 w-12 text-base",
              head_cell: "text-muted-foreground rounded-md w-12 font-normal text-sm",
            }}
            components={{
              DayContent: ({ date }) => {
                const dayEvents = allEvents.filter(event => {
                    const eventDate = 'deadline' in event ? event.deadline : event.date;
                    return isSameDay(parseISO(eventDate!), date);
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
      <div className="mt-8 lg:mt-0">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">
              {date ? format(date, 'MMMM d, yyyy') : 'Select a date'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-96">
              <div className="space-y-4">
                {selectedDayEvents.length > 0 ? (
                  selectedDayEvents.map((event) => (
                    <div key={event.id} className="p-3 rounded-lg bg-muted/50">
                      {event.type === 'task' ? (
                        <>
                          <div className="flex justify-between items-start">
                             <p className="font-semibold">{event.title}</p>
                             <Badge variant="secondary">Task</Badge>
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
                  <p className="text-center text-muted-foreground py-10">No events for this day.</p>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
