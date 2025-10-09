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

type BoardType = KanbanBoard['type'];
interface CreateBoardDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (name: string, type: BoardType) => void;
}

export function CreateBoardDialog({ isOpen, onClose, onCreate }: CreateBoardDialogProps) {
  const [name, setName] = useState('');
  const [type, setType] = useState<BoardType>('kanban');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onCreate(name, type);
      setName('');
      setType('kanban');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Criar Novo Quadro</DialogTitle>
            <DialogDescription>
              Escolha um nome e um modelo para começar.
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
              <Label htmlFor="board-type">Modelo do Quadro</Label>
              <Select onValueChange={(value) => setType(value as BoardType)} defaultValue={type}>
                <SelectTrigger id="board-type">
                  <SelectValue placeholder="Selecione um modelo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="kanban">Kanban Padrão</SelectItem>
                  <SelectItem value="swot">Análise SWOT (FOFA)</SelectItem>
                  <SelectItem value="business_canvas">Canvas de Negócio</SelectItem>
                  <SelectItem value="custom">Personalizado (Comece do Zero)</SelectItem>
                </SelectContent>
              </Select>
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
