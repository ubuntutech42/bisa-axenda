
"use client";

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { KanbanBoard } from '@/lib/types';
import { boardTemplatesInfo } from './board-templates';
import { Combobox } from '../ui/combobox';

type BoardType = KanbanBoard['type'];
interface CreateBoardDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (name: string, type: BoardType, group?: string) => void;
  existingGroups?: string[];
}

export function CreateBoardDialog({ isOpen, onClose, onCreate, existingGroups = [] }: CreateBoardDialogProps) {
  const [name, setName] = useState('');
  const [type, setType] = useState<BoardType>('kanban');
  const [group, setGroup] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onCreate(name, type, group.trim() || undefined);
      // Reset state after creation
      setName('');
      setType('kanban');
      setGroup('');
    }
  };

  const groupOptions = existingGroups.map(g => ({ value: g, label: g }));

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Criar Novo Quadro</DialogTitle>
            <DialogDescription>
              Escolha um nome e um modelo para começar. Você também pode agrupar quadros por temas.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="board-name">Nome do Quadro</Label>
              <Input
                id="board-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Meu Projeto Secreto"
                required
              />
            </div>
             <div className="space-y-2">
              <Label htmlFor="board-group">Grupo do Quadro (Opcional)</Label>
              <Combobox 
                options={groupOptions}
                value={group}
                onChange={setGroup}
                placeholder="Selecione ou crie um grupo..."
                searchPlaceholder="Buscar grupo..."
                noResultsText="Nenhum grupo encontrado."
              />
              <p className="text-xs text-muted-foreground px-1">
                Você pode criar um novo grupo digitando um nome que não existe.
               </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="board-type">Modelo do Quadro</Label>
              <Select onValueChange={(value) => setType(value as BoardType)} defaultValue={type}>
                <SelectTrigger id="board-type">
                  <SelectValue placeholder="Selecione um modelo" />
                </SelectTrigger>
                <SelectContent>
                  {boardTemplatesInfo.map(template => (
                    <SelectItem key={template.type} value={template.type}>
                      {template.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
               <p className="text-xs text-muted-foreground px-1">
                {boardTemplatesInfo.find(t => t.type === type)?.description}
               </p>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit">Criar Quadro</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
