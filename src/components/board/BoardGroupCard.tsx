
'use client';

import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { KanbanBoard } from "@/lib/types";
import { FileStack, ArrowRight, Trash2, Pencil } from "lucide-react";
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { Input } from '../ui/input';

interface BoardGroupCardProps {
    groupName: string;
    boards: KanbanBoard[];
    onDeleteGroup: (groupName: string) => void;
    onUpdateGroupName: (oldGroupName: string, newGroupName: string) => void;
}

export function BoardGroupCard({ groupName, boards, onDeleteGroup, onUpdateGroupName }: BoardGroupCardProps) {
    const groupSlug = groupName === 'Sem Grupo' ? 'ungrouped' : encodeURIComponent(groupName);
    const [isEditing, setIsEditing] = useState(false);
    const [currentGroupName, setCurrentGroupName] = useState(groupName);

    const handleEditClick = () => {
        if (groupName !== 'Sem Grupo') {
            setIsEditing(true);
        }
    };

    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setCurrentGroupName(e.target.value);
    };

    const handleNameBlur = () => {
        setIsEditing(false);
        if (currentGroupName.trim() && currentGroupName !== groupName) {
            onUpdateGroupName(groupName, currentGroupName);
        } else {
            setCurrentGroupName(groupName);
        }
    };
    
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleNameBlur();
        }
    };


    return (
        <Card className={cn(
            "w-72 flex-shrink-0 flex flex-col relative transition-shadow duration-300 hover:shadow-2xl",
        )}>
            <CardHeader>
                <div className="flex justify-between items-start gap-2">
                    {isEditing ? (
                        <Input
                            value={currentGroupName}
                            onChange={handleNameChange}
                            onBlur={handleNameBlur}
                            onKeyDown={handleKeyDown}
                            autoFocus
                            className="font-headline text-primary bg-transparent border-primary h-8 -ml-1"
                        />
                    ) : (
                        <CardTitle 
                            className="font-headline text-primary truncate"
                        >
                            {groupName}
                        </CardTitle>
                    )}
                     {groupName !== 'Sem Grupo' && !isEditing && (
                        <div className="flex items-center gap-1">
                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleEditClick}>
                                <Pencil className="w-4 h-4 text-muted-foreground hover:text-primary" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onDeleteGroup(groupName)}>
                                <Trash2 className="w-4 h-4 text-muted-foreground hover:text-destructive" />
                            </Button>
                        </div>
                    )}
                </div>
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
