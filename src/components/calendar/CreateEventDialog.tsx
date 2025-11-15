
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
import { collection, query, where, addDoc, serverTimestamp } from 'firebase/firestore';
import { Combobox } from '../ui/combobox';
import { useToast } from '@/hooks/use-toast';


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
}

export function CreateEventDialog({ isOpen, onClose, onCreate }: CreateEventDialogProps) {
  const { toast } = useToast();
  const { user } = useUser();
  const firestore = useFirestore();
  const [newCategoryName, setNewCategoryName] = useState('');
  
  const { register, handleSubmit, control, reset, formState: { errors }, setValue } = useForm<EventFormData>({
    resolver: zodResolver(eventSchema),
  });

  const categoriesQuery = useMemoFirebase(() => 
    user ? query(collection(firestore, 'users', user.uid, 'eventCategories')) : null, 
    [firestore, user]
  );
  const { data: categories, isLoading: areCategoriesLoading } = useCollection<CalendarEventCategory>(categoriesQuery);

  useEffect(() => {
    if (!isOpen) {
      reset();
      setNewCategoryName('');
    }
  }, [isOpen, reset]);

  const handleCreateCategory = async (categoryName: string) => {
    if (!user || !firestore || !categoryName.trim()) return null;

    const existingCategory = categories?.find(c => c.name.toLowerCase() === categoryName.toLowerCase());
    if (existingCategory) {
      toast({
        variant: 'destructive',
        title: 'Categoria já existe',
        description: `A categoria "${categoryName}" já foi criada.`,
      });
      return existingCategory.id;
    }

    try {
      const newCategoryRef = await addDoc(collection(firestore, 'users', user.uid, 'eventCategories'), {
        userId: user.uid,
        name: categoryName,
        color: '#E67E22', // Default color
        createdAt: serverTimestamp(),
      });
      toast({
        title: 'Categoria criada!',
        description: `A categoria "${categoryName}" foi adicionada.`,
      });
      return newCategoryRef.id;
    } catch (error) {
      console.error("Error creating category:", error);
      toast({
        variant: 'destructive',
        title: 'Erro ao criar categoria',
      });
      return null;
    }
  };


  const onSubmit = async (data: EventFormData) => {
    let categoryId = data.categoryId;

    // Check if the selected "ID" is actually a new category name
    const isNewCategory = !categories?.some(c => c.id === categoryId);

    if (isNewCategory && categoryId) {
      const newId = await handleCreateCategory(categoryId);
      if (newId) {
        categoryId = newId;
      } else {
        return; // Stop submission if category creation fails
      }
    }
    
    onCreate({
      ...data,
      categoryId,
      date: format(data.date, 'yyyy-MM-dd'),
    });
    onClose();
  };

  const categoryOptions = categories?.map(c => ({ value: c.id, label: c.name })) || [];
  
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
                      <Combobox
                        options={categoryOptions}
                        value={field.value}
                        onChange={field.onChange}
                        placeholder="Selecione ou crie uma categoria..."
                        searchPlaceholder="Buscar categoria..."
                        noResultsText="Nenhuma categoria encontrada."
                      />
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

    