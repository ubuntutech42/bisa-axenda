"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BarChart3,
  CalendarDays,
  Home,
  LayoutGrid,
  Loader,
  LogOut,
  Menu,
  Timer,
} from 'lucide-react';
import { signOut } from 'firebase/auth';
import { useAuth, useUser } from '@/firebase';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
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
} from '@/components/ui/dropdown-menu';
import { useState, useEffect } from 'react';
import { FloatingPomodoro } from '@/components/pomodoro/FloatingPomodoro';

const navItems = [
  { href: '/', label: 'Painel', icon: Home },
  { href: '/board', label: 'Quadro', icon: LayoutGrid },
  { href: '/calendar', label: 'Calendário', icon: CalendarDays },
  { href: '/pomodoro', label: 'Pomodoro', icon: Timer },
  { href: '/reports', label: 'Relatórios', icon: BarChart3 },
];

function UserProfile() {
  const { user, isUserLoading } = useUser();
  const auth = useAuth();


  if (isUserLoading) {
    return <Loader className="h-6 w-6 animate-spin" />;
  }

  if (!user) {
    return null;
  }
  
  const handleLogout = async () => {
    await signOut(auth);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
          <Avatar className="h-10 w-10">
            <AvatarImage src={user.photoURL || ''} alt={user.displayName || 'User'} />
            <AvatarFallback>{user.displayName?.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
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
        <DropdownMenuItem onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Sair</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function NavContent() {
  const pathname = usePathname();
  const [isPomodoroOpen, setIsPomodoroOpen] = useState(false);
  const auth = useAuth();

  const handleLogout = async () => {
    await signOut(auth);
  };


  return (
    <>
      <nav className="flex-1 overflow-y-auto px-4 py-4">
        <div className="flex flex-col gap-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.label}
                href={item.href}
                className={cn(
                  'group flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all duration-300 ease-in-out hover:text-primary hover:bg-accent/50',
                  pathname === item.href && 'bg-accent/80 text-primary font-bold'
                )}
              >
                <Icon className={cn("h-5 w-5 text-muted-foreground transition-all duration-300 ease-in-out group-hover:text-primary", { 'text-primary': pathname === item.href })} />
                <span className="transform transition-transform duration-300 ease-in-out group-hover:translate-x-1">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
      <div className="px-4 py-2">
        <Button variant="ghost" className="w-full justify-start" onClick={() => setIsPomodoroOpen(prev => !prev)}>
            <Timer className="mr-3 h-5 w-5" />
            {isPomodoroOpen ? 'Ocultar Timer' : 'Timer Flutuante'}
        </Button>
      </div>
      <div className="mt-auto p-4 border-t border-border">
           <Button variant="ghost" className="w-full justify-start" onClick={handleLogout}>
              <LogOut className="mr-3 h-5 w-5" />
              Sair
          </Button>
      </div>
      {isPomodoroOpen && <FloatingPomodoro onClose={() => setIsPomodoroOpen(false)} />}
    </>
  );
}

export function Sidebar() {
  // Add a state to prevent hydration errors by only rendering on the client
  const [isClient, setIsClient] = useState(false);
  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    // Render a placeholder on the server and during initial client render
    return null;
  }
  
  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex md:flex-col md:w-64 border-r bg-card h-screen">
        <div className="flex h-16 shrink-0 items-center justify-between border-b px-6">
          <Logo />
          <UserProfile />
        </div>
        <NavContent />
      </aside>

      {/* Mobile Sidebar */}
      <header className="flex h-16 items-center gap-4 border-b bg-card px-4 md:hidden sticky top-0 z-40">
        <Sheet>
          <SheetTrigger asChild>
            <Button size="icon" variant="outline">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Alternar menu de navegação</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="flex flex-col p-0 w-64">
            <SheetHeader>
              <SheetTitle className="sr-only">Menu de Navegação</SheetTitle>
              <div className="flex h-16 items-center justify-between border-b px-6">
                  <Logo />
              </div>
            </SheetHeader>
            <NavContent />
          </SheetContent>
        </Sheet>
        <div className="flex-1 text-center">
           <Logo />
        </div>
        <UserProfile />
      </header>
    </>
  );
}
