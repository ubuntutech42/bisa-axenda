
'use client';

import { useState } from 'react';
import { signOut } from 'firebase/auth';
import { useAuth } from '@/firebase';
import { Button } from '@/components/ui/button';
import { SettingsDialog } from '@/components/layout/SettingsDialog';
import { usePomodoro } from '@/context/PomodoroContext';
import { LogOut, Plus, Settings, Timer, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

export function FloatingActions() {
    const [isOpen, setIsOpen] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const { setIsFloatingPomodoroOpen } = usePomodoro();
    const auth = useAuth();
  
    const handleLogout = async () => {
      await signOut(auth);
    };

    const actions = [
        { label: 'Timer Flutuante', icon: Timer, onClick: () => setIsFloatingPomodoroOpen(prev => !prev) },
        { label: 'Configurações', icon: Settings, onClick: () => setIsSettingsOpen(true) },
        { label: 'Sair', icon: LogOut, onClick: handleLogout },
    ];

    return (
        <>
            <div className="md:hidden fixed bottom-20 right-4 z-50 flex flex-col items-center gap-2">
                <div 
                    className={cn(
                        "flex flex-col items-center gap-2 transition-all duration-300 ease-in-out",
                        isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
                    )}
                >
                    {actions.map((action, index) => (
                         <TooltipProvider key={index} delayDuration={100}>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        size="icon"
                                        variant="secondary"
                                        className="rounded-full h-12 w-12 shadow-lg"
                                        onClick={action.onClick}
                                        aria-label={action.label}
                                    >
                                        <action.icon className="h-6 w-6" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent side="left">
                                    <p>{action.label}</p>
                                </TooltipContent>
                            </Tooltip>
                         </TooltipProvider>
                    ))}
                </div>
                 <Button
                    size="icon"
                    className="rounded-full h-16 w-16 shadow-xl"
                    onClick={() => setIsOpen(prev => !prev)}
                    aria-expanded={isOpen}
                >
                    <span className="sr-only">{isOpen ? 'Fechar Menu' : 'Abrir Menu'}</span>
                    <Plus className={cn("h-8 w-8 transition-transform duration-300 ease-in-out", isOpen && 'rotate-45')} />
                </Button>
            </div>
            <SettingsDialog isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
        </>
    );
}

