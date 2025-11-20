import type { FC, ReactNode } from 'react';

interface HeaderProps {
  title: string;
  children?: ReactNode;
  backButton?: ReactNode;
}

export const Header: FC<HeaderProps> = ({ title, children, backButton }) => {
  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
      <div className="flex items-center gap-4">
        {backButton}
        <h1 className="text-2xl sm:text-3xl font-bold font-headline text-foreground truncate">
          {title}
        </h1>
      </div>
      {children && (
        <div className="shrink-0 flex items-center gap-2 justify-end">
          {children}
        </div>
      )}
    </div>
  );
};
