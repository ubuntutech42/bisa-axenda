import type { FC, ReactNode } from 'react';

interface HeaderProps {
  title: string;
  children?: ReactNode;
}

export const Header: FC<HeaderProps> = ({ title, children }) => {
  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
      <h1 className="text-2xl sm:text-3xl font-bold font-headline text-foreground truncate">
        {title}
      </h1>
      {children && (
        <div className="shrink-0 flex items-center gap-2 justify-end">
          {children}
        </div>
      )}
    </div>
  );
};
