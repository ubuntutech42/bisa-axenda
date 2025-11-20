'use client';

import { Button } from "@/components/ui/button";
import GroupSelector from "@/components/board/GroupSelector";
import BoardSelector from "@/components/kanban/BoardSelector";
import { Plus } from "lucide-react";
import type { KanbanBoard } from "@/lib/types";

interface ActionsBarProps {
    groups: string[];
    activeGroup: string;
    onGroupChange: (group: string) => void;
    boards: KanbanBoard[];
    activeBoard: KanbanBoard | null;
    setActiveBoard: (board: KanbanBoard) => void;
    onNewBoardClick: () => void;
    onNewTaskClick: () => void;
    isNewTaskDisabled: boolean;
}

export function ActionsBar({
    groups,
    activeGroup,
    onGroupChange,
    boards,
    activeBoard,
    setActiveBoard,
    onNewBoardClick,
    onNewTaskClick,
    isNewTaskDisabled
}: ActionsBarProps) {
  return (
    <aside className="fixed top-1/2 right-4 -translate-y-1/2 z-40 bg-card/80 backdrop-blur-sm p-3 rounded-lg border shadow-lg flex flex-col gap-3">
        <GroupSelector 
            groups={groups}
            activeGroup={activeGroup}
            onGroupChange={onGroupChange}
        />
        <BoardSelector 
            boards={boards}
            activeBoard={activeBoard}
            setActiveBoard={setActiveBoard}
            onNewBoardClick={onNewBoardClick}
        />
        <Button onClick={onNewTaskClick} disabled={isNewTaskDisabled}>
            <Plus className="mr-2 h-4 w-4" />
            Nova Tarefa
        </Button>
    </aside>
  );
}
