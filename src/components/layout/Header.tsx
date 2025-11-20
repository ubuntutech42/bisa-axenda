import type { FC, ReactNode } from 'react';

interface HeaderProps {
  children?: ReactNode;
}

export const Header: FC<HeaderProps> = ({ children }) => {
  return (
    <div className="flex flex-row items-center justify-between gap-4 mb-6">
      {children}
    </div>
  );
};
