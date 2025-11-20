
import type { FC, ReactNode } from 'react';
import { UserProfileButton } from './Sidebar';

interface HeaderProps {
  children?: ReactNode;
  title?: string;
}

export const Header: FC<HeaderProps> = ({ children, title }) => {
  if (children) {
     return (
        <div className="flex flex-row items-center justify-between gap-4 mb-6">
            {children}
        </div>
     )
  }
  return (
    <div className="flex flex-row items-center justify-between gap-4 mb-6">
        <h1 className="text-3xl font-bold font-headline">{title}</h1>
        <UserProfileButton />
    </div>
  );
};
