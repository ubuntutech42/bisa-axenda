"use client";

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BarChart3,
  CalendarDays,
  Home,
  LayoutGrid,
  Menu,
  Timer,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { Logo } from './Logo';
import { PomodoroDialog } from '@/components/pomodoro/PomodoroDialog';

const navItems = [
  { href: '/', label: 'Dashboard', icon: Home },
  { href: '/board', label: 'Board', icon: LayoutGrid },
  { href: '/calendar', label: 'Calendar', icon: CalendarDays },
  { href: '/reports', label: 'Reports', icon: BarChart3 },
];

function NavContent() {
  const pathname = usePathname();
  const [pomodoroOpen, setPomodoroOpen] = useState(false);

  return (
    <>
      <div className="flex-1 overflow-y-auto">
        <nav className="flex flex-col gap-2 px-4">
          {navItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary hover:bg-accent/50',
                pathname === item.href && 'bg-accent/80 text-primary font-bold'
              )}
            >
              <item.icon className="h-5 w-5" />
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
      </div>
      <div className="mt-auto p-4">
        <Button
          onClick={() => setPomodoroOpen(true)}
          className="w-full justify-start gap-3"
        >
          <Timer className="h-5 w-5" />
          <span>Focus Timer</span>
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
        <div className="flex h-16 items-center border-b px-6">
          <Logo />
        </div>
        <NavContent />
      </aside>

      {/* Mobile Sidebar */}
      <header className="flex h-14 items-center gap-4 border-b bg-card px-4 md:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button size="icon" variant="outline">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle navigation menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="flex flex-col p-0 w-64">
            <div className="flex h-16 items-center border-b px-6">
              <Logo />
            </div>
            <NavContent />
          </SheetContent>
        </Sheet>
        <div className="md:hidden">
          <Logo />
        </div>
      </header>
    </>
  );
}
