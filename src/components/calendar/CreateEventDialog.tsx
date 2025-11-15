
"use client";

import { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
  SheetClose
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Loader } from 'lucide-react';
import { Calendar } from '../ui/calendar';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import type { CalendarEvent, CalendarEventCategory } from '@/lib/types';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { useCategories } from '@/hooks/useCategories';

const eventSchema = z.object({
  title: z.string().min(1, { message: "O título é obrigatório." }),
  description: z.string().optional(),
  date: z.date({ required_error: "A data é obrigatória." }),
  categoryId: z.string().min(1, { message: "A categoria é obrigatória." }),
});

type EventFormData = z.infer<typeof eventSchema>;

interface CreateEventDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (data: Omit<CalendarEvent, 'id' | 'userId' | 'createdAt'>) => void;
  initialDate?: Date;
}

export function CreateEventDialog({ isOpen, onClose, onCreate, initialDate }: CreateEventDialogProps) {
  const { allCategories, isLoading: areCategoriesLoading } = useCategories();
  
  const { register, handleSubmit, control, reset, formState: { errors } } = useForm<EventFormData>({
    resolver: zodResolver(eventSchema),
  });

  useEffect(() => {
    if (!isOpen) {
      reset();
    } else {
        reset({
            date: initialDate || new Date(),
            title: '',
            description: '',
            categoryId: ''
        })
    }
  }, [isOpen, reset, initialDate]);

  const onSubmit = async (data: EventFormData) => {
    onCreate({
      ...data,
      date: format(data.date, 'yyyy-MM-dd'),
    });
    onClose();
  };
  
  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto">
        <form onSubmit={handleSubmit(onSubmit)}>
          <SheetHeader>
            <SheetTitle>Criar Novo Evento</SheetTitle>
            <SheetDescription>
              Adicione um novo evento personalizado ao seu calendário.
            </SheetDescription>
          </SheetHeader>
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Título do Evento</Label>
              <Input id="title" {...register('title')} />
              {errors.title && <p className="text-sm text-destructive mt-1">{errors.title.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea id="description" {...register('description')} />
            </div>
             <Controller
              name="date"
              control={control}
              render={({ field }) => (
                <div className="space-y-2">
                  <Label>Data do Evento</Label>
                   <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {field.value ? format(field.value, "PPP", { locale: ptBR }) : <span>Escolha uma data</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          initialFocus
                          locale={ptBR}
                        />
                      </PopoverContent>
                    </Popover>
                    {errors.date && <p className="text-sm text-destructive mt-1">{errors.date.message}</p>}
                </div>
              )}
            />
            <Controller
                name="categoryId"
                control={control}
                render={({ field }) => (
                  <div className="space-y-2">
                    <Label>Categoria</Label>
                     {areCategoriesLoading ? <Loader className="animate-spin" /> : (
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione uma categoria..." />
                        </SelectTrigger>
                        <SelectContent>
                          {allCategories.map(c => (
                            <SelectItem key={c.id} value={c.id}>
                              <span className="flex items-center gap-2">
                                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: c.color }} />
                                {c.name}
                              </span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                     )}
                    {errors.categoryId && <p className="text-sm text-destructive mt-1">{errors.categoryId.message}</p>}
                  </div>
                )}
            />
          </div>
          <SheetFooter>
            <SheetClose asChild>
                <Button type="button" variant="outline">
                Cancelar
                </Button>
            </SheetClose>
            <Button type="submit">Criar Evento</Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
