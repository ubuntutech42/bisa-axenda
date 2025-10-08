import { Header } from '@/components/layout/Header';
import { KanbanBoard } from '@/components/kanban/KanbanBoard';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export default function BoardPage() {
  return (
    <div className="flex flex-col h-full">
      <Header title="Kanban Board">
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          New Task
        </Button>
      </Header>
      <div className="flex-1 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8">
        <KanbanBoard />
      </div>
    </div>
  );
}
