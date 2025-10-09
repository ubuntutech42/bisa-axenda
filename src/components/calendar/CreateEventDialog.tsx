
"use client";

import { useEffect } from 'react';
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
import { CalendarIcon } from 'lucide-react';
import { Calendar } from '../ui/calendar';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import type { CalendarEvent } from '@/lib/types';

const eventSchema = z.object({
  title: z.string().min(1, { message: "O título é obrigatório." }),
  description: z.string().optional(),
  date: z.date({ required_error: "A data é obrigatória." }),
  category: z.string().min(1, { message: "A categoria é obrigatória." }),
  color: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, { message: "Cor inválida." }).default('#E67E22'),
});

type EventFormData = z.infer<typeof eventSchema>;

interface CreateEventDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (data: Omit<CalendarEvent, 'id' | 'userId' | 'createdAt'>) => void;
}

const colorPresets = [
  '#E67E22', // primary
  '#D4AC0D', // accent
  '#E74C3C', // destructive-like
  '#2ECC71', // green
  '#3498DB', // blue
  '#9B59B6', // purple
];

export function CreateEventDialog({ isOpen, onClose, onCreate }: CreateEventDialogProps) {
  const { register, handleSubmit, control, reset, formState: { errors }, setValue } = useForm<EventFormData>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
        title: '',
        description: '',
        category: '',
        color: '#E67E22',
    }
  });

  useEffect(() => {
    if (!isOpen) {
      reset();
    }
  }, [isOpen, reset]);

  const onSubmit = (data: EventFormData) => {
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
            <div className="space-y-2">
              <Label htmlFor="category">Categoria</Label>
              <Input id="category" {...register('category')} placeholder="Ex: Pessoal, Família, Feriado"/>
              {errors.category && <p className="text-sm text-destructive mt-1">{errors.category.message}</p>}
            </div>
             <Controller
                name="color"
                control={control}
                render={({ field }) => (
                    <div className="space-y-2">
                      <Label>Cor da Categoria</Label>
                      <div className="flex items-center gap-2">
                        <Input type="color" className="w-12 h-10 p-1" {...field} />
                        <div className="flex gap-1">
                            {colorPresets.map(color => (
                                <button
                                    key={color}
                                    type="button"
                                    className={cn("w-6 h-6 rounded-full border-2", field.value === color ? 'border-ring' : 'border-transparent')}
                                    style={{ backgroundColor: color }}
                                    onClick={() => setValue('color', color)}
                                />
                            ))}
                        </div>
                      </div>
                      {errors.color && <p className="text-sm text-destructive mt-1">{errors.color.message}</p>}
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
