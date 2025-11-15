
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BarChart3,
  CalendarDays,
  Home,
  LayoutGrid,
  Timer,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUser } from '@/firebase';

const navItems = [
  { href: '/dashboard', label: 'Painel', icon: Home },
  { href: '/board', label: 'Quadro', icon: LayoutGrid },
  { href: '/calendar', label: 'Calendário', icon: CalendarDays },
  { href: '/pomodoro', label: 'Pomodoro', icon: Timer },
  { href: '/reports', label: 'Relatórios', icon: BarChart3 },
];

export function BottomNav() {
  const pathname = usePathname();
  const { user } = useUser();

  if (!user) {
    return null;
  }

  // Hide nav on login/register pages
  if (pathname === '/login' || pathname === '/register') {
    return null;
  }

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border shadow-t-lg z-40 pb-[env(safe-area-inset-bottom)]">
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.label}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center w-full h-full text-muted-foreground transition-colors duration-200 ease-in-out',
                isActive ? 'text-primary' : 'hover:text-primary'
              )}
            >
              <Icon className="h-6 w-6" />
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
