"use client";

import type { Task, Priority, Category, Status } from '@/lib/types';
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

interface TaskDialogProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedTask: Task) => void;
}

const priorities: Priority[] = ['Baixa', 'Média', 'Alta', 'Urgente'];
const categories: Category[] = ['Trabalho', 'Estudo', 'Autocuidado', 'Criação', 'Pessoal'];
const statuses: Status[] = ['A Fazer', 'Em Progresso', 'Concluído'];

export function TaskDialog({ task, isOpen, onClose, onSave }: TaskDialogProps) {
  if (!task) return null;

  // In a real app, you'd use a form library like react-hook-form here
  // For simplicity, we'll just handle state directly
  const handleSave = () => {
    // This is where you would gather form data and call onSave
    onSave(task);
    onClose();
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="font-headline">{task.title}</SheetTitle>
          <SheetDescription>
            Na categoria <span className="font-semibold text-primary">{task.category}</span>.
            Atualizado há 3 horas.
          </SheetDescription>
        </SheetHeader>
        <div className="py-4 space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Título</Label>
            <Input id="title" defaultValue={task.title} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea id="description" defaultValue={task.description} placeholder="Adicione uma descrição mais detalhada..."/>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="priority">Prioridade</Label>
              <Select defaultValue={task.priority}>
                <SelectTrigger id="priority">
                  <SelectValue placeholder="Selecione a prioridade" />
                </SelectTrigger>
                <SelectContent>
                  {priorities.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Categoria</Label>
              <Select defaultValue={task.category}>
                <SelectTrigger id="category">
                  <SelectValue placeholder="Selecione a categoria" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select defaultValue={task.status}>
              <SelectTrigger id="status">
                <SelectValue placeholder="Selecione o status" />
              </SelectTrigger>
              <SelectContent>
                {statuses.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          
          <Separator />
          
          {task.checklist && task.checklist.length > 0 && (
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
          )}

        </div>
        <SheetFooter>
          <SheetClose asChild>
            <Button variant="outline">Cancelar</Button>
          </SheetClose>
          <Button onClick={handleSave}>Salvar alterações</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
