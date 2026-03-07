"use client";

import { useEffect, useState, useRef } from 'react';
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
import { CalendarIcon, ImagePlus, X, Loader2 } from 'lucide-react';
import { Calendar } from '../ui/calendar';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { uploadTaskCover, isTaskCoverUploadAvailable } from '@/lib/task-cover-upload';


const priorities = ['Baixa', 'Média', 'Alta', 'Urgente'] as const;
const categories = ['Trabalho', 'Estudo', 'Autocuidado', 'Criação', 'Pessoal'] as const;

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
  initialListId?: string;
  boardId?: string;
}

export function TaskDialog({ task, isOpen, onClose, onSave, lists = [], initialListId, boardId }: TaskDialogProps) {
  const isEditing = !!task;
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [removeCover, setRemoveCover] = useState(false);
  const [coverUploading, setCoverUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { register, handleSubmit, control, reset, formState: { errors } } = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
  });

  useEffect(() => {
    if (isOpen) {
      setCoverFile(null);
      setRemoveCover(false);
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
          listId: initialListId || sortedLists[0]?.id || '',
          deadline: undefined,
        });
      }
    }
  }, [task, isOpen, reset, lists, initialListId]);

  const existingCoverUrl = task?.coverImageUrl && !removeCover && !coverFile ? task.coverImageUrl : null;
  const [objectUrl, setObjectUrl] = useState<string | null>(null);
  useEffect(() => {
    if (coverFile) {
      const url = URL.createObjectURL(coverFile);
      setObjectUrl(url);
      return () => URL.revokeObjectURL(url);
    }
    setObjectUrl(null);
  }, [coverFile]);
  const previewUrl = objectUrl ?? existingCoverUrl ?? null;

  const handleFormSubmit = async (data: TaskFormData) => {
    let coverImageUrl: string | null | undefined = existingCoverUrl ?? undefined;
    if (removeCover) coverImageUrl = null;
    else if (coverFile && boardId && isTaskCoverUploadAvailable()) {
      setCoverUploading(true);
      try {
        coverImageUrl = await uploadTaskCover(coverFile, boardId, task?.id);
      } catch (err) {
        console.error('Upload da capa falhou:', err);
        setCoverUploading(false);
        return;
      }
      setCoverUploading(false);
    } else if (task?.coverImageUrl && !removeCover && !coverFile) {
      coverImageUrl = task.coverImageUrl;
    }

    const dataToSave = {
      ...data,
      deadline: data.deadline?.toISOString(),
      ...(coverImageUrl !== undefined && { coverImageUrl: coverImageUrl === null ? null : coverImageUrl || undefined }),
    };
    onSave(isEditing ? { ...task, ...dataToSave } : dataToSave);
  };
  
  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-lg p-4 sm:p-6 overflow-y-auto">
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

            {isTaskCoverUploadAvailable() && (
              <div className="space-y-2">
                <Label>Capa do card (opcional)</Label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) setCoverFile(f);
                    setRemoveCover(false);
                    e.target.value = '';
                  }}
                />
                {previewUrl ? (
                  <div className="relative rounded-md border overflow-hidden bg-muted/50">
                    <img src={previewUrl} alt="Capa" className="w-full h-32 object-cover" />
                    <div className="absolute top-2 right-2 flex gap-1">
                      <Button
                        type="button"
                        size="icon"
                        variant="secondary"
                        className="h-8 w-8"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <ImagePlus className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        size="icon"
                        variant="secondary"
                        className="h-8 w-8"
                        onClick={() => { setCoverFile(null); setRemoveCover(true); }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <ImagePlus className="mr-2 h-4 w-4" />
                    Adicionar imagem de capa
                  </Button>
                )}
              </div>
            )}

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
                  <Label>Prazo (opcional)</Label>
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
                          {field.value ? format(field.value, "PPP", { locale: ptBR }) : <span>Nenhum prazo</span>}
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
            <Button type="submit" disabled={coverUploading}>
              {coverUploading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Salvar
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
