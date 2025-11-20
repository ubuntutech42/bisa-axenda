
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
  onToggle: () => void;
}

export function UserProfileButton() {
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const firestore = useFirestore();
  const { setIsFloatingPomodoroOpen } = usePomodoro();

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
  const notificationCount = notifications?.length || 0;

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
            <DropdownMenuItem onClick={() => setIsFloatingPomodoroOpen(prev => !prev)}>
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
              ) : notifications && notifications.length > 0 ? (
                  notifications.map(notification => (
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


function SidebarHeader({ isCollapsed, onToggle }: { isCollapsed: boolean, onToggle: () => void }) {
    return (
        <div className={cn("flex h-16 shrink-0 items-center border-b px-4")}>
            <div className='flex items-center gap-2 flex-1'>
              <Logo isCollapsed={isCollapsed} />
            </div>
             <Button variant="ghost" size="icon" onClick={onToggle} className="h-8 w-8">
                {isCollapsed ? <PanelRightClose /> : <PanelLeftClose />}
                <span className="sr-only">{isCollapsed ? 'Expandir' : 'Recolher'}</span>
            </Button>
        </div>
    )
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
                      <span className={cn("transform transition-all duration-300 ease-in-out", isCollapsed && 'sr-only')}>
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

export function Sidebar({ isCollapsed, onToggle }: SidebarProps) {
  const { user } = useUser();
  const pathname = usePathname();

  if (!user || pathname.startsWith('/landing') || pathname === '/') {
    return null;
  }
  
  return (
      <aside className={cn("hidden md:flex md:flex-col border-r bg-card fixed top-0 left-0 h-full z-50 transition-all duration-300 ease-in-out", isCollapsed ? "w-20" : "w-64")}>
        <SidebarHeader isCollapsed={isCollapsed} onToggle={onToggle} />
        <NavContent isCollapsed={isCollapsed} />
      </aside>
  );
}
