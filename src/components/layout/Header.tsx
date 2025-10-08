import type { FC, ReactNode } from 'react';

interface HeaderProps {
  title: string;
  children?: ReactNode;
}

export const Header: FC<HeaderProps> = ({ title, children }) => {
  return (
    <div className="flex items-center justify-between mb-6">
      <h1 className="text-3xl font-bold font-headline text-foreground">
        {title}
      </h1>
      <div>{children}</div>
    </div>
  );
};
