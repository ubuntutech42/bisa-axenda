'use client';

import Link from "next/link";
import { Button } from "../ui/button";
import { Plus } from "lucide-react";

interface NoBoardsSplashProps {
    groupName: string;
    onNewBoardClick: () => void;
}

export function NoBoardsSplash({ groupName, onNewBoardClick }: NoBoardsSplashProps) {
    const displayGroup = groupName === 'ungrouped' ? 'Sem Grupo' : groupName;

    return (
        <div className="text-center p-8 border-2 border-dashed rounded-lg h-full flex flex-col justify-center items-center">
            <h2 className="text-xl font-semibold mb-2">Nenhum quadro em &quot;{displayGroup}&quot;</h2>
            <p className="text-muted-foreground mb-4 max-w-md mx-auto">Crie seu primeiro quadro neste grupo para começar.</p>
            <div className='flex gap-4'>
                <Button onClick={onNewBoardClick}>
                    <Plus className="mr-2 h-4 w-4" />
                    Criar Quadro
                </Button>
                <Button variant="outline" asChild>
                   <Link href="/boards">Ver todos os grupos</Link>
                </Button>
            </div>
        </div>
    );
}
