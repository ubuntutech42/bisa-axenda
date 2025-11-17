'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BarChart3,
  CalendarDays,
  Home,
  LayoutGrid,
  Loader,
  LogOut,
  Settings,
  Timer,
  PanelLeftClose,
  PanelRightClose
} from 'lucide-react';
import { signOut } from 'firebase/auth';
import { useAuth, useUser } from '@/firebase';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Logo } from './Logo';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from '@/components/ui/dropdown-menu';
import { useState } from 'react';
import { SettingsDialog } from '@/components/layout/SettingsDialog';
import { usePomodoro } from '@/context/PomodoroContext';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';


const navItems = [
  { href: '/dashboard', label: 'Painel', icon: Home },
  { href: '/boards', label: 'Quadros', icon: LayoutGrid },
  { href: '/calendar', label: 'Calendário', icon: CalendarDays },
  { href: '/pomodoro', label: 'Pomodoro', icon: Timer },
  { href: '/reports', label: 'Relatórios', icon: BarChart3 },
];

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
  hasNotifications: boolean;
}

function UserProfile({ isCollapsed, hasNotifications }: { isCollapsed: boolean, hasNotifications: boolean }) {
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const { setIsFloatingPomodoroOpen } = usePomodoro();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  if (isUserLoading) {
    return <Loader className="h-6 w-6 animate-spin" />;
  }

  if (!user) {
    return null;
  }
  
  const handleLogout = async () => {
    await signOut(auth);
  };

  const notificationCount = 1; // Placeholder

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className={cn(
              "flex items-center gap-2 w-full h-auto p-2 justify-start",
              isCollapsed ? "w-12 h-12 justify-center p-0" : "w-full"
            )}>
            <Avatar className="h-9 w-9">
              <AvatarImage src={user.photoURL || ''} alt={user.displayName || 'User'} />
              <AvatarFallback>{user.displayName?.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
            {!isCollapsed && (
              <div className="flex flex-col items-start truncate">
                <span className="text-sm font-semibold truncate">{user.displayName}</span>
                <span className="text-xs text-muted-foreground truncate">{user.email}</span>
              </div>
            )}
             {hasNotifications && (
                <div className="relative ml-auto">
                    <div className={cn(
                      "flex h-4 w-4 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground",
                      isCollapsed && "absolute top-0 right-0 h-3 w-3"
                      )}>
                       {!isCollapsed && notificationCount}
                    </div>
                </div>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">{user.displayName}</p>
              <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
           <DropdownMenuGroup>
            <DropdownMenuItem onClick={() => setIsFloatingPomodoroOpen(prev => !prev)}>
              <Timer className="mr-2 h-4 w-4" />
              <span>Timer Flutuante</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setIsSettingsOpen(true)}>
              <Settings className="mr-2 h-4 w-4" />
              <span>Configurações</span>
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            <span>Sair</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <SettingsDialog isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </>
  );
}

function NavContent({ isCollapsed }: { isCollapsed: boolean }) {
  const pathname = usePathname();

  const isBoardsActive = pathname.startsWith('/board');

  return (
      <nav className="flex-1 overflow-y-auto px-2 py-4">
        <div className={cn("flex flex-col gap-2", isCollapsed && "items-center")}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.href === '/boards' ? isBoardsActive || pathname === '/boards' : pathname === item.href;
            return (
              <TooltipProvider key={item.label} delayDuration={0}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link
                      href={item.href}
                      className={cn(
                        'group flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all duration-300 ease-in-out hover:text-primary hover:bg-primary/10',
                         isCollapsed ? 'w-12 h-12 justify-center' : 'w-full',
                        isActive && 'bg-primary/20 text-primary font-bold'
                      )}
                    >
                      <Icon className={cn("h-5 w-5 shrink-0 text-muted-foreground transition-all duration-300 ease-in-out group-hover:text-primary", { 'text-primary': isActive })} />
                      <span className={cn("transform transition-all duration-300 ease-in-out group-hover:translate-x-1", isCollapsed && 'sr-only')}>
                        {item.label}
                      </span>
                    </Link>
                  </TooltipTrigger>
                  {isCollapsed && (
                    <TooltipContent side="right">
                      {item.label}
                    </TooltipContent>
                  )}
                </Tooltip>
              </TooltipProvider>
            );
          })}
        </div>
      </nav>
  );
}

export function Sidebar({ isCollapsed, onToggle, hasNotifications }: SidebarProps) {
  const { user } = useUser();
  const pathname = usePathname();

  if (!user || pathname.startsWith('/landing') || pathname === '/') {
    return null;
  }
  
  return (
      <aside className={cn("hidden md:flex md:flex-col border-r bg-card fixed top-0 left-0 h-full z-50 transition-all duration-300 ease-in-out", isCollapsed ? "w-20" : "w-64")}>
        <div className={cn("flex h-16 shrink-0 items-center justify-between border-b px-4", isCollapsed && "px-2 justify-center")}>
          {!isCollapsed ? <Logo /> : <div className="w-9 h-9 bg-primary rounded-lg" />}
        </div>
        <NavContent isCollapsed={isCollapsed} />
        <div className="mt-auto border-t p-4">
           <UserProfile isCollapsed={isCollapsed} hasNotifications={hasNotifications} />
        </div>
         <div className="border-t p-2">
            <Button variant="ghost" className="w-full justify-center" onClick={onToggle}>
                <span className="sr-only">{isCollapsed ? 'Expandir menu' : 'Recolher menu'}</span>
                {isCollapsed ? <PanelRightClose /> : <PanelLeftClose />}
            </Button>
        </div>
      </aside>
  );
}
