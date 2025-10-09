
"use client";

import { useState } from 'react';
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
import { CreateBoardDialog } from './CreateBoardDialog';
import { useUser, useFirestore } from '@/firebase';
import { collection, addDoc, serverTimestamp, writeBatch, doc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';

interface BoardSelectorProps {
  boards: KanbanBoard[];
  activeBoard: KanbanBoard | null;
  setActiveBoard: (board: KanbanBoard) => void;
}

const boardTemplates: Record<KanbanBoard['type'], { name: string; order: number }[]> = {
  kanban: [
    { name: 'Backlog', order: 0 },
    { name: 'A Fazer', order: 1 },
    { name: 'Em Progresso', order: 2 },
    { name: 'Revisão', order: 3 },
    { name: 'Concluído', order: 4 },
  ],
  swot: [
    { name: 'Forças (Strengths)', order: 0 },
    { name: 'Fraquezas (Weaknesses)', order: 1 },
    { name: 'Oportunidades (Opportunities)', order: 2 },
    { name: 'Ameaças (Threats)', order: 3 },
  ],
  business_canvas: [
      { name: 'Parcerias Chave', order: 0 },
      { name: 'Atividades Chave', order: 1 },
      { name: 'Recursos Chave', order: 2 },
      { name: 'Proposta de Valor', order: 3 },
      { name: 'Relacionamento com Clientes', order: 4 },
      { name: 'Canais', order: 5 },
      { name: 'Segmentos de Clientes', order: 6 },
      { name: 'Estrutura de Custos', order: 7 },
      { name: 'Fontes de Receita', order: 8 },
  ],
  custom: [],
};


export default function BoardSelector({ boards, activeBoard, setActiveBoard }: BoardSelectorProps) {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  const handleCreateBoard = async (name: string, type: KanbanBoard['type']) => {
    if (!user) return;
  
    try {
      // 1. Create the new board document
      const boardsCollection = collection(firestore, 'kanbanBoards');
      const newBoardRef = await addDoc(boardsCollection, {
        name,
        type,
        userId: user.uid,
        createdAt: serverTimestamp(),
      });
  
      // 2. Create the lists for that board based on the template
      const listsCollection = collection(firestore, 'kanbanBoards', newBoardRef.id, 'lists');
      const batch = writeBatch(firestore);
      const template = boardTemplates[type];
      
      template.forEach(list => {
        const listRef = doc(listsCollection);
        batch.set(listRef, list);
      });
      
      await batch.commit();
  
      toast({
        title: 'Quadro criado!',
        description: `O quadro "${name}" foi criado com sucesso.`,
      });
      
      // Fetch the newly created board to set it as active
      // This is a bit tricky as we don't have the full object.
      // A simple approach is to set a partial object, but it's better to refetch or pass the new object.
      // For now, let's just close the dialog. The user can select it from the list.
      setIsCreateDialogOpen(false);
  
    } catch (error) {
      console.error('Error creating board:', error);
      toast({
        variant: 'destructive',
        title: 'Erro ao criar quadro',
        description: 'Não foi possível criar o novo quadro. Tente novamente.',
      });
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline">
            {activeBoard ? activeBoard.name : "Selecione um Quadro"}
            <ChevronDown className="ml-2 h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Meus Quadros</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {boards.map(board => (
            <DropdownMenuItem key={board.id} onSelect={() => setActiveBoard(board)}>
              {board.name}
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={() => setIsCreateDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Criar Novo Quadro
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <CreateBoardDialog 
        isOpen={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        onCreate={handleCreateBoard}
      />
    </>
  );
}
