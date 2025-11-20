
"use client";

import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useFirestore } from '@/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Loader } from 'lucide-react';

const notificationSchema = z.object({
  title: z.string().min(1, "O título é obrigatório."),
  message: z.string().min(1, "A mensagem é obrigatória."),
  type: z.enum(['info', 'promo', 'warning']),
});

type NotificationFormData = z.infer<typeof notificationSchema>;

export function NotificationSender() {
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, control, reset, formState: { errors } } = useForm<NotificationFormData>({
    resolver: zodResolver(notificationSchema),
    defaultValues: {
      type: 'info',
    },
  });

  const onSubmit = async (data: NotificationFormData) => {
    setIsSubmitting(true);
    try {
      const notificationsCollection = collection(firestore, 'notifications');
      await addDoc(notificationsCollection, {
        ...data,
        createdAt: serverTimestamp(),
      });
      toast({
        title: 'Notificação Enviada!',
        description: 'A notificação foi enviada para todos os usuários.',
      });
      reset();
    } catch (error) {
      console.error("Error sending notification:", error);
      toast({
        variant: 'destructive',
        title: 'Erro ao Enviar',
        description: 'Não foi possível enviar a notificação. Tente novamente.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="border-none shadow-none">
      <CardHeader>
        <CardTitle>Enviar Notificação Global</CardTitle>
        <CardDescription>
          Envie uma mensagem que aparecerá para todos os usuários no painel de notificações.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Título</Label>
            <Input id="title" {...register('title')} />
            {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="message">Mensagem</Label>
            <Textarea id="message" {...register('message')} />
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
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader className="mr-2 h-4 w-4 animate-spin" />}
            Enviar Notificação
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
