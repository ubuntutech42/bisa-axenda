"use client";

import { useEffect } from 'react';
import type { Task, Priority, Category, KanbanList } from '@/lib/types';
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
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { Calendar } from '../ui/calendar';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';


const priorities: Priority[] = ['Baixa', 'Média', 'Alta', 'Urgente'];
const categories: Category[] = ['Trabalho', 'Estudo', 'Autocuidado', 'Criação', 'Pessoal'];

const taskSchema = z.object({
  title: z.string().min(1, { message: "O título é obrigatório." }),
  description: z.string().optional(),
  category: z.enum(categories, { required_error: "A categoria é obrigatória." }),
  priority: z.enum(priorities).default('Média'),
  listId: z.string({ required_error: "A coluna é obrigatória." }),
  deadline: z.date().optional(),
});

type TaskFormData = z.infer<typeof taskSchema>;

interface TaskDialogProps {
  task?: Task | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  lists: KanbanList[];
}

export function TaskDialog({ task, isOpen, onClose, onSave, lists = [] }: TaskDialogProps) {
  const isEditing = !!task;

  const { register, handleSubmit, control, reset, formState: { errors } } = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
  });

  useEffect(() => {
    if (isOpen) {
      const sortedLists = [...lists].sort((a,b) => a.order - b.order);
      if (task) {
        reset({
          title: task.title,
          description: task.description,
          category: task.category,
          priority: task.priority,
          listId: task.listId,
          deadline: task.deadline ? new Date(task.deadline) : undefined,
        });
      } else {
        reset({
          title: '',
          description: '',
          priority: 'Média',
          // Default to the first list in order (e.g., Backlog or A Fazer)
          listId: sortedLists[0]?.id || '',
          deadline: undefined,
        });
      }
    }
  }, [task, isOpen, reset, lists]);


  const handleFormSubmit = (data: TaskFormData) => {
    const dataToSave = {
      ...data,
      deadline: data.deadline?.toISOString(),
    };
    onSave(isEditing ? { ...task, ...dataToSave } : dataToSave);
  };
  
  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <form onSubmit={handleSubmit(handleFormSubmit)}>
          <SheetHeader>
            <SheetTitle className="font-headline">{isEditing ? 'Editar Tarefa' : 'Criar Nova Tarefa'}</SheetTitle>
            {isEditing && task?.category && (
              <SheetDescription>
                Na categoria <span className="font-semibold text-primary">{task.category}</span>.
              </SheetDescription>
            )}
          </SheetHeader>
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Título</Label>
              <Input id="title" {...register('title')} />
              {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea id="description" placeholder="Adicione uma descrição mais detalhada..." {...register('description')} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Controller
                  name="priority"
                  control={control}
                  render={({ field }) => (
                    <div className="space-y-2">
                      <Label>Prioridade</Label>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger><SelectValue placeholder="Prioridade" /></SelectTrigger>
                        <SelectContent>
                          {priorities.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                />

                <Controller
                  name="category"
                  control={control}
                  render={({ field }) => (
                    <div className="space-y-2">
                      <Label>Categoria</Label>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger><SelectValue placeholder="Categoria" /></SelectTrigger>
                        <SelectContent>
                          {categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      {errors.category && <p className="text-sm text-destructive">{errors.category.message}</p>}
                    </div>
                  )}
                />
            </div>

            <Controller
              name="listId"
              control={control}
              render={({ field }) => (
                <div className="space-y-2">
                  <Label>Coluna</Label>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger><SelectValue placeholder="Coluna" /></SelectTrigger>
                    <SelectContent>
                      {lists.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  {errors.listId && <p className="text-sm text-destructive">{errors.listId.message}</p>}
                </div>
              )}
            />

            <Controller
              name="deadline"
              control={control}
              render={({ field }) => (
                <div className="space-y-2">
                  <Label>Prazo</Label>
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
                </div>
              )}
            />
            
            {isEditing && task?.checklist && task.checklist.length > 0 && (
              <>
                <Separator />
                <div className="space-y-2">
                    <Label>Checklist</Label>
                    <div className="space-y-2">
                        {task.checklist.map((item, index) => (
                            <div key={index} className="flex items-center gap-2">
                                <Checkbox id={`checklist-${index}`} defaultChecked={item.completed} />
                                <Label htmlFor={`checklist-${index}`} className="flex-1 font-normal">{item.text}</Label>
                            </div>
                        ))}
                    </div>
                </div>
              </>
            )}

          </div>
          <SheetFooter>
            <SheetClose asChild>
              <Button type="button" variant="outline">Cancelar</Button>
            </SheetClose>
            <Button type="submit">Salvar</Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
