
'use client';

import { useMemo } from 'react';
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
  Bell,
  PanelLeftClose,
  PanelRightClose
} from 'lucide-react';
import { signOut } from 'firebase/auth';
import { useAuth, useUser, useFirestore, useCollection, useDoc, useMemoFirebase } from '@/firebase';
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
import { usePomodoro } from '@/context/PomodoroContext';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetTrigger } from '@/components/ui/sheet';
import type { Notification as NotificationType, User as UserType } from '@/lib/types';
import { collection, query, orderBy, limit, where, doc } from 'firebase/firestore';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const navItems = [
  { href: '/dashboard', label: 'Painel', icon: Home },
  { href: '/boards', label: 'Quadros', icon: LayoutGrid },
  { href: '/calendar', label: 'Calendário', icon: CalendarDays },
  { href: '/pomodoro', label: 'Pomodoro', icon: Timer },
  { href: '/reports', label: 'Relatórios', icon: BarChart3 },
  { href: '/settings', label: 'Configurações', icon: Settings },
];

interface SidebarProps {
  isCollapsed: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
}

export function UserProfileButton() {
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const firestore = useFirestore();
  const { isFloatingPomodoroOpen, setIsFloatingPomodoroOpen } = usePomodoro();

  const userDocRef = useMemoFirebase(() => user ? doc(firestore, 'users', user.uid) : null, [user, firestore]);
  const { data: userProfile } = useDoc<UserType>(userDocRef);

  const notificationsQuery = useMemoFirebase(
    () => {
        if (!firestore || !userProfile?.createdAt) return null;
        return query(
            collection(firestore, 'notifications'), 
            where('createdAt', '>=', userProfile.createdAt),
            orderBy('createdAt', 'desc'), 
            limit(20)
        );
    },
    [firestore, userProfile]
  );
  const { data: notifications, isLoading } = useCollection<NotificationType>(notificationsQuery);
  const visibleNotifications = useMemo(
    () => {
      const now = new Date();
      return (notifications ?? []).filter(
        (n) => !n.visibleAt || n.visibleAt.toDate() <= now
      );
    },
    [notifications]
  );
  const notificationCount = visibleNotifications.length;

  if (isUserLoading || !user) {
    return <div className="h-9 w-9 rounded-full bg-muted animate-pulse" />;
  }
  
  const handleLogout = async () => {
    await signOut(auth);
  };

  return (
    <Sheet>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-9 w-9 rounded-full">
              <Avatar className="h-9 w-9">
                <AvatarImage src={user.photoURL || ''} alt={user.displayName || 'User'} />
                <AvatarFallback>{user.displayName?.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
              {notificationCount > 0 && (
                <span className="absolute top-0 right-0 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-xs font-bold text-destructive-foreground border-2 border-card">
                  {notificationCount}
                </span>
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
             <SheetTrigger asChild>
                <DropdownMenuItem>
                    <Bell className="mr-2 h-4 w-4" />
                    <span>Notificações</span>
                    {notificationCount > 0 && <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-xs font-medium text-destructive-foreground">{notificationCount}</span>}
                </DropdownMenuItem>
              </SheetTrigger>
            <DropdownMenuItem onClick={() => setIsFloatingPomodoroOpen(!isFloatingPomodoroOpen)}>
              <Timer className="mr-2 h-4 w-4" />
              <span>Timer Flutuante</span>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/settings">
                <Settings className="mr-2 h-4 w-4" />
                <span>Configurações</span>
              </Link>
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            <span>Sair</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <SheetContent className="w-full sm:max-w-md" side="right">
          <SheetHeader>
              <SheetTitle>Notificações</SheetTitle>
              <SheetDescription>Seus lembretes e avisos importantes.</SheetDescription>
          </SheetHeader>
          <div className="py-4 space-y-4 -mr-2 pr-2 h-[calc(100%-80px)] overflow-y-auto">
              {isLoading ? (
                  <div className="flex justify-center items-center h-40"><Loader className="animate-spin" /></div>
              ) : visibleNotifications.length > 0 ? (
                  visibleNotifications.map(notification => (
                      <div key={notification.id} className="p-3 rounded-lg bg-muted/50 border">
                          <h4 className="font-semibold">{notification.title}</h4>
                          <p className="text-sm text-muted-foreground mt-1">{notification.message}</p>
                          <p className="text-xs text-muted-foreground/80 mt-2">
                              {formatDistanceToNow(notification.createdAt.toDate(), { addSuffix: true, locale: ptBR })}
                          </p>
                      </div>
                  ))
              ) : (
                  <p className="text-center text-muted-foreground py-10">Nenhuma notificação nova.</p>
              )}
          </div>
      </SheetContent>
    </Sheet>
  );
}


function SidebarHeader({ isCollapsed }: { isCollapsed: boolean }) {
  return (
    <div className={cn("flex h-16 shrink-0 items-center border-b px-3 transition-[padding] duration-300 ease-in-out", isCollapsed && "px-2 justify-center")}>
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <Logo isCollapsed={isCollapsed} />
      </div>
    </div>
  );
}

function NavContent({ isCollapsed }: { isCollapsed: boolean }) {
  const pathname = usePathname();
  const isBoardsActive = pathname.startsWith('/board');

  return (
      <nav className="flex-1 overflow-y-auto px-2 py-4">
        <div className={cn("flex flex-col gap-1", isCollapsed && "items-center")}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.href === '/boards' ? isBoardsActive || pathname === '/boards' : pathname === item.href;
            return (
              <TooltipProvider key={item.label} delayDuration={300}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link
                      href={item.href}
                      className={cn(
                        'group flex items-center gap-3 rounded-lg px-3 py-2.5 text-muted-foreground transition-colors duration-200 ease-out hover:text-primary hover:bg-primary/10',
                        isCollapsed ? 'w-10 h-10 justify-center p-0 mx-auto' : 'w-full',
                        isActive && 'bg-primary/20 text-primary font-medium'
                      )}
                    >
                      <Icon className={cn("h-5 w-5 shrink-0 transition-colors duration-200", { 'text-primary': isActive })} />
                      <span className={cn("whitespace-nowrap overflow-hidden transition-[opacity,width] duration-300 ease-in-out", isCollapsed ? 'sr-only w-0 opacity-0' : 'opacity-100')}>
                        {item.label}
                      </span>
                    </Link>
                  </TooltipTrigger>
                  {isCollapsed && (
                    <TooltipContent side="right" sideOffset={8} className="font-medium">
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

export function Sidebar({ isCollapsed, onCollapsedChange }: SidebarProps) {
  const { user } = useUser();
  const pathname = usePathname();

  if (!user || pathname.startsWith('/landing') || pathname === '/') {
    return null;
  }

  const toggleCollapsed = () => onCollapsedChange?.(!isCollapsed);

  return (
    <aside
      className={cn(
        'hidden md:flex md:flex-col border-r bg-card fixed top-0 left-0 h-full z-50 overflow-hidden',
        'transition-[width] duration-300 ease-in-out',
        isCollapsed ? 'w-[4.5rem]' : 'w-64'
      )}
    >
      <SidebarHeader isCollapsed={isCollapsed} />
      <NavContent isCollapsed={isCollapsed} />
      {onCollapsedChange && (
        <div className="mt-auto shrink-0 border-t p-2">
          <TooltipProvider delayDuration={300}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleCollapsed}
                  className={cn(
                    'w-full transition-colors duration-200',
                    isCollapsed ? 'w-10 h-10 p-0 mx-auto rounded-lg' : 'justify-start gap-2 rounded-lg'
                  )}
                  aria-label={isCollapsed ? 'Expandir menu' : 'Recolher menu'}
                >
                  {isCollapsed ? (
                    <PanelRightClose className="h-5 w-5 shrink-0" />
                  ) : (
                    <>
                      <PanelLeftClose className="h-5 w-5 shrink-0" />
                      <span className="text-sm font-medium">Recolher menu</span>
                    </>
                  )}
                </Button>
              </TooltipTrigger>
              {isCollapsed && (
                <TooltipContent side="right" sideOffset={8}>
                  Expandir menu
                </TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>
        </div>
      )}
    </aside>
  );
}
