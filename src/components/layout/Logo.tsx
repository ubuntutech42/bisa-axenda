import { cn } from '@/lib/utils';
import type { FC } from 'react';

interface LogoProps {
  isCollapsed?: boolean;
}

export const Logo: FC<LogoProps> = ({ isCollapsed = false }) => {
  return (
    <div className="flex flex-col leading-tight">
      <h1 className="font-headline text-2xl font-bold text-primary">
        Axénda
      </h1>
      <p className={cn("text-xs text-muted-foreground transition-opacity duration-300", isCollapsed && "opacity-0 h-0")}>Sua agenda afrocentrada!</p>
    </div>
  );
};
