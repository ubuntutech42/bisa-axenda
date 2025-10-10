
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/firebase';
import { Header } from '@/components/layout/Header';
import { EventCalendar } from '@/components/calendar/EventCalendar';
import { Button } from '@/components/ui/button';
import { CreateEventDialog } from '@/components/calendar/CreateEventDialog';
import { Loader, Plus } from 'lucide-react';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import type { CalendarEvent as CalendarEventType } from '@/lib/types';

export default function CalendarPage() {
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isCreateEventDialogOpen, setIsCreateEventDialogOpen] = useState(false);

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [isUserLoading, user, router]);

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

  if (isUserLoading || !user) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <Header title="Calendário Ancestral">
        <Button onClick={() => setIsCreateEventDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Criar Evento
        </Button>
      </Header>
      <div className="flex-1">
        <EventCalendar />
      </div>
      <CreateEventDialog
        isOpen={isCreateEventDialogOpen}
        onClose={() => setIsCreateEventDialogOpen(false)}
        onCreate={handleCreateEvent}
      />
    </div>
  );
}
