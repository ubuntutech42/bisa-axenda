"use client";

import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useFirestore } from '@/firebase';
import { collection, addDoc, serverTimestamp, query, where, orderBy, getDocs, deleteDoc, doc, Timestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Loader, CalendarClock, Send, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useMemoFirebase } from '@/firebase';
import { useCollection } from '@/firebase';
import type { Notification } from '@/lib/types';
import { ScrollArea } from '@/components/ui/scroll-area';

const notificationSchema = z.object({
  title: z.string().min(1, 'O título é obrigatório.'),
  message: z.string().min(1, 'A mensagem é obrigatória.'),
  type: z.enum(['info', 'promo', 'warning']),
  scheduleMode: z.enum(['now', 'scheduled']),
  scheduledAt: z.string().optional(),
});

type NotificationFormData = z.infer<typeof notificationSchema>;

export function NotificationSender() {
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const scheduledQuery = useMemoFirebase(
    () =>
      firestore
        ? query(
            collection(firestore, 'notifications'),
            where('visibleAt', '>', Timestamp.now()),
            orderBy('visibleAt', 'asc')
          )
        : null,
    [firestore]
  );

  const { data: scheduledRaw } = useCollection<Notification>(scheduledQuery);
  const scheduledNotifications = scheduledRaw ?? [];

  const { register, handleSubmit, control, reset, watch, formState: { errors } } = useForm<NotificationFormData>({
    resolver: zodResolver(notificationSchema),
    defaultValues: {
      type: 'info',
      scheduleMode: 'now',
    },
  });

  const scheduleMode = watch('scheduleMode');

  const onSubmit = async (data: NotificationFormData) => {
    if (data.scheduleMode === 'scheduled') {
      if (!data.scheduledAt?.trim()) {
        toast({
          variant: 'destructive',
          title: 'Data e hora obrigatórias',
          description: 'Informe quando a notificação deve ser exibida.',
        });
        return;
      }
      const scheduledDate = new Date(data.scheduledAt);
      if (scheduledDate <= new Date()) {
        toast({
          variant: 'destructive',
          title: 'Data inválida',
          description: 'Escolha uma data e hora futuras para programar.',
        });
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const notificationsCollection = collection(firestore, 'notifications');
      const now = new Date();

      if (data.scheduleMode === 'now') {
        await addDoc(notificationsCollection, {
          title: data.title,
          message: data.message,
          type: data.type,
          createdAt: serverTimestamp(),
          visibleAt: serverTimestamp(),
        });
        toast({
          title: 'Notificação enviada',
          description: 'A notificação já está visível para todos os usuários.',
        });
      } else if (data.scheduledAt) {
        const scheduledDate = new Date(data.scheduledAt);
        await addDoc(notificationsCollection, {
          title: data.title,
          message: data.message,
          type: data.type,
          createdAt: serverTimestamp(),
          visibleAt: Timestamp.fromDate(scheduledDate),
        });
        toast({
          title: 'Notificação programada',
          description: `Será exibida em ${format(scheduledDate, "d 'de' MMMM 'às' HH:mm", { locale: ptBR })}.`,
        });
      }
      reset({ scheduleMode: 'now', type: 'info' });
    } catch (error) {
      console.error('Error sending notification:', error);
      toast({
        variant: 'destructive',
        title: 'Erro ao enviar',
        description: 'Não foi possível enviar ou programar a notificação. Tente novamente.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelScheduled = async (id: string) => {
    try {
      await deleteDoc(doc(firestore, 'notifications', id));
      toast({ title: 'Notificação programada removida.' });
    } catch (error) {
      console.error('Error deleting scheduled notification:', error);
      toast({ variant: 'destructive', title: 'Erro ao remover.' });
    }
  };

  return (
    <div className="space-y-6">
      <Card className="border-none shadow-none">
        <CardHeader>
          <CardTitle>Enviar ou programar notificação</CardTitle>
          <CardDescription>
            Envie agora para todos os usuários ou programe para uma data e hora. As notificações aparecem no ícone de sino do menu.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Título</Label>
              <Input id="title" placeholder="Ex: Novidade no Axénda" {...register('title')} />
              {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="message">Mensagem</Label>
              <Textarea id="message" placeholder="Texto da notificação..." rows={3} {...register('message')} />
              {errors.message && <p className="text-sm text-destructive">{errors.message.message}</p>}
            </div>
            <Controller
              name="type"
              control={control}
              render={({ field }) => (
                <div className="space-y-2">
                  <Label>Tipo</Label>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="info">Informativo</SelectItem>
                      <SelectItem value="promo">Promocional</SelectItem>
                      <SelectItem value="warning">Aviso</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            />
            <Controller
              name="scheduleMode"
              control={control}
              render={({ field }) => (
                <div className="space-y-3">
                  <Label>Quando exibir</Label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="scheduleMode"
                        value="now"
                        checked={field.value === 'now'}
                        onChange={() => field.onChange('now')}
                        className="rounded-full border-input"
                      />
                      <Send className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Enviar agora</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="scheduleMode"
                        value="scheduled"
                        checked={field.value === 'scheduled'}
                        onChange={() => field.onChange('scheduled')}
                        className="rounded-full border-input"
                      />
                      <CalendarClock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Programar</span>
                    </label>
                  </div>
                  {scheduleMode === 'scheduled' && (
                    <div className="space-y-2">
                      <Label htmlFor="scheduledAt">Data e hora</Label>
                      <Input
                        id="scheduledAt"
                        type="datetime-local"
                        min={new Date().toISOString().slice(0, 16)}
                        {...register('scheduledAt', { required: scheduleMode === 'scheduled' })}
                        className="max-w-xs"
                      />
                      {scheduleMode === 'scheduled' && errors.scheduledAt && (
                        <p className="text-sm text-destructive">Informe a data e hora.</p>
                      )}
                    </div>
                  )}
                </div>
              )}
            />
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader className="mr-2 h-4 w-4 animate-spin" />}
              {scheduleMode === 'scheduled' ? 'Programar notificação' : 'Enviar agora'}
            </Button>
          </CardFooter>
        </form>
      </Card>

      {scheduledNotifications.length > 0 && (
        <Card className="border-none shadow-none">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarClock className="h-5 w-5" />
              Notificações programadas
            </CardTitle>
            <CardDescription>
              Estas notificações ainda não foram exibidas. Você pode cancelar antes da data programada.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-64 rounded-md border">
              <div className="p-3 space-y-2">
                {scheduledNotifications.map((n) => (
                  <div
                    key={n.id}
                    className="flex items-start justify-between gap-3 p-3 rounded-lg bg-muted/50 border"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="font-medium truncate">{n.title}</p>
                      <p className="text-sm text-muted-foreground line-clamp-2 mt-0.5">{n.message}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {n.visibleAt && format(n.visibleAt.toDate(), "d MMM yyyy, HH:mm", { locale: ptBR })}
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="shrink-0 text-destructive hover:text-destructive"
                      onClick={() => handleCancelScheduled(n.id)}
                      aria-label="Cancelar notificação programada"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
