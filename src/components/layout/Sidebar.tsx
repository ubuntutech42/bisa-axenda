"use client";

import { useState } from 'react';
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
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { Logo } from './Logo';
import { PomodoroDialog } from '@/components/pomodoro/PomodoroDialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const navItems = [
  { href: '/', label: 'Painel', icon: Home },
  { href: '/board', label: 'Quadro', icon: LayoutGrid },
  { href: '/calendar', label: 'Calendário', icon: CalendarDays },
  { href: '/reports', label: 'Relatórios', icon: BarChart3 },
];

function UserProfile() {
  const { user, isUserLoading } = useUser();
  const auth = useAuth();

  const handleLogout = async () => {
    await signOut(auth);
  };

  if (isUserLoading) {
    return <Loader className="h-6 w-6 animate-spin" />;
  }

  if (!user) {
    return null;
  }

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
  const [pomodoroOpen, setPomodoroOpen] = useState(false);

  return (
    <>
      <div className="flex-1 overflow-y-auto">
        <nav className="flex flex-col gap-2 px-4">
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
                <Icon className="h-5 w-5 text-muted-foreground transition-all duration-300 ease-in-out group-hover:text-primary" />
                <span className="transform transition-transform duration-300 ease-in-out group-hover:translate-x-1">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
      <div className="mt-auto p-4 space-y-4">
        <Button
          onClick={() => setPomodoroOpen(true)}
          className="w-full justify-start gap-3"
          variant="outline"
        >
          <Timer className="h-5 w-5" />
          <span>Timer de Foco</span>
        </Button>
      </div>
      <PomodoroDialog open={pomodoroOpen} onOpenChange={setPomodoroOpen} />
    </>
  );
}

export function Sidebar() {
  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex md:flex-col md:w-64 border-r bg-card">
        <div className="flex h-16 items-center justify-between border-b px-6">
          <Logo />
          <UserProfile />
        </div>
        <NavContent />
      </aside>

      {/* Mobile Sidebar */}
      <header className="flex h-16 items-center gap-4 border-b bg-card px-4 md:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button size="icon" variant="outline">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Alternar menu de navegação</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="flex flex-col p-0 w-64">
            <div className="flex h-16 items-center justify-between border-b px-6">
              <Logo />
            </div>
            <NavContent />
          </SheetContent>
        </Sheet>
        <div className="flex-1">
           <Logo />
        </div>
        <UserProfile />
      </header>
    </>
  );
}
