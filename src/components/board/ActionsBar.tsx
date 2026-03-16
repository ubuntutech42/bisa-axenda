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

// This component is no longer used.
// The controls have been moved to a fixed header in the main board page.
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
  return null;
}
