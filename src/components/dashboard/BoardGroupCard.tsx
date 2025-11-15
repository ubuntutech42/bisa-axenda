
'use client';

import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { KanbanBoard } from "@/lib/types";
import { FileStack, ArrowRight } from "lucide-react";
import { cn } from '@/lib/utils';

interface BoardGroupCardProps {
    groupName: string;
    boards: KanbanBoard[];
}

export function BoardGroupCard({ groupName, boards }: BoardGroupCardProps) {
    const groupSlug = groupName === 'Sem Grupo' ? 'ungrouped' : encodeURIComponent(groupName);

    return (
        <Card className={cn(
            "w-72 flex-shrink-0 flex flex-col relative transition-all duration-300 hover:shadow-2xl hover:-translate-y-2",
            // Add a delay to the animation based on the group name to avoid all cards animating in sync
            // This is a simple hash function to generate a semi-random delay
            `animate-float animation-delay-${groupName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % 10 * 100}`
        )}>
            <CardHeader>
                <CardTitle className="font-headline text-primary truncate">{groupName}</CardTitle>
                <CardDescription>{boards.length} {boards.length === 1 ? 'quadro' : 'quadros'} neste grupo</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 space-y-2 overflow-hidden">
                 {boards.slice(0, 3).map(board => (
                    <div key={board.id} className="flex items-center gap-2 p-2 rounded-md bg-muted/50">
                        <FileStack className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm font-medium truncate text-foreground">{board.name}</span>
                    </div>
                ))}
                {boards.length > 3 && (
                     <div className="text-sm text-muted-foreground text-center pt-2">
                        + {boards.length - 3} mais...
                    </div>
                )}
            </CardContent>
            <CardFooter>
                 <Button asChild className="w-full">
                    <Link href={`/board?group=${groupSlug}`}>
                        Ver Grupo
                        <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                </Button>
            </CardFooter>
        </Card>
    );
}
