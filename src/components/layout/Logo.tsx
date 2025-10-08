import type { FC } from 'react';

export const Logo: FC = () => {
  return (
    <div className="flex flex-col leading-tight">
      <h1 className="font-headline text-2xl font-bold text-primary">
        Axénda
      </h1>
      <p className="text-xs text-muted-foreground">Sua agenda com axé</p>
    </div>
  );
};
