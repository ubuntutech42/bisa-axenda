
"use client";

import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MoreVertical, Trash2 } from "lucide-react";
import type { KanbanBoard } from "@/lib/types";
import { cn } from "@/lib/utils";
import { boardTemplatesInfo } from "../kanban/board-templates";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu";

interface BoardCardProps {
  board: KanbanBoard;
  isActive: boolean;
  onClick: () => void;
  onDelete: () => void;
}

export function BoardCard({ board, isActive, onClick, onDelete }: BoardCardProps) {
  const templateInfo = boardTemplatesInfo.find(t => t.type === board.type);

  return (
    <Card
      onClick={onClick}
      className={cn(
        "cursor-pointer transition-all duration-200 hover:shadow-lg h-full",
        isActive
          ? "border-primary ring-2 ring-primary shadow-lg"
          : "border-border"
      )}
    >
      <CardHeader>
        <div className="flex justify-between items-start gap-2">
            <CardTitle className="text-base font-semibold truncate leading-tight">
                {board.name}
            </CardTitle>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-7 w-7 -mt-1 -mr-2 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                        <MoreVertical className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                    <DropdownMenuItem 
                        onClick={onDelete} 
                        className="text-destructive focus:text-destructive focus:bg-destructive/10"
                    >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Excluir
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
        <CardDescription className="text-xs">{templateInfo?.name || 'Quadro'}</CardDescription>
      </CardHeader>
    </Card>
  );
}
