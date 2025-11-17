'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Bell } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';

interface FloatingNotificationsProps {
    hasNotifications: boolean;
}

export function FloatingNotifications({ hasNotifications }: FloatingNotificationsProps) {
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const notificationCount = 1; // Placeholder

    if (!hasNotifications) {
        return null;
    }

    return (
        <>
            <div className="md:hidden fixed bottom-6 right-4 z-30 pb-[env(safe-area-inset-bottom)]">
                <Button
                    size="icon"
                    className="rounded-full h-16 w-16 shadow-xl relative animate-float"
                    onClick={() => setIsSheetOpen(true)}
                    aria-label="Ver notificações"
                >
                    <Bell className="h-8 w-8" />
                    <div className="absolute -top-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-destructive text-sm font-bold text-destructive-foreground border-2 border-background">
                        {notificationCount}
                    </div>
                </Button>
            </div>

            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                <SheetContent className="w-full sm:max-w-md" side="right">
                    <SheetHeader>
                        <SheetTitle>Notificações</SheetTitle>
                        <SheetDescription>Seus lembretes e avisos importantes.</SheetDescription>
                    </SheetHeader>
                    <div className="py-4 space-y-4">
                        {/* Placeholder Content */}
                        <div className="p-4 rounded-lg bg-muted">
                            <h4 className="font-semibold">Reflexão Semanal</h4>
                            <p className="text-sm text-muted-foreground">Não se esqueça de preencher sua reflexão da semana hoje à noite!</p>
                             <Button variant="link" className="p-0 h-auto mt-2">Ver tarefa</Button>
                        </div>
                         <Separator />
                         <div className="p-4 rounded-lg">
                            <h4 className="font-semibold">Tarefa Urgente: Preparar Apresentação</h4>
                            <p className="text-sm text-muted-foreground">O prazo para esta tarefa é amanhã.</p>
                             <Button variant="link" className="p-0 h-auto mt-2">Ver tarefa</Button>
                        </div>
                    </div>
                </SheetContent>
            </Sheet>
        </>
    );
}
