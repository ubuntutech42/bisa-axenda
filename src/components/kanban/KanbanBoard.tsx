"use client";

import { useState, useMemo } from 'react';
import { KanbanColumn } from './KanbanColumn';
import { TaskDialog } from './TaskDialog';
import type { Task, KanbanList } from '@/lib/types';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, doc, updateDoc, serverTimestamp, addDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Loader, Plus } from 'lucide-react';
import { Button } from '../ui/button';
import { DragDropContext, DropResult } from 'react-beautiful-dnd';

interface KanbanBoardProps {
  boardId: string;
  lists: KanbanList[];
  onNewTaskClick: (listId: string) => void;
}

export function KanbanBoard({ boardId, lists, onNewTaskClick }: KanbanBoardProps) {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  const tasksQuery = useMemoFirebase(() => 
    user && boardId ? collection(firestore, 'kanbanBoards', boardId, 'tasks') : null, 
    [firestore, user, boardId]
  );
  const { data: tasks, isLoading: areTasksLoading } = useCollection<Task>(tasksQuery);

  const [activeTask, setActiveTask] = useState<Task | null>(null);

  const sortedLists = useMemo(() => {
    if (!lists) return [];
    return [...lists].sort((a, b) => a.order - b.order);
  }, [lists]);

  const handleCardClick = (task: Task) => {
    setActiveTask(task);
  };

  const handleCloseDialog = () => {
    setActiveTask(null);
  };

  const handleSaveTask = async (updatedTaskData: Partial<Task> & { id?: string }) => {
    if (!user || !updatedTaskData.id || !boardId) return;
    try {
      const taskRef = doc(firestore, 'kanbanBoards', boardId, 'tasks', updatedTaskData.id);
      await updateDoc(taskRef, {
        ...updatedTaskData,
        updatedAt: serverTimestamp(),
      });
      toast({
        title: 'Tarefa atualizada!',
        description: `A tarefa "${updatedTaskData.title}" foi salva.`,
      });
      handleCloseDialog();
    } catch (error) {
      console.error("Error updating task:", error);
      toast({
        variant: 'destructive',
        title: 'Erro ao atualizar',
        description: 'Não foi possível salvar as alterações. Tente novamente.',
      });
    }
  };

  const handleUpdateColumnName = async (listId: string, newName: string) => {
    if (!user || !boardId) return;
    try {
      const listRef = doc(firestore, 'kanbanBoards', boardId, 'lists', listId);
      await updateDoc(listRef, { name: newName });
      toast({ title: 'Coluna atualizada!', description: `O nome da coluna foi alterado para "${newName}".` });
    } catch (error) {
      console.error('Error updating column name:', error);
      toast({ variant: 'destructive', title: 'Erro', description: 'Não foi possível atualizar a coluna.' });
    }
  };

  const handleAddList = async () => {
    if (!user || !boardId) return;
    try {
        const listsCollection = collection(firestore, 'kanbanBoards', boardId, 'lists');
        const newOrder = sortedLists.length > 0 ? Math.max(...sortedLists.map(l => l.order)) + 1 : 0;
        await addDoc(listsCollection, {
            name: 'Nova Coluna',
            order: newOrder,
        });
        toast({
            title: 'Coluna Adicionada!',
            description: 'Uma nova coluna foi adicionada ao seu quadro.',
        });
    } catch (error) {
        console.error("Error adding list:", error);
        toast({
            variant: 'destructive',
            title: 'Erro ao adicionar coluna',
            description: 'Não foi possível criar a nova coluna. Tente novamente.',
        });
    }
  };

  const onDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) {
      return;
    }

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }
    
    if (!user || !boardId) return;

    try {
        const taskRef = doc(firestore, 'kanbanBoards', boardId, 'tasks', draggableId);
        await updateDoc(taskRef, {
            listId: destination.droppableId,
            updatedAt: serverTimestamp(),
        });
        // Optimistic update handled by useCollection hook
    } catch (error) {
        console.error("Error updating task list:", error);
        toast({
            variant: 'destructive',
            title: 'Erro ao mover tarefa',
            description: 'Não foi possível mover a tarefa. Por favor, tente novamente.',
        });
    }
  };

  const tasksByListId = useMemo(() => {
    if (!tasks) return {};
    return tasks.reduce((acc, task) => {
      const listId = task.listId || (sortedLists.find(l => l.order === 0)?.id);
      if (!listId) return acc;
      if (!acc[listId]) {
        acc[listId] = [];
      }
      acc[listId].push(task);
      return acc;
    }, {} as Record<string, Task[]>);
  }, [tasks, sortedLists]);

  if (areTasksLoading) {
    return <div className="flex items-center justify-center h-96"><Loader className="h-8 w-8 animate-spin text-white" /></div>;
  }

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <ScrollArea className="w-full whitespace-nowrap h-full">
        <div className="flex gap-4 p-4 items-start h-full">
          {sortedLists.map((list) => {
            const columnTasks = tasksByListId[list.id] || [];
            return (
              <KanbanColumn
                key={list.id}
                list={list}
                tasks={columnTasks}
                onCardClick={handleCardClick}
                onUpdateListName={handleUpdateColumnName}
                onNewTaskClick={() => onNewTaskClick(list.id)}
              />
            );
          })}
          <div className="flex-shrink-0 w-72 md:w-80">
              <Button variant="ghost" onClick={handleAddList} className="w-full bg-white/10 hover:bg-white/20 text-white">
                  <Plus className="mr-2 h-4 w-4" />
                  Adicionar outra coluna
              </Button>
          </div>
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
      {activeTask && lists && (
          <TaskDialog 
            task={activeTask} 
            isOpen={!!activeTask} 
            onClose={handleCloseDialog}
            onSave={handleSaveTask}
            lists={sortedLists}
          />
      )}
    </DragDropContext>
  );
}
