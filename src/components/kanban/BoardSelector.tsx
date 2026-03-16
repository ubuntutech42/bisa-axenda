
"use client";

import type { KanbanBoard } from '@/lib/types';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { ChevronDown, Plus } from 'lucide-react';

interface BoardSelectorProps {
  boards: KanbanBoard[];
  activeBoard: KanbanBoard | null;
  setActiveBoard: (board: KanbanBoard) => void;
  onNewBoardClick: () => void;
}

export default function BoardSelector({ boards, activeBoard, setActiveBoard, onNewBoardClick }: BoardSelectorProps) {
  
  if (!boards || boards.length === 0) {
    return (
        <Button variant="outline" onClick={onNewBoardClick}>
            <Plus className="mr-2 h-4 w-4" />
            Criar Quadro
        </Button>
    )
  }

  return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="min-w-[200px] justify-between">
            <span className='truncate'>{activeBoard ? activeBoard.name : "Selecione um Quadro"}</span>
            <ChevronDown className="ml-2 h-4 w-4 shrink-0" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[--radix-dropdown-menu-trigger-width]">
          <DropdownMenuLabel>Meus Quadros</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {boards.map(board => (
            <DropdownMenuItem key={board.id} onSelect={() => setActiveBoard(board)}>
              {board.name}
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={onNewBoardClick}>
            <Plus className="mr-2 h-4 w-4" />
            Criar Novo Quadro
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
  );
}
