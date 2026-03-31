import { cn } from '@/lib/utils';
import type { FC } from 'react';

interface LogoProps {
  isCollapsed?: boolean;
}

export const Logo: FC<LogoProps> = ({ isCollapsed = false }) => {
  if (isCollapsed) {
    return (
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/15 font-headline text-lg font-bold text-primary">
        A
      </div>
    );
  }
  return (
    <div className="flex flex-col leading-tight min-w-0">
      <h1 className="font-headline text-2xl font-bold text-primary truncate">
        Axénda
      </h1>
      <p className="text-xs text-muted-foreground">Sua agenda afrocentrada!</p>
    </div>
  );
};
