
"use client";

import type { KanbanBoard } from "@/lib/types";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { BoardCard } from "./BoardCard";
import { Button } from "../ui/button";
import { Plus } from "lucide-react";

interface BoardCarouselProps {
  boards: KanbanBoard[];
  activeBoard: KanbanBoard | null;
  onSelectBoard: (board: KanbanBoard) => void;
  onNewBoardClick: () => void;
  onDeleteBoard: (board: KanbanBoard) => void;
}

export default function BoardCarousel({ 
    boards, 
    activeBoard, 
    onSelectBoard,
    onNewBoardClick,
    onDeleteBoard 
}: BoardCarouselProps) {
  return (
    <Carousel
      opts={{
        align: "start",
        dragFree: true,
      }}
      className="w-full"
    >
      <CarouselContent>
        {boards.map((board) => (
          <CarouselItem key={board.id} className="basis-1/2 md:basis-1/3 lg:basis-1/4 xl:basis-1/5">
            <BoardCard
              board={board}
              isActive={activeBoard?.id === board.id}
              onClick={() => onSelectBoard(board)}
              onDelete={() => onDeleteBoard(board)}
            />
          </CarouselItem>
        ))}
         <CarouselItem className="basis-1/2 md:basis-1/3 lg:basis-1/4 xl:basis-1/5 flex items-center justify-center">
            <Button variant="outline" className="h-full w-full min-h-[100px] border-dashed" onClick={onNewBoardClick}>
                <Plus className="mr-2 h-4 w-4" />
                Novo Quadro
            </Button>
         </CarouselItem>
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
  );
}
