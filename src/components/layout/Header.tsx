import type { FC, ReactNode } from 'react';

interface HeaderProps {
  title: string;
  children?: ReactNode;
}

export const Header: FC<HeaderProps> = ({ title, children }) => {
  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
      <h1 className="text-3xl font-bold font-headline text-foreground truncate">
        {title}
      </h1>
      <div className="shrink-0">{children}</div>
    </div>
  );
};
